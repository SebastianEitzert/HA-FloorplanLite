/*
 * Floorplan Lite card – floor plans for Home Assistant dashboards, light on CPU and GPU.
 *
 * The plan (buildings, levels, rooms, walls, openings, background image) comes from the Floorplan Lite integration
 * (WebSocket floorplan_lite/subscribe) and is drawn in the editor (sidebar → Floorplan Lite). Look and behaviour come
 * from the "Kreßbach Grundriss" card v6.10:
 *   Light     The room fills softly in the light colour (colour temperature or RGB), brightness = strength.
 *             The light shines slightly through the walls into neighbouring rooms and outside.
 *             Coloured LEDs next to white light glow as a seam along the walls.
 *   Presence  calmly breathing dot (blue-violet)
 *   Motion    aqua dot with ripples up to the walls
 *   Window open / shade closed / music: small chips under the temperature (music as an equaliser).
 * The frame is built once, afterwards only colours and classes change – transitions stay soft, animations do not
 * restart on every state change. The card is always dark: light can only look brighter on a dark ground, and the TV
 * does not dazzle in the evening.
 *
 * Configuration (dashboard):
 *   type: custom:floorplan-lite-card
 *   plan: home                    # plan id from the editor
 *   floors: [eg, og, dg]          # optional: levels to show (default: all)
 *   mode: swipe                   # optional: one level large, swipe / tabs / arrows; default: all side by side
 *   start: eg                     # optional: first level in swipe mode
 *   intro: false                  # optional: no build-up animation on load
 *   background: false             # optional: hide the background images of all levels
 *   align: true                   # optional: all levels in one frame, so upper levels stay above the ones below
 *                                 #   (default: the plan's setting align_levels)
 *   hide_label: [no_dboard]       # optional: ignore entities with one of these labels (default: the plan's setting)
 *   tap: none                     # optional: no pop-up on tap
 *   rooms: {kuche: {licht: [...]}}  # optional: entities per room, override the ones stored with the plan
 * Tapping a room opens the Bubble Card pop-up with the hash #<room>.
 *   script: script.raum_klick     # optional: the script that gets every key, click and wheel step over a room
 *   scroll_keys: true             # optional: ↑/↓ scroll the page (default: they don't – the wheel does)
 * Tapping a room (left click) opens the pop-up, ←/→ change the level. Everything else over a room goes to the script
 * as {raum: <room id>, aktion: …} and the script decides what it does:
 *   hoch / runter (↑/↓), lauter / leiser (mouse wheel), gelb (right click or yellow), play / pause / play_pause /
 *   stop / weiter / zurueck (media keys), blau / gruen / rot (colour keys), tipp2 / tipp3 (touch: double / triple tap).
 * Keys the script has an action „twice“ for (hoch2, gelb2, play2 …) wait for a second press; the script says which
 * ones and how long (aktion: config), all others go out at once.
 * Without the script play / pause go straight to the room's media players. After an event the room's label shows the
 * volume (louder / quieter / play) or the name of the scene that was switched for 3 s instead of the temperature.
 * Deliberately without ??, ?., aspect-ratio, clamp()/min(), inset, flex-gap and class fields: the browser of older
 * LG TVs (webOS 5) is about Chrome 68.
 */

const WALL = 0.2, OUTER = 0.5;

/* ---------- Geometry helpers ---------- */
const centroid = (p) => {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < p.length; i++) {
    const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length];
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a *= 0.5;
  return Math.abs(a) < 1e-6 ? p[0] : [cx / (6 * a), cy / (6 * a)];
};
const pts = (p) => p.map(([x, y]) => `${x},${y}`).join(" ");
const bbox = (p) => {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  p.forEach(([x, y]) => { if (x < x1) x1 = x; if (y < y1) y1 = y; if (x > x2) x2 = x; if (y > y2) y2 = y; });
  return [x1, y1, x2, y2];
};
const perimeter = (p) => p.reduce((s, q, i) => {
  const r = p[(i + 1) % p.length], dx = r[0] - q[0], dy = r[1] - q[1];
  return s + Math.sqrt(dx * dx + dy * dy);
}, 0);
const pc = (v) => (v * 100).toFixed(3) + "%";
const area2 = (p) => p.reduce((s, q, i) => { const r = p[(i + 1) % p.length]; return s + q[0] * r[1] - r[0] * q[1]; }, 0);
const grow = (p, d) => {  // move a polygon outwards by d (mitred)
  const sg = area2(p) > 0 ? 1 : -1, n = p.length;
  const off = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy); return [sg * dy / l, -sg * dx / l]; };
  return p.map((q, i) => {
    const a = p[(i - 1 + n) % n], b = p[(i + 1) % n];
    const n1 = off(a, q), n2 = off(q, b), mx = n1[0] + n2[0], my = n1[1] + n2[1];
    const k = d / Math.max(0.2, (mx * n1[0] + my * n1[1]));
    return [+(q[0] + mx * k).toFixed(3), +(q[1] + my * k).toFixed(3)];
  });
};
const inside = (pt, poly) => {  // point in polygon (even-odd)
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};
const rotator = (deg) => {
  if (!deg) return (p) => p;
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  return (p) => [+(p[0] * c - p[1] * s).toFixed(3), +(p[0] * s + p[1] * c).toFixed(3)];
};
/* Rectangle of an opening: `width` along the wall, `depth` across it, centred on `at`. */
const openingRect = (o) => {
  const r = (o.angle || 0) * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r);
  const w = (o.width || 0.9) / 2, d = (o.depth || 0.24) / 2, x = o.at[0], y = o.at[1];
  const P = (a, b) => [+(x + dx * a - dy * b).toFixed(3), +(y + dy * a + dx * b).toFixed(3)];
  return [P(-w, -d), P(w, -d), P(w, d), P(-w, d)];
};

/* ---------- Light colours ---------- */
const WARM = [255, 208, 152];  // lights without colour information (Loxone dimmers, switched circuits)
const KELVIN = [[1800, [255, 166, 90]], [2200, [255, 186, 115]], [2700, [255, 205, 145]], [3000, [255, 215, 166]],
  [3500, [255, 227, 192]], [4000, [255, 237, 214]], [5000, [248, 244, 240]], [6500, [228, 236, 255]]];
const warmWhite = (rgb) => {  // a white light reported as RGB (e.g. warm white from an RGBW controller)
  const mx = Math.max(rgb[0], rgb[1], rgb[2]) || 1, n = rgb.map((v) => v * 255 / mx);
  return KELVIN.some((e) => Math.max(Math.abs(n[0] - e[1][0]), Math.abs(n[1] - e[1][1]), Math.abs(n[2] - e[1][2])) < 30);
};
const kelvinRgb = (k) => {
  if (k <= KELVIN[0][0]) return KELVIN[0][1];
  for (let i = 1; i < KELVIN.length; i++) {
    const a = KELVIN[i - 1], b = KELVIN[i];
    if (k <= b[0]) { const t = (k - a[0]) / (b[0] - a[0]); return a[1].map((v, j) => Math.round(v + (b[1][j] - v) * t)); }
  }
  return KELVIN[KELVIN.length - 1][1];
};
const WHITE_MODES = ["color_temp", "brightness", "onoff", "white"];
const hexRgb = (h) => (typeof h === "string" && /^#[0-9a-f]{6}$/i.test(h) ? [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16)) : null);
const colourful = (rgb) => {  // a real colour, not one of the whites
  const mx = Math.max(rgb[0], rgb[1], rgb[2]), mn = Math.min(rgb[0], rgb[1], rgb[2]);
  return mx > 0 && (mx - mn) / mx > 0.3 && !warmWhite(rgb);
};
const mix = (list) => {  // average weighted by brightness
  let r = 0, g = 0, b = 0, w = 0, top = 0;
  list.forEach((l) => { r += l.c[0] * l.b; g += l.c[1] * l.b; b += l.c[2] * l.b; w += l.b; if (l.b > top) top = l.b; });
  return { rgb: [Math.round(r / w), Math.round(g / w), Math.round(b / w)].join(","), b: top };
};

const TEXT = {
  de: { tilt: "Fenster gekippt", win: "Fenster offen", shade: "Beschattung zu", music: "Musik läuft", presence: "Präsenz", motion: "Bewegung",
    light: "Licht in seiner Farbe", musicL: "Musik", prev: "Geschoss zurück", next: "Geschoss weiter",
    loading: "Grundriss wird geladen …", missing: "Grundriss „%s“ nicht gefunden – im Editor (Seitenleiste → Floorplan Lite) anlegen.",
    noPlan: "Bitte einen Grundriss wählen (plan: …).",
    cancel: "Abbrechen", details: "Details", unlock: "Aufschließen", lock: "Abschließen", openDoor: "Türöffner", open: "Öffnen",
    close: "Schließen", stop: "Stopp", press: "Auslösen", toggle: "Umschalten",
    site: "Grundstück", allOff: "Alles aus", bOff: "%s aus", really: "Wirklich? Nochmal drücken", offDone: "%n Geräte ausgeschaltet",
    here: "Du bist hier", thisTv: "Dieser Fernseher", thisDevice: "Dieses Gerät", noSite: "Bitte Gebäude für das Grundstück angeben (site.buildings)." },
  en: { tilt: "Window tilted", win: "Window open", shade: "Shade closed", music: "Music playing", presence: "Presence", motion: "Motion",
    light: "Light in its colour", musicL: "Music", prev: "Previous level", next: "Next level",
    loading: "Loading floor plan …", missing: "Floor plan “%s” not found – create it in the editor (sidebar → Floorplan Lite).",
    noPlan: "Please choose a floor plan (plan: …).",
    cancel: "Cancel", details: "Details", unlock: "Unlock", lock: "Lock", openDoor: "Open latch", open: "Open",
    close: "Close", stop: "Stop", press: "Press", toggle: "Toggle",
    site: "Site", allOff: "All off", bOff: "%s off", really: "Sure? Press again", offDone: "%n devices switched off",
    here: "You are here", thisTv: "This TV", thisDevice: "This device", noSite: "Please list the site's buildings (site.buildings)." },
};
const chips = (t) => ({
  w: `<span class="chip win" title="${t.win}"><ha-icon icon="mdi:window-open"></ha-icon></span>`,
  k: `<span class="chip win tilt" title="${t.tilt}"><ha-icon icon="mdi:window-open-variant"></ha-icon></span>`,
  s: `<span class="chip shade" title="${t.shade}"><ha-icon icon="mdi:window-shutter"></ha-icon></span>`,
  m: `<span class="chip music" title="${t.music}"><i></i><i></i><i></i></span>`,
});
/* Window state from a contact, sensor or cover: "open", "tilted" or "". Tilted is read from the state or an attribute
   such as zustand/state (Loxone window monitor: zustand = gekippt, Homematic handle: tilted). */
const TILTED = ["tilted", "tilt", "gekippt", "kipp", "angekippt"];
const winState = (s) => {
  const a = s.attributes || {}, vals = [s.state, a.zustand, a.state, a.status, a.window_state, a.position];
  for (let i = 0; i < vals.length; i++) if (typeof vals[i] === "string" && TILTED.indexOf(vals[i].toLowerCase()) >= 0) return "tilted";
  const v = String(s.state).toLowerCase();
  return v === "on" || v === "open" || v === "offen" || v === "opening" || v === "closing" ? "open" : "";
};
const lockAttr = (s) => {  // lock state reported by a contact (Loxone: schloss = aufgeschlossen/abgeschlossen)
  const a = s.attributes || {}, v = String(a.schloss || a.lock || "").toLowerCase();
  return v === "aufgeschlossen" || v === "unlocked" ? "unlocked" : v === "abgeschlossen" || v === "locked" ? "locked" : "";
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/* Plan from the store → per level everything the drawing needs, rotated and with a view box. */
/* Entities of a Home Assistant area sorted into the room fields – the same rules as the editor's "take entities". */
function areaEntities(hass, areaId, hidden) {
  const reg = hass.entities || {}, dev = hass.devices || {}, st = hass.states || {};
  const out = { licht: [], praesenz: [], bewegung: [], fenster: [], beschattung: [], musik: [] };
  let climate = null, sensor = null;
  Object.keys(reg).sort().forEach((id) => {
    const e = reg[id], s = st[id];
    if (!s || e.hidden || e.entity_category || hidden(id)) return;
    const area = e.area_id || (e.device_id && dev[e.device_id] && dev[e.device_id].area_id);
    if (area !== areaId) return;
    const d = id.split(".")[0], dc = s.attributes.device_class;
    if (d === "light") out.licht.push(id);
    else if (d === "binary_sensor" && (dc === "occupancy" || dc === "presence")) out.praesenz.push(id);
    else if (d === "binary_sensor" && dc === "motion") out.bewegung.push(id);
    else if (d === "binary_sensor" && ["window", "door", "opening", "garage_door"].indexOf(dc) >= 0) out.fenster.push(id);
    else if (d === "cover" && ["garage", "door", "gate", "window"].indexOf(dc) < 0) out.beschattung.push(id);
    else if (d === "media_player" && dc !== "tv") out.musik.push(id);
    else if (d === "climate" && !climate) climate = id;
    else if (d === "sensor" && dc === "temperature" && !sensor) sensor = id;
  });
  if (climate || sensor) out.temp = climate || sensor;
  return out;
}

const CARDS = [];
const DOUBLE = {};  // script → {keys: keys with an action for „twice“, ms: waiting time}
/* Remote keys → aktion for the script: the TV Streamer's names (tv-streamer-key) and the browser's media keys */
const TV_KEYS = { blue: "blau", green: "gruen", red: "rot", yellow: "gelb", play: "play", pause: "pause", stop: "stop",
  next: "weiter", previous: "zurueck" };
const MEDIA_KEYS = { MediaPlay: "play", MediaPause: "pause", MediaPlayPause: "play_pause", MediaStop: "stop",
  MediaTrackNext: "weiter", MediaTrackPrevious: "zurueck" };
/* "Wohnzimmer-Viel Licht" → "Viel Licht": without the room's name (or anything before the first dash) */
const sceneLabel = (name, room) => {
  let n = String(name);
  if (room && n.toLowerCase().indexOf(room.toLowerCase()) === 0) n = n.slice(room.length);
  else if (n.indexOf("-") > 0) n = n.slice(n.indexOf("-") + 1);
  n = n.replace(/^[\s\-\u2013:]+/, "");
  return n || String(name);
};  // floorplan cards on the page – the remote's arrow keys go to one of them

const planLabels = (plan) => ((plan && plan.hide_labels) || []).concat(plan && plan.hide_label ? [plan.hide_label] : []);

function prepare(plan, align, building) {
  const rot = rotator(plan.rotation || 0), st = plan.style || {};
  // building: only the outer walls and rooms of this building of the plan (option building / site.buildings[].building)
  const mine = (x) => !building || !x.building || x.building === building;
  const ow = typeof st.outer_width === "number" && st.outer_width > 0 ? st.outer_width : OUTER;
  // the drawn line of an outer wall may be its outside or inside face; the wall is drawn around its centre line
  const centre = (o) => (o.ref === "outside" ? grow(o.poly, -ow / 2) : o.ref === "inside" ? grow(o.poly, ow / 2) : o.poly);
  const R = (poly) => poly.map(rot);
  const floors = {};
  (plan.levels || []).forEach((lv) => {
    const at = (x) => x.level === lv.id && mine(x);
    const outlines = (plan.outlines || []).filter(at).map((o) => R(centre(o)));
    const extra = (plan.lines || []).filter(at).map((l) => ({ poly: R(l.poly), open: !!l.open }));
    const walls = (plan.walls || []).filter(at).map((w) => ({ poly: R(w.poly), width: w.width, closed: !!w.closed }));
    const rooms = (plan.rooms || []).filter(at).map((r) => ({
      id: r.id, key: r.key, name: r.name === undefined ? r.id : r.name, poly: R(r.poly),
      labelAt: r.label_at ? rot(r.label_at) : null, small: !!r.small, outdoor: !!r.outdoor, color: r.color, area: r.area,
    }));
    const openings = (plan.openings || []).filter(at).map((o) => {
      const q = Object.assign({}, o, { at: rot(o.at), angle: (o.angle || 0) + (plan.rotation || 0) });
      q.ents = (o.entities || []).concat(o.entity && (o.entities || []).indexOf(o.entity) < 0 ? [o.entity] : []);
      q.rect = openingRect(q);
      if (q.shade) {  // the shade hangs on the outside: the side of the wall that is in no room (else the +normal side)
        const r = q.angle * Math.PI / 180, d = (q.depth || 0.24) / 2 + 0.25;
        const probe = (k) => [q.at[0] - Math.sin(r) * d * k, q.at[1] + Math.cos(r) * d * k];
        const inRoom = (p) => rooms.some((rm) => !rm.outdoor && inside(p, rm.poly));
        q.out = inRoom(probe(1)) && !inRoom(probe(-1)) ? -1 : 1;
      }
      return q;
    });
    let view = lv.view && !plan.rotation ? lv.view : null;
    if (!view) {
      const all = [];
      outlines.forEach((p) => p.forEach((q) => all.push(q)));
      rooms.forEach((r) => r.poly.forEach((q) => all.push(q)));
      extra.forEach((e) => e.poly.forEach((q) => all.push(q)));
      walls.forEach((w) => w.poly.forEach((q) => all.push(q)));
      const [x1, y1, x2, y2] = all.length ? bbox(all) : [0, 0, 10, 10];
      view = [x1 - 0.6, y1 - 0.6, x2 - x1 + 1.2, y2 - y1 + 1.2];
    }
    floors[lv.id] = { title: lv.name, short: lv.short || lv.id.toUpperCase(), view, outlines, extra, walls, rooms, openings, roomWalls: plan.room_walls !== false,
      background: lv.background || null, bgRot: plan.rotation || 0, north: (plan.north || 0) + (plan.rotation || 0) };
  });
  if (align) {  // all levels in one frame: each level at its real position, an attic stays above the house when swiping
    const ks = Object.keys(floors);
    if (ks.length > 1) {
      let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
      ks.forEach((k) => { const v = floors[k].view; x1 = Math.min(x1, v[0]); y1 = Math.min(y1, v[1]); x2 = Math.max(x2, v[0] + v[2]); y2 = Math.max(y2, v[1] + v[3]); });
      ks.forEach((k) => { floors[k].view = [x1, y1, x2 - x1, y2 - y1]; });
    }
  }
  return floors;
}

/* ---------- Site: several plans (buildings) on one property ---------- */
const clipRect = (poly, r) => {  // Sutherland–Hodgman: the part of a polygon inside the rectangle [x1, y1, x2, y2]
  let out = poly;
  [[0, r[0], 1], [0, r[2], -1], [1, r[1], 1], [1, r[3], -1]].forEach((e) => {
    const ax = e[0], v = e[1], sg = e[2], src = out;
    const inn = (p) => (p[ax] - v) * sg >= 0;
    const cut = (a, b) => { const t = (v - a[ax]) / (b[ax] - a[ax]); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
    out = [];
    src.forEach((cur, i) => {
      const prev = src[(i + src.length - 1) % src.length];
      if (inn(cur)) { if (!inn(prev)) out.push(cut(prev, cur)); out.push(cur); } else if (inn(prev)) out.push(cut(prev, cur));
    });
  });
  return out.map((p) => [+p[0].toFixed(3), +p[1].toFixed(3)]);
};
/* A pop-up (Bubble Card) is open: the address ends in #name. #plan=…&floor=… is the card's own view, no pop-up. */
const popupOpen = () => location.hash.length > 1 && location.hash.indexOf("=") < 0;
const listOf = (x) => (Array.isArray(x) ? x : x ? [x] : []);
const ENT_KEYS = ["licht", "hauptlicht", "praesenz", "bewegung", "temp", "fenster", "beschattung", "musik", "lichtfarbe"];

/* Building plan coordinates → site coordinates: turned by rotation, scaled, its frame's upper left corner at (x, y). */
const placer = (b, origin) => {
  const r = (b.rotation || 0) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), k = b.scale > 0 ? b.scale : 1;
  const f = (p) => {
    const x = (p[0] - origin[0]) * k, y = (p[1] - origin[1]) * k;
    return [+(b.x + x * c - y * s).toFixed(3), +(b.y + x * s + y * c).toFixed(3)];
  };
  f.inv = (q) => {
    const x = q[0] - b.x, y = q[1] - b.y;
    return [+((x * c + y * s) / k + origin[0]).toFixed(3), +((-x * s + y * c) / k + origin[1]).toFixed(3)];
  };
  f.deg = b.rotation || 0; f.k = k;
  return f;
};

/* Floors for a site: "site" (every building's site_floor where it stands, plus the shared areas outside) and
   "<plan>:<level>" per building level (with the parts of the shared areas next to it). Room keys get the plan as prefix
   ("<plan>/<room>", areas "site/<id>"), so the same room id in two plans keeps its own entities. */
function buildSite(site, plans, cfg) {
  const out = { floors: {}, order: [], blds: [], rooms: {}, live: {}, labels: [], info: {} };
  const rand = typeof cfg.nachbar_rand === "number" && cfg.nachbar_rand >= 0 ? cfg.nachbar_rand : 0.15;
  const show = listOf(site.show);
  const list = (site.buildings || []).filter((b) => b && plans[b.plan] && (!show.length || show.indexOf(b.plan) >= 0));
  const prepared = list.map((b) => {
    const plan = plans[b.plan];
    const fl = prepare(plan, cfg.align === undefined ? !!plan.align_levels : !!cfg.align, b.building);
    const levels = (plan.levels || []).map((l) => l.id).filter((id) => fl[id]);
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    levels.forEach((id) => { const v = fl[id].view; x1 = Math.min(x1, v[0]); y1 = Math.min(y1, v[1]); x2 = Math.max(x2, v[0] + v[2]); y2 = Math.max(y2, v[1] + v[3]); });
    if (!levels.length) { x1 = 0; y1 = 0; x2 = 10; y2 = 10; }
    return { b: b, plan: plan, fl: fl, levels: levels, origin: [x1, y1], w: x2 - x1, h: y2 - y1 };
  });
  // buildings without a position: side by side to the right, gap ≥ 10 % of the widest, never overlapping
  const gap = Math.max(1, 0.1 * Math.max.apply(null, prepared.map((p) => p.w * (p.b.scale > 0 ? p.b.scale : 1)).concat([0])));
  let right = -Infinity;
  const pos = prepared.map((p) => {
    const b = Object.assign({}, p.b);
    if (typeof b.x === "number" && typeof b.y === "number") {
      const T = placer(b, p.origin);
      [[0, 0], [p.w, 0], [0, p.h], [p.w, p.h]].forEach((d) => { right = Math.max(right, T([p.origin[0] + d[0], p.origin[1] + d[1]])[0]); });
    }
    return b;
  });
  let cursor = right === -Infinity ? 0 : right + gap;
  prepared.forEach((p, i) => {
    const b = pos[i];
    if (typeof b.x !== "number" || typeof b.y !== "number") { b.x = +cursor.toFixed(2); b.y = 0; cursor += p.w * (b.scale > 0 ? b.scale : 1) + gap; }
    p.pos = b; p.T = placer(b, p.origin);
  });
  const areas = (site.areas || []).filter((a) => a && a.id && Array.isArray(a.poly) && a.poly.length > 2);
  areas.forEach((a) => {
    const e = {};
    ENT_KEYS.forEach((k) => { if (a[k] !== undefined) e[k] = a[k]; });
    out.rooms["site/" + a.id] = e;
    if (a.area_live || a.live) out.live["site/" + a.id] = a.area || a.id;
  });
  const areaRoom = (a, poly) => ({ id: a.id, key: "site/" + a.id, name: a.name || a.id, poly: poly, labelAt: null, small: false,
    outdoor: true, color: a.color, area: a.area || a.id, site: true });
  const single = prepared.length === 1 && show.length === 1;
  // site floor
  const sf = { title: cfg.site_title || "", short: "", outlines: [], extra: [], walls: [], rooms: [], openings: [], roomWalls: true,
    background: null, site: true, bldShapes: [], style: null };
  prepared.forEach((p) => {
    const plan = p.plan, pid = p.b.plan, T = p.T;
    planLabels(plan).forEach((l) => { if (out.labels.indexOf(l) < 0) out.labels.push(l); });
    Object.keys(plan.entities || {}).forEach((k) => { out.rooms[pid + "/" + k] = plan.entities[k]; });
    (plan.rooms || []).forEach((r) => { if (r.area && r.area_live) out.live[pid + "/" + (r.key || r.id)] = r.area; });
    p.levels.forEach((lv) => p.fl[lv].rooms.forEach((r) => { r.key = pid + "/" + (r.key || r.id); r.bld = pid; }));
    const keys = p.levels.map((lv) => pid + ":" + lv);
    // north in this building's coordinates; ausrichtung: norden turns its views so north is up
    const nb = (site.north || 0) - (p.pos.rotation || 0);
    const up = (cfg.ausrichtung || site.ausrichtung) === "norden" && Math.abs(nb) > 0.01;
    const bf = up ? prepare(Object.assign({}, plan, { rotation: (plan.rotation || 0) - nb }), cfg.align === undefined ? !!plan.align_levels : !!cfg.align, p.b.building) : p.fl;
    const toB = up ? rotator(-nb) : (q) => q;
    if (up) p.levels.forEach((lv) => bf[lv] && bf[lv].rooms.forEach((r) => { r.key = pid + "/" + (r.key || r.id); r.bld = pid; }));
    const siteLv = p.fl[p.b.site_floor] ? p.b.site_floor : p.levels[0];
    const name = p.b.name || plan.name || pid;
    // building views, with the parts of the shared areas around it
    let big = null;
    const near = [];
    if (areas.length && p.levels.length) {
      const v = bf[p.levels[0]].view;
      let vx1 = Infinity, vy1 = Infinity, vx2 = -Infinity, vy2 = -Infinity;
      p.levels.forEach((lv) => { const q = bf[lv].view; vx1 = Math.min(vx1, q[0]); vy1 = Math.min(vy1, q[1]); vx2 = Math.max(vx2, q[0] + q[2]); vy2 = Math.max(vy2, q[1] + q[3]); });
      void v;
      const w = vx2 - vx1, h = vy2 - vy1;
      const box = [vx1 - w * rand, vy1 - h * rand, vx2 + w * rand, vy2 + h * rand];
      areas.forEach((a) => {
        const poly = clipRect(a.poly.map((q) => toB(T.inv(q))), box);
        if (poly.length > 2 && Math.abs(area2(poly)) > 0.1) near.push(areaRoom(a, poly));
      });
      if (near.length) big = [box[0], box[1], box[2] - box[0], box[3] - box[1]];
    }
    p.levels.forEach((lv, i) => {
      const f = bf[lv];
      f.rooms = f.rooms.concat(near.map((r) => Object.assign({}, r)));
      if (big) f.view = big.slice();
      f.style = plan.style || {}; f.bgRot = (plan.rotation || 0) - (up ? nb : 0); f.bld = pid; f.north = up ? 0 : nb;
      out.floors[keys[i]] = f;
      f.rooms.forEach((r) => {
        if (!r.name) return;
        if (!out.info[r.id] || (out.info[r.id].site && !r.site)) out.info[r.id] = { id: r.id, area: r.area, name: r.name, view: keys[i], bld: r.site ? null : pid, site: !!r.site };
      });
    });
    // this building on the site
    const g = p.fl[siteLv];
    if (g) {
      const k = T.k;
      g.outlines.forEach((o) => { const q = o.map(T); sf.outlines.push(q); sf.bldShapes.push({ bld: pid, poly: q }); });
      g.extra.forEach((e) => sf.extra.push({ poly: e.poly.map(T), open: e.open }));
      g.walls.forEach((w) => sf.walls.push({ poly: w.poly.map(T), width: w.width ? w.width * k : w.width, closed: w.closed }));
      g.rooms.forEach((r) => { if (!r.site) sf.rooms.push(Object.assign({}, r, { poly: r.poly.map(T), labelAt: r.labelAt ? T(r.labelAt) : null, nolabel: true })); });
      g.openings.forEach((o) => {
        const q = Object.assign({}, o, { at: T(o.at), angle: (o.angle || 0) + T.deg, width: (o.width || 0.9) * k, depth: (o.depth || 0.24) * k });
        q.rect = openingRect(q);
        sf.openings.push(q);
      });
      if (!sf.style) {
        const st = Object.assign({}, plan.style || {});
        if (typeof st.outer_width === "number") st.outer_width *= k;
        if (typeof st.wall_width === "number") st.wall_width *= k;
        sf.style = st;
      }
    }
    const corners = [];
    [[0, 0], [p.w, 0], [0, p.h], [p.w, p.h]].forEach((d) => corners.push(T([p.origin[0] + d[0], p.origin[1] + d[1]])));
    let lab = Array.isArray(p.b.label_at) ? p.b.label_at : null;
    if (!lab && g && g.outlines.length) {  // default: the middle of its biggest outline
      const big2 = g.outlines.map((o) => o.map(T)).sort((a, b) => Math.abs(area2(b)) - Math.abs(area2(a)))[0];
      lab = centroid(big2);
    }
    out.blds.push({ id: pid, name: name, label: lab, levels: keys, siteLevel: pid + ":" + siteLv, box: bbox(corners), pos: p.pos, origin: p.origin, T: T,
      titles: p.levels.map((lv) => ({ key: pid + ":" + lv, name: p.fl[lv].title, short: p.fl[lv].short })) });
  });
  areas.forEach((a) => { sf.rooms.push(areaRoom(a, a.poly)); if (!out.info[a.id]) out.info[a.id] = { id: a.id, area: a.area || a.id, name: a.name || a.id, view: "site", site: true }; });
  if (!single) {
    const all = [];
    sf.outlines.forEach((o) => o.forEach((q) => all.push(q)));
    sf.rooms.forEach((r) => r.poly.forEach((q) => all.push(q)));
    const bg = site.site_background;
    if (bg && bg.image) {
      sf.background = { image: bg.image, x: bg.x || 0, y: bg.y || 0, width: bg.width || 50, height: bg.height, rotation: bg.rotation || 0,
        opacity: bg.opacity === undefined ? 1 : bg.opacity, mode: bg.mode || "under" };
      if (!all.length) all.push([sf.background.x, sf.background.y]);  // the view follows buildings and areas, the image is cut off
    }
    if (site.raster) sf.raster = true;
    const bb = all.length ? bbox(all) : [0, 0, 20, 20];
    sf.view = [bb[0] - 1.5, bb[1] - 1.5, bb[2] - bb[0] + 3, bb[3] - bb[1] + 3];
    sf.style = sf.style || {}; sf.bgRot = 0; sf.north = site.north || 0;
    out.floors.site = sf;
    out.order.push("site");
    out.info.__site = { view: "site" };
  }
  out.blds.forEach((b) => b.levels.forEach((k) => out.order.push(k)));
  out.single = single ? out.blds[0].id : null;
  return out;
}

class FloorplanLiteCard extends HTMLElement {
  static getConfigElement() { return document.createElement("floorplan-lite-card-editor"); }

  static async getStubConfig(hass) {  // the card picker starts with the first stored plan
    let plans = [];
    try { plans = hass ? await hass.callWS({ type: "floorplan_lite/list" }) : []; } catch (e) { /* integration not set up */ }
    return { plan: plans.length ? plans[0].id : "", mode: "swipe" };
  }

  setConfig(config) {
    if (!config) throw new Error("config missing");
    this._config = Object.assign({}, config);
    this._refs = null;
    this._sig = null;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const site = config.site && typeof config.site === "object" ? config.site : null;
    const ids = site ? (site.buildings || []).map((b) => b && b.plan).filter(Boolean) : [];
    const sig = site ? ids.join(",") : "";
    if (!!site !== !!this._siteInline || this._planId !== (site ? null : config.plan) || this._siteIds !== sig) {
      this._unsubscribe();
      this._planId = site ? null : config.plan;
      this._plan = undefined;
      this._siteMode = !!site;
      this._siteInline = !!site;
      this._sitePlanData = null;
      this._siteIds = sig;
      this._plans = {};
      ids.forEach((id) => { this._plans[id] = undefined; });
    }
    if (site && config.plans_data) { Object.keys(config.plans_data).forEach((id) => { this._plans[id] = config.plans_data[id]; }); }
    if (site) this._setSite();
    else if (config.plan_data) this._setPlan(config.plan_data);  // plan inline (tests, sharing)
    this._subscribe();
    this._render();
  }

  getCardSize() { return 12; }
  getGridOptions() { return { columns: "full", rows: "auto" }; }

  get _t() {
    const l = this._hass && this._hass.locale && this._hass.locale.language || (this._hass && this._hass.language) || "en";
    return TEXT[String(l).slice(0, 2)] || TEXT.en;
  }

  connectedCallback() {
    CARDS.indexOf(this) < 0 && CARDS.push(this);
    if (!this._onOver) {  // which card the pointer is over: that one takes the remote's arrow keys
      this._onOver = () => { this._over = true; };
      this._onOut = () => { this._over = false; };
      this.addEventListener("pointerenter", this._onOver);
      this.addEventListener("pointerleave", this._onOut);
    }
    if (window.ResizeObserver) {
      if (!this._ro) this._ro = new ResizeObserver(() => this._resized());
      this._ro.observe(this);
    } else if (!this._onResize) {
      this._onResize = () => this._resized();
      window.addEventListener("resize", this._onResize);
    }
    this._lastW = 0;  // after (un)mounting (view change) the swipe area is 0 wide → align again
    this._resized();
    if (!this._onKey) {
      this._onKey = (e) => this._key(e);
      window.addEventListener("keydown", this._onKey);
      this._onTvKey = (e) => this._remote(TV_KEYS[e.detail && e.detail.key]);  // TV Streamer: remote keys the page itself does not get
      window.addEventListener("tv-streamer-key", this._onTvKey);
    }
    if (!this._onHash) {  // site: the view lives in the address (#plan=…&floor=…), Back goes from the building to the site
      this._onHash = () => this._hashChanged();
      window.addEventListener("popstate", this._onHash);
      window.addEventListener("hashchange", this._onHash);
      window.addEventListener("location-changed", this._onHash);
      this._onVis = () => { if (document.visibilityState === "visible") this._applyStart("entry"); };
      document.addEventListener("visibilitychange", this._onVis);
    }
    this._subscribe();
    if (this._siteMode && this._refs) this._applyStart("entry");  // view opened again: start view anew
  }

  disconnectedCallback() {
    if (this._onHash) {
      window.removeEventListener("popstate", this._onHash);
      window.removeEventListener("hashchange", this._onHash);
      window.removeEventListener("location-changed", this._onHash);
      document.removeEventListener("visibilitychange", this._onVis);
      this._onHash = null;
    }
    this._tplStop();
    if (CARDS.indexOf(this) >= 0) CARDS.splice(CARDS.indexOf(this), 1);
    if (this._ro) this._ro.disconnect();
    if (this._onResize) { window.removeEventListener("resize", this._onResize); this._onResize = null; }
    if (this._onKey) { window.removeEventListener("keydown", this._onKey); this._onKey = null; }
    if (this._onTvKey) { window.removeEventListener("tv-streamer-key", this._onTvKey); this._onTvKey = null; }
    this._unsubscribe();
  }

  /* ---------- Plan from the integration ---------- */
  _subscribe() {
    if (this._siteMode) this._subscribeSite();
    if (this._unsub || this._subscribing || !this._hass || !this._planId || !this.isConnected || (this._config && this._config.plan_data)) return;
    this._subscribing = true;
    this._hass.connection.subscribeMessage((msg) => this._setPlan(msg.plan || null),
      { type: "floorplan_lite/subscribe", plan_id: this._planId })
      .then((unsub) => { this._unsub = unsub; this._subscribing = false; })
      .catch((err) => { this._subscribing = false; this._error = err && err.message; this._setPlan(null); });
  }

  _unsubscribe() {
    if (this._unsub) { try { this._unsub(); } catch (e) { /* connection gone */ } }
    this._unsub = null;
    const subs = this._siteSubs || {};
    Object.keys(subs).forEach((id) => { if (typeof subs[id] === "function") { try { subs[id](); } catch (e) { /* gone */ } } });
    this._siteSubs = {};
  }

  _subscribeSite() {  // one subscription per building plan
    if (!this._hass || !this.isConnected || (this._config && this._config.plans_data)) return;
    const subs = this._siteSubs || (this._siteSubs = {});
    Object.keys(this._plans || {}).forEach((id) => {
      if (subs[id]) return;
      subs[id] = "…";
      this._hass.connection.subscribeMessage((msg) => { this._plans[id] = msg.plan || null; this._setSite(); },
        { type: "floorplan_lite/subscribe", plan_id: id })
        .then((unsub) => { if (this._siteSubs === subs) subs[id] = unsub; else unsub(); })
        .catch(() => { subs[id] = "x"; this._plans[id] = null; this._setSite(); });
    });
  }

  _setSite() {
    const cfg = this._config || {};
    const site = Object.assign({}, this._sitePlanData ? this._sitePlanData.site : {}, cfg.site || {});
    const ids = Object.keys(this._plans || {});
    if (ids.some((id) => this._plans[id] === undefined)) { this._plan = undefined; this._render(); return; }
    const plans = {};
    ids.forEach((id) => { if (this._plans[id]) plans[id] = this._plans[id]; });
    const d = buildSite(site, plans, cfg);
    this._site = d;
    this._plan = d.blds.length ? plans[d.blds[0].id] : null;
    this._floors = d.floors;
    this._fl = d.order;
    this._rooms = d.rooms;
    this._info = d.info;
    this._single = d.single;
    this._hideLabels = cfg.hide_label !== undefined ? listOf(cfg.hide_label) : d.labels.concat(planLabels(this._sitePlanData));
    this._liveAreas = d.live;
    this._live = {}; this._liveSrc = null;
    this._lastFloor = this._lastFloor || {};
    d.blds.forEach((b) => { if (!this._floors[this._lastFloor[b.id]]) this._lastFloor[b.id] = b.siteLevel; });
    if (!this._floors[this._view]) this._view = null;
    this._idl = this._ids();
    this._refs = null;
    this._sig = null;
    this._render();
  }

  _setPlan(plan) {
    if (plan && plan.site) {  // a property plan: its buildings are other plans
      this._sitePlanData = plan;
      this._siteMode = true;
      const ids = (plan.site.buildings || []).map((b) => b && b.plan).filter(Boolean);
      this._plans = this._plans || {};
      Object.keys(this._plans).forEach((id) => { if (ids.indexOf(id) < 0) delete this._plans[id]; });
      ids.forEach((id) => { if (!(id in this._plans)) this._plans[id] = undefined; });
      this._subscribeSite();
      this._setSite();
      return;
    }
    this._sitePlanData = null;
    this._siteMode = false;
    this._plan = plan;
    const cfg = this._config || {};
    const align = cfg.align === undefined ? !!(plan && plan.align_levels) : !!cfg.align;
    // ausrichtung: norden turns the plan so north is up (else it keeps its own axis; the compass shows north)
    const np = plan && cfg.ausrichtung === "norden" && plan.north ? Object.assign({}, plan, { rotation: -plan.north }) : plan;
    this._floors = np ? prepare(np, align, cfg.building) : null;
    const keys = this._floors ? Object.keys(this._floors) : [];
    this._fl = (cfg.floors || keys).filter((k) => this._floors && this._floors[k]);
    if (this._idx === undefined || this._idx >= this._fl.length) this._idx = Math.max(0, this._fl.indexOf(cfg.start || this._fl[0]));
    this._rooms = Object.assign({}, plan && plan.entities || {}, cfg.rooms || {});
    const list = (x) => (Array.isArray(x) ? x : x ? [x] : []);
    this._hideLabels = cfg.hide_label !== undefined ? list(cfg.hide_label) : planLabels(plan);
    this._info = {};
    ((plan && plan.rooms) || []).forEach((r) => { if (!this._info[r.id]) this._info[r.id] = { id: r.id, area: r.area, name: r.name === undefined ? r.id : r.name }; });
    this._liveAreas = {};  // room key → area, for rooms that take their entities from the area every time
    ((plan && plan.rooms) || []).forEach((r) => { if (r.area && r.area_live) this._liveAreas[r.key || r.id] = r.area; });
    this._live = {}; this._liveSrc = null;
    this._idl = this._ids();
    this._refs = null;
    this._sig = null;
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;
    if (this._siteMode) {
      if (!Object.keys(this._plans || {}).length) return this._message(this._t.noSite);
      if (this._plan === undefined) return this._message(this._t.loading);
      if (!this._fl || !this._fl.length) return this._message(this._t.missing.replace("%s", Object.keys(this._plans).join(", ")));
      if (this._hass) this.hass = this._hass;
      return;
    }
    if (!this._planId && !(this._config && this._config.plan_data)) return this._message(this._t.noPlan);
    if (this._plan === undefined) return this._message(this._t.loading);
    if (this._plan === null || !this._fl.length) return this._message(this._t.missing.replace("%s", this._planId || ""));
    if (this._hass) this.hass = this._hass;
  }

  _message(text) {
    this._refs = null;
    this.shadowRoot.innerHTML = `<style>${FloorplanLiteCard.styles}</style><ha-card class="night"><div class="msg">${esc(text)}</div></ha-card>`;
  }

  _resized() {  // re-align only when the width changed (the own height change triggers the observer as well)
    if (!this._refs) return;
    const w = this._track ? this._track.clientWidth : this.clientWidth;
    if (!w || w === this._lastW) return;
    this._lastW = w;
    this._fit();
    this._align();
  }

  _ids() {
    const ids = [], rooms = Object.assign({}, this._live || {}, this._rooms || {});
    Object.keys(rooms).forEach((k) => {
      const r = this._roomEnts(k);
      ["praesenz", "bewegung", "licht", "fenster", "beschattung", "musik"].forEach((f) => { (r[f] || []).forEach((id) => ids.push(id)); });
      if (r.temp) ids.push(r.temp);
      if (r.hauptlicht) ids.push(r.hauptlicht);
    });
    Object.keys(this._floors || {}).forEach((k) => this._floors[k].openings.forEach((o) => {
      o.ents.forEach((id) => ids.push(id));
      if (o.tilt_entity) ids.push(o.tilt_entity);
      if (o.shade) ids.push(o.shade);
    }));
    return ids;
  }

  _roomEnts(key) {  // stored entities of a room, plus those found in its area when it is live
    const r = (key && this._rooms[key]) || {}, l = key && this._live && this._live[key];
    if (!l) return r;
    const m = Object.assign({}, r);
    Object.keys(l).forEach((f) => {
      if (f === "temp") { if (!m.temp) m.temp = l.temp; return; }
      m[f] = (r[f] || []).concat(l[f].filter((id) => (r[f] || []).indexOf(id) < 0));
    });
    return m;
  }

  _hidden(id) {  // entities with the hide label (e.g. no_dboard) count as not there
    const ls = this._hideLabels || [], reg = ls.length && this._hass.entities && this._hass.entities[id];
    return !!(reg && reg.labels && reg.labels.some((l) => ls.indexOf(l) >= 0));
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._subscribe();
    if (this._config && this._config.tap !== "none") this._double();  // ask the script early (at most once a minute)
    if (!this._config || !this.shadowRoot || !this._floors || !this._fl.length) return;
    if (!this._refs) this._build();
    if (Object.keys(this._liveAreas || {}).length && (hass.entities !== this._liveSrc || hass.devices !== this._liveDev)) {
      this._liveSrc = hass.entities; this._liveDev = hass.devices;  // registry changed: look for the areas' entities again
      Object.keys(this._liveAreas).forEach((k) => { this._live[k] = areaEntities(hass, this._liveAreas[k], (id) => this._hidden(id)); });
      this._idl = this._ids(); this._sig = null;
    }
    const v = (x) => (x === undefined || x === null ? "" : x);  // without ?? for older webOS browsers
    const sig = this._idl.map((id) => {
      const s = hass.states[id];
      if (!s) return "x";
      const a = s.attributes || {};
      return `${s.state}|${v(a.current_temperature)}|${v(a.current_position)}|${v(a.current_tilt_position)}|${v(a.volume_level)}|${v(a.brightness)}|${v(a.rgb_color)}|${v(a.color_mode)}|${v(a.color_temp_kelvin)}|${v(a.zustand)}|${v(a.state)}|${v(a.schloss)}`;
    }).join(";") + "#" + this._flashText();
    if (this._siteMode) {  // follow the location: geofence and Bluetooth area sensors of this user
      const fs = this._followIds().map((id) => { const x = hass.states[id]; return x ? x.state + "@" + x.last_changed : "x"; }).join("|");
      if (fs !== this._followSig) { const had = this._followSig !== undefined; this._followSig = fs; if (had) this._applyStart("update"); }
    }
    if (sig === this._sig) return;
    this._sig = sig;
    this._update();
  }

  /* ---------- State of a room ---------- */
  _status(key) {
    const r = this._roomEnts(key);
    const st = this._hass.states;
    const get = (id) => (id && !this._hidden(id) ? st[id] : undefined);
    const any = (list, fn) => (list || []).some((id) => { const s = get(id); return !!s && fn(s); });
    const own = hexRgb(r.lichtfarbe);  // the room's colour for lights (and switches) that report none
    const light = (id) => {  // {c: rgb, b: brightness, col: colour light} of a light or switch that is on
      const s = get(id);
      if (!s || s.state !== "on") return null;
      const a = s.attributes || {};
      const b = typeof a.brightness === "number" ? Math.max(0.15, a.brightness / 255) : 1;
      const rgb = Array.isArray(a.rgb_color) && a.rgb_color.length >= 3 ? a.rgb_color : null;
      if (rgb && WHITE_MODES.indexOf(a.color_mode) < 0) return { c: rgb, b: b, col: colourful(rgb) };
      if (typeof a.color_temp_kelvin === "number") return { c: kelvinRgb(a.color_temp_kelvin), b: b, col: false };
      return own ? { c: own, b: b, col: colourful(own) } : { c: WARM, b: b, col: false };
    };
    const main = light(r.hauptlicht);
    const lights = (r.licht || []).filter((id) => id !== r.hauptlicht).map(light).filter((l) => !!l);
    const colored = lights.filter((l) => l.col), white = lights.filter((l) => !l.col);
    let pool, tint, edge;
    if (r.hauptlicht) {  // room with a main light: it fills the room, all other lights only glow as a seam
      pool = main ? mix([main]) : null; tint = !!main && main.col; edge = lights.length ? mix(lights) : null;
    } else {
      pool = white.length ? mix(white) : colored.length ? mix(colored) : null;  // colour light only: whole room in its colour
      tint = !white.length && colored.length > 0;
      edge = white.length && colored.length ? mix(colored) : null;              // colour light next to white light: seam along the walls
    }
    let temp = "";
    const s = get(r.temp);
    if (s) {
      const val = r.temp.indexOf("climate.") === 0 ? s.attributes.current_temperature : parseFloat(s.state);
      if (typeof val === "number" && !isNaN(val)) {
        const de = this._t === TEXT.de;
        temp = (de ? val.toFixed(1).replace(".", ",") : val.toFixed(1)) + "°";
      }
    }
    return {
      motion: any(r.bewegung, (s) => s.state === "on"),
      presence: any(r.praesenz, (s) => s.state === "on"),
      pool: pool,
      tint: tint,
      edge: edge,
      win: any(r.fenster, (s) => winState(s) === "open") ? "open" : any(r.fenster, (s) => winState(s) === "tilted") ? "tilted" : "",
      shade: any(r.beschattung, (s) => s.state === "closed" || s.state === "closing" ||
        (typeof s.attributes.current_position === "number" && s.attributes.current_position < 95)),
      music: any(r.musik, (s) => s.state === "playing"),
      temp: temp,
    };
  }

  /* ---------- Frame of one level ---------- */
  _floorHtml(key, swipe, intro, bare) {
    const f = this._floors[key];
    const [vx, vy, vw, vh] = f.view;
    const X = (x) => pc((x - vx) / vw), Y = (y) => pc((y - vy) / vh);
    const n = (s, i) => `${s}-${key}${i === undefined ? "" : "-" + i}`;
    const region = `filterUnits="userSpaceOnUse" x="${vx}" y="${vy}" width="${vw}" height="${vh}"`;
    const style = f.style || (this._plan && this._plan.style) || {};
    const fl = Array.isArray(style.floor) && style.floor.length >= 2 ? style.floor : ["#2a3657", "#1c2541"];
    let defs = `<linearGradient id="${n("fl")}" gradientUnits="userSpaceOnUse" x1="${vx}" y1="${vy}" x2="${vx + vw}" y2="${vy + vh}">` +
      `<stop offset="0" stop-color="${esc(fl[0])}"/><stop offset="1" stop-color="${esc(fl[1])}"/></linearGradient>` +
      `<filter id="${n("sp")}" ${region}><feGaussianBlur stdDeviation=".7"/></filter>` +
      `<filter id="${n("ed")}" ${region}><feGaussianBlur stdDeviation=".45"/></filter>` +
      `<filter id="${n("sh")}" ${region}><feGaussianBlur stdDeviation=".45"/></filter>`;
    const cuts = f.openings.filter((d) => d.type !== "skylight");  // a roof window sits in the room, not in a wall
    if (cuts.length) {
      defs += `<mask id="${n("dm")}" maskUnits="userSpaceOnUse" x="${vx}" y="${vy}" width="${vw}" height="${vh}">` +
        `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fff"/>` +
        cuts.map((d) => `<polygon points="${pts(d.rect)}" fill="#000"/>`).join("") + `</mask>`;
    }
    const outerCuts = cuts.filter((d) => d.type !== "open");  // "open" (no wall between two rooms) never touches the outer wall
    if (outerCuts.length && outerCuts.length < cuts.length) {
      defs += `<mask id="${n("dmo")}" maskUnits="userSpaceOnUse" x="${vx}" y="${vy}" width="${vw}" height="${vh}">` +
        `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fff"/>` +
        outerCuts.map((d) => `<polygon points="${pts(d.rect)}" fill="#000"/>`).join("") + `</mask>`;
    }
    let floors = "", spills = "", lights = "", edges = "", walls = "", hits = "", fx = "", lbls = "";
    f.rooms.forEach((room, i) => {
      const p = pts(room.poly);
      const [x1, y1, x2, y2] = bbox(room.poly);
      const bw = x2 - x1, bh = y2 - y1;
      const [lx, ly] = room.labelAt || centroid(room.poly);
      defs += `<clipPath id="${n("c", i)}"><polygon points="${p}"/></clipPath>` +
        `<radialGradient id="${n("g", i)}" cx="${((lx - x1) / bw).toFixed(3)}" cy="${((ly - y1) / bh).toFixed(3)}" r=".8">` +
        `<stop offset="0"/><stop offset=".55"/><stop offset="1"/></radialGradient>`;
      const fill = room.color ? esc(room.color) : `url(#${n("fl")})`;
      floors += `<polygon class="floor${room.outdoor ? " outdoor" : ""}" points="${p}" fill="${fill}"/>`;
      spills += `<polygon class="spill" data-i="${i}" points="${p}"/>`;
      lights += `<g class="light" data-i="${i}"><polygon points="${p}" fill="url(#${n("g", i)})"/></g>`;
      edges += `<polygon class="edge" data-i="${i}" points="${p}" filter="url(#${n("ed")})" clip-path="url(#${n("c", i)})"/>`;
      if (!room.outdoor && f.roomWalls) walls += `<polygon points="${p}"/>`;
      hits += `<polygon class="hit${room.site ? " area" : ""}" data-room="${esc(room.id)}"${room.bld ? ` data-bld="${esc(room.bld)}"` : ""} points="${p}"/>`;
      if (!room.name) return;  // part of another room: no own dot, no label
      // presence/motion dot: HTML layer, so the animation runs on the graphics card and the SVG is not redrawn
      const d = Math.max(1.8, Math.min(4.2, Math.min(bw, bh)));
      const rr = Math.max(bw, bh) * 1.15;  // ripples run to just beyond the room size and fade out there
      const clip = room.poly.map(([x, y]) => `${pc((x - x1) / bw)} ${pc((y - y1) / bh)}`).join(",");
      fx += `<div class="fx" data-i="${i}" style="left:${X(x1)};top:${Y(y1)};width:${pc(bw / vw)};height:${pc(bh / vh)};` +
        `-webkit-clip-path:polygon(${clip});clip-path:polygon(${clip})">` +
        `<div class="o" style="left:${pc((lx - x1) / bw)};top:${pc((ly - y1) / bh)};width:${pc(d / bw)};height:${pc(d / bh)}">` +
        `<div class="core p"><i></i></div><div class="core m"><i></i></div></div>` +
        `<div class="o" style="left:${pc((lx - x1) / bw)};top:${pc((ly - y1) / bh)};width:${pc(rr / bw)};height:${pc(rr / bh)}">` +
        `<div class="ring"></div><div class="ring r2"></div></div></div>`;
      if (room.nolabel) return;  // site view: the buildings' rooms without labels (the building's summary says enough)
      lbls += `<div class="lbl${room.small ? " small" : ""}${room.site ? " area" : ""}" data-i="${i}" data-room="${esc(room.id)}" tabindex="0" role="button" aria-label="${esc(room.name)}" ` +
        `style="left:${X(lx)};top:${Y(ly)}"><div class="here"></div><div class="name">${esc(room.name)}</div><div class="temp"></div><div class="chips"></div></div>`;
    });
    f.openings.forEach((o, i) => {  // windows, doors and gates with entities can be tapped (above the rooms)
      if (o.ents.length || o.shade) hits += `<polygon class="ohit" data-o="${i}" points="${pts(openingRect(Object.assign({}, o, { width: Math.max(o.width || 0.9, 0.6), depth: Math.max(o.depth || 0.24, 0.6) })))}"/>`;
    });
    const mask = cuts.length ? ` mask="url(#${n("dm")})"` : "";
    const omask = !outerCuts.length ? "" : outerCuts.length < cuts.length ? ` mask="url(#${n("dmo")})"` : mask;
    const dash = (o) => {
      if (!intro) return "";
      const L = perimeter(o).toFixed(2);
      return ` style="stroke-dasharray:${L} ${L};stroke-dashoffset:${L}"`;
    };
    f.walls.forEach((w) => {  // inner walls drawn on their own (centre line, own thickness)
      walls += `<poly${w.closed ? "gon" : "line"} points="${pts(w.poly)}"${w.width ? ` stroke-width="${w.width}"` : ""} stroke-linecap="square"/>`;
    });
    const extras = f.extra.map((e) => `<poly${e.open ? "line" : "gon"} class="extra" points="${pts(e.poly)}"/>`).join("");
    const shadows = f.outlines.map((o) => `<polygon class="shadow" points="${pts(o)}" transform="translate(.15 .45)" filter="url(#${n("sh")})"/>`).join("");
    const st = f.style || (this._plan && this._plan.style) || {};
    const wall = typeof st.wall_width === "number" && st.wall_width > 0 ? st.wall_width : WALL;  // thickness from the editor
    const outer = typeof st.outer_width === "number" && st.outer_width > 0 ? st.outer_width : OUTER;
    const outlines = f.outlines.map((o) => `<polygon class="outline" points="${pts(o)}" stroke-width="${outer}"${dash(o)}${omask}/>`).join("");
    const rims = f.outlines.map((o) => `<polygon class="rim" points="${pts(grow(o, outer / 2))}"${omask}/>`).join("");
    const bg = this._background(f);
    const vb = `viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMin meet"`;
    let raster = "";
    if (f.raster) {  // site: a 5 m grid with metre labels, to place buildings and areas
      const g0x = Math.ceil(vx / 5) * 5, g0y = Math.ceil(vy / 5) * 5;
      for (let x = g0x; x <= vx + vw; x += 5) raster += `<line x1="${x}" y1="${vy}" x2="${x}" y2="${vy + vh}"/><text x="${x + 0.2}" y="${vy + 1}">${x}</text>`;
      for (let y = g0y; y <= vy + vh; y += 5) raster += `<line x1="${vx}" y1="${y}" x2="${vx + vw}" y2="${y}"/><text x="${vx + 0.2}" y="${y - 0.2}">${y}</text>`;
      raster = `<g class="raster">${raster}</g>`;
    }
    if (f.site && this._site) {  // site: a building (its outer walls) can be tapped to zoom in; its summary above it
      hits = (f.bldShapes || []).map((b) => `<polygon class="bhit" data-bld="${esc(b.bld)}" points="${pts(b.poly)}"/>`).join("") + hits;
      this._site.blds.forEach((b) => {
        const bx = b.box, at = b.label;
        lbls += `<div class="bsum${at ? " mid" : ""}" data-bld="${esc(b.id)}" role="button" tabindex="0" style="left:${X(at ? at[0] : (bx[0] + bx[2]) / 2)};top:${Y(at ? at[1] : bx[1])}">` +
          `<span class="bn">${esc(b.name)}</span><span class="bs"></span></div>`;
      });
    }
    const svg = `<svg class="base" ${vb} aria-hidden="true"><defs>${defs}</defs>` +
      (bg && bg.mode === "under" ? bg.html : "") + raster + shadows +
      `<g class="fl">${floors}</g>` +
      `<g class="sp" filter="url(#${n("sp")})">${spills}</g>` +
      `<g class="li">${lights}</g><g class="ed">${edges}</g>` +
      `<g class="wa" stroke-width="${wall}"${mask}>${walls}</g>${extras}${outlines}${rims}` +
      `<g class="op">${this._openingsHtml(f.openings)}</g>` +
      (bg && bg.mode === "over" ? bg.html : "") + `</svg>`;
    const plan = `<div class="plan" data-f="${esc(key)}"${swipe ? ` style="width:calc(70vh * ${(vw / vh).toFixed(4)})"` : ""}>` +
      `<div class="ratio" style="padding-top:${((vh / vw) * 100).toFixed(3)}%"></div>${svg}` +
      `<div class="fxs">${fx}</div><div class="lbls">${lbls}</div>${this._rose(f)}` +
      `<svg class="hits" ${vb}>${hits}</svg></div>`;
    if (bare) return plan;
    return swipe ? `<div class="slide">${plan}</div>` : `<div class="floor"><div class="ftitle">${esc(f.title)}</div>${plan}</div>`;
  }

  /* Compass rose: where north is in this view (kompass: false hides it). */
  _rose(f, bar) {  // site: in the top bar (always in sight); a single plan: in the plan's corner
    if (!f || this._config.kompass === false || typeof f.north !== "number" || (!bar && this._siteMode)) return "";
    const d = +f.north.toFixed(1), tr = `rotate(${d}deg)`;
    return `<div class="rose${bar ? " bar" : ""}" aria-hidden="true"><svg viewBox="-20 -20 40 40" style="-webkit-transform:${tr};transform:${tr}">` +
      `<circle r="17"/><path class="rs" d="M0 -15 L4 0 L0 15 L-4 0 Z"/><path class="rn" d="M0 -15 L4 0 L-4 0 Z"/>` +
      `<text y="-7.5" transform="rotate(${-d} 0 -9)">N</text></svg></div>`;
  }

  /* Background image (satellite view, scanned blueprint): under the plan, or over it with transparency. */
  _background(f) {
    const b = f.background;
    if (!b || !b.image || b.mode === "hidden" || this._config.background === false) return null;
    const pr = f.bgRot !== undefined ? f.bgRot : (this._plan && this._plan.rotation) || 0;
    const rot = (b.rotation || 0) + pr;
    const rp = rotator(pr)([b.x || 0, b.y || 0]);
    const h = b.height || b.width * 4;  // without a height the image keeps its aspect ratio (meet, anchored top left)
    const html = `<image class="bgimg" href="${esc(b.image)}" x="${rp[0]}" y="${rp[1]}" width="${b.width}" height="${h}" ` +
      `preserveAspectRatio="${b.height ? "none" : "xMinYMin meet"}" opacity="${b.opacity === undefined ? 1 : b.opacity}"` +
      (rot ? ` transform="rotate(${rot} ${rp[0]} ${rp[1]})"` : "") + `/>`;
    return { mode: b.mode || "under", html };
  }

  /* Symbols of doors, windows and garage doors (passages are only cut out of the walls). */
  _openingsHtml(list) {
    return list.map((o, i) => `<g class="os" data-o="${i}">${this._openingSym(o)}</g>` + (o.shade ? `<g class="shd" data-sh="${i}"></g>` : "")).join("");
  }

  _openingSym(o) {
    const r = (o.angle || 0) * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r);
    const w = (o.width || 0.9) / 2, x = o.at[0], y = o.at[1];
    const a = [x - dx * w, y - dy * w], b = [x + dx * w, y + dy * w];
    const line = (p, q, cls) => `<line class="${cls}" x1="${p[0].toFixed(3)}" y1="${p[1].toFixed(3)}" x2="${q[0].toFixed(3)}" y2="${q[1].toFixed(3)}"/>`;
    if (o.type === "skylight") {  // roof window (glass with a frame bar) or dome
      if (o.round) return `<ellipse class="sky" cx="${x}" cy="${y}" rx="${w.toFixed(3)}" ry="${((o.depth || 1) / 2).toFixed(3)}" transform="rotate(${o.angle || 0} ${x} ${y})"/>`;
      return `<polygon class="sky" points="${pts(openingRect(o))}"/>` + line(a, b, "skybar");
    }
    if (o.type === "window") return line(a, b, "win");
    if (o.type === "garage") return line(a, b, "gar");
    if (o.type === "door") {  // leaf open by 90° with its swing arc
      const s = o.flip ? -1 : 1, L = 2 * w;
      const tip = [a[0] - dy * L * s, a[1] + dx * L * s];
      return line(a, tip, "leaf") +
        `<path class="swing" d="M${tip[0].toFixed(3)} ${tip[1].toFixed(3)} A${L.toFixed(3)} ${L.toFixed(3)} 0 0 ${s > 0 ? 0 : 1} ${b[0].toFixed(3)} ${b[1].toFixed(3)}"/>`;
    }
    return "";
  }

  _build() {
    if (this._siteMode) return this._buildSite();
    const root = this.shadowRoot, cfg = this._config, t = this._t;
    const fl = this._fl, swipe = cfg.mode === "swipe";
    const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const intro = !reduce && cfg.intro !== false;
    const CHIP = chips(t);
    this._chips = CHIP;
    const body = fl.map((k) => this._floorHtml(k, swipe, intro)).join("");
    const legend = `<div class="legend">` +
      `<span><i class="lg p"></i>${t.presence}</span><span><i class="lg m"></i>${t.motion}</span><span><i class="lg l"></i>${t.light}</span>` +
      `<span>${CHIP.w}${t.win}</span><span>${CHIP.s}${t.shade}</span><span>${CHIP.m}${t.musicL}</span></div>`;
    let html;
    if (swipe) {
      const tabs = fl.map((k, i) => `<button class="tab" role="tab" data-i="${i}"><span class="l">${esc(this._floors[k].title)}</span>` +
        `<span class="s">${esc(this._floors[k].short)}</span></button>`).join("");
      html = `<ha-card class="night swipe${intro ? " intro" : ""}">` +
        `<div class="top"><div class="seg" role="tablist"><div class="ind" style="width:calc((100% - 6px) / ${fl.length})"></div>${tabs}</div></div>` +
        `<div class="wrap"><button class="nav prev" aria-label="${t.prev}"><ha-icon icon="mdi:chevron-left"></ha-icon></button>` +
        `<div class="track">${body}</div>` +
        `<button class="nav next" aria-label="${t.next}"><ha-icon icon="mdi:chevron-right"></ha-icon></button></div>${legend}</ha-card>`;
    } else {
      html = `<ha-card class="night${intro ? " intro" : ""}"><div class="floors">${body}</div>${legend}</ha-card>`;
    }
    root.innerHTML = `<style>${FloorplanLiteCard.styles}${this._styleVars()}</style>${html}`;
    this._wire(root);

    this._track = root.querySelector(".track");
    this._ind = root.querySelector(".ind");
    this._tabs = Array.prototype.slice.call(root.querySelectorAll(".tab"));
    this._shown = -1;
    if (swipe) {
      this._snap = !!(window.CSS && CSS.supports && CSS.supports("scroll-snap-type", "x mandatory"));
      this._track.addEventListener("scroll", () => {
        if (!this._raf) this._raf = requestAnimationFrame(() => { this._raf = 0; this._progress(); });
        clearTimeout(this._st);
        this._st = setTimeout(() => this._settle(), 160);
      }, { passive: true });
      this._tabs.forEach((b) => b.addEventListener("click", () => this._go(+b.getAttribute("data-i"))));
      root.querySelector(".prev").addEventListener("click", () => this._go(this._idx - 1));
      root.querySelector(".next").addEventListener("click", () => this._go(this._idx + 1));
    }

    clearTimeout(this._introT);
    if (intro) {
      this._introT = setTimeout(() => {
        root.querySelectorAll(".outline").forEach((o) => { o.style.strokeDasharray = ""; o.style.strokeDashoffset = ""; });
        const card = root.querySelector("ha-card");
        if (card) card.classList.remove("intro");
      }, 2900);
    }
    this._lastW = 0;
    requestAnimationFrame(() => this._resized());
  }

  /* References for the state updates and the operation of rooms, windows and doors (all levels / views). */
  _wire(root) {
    this._refs = []; this._orefs = [];
    const plans = root.querySelectorAll(".plan");
    for (let k = 0; k < plans.length; k++) {
      const plan = plans[k], key = plan.getAttribute("data-f");
      this._floors[key].rooms.forEach((room, i) => {
        const q = (sel) => plan.querySelector(`${sel}[data-i="${i}"]`);
        const lbl = q(".lbl");
        this._refs.push({
          key: room.key || room.id,
          light: q(".light"), spill: q(".spill"), edge: q(".edge"), fx: q(".fx"), lbl: lbl,
          stops: plan.querySelectorAll(`[id="g-${key}-${i}"] stop`),
          temp: lbl ? lbl.querySelector(".temp") : null,
          chips: lbl ? lbl.querySelector(".chips") : null,
          here: lbl ? lbl.querySelector(".here") : null,
          st: {},
        });
      });
      this._floors[key].openings.forEach((o, i) => {
        if (o.ents.length || o.tilt_entity || o.shade) this._orefs.push({ o: o, g: plan.querySelector(`.op .os[data-o="${i}"]`), hit: plan.querySelector(`.ohit[data-o="${i}"]`),
          sh: plan.querySelector(`.op .shd[data-sh="${i}"]`), cls: "", sk: null });
      });
    }

    root.querySelectorAll(".hit").forEach((el) => {
      el.addEventListener("click", (e) => this._click(el, e));
      el.addEventListener("pointerenter", () => { this._hover = el.getAttribute("data-room"); this._hoverBld = el.getAttribute("data-bld"); });
      el.addEventListener("pointerleave", () => { if (this._hover === el.getAttribute("data-room")) this._hover = null; });
      el.addEventListener("wheel", (e) => {   // mouse wheel over a room = music louder/quieter (Ctrl+wheel: zoom, see the site)
        if (e.ctrlKey) return;
        e.preventDefault();
        const now = Date.now();
        if (this._wheelT && now - this._wheelT < 250) return;   // at most 4 steps per second
        this._wheelT = now;
        this._send(el.getAttribute("data-room"), e.deltaY < 0 ? "lauter" : "leiser");
      }, { passive: false });
      el.addEventListener("contextmenu", (e) => {   // right click / yellow: gelb, twice gelb2
        e.preventDefault();
        el.classList.add("pressed"); setTimeout(() => el.classList.remove("pressed"), 280);
        this._press(el.getAttribute("data-room"), "gelb");
      });
    });
    this._orefs.forEach((r) => { if (r.hit) r.hit.addEventListener("click", (e) => { e.stopPropagation(); this._opTap(r.o); }); });
    root.querySelectorAll(".lbl").forEach((el) => el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.keyCode === 13) { e.preventDefault(); this._open(el.getAttribute("data-room")); }
    }));
  }

  /* Colours from the plan (editor → style) as CSS variables; defaults = the original night look. */
  _styleVars() {
    const s = (this._plan && this._plan.style) || {}, v = [];
    const css = (x) => String(x).replace(/[;{}<>]/g, "");
    if (s.wall) v.push(`--n-wall:${css(s.wall)}`);
    if (s.edge) v.push(`--n-edge:${css(s.edge)}`);
    if (s.text) v.push(`--n-text:${css(s.text)}`);
    let out = v.length ? `:host{${v.join(";")}}` : "";
    if (s.background) out += `ha-card.night{background-color:${css(s.background)};background-image:radial-gradient(rgba(160,182,230,.075) 1px,transparent 1.6px)}`;
    return out;
  }

  /* ---------- Write states (changes only) ---------- */
  _update() {
    if (!this._refs || !this._hass) return;
    const cache = {};
    this._refs.forEach((ref) => {
      const s = cache[ref.key] || (cache[ref.key] = this._status(ref.key));
      const o = ref.st, pool = s.pool;
      if (pool && o.pc !== pool.rgb) {
        o.pc = pool.rgb;
        const c = `rgb(${pool.rgb})`;
        [1, 0.5, 0.1].forEach((a, j) => { const sp = ref.stops[j]; if (sp) { sp.style.stopColor = c; sp.style.stopOpacity = a; } });
        if (ref.spill) ref.spill.style.fill = c;
      }
      const lop = pool ? ((0.45 + 0.5 * pool.b) * (s.tint ? 0.82 : 1)).toFixed(2) : "0";
      if (o.lop !== lop) {
        o.lop = lop;
        if (ref.light) ref.light.style.opacity = lop;
        if (ref.spill) ref.spill.style.fillOpacity = pool ? (0.25 + 0.35 * pool.b).toFixed(2) : "0";
      }
      if (s.edge && o.ec !== s.edge.rgb) { o.ec = s.edge.rgb; if (ref.edge) ref.edge.style.stroke = `rgb(${s.edge.rgb})`; }
      const eop = s.edge ? (0.3 + 0.4 * s.edge.b).toFixed(2) : "0";
      if (o.eop !== eop) { o.eop = eop; if (ref.edge) ref.edge.style.opacity = eop; }
      if (ref.fx) {
        const cls = "fx" + (s.motion ? " motion" : s.presence ? " presence" : "");
        if (ref.fx.className !== cls) ref.fx.className = cls;
      }
      if (ref.lbl) {
        const fl = this._flash && this._flash.text && this._flash.key === ref.key ? this._flash.text : "";
        const tx = fl || s.temp;
        if (ref.temp.textContent !== tx) ref.temp.textContent = tx;
        if (o.fl !== !!fl) { o.fl = !!fl; ref.temp.classList.toggle("flash", !!fl); }
        const ink = !!pool && this._bright(pool.rgb, +lop);
        if (o.ink !== ink) { o.ink = ink; ref.lbl.classList.toggle("ink", ink); }
        const here = this._here && ref.lbl.getAttribute("data-room") === this._here.room ? this._here.text : "";
        if (o.here !== here) { o.here = here; if (ref.here) ref.here.textContent = here; ref.lbl.classList.toggle("mark", !!here); }
        const ck = (s.win === "open" ? "w" : s.win === "tilted" ? "k" : "") + (s.shade ? "s" : "") + (s.music ? "m" : "");
        if (o.ck !== ck) { o.ck = ck; ref.chips.innerHTML = ck.split("").map((c) => this._chips[c]).join(""); }
      }
    });
    if (this._siteMode) this._summaries();
    (this._orefs || []).forEach((r) => {  // open windows, doors and gates light up, an unlocked lock shows red
      const cls = "os" + this._opState(r.o.ents, r.o);
      if (r.cls !== cls && r.g) { r.cls = cls; r.g.setAttribute("class", cls); }
      if (r.sh) this._shade(r);
    });
  }

  /* Roller shutter or blind in front of a window, seen from above: a faint track over the whole width, a bar for the
     closed part (current_position 0 = closed). Blinds that report a tilt show slats instead, turned by the tilt:
     along the wall when shut, across it when open. Moving shades pulse. */
  _shade(r) {
    const o = r.o, s = !this._hidden(o.shade) && this._hass.states[o.shade], a = (s && s.attributes) || {};
    const pos = typeof a.current_position === "number" ? a.current_position : s && s.state === "closed" ? 0 : 100;
    const tilt = typeof a.current_tilt_position === "number" ? a.current_tilt_position : null;
    const key = s ? `${s.state}|${pos}|${tilt}` : "";
    if (r.sk === key) return;
    r.sk = key;
    r.sh.setAttribute("class", "shd" + (s && (s.state === "opening" || s.state === "closing") ? " moving" : ""));
    if (!s) { r.sh.innerHTML = ""; return; }
    const ang = o.angle * Math.PI / 180, ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy * o.out, ny = ux * o.out;
    const w = (o.width || 0.9) / 2, d = (o.depth || 0.24) / 2 + 0.1, cx = o.at[0] + nx * d, cy = o.at[1] + ny * d;
    const P = (t, k) => [cx + ux * t + nx * (k || 0), cy + uy * t + ny * (k || 0)];
    const L = (p, q, cls) => `<line class="${cls}" x1="${p[0].toFixed(3)}" y1="${p[1].toFixed(3)}" x2="${q[0].toFixed(3)}" y2="${q[1].toFixed(3)}"/>`;
    const shut = Math.max(0, Math.min(1, 1 - pos / 100)), end = -w + 2 * w * shut;
    let html = L(P(-w), P(w), "trk");
    if (shut > 0.01 && tilt === null) html += L(P(-w), P(end), "bar");
    else if (shut > 0.01) {
      const th = (tilt / 100) * Math.PI / 2, c = Math.cos(th) * 0.07, k = Math.sin(th) * 0.07;
      for (let t = -w + 0.06; t <= end - 0.02; t += 0.12) html += L(P(t - c, -k), P(t + c, k), "sl");
    }
    r.sh.innerHTML = html;
  }

  _opState(ents, o) {
    let open = false, tilted = false, unlocked = false;
    const want = o && o.tilt_value ? [String(o.tilt_value).toLowerCase()] : TILTED;
    const isTilt = (v) => typeof v === "string" && want.indexOf(v.toLowerCase()) >= 0;
    const st = this._hass.states, contact = ents.some((id) => /^(binary_sensor|sensor)\./.test(id) && st[id]);
    ents.forEach((id) => {
      const s = !this._hidden(id) && st[id];
      if (!s) return;
      const d = id.split(".")[0], v = s.state, dc = s.attributes.device_class;
      // a raised shutter or blind is no open window; a cover counts as window/gate/door, or when there is no contact
      if (d === "cover" && (["shutter", "blind", "awning", "curtain", "shade"].indexOf(dc) >= 0 || (contact && ["window", "garage", "door", "gate"].indexOf(dc) < 0))) return;
      if (d === "binary_sensor" || d === "sensor" || d === "cover") {
        let w = winState(s);
        if (o && o.tilt_attribute) {  // tilted from a chosen attribute (e.g. zustand = gekippt)
          if (isTilt(s.attributes[o.tilt_attribute])) w = "tilted"; else if (w === "tilted") w = "open";
        }
        if (w === "open") open = true; else if (w === "tilted") tilted = true;
        if (lockAttr(s) === "unlocked") unlocked = true;
      }
      if (d === "lock" && (v === "open" || v === "opening")) open = true;
      if (d === "lock" && (v === "unlocked" || v === "unlocking")) unlocked = true;
    });
    const te = o && o.tilt_entity && !this._hidden(o.tilt_entity) && st[o.tilt_entity];
    if (te) {  // own entity for "tilted": a binary sensor that is on, or a state / attribute with the tilt value
      const on = o.tilt_entity.indexOf("binary_sensor.") === 0 ? te.state === "on"
        : isTilt(te.state) || (o.tilt_attribute ? isTilt(te.attributes[o.tilt_attribute]) : false);
      if (on && !open) tilted = true;
      if (on && open) { open = false; tilted = true; }  // the contact reports "open" while the window is only tilted
    }
    return open ? " open" : tilted ? " tilted" : unlocked ? " unlocked" : "";
  }

  /* Tap on a window, door or gate: windows (and pure sensors) open the entity's dialog, doors and gates ask first. */
  _opTap(o) {
    if (this._config.tap === "none" || !this._hass) return;
    const st = this._hass.states, ents = o.ents.filter((id) => !this._hidden(id) && st[id]);
    const shade = o.shade && !this._hidden(o.shade) && st[o.shade] ? o.shade : "";
    if (!ents.length) { if (shade) this._moreInfo(shade); return; }
    const ctl = o.tap === "info" ? null : ents.filter((id) => /^(lock|cover|button|switch)\./.test(id))[0];
    if (!ctl) return this._moreInfo(shade || ents[0]);  // a window with only a contact: its shade is what can be operated
    const t = this._t, s = st[ctl], d = ctl.split(".")[0], v = s.state, acts = [];  // acts[0] is what a tap means
    if (d === "lock") {
      acts.push(v === "locked" || v === "locking" ? [t.unlock, "unlock"] : [t.lock, "lock"]);
      if ((s.attributes.supported_features || 0) & 1) acts.push([t.openDoor, "open"]);
    } else if (d === "cover") {
      if (v === "opening" || v === "closing") acts.push([t.stop, "stop_cover"]);
      acts.push(v === "open" || v === "opening" ? [t.close, "close_cover"] : [t.open, "open_cover"]);
    } else acts.push(d === "button" ? [t.press, "press"] : [t.toggle, "toggle"]);
    const ask = o.confirm !== undefined ? o.confirm : o.type === "door" || o.type === "garage";
    if (!ask) return this._hass.callService(d, acts[0][1], { entity_id: ctl });
    this._confirm(s.attributes.friendly_name || ctl, o.confirm_text || acts[0][0] + "?", acts, ctl);
  }

  _moreInfo(id) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: id }, bubbles: true, composed: true }));
  }

  _confirm(title, text, acts, id) {  // small dialog inside the card – opening a door or gate needs a second tap
    const card = this.shadowRoot.querySelector("ha-card"), t = this._t;
    if (!card) return;
    const old = card.querySelector(".cfm");
    if (old) old.remove();
    const box = document.createElement("div");
    box.className = "cfm";
    box.innerHTML = `<div class="cbox"><div class="ctit">${esc(title)}</div><p>${esc(text)}</p><div class="cbtn"><button data-a="x">${esc(t.cancel)}</button>` +
      `<button data-a="i">${esc(t.details)}</button>` + acts.map((a, i) => `<button class="go" data-a="${i}">${esc(a[0])}</button>`).join("") + `</div></div>`;
    const done = () => { box.remove(); clearTimeout(this._cfmT); };
    box.addEventListener("click", (e) => {
      const a = e.target.getAttribute && e.target.getAttribute("data-a");
      if (e.target === box || a === "x") return done();
      if (a === "i") { done(); return this._moreInfo(id); }
      if (a !== null && a !== undefined && acts[+a]) { done(); this._hass.callService(id.split(".")[0], acts[+a][1], { entity_id: id }); }
    });
    card.appendChild(box);
    this._cfmT = setTimeout(done, 15000);  // a forgotten question goes away on its own
    const go = box.querySelector(".go");
    if (go) go.focus();
  }

  // How bright does the room centre get? (screen blend of the light over the floor, roughly Rec. 709)
  _bright(rgb, a) {
    const f = [0.13, 0.17, 0.27], c = rgb.split(",").map((x) => +x / 255);
    const r = c.map((v, i) => f[i] + a * v * (1 - f[i]));
    return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2] > 0.62;
  }

  /* ---------- Operation ---------- */
  _click(el, e) {  // touch → multi-tap logic, mouse/remote → pop-up right away
    if (this._siteMode && this._view === "site" && el.getAttribute("data-bld")) { this._zoomIn(el.getAttribute("data-bld")); return; }
    if (e && e.pointerType === "touch") { this._multi(el); return; }
    this._tap(el);
  }

  _multi(el) {  // touch only – count taps per room, evaluate 300 ms after the last one
    const id = el.getAttribute("data-room");
    clearTimeout(this._ckT);
    if (this._ckRoom !== id) this._ckN = 0;
    this._ckRoom = id;
    this._ckN = (this._ckN || 0) + 1;
    el.classList.add("pressed");
    setTimeout(() => el.classList.remove("pressed"), 280);
    this._ckT = setTimeout(() => {
      const n = this._ckN;
      this._ckN = 0; this._ckRoom = null;
      if (n <= 1) { this._open(id); return; }  // single tap: pop-up
      this._send(id, n === 2 ? "tipp2" : "tipp3");
    }, 300);
  }

  _tap(el) {
    el.classList.add("pressed");
    setTimeout(() => el.classList.remove("pressed"), 280);
    this._open(el.getAttribute("data-room"));
  }

  _open(id) {
    if (!id || this._config.tap === "none") return;
    history.pushState(null, "", `#${id}`);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
  }

  /* Remote keys over a room (media keys, or the TV Streamer's tv-streamer-key event). */
  _remote(aktion) {
    if (!aktion || !this._hover || !this._hass || !this._config || this._config.tap === "none") return false;
    if (popupOpen()) return false;  // a pop-up is open
    this._press(this._hover, aktion);
    return true;
  }

  /* A key pressed once or twice: keys the script has an action for „twice“ wait for a second press (the script's
     waiting time) and then send <key>2 – or the key itself when none came. All other keys go out at once. */
  _press(room, ev) {
    if (!room || !ev) return;
    const d = this._double(), p = this._pend;
    if (p && p.ev === ev && p.room === room) { clearTimeout(p.t); this._pend = null; this._send(room, ev + "2"); return; }
    if (p) { clearTimeout(p.t); this._pend = null; this._send(p.room, p.ev); }  // another key: the waiting one goes now
    if (d.keys.indexOf(ev) < 0) { this._send(room, ev); return; }
    this._pend = { room: room, ev: ev, t: setTimeout(() => { this._pend = null; this._send(room, ev); }, d.ms) };
  }

  /* Which keys use „twice“, and how long to wait: asked from the script (aktion: config, answered by the Floorplan
     Lite blueprint – recognised by its field „lichter“), at most once a minute. Otherwise right click / yellow only. */
  _double() {
    const sc = this._scriptName(), c = DOUBLE[sc] || (DOUBLE[sc] = { at: 0 }), h = this._hass;
    const svc = h && h.services && h.services.script && h.services.script[sc];
    if (svc && svc.fields && svc.fields.lichter && !c.busy && Date.now() - c.at > 60000) {
      c.busy = true;
      h.callWS({ type: "call_service", domain: "script", service: sc, service_data: { aktion: "config" }, return_response: true })
        .then((r) => {
          const a = r && r.response;
          if (a && Array.isArray(a.double)) { c.keys = a.double; c.ms = Math.max(150, Math.min(1500, +a.ms || 400)); }
        })
        .catch(() => { /* older script: keep the default */ })
        .then(() => { c.busy = false; c.at = Date.now(); });
    }
    return c.keys ? c : { keys: ["gelb"], ms: 500 };
  }

  _scriptName() { return String(this._config.script || "raum_klick").replace(/^script\./, ""); }

  /* Every key, click, wheel step and tap over a room goes to the script (option script, default script.raum_klick) as
     {raum, aktion} – the script decides what happens. Without the script only play / pause work, on the room's players. */
  _send(room, aktion) {
    if (!room || !aktion || !this._hass) return false;
    const sc = this._scriptName(), svc = this._hass.services || {};
    if (aktion !== "pause" && aktion !== "stop") this._flashStart(room, aktion === "lauter" || aktion === "leiser" || aktion === "play" ? "vol" : "scene");
    const st = this._hass.states, r = this._roomEnts(this._keyOf(room)), ok = (id) => !!st[id] && !this._hidden(id);
    const players = (r.musik || []).filter(ok);
    if (svc.script && svc.script[sc]) {  // with the room's lights and players from the plan, so the script needs no guessing
      const pr = (this._info || {})[room];
      const lights = (r.licht || []).concat(r.hauptlicht && (r.licht || []).indexOf(r.hauptlicht) < 0 ? [r.hauptlicht] : []).filter(ok);
      this._hass.callService("script", sc, { raum: (pr && pr.area) || room, aktion: aktion, lichter: lights, player: players });
      return true;
    }
    if (aktion !== "play" && aktion !== "pause") return false;
    const playing = players.filter((id) => st[id].state === "playing");
    const target = aktion === "pause" ? playing : playing.length ? playing : players.slice(0, 1);
    if (target.length) this._hass.callService("media_player", aktion === "pause" ? "media_pause" : "media_play", { entity_id: target });
    return true;
  }

  _keyOf(room) {  // entity set of a room (several polygons can share one)
    const ref = (this._refs || []).filter((r) => r.lbl && r.lbl.getAttribute("data-room") === room)[0];
    return ref ? ref.key : room;
  }

  /* Short display in the room label instead of the temperature (3 s): the volume after louder / quieter / play while
     music plays, the scene's name after a scene was switched (a scene's state is the time it was last activated). */
  _flashStart(room, kind) {
    const f = this._flash, st = this._hass.states, scenes = {};
    if (f && f.room === room && f.kind === kind) { f.until = Math.max(f.until, Date.now() + 3000); return; }
    if (kind === "scene") Object.keys(st).forEach((id) => { if (id.indexOf("scene.") === 0) scenes[id] = st[id].state; });
    this._flash = { room: room, key: this._keyOf(room), kind: kind, scenes: scenes, text: "", until: Date.now() + 5000 };
    this._flashLater(5000);
  }

  _flashLater(ms) {
    clearTimeout(this._flashT);
    this._flashT = setTimeout(() => { this._sig = null; if (this._hass) this.hass = this._hass; }, ms + 50);
  }

  _flashText() {
    const f = this._flash;
    if (!f || !this._hass) return "";
    if (Date.now() > f.until) { this._flash = null; return ""; }
    const st = this._hass.states;
    let text = "";
    if (f.kind === "vol") {
      const vol = (this._roomEnts(f.key).musik || []).filter((id) => st[id] && !this._hidden(id) && st[id].state === "playing")
        .map((id) => st[id].attributes.volume_level).filter((v) => typeof v === "number");
      if (vol.length) text = "\u266a " + Math.round(vol[0] * 100) + " %";
    } else {
      let best = "";
      Object.keys(st).forEach((id) => {
        if (id.indexOf("scene.") === 0 && st[id].state !== f.scenes[id] && (!best || st[id].state > st[best].state)) best = id;
      });
      if (best) text = sceneLabel(st[best].attributes.friendly_name || best, this._roomName(f.room));
    }
    if (text && text !== f.text) { f.text = text; f.until = Date.now() + 3000; this._flashLater(3000); }
    return text;
  }

  _roomName(id) {
    const r = (this._info || {})[id];
    return (r && r.name) || "";
  }

  _visible() {
    const r = this.getBoundingClientRect();
    return !!(r.width && r.height && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth);
  }

  _keyMine() {  // the card under the pointer, else the first visible one – several cards (and other cards) on one page
    if (this._over) return true;
    const live = CARDS.filter((c) => c.isConnected && c._config && c._refs);
    if (live.some((c) => c._over)) return false;
    const first = live.filter((c) => c._visible())[0];
    return first === this;
  }

  _key(e) {  // ← / → change the level; ↑ / ↓ over a room switch light scenes; media keys over a room: its music
    if (!this._config || !this._refs) return;
    if (e.defaultPrevented && !this._over) return;  // another card took it – unless the pointer is over this one
    if (MEDIA_KEYS[e.key] && this._remote(MEDIA_KEYS[e.key])) { e.preventDefault(); return; }
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const v = e.key === "ArrowUp" || e.keyCode === 38 ? "hoch" : e.key === "ArrowDown" || e.keyCode === 40 ? "runter" : "";
    if (v && this._hover && !popupOpen()) {
      e.preventDefault();
      if (!e.repeat) this._press(this._hover, v);
      return;
    }
    const lr = e.key === "ArrowLeft" || e.keyCode === 37 ? -1 : e.key === "ArrowRight" || e.keyCode === 39 ? 1 : 0;
    if (this._siteMode && (v || lr)) {  // site: ↑ / ↓ (not over a room) zoom in / out, ← / → change the level
      if (this._typing(e) || !this._visible() || !this._keyMine()) return;
      e.preventDefault();
      if (e.repeat) return;
      if (v === "hoch") this._zoomIn(this._view === "site" ? this._hoverBld : null);
      else if (v === "runter") this._zoomOut();
      else this._stepFloor(lr);
      return;
    }
    // ↑ / ↓ do not scroll the page – the wheel does (option scroll_keys: true for remotes without a wheel)
    if (v && this._config.scroll_keys !== true && !this._typing(e) && this._visible()) { e.preventDefault(); return; }
    if (this._config.mode !== "swipe" || !this._track) return;
    const d = e.key === "ArrowLeft" || e.keyCode === 37 ? -1 : e.key === "ArrowRight" || e.keyCode === 39 ? 1 : 0;
    if (!d) return;
    if (popupOpen()) return;  // room pop-up open
    if (this._typing(e)) return;
    if (!this._visible() || !this._keyMine()) return;
    e.preventDefault();
    this._go(this._idx + d);
  }

  /* ---------- Site: views and zoom ---------- */
  _buildSite() {
    const root = this.shadowRoot, cfg = this._config, t = this._t, d = this._site;
    const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const intro = !reduce && cfg.intro !== false;
    this._reduce = reduce;
    this._chips = chips(t);
    const CHIP = this._chips;
    const views = this._fl.map((k) => `<div class="view" data-v="${esc(k)}" hidden>${this._floorHtml(k, false, intro, true)}</div>`).join("");
    const seg = this._single ? "" : `<div class="segs" role="tablist"><button class="sg" data-go="site" role="tab">${esc(t.site)}</button>` +
      d.blds.map((b) => `<button class="sg" data-go="${esc(b.id)}" role="tab">${esc(b.name)}</button>`).join("") + `</div>`;
    const legend = `<div class="legend">` +
      `<span><i class="lg p"></i>${t.presence}</span><span><i class="lg m"></i>${t.motion}</span><span><i class="lg l"></i>${t.light}</span>` +
      `<span>${CHIP.w}${t.win}</span><span>${CHIP.s}${t.shade}</span><span>${CHIP.m}${t.musicL}</span></div>`;
    root.innerHTML = `<style>${FloorplanLiteCard.styles}${this._styleVars()}</style>` +
      `<ha-card class="night site${intro ? " intro" : ""}"><div class="bar"><div class="lb"></div><div class="mid">${seg}</div><div class="rb"></div></div>` +
      `<div class="ftabs" role="tablist"></div><div class="views">${views}</div>${legend}<div class="toast" role="status"></div></ha-card>`;
    this._wire(root);
    this._track = null;
    root.querySelectorAll(".bhit, .bsum").forEach((el) => {
      const id = el.getAttribute("data-bld");
      el.addEventListener("click", () => this._zoomIn(id));
      el.addEventListener("pointerenter", () => { this._hoverBld = id; });
      el.addEventListener("pointerleave", () => { if (this._hoverBld === id) this._hoverBld = null; });
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.keyCode === 13) { e.preventDefault(); this._zoomIn(id); } });
    });
    root.querySelectorAll(".sg").forEach((b) => b.addEventListener("click", () => {
      const g = b.getAttribute("data-go");
      if (g === "site") this._zoomOut(); else this._zoomIn(g);
    }));
    const box = root.querySelector(".views");
    box.addEventListener("wheel", (e) => {  // Ctrl+wheel: out to the site / into the building under the pointer
      if (!e.ctrlKey) return;
      e.preventDefault();
      const now = Date.now();
      if (this._zoomT && now - this._zoomT < 450) return;
      this._zoomT = now;
      if (e.deltaY > 0) this._zoomOut(); else if (this._view === "site") this._zoomIn(this._hoverBld);
    }, { passive: false });
    this._pinch(box);
    clearTimeout(this._introT);
    if (intro) {
      this._introT = setTimeout(() => {
        root.querySelectorAll(".outline").forEach((o) => { o.style.strokeDasharray = ""; o.style.strokeDashoffset = ""; });
        const card = root.querySelector("ha-card");
        if (card) card.classList.remove("intro");
      }, 2900);
    }
    this._lastW = 0;
    this._view = null;
    this._applyStart("entry");
    requestAnimationFrame(() => this._resized());
  }

  _show(v, o) {
    o = o || {};
    const root = this.shadowRoot;
    if (!root || !this._floors || !this._floors[v]) return;
    const prev = this._view;
    if (o.manual) this._holdUntil = Date.now() + this._hold();
    const bld = v === "site" ? null : v.split(":")[0];
    if (bld) { this._lastFloor[bld] = v; this._lastBld = bld; }
    if (!o.fromHash) this._setHash(v, !!o.push);
    if (prev === v) { this._chrome(); return; }
    this._view = v;
    const el = (k) => root.querySelector(`.view[data-v="${k}"]`);
    const to = el(v), from = prev ? el(prev) : null;
    const swap = () => {
      root.querySelectorAll(".view").forEach((x) => { x.hidden = x !== to; x.classList.remove("fadein"); });
      this._fit();
    };
    if (!o.anim || this._reduce || !from) swap();
    else if (prev === "site" && bld) {  // into a building: the site zooms towards it, then the building fades in
      this._zoomEl(from.querySelector(".plan"), this._bldRect(bld), true, () => { swap(); to.classList.add("fadein"); });
    } else if (v === "site") {           // out: the site starts zoomed on the building and opens up
      swap();
      this._zoomEl(to.querySelector(".plan"), this._bldRect(prev.split(":")[0]), false);
    } else { swap(); to.classList.add("fadein"); }
    this._chrome();
  }

  _bldRect(id) {  // the building's frame in the site view, as fractions of the view
    const b = this._site.blds.filter((x) => x.id === id)[0], f = this._floors.site;
    if (!b || !f) return [0, 0, 1, 1];
    const v = f.view, x = b.box;
    return [(x[0] - v[0]) / v[2], (x[1] - v[1]) / v[3], (x[2] - x[0]) / v[2], (x[3] - x[1]) / v[3]];
  }

  _zoomEl(pl, r, inward, done) {  // zoom the view towards (inward) or out of the rectangle r – transform only, no redraw
    if (!pl) { if (done) done(); return; }
    const W = pl.clientWidth, H = pl.clientHeight;
    const k = Math.min(1 / Math.max(r[2], 0.05), 1 / Math.max(r[3], 0.05)) * 0.9;
    const tx = W / 2 - (r[0] + r[2] / 2) * W * k, ty = H / 2 - (r[1] + r[3] / 2) * H * k;
    const zoomed = `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${k.toFixed(3)})`;
    pl.style.transformOrigin = "0 0";
    pl.style.transition = "none";
    pl.style.transform = inward ? "none" : zoomed;
    pl.style.opacity = inward ? "1" : ".3";
    void pl.offsetWidth;
    pl.style.transition = "transform .34s ease, opacity .34s ease";
    pl.style.transform = inward ? zoomed : "none";
    pl.style.opacity = inward ? ".15" : "1";
    setTimeout(() => { pl.style.transition = ""; pl.style.transform = ""; pl.style.opacity = ""; if (done) done(); }, 350);
  }

  _zoomIn(id) {
    const d = this._site;
    if (!d || !d.blds.length) return;
    const b = d.blds.filter((x) => x.id === id)[0] || d.blds.filter((x) => x.id === this._lastBld)[0] || d.blds[0];
    if (this._view && this._view !== "site" && this._view.split(":")[0] === b.id) return;
    this._show(this._lastFloor[b.id] || b.siteLevel, { anim: true, manual: true, push: this._view === "site" });
  }

  _zoomOut() {
    if (this._single || !this._view || this._view === "site") return;
    if (this._pushed && /[#&]plan=/.test(location.hash)) { this._pushed = false; history.back(); return; }  // Back shows the site
    this._show("site", { anim: true, manual: true });
  }

  _stepFloor(dir) {
    if (!this._view || this._view === "site") return;
    const b = this._site.blds.filter((x) => x.id === this._view.split(":")[0])[0];
    if (!b || b.levels.length < 2) return;
    const i = b.levels.indexOf(this._view);
    this._show(b.levels[(i + dir + b.levels.length) % b.levels.length], { anim: true, manual: true });
  }

  _setHash(v, push) {  // the view in the address: #plan=<plan>&floor=<level> (none on the site)
    if (this._single || popupOpen()) return;
    const h = v === "site" ? "" : "#plan=" + encodeURIComponent(v.split(":")[0]) + "&floor=" + encodeURIComponent(v.split(":")[1]);
    if (location.hash === h || (!h && location.hash.length < 2)) return;
    const url = location.pathname + location.search + h;
    try {
      if (push) { history.pushState(history.state, "", url); this._pushed = true; } else history.replaceState(history.state, "", url);
    } catch (e) { /* not allowed here */ }
  }

  _hashState() {
    const out = {};
    location.hash.replace(/^#/, "").split("&").forEach((x) => {
      const i = x.indexOf("=");
      if (i > 0) { try { out[x.slice(0, i)] = decodeURIComponent(x.slice(i + 1)); } catch (e) { out[x.slice(0, i)] = x.slice(i + 1); } }
    });
    return out;
  }

  _hashChanged() {  // Back / Forward, or a link with #plan=… / #raum=… / #ansicht=…
    if (!this._siteMode || !this._refs || popupOpen()) return;
    const q = this._hashState();
    if (q.raum || q.ansicht) { this._applyStart("entry"); return; }
    let v = null;
    if (q.plan) v = this._floors[q.plan + ":" + q.floor] ? q.plan + ":" + q.floor : this._lastFloor[q.plan];
    else if (!this._single) v = "site";
    if (v && v !== this._view) { this._pushed = false; this._show(v, { anim: true, manual: true, fromHash: true }); }
  }

  _pinch(el) {  // two fingers together: out to the site; apart over a building: into it
    const P = {};
    let d0 = 0, done = false;
    const ids = () => Object.keys(P);
    const dist = () => { const k = ids(); if (k.length < 2) return 0; const a = P[k[0]], b = P[k[1]]; return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])); };
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch") return;
      P[e.pointerId] = [e.clientX, e.clientY];
      if (ids().length === 2) { d0 = dist(); done = false; }
    });
    el.addEventListener("pointermove", (e) => {
      if (!P[e.pointerId]) return;
      P[e.pointerId] = [e.clientX, e.clientY];
      if (ids().length !== 2 || done || !d0) return;
      const r = dist() / d0;
      if (r < 0.7) { done = true; this._zoomOut(); }
      else if (r > 1.4 && this._view === "site") {
        done = true;
        const k = ids(), mx = (P[k[0]][0] + P[k[1]][0]) / 2, my = (P[k[0]][1] + P[k[1]][1]) / 2;
        const hit = this.shadowRoot.elementFromPoint ? this.shadowRoot.elementFromPoint(mx, my) : null;
        this._zoomIn(hit && hit.getAttribute ? hit.getAttribute("data-bld") : null);
      }
    });
    const up = (e) => { delete P[e.pointerId]; if (ids().length < 2) d0 = 0; };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  /* Bar: site / buildings, the building's levels, own buttons (left), zoom out and off (right). */
  _chrome() {
    const root = this.shadowRoot, t = this._t, cfg = this._config, d = this._site, v = this._view;
    if (!root || !d || !v) return;
    const bld = v !== "site" ? v.split(":")[0] : null, b = bld ? d.blds.filter((x) => x.id === bld)[0] : null;
    root.querySelectorAll(".sg").forEach((x) => {
      const on = x.getAttribute("data-go") === (bld || "site");
      x.classList.toggle("on", on); x.setAttribute("aria-selected", on ? "true" : "false");
    });
    const ft = root.querySelector(".ftabs");
    ft.innerHTML = b && b.titles.length > 1 ? b.titles.map((x) => `<button class="tab${x.key === v ? " on" : ""}" role="tab" data-f="${esc(x.key)}">` +
      `<span class="l">${esc(x.name)}</span><span class="s">${esc(x.short)}</span></button>`).join("") : "";
    ft.querySelectorAll(".tab").forEach((x) => x.addEventListener("click", () => this._show(x.getAttribute("data-f"), { anim: true, manual: true })));
    const level = bld || "site";
    const btns = listOf(cfg.buttons && cfg.buttons[level]);
    const lb = root.querySelector(".lb");
    lb.innerHTML = btns.map((x, i) => `<button class="fb" data-i="${i}" title="${esc(x.name || "")}">` +
      (x.icon ? `<ha-icon icon="${esc(x.icon)}"></ha-icon>` : "") + `<span>${esc(x.name || "")}</span></button>`).join("");
    lb.querySelectorAll(".fb").forEach((x) => x.addEventListener("click", () => this._action(btns[+x.getAttribute("data-i")])));
    const rb = root.querySelector(".rb");
    const offOn = !(cfg.aus_schalter && cfg.aus_schalter[level] === false);
    rb.innerHTML = (bld && !this._single ? `<button class="zo" title="${esc(t.site)}">⤢ <span>${esc(t.site)}</span></button>` : "") +
      (offOn ? `<button class="off"><ha-icon icon="mdi:power"></ha-icon><span>${esc(bld ? t.bOff.replace("%s", b ? b.name : bld) : t.allOff)}</span></button>` : "") +
      this._rose(this._floors && this._floors[v], true);
    const zo = rb.querySelector(".zo");
    if (zo) zo.addEventListener("click", () => this._zoomOut());
    const off = rb.querySelector(".off");
    if (off) off.addEventListener("click", () => this._off(level, off));
    this._offArm = 0;
  }

  _action(b) {  // own button: the standard HA actions (navigate, url, more-info, perform-action …)
    if (!b) return;
    const conf = Object.assign({}, b);
    if (!conf.tap_action) conf.tap_action = { action: "none" };
    this.dispatchEvent(new CustomEvent("hass-action", { bubbles: true, composed: true, detail: { config: conf, action: "tap" } }));
  }

  /* Off: lights and music of every room (site) or of the building – only what is on or playing. Twice within 3 s. */
  _off(level, btn) {
    const t = this._t, now = Date.now(), label = btn.querySelector("span");
    if (!this._offArm || now > this._offArm) {
      this._offArm = now + 3000;
      const old = label.textContent;
      btn.classList.add("arm");
      label.textContent = t.really;
      clearTimeout(this._offT);
      this._offT = setTimeout(() => { this._offArm = 0; btn.classList.remove("arm"); label.textContent = old; }, 3000);
      return;
    }
    this._offArm = 0;
    clearTimeout(this._offT);
    const st = this._hass.states, cfg = this._config;
    const keys = Object.keys(Object.assign({}, this._live || {}, this._rooms || {})).filter((k) =>
      level === "site" || k.indexOf(level + "/") === 0 || (cfg.aus_mit_aussen === true && k.indexOf("site/") === 0));
    const lights = [], players = [];
    keys.forEach((k) => {
      const r = this._roomEnts(k);
      listOf(r.licht).concat(r.hauptlicht ? [r.hauptlicht] : []).forEach((id) => {
        const s = st[id];
        if (s && s.state === "on" && !this._hidden(id) && lights.indexOf(id) < 0) lights.push(id);
      });
      listOf(r.musik).forEach((id) => {
        const s = st[id];
        if (s && s.state === "playing" && !this._hidden(id) && players.indexOf(id) < 0) players.push(id);
      });
    });
    const ls = lights.filter((id) => id.indexOf("light.") === 0), other = lights.filter((id) => id.indexOf("light.") !== 0);
    if (ls.length) this._hass.callService("light", "turn_off", { entity_id: ls });
    if (other.length) this._hass.callService("homeassistant", "turn_off", { entity_id: other });
    const m = cfg.musik_aus === "stop" ? "media_stop" : cfg.musik_aus === "off" ? "turn_off" : "media_pause";
    if (players.length) this._hass.callService("media_player", m, { entity_id: players });
    this._toast(t.offDone.replace("%n", lights.length + players.length));
    this._chrome();
  }

  _toast(text) {
    const el = this.shadowRoot && this.shadowRoot.querySelector(".toast");
    if (!el) return;
    el.textContent = text;
    el.classList.add("on");
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => el.classList.remove("on"), 2600);
  }

  _summaries() {  // site: per building lights on, windows open, music
    const d = this._site, root = this.shadowRoot;
    if (!d || !root || !this._hass) return;
    const st = this._hass.states, keys = Object.keys(Object.assign({}, this._live || {}, this._rooms || {}));
    d.blds.forEach((b) => {
      const el = root.querySelector(`.bsum[data-bld="${b.id}"] .bs`);
      if (!el) return;
      const L = {}, W = {};
      let M = false;
      keys.forEach((k) => {
        if (k.indexOf(b.id + "/") !== 0) return;
        const r = this._roomEnts(k);
        listOf(r.licht).concat(r.hauptlicht ? [r.hauptlicht] : []).forEach((id) => { const s = st[id]; if (s && s.state === "on" && !this._hidden(id)) L[id] = 1; });
        listOf(r.fenster).forEach((id) => { const s = st[id]; if (s && !this._hidden(id) && winState(s)) W[id] = 1; });
        listOf(r.musik).forEach((id) => { const s = st[id]; if (s && s.state === "playing" && !this._hidden(id)) M = true; });
      });
      const nl = Object.keys(L).length, nw = Object.keys(W).length;
      const html = (nl ? `<span class="sm"><ha-icon icon="mdi:lightbulb-on"></ha-icon>${nl}</span>` : "") +
        (nw ? `<span class="sm w"><ha-icon icon="mdi:window-open"></ha-icon>${nw}</span>` : "") +
        (M ? `<span class="sm m"><ha-icon icon="mdi:music"></ha-icon></span>` : "");
      if (el.getAttribute("data-h") !== html) { el.setAttribute("data-h", html); el.innerHTML = html; }
    });
  }

  /* ---------- Site: start view and following the location ---------- */
  _hold() { return (typeof this._config.follow_hold === "number" ? this._config.follow_hold : 120) * 1000; }

  _streamerName() { return window.__tvStreamer && window.__tvStreamer.name ? String(window.__tvStreamer.name) : ""; }

  _geraet() {  // device name: TV Streamer (TV_NAME), else once set with ?geraet=… on this device
    let v = this._streamerName();
    if (!v) { try { v = localStorage.getItem("floorplan_geraet") || ""; } catch (e) { v = ""; } }
    return v;
  }

  _params() {  // ?raum= / ?ansicht= / ?geraet= in the address (also #raum=… / #ansicht=…)
    const out = {}, h = this._hashState();
    let q = null;
    try { q = new URLSearchParams(location.search); } catch (e) { q = null; }
    ["raum", "ansicht", "geraet"].forEach((k) => { const v = (q && q.get(k)) || h[k]; if (v) out[k] = v; });
    if (out.geraet) { try { localStorage.setItem("floorplan_geraet", out.geraet); } catch (e) { /* private mode */ } }
    return out;
  }

  _followEntry() {  // this user's entry in follow: by user name or id
    const f = this._config.follow, u = this._hass && this._hass.user;
    if (!f || !u) return null;
    const same = (x) => x && (x === u.id || String(x).toLowerCase() === String(u.name || "").toLowerCase());
    if (Array.isArray(f)) return f.filter((e) => e && same(e.user))[0] || null;
    const k = Object.keys(f).filter(same)[0];
    return k ? f[k] : null;
  }

  _followIds() {
    if (!this._siteMode || !this._hass) return [];
    const f = this._followEntry();
    if (!f || f.art === "fest" || f.art === "fixed") return [];
    return listOf(f.geofence).concat(listOf(f.ble), listOf(f.ble_letzter));
  }

  _standort(f) {  // geofence → current Bluetooth area → last area (if recent) → site
    const st = this._hass.states;
    if (f.geofence) { const g = st[f.geofence]; if (!g || (g.state !== "home" && g.state !== "on")) return { view: "site" }; }
    const ok = (x) => x && ["unknown", "unavailable", "", "none", "not_home", "away"].indexOf(String(x.state).toLowerCase()) < 0;
    const newest = (ids) => listOf(ids).map((id) => st[id]).filter(ok).sort((a, b) => (a.last_changed < b.last_changed ? 1 : -1))[0];
    const cur = newest(f.ble);
    let r = cur ? this._resolve(cur.state) : null;
    if (r) return r;
    const last = newest(f.ble_letzter);
    const age = last ? (Date.now() - Date.parse(last.last_changed)) / 60000 : Infinity;
    if (last && age <= (f.max_alter > 0 ? f.max_alter : 30)) { r = this._resolve(last.state); if (r) return r; }
    return { view: "site" };
  }

  /* A room id, an HA area (id or name, e.g. a Bermuda area), "<plan>[:<level>]" or "grundstueck" → {view, room} */
  _resolve(s) {
    if (s === undefined || s === null || s === "") return null;
    const str = String(s).trim(), low = str.toLowerCase(), d = this._site;
    if (low === "grundstueck" || low === "grundstück" || low === "site") return this._single ? null : { view: "site" };
    const parts = str.split(":"), b = d.blds.filter((x) => x.id === parts[0])[0];
    if (b) return { view: parts[1] && this._floors[b.id + ":" + parts[1]] ? b.id + ":" + parts[1] : this._lastFloor[b.id] || b.siteLevel };
    const areas = (this._hass && this._hass.areas) || {};
    let aid = null;
    Object.keys(areas).forEach((k) => { const a = areas[k]; if (k === str || (a && String(a.name || "").toLowerCase() === low)) aid = k; });
    const info = this._info || {};
    const hit = Object.keys(info).map((k) => info[k]).filter((i) => i && i.id &&
      (i.id === str || (i.area && (i.area === str || i.area === aid)) || String(i.name || "").toLowerCase() === low))[0];
    if (!hit) return null;
    if (hit.site) return { view: this._single || !this._floors.site ? hit.view : "site", room: hit.id };
    return { view: this._config.follow_floor === false ? this._lastFloor[hit.bld] || hit.view : hit.view, room: hit.id };
  }

  /* Start view: the address (?raum= / ?ansicht=) → the user's follow entry → start. reason: entry (view opened),
     update (location changed), tpl (template result) */
  _applyStart(reason) {
    if (!this._siteMode || !this._refs || !this._hass || !this._site) return;
    if (popupOpen() && this._view) return;
    const now = Date.now(), t = this._t, p = this._params(), f = this._followEntry();
    const dev = this._streamerName() ? t.thisTv : t.thisDevice;
    let goal = null, text = null;
    if (reason === "entry" && (p.raum || p.ansicht)) {
      goal = this._resolve(p.raum || p.ansicht);
      if (goal) { this._holdUntil = now + this._hold(); text = dev; }
    }
    if (!goal && f && (reason === "entry" || now >= (this._holdUntil || 0))) {
      if (f.art === "fest" || f.art === "fixed") {
        if (reason !== "update") {
          if (f.vorlage) this._tplStart(f);
          goal = this._resolve(f.vorlage ? this._tplResult : f.raum || f.ansicht);
          text = dev;
        }
      } else {
        goal = this._standort(f);
        text = t.here;
      }
    }
    if (!goal && reason === "entry") {
      goal = this._resolve(this._config.start);
      if (!goal) goal = { view: this._single ? this._lastFloor[this._single] : "site" };
    }
    if (!goal) return;
    this._here = goal.room ? { room: goal.room, text: text || t.here } : null;
    let v = goal.view;
    if (!this._floors[v]) v = this._view || this._fl[0];
    this._show(v, { anim: reason !== "entry" && !!this._view });
    if (this._hass) this._update();
  }

  _tplStart(f) {  // template of a fixed entry: render_template with benutzer and geraet
    const key = f.vorlage + "|" + this._geraet();
    if (this._tplKey === key || !this._hass || !this._hass.connection) return;
    this._tplStop();
    this._tplKey = key;
    const u = this._hass.user || {};
    this._hass.connection.subscribeMessage((m) => {
      const r = m && m.result !== undefined && m.result !== null ? String(m.result).trim() : "";
      if (r !== this._tplResult) { this._tplResult = r; this._applyStart("tpl"); }
    }, { type: "render_template", template: f.vorlage, variables: { benutzer: u.name || "", geraet: this._geraet() } })
      .then((un) => { if (this._tplKey === key) this._tplUnsub = un; else un(); })
      .catch(() => { /* template error: no start view from it */ });
  }

  _tplStop() {
    if (this._tplUnsub) { try { this._tplUnsub(); } catch (e) { /* gone */ } }
    this._tplUnsub = null;
    this._tplKey = null;
  }

  _typing(e) {  // keys meant for something else: a pop-up, a dialog, a text field, a slider or a list with focus
    if (popupOpen()) return true;
    const path = e && e.composedPath ? e.composedPath() : [];
    if (path.some((n) => n && n.localName && /dialog|popup|menu/.test(n.localName))) return true;
    let a = document.activeElement;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
    if (!a) return false;
    const role = a.getAttribute && a.getAttribute("role");
    return a.localName === "input" || a.localName === "textarea" || a.localName === "select" || !!a.isContentEditable ||
      role === "slider" || role === "listbox" || role === "menu" || role === "spinbutton";
  }

  _go(i) {
    const n = this._fl.length;
    this._idx = (i + n) % n;  // wraps around at the end
    const t = this._track;
    if (t) t.scrollTo({ left: this._idx * t.clientWidth, behavior: "smooth" });
  }

  _progress() {  // the tab marker follows the finger while swiping
    const t = this._track;
    if (!t || !t.clientWidth) return;
    const n = this._fl.length;
    const p = Math.max(0, Math.min(n - 1, t.scrollLeft / t.clientWidth));
    if (this._ind) this._ind.style.transform = `translateX(${(p * 100).toFixed(2)}%)`;
    const i = Math.round(p);
    if (i !== this._shown) {
      this._shown = i;
      this._tabs.forEach((b, j) => { b.classList.toggle("on", j === i); b.setAttribute("aria-selected", j === i ? "true" : "false"); });
    }
  }

  _settle() {  // without native snapping (Chrome < 69, webOS 5) move to the nearest level ourselves
    const t = this._track;
    if (!t || !t.clientWidth) return;
    const n = this._fl.length;
    const i = Math.max(0, Math.min(n - 1, Math.round(t.scrollLeft / t.clientWidth)));
    this._idx = i;
    if (!this._snap && Math.abs(t.scrollLeft - i * t.clientWidth) > 2) t.scrollTo({ left: i * t.clientWidth, behavior: "smooth" });
  }

  _align() {
    const t = this._track;
    if (!t || !t.clientWidth) return;
    t.scrollLeft = this._idx * t.clientWidth;
    this._progress();
  }

  _fit() {  // font size follows the scale of the plan (pixels per metre)
    const plans = this.shadowRoot ? this.shadowRoot.querySelectorAll(".plan") : [];
    for (let k = 0; k < plans.length; k++) {
      const plan = plans[k], f = this._floors[plan.getAttribute("data-f")], w = plan.clientWidth;
      if (!w || !f) continue;
      plan.style.fontSize = Math.max(11, Math.min(22, (w / f.view[2]) * 0.58)).toFixed(1) + "px";
    }
  }
}

FloorplanLiteCard.styles = `
  :host { display: block;
    --n-text: #eef2fb; --n-muted: rgba(205, 216, 240, .66); --n-wall: #4d5a7d; --n-edge: #8d9cc4;
    --c-presence: 143, 157, 255; --c-motion: 72, 226, 190;
    --c-window: #ff8d7e; --c-shade: #b9a8ff; --c-music: #f59ad6; }
  ha-card { display: block; }
  ha-card.night { position: relative; overflow: hidden; padding: 12px 12px 10px; color: var(--n-text);
    border: 1px solid rgba(255, 255, 255, .05);
    background-color: #131b30;
    background-image: radial-gradient(rgba(160, 182, 230, .075) 1px, transparent 1.6px),
      radial-gradient(ellipse at 50% 30%, #1e2946 0%, #141c32 58%, #0d1427 100%);
    background-size: 22px 22px, 100% 100%; }
  .msg { padding: 24px 12px; text-align: center; color: var(--n-muted); }

  /* Level selection */
  .top { display: flex; justify-content: center; margin: 2px 0 8px; }
  .seg { position: relative; display: flex; padding: 3px; border-radius: 999px; background: rgba(255, 255, 255, .05);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .07); }
  .ind { position: absolute; top: 3px; bottom: 3px; left: 3px; border-radius: 999px;
    background: linear-gradient(180deg, rgba(255, 255, 255, .18), rgba(255, 255, 255, .09));
    box-shadow: 0 4px 14px rgba(0, 0, 0, .3), inset 0 0 0 1px rgba(255, 255, 255, .12); will-change: transform; }
  .tab { position: relative; flex: 0 0 auto; width: 8.6em; font: inherit; font-size: .95em; font-weight: 500; letter-spacing: .015em;
    padding: 7px 0; border: 0; border-radius: 999px; background: transparent; color: var(--n-muted); cursor: pointer;
    white-space: nowrap; transition: color .3s; -webkit-tap-highlight-color: transparent; }
  .tab.on { color: var(--n-text); }
  .tab .s { display: none; }

  /* Swipe area */
  .wrap { position: relative; }
  .track { display: flex; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; scrollbar-width: none;
    -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }
  .track::-webkit-scrollbar { display: none; }
  .slide { flex: 0 0 100%; min-width: 0; overflow: hidden; scroll-snap-align: center; display: flex;
    justify-content: center; align-items: center; }  /* min-width 0: otherwise the page gets as wide as the plan (phone).
    All slides are as high as the highest level (flex row), flatter levels stay centred – the card does not jump while swiping. */
  .slide .plan { max-width: 100%; }
  .nav { position: absolute; top: 50%; margin-top: -22px; z-index: 5; width: 44px; height: 44px; padding: 0; border: 0;
    border-radius: 50%; background: rgba(255, 255, 255, .06); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08);
    color: rgba(236, 241, 252, .78); cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background .2s, color .2s; -webkit-tap-highlight-color: transparent; }
  .nav:hover { background: rgba(255, 255, 255, .14); color: #fff; }
  .nav.prev { left: 2px; } .nav.next { right: 2px; }
  .nav ha-icon { --mdc-icon-size: 28px; display: flex; }
  @media (pointer: coarse) { .nav { display: none; } }  /* touch: swipe instead of arrows; the Magic Remote is a fine pointer */

  /* Plan */
  .plan { position: relative; width: 100%; font-size: 14px; }
  .ratio { width: 100%; }
  .plan > svg, .fxs, .lbls { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  .plan > svg { overflow: visible; }
  .plan > svg.base, .plan > svg.hits { will-change: transform; }  /* own layers: highlighting does not redraw the plan */
  .fxs, .lbls { pointer-events: none; }
  .shadow { fill: rgba(2, 5, 14, .75); }
  .floor.outdoor { fill: rgba(255, 255, 255, .03); }
  .sp, .li, .ed { mix-blend-mode: screen; }
  .spill { fill-opacity: 0; transition: fill-opacity 1.2s ease; }
  .light { opacity: 0; transition: opacity 1.2s ease; }
  .light stop { transition: stop-color 1.2s ease; }
  .edge { fill: none; stroke-width: 1.1; opacity: 0; transition: opacity 1.2s ease; }
  .wa { fill: none; stroke: var(--n-wall); stroke-linejoin: miter; }      /* stroke-width per plan (wall_width) */
  .outline { fill: none; stroke: var(--n-wall); stroke-linejoin: miter; } /* stroke-width per plan (outer_width) */
  .rim { fill: none; stroke: var(--n-edge); stroke-width: .05; stroke-linejoin: miter; opacity: .55; }
  .extra { fill: none; stroke: var(--n-edge); stroke-width: .07; stroke-dasharray: .3 .22; opacity: .45; }
  .op line, .op path { fill: none; stroke-linecap: round; }
  .op .win { stroke: #9fd3ff; stroke-width: .09; opacity: .8; }
  .op .gar { stroke: var(--n-edge); stroke-width: .08; stroke-dasharray: .25 .18; opacity: .7; }
  .op .leaf { stroke: var(--n-edge); stroke-width: .06; opacity: .75; }
  .op .swing { stroke: var(--n-edge); stroke-width: .035; stroke-dasharray: .12 .1; opacity: .5; }
  .hit { fill: rgba(255, 255, 255, 0); pointer-events: all; cursor: pointer; transition: fill .3s ease; -webkit-tap-highlight-color: transparent;
    touch-action: manipulation; }  /* no double-tap zoom on tablets */
  @media (hover: hover) { .hit:hover { fill: rgba(255, 255, 255, .07); transition: none; } }  /* light up at once, fade back softly */
  .hit.pressed { fill: rgba(255, 255, 255, .18); transition: none; }
  .ohit { fill: rgba(255, 255, 255, 0); pointer-events: all; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  @media (hover: hover) { .ohit:hover { fill: rgba(255, 255, 255, .12); } }
  .op .sky { fill: rgba(159, 211, 255, .2); stroke: #9fd3ff; stroke-width: .06; opacity: .85; }
  .op .skybar { stroke: #9fd3ff; stroke-width: .04; opacity: .6; }
  .op .os { transition: opacity .3s; }
  .op .os.open .win, .op .os.open .gar, .op .os.open .leaf, .op .os.open .swing, .op .os.open .skybar { stroke: var(--c-window); opacity: 1; }
  .op .os.open .sky { fill: rgba(255, 141, 126, .3); stroke: var(--c-window); opacity: 1; }
  .op .os.unlocked .leaf { stroke: #ff8a80; opacity: 1; }
  .op .os.tilted .win, .op .os.tilted .gar, .op .os.tilted .leaf, .op .os.tilted .skybar { stroke: #ffd166; stroke-dasharray: .12 .1; opacity: 1; }
  .op .os.tilted .sky { fill: rgba(255, 209, 102, .22); stroke: #ffd166; stroke-dasharray: .12 .1; opacity: 1; }
  /* Shade in front of a window: track (whole width), bar = closed part, ticks = slats turned by the tilt */
  .op .shd line { stroke: var(--c-shade); stroke-linecap: butt; }
  .op .shd .trk { stroke-width: .05; opacity: .25; }
  .op .shd .bar { stroke-width: .11; opacity: .85; }
  .op .shd .sl { stroke-width: .035; opacity: .9; }
  .op .shd.moving .bar, .op .shd.moving .sl { animation: shmove 1s ease-in-out infinite alternate; }
  @keyframes shmove { from { opacity: .35; } }
  .cfm { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 5; display: flex; align-items: center; justify-content: center;
    background: rgba(8, 12, 24, .55); border-radius: inherit; }
  .cbox { background: #1d2742; color: var(--n-text); border-radius: 14px; padding: 16px 18px; max-width: 86%; box-shadow: 0 8px 30px rgba(0, 0, 0, .5); }
  .cbox .ctit { font-size: 12px; opacity: .7; margin-bottom: 4px; }
  .cbox p { margin: 0 0 14px; font-size: 17px; }
  .cbtn { display: flex; flex-wrap: wrap; justify-content: flex-end; }
  .cbtn button { font: inherit; font-size: 14px; margin: 4px 0 0 8px; padding: 7px 14px; border-radius: 9px; border: 1px solid rgba(160, 182, 230, .35);
    background: transparent; color: var(--n-text); cursor: pointer; }
  .cbtn button.go { background: #4f6fd8; border-color: #4f6fd8; color: #fff; }

  /* Presence and motion */
  .fx { position: absolute; }
  .o { position: absolute; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%); }
  .core, .ring { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; }
  .core { opacity: 0; transition: opacity 1.2s ease; }
  .core i { display: block; width: 100%; height: 100%; border-radius: 50%; }
  .core.p i { background: radial-gradient(closest-side, rgba(var(--c-presence), .9), rgba(var(--c-presence), .42) 42%, rgba(var(--c-presence), .14) 66%,
    rgba(var(--c-presence), .5) 82%, rgba(var(--c-presence), 0)); }  /* soft halo ring: stays visible in brightly lit rooms */
  .core.m i { background: radial-gradient(closest-side, rgba(var(--c-motion), .92), rgba(var(--c-motion), .45) 45%, rgba(var(--c-motion), 0)); }
  .fx.presence .core.p, .fx.motion .core.m { opacity: 1; }
  .fx.presence .core.p i { animation: breathe 6s ease-in-out infinite; }
  .fx.motion .core.m i { animation: breathe 2.2s ease-in-out infinite; }
  .ring { opacity: 0; background: radial-gradient(closest-side, rgba(var(--c-motion), 0) 68%, rgba(var(--c-motion), .62) 87%, rgba(var(--c-motion), 0)); }
  .fx.motion .ring { animation: ripple 3s cubic-bezier(.22, .61, .36, 1) infinite; }
  .fx.motion .ring.r2 { animation-delay: 1.5s; }
  @keyframes breathe { 0%, 100% { transform: scale(.84); opacity: .7; } 50% { transform: scale(1.06); opacity: 1; } }
  @keyframes ripple { 0% { transform: scale(.16); opacity: 0; } 16% { opacity: .8; } 100% { transform: scale(1); opacity: 0; } }

  /* Labels */
  .lbl { position: absolute; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%); text-align: center;
    white-space: nowrap; line-height: 1.12; padding: .15em .45em; border-radius: .7em; outline: none; }
  .name { font-size: .8em; font-weight: 500; letter-spacing: .02em; color: rgba(232, 238, 251, .84); }
  .temp { font-size: 1.14em; font-weight: 300; color: #fff; font-variant-numeric: tabular-nums; letter-spacing: .01em; }
  .temp:empty, .chips:empty { display: none; }
  .temp.flash { font-size: .95em; font-weight: 400; color: #fff6d8; }
  .name, .temp { text-shadow: 0 1px 2px rgba(3, 7, 18, .9), 0 0 10px rgba(3, 7, 18, .6); }
  .lbl.small { font-size: .78em; }
  .name, .temp { transition: color .8s ease, text-shadow .8s ease; }
  .lbl.ink .name { color: rgba(16, 24, 44, .78); }
  .lbl.ink .temp { color: #101a30; font-weight: 400; }
  .lbl.ink .name, .lbl.ink .temp { text-shadow: 0 0 8px rgba(255, 250, 240, .45); }
  .chips { display: flex; justify-content: center; margin-top: .22em; }
  .chip { display: inline-flex; align-items: center; justify-content: center; width: 1.6em; height: 1.6em; margin: 0 .12em;
    border-radius: 50%; background: rgba(8, 13, 27, .66); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .1); }
  .chip ha-icon { --mdc-icon-size: 1.05em; display: flex; }
  .chip.win { color: var(--c-window); box-shadow: inset 0 0 0 1px rgba(255, 141, 126, .45), 0 0 .7em rgba(255, 141, 126, .35); }
  .chip.win.tilt { color: #ffd166; box-shadow: inset 0 0 0 1px rgba(255, 209, 102, .45), 0 0 .6em rgba(255, 209, 102, .3); }
  .chip.shade { color: var(--c-shade); }
  .chip.music i { display: block; width: .16em; height: .8em; margin: 0 .05em; border-radius: .08em; background: var(--c-music);
    transform-origin: 50% 100%; animation: eq .8s ease-in-out infinite alternate; }
  .chip.music i:nth-child(2) { animation-duration: .55s; animation-delay: -.2s; }
  .chip.music i:nth-child(3) { animation-duration: 1s; animation-delay: -.5s; }
  @keyframes eq { from { transform: scaleY(.25); } to { transform: scaleY(1); } }

  /* Keyboard / remote (arrow keys) */
  .lbl:focus, .tab:focus { outline: none; box-shadow: 0 0 0 2px rgba(255, 255, 255, .6); }
  .nav:focus { outline: none; box-shadow: 0 0 0 2px rgba(255, 255, 255, .6); }
  .lbl:focus:not(:focus-visible), .tab:focus:not(:focus-visible) { box-shadow: none; }
  .nav:focus:not(:focus-visible) { box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08); }

  /* Legend */
  .legend { display: flex; flex-wrap: wrap; justify-content: center; margin-top: 8px; font-size: .8em; color: var(--n-muted); }
  .legend > span { display: inline-flex; align-items: center; margin: 3px 10px; }
  .legend .chip { font-size: 13px; margin: 0 6px 0 0; }
  .legend .chip.music i { animation: none; transform: scaleY(.55); }
  .legend .chip.music i:nth-child(2) { transform: scaleY(1); }
  .legend .chip.music i:nth-child(3) { transform: scaleY(.75); }
  .lg { display: inline-block; width: 16px; height: 16px; margin-right: 6px; border-radius: 50%; }
  .lg.p { background: radial-gradient(closest-side, rgba(var(--c-presence), .95), rgba(var(--c-presence), .3) 45%, rgba(var(--c-presence), .15) 62%,
    rgba(var(--c-presence), .7) 80%, rgba(var(--c-presence), 0)); }
  .lg.m { background: radial-gradient(closest-side, rgba(var(--c-motion), .95), rgba(var(--c-motion), .3) 40%, rgba(var(--c-motion), 0) 56%,
    rgba(var(--c-motion), .75) 80%, rgba(var(--c-motion), 0)); }
  .lg.l { background: radial-gradient(closest-side, rgba(255, 214, 160, 1), rgba(255, 214, 160, .35) 55%, rgba(255, 214, 160, 0)); }

  /* all levels side by side (without mode: swipe) */
  .floors { display: flex; flex-wrap: wrap; align-items: flex-start; margin: -6px; }
  .floor { flex: 1 1 260px; min-width: 220px; margin: 6px; }
  .ftitle { font-weight: 500; margin: 0 0 6px 2px; color: var(--n-muted); letter-spacing: .02em; }

  /* Build-up on load: the outer wall draws itself, then the lights come on */
  .intro .outline { animation: draw 1.5s cubic-bezier(.65, 0, .25, 1) both; }
  .intro .shadow, .intro .fl { animation: fadein 1s both; }
  .intro .wa, .intro .rim { animation: fadein .9s .6s both; }
  .intro .sp, .intro .li, .intro .ed { animation: fadein 1.4s 1s both; }
  .intro .fxs, .intro .lbls { animation: fadein .8s 1.1s both; }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  @keyframes fadein { from { opacity: 0; } }

  /* Site: bar (own buttons | site / buildings | zoom out, off), levels, views */
  .site .bar { display: flex; align-items: center; justify-content: space-between; margin: 0 0 6px; }
  .site .lb, .site .rb { display: flex; align-items: center; flex: 0 0 auto; }
  .site .mid { flex: 1 1 auto; display: flex; justify-content: center; min-width: 0; margin: 0 6px; }
  .segs { display: flex; padding: 3px; border-radius: 999px; background: rgba(255, 255, 255, .05);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .07); max-width: 100%; overflow-x: auto; scrollbar-width: none; }
  .sg, .fb, .zo, .off { font: inherit; font-size: .92em; border: 0; border-radius: 999px; cursor: pointer; white-space: nowrap;
    -webkit-tap-highlight-color: transparent; transition: background .2s, color .2s; }
  .sg { padding: 6px 14px; margin: 0 1px; background: transparent; color: var(--n-muted); }
  .sg.on { color: var(--n-text); background: rgba(255, 255, 255, .14); }
  .fb, .zo, .off { display: inline-flex; align-items: center; padding: 6px 11px; margin: 0 3px; background: rgba(255, 255, 255, .06);
    color: var(--n-text); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08); }
  .fb ha-icon, .off ha-icon { --mdc-icon-size: 18px; display: flex; margin-right: 5px; }
  .fb span:empty { display: none; }
  .off.arm { background: #b3362a; color: #fff; }
  .sg:focus, .fb:focus, .zo:focus, .off:focus, .bsum:focus { outline: none; box-shadow: 0 0 0 2px rgba(255, 255, 255, .6); }
  .ftabs { display: flex; justify-content: center; margin: 0 0 6px; }
  .ftabs:empty { display: none; }
  .ftabs .tab { width: auto; padding: 5px 16px; margin: 0 3px; }
  .ftabs .tab.on { background: rgba(255, 255, 255, .1); }
  .view[hidden] { display: none; }
  .view.fadein .plan { animation: fadein .35s both; }
  .site .views, .site .hit, .site .bhit { touch-action: pan-y; }  /* two fingers: the card zooms, not the page */
  .bhit { fill: rgba(255, 255, 255, 0); pointer-events: all; cursor: zoom-in; }
  @media (hover: hover) { .bhit:hover { fill: rgba(255, 255, 255, .05); } }
  .bsum { position: absolute; -webkit-transform: translate(-50%, -120%); transform: translate(-50%, -120%); pointer-events: auto;
    cursor: zoom-in; white-space: nowrap; display: flex; align-items: center; padding: .25em .7em; border-radius: .8em; z-index: 2;
    background: rgba(8, 13, 27, .74); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .12); color: var(--n-text); font-size: .95em; }
  .bsum .bn { font-weight: 500; }
  .bsum.mid { -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%); }
  .rose { position: absolute; right: 1.5%; bottom: 1.5%; width: 44px; height: 44px; pointer-events: none; opacity: .85; z-index: 1; }
  .rose.bar { position: relative; right: auto; bottom: auto; display: inline-block; vertical-align: middle; width: 40px; height: 40px; margin-left: 6px; }
  .rose svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .rose circle { fill: rgba(10, 16, 32, .55); stroke: rgba(255, 255, 255, .35); stroke-width: 1; }
  .rose .rs { fill: rgba(255, 255, 255, .45); } .rose .rn { fill: #ff6b5e; }
  .rose text { fill: #fff; font-size: 7px; font-weight: 700; text-anchor: middle; dominant-baseline: central; }
  .bsum .sm { display: inline-flex; align-items: center; margin-left: .55em; color: #ffd98a; }
  .bsum .sm.w { color: var(--c-window); }
  .bsum .sm.m { color: var(--c-music); }
  .bsum ha-icon { --mdc-icon-size: 1.05em; display: flex; margin-right: .15em; }
  .lbl.area .name { font-style: italic; }
  .here { display: inline-block; margin-bottom: .2em; padding: .05em .55em; border-radius: .6em; font-size: .62em; font-weight: 600;
    letter-spacing: .03em; color: #0d1427; background: #9fd3ff; }
  .here:empty { display: none; }
  .lbl.mark { box-shadow: 0 0 0 2px rgba(159, 211, 255, .85); }
  .raster line { stroke: rgba(160, 182, 230, .2); stroke-width: .04; }
  .raster text { fill: rgba(205, 216, 240, .6); font-size: .9px; }
  .toast { position: absolute; left: 50%; bottom: 14px; -webkit-transform: translateX(-50%); transform: translateX(-50%);
    padding: 8px 14px; border-radius: 10px; background: rgba(20, 28, 50, .95); color: var(--n-text); opacity: 0;
    transition: opacity .3s; pointer-events: none; z-index: 6; }
  .toast.on { opacity: 1; }

  @media (max-width: 600px) {
    .site .fb span, .site .zo span { display: none; }
    .sg { padding: 6px 10px; }
    ha-card.night { padding: 10px 8px 8px; }
    .tab { width: 4.4em; } .tab .l { display: none; } .tab .s { display: inline; }
  }
  @media (prefers-reduced-motion: reduce) {
    .core i, .ring, .chip.music i { animation: none !important; }
    .light, .spill, .edge, .core { transition: none; }
  }
`;

/* ---------- Visual editor of the card (dashboard → edit card) ---------- */
const ED = {
  de: { plan: "Grundriss", mode: "Darstellung", swipe: "Ein Stockwerk groß – wischen, Reiter, Pfeile", all: "Alle Stockwerke nebeneinander",
    start: "Erstes Stockwerk", floors: "Gezeigte Stockwerke (leer = alle)", align: "Stockwerke aneinander ausrichten",
    background: "Hintergrundbilder zeigen", intro: "Aufbau-Animation beim Laden", tap: "Antippen eines Raums",
    popup: "Pop-up #raum öffnen (Bubble Card)", none: "nichts", hide_label: "Entitäten mit diesen Labels ignorieren",
    script: "Skript für Tasten, Klicks und Mausrad (Standard: script.raum_klick)",
    scroll_keys: "Pfeiltasten ↑/↓ scrollen die Seite (für Fernbedienungen ohne Rad)",
    building: "Nur dieses Gebäude des Grundrisses (leer = alle)",
    noPlans: "Noch kein Grundriss gespeichert.", open: "Grundriss im Editor bearbeiten",
    hint: "Räume, Wände, Fenster, Türen und die Entitäten je Raum legst du im Editor in der Seitenleiste fest.",
    tMove: "Gebäude verschieben", tBgMove: "Hintergrund verschieben", tBgTurn: "Hintergrund drehen (an einer Linie ausrichten)", bgMoveHint: "Hintergrund ziehen · Umschalt+Rad dreht ihn, Alt+Rad skaliert ihn – jeweils um den Mauszeiger.", bgTurnHint: "Zwei Punkte auf einer Linie des Hintergrunds anklicken (z. B. eine Grundstücksgrenze oder Hauswand).", lineDir: "Richtung dieser Linie (0 = waagerecht, 90 = senkrecht)", noBg: "Erst einen Hintergrund (Bild/PDF) einfügen.", tEdit: "Außenbereich bearbeiten", edit: "Bearbeiten", tDraw: "Außenbereich zeichnen", editHint: "Ecken der Außenbereiche ziehen (fangen Ecken und Kanten, Umschalt: frei) · Doppelklick auf eine Kante fügt eine Ecke ein, auf eine Ecke löscht sie · Name und Entitäten rechts in der Liste.", tCorner: "Ecke an Ecke", tAlign: "Am Hintergrund ausrichten", tUpload: "Hintergrund (Bild/PDF)", tBgScale: "Hintergrund-Maßstab", tFit: "Einpassen",
    cornerA: "1. Ecke des Gebäudes anklicken, das bewegt wird.", fixLink: "dauerhaft als Maßlinie", fixed: "Fest über Maßlinien – zum Lösen die Maßlinie anklicken.", delLink: "Diese Maßlinie löschen?", loop: "Die Gebäude hängen sonst im Kreis voneinander ab.", cornerB: "2. Zielecke an einem anderen Gebäude anklicken.",
    offset: "Abstand der Ecken", apply: "Übernehmen", alignScale: "Maßstab des Gebäudes anpassen (sonst nur verschieben und drehen)",
    alignP1: "1. Erste Ecke am Gebäude anklicken.", alignQ1: "2. Denselben Punkt im Hintergrund anklicken.", alignP2: "3. Zweite Ecke am selben Gebäude anklicken.",
    alignQ2: "4. Denselben Punkt im Hintergrund anklicken.", bgScaleHint: "Zwei Punkte mit bekanntem Abstand im Hintergrund anklicken.", realLen: "Echte Länge",
    siteHint: "Lage der Gebäude und Außenbereiche legst du im Grundstück im Grundriss-Editor fest; hier nur, was diese Karte betrifft.",
    sView: "Darstellung", noBlds: "Noch keine Gebäude – „+ Gebäude“ wählt einen Grundriss.", part: "Nur dieser Gebäudeteil des Grundrisses",
    sSite: "Grundstück", sBlds: "Gebäude", sAreas: "Gemeinsame Außenbereiche", sUsers: "Benutzer: Startansicht und Standort", sOpts: "Weitere Einstellungen",
    addBld: "+ Gebäude", addArea: "+ Außenbereich zeichnen", addUser: "+ Benutzer", del: "Entfernen", redraw: "Neu zeichnen", done: "Fertig", cancel: "Abbrechen",
    name: "Name", site_floor: "Geschoss in der Grundstücksansicht (Standard: unterstes)", x: "Lage x (m, leer = automatisch)", y: "Lage y (m)",
    rotation: "Drehung (°)", scale: "Maßstab", area: "Home-Assistant-Bereich", licht: "Licht", hauptlicht: "Hauptlicht", musik: "Musik",
    praesenz: "Präsenz", bewegung: "Bewegung", fenster: "Fenster", beschattung: "Beschattung", temp: "Temperatur",
    user: "Benutzer", art: "Art", standort: "Standort (folgen)", fest: "Fest", geofence: "Geofence (person / device_tracker / binary_sensor)",
    ble: "Bluetooth-Bereich (z. B. Bermuda), mehrere möglich", ble_letzter: "Letzter Bluetooth-Bereich", max_alter: "Letzter Bereich höchstens (Minuten)",
    ansicht: "Ansicht", raum: "Raum (mit Markierung)", vorlage: "Vorlage (liefert Raum oder Ansicht; Variablen benutzer, geraet)",
    preview: "Vorschau für Gerät", result: "Ergebnis",
    sstart: "Startansicht", show: "Nur diese Gebäude zeigen (eines = ohne Grundstücksebene)", follow_floor: "Beim Folgen auch das Stockwerk wechseln", ausrichtung: "Gebäudeansichten ausrichten", kompass: "Windrose zeigen",
    oSite: "wie im Grundstück", oAxis: "an der Hauptachse des Gebäudes", oNorth: "Norden oben",
    follow_hold: "Nach eigener Navigation nicht springen (s)", nachbar_rand: "Rand um ein Gebäude für Außenbereiche (%)",
    musik_aus: "Musik bei „aus“", pause: "Pause", stop: "Stopp", off: "Ausschalten", aus_mit_aussen: "„Gebäude aus“ schließt Außenbereiche ein",
    aus_schalter: "Aus-Schalter je Ebene (z. B. site: false)", buttons: "Eigene Schaltflächen je Ebene (site / <grundriss>: Liste)",
    raster: "5-m-Raster in der Grundstücksansicht", north: "Norden in der Grundstücksansicht (Grad, 0 = oben, im Uhrzeigersinn)",
    ausrichtung: "Gebäudeansichten ausrichten", oAxis: "an der Hauptachse des Gebäudes", oNorth: "Norden oben",
    labelHint: "Gebäudenamen ziehen, um das Badge zu verschieben; Doppelklick setzt es zurück. Ecken von Außenbereichen ziehen (mit Punktfang), Doppelklick auf eine Kante fügt eine Ecke ein, auf eine Ecke löscht sie.", site_background: "Hintergrundbild des Grundstücks (image, x, y, width, height, rotation, opacity)",
    gsite: "Grundstück", overlap: "Achtung, Gebäude überlappen: ", drawHint: "Außenbereich: Klicken setzt Punkte – sie fangen Ecken und Kanten von Gebäuden und Außenbereichen, sonst 45°-Schritte und 0,25-m-Raster (Umschalt: frei). Doppelklick oder Klick auf den ersten Punkt schließt, Esc bricht ab.",
    dragHint: "Gebäude ziehen = verschieben, Umschalt+Rad = drehen, Alt+Rad = Maßstab, Rad = zoomen, freie Fläche ziehen = Ansicht verschieben.",
    params: "Adresse: ?raum=<raum> oder ?ansicht=<grundriss>[:<stockwerk>] bzw. ?ansicht=grundstueck öffnet die Karte dort (für alle Benutzer, auch als #raum=…); ?geraet=<name> merkt sich einmalig den Gerätenamen für die Vorlage (der TV Streamer liefert ihn selbst).",
    notDrawn: "noch nicht gezeichnet", loading: "lädt …" },
  en: { plan: "Floor plan", mode: "Display", swipe: "One level large – swipe, tabs, arrows", all: "All levels side by side",
    start: "First level", floors: "Levels shown (empty = all)", align: "Align levels to each other",
    background: "Show background images", intro: "Build-up animation on load", tap: "Tapping a room",
    popup: "Open pop-up #room (Bubble Card)", none: "nothing", hide_label: "Ignore entities with these labels",
    script: "Script for keys, clicks and the wheel (default: script.raum_klick)",
    scroll_keys: "Arrow keys ↑/↓ scroll the page (for remotes without a wheel)",
    building: "Only this building of the plan (empty = all)",
    noPlans: "No floor plan saved yet.", open: "Edit the floor plan in the editor",
    hint: "Rooms, walls, windows, doors and the entities per room are set in the editor in the sidebar.",
    tMove: "Move buildings", tBgMove: "Move background", tBgTurn: "Turn background (align to a line)", bgMoveHint: "Drag the background · Shift+wheel turns it, Alt+wheel scales it – around the pointer.", bgTurnHint: "Click two points on a line of the background (e.g. a boundary or a house wall).", lineDir: "Direction of this line (0 = horizontal, 90 = vertical)", noBg: "Add a background (image/PDF) first.", tEdit: "Edit areas outside", edit: "Edit", tDraw: "Draw area outside", editHint: "Drag the corners of areas (they snap to corners and edges, Shift: free) · double-click an edge adds a corner, a corner removes it · name and entities in the list on the right.", tCorner: "Corner to corner", tAlign: "Align to background", tUpload: "Background (image/PDF)", tBgScale: "Background scale", tFit: "Fit",
    cornerA: "1. Click a corner of the building to move.", fixLink: "keep as measure line", fixed: "Fixed by measure lines – click a measure line to release it.", delLink: "Delete this measure line?", loop: "The buildings would depend on each other in a circle.", cornerB: "2. Click the target corner on another building.",
    offset: "Offset between the corners", apply: "Apply", alignScale: "Adjust the building's scale too (otherwise only move and turn)",
    alignP1: "1. Click a first corner of the building.", alignQ1: "2. Click the same point in the background.", alignP2: "3. Click a second corner of the same building.",
    alignQ2: "4. Click the same point in the background.", bgScaleHint: "Click two points of known distance in the background.", realLen: "Real length",
    siteHint: "Where the buildings stand and the areas outside are set in the site in the floor plan editor; here only what this card needs.",
    sView: "Display", noBlds: "No buildings yet – „+ Building“ picks a floor plan.", part: "Only this building part of the plan",
    sSite: "Site", sBlds: "Buildings", sAreas: "Shared areas outside", sUsers: "Users: start view and location", sOpts: "More settings",
    addBld: "+ Building", addArea: "+ Draw an area outside", addUser: "+ User", del: "Remove", redraw: "Draw again", done: "Done", cancel: "Cancel",
    name: "Name", site_floor: "Level shown on the site (default: the lowest)", x: "Position x (m, empty = automatic)", y: "Position y (m)",
    rotation: "Rotation (°)", scale: "Scale", area: "Home Assistant area", licht: "Lights", hauptlicht: "Main light", musik: "Music",
    praesenz: "Presence", bewegung: "Motion", fenster: "Windows", beschattung: "Shades", temp: "Temperature",
    user: "User", art: "Kind", standort: "Location (follow)", fest: "Fixed", geofence: "Geofence (person / device_tracker / binary_sensor)",
    ble: "Bluetooth area (e.g. Bermuda), several allowed", ble_letzter: "Last Bluetooth area", max_alter: "Last area at most (minutes)",
    ansicht: "View", raum: "Room (marked)", vorlage: "Template (returns a room or a view; variables benutzer, geraet)",
    preview: "Preview for device", result: "Result",
    sstart: "Start view", show: "Show only these buildings (one = without the site level)", follow_floor: "Following also changes the level", ausrichtung: "Align building views", kompass: "Show compass rose",
    oSite: "as set in the site", oAxis: "along the building's main axis", oNorth: "north up",
    follow_hold: "Do not jump after own navigation (s)", nachbar_rand: "Margin around a building for areas outside (%)",
    musik_aus: "Music on „off“", pause: "Pause", stop: "Stop", off: "Switch off", aus_mit_aussen: "„Building off“ includes the areas outside",
    aus_schalter: "Off button per level (e.g. site: false)", buttons: "Own buttons per level (site / <plan>: list)",
    raster: "5 m grid in the site view", north: "North in the site view (degrees, 0 = up, clockwise)",
    ausrichtung: "Align building views", oAxis: "along the building's main axis", oNorth: "north up",
    labelHint: "Drag a building name to move its badge; double-click resets it. Drag corners of areas (with snapping); double-click an edge adds a corner, a corner removes it.", site_background: "Background image of the site (image, x, y, width, height, rotation, opacity)",
    gsite: "Site", overlap: "Careful, buildings overlap: ", drawHint: "Clicks set points – they snap to corners and edges of buildings and areas, else 45° steps and a 0.25 m grid (Shift: free). A double click or a click on the first point closes, Esc cancels.",
    dragHint: "Drag a building to move it, Shift+wheel turns, Alt+wheel scales, wheel zooms, dragging empty space pans.",
    params: "Address: ?raum=<room> or ?ansicht=<plan>[:<level>] or ?ansicht=grundstueck opens the card there (for every user, also as #raum=…); ?geraet=<name> remembers a device name once for the template (the TV Streamer gives its own).",
    notDrawn: "not drawn yet", loading: "loading …" },
};

const polysOverlap = (a, b) => {  // two polygons share area (a corner inside the other or crossing edges)
  if (a.some((p) => inside(p, b)) || b.some((p) => inside(p, a))) return true;
  const cross = (p, q, r, s) => {
    const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
    if (!d) return false;
    const u = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d, v = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
    return u > 0 && u < 1 && v > 0 && v < 1;
  };
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) {
    if (cross(a[i], a[(i + 1) % a.length], b[j], b[(j + 1) % b.length])) return true;
  }
  return false;
};

/* ---------- Property editor (floor plan editor, plan with `site`) ----------
   The drawing area fills the editor's stage (zoom with the wheel, pan by dragging empty space); the lists of buildings and
   areas outside go to the side panel (sideHost). Placing with real measures: corner to corner with an offset in metres,
   aligning two corners of a building with two points of a background image or PDF, and scaling the background by a
   known distance. */
class FloorplanLiteSiteEditor extends HTMLElement {
  set hass(h) { const first = !this._hass; this._hass = h; (this._forms || []).forEach((f) => { f.hass = h; }); if (first) this._render(); }
  set plans(l) { this._planList = l || []; this._render(); }
  set site(s) { this._s = JSON.parse(JSON.stringify(s || {})); this._s.buildings = this._s.buildings || []; this._s.areas = this._s.areas || []; this._render(); }
  set siteId(id) { this._siteId = id; }
  set sideHost(el) { this._sideHost = el; if (this._sd && el && this._sd.parentNode !== el) el.appendChild(this._sd); }
  get _t() {
    const l = (this._hass && ((this._hass.locale && this._hass.locale.language) || this._hass.language)) || "en";
    return ED[String(l).slice(0, 2)] || ED.en;
  }

  _emit(fn) {
    fn(this._s);
    this._solve(this._s);
    this.dispatchEvent(new CustomEvent("site-changed", { detail: { site: JSON.parse(JSON.stringify(this._s)) }, bubbles: true, composed: true }));
    this._render();
  }

  async _load(id) {
    const c = this._sp || (this._sp = {});
    if (c[id] !== undefined || !id || !this._hass) return;
    c[id] = null;
    try { c[id] = await this._hass.callWS({ type: "floorplan_lite/get", plan_id: id }); } catch (e) { c[id] = false; }
    this._render();
  }

  _geo() {
    const plans = {};
    let missing = false;
    this._s.buildings.forEach((b) => {
      if (!b || !b.plan) return;
      const p = this._sp && this._sp[b.plan];
      if (p === undefined) { this._load(b.plan); missing = true; } else if (p === null) missing = true; else if (p) plans[b.plan] = p;
    });
    if (missing) return null;
    return buildSite(Object.assign({}, this._s, { show: undefined, raster: true }), plans, {});
  }

  _sel(options, extra) { return { select: Object.assign({ mode: "dropdown", options: options }, extra || {}) }; }

  _list(host, list, head, schema, data, change) {  // one ha-form per item: typing keeps the focus
    const items = host.__items || (host.__items = []);
    while (items.length > list.length) items.pop().el.remove();
    list.forEach((x, i) => {
      let it = items[i];
      if (!it) {
        const el = document.createElement("div"), hd = document.createElement("div"), form = document.createElement("ha-form");
        el.className = "fl-item"; hd.className = "fl-head";
        form.computeLabel = (sc) => this._t[sc.name] || sc.name;
        el.appendChild(hd); el.appendChild(form); host.appendChild(el);
        it = items[i] = { el: el, hd: hd, form: form };
        form.addEventListener("value-changed", (e) => change(it.i, e.detail.value));
        (this._forms || (this._forms = [])).push(form);
      }
      it.i = i;
      head(it.hd, x, i);
      it.form.hass = this._hass;
      it.form.schema = schema(x, i);
      it.form.data = data(x, i);
    });
  }

  _render() {
    if (!this._hass || !this._s) return;
    const t = this._t, site = this._s;
    if (!this._built) {
      this._built = true;
      this._tool = "move";
      this.innerHTML = `<style>${FloorplanLiteSiteEditor.styles}</style><div class="fl-cv"><div class="fl-tools"></div><div class="fl-canvas"></div>` +
        `<div class="fl-coord"></div><div class="fl-warn"></div></div>`;
      this._sd = document.createElement("div");
      this._sd.className = "fl-sd";
      this._sd.innerHTML = `<style>${FloorplanLiteSiteEditor.styles}</style>` +
        `<h4>${esc(t.sBlds)}</h4><div class="fl-blds"></div><button class="fl-btn" data-a="addb">${esc(t.addBld)}</button>` +
        `<h4>${esc(t.sAreas)}</h4><div class="fl-areas"></div><button class="fl-btn" data-a="adda">${esc(t.addArea)}</button>` +
        `<h4>${esc(t.sView)}</h4><div class="fl-opts"></div>`;
      (this._sideHost || this).appendChild(this._sd);
      this._sd.querySelector('[data-a="addb"]').addEventListener("click", () => this._emit((s) => {
        const used = s.buildings.map((b) => b.plan);
        const free = (this._planList || []).filter((p) => used.indexOf(p.id) < 0 && p.id !== this._siteId)[0];
        s.buildings.push({ plan: free ? free.id : "" });
      }));
      this._sd.querySelector('[data-a="adda"]').addEventListener("click", () => {
        this._emit((s) => { s.areas.push({ id: "bereich_" + (s.areas.length + 1), poly: [] }); });
        this._setTool("draw", { i: this._s.areas.length - 1 });
      });
      const opt = document.createElement("ha-form");
      opt.computeLabel = (sc) => this._t[sc.name] || sc.name;
      opt.addEventListener("value-changed", (e) => this._emit((s) => {
        const v = e.detail.value;
        if (v.raster) s.raster = true; else delete s.raster;
        if (v.north) s.north = v.north; else delete s.north;
        if (v.ausrichtung === "norden") s.ausrichtung = "norden"; else delete s.ausrichtung;
        if (v.site_background && v.site_background.image) s.site_background = v.site_background; else delete s.site_background;
      }));
      this._sd.querySelector(".fl-opts").appendChild(opt);
      this._opt = opt;
      (this._forms || (this._forms = [])).push(opt);
      window.addEventListener("keydown", (e) => { if (e.key === "Escape" && this._tool !== "move" && this.isConnected) this._setTool("move"); });
      if (window.ResizeObserver) new ResizeObserver(() => this._canvas()).observe(this.querySelector(".fl-canvas"));
    }
    const plans = (this._planList || []).filter((p) => p.id !== this._siteId).map((p) => ({ value: p.id, label: p.name }));
    this._list(this._sd.querySelector(".fl-blds"), site.buildings,
      (hd, b, i) => {
        hd.innerHTML = `<b>${esc(b.name || b.plan || "?")}</b><button class="fl-mini" data-del="${i}">${esc(t.del)}</button>`;
        hd.querySelector("[data-del]").addEventListener("click", () => this._emit((s) => { s.buildings.splice(i, 1); }));
      },
      (b) => {
        const p = this._sp && this._sp[b.plan];
        const lv = p ? (p.levels || []).map((l) => ({ value: l.id, label: l.name })) : [];
        const sc = [{ name: "plan", required: true, selector: this._sel(plans) }, { name: "name", selector: { text: {} } }];
        if (lv.length > 1) sc.push({ name: "site_floor", selector: this._sel([{ value: "", label: "–" }].concat(lv)) });
        if (p && (p.buildings || []).length > 1) sc.push({ name: "part", selector: this._sel([{ value: "", label: "–" }].concat(p.buildings.map((x) => ({ value: x.id, label: x.name })))) });
        sc.push({ name: "x", selector: { number: { mode: "box", step: 0.01 } } }, { name: "y", selector: { number: { mode: "box", step: 0.01 } } },
          { name: "rotation", selector: { number: { mode: "box", step: 0.1, min: -360, max: 360 } } },
          { name: "scale", selector: { number: { mode: "box", step: 0.001, min: 0.01, max: 100 } } });
        return sc;
      },
      (b) => ({ plan: b.plan || "", name: b.name || "", site_floor: b.site_floor || "", part: b.building || "", x: b.x, y: b.y, rotation: b.rotation || 0, scale: b.scale || 1 }),
      (i, v) => this._emit((s) => {
        const b = s.buildings[i];
        ["plan", "name", "site_floor"].forEach((k) => { if (v[k]) b[k] = v[k]; else delete b[k]; });
        if (v.part) b.building = v.part; else delete b.building;
        ["x", "y"].forEach((k) => { if (typeof v[k] === "number") b[k] = v[k]; else delete b[k]; });
        if (v.rotation) b.rotation = v.rotation; else delete b.rotation;
        if (v.scale && v.scale !== 1) b.scale = v.scale; else delete b.scale;
      }));
    const ents = (dom, multi) => ({ entity: { multiple: !!multi, filter: { domain: dom } } });
    this._list(this._sd.querySelector(".fl-areas"), site.areas,
      (hd, a, i) => {
        hd.innerHTML = `<b>${esc(a.name || a.id)}</b>${a.poly && a.poly.length > 2 ? "" : ` <i>${esc(t.notDrawn)}</i>`}` +
          `<button class="fl-mini" data-edit="${i}">${esc(t.edit)}</button><button class="fl-mini" data-draw="${i}">${esc(t.redraw)}</button><button class="fl-mini" data-del="${i}">${esc(t.del)}</button>`;
        hd.querySelector("[data-edit]").addEventListener("click", () => this._setTool("edit"));
        hd.querySelector("[data-draw]").addEventListener("click", () => this._setTool("draw", { i: i }));
        hd.querySelector("[data-del]").addEventListener("click", () => this._emit((s) => { s.areas.splice(i, 1); }));
      },
      () => [{ name: "area", selector: { area: {} } }, { name: "name", selector: { text: {} } },
        { name: "licht", selector: ents(["light", "switch"], true) }, { name: "hauptlicht", selector: ents(["light", "switch"]) },
        { name: "musik", selector: ents("media_player", true) }, { name: "praesenz", selector: ents("binary_sensor", true) },
        { name: "bewegung", selector: ents("binary_sensor", true) }, { name: "fenster", selector: ents(["binary_sensor", "cover"], true) },
        { name: "beschattung", selector: ents("cover", true) }, { name: "temp", selector: ents(["climate", "sensor"]) }],
      (a) => ({ area: a.area || "", name: a.name || "", licht: a.licht || [], hauptlicht: a.hauptlicht || "", musik: a.musik || [],
        praesenz: a.praesenz || [], bewegung: a.bewegung || [], fenster: a.fenster || [], beschattung: a.beschattung || [], temp: a.temp || "" }),
      (i, v) => this._emit((s) => {
        const a = s.areas[i], ha = (this._hass.areas || {})[v.area];
        if (v.area) { a.id = String(v.area).replace(/[^a-z0-9_]/g, "_").slice(0, 64); a.area = v.area; if (!v.name && ha) v.name = ha.name; } else delete a.area;
        if (v.name) a.name = v.name; else delete a.name;
        ["licht", "musik", "praesenz", "bewegung", "fenster", "beschattung"].forEach((k) => { if (v[k] && v[k].length) a[k] = v[k]; else delete a[k]; });
        ["hauptlicht", "temp"].forEach((k) => { if (v[k]) a[k] = v[k]; else delete a[k]; });
      }));
    this._opt.hass = this._hass;
    this._opt.schema = [{ name: "north", selector: { number: { mode: "box", min: -360, max: 360, step: 0.5, unit_of_measurement: "°" } } },
      { name: "ausrichtung", selector: this._sel([{ value: "achse", label: t.oAxis }, { value: "norden", label: t.oNorth }]) },
      { name: "raster", selector: { boolean: {} } }, { name: "site_background", selector: { object: {} } }];
    this._opt.data = { north: site.north || 0, ausrichtung: site.ausrichtung || "achse", raster: !!site.raster, site_background: site.site_background || {} };
    this._toolbar();
    this._canvas();
  }

  /* ---------- Tools ---------- */
  _setTool(k, o) {
    this._tool = k;
    this._step = Object.assign({ pts: [] }, o || {});
    this._toolbar();
    this._canvas();
  }

  _toolbar() {
    const box = this.querySelector(".fl-tools");
    if (!box) return;
    const t = this._t, st = this._step || { pts: [] }, k = this._tool;
    const btn = (id, icon, label) => `<button class="fl-tb${k === id ? " on" : ""}" data-t="${id}" title="${esc(label)}"><ha-icon icon="${icon}"></ha-icon><span>${esc(label)}</span></button>`;
    let html = btn("move", "mdi:cursor-move", t.tMove) + btn("edit", "mdi:vector-polygon", t.tEdit) + btn("newarea", "mdi:vector-square-plus", t.tDraw) +
      btn("corner", "mdi:vector-point", t.tCorner) + btn("align", "mdi:image-move", t.tAlign) +
      `<button class="fl-tb" data-t="upload" title="${esc(t.tUpload)}"><ha-icon icon="mdi:image-plus"></ha-icon><span>${esc(t.tUpload)}</span></button>` +
      btn("bgmove", "mdi:arrow-all", t.tBgMove) + btn("bgturn", "mdi:rotate-left", t.tBgTurn) + btn("bgscale", "mdi:ruler", t.tBgScale) + `<button class="fl-tb" data-t="fit" title="${esc(t.tFit)}"><ha-icon icon="mdi:fit-to-screen"></ha-icon></button>`;
    let hint = k === "edit" ? t.editHint : k === "move" ? t.dragHint + " " + t.labelHint : k === "draw" ? t.drawHint : "";
    if (k === "corner") hint = st.pts.length === 0 ? t.cornerA : st.pts.length === 1 ? t.cornerB : "";
    if (k === "align") hint = [t.alignP1, t.alignQ1, t.alignP2, t.alignQ2][st.pts.length] || "";
    if (k === "bgscale") hint = st.pts.length < 2 ? t.bgScaleHint : "";
    if (k === "bgmove") hint = this._s.site_background ? t.bgMoveHint : t.noBg;
    if (k === "bgturn") hint = !this._s.site_background ? t.noBg : st.pts.length < 2 ? t.bgTurnHint : "";
    let form = "";
    if (k === "corner" && st.pts.length === 2) {
      form = `${esc(t.offset)} x <input type="number" step="0.01" data-f="dx" value="0"> y <input type="number" step="0.01" data-f="dy" value="0"> m ` +
        `<label><input type="checkbox" data-f="fix" checked> ${esc(t.fixLink)}</label> <button class="fl-mini" data-go="1">${esc(t.apply)}</button>`;
    }
    if (k === "align" && st.pts.length === 4) {
      form = `<label><input type="checkbox" data-f="sc"> ${esc(t.alignScale)}</label> <button class="fl-mini" data-go="1">${esc(t.apply)}</button>`;
    }
    if (k === "bgturn" && st.pts.length === 2) {
      const a0 = Math.atan2(st.pts[1][1] - st.pts[0][1], st.pts[1][0] - st.pts[0][0]) * 180 / Math.PI;
      form = `${esc(t.lineDir)} <input type="number" step="0.5" data-f="deg" value="${Math.round(a0 / 90) * 90}"> ° <button class="fl-mini" data-go="1">${esc(t.apply)}</button>`;
    }
    if (k === "bgscale" && st.pts.length === 2) {
      const d = Math.sqrt(Math.pow(st.pts[1][0] - st.pts[0][0], 2) + Math.pow(st.pts[1][1] - st.pts[0][1], 2));
      form = `${esc(t.realLen)} <input type="number" step="0.01" data-f="len" value="${d.toFixed(2)}"> m <button class="fl-mini" data-go="1">${esc(t.apply)}</button>`;
    }
    if (k === "draw") form = `<button class="fl-mini" data-a="done">${esc(t.done)}</button>`;
    if (k !== "move") form += ` <button class="fl-mini" data-a="cancel">${esc(t.cancel)}</button>`;
    box.innerHTML = `<div class="fl-tbr">${html}</div><div class="fl-step">${esc(hint)} ${form}</div>`;
    box.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => {
      const id = b.getAttribute("data-t");
      if (id === "fit") { this._vb = null; this._canvas(); return; }
      if (id === "newarea") { this._sd.querySelector('[data-a="adda"]').click(); return; }
      if (id === "upload") { this.dispatchEvent(new CustomEvent("site-upload", { bubbles: true, composed: true })); return; }
      this._setTool(id);
    }));
    const cancel = box.querySelector('[data-a="cancel"]');
    if (cancel) cancel.addEventListener("click", () => this._setTool("move"));
    const done = box.querySelector('[data-a="done"]');
    if (done) done.addEventListener("click", () => this._finishDraw());
    const go = box.querySelector("[data-go]");
    if (go) go.addEventListener("click", () => this._apply(box));
  }

  /* Measure lines: corner "at" of a building sits at corner "to_at" of another + (dx, dy). One line fixes the position,
     two fix the turn as well. Buildings follow the ones they hang on, in a few passes. */
  _solve(s) {
    const d = this._d;
    if (!d) return;
    const org = {}, pos = {};
    d.blds.forEach((b) => { org[b.id] = b.origin; pos[b.id] = b.pos; });
    const B = (id) => s.buildings.filter((b) => b.plan === id)[0];
    s.links = (s.links || []).filter((l) => B(l.plan) && B(l.to));
    if (!s.links.length) { delete s.links; return; }
    const P = (id) => {
      const b = B(id), q = pos[id] || {};
      return { x: typeof b.x === "number" ? b.x : q.x || 0, y: typeof b.y === "number" ? b.y : q.y || 0, rotation: b.rotation || 0, scale: b.scale };
    };
    for (let n = 0; n < 6; n++) {
      s.buildings.forEach((b) => {
        const my = s.links.filter((l) => l.plan === b.plan && org[l.to] && org[b.plan]);
        if (!my.length) return;
        const tg = my.map((l) => { const w = placer(P(l.to), org[l.to])(l.to_at); return [w[0] + (l.dx || 0), w[1] + (l.dy || 0)]; });
        const cur = P(b.plan);
        if (my.length > 1) {
          const sv = [my[1].at[0] - my[0].at[0], my[1].at[1] - my[0].at[1]], qv = [tg[1][0] - tg[0][0], tg[1][1] - tg[0][1]];
          if (Math.abs(sv[0]) + Math.abs(sv[1]) > 1e-6 && Math.abs(qv[0]) + Math.abs(qv[1]) > 1e-6) {
            const r = (Math.atan2(qv[1], qv[0]) - Math.atan2(sv[1], sv[0])) * 180 / Math.PI;
            cur.rotation = +(((r % 360) + 540) % 360 - 180).toFixed(2);
          }
        }
        const w = placer({ x: 0, y: 0, rotation: cur.rotation, scale: cur.scale }, org[b.plan])(my[0].at);
        b.x = +(tg[0][0] - w[0]).toFixed(3); b.y = +(tg[0][1] - w[1]).toFixed(3);
        if (cur.rotation) b.rotation = cur.rotation; else delete b.rotation;
      });
    }
  }

  _bld(i) { const d = this._d, b = this._s.buildings[i]; return d && b ? d.blds.filter((x) => x.id === b.plan)[0] : null; }

  _apply(box) {  // the measured tools
    const st = this._step, f = (n) => box.querySelector(`[data-f="${n}"]`);
    if (this._tool === "corner") {  // move building A so its corner sits at B's corner + offset
      const a = st.pts[0], b = st.pts[1];
      const dx = parseFloat(f("dx").value) || 0, dy = parseFloat(f("dy").value) || 0;
      const bl = this._bld(a.i);
      if (!bl) return;
      const mx = b.p[0] + dx - a.p[0], my = b.p[1] + dy - a.p[1], bb = this._bld(b.i);
      if (f("fix").checked && bb) {  // a measure line: stays, and B moving takes A along
        const dep = (id, seen) => (this._s.links || []).some((l) => l.plan === id && (l.to === bl.id || (seen.indexOf(l.to) < 0 && dep(l.to, seen.concat([l.to])))));
        if (bb.id === bl.id || dep(bb.id, [bb.id])) { this._note = this._t.loop; this._setTool("move"); return; }
        const at = bl.T.inv(a.p), to = bb.T.inv(b.p);
        this._emit((s) => {
          const L = (s.links || []).filter((l) => !(l.plan === bl.id && Math.abs(l.at[0] - at[0]) + Math.abs(l.at[1] - at[1]) < 1e-3));
          const mine = L.filter((l) => l.plan === bl.id);
          if (mine.length >= 2) L.splice(L.indexOf(mine[0]), 1);  // two lines fix a building; a third replaces the oldest
          L.push({ plan: bl.id, at: at, to: bb.id, to_at: to, dx: dx, dy: dy });
          s.links = L;
          const x = s.buildings[a.i]; x.x = +(bl.pos.x + mx).toFixed(3); x.y = +(bl.pos.y + my).toFixed(3);
        });
      } else this._emit((s) => { const x = s.buildings[a.i]; x.x = +(bl.pos.x + mx).toFixed(3); x.y = +(bl.pos.y + my).toFixed(3); });
    } else if (this._tool === "align") {  // two building corners onto two points of the background
      const p1 = st.pts[0], q1 = st.pts[1].p, p2 = st.pts[2], q2 = st.pts[3].p, bl = this._bld(p1.i);
      if (!bl || p2.i !== p1.i) return;
      const ang = (v) => Math.atan2(v[1], v[0]);
      const sv = [p2.p[0] - p1.p[0], p2.p[1] - p1.p[1]], qv = [q2[0] - q1[0], q2[1] - q1[1]];
      const rot = (bl.pos.rotation || 0) + (ang(qv) - ang(sv)) * 180 / Math.PI;
      const k0 = bl.pos.scale > 0 ? bl.pos.scale : 1;
      const ls = Math.sqrt(sv[0] * sv[0] + sv[1] * sv[1]), lq = Math.sqrt(qv[0] * qv[0] + qv[1] * qv[1]);
      const k = f("sc").checked && ls > 0 ? k0 * lq / ls : k0;
      const pp = bl.T.inv(p1.p), o = bl.origin, r = rot * Math.PI / 180;
      const lx = (pp[0] - o[0]) * k, ly = (pp[1] - o[1]) * k;
      const x = q1[0] - (lx * Math.cos(r) - ly * Math.sin(r)), y = q1[1] - (lx * Math.sin(r) + ly * Math.cos(r));
      this._emit((s) => {
        const b = s.buildings[p1.i];
        b.x = +x.toFixed(3); b.y = +y.toFixed(3); b.rotation = +(((rot % 360) + 540) % 360 - 180).toFixed(2);
        if (Math.abs(k - 1) > 1e-4) b.scale = +k.toFixed(4); else delete b.scale;
      });
    } else if (this._tool === "bgturn") {  // turn the background around the first point so the line has the wanted direction
      const a = st.pts[0], b = st.pts[1], want = parseFloat(f("deg").value) || 0;
      if (!this._s.site_background) return;
      this._emit((s) => this._turnBg(s.site_background, a, want - Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI));
    } else if (this._tool === "bgscale") {  // background scaled around the first point to the real length
      const a = st.pts[0], b = st.pts[1], bg = this._s.site_background;
      const d = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2)), len = parseFloat(f("len").value);
      if (!bg || !d || !(len > 0)) return;
      const k = len / d;
      this._emit((s) => {
        const g = s.site_background;
        g.x = +(a[0] + (g.x - a[0]) * k).toFixed(3); g.y = +(a[1] + (g.y - a[1]) * k).toFixed(3);
        g.width = +(g.width * k).toFixed(3);
        if (g.height) g.height = +(g.height * k).toFixed(3);
      });
    }
    this._setTool("move");
  }

  _turnBg(g, c, d) {  // turn the site background by d degrees around the point c
    const r = d * Math.PI / 180, x = (g.x || 0) - c[0], y = (g.y || 0) - c[1];
    g.x = +(c[0] + x * Math.cos(r) - y * Math.sin(r)).toFixed(3); g.y = +(c[1] + x * Math.sin(r) + y * Math.cos(r)).toFixed(3);
    g.rotation = +((((g.rotation || 0) + d) % 360 + 540) % 360 - 180).toFixed(2);
  }

  _finishDraw() {
    const st = this._step, poly = st.pts.slice();
    this._setTool("move");
    if (poly.length > 2) this._emit((s) => { if (s.areas[st.i]) s.areas[st.i].poly = poly; });
  }

  /* ---------- Drawing area ---------- */
  _canvas() {
    const host = this.querySelector(".fl-canvas");
    if (!host || !this._s) return;
    const t = this._t, d = this._geo(), site = this._s;
    this._d = d;
    if (!d) { host.innerHTML = `<p class="fl-hint">${esc(t.loading)}</p>`; return; }
    const sf = d.floors.site;
    if (!sf) { host.innerHTML = `<p class="fl-hint">${esc(t.noBlds)}</p>`; return; }
    const W = host.clientWidth || 600, H = host.clientHeight || 400;
    if (!this._vb) {  // fit, with the frame's aspect ratio
      const v = [sf.view[0], sf.view[1] - 2.5, sf.view[2], sf.view[3] + 2.5];
      const ar = W / H, w = Math.max(v[2], v[3] * ar), h = w / ar;
      this._vb = [v[0] - (w - v[2]) / 2, v[1] - (h - v[3]) / 2, w, h];
    }
    else if (Math.abs(this._vb[3] / this._vb[2] - H / W) > 1e-3) {  // the frame changed its shape: keep the middle and the width
      const o = this._vb, h = o[2] * H / W;
      this._vb = [o[0], o[1] + (o[3] - h) / 2, o[2], h];
    }
    const v = this._vb, u = v[2] / W;  // metres per pixel
    let g = "";
    if (sf.background) {
      const b = sf.background;
      g += `<image class="ebg" href="${esc(b.image)}" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height || b.width * 4}" opacity="${b.opacity}"` +
        ` preserveAspectRatio="${b.height ? "none" : "xMinYMin meet"}"${b.rotation ? ` transform="rotate(${b.rotation} ${b.x} ${b.y})"` : ""}/>`;
    }
    const stepG = u * 60 > 5 ? (u * 60 > 25 ? 50 : 10) : u * 60 > 1 ? 5 : 1;
    for (let x = Math.ceil(v[0] / stepG) * stepG; x <= v[0] + v[2]; x += stepG) g += `<line class="gr" x1="${x}" y1="${v[1]}" x2="${x}" y2="${v[1] + v[3]}" stroke-width="${u}"/><text class="gt" x="${x + 3 * u}" y="${v[1] + 12 * u}" font-size="${10 * u}">${x}</text>`;
    for (let y = Math.ceil(v[1] / stepG) * stepG; y <= v[1] + v[3]; y += stepG) g += `<line class="gr" x1="${v[0]}" y1="${y}" x2="${v[0] + v[2]}" y2="${y}" stroke-width="${u}"/><text class="gt" x="${v[0] + 3 * u}" y="${y - 3 * u}" font-size="${10 * u}">${y}</text>`;
    let handles = "";
    site.areas.forEach((a, ai) => {
      if (!a.poly || a.poly.length < 3) return;
      const c = centroid(a.poly);
      g += `<polygon class="ea" data-ea="${ai}" points="${pts(a.poly)}" stroke-width="${2 * u}"/><text class="et" x="${c[0]}" y="${c[1]}" font-size="${13 * u}">${esc(a.name || a.id)}</text>`;
      if (this._tool === "move" || this._tool === "edit") handles += a.poly.map((q, vi) => `<circle class="av" data-ea="${ai}" data-v="${vi}" cx="${q[0]}" cy="${q[1]}" r="${5 * u}" stroke-width="${1.5 * u}"/>`).join("");
    });
    const shapes = {};
    sf.bldShapes.forEach((x) => { (shapes[x.bld] || (shapes[x.bld] = [])).push(x.poly); });
    const warn = [];
    this._corners = [];
    const k = this._tool, st = this._step || { pts: [] };
    let labels = "";
    const cornerMode = k === "corner" || (k === "align" && st.pts.length % 2 === 0);
    d.blds.forEach((b, i) => {
      const own = shapes[b.id] || [], idx = site.buildings.map((x) => x.plan).indexOf(b.id);
      g += `<g class="eb" data-b="${idx}">` + own.map((q) => `<polygon points="${pts(q)}" stroke-width="${2 * u}"/>`).join("") +
        "</g>";
      const la = b.label || [(b.box[0] + b.box[2]) / 2, b.box[1] - 6 * u];
      labels += `<text class="en" data-lb="${idx}" x="${la[0]}" y="${la[1]}" font-size="${14 * u}">${esc(b.name)}</text>`;
      own.forEach((q) => q.forEach((c) => this._corners.push({ i: idx, p: c })));
      d.blds.slice(i + 1).forEach((o) => { if (own.some((q) => (shapes[o.id] || []).some((r) => polysOverlap(q, r)))) warn.push(b.name + " / " + o.name); });
    });
    const byId = {};
    d.blds.forEach((b) => { byId[b.id] = b; });
    (site.links || []).forEach((l, j) => {
      const A = byId[l.plan], Bb = byId[l.to];
      if (!A || !Bb) return;
      const p = A.T(l.at), q = Bb.T(l.to_at), len = Math.sqrt((l.dx || 0) * (l.dx || 0) + (l.dy || 0) * (l.dy || 0));
      const lab = len ? (+len.toFixed(2)) + " m" : "0";
      g += `<g class="el" data-l="${j}"><line x1="${q[0]}" y1="${q[1]}" x2="${p[0]}" y2="${p[1]}" stroke-width="${2 * u}" stroke-dasharray="${4 * u} ${3 * u}"/>` +
        `<circle cx="${p[0]}" cy="${p[1]}" r="${4 * u}"/><circle cx="${q[0]}" cy="${q[1]}" r="${4 * u}"/>` +
        `<text x="${(p[0] + q[0]) / 2 + 6 * u}" y="${(p[1] + q[1]) / 2 - 6 * u}" font-size="${12 * u}">📏 ${lab}</text>` +
        `<line class="elh" x1="${q[0]}" y1="${q[1]}" x2="${p[0]}" y2="${p[1]}" stroke-width="${12 * u}"/></g>`;
    });
    g += labels + handles + `<circle class="esnap" r="${7 * u}" cx="-99999" cy="-99999" stroke-width="${2 * u}"/>`;
    this._snapPolys = Object.keys(shapes).reduce((l, kk) => l.concat(shapes[kk].map((q) => ({ poly: q }))), [])
      .concat(site.areas.map((a, ai) => ({ poly: a.poly || [], area: ai })).filter((x) => x.poly.length > 1));
    {  // compass rose, bottom right
      const nr = site.north || 0, cx = v[0] + v[2] - 34 * u, cy = v[1] + v[3] - 34 * u;
      g += `<g class="erose" transform="translate(${cx} ${cy}) rotate(${nr}) scale(${u})"><circle r="20"/><path class="rs" d="M0 -17 L5 0 L0 17 L-5 0 Z"/>` +
        `<path class="rn" d="M0 -17 L5 0 L-5 0 Z"/><text y="-26" transform="rotate(${-nr} 0 -26)">N</text></g>`;
    }
    if (cornerMode) g += this._corners.map((c) => `<circle class="ec" cx="${c.p[0]}" cy="${c.p[1]}" r="${4 * u}"/>`).join("");
    const marks = (st.pts || []).map((q) => (q.p || q));
    if (k === "draw") g += `<polyline class="ed" points="${pts(marks)}" stroke-width="${2 * u}"/>`;
    if ((k === "bgscale" || k === "bgturn") && marks.length === 2) g += `<polyline class="ed" points="${pts(marks)}" stroke-width="${2 * u}"/>`;
    g += marks.map((q, j) => `<circle class="ep" cx="${q[0]}" cy="${q[1]}" r="${5 * u}"/><text class="eq" x="${q[0] + 7 * u}" y="${q[1] - 7 * u}" font-size="${12 * u}">${j + 1}</text>`).join("");
    host.innerHTML = `<svg viewBox="${v.join(" ")}" class="${k !== "move" ? "pick" : ""}">${g}</svg>`;
    this.querySelector(".fl-warn").textContent = (warn.length ? t.overlap + warn.join(", ") + " " : "") + (this._note || "");
    this._note = "";
    this._bindCanvas(host.querySelector("svg"), u);
  }

  _bindCanvas(svg, u) {
    const coord = this.querySelector(".fl-coord");
    const at = (e) => { const q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; const m = svg.getScreenCTM(); const r = m ? q.matrixTransform(m.inverse()) : q; return [r.x, r.y]; };
    const corner = (p) => {  // nearest building corner within 12 px
      let best = null, bd = 12 * u;
      (this._corners || []).forEach((c) => { const dd = Math.sqrt(Math.pow(c.p[0] - p[0], 2) + Math.pow(c.p[1] - p[1], 2)); if (dd < bd) { bd = dd; best = c; } });
      return best;
    };
    /* Point snap for areas: corners of buildings and areas, then their edges, then 45°/90° from the previous point,
       then a 25 cm grid. Shift: free. skip = [area, vertex] being moved. */
    const mark = svg.querySelector(".esnap");
    const snap = (p, skip, prev, free) => {
      const show = (q) => { mark.setAttribute("cx", q ? q[0] : -99999); mark.setAttribute("cy", q ? q[1] : -99999); };
      if (free) { show(null); return [+p[0].toFixed(2), +p[1].toFixed(2)]; }
      const R = 12 * u, D = (a, b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
      let best = null, bd = R;
      (this._snapPolys || []).forEach((sp) => sp.poly.forEach((q, vi) => {
        if (skip && sp.area === skip[0] && vi === skip[1]) return;
        const dd = D(q, p); if (dd < bd) { bd = dd; best = q; }
      }));
      if (best) { show(best); return best.slice(); }
      (this._snapPolys || []).forEach((sp) => sp.poly.forEach((a, vi) => {
        const b = sp.poly[(vi + 1) % sp.poly.length];
        if (skip && sp.area === skip[0] && (vi === skip[1] || (vi + 1) % sp.poly.length === skip[1])) return;
        if (sp.area !== undefined && vi === sp.poly.length - 1 && sp.poly.length < 3) return;
        const ex = b[0] - a[0], ey = b[1] - a[1], L = ex * ex + ey * ey;
        if (!L) return;
        const tt = Math.max(0, Math.min(1, ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / L)), q = [a[0] + ex * tt, a[1] + ey * tt];
        const dd = D(q, p); if (dd < bd) { bd = dd; best = q; }
      }));
      if (best) { show(best); return [+best[0].toFixed(3), +best[1].toFixed(3)]; }
      show(null);
      let q = [Math.round(p[0] * 4) / 4, Math.round(p[1] * 4) / 4];
      if (prev) {  // 45° steps from the previous point
        const dx = p[0] - prev[0], dy = p[1] - prev[1], len = Math.sqrt(dx * dx + dy * dy);
        const ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4), al = Math.atan2(dy, dx);
        if (len > 0 && Math.abs(Math.sin(al - ang)) * len < R) q = [+(prev[0] + Math.cos(ang) * Math.round(len * 4) / 4).toFixed(3), +(prev[1] + Math.sin(ang) * Math.round(len * 4) / 4).toFixed(3)];
      }
      return q;
    };
    svg.addEventListener("wheel", (e) => {  // zoom at the pointer (Shift / Alt over a building: turn / scale)
      const eb = e.target.closest ? e.target.closest(".eb") : null;
      if (eb && (e.shiftKey || e.altKey) && this._tool === "move") {
        e.preventDefault();
        const i = +eb.getAttribute("data-b");
        this._emit((s) => {
          const b = s.buildings[i];
          if (e.shiftKey) b.rotation = +(((b.rotation || 0) + (e.deltaY < 0 ? 1 : -1)) % 360).toFixed(2);
          else b.scale = Math.max(0.01, +((b.scale || 1) * (e.deltaY < 0 ? 1.01 : 0.99)).toFixed(4));
        });
        return;
      }
      if (this._tool === "bgmove" && this._s.site_background && (e.shiftKey || e.altKey)) {  // turn / scale the background at the pointer
        e.preventDefault();
        const c = at(e);
        this._emit((s) => {
          const gb = s.site_background;
          if (e.shiftKey) this._turnBg(gb, c, e.deltaY < 0 ? 0.5 : -0.5);
          else {
            const kf = e.deltaY < 0 ? 1.01 : 0.99;
            gb.x = +(c[0] + ((gb.x || 0) - c[0]) * kf).toFixed(3); gb.y = +(c[1] + ((gb.y || 0) - c[1]) * kf).toFixed(3);
            gb.width = +(gb.width * kf).toFixed(3); if (gb.height) gb.height = +(gb.height * kf).toFixed(3);
          }
        });
        return;
      }
      e.preventDefault();
      const p = at(e), f = e.deltaY > 0 ? 1.15 : 0.87, v = this._vb;
      this._vb = [p[0] - (p[0] - v[0]) * f, p[1] - (p[1] - v[1]) * f, v[2] * f, v[3] * f];
      this._canvas();
    }, { passive: false });
    svg.addEventListener("pointermove", (e) => {
      const p = at(e);
      coord.textContent = "x " + p[0].toFixed(2) + " · y " + p[1].toFixed(2) + " m";
      const dg = this._drag;
      if (this._tool === "draw" && !dg) { const st0 = this._step.pts; snap(p, null, st0[st0.length - 1], e.shiftKey); }
      if (!dg || dg.id !== e.pointerId) return;
      if (dg.bg) {
        dg.d = [+(p[0] - dg.p[0]).toFixed(2), +(p[1] - dg.p[1]).toFixed(2)];
        if (dg.el) {  // live: the image follows, its turn stays around its own corner
          const nx = dg.o[0] + dg.d[0], ny = dg.o[1] + dg.d[1], r0 = this._s.site_background.rotation;
          dg.el.setAttribute("x", nx); dg.el.setAttribute("y", ny);
          if (r0) dg.el.setAttribute("transform", `rotate(${r0} ${nx} ${ny})`);
        }
        return;
      }
      if (dg.av) {  // moving a corner of an area
        const poly = this._s.areas[dg.av[0]].poly, n = poly.length;
        dg.q = snap(p, dg.av, null, e.shiftKey);
        dg.el.setAttribute("cx", dg.q[0]); dg.el.setAttribute("cy", dg.q[1]);
        const np = poly.slice(); np[dg.av[1]] = dg.q;
        const pg = svg.querySelector(`.ea[data-ea="${dg.av[0]}"]`);
        if (pg && n) pg.setAttribute("points", pts(np));
        return;
      }
      if (dg.pan) {
        const dx = (e.clientX - dg.c[0]) * u, dy = (e.clientY - dg.c[1]) * u;
        svg.setAttribute("viewBox", [dg.vb[0] - dx, dg.vb[1] - dy, dg.vb[2], dg.vb[3]].join(" "));
        dg.nv = [dg.vb[0] - dx, dg.vb[1] - dy, dg.vb[2], dg.vb[3]];
        return;
      }
      const dx = +(p[0] - dg.p[0]).toFixed(2), dy = +(p[1] - dg.p[1]).toFixed(2);
      if (dg.lab !== undefined) {
        dg.at = [+(dg.o[0] + dx).toFixed(2), +(dg.o[1] + dy).toFixed(2)];
        dg.el.setAttribute("x", dg.at[0]); dg.el.setAttribute("y", dg.at[1]);
        return;
      }
      dg.pos = { x: +(dg.ox + dx).toFixed(3), y: +(dg.oy + dy).toFixed(3) };
      dg.el.setAttribute("transform", `translate(${dx} ${dy})`);
    });
    svg.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const p = at(e), k = this._tool;
      if (k === "bgmove" && this._s.site_background) {  // drag the background
        svg.setPointerCapture(e.pointerId);
        this._drag = { bg: true, el: svg.querySelector(".ebg"), id: e.pointerId, p: p, o: [this._s.site_background.x || 0, this._s.site_background.y || 0] };
        return;
      }
      if (k !== "move" && k !== "edit") return;
      const el = e.target.closest ? e.target.closest(".el") : null;
      if (el) {
        const j = +el.getAttribute("data-l");
        if (window.confirm(this._t.delLink)) this._emit((s) => { s.links.splice(j, 1); });
        return;
      }
      const av = e.target.closest ? e.target.closest(".av") : null;
      if (av) {
        svg.setPointerCapture(e.pointerId);
        this._drag = { av: [+av.getAttribute("data-ea"), +av.getAttribute("data-v")], el: av, id: e.pointerId };
        return;
      }
      const lb = e.target.closest ? e.target.closest(".en") : null;
      if (lb) {
        svg.setPointerCapture(e.pointerId);
        this._drag = { lab: +lb.getAttribute("data-lb"), el: lb, id: e.pointerId, p: p, o: [+lb.getAttribute("x"), +lb.getAttribute("y")] };
        return;
      }
      let eb = e.target.closest && k === "move" ? e.target.closest(".eb") : null;
      if (eb) {
        const bi = this._s.buildings[+eb.getAttribute("data-b")];
        if (bi && (this._s.links || []).some((l) => l.plan === bi.plan)) { this._note = this._t.fixed; this.querySelector(".fl-warn").textContent = this._note; eb = null; }
      }
      svg.setPointerCapture(e.pointerId);
      if (eb) {
        const i = +eb.getAttribute("data-b"), b = this._bld(i);
        if (!b) return;
        this._drag = { i: i, el: eb, id: e.pointerId, p: p, ox: b.pos.x, oy: b.pos.y, pos: { x: b.pos.x, y: b.pos.y } };
      } else this._drag = { pan: true, id: e.pointerId, c: [e.clientX, e.clientY], vb: this._vb.slice() };
    });
    svg.addEventListener("pointerup", () => {
      const dg = this._drag;
      if (!dg) return;
      this._drag = null;
      if (dg.pan) { if (dg.nv) { this._vb = dg.nv; this._canvas(); } return; }
      if (dg.bg) { if (dg.d) this._emit((s) => { s.site_background.x = +(dg.o[0] + dg.d[0]).toFixed(3); s.site_background.y = +(dg.o[1] + dg.d[1]).toFixed(3); }); return; }
      if (dg.av) { if (dg.q) this._emit((s) => { s.areas[dg.av[0]].poly[dg.av[1]] = dg.q; }); return; }
      if (dg.lab !== undefined) { if (dg.at) this._emit((s) => { s.buildings[dg.lab].label_at = dg.at; }); return; }
      if (dg.pos.x !== dg.ox || dg.pos.y !== dg.oy) this._emit((s) => { s.buildings[dg.i].x = dg.pos.x; s.buildings[dg.i].y = dg.pos.y; });
    });
    svg.addEventListener("click", (e) => {
      const k = this._tool, st = this._step, p = at(e);
      if (k === "move" || k === "edit") return;
      if (k === "draw") {
        const q = snap(p, null, st.pts[st.pts.length - 1], e.shiftKey);
        if (st.pts.length > 2 && Math.abs(q[0] - st.pts[0][0]) + Math.abs(q[1] - st.pts[0][1]) < 10 * u) { this._finishDraw(); return; }
        st.pts.push(q);
      } else if (k === "corner") {
        const c = corner(p);
        if (!c || st.pts.length >= 2 || (st.pts.length === 1 && c.i === st.pts[0].i)) return;
        st.pts.push(c);
      } else if (k === "align") {
        if (st.pts.length >= 4) return;
        if (st.pts.length % 2 === 0) { const c = corner(p); if (!c || (st.pts.length === 2 && c.i !== st.pts[0].i)) return; st.pts.push(c); }
        else st.pts.push({ p: p });
      } else if (k === "bgscale" || k === "bgturn") {
        if (st.pts.length >= 2 || !this._s.site_background) return;
        st.pts.push(p);
      }
      this._toolbar();
      this._canvas();
    });
    svg.addEventListener("dblclick", (e) => {
      const av = e.target.closest ? e.target.closest(".av") : null;
      if (av && (this._tool === "move" || this._tool === "edit")) {  // double-click on an area corner removes it
        const ai = +av.getAttribute("data-ea"), vi = +av.getAttribute("data-v");
        if (this._s.areas[ai].poly.length > 3) this._emit((s) => { s.areas[ai].poly.splice(vi, 1); });
        return;
      }
      const ea = e.target.closest ? e.target.closest(".ea") : null;
      if (ea && (this._tool === "move" || this._tool === "edit")) {  // double-click on an area edge adds a corner there
        const ai = +ea.getAttribute("data-ea"), poly = this._s.areas[ai].poly, p = at(e);
        let bi = 0, bd = Infinity;
        poly.forEach((a, i) => {
          const b = poly[(i + 1) % poly.length], ex = b[0] - a[0], ey = b[1] - a[1], L = ex * ex + ey * ey || 1;
          const tt = Math.max(0, Math.min(1, ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / L));
          const dd = Math.pow(a[0] + ex * tt - p[0], 2) + Math.pow(a[1] + ey * tt - p[1], 2);
          if (dd < bd) { bd = dd; bi = i; }
        });
        this._emit((s) => { s.areas[ai].poly.splice(bi + 1, 0, [+p[0].toFixed(2), +p[1].toFixed(2)]); });
        return;
      }
      const lb = e.target.closest ? e.target.closest(".en") : null;
      if (lb && this._tool === "move") { const i = +lb.getAttribute("data-lb"); this._emit((s) => { delete s.buildings[i].label_at; }); }
    });
    svg.addEventListener("dblclick", (e) => { if (this._tool === "draw") { e.preventDefault(); this._step.pts.pop(); this._finishDraw(); } });
  }
}

FloorplanLiteSiteEditor.styles = `
  floorplan-lite-site-editor { display: block; height: 100%; }
  .fl-cv { position: relative; height: 100%; display: flex; flex-direction: column; padding-left: 52px; }
  .fl-tools { flex: 0 0 auto; padding: 6px 8px; }
  .fl-tbr { position: absolute; left: 0; top: 0; bottom: 0; width: 52px; display: flex; flex-direction: column; align-items: center; padding-top: 8px;
    border-right: 1px solid var(--divider-color, #444); overflow-y: auto; }
  .fl-tb span { display: none; }
  .fl-tb { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; margin: 0 0 6px 0; padding: 0; font: inherit; font-size: 13px; cursor: pointer;
    border-radius: 6px; border: 1px solid var(--divider-color, rgba(127, 127, 127, .4)); background: transparent; color: var(--primary-text-color); }
  .fl-tb.on { background: var(--primary-color, #03a9f4); color: var(--text-primary-color, #fff); border-color: var(--primary-color, #03a9f4); }
  .fl-tb ha-icon { --mdc-icon-size: 22px; display: flex; }
  .fl-step { font-size: 13px; min-height: 22px; } .fl-step input[type=number] { width: 80px; font: inherit; }
  .fl-canvas { flex: 1 1 auto; min-height: 240px; position: relative; }
  .fl-canvas svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #141c32; touch-action: none; display: block; cursor: grab; }
  .fl-canvas svg.pick { cursor: crosshair; }
  .fl-canvas .gr { stroke: rgba(160, 182, 230, .18); } .fl-canvas .gt { fill: rgba(205, 216, 240, .6); }
  .fl-canvas .ea { fill: rgba(255, 214, 160, .18); stroke: #ffd6a0; }
  .fl-canvas .av { fill: #ffd6a0; stroke: #141c32; cursor: move; } .fl-canvas .av:hover { fill: #fff; }
  .fl-canvas .esnap { fill: none; stroke: #7dffb0; pointer-events: none; }
  .fl-canvas .et { fill: #ffd6a0; text-anchor: middle; }
  .fl-canvas .eb { cursor: move; } .fl-canvas .eb polygon { fill: rgba(79, 111, 216, .35); stroke: #8d9cc4; }
  .fl-canvas .eb:hover polygon { fill: rgba(79, 111, 216, .55); }
  .fl-canvas .en { fill: #eef2fb; text-anchor: middle; dominant-baseline: central; }
  .fl-canvas .el line { stroke: #ffd166; } .fl-canvas .el circle { fill: #ffd166; } .fl-canvas .el text { fill: #ffd166; cursor: pointer; }
  .fl-canvas .el .elh { stroke: transparent; cursor: pointer; }
  .fl-canvas .en { cursor: move; }
  .fl-canvas .erose circle { fill: rgba(10, 16, 32, .6); stroke: rgba(255, 255, 255, .35); } .fl-canvas .erose .rs { fill: rgba(255, 255, 255, .45); }
  .fl-canvas .erose .rn { fill: #ff6b5e; } .fl-canvas .erose text { fill: #fff; font-size: 11px; font-weight: 700; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
  .fl-canvas .ec { fill: #9fd3ff; } .fl-canvas .ed { fill: none; stroke: #ffd166; } .fl-canvas .ep { fill: #ffd166; } .fl-canvas .eq { fill: #ffd166; }
  .fl-coord { position: absolute; left: 62px; bottom: 6px; font-size: 12px; color: #cdd8f0; pointer-events: none; }
  .fl-warn { position: absolute; right: 10px; bottom: 6px; font-size: 12px; color: #ff8a80; pointer-events: none; }
  .fl-hint { font-size: 13px; opacity: .75; margin: 8px; }
  .fl-sd h4 { margin: 14px 0 6px; }
  .fl-item { border: 1px solid var(--divider-color, rgba(127, 127, 127, .3)); border-radius: 8px; padding: 8px 10px; margin: 0 0 10px; }
  .fl-head { display: flex; align-items: center; flex-wrap: wrap; margin-bottom: 6px; } .fl-head b { margin-right: 8px; }
  .fl-btn, .fl-mini { font: inherit; cursor: pointer; border-radius: 6px; border: 1px solid var(--divider-color, rgba(127, 127, 127, .4));
    background: transparent; color: var(--primary-text-color); }
  .fl-btn { padding: 6px 12px; } .fl-mini { padding: 2px 8px; margin-left: 6px; font-size: 12px; }
  .fl-prev { font-size: 12px; margin-left: 10px; } .fl-prev input { width: 110px; font: inherit; }
`;

class FloorplanLiteCardEditor extends HTMLElement {
  setConfig(config) {
    const reload = !this._config || this._config.plan !== config.plan;
    this._config = JSON.parse(JSON.stringify(config || {}));
    if (reload && this._hass) this._loadPlan(); else this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._load();
    else { if (this._form) this._form.hass = hass; (this._subforms || []).forEach((f) => { f.hass = hass; }); }
  }

  get _t() {
    const l = (this._hass && ((this._hass.locale && this._hass.locale.language) || this._hass.language)) || "en";
    return ED[String(l).slice(0, 2)] || ED.en;
  }

  async _load() {
    try { this._plans = await this._hass.callWS({ type: "floorplan_lite/list" }); } catch (e) { this._plans = []; }
    try { this._users = (await this._hass.callWS({ type: "config/auth/list" })).filter((u) => !u.system_generated); } catch (e) { this._users = null; }
    this._loadPlan();
  }

  async _loadPlan() {
    const id = this._config && this._config.plan;
    let plan = null;
    if (id) { try { plan = await this._hass.callWS({ type: "floorplan_lite/get", plan_id: id }); } catch (e) { plan = null; } }
    this._planObj = plan;
    this._levels = plan ? plan.levels || [] : [];
    this._planBlds = plan ? plan.buildings || [] : [];
    this._planAlign = !!(plan && plan.align_levels);
    this._planLabels = planLabels(plan);
    this._render();
  }

  _isSite() { return !!(this._config.site || (this._planObj && this._planObj.site)); }

  _siteCfg() { return Object.assign({}, this._planObj && this._planObj.site ? this._planObj.site : {}, this._config.site || {}); }

  async _sitePlan(id) {
    const c = this._sp || (this._sp = {});
    if (c[id] !== undefined || !id) return;
    c[id] = null;
    try { c[id] = await this._hass.callWS({ type: "floorplan_lite/get", plan_id: id }); } catch (e) { c[id] = false; }
    this._renderSite();
  }

  _geo() {
    const site = this._siteCfg(), plans = {};
    let missing = false;
    (site.buildings || []).forEach((b) => {
      if (!b || !b.plan) return;
      const p = this._sp && this._sp[b.plan];
      if (p === undefined) { this._sitePlan(b.plan); missing = true; } else if (p === null) missing = true; else if (p) plans[b.plan] = p;
    });
    return missing ? null : buildSite(Object.assign({}, site, { show: undefined }), plans, this._config);
  }

  _emit(c) {
    this._config = c;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: JSON.parse(JSON.stringify(c)) }, bubbles: true, composed: true }));
  }

  _sel(options, extra) { return { select: Object.assign({ mode: "dropdown", options: options }, extra || {}) }; }

  _schema() {
    const t = this._t, lv = (this._levels || []).map((l) => ({ value: l.id, label: l.name }));
    const sel = (o, x) => this._sel(o, x);
    const sc = [];
    if (!this._config.site) sc.push({ name: "plan", required: true, selector: sel((this._plans || []).map((p) => ({ value: p.id, label: p.name }))) });
    if (!this._isSite()) {
      sc.push({ name: "mode", selector: sel([{ value: "swipe", label: t.swipe }, { value: "all", label: t.all }], { mode: "list" }) });
      if (this._config.mode === "swipe" && lv.length) sc.push({ name: "start", selector: sel(lv) });
      if (lv.length > 1) sc.push({ name: "floors", selector: sel(lv, { multiple: true, mode: "list" }) });
      if ((this._planBlds || []).length > 1) sc.push({ name: "building", selector: sel([{ value: "", label: "–" }].concat(this._planBlds.map((b) => ({ value: b.id, label: b.name })))) });
    }
    sc.push(
      { name: "align", selector: { boolean: {} } },
      { name: "background", selector: { boolean: {} } },
      { name: "intro", selector: { boolean: {} } },
      { name: "tap", selector: sel([{ value: "popup", label: t.popup }, { value: "none", label: t.none }]) },
      { name: "hide_label", selector: { label: { multiple: true } } },
      { name: "script", selector: { entity: { filter: { domain: "script" } } } },
      { name: "scroll_keys", selector: { boolean: {} } });
    return sc;
  }

  _data() {
    const c = this._config;
    return {
      building: c.building || "",
      plan: c.plan || "", mode: c.mode === "swipe" ? "swipe" : "all", start: c.start || "", floors: c.floors || [],
      align: c.align === undefined ? this._planAlign : !!c.align, background: c.background !== false, intro: c.intro !== false,
      tap: c.tap === "none" ? "none" : "popup", scroll_keys: c.scroll_keys === true, script: c.script ? (String(c.script).indexOf("script.") === 0 ? c.script : "script." + c.script) : "", hide_label: c.hide_label === undefined ? this._planLabels || [] : (Array.isArray(c.hide_label) ? c.hide_label : [c.hide_label]),
    };
  }

  _changed(v) {
    const c = Object.assign({}, this._config), set = (k, val, keep) => { if (keep) c[k] = val; else delete c[k]; };
    const planChanged = !c.site && v.plan !== c.plan;
    const site = this._isSite() && !planChanged;
    if (!c.site) c.plan = v.plan;
    if (!site) {
      set("mode", "swipe", v.mode === "swipe");
      set("start", v.start, v.mode === "swipe" && v.start && !planChanged);
      set("floors", v.floors, v.floors && v.floors.length && !planChanged && v.floors.length < (this._levels || []).length);
      set("building", v.building, v.building && !planChanged);
    }
    set("align", v.align, !planChanged && v.align !== this._planAlign);
    set("background", false, v.background === false);
    set("intro", false, v.intro === false);
    set("tap", "none", v.tap === "none");
    set("scroll_keys", true, v.scroll_keys === true);
    set("script", v.script, v.script && v.script !== "script.raum_klick");
    const hl = (v.hide_label || []).slice().sort();
    set("hide_label", hl, !planChanged && hl.join() !== (this._planLabels || []).slice().sort().join());
    if (planChanged) ["mode", "start", "floors", "building"].forEach((k) => { delete c[k]; });
    this._emit(c);
    if (planChanged) this._loadPlan(); else this._render();
  }

  _render() {
    if (!this._hass || !this._config || !this._plans) return;
    const t = this._t;
    if (!this._box) {
      this._box = document.createElement("div");
      this._box.innerHTML = `<style>${FloorplanLiteSiteEditor.styles}</style>` +
        `<div class="fl-msg"></div><div class="fl-form"></div><div class="fl-site"></div><p class="fl-hint fl-foot"></p>`;
      this.appendChild(this._box);
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => this._t[s.name] || s.name;
      this._form.addEventListener("value-changed", (e) => this._changed(e.detail.value));
      this._box.querySelector(".fl-form").appendChild(this._form);
    }
    const msg = this._box.querySelector(".fl-msg");
    msg.innerHTML = this._plans.length ? "" : `<p class="fl-hint">${esc(t.noPlans)}</p>`;
    this._box.querySelector(".fl-foot").innerHTML = `${esc(this._isSite() ? t.siteHint : t.hint)} <a href="/floorplan-lite">${esc(t.open)} →</a>`;
    this._form.hass = this._hass;
    this._form.schema = this._schema();
    this._form.data = this._data();
    this._renderSite();
  }

  _viewOptions(geo, withEmpty) {
    const out = withEmpty ? [{ value: "", label: "–" }] : [];
    out.push({ value: "grundstueck", label: this._t.gsite });
    if (geo) geo.blds.forEach((b) => { out.push({ value: b.id, label: b.name }); b.titles.forEach((x) => out.push({ value: x.key, label: b.name + " · " + x.name })); });
    return out;
  }

  _roomOptions(geo) {
    const out = [{ value: "", label: "–" }];
    if (!geo) return out;
    Object.keys(geo.info).forEach((k) => {
      const i = geo.info[k];
      if (!i || !i.id) return;
      const b = i.bld ? geo.blds.filter((x) => x.id === i.bld)[0] : null;
      out.push({ value: i.id, label: (i.name || i.id) + (b ? " (" + b.name + ")" : "") });
    });
    return out;
  }

  _list(host, list, head, schema, data, change) { return FloorplanLiteSiteEditor.prototype._list.call(this, host, list, head, schema, data, change); }

  /* Card settings of a property: users (start view, location), more settings. The layout itself is in the floor plan editor. */
  _renderSite() {
    const host = this._box && this._box.querySelector(".fl-site");
    if (!host) return;
    if (!this._isSite()) { host.innerHTML = ""; this._built = false; return; }
    const t = this._t, site = this._siteCfg(), geo = this._geo(), cfg = this._config;
    if (!this._built) {
      this._built = true;
      this._forms = [];
      host.innerHTML = `<h4>${esc(t.sUsers)}</h4><div class="fl-users"></div><button class="fl-btn" data-a="addu">${esc(t.addUser)}</button>` +
        `<p class="fl-hint">${esc(t.params)}</p><h4>${esc(t.sOpts)}</h4><div class="fl-opts"></div>`;
      host.querySelector('[data-a="addu"]').addEventListener("click", () => {
        const c = JSON.parse(JSON.stringify(this._config));
        const f = c.follow && !Array.isArray(c.follow) ? c.follow : {};
        const taken = (x) => Object.prototype.hasOwnProperty.call(f, x);
        let n = (this._users || []).map((u) => u.name).filter((x) => !taken(x))[0] || "benutzer", k = 1;
        while (taken(n)) n = "benutzer_" + k++;
        f[n] = { art: "standort" };
        c.follow = f;
        this._emit(c); this._renderSite();
      });
      const opt = document.createElement("ha-form");
      opt.computeLabel = (sc) => this._t[sc.name] || sc.name;
      opt.addEventListener("value-changed", (e) => this._optChanged(e.detail.value));
      host.querySelector(".fl-opts").appendChild(opt);
      this._opt = opt;
      this._subforms = (this._subforms || []).concat([opt]);
    }
    this._subforms = (this._forms || []).concat([this._opt]);
    const ents = (dom, multi) => ({ entity: { multiple: !!multi, filter: { domain: dom } } });
    const fol = cfg.follow && !Array.isArray(cfg.follow) ? cfg.follow : {};
    const users = Object.keys(fol).map((k) => Object.assign({ user: k }, fol[k]));
    const uopts = (this._users || []).map((u) => ({ value: u.name, label: u.name + (u.username ? " (" + u.username + ")" : "") }));
    this._list(host.querySelector(".fl-users"), users,
      (hd, u, i) => {
        const fixed = u.art === "fest" && u.vorlage;
        hd.innerHTML = `<b>${esc(u.user)}</b><button class="fl-mini" data-del="${i}">${esc(t.del)}</button>` +
          (fixed ? `<span class="fl-prev">${esc(t.preview)} <input type="text" value="${esc(this._prevDev || "")}"> → <code></code></span>` : "");
        hd.querySelector("[data-del]").addEventListener("click", () => {
          const c = JSON.parse(JSON.stringify(this._config));
          delete c.follow[u.user];
          if (!Object.keys(c.follow).length) delete c.follow;
          this._emit(c); this._renderSite();
        });
        if (fixed) {
          const inp = hd.querySelector("input"), out = hd.querySelector("code");
          const run = () => { this._prevDev = inp.value; this._preview(u, inp.value, out); };
          inp.addEventListener("change", run);
          run();
        }
      },
      (u) => {
        const sc = [{ name: "user", required: true, selector: uopts.length ? this._sel(uopts, { custom_value: true }) : { text: {} } },
          { name: "art", selector: this._sel([{ value: "standort", label: t.standort }, { value: "fest", label: t.fest }], { mode: "list" }) }];
        if (u.art === "fest") {
          sc.push({ name: "ansicht", selector: this._sel(this._viewOptions(geo, true)) }, { name: "raum", selector: this._sel(this._roomOptions(geo)) },
            { name: "vorlage", selector: { template: {} } });
        } else {
          sc.push({ name: "geofence", selector: ents(["person", "device_tracker", "binary_sensor"]) }, { name: "ble", selector: ents("sensor", true) },
            { name: "ble_letzter", selector: ents("sensor", true) }, { name: "max_alter", selector: { number: { mode: "box", min: 1, max: 1440, step: 1 } } });
        }
        return sc;
      },
      (u) => ({ user: u.user, art: u.art === "fest" ? "fest" : "standort", ansicht: u.ansicht || "", raum: u.raum || "", vorlage: u.vorlage || "",
        geofence: u.geofence || "", ble: listOf(u.ble), ble_letzter: listOf(u.ble_letzter), max_alter: u.max_alter || 30 }),
      (i, v) => {
        const c = JSON.parse(JSON.stringify(this._config)), old = users[i].user, f = c.follow || {};
        const e = { art: v.art };
        if (v.art === "fest") { ["ansicht", "raum", "vorlage"].forEach((k) => { if (v[k]) e[k] = v[k]; }); }
        else {
          if (v.geofence) e.geofence = v.geofence;
          if (v.ble && v.ble.length) e.ble = v.ble;
          if (v.ble_letzter && v.ble_letzter.length) e.ble_letzter = v.ble_letzter;
          if (v.max_alter && v.max_alter !== 30) e.max_alter = v.max_alter;
        }
        const nf = {};
        Object.keys(f).forEach((k) => { if (k === old) nf[v.user || old] = e; else nf[k] = f[k]; });
        c.follow = nf;
        this._emit(c); this._renderSite();
      });
    this._subforms = (this._forms || []).concat([this._opt]);
    this._opt.hass = this._hass;
    this._opt.schema = [
      { name: "sstart", selector: this._sel(this._viewOptions(geo, false).concat(this._roomOptions(geo).slice(1))) },
      { name: "show", selector: this._sel((site.buildings || []).map((b) => ({ value: b.plan, label: b.name || b.plan })), { multiple: true, mode: "list" }) },
      { name: "ausrichtung", selector: this._sel([{ value: "", label: t.oSite }, { value: "achse", label: t.oAxis }, { value: "norden", label: t.oNorth }]) },
      { name: "kompass", selector: { boolean: {} } },
      { name: "follow_floor", selector: { boolean: {} } },
      { name: "follow_hold", selector: { number: { mode: "box", min: 0, max: 3600, step: 10, unit_of_measurement: "s" } } },
      { name: "nachbar_rand", selector: { number: { mode: "slider", min: 0, max: 60, step: 5, unit_of_measurement: "%" } } },
      { name: "musik_aus", selector: this._sel([{ value: "pause", label: t.pause }, { value: "stop", label: t.stop }, { value: "off", label: t.off }]) },
      { name: "aus_mit_aussen", selector: { boolean: {} } },
      { name: "aus_schalter", selector: { object: {} } },
      { name: "buttons", selector: { object: {} } },
    ];
    this._opt.data = { sstart: cfg.start || "grundstueck", show: listOf(cfg.site && cfg.site.show), follow_floor: cfg.follow_floor !== false,
      ausrichtung: cfg.ausrichtung || "", kompass: cfg.kompass !== false,
      follow_hold: typeof cfg.follow_hold === "number" ? cfg.follow_hold : 120,
      nachbar_rand: Math.round((typeof cfg.nachbar_rand === "number" ? cfg.nachbar_rand : 0.15) * 100), musik_aus: cfg.musik_aus || "pause",
      aus_mit_aussen: cfg.aus_mit_aussen === true, aus_schalter: cfg.aus_schalter || {}, buttons: cfg.buttons || {} };
  }

  _optChanged(v) {
    const c = JSON.parse(JSON.stringify(this._config)), set = (o, k, val, keep) => { if (keep) o[k] = val; else delete o[k]; };
    set(c, "start", v.sstart, v.sstart && v.sstart !== "grundstueck");
    if (v.show && v.show.length) c.site = Object.assign({}, c.site || {}, { show: v.show });
    else if (c.site) { delete c.site.show; if (!Object.keys(c.site).length) delete c.site; }
    set(c, "follow_floor", false, v.follow_floor === false);
    set(c, "ausrichtung", v.ausrichtung, !!v.ausrichtung);
    set(c, "kompass", false, v.kompass === false);
    set(c, "follow_hold", v.follow_hold, typeof v.follow_hold === "number" && v.follow_hold !== 120);
    set(c, "nachbar_rand", v.nachbar_rand / 100, typeof v.nachbar_rand === "number" && v.nachbar_rand !== 15);
    set(c, "musik_aus", v.musik_aus, v.musik_aus && v.musik_aus !== "pause");
    set(c, "aus_mit_aussen", true, v.aus_mit_aussen === true);
    ["aus_schalter", "buttons"].forEach((k) => set(c, k, v[k], v[k] && typeof v[k] === "object" && Object.keys(v[k]).length));
    this._emit(c);
    this._renderSite();
  }

  _preview(u, dev, out) {  // the template's result for a device name
    if (!this._hass || !this._hass.connection) return;
    out.textContent = "…";
    let un = null, done = false;
    this._hass.connection.subscribeMessage((m) => {
      if (done) return;
      done = true;
      out.textContent = m && m.result !== undefined ? String(m.result) : "?";
      if (un) un();
    }, { type: "render_template", template: u.vorlage, variables: { benutzer: u.user, geraet: dev || "" } })
      .then((x) => { un = x; if (done) x(); })
      .catch((e) => { out.textContent = (e && e.message) || "?"; });
  }
}

/* Register the elements. Another dashboard plugin may swap window.customElements for a polyfilled registry right after
   start-up (seen in the wild: this file loads first, its elements were then unknown and every card showed a
   configuration error). So check again for a few seconds and register again where needed – with a subclass if the
   registry refuses a constructor it has seen before. */
const flDefine = () => {
  [["floorplan-lite-site-editor", FloorplanLiteSiteEditor], ["floorplan-lite-card-editor", FloorplanLiteCardEditor], ["floorplan-lite-card", FloorplanLiteCard]].forEach((d) => {
    if (customElements.get(d[0])) return;
    try { customElements.define(d[0], d[1]); } catch (e) {
      try { customElements.define(d[0], class extends d[1] {}); } catch (e2) { /* someone else defined it meanwhile */ }
    }
  });
};
flDefine();
[200, 600, 1500, 3000, 6000, 10000].forEach((t) => setTimeout(flDefine, t));
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "floorplan-lite-card"))
  window.customCards.push({ type: "floorplan-lite-card", name: "Floorplan Lite",
    description: "Floor plan with lights in their colour, presence, motion, windows, shades and music", preview: true });
