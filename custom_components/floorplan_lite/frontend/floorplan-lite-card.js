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
 *   hide_label: no_dboard         # optional: ignore entities with this label (default: the plan's hide_label)
 *   tap: none                     # optional: no pop-up on tap
 *   rooms: {kuche: {licht: [...]}}  # optional: entities per room, override the ones stored with the plan
 * Tapping a room opens the Bubble Card pop-up with the hash #<room>.
 * Mouse / TV remote: left click = pop-up, right click (remote: yellow) once = music start/pause, twice within 0.5 s =
 * room off, mouse wheel = music louder/quieter, ↑/↓ over a room = light scenes (script.raum_klick), ←/→ = level.
 * Touch (tablet/phone): double/triple tap = light scene / room off.
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
const mix = (list) => {  // average weighted by brightness
  let r = 0, g = 0, b = 0, w = 0, top = 0;
  list.forEach((l) => { r += l.c[0] * l.b; g += l.c[1] * l.b; b += l.c[2] * l.b; w += l.b; if (l.b > top) top = l.b; });
  return { rgb: [Math.round(r / w), Math.round(g / w), Math.round(b / w)].join(","), b: top };
};

const TEXT = {
  de: { win: "Fenster offen", shade: "Beschattung zu", music: "Musik läuft", presence: "Präsenz", motion: "Bewegung",
    light: "Licht in seiner Farbe", musicL: "Musik", prev: "Geschoss zurück", next: "Geschoss weiter",
    loading: "Grundriss wird geladen …", missing: "Grundriss „%s“ nicht gefunden – im Editor (Seitenleiste → Floorplan Lite) anlegen.",
    noPlan: "Bitte einen Grundriss wählen (plan: …)." },
  en: { win: "Window open", shade: "Shade closed", music: "Music playing", presence: "Presence", motion: "Motion",
    light: "Light in its colour", musicL: "Music", prev: "Previous level", next: "Next level",
    loading: "Loading floor plan …", missing: "Floor plan “%s” not found – create it in the editor (sidebar → Floorplan Lite).",
    noPlan: "Please choose a floor plan (plan: …)." },
};
const chips = (t) => ({
  w: `<span class="chip win" title="${t.win}"><ha-icon icon="mdi:window-open-variant"></ha-icon></span>`,
  s: `<span class="chip shade" title="${t.shade}"><ha-icon icon="mdi:window-shutter"></ha-icon></span>`,
  m: `<span class="chip music" title="${t.music}"><i></i><i></i><i></i></span>`,
});
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/* Plan from the store → per level everything the drawing needs, rotated and with a view box. */
function prepare(plan, align) {
  const rot = rotator(plan.rotation || 0);
  const R = (poly) => poly.map(rot);
  const floors = {};
  (plan.levels || []).forEach((lv) => {
    const at = (x) => x.level === lv.id;
    const outlines = (plan.outlines || []).filter(at).map((o) => R(o.poly));
    const extra = (plan.lines || []).filter(at).map((l) => ({ poly: R(l.poly), open: !!l.open }));
    const rooms = (plan.rooms || []).filter(at).map((r) => ({
      id: r.id, key: r.key, name: r.name === undefined ? r.id : r.name, poly: R(r.poly),
      labelAt: r.label_at ? rot(r.label_at) : null, small: !!r.small, outdoor: !!r.outdoor, color: r.color,
    }));
    const openings = (plan.openings || []).filter(at).map((o) => {
      const q = Object.assign({}, o, { at: rot(o.at), angle: (o.angle || 0) + (plan.rotation || 0) });
      q.rect = openingRect(q);
      return q;
    });
    let view = lv.view && !plan.rotation ? lv.view : null;
    if (!view) {
      const all = [];
      outlines.forEach((p) => p.forEach((q) => all.push(q)));
      rooms.forEach((r) => r.poly.forEach((q) => all.push(q)));
      extra.forEach((e) => e.poly.forEach((q) => all.push(q)));
      const [x1, y1, x2, y2] = all.length ? bbox(all) : [0, 0, 10, 10];
      view = [x1 - 0.6, y1 - 0.6, x2 - x1 + 1.2, y2 - y1 + 1.2];
    }
    floors[lv.id] = { title: lv.name, short: lv.short || lv.id.toUpperCase(), view, outlines, extra, rooms, openings,
      background: lv.background || null };
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

class FloorplanLiteCard extends HTMLElement {
  static getStubConfig() { return { plan: "", mode: "swipe" }; }

  setConfig(config) {
    if (!config) throw new Error("config missing");
    this._config = Object.assign({}, config);
    this._refs = null;
    this._sig = null;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    if (this._planId !== config.plan) {
      this._unsubscribe();
      this._planId = config.plan;
      this._plan = undefined;
    }
    if (config.plan_data) this._setPlan(config.plan_data);  // plan inline (tests, sharing)
    this._render();
  }

  getCardSize() { return 12; }
  getGridOptions() { return { columns: "full", rows: "auto" }; }

  get _t() {
    const l = this._hass && this._hass.locale && this._hass.locale.language || (this._hass && this._hass.language) || "en";
    return TEXT[String(l).slice(0, 2)] || TEXT.en;
  }

  connectedCallback() {
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
    }
    this._subscribe();
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    if (this._onResize) { window.removeEventListener("resize", this._onResize); this._onResize = null; }
    if (this._onKey) { window.removeEventListener("keydown", this._onKey); this._onKey = null; }
    this._unsubscribe();
  }

  /* ---------- Plan from the integration ---------- */
  _subscribe() {
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
  }

  _setPlan(plan) {
    this._plan = plan;
    const cfg = this._config || {};
    const align = cfg.align === undefined ? !!(plan && plan.align_levels) : !!cfg.align;
    this._floors = plan ? prepare(plan, align) : null;
    const keys = this._floors ? Object.keys(this._floors) : [];
    this._fl = (cfg.floors || keys).filter((k) => this._floors && this._floors[k]);
    if (this._idx === undefined || this._idx >= this._fl.length) this._idx = Math.max(0, this._fl.indexOf(cfg.start || this._fl[0]));
    this._rooms = Object.assign({}, plan && plan.entities || {}, cfg.rooms || {});
    this._hideLabel = cfg.hide_label === undefined ? (plan && plan.hide_label) || "" : cfg.hide_label || "";
    this._idl = this._ids();
    this._refs = null;
    this._sig = null;
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;
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
    const ids = [], rooms = this._rooms || {};
    Object.keys(rooms).forEach((k) => {
      const r = rooms[k] || {};
      ["praesenz", "bewegung", "licht", "fenster", "beschattung", "musik"].forEach((f) => { (r[f] || []).forEach((id) => ids.push(id)); });
      if (r.temp) ids.push(r.temp);
      if (r.hauptlicht) ids.push(r.hauptlicht);
    });
    return ids;
  }

  _hidden(id) {  // entities with the hide label (e.g. no_dboard) count as not there
    const label = this._hideLabel, reg = label && this._hass.entities && this._hass.entities[id];
    return !!(reg && reg.labels && reg.labels.indexOf(label) >= 0);
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._subscribe();
    if (!this._config || !this.shadowRoot || !this._floors || !this._fl.length) return;
    if (!this._refs) this._build();
    const v = (x) => (x === undefined || x === null ? "" : x);  // without ?? for older webOS browsers
    const sig = this._idl.map((id) => {
      const s = hass.states[id];
      if (!s) return "x";
      const a = s.attributes || {};
      return `${s.state}|${v(a.current_temperature)}|${v(a.current_position)}|${v(a.brightness)}|${v(a.rgb_color)}|${v(a.color_mode)}|${v(a.color_temp_kelvin)}`;
    }).join(";");
    if (sig === this._sig) return;
    this._sig = sig;
    this._update();
  }

  /* ---------- State of a room ---------- */
  _status(key) {
    const r = (key && this._rooms[key]) || {};
    const st = this._hass.states;
    const get = (id) => (id && !this._hidden(id) ? st[id] : undefined);
    const any = (list, fn) => (list || []).some((id) => { const s = get(id); return !!s && fn(s); });
    const light = (id) => {  // {c: rgb, b: brightness, col: colour light} of a light that is on
      const s = get(id);
      if (!s || s.state !== "on") return null;
      const a = s.attributes || {};
      const b = typeof a.brightness === "number" ? Math.max(0.15, a.brightness / 255) : 1;
      const rgb = Array.isArray(a.rgb_color) && a.rgb_color.length >= 3 ? a.rgb_color : null;
      if (rgb && WHITE_MODES.indexOf(a.color_mode) < 0) {
        const mx = Math.max(rgb[0], rgb[1], rgb[2]), mn = Math.min(rgb[0], rgb[1], rgb[2]);
        return { c: rgb, b: b, col: mx > 0 && (mx - mn) / mx > 0.3 && !warmWhite(rgb) };
      }
      return { c: typeof a.color_temp_kelvin === "number" ? kelvinRgb(a.color_temp_kelvin) : WARM, b: b, col: false };
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
      win: any(r.fenster, (s) => s.state === "on"),
      shade: any(r.beschattung, (s) => s.state === "closed" || s.state === "closing" ||
        (typeof s.attributes.current_position === "number" && s.attributes.current_position < 95)),
      music: any(r.musik, (s) => s.state === "playing"),
      temp: temp,
    };
  }

  /* ---------- Frame of one level ---------- */
  _floorHtml(key, swipe, intro) {
    const f = this._floors[key];
    const [vx, vy, vw, vh] = f.view;
    const X = (x) => pc((x - vx) / vw), Y = (y) => pc((y - vy) / vh);
    const n = (s, i) => `${s}-${key}${i === undefined ? "" : "-" + i}`;
    const region = `filterUnits="userSpaceOnUse" x="${vx}" y="${vy}" width="${vw}" height="${vh}"`;
    const style = (this._plan && this._plan.style) || {};
    const fl = Array.isArray(style.floor) && style.floor.length >= 2 ? style.floor : ["#2a3657", "#1c2541"];
    let defs = `<linearGradient id="${n("fl")}" gradientUnits="userSpaceOnUse" x1="${vx}" y1="${vy}" x2="${vx + vw}" y2="${vy + vh}">` +
      `<stop offset="0" stop-color="${esc(fl[0])}"/><stop offset="1" stop-color="${esc(fl[1])}"/></linearGradient>` +
      `<filter id="${n("sp")}" ${region}><feGaussianBlur stdDeviation=".7"/></filter>` +
      `<filter id="${n("ed")}" ${region}><feGaussianBlur stdDeviation=".45"/></filter>` +
      `<filter id="${n("sh")}" ${region}><feGaussianBlur stdDeviation=".45"/></filter>`;
    const cuts = f.openings;
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
      if (!room.outdoor) walls += `<polygon points="${p}"/>`;
      hits += `<polygon class="hit" data-room="${esc(room.id)}" points="${p}"/>`;
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
      lbls += `<div class="lbl${room.small ? " small" : ""}" data-i="${i}" data-room="${esc(room.id)}" tabindex="0" role="button" aria-label="${esc(room.name)}" ` +
        `style="left:${X(lx)};top:${Y(ly)}"><div class="name">${esc(room.name)}</div><div class="temp"></div><div class="chips"></div></div>`;
    });
    const mask = cuts.length ? ` mask="url(#${n("dm")})"` : "";
    const omask = !outerCuts.length ? "" : outerCuts.length < cuts.length ? ` mask="url(#${n("dmo")})"` : mask;
    const dash = (o) => {
      if (!intro) return "";
      const L = perimeter(o).toFixed(2);
      return ` style="stroke-dasharray:${L} ${L};stroke-dashoffset:${L}"`;
    };
    const extras = f.extra.map((e) => `<poly${e.open ? "line" : "gon"} class="extra" points="${pts(e.poly)}"/>`).join("");
    const shadows = f.outlines.map((o) => `<polygon class="shadow" points="${pts(o)}" transform="translate(.15 .45)" filter="url(#${n("sh")})"/>`).join("");
    const st = (this._plan && this._plan.style) || {};
    const wall = typeof st.wall_width === "number" && st.wall_width > 0 ? st.wall_width : WALL;  // thickness from the editor
    const outer = typeof st.outer_width === "number" && st.outer_width > 0 ? st.outer_width : OUTER;
    const outlines = f.outlines.map((o) => `<polygon class="outline" points="${pts(o)}" stroke-width="${outer}"${dash(o)}${omask}/>`).join("");
    const rims = f.outlines.map((o) => `<polygon class="rim" points="${pts(grow(o, outer / 2))}"${omask}/>`).join("");
    const bg = this._background(f);
    const vb = `viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMin meet"`;
    const svg = `<svg class="base" ${vb} aria-hidden="true"><defs>${defs}</defs>` +
      (bg && bg.mode === "under" ? bg.html : "") + shadows +
      `<g class="fl">${floors}</g>` +
      `<g class="sp" filter="url(#${n("sp")})">${spills}</g>` +
      `<g class="li">${lights}</g><g class="ed">${edges}</g>` +
      `<g class="wa" stroke-width="${wall}"${mask}>${walls}</g>${extras}${outlines}${rims}` +
      `<g class="op">${this._openingsHtml(cuts)}</g>` +
      (bg && bg.mode === "over" ? bg.html : "") + `</svg>`;
    const plan = `<div class="plan" data-f="${esc(key)}"${swipe ? ` style="width:calc(70vh * ${(vw / vh).toFixed(4)})"` : ""}>` +
      `<div class="ratio" style="padding-top:${((vh / vw) * 100).toFixed(3)}%"></div>${svg}` +
      `<div class="fxs">${fx}</div><div class="lbls">${lbls}</div>` +
      `<svg class="hits" ${vb}>${hits}</svg></div>`;
    return swipe ? `<div class="slide">${plan}</div>` : `<div class="floor"><div class="ftitle">${esc(f.title)}</div>${plan}</div>`;
  }

  /* Background image (satellite view, scanned blueprint): under the plan, or over it with transparency. */
  _background(f) {
    const b = f.background;
    if (!b || !b.image || b.mode === "hidden" || this._config.background === false) return null;
    const rot = ((b.rotation || 0) + ((this._plan && this._plan.rotation) || 0));
    const rp = rotator((this._plan && this._plan.rotation) || 0)([b.x || 0, b.y || 0]);
    const h = b.height || b.width * 4;  // without a height the image keeps its aspect ratio (meet, anchored top left)
    const html = `<image class="bgimg" href="${esc(b.image)}" x="${rp[0]}" y="${rp[1]}" width="${b.width}" height="${h}" ` +
      `preserveAspectRatio="${b.height ? "none" : "xMinYMin meet"}" opacity="${b.opacity === undefined ? 1 : b.opacity}"` +
      (rot ? ` transform="rotate(${rot} ${rp[0]} ${rp[1]})"` : "") + `/>`;
    return { mode: b.mode || "under", html };
  }

  /* Symbols of doors, windows and garage doors (passages are only cut out of the walls). */
  _openingsHtml(list) {
    return list.map((o) => {
      const r = (o.angle || 0) * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r);
      const w = (o.width || 0.9) / 2, x = o.at[0], y = o.at[1];
      const a = [x - dx * w, y - dy * w], b = [x + dx * w, y + dy * w];
      const line = (p, q, cls) => `<line class="${cls}" x1="${p[0].toFixed(3)}" y1="${p[1].toFixed(3)}" x2="${q[0].toFixed(3)}" y2="${q[1].toFixed(3)}"/>`;
      if (o.type === "window") return line(a, b, "win");
      if (o.type === "garage") return line(a, b, "gar");
      if (o.type === "door") {  // leaf open by 90° with its swing arc
        const s = o.flip ? -1 : 1, L = 2 * w;
        const tip = [a[0] - dy * L * s, a[1] + dx * L * s];
        return line(a, tip, "leaf") +
          `<path class="swing" d="M${tip[0].toFixed(3)} ${tip[1].toFixed(3)} A${L.toFixed(3)} ${L.toFixed(3)} 0 0 ${s > 0 ? 0 : 1} ${b[0].toFixed(3)} ${b[1].toFixed(3)}"/>`;
      }
      return "";
    }).join("");
  }

  _build() {
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

    this._refs = [];
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
          st: {},
        });
      });
    }

    root.querySelectorAll(".hit").forEach((el) => {
      el.addEventListener("click", (e) => this._click(el, e));
      el.addEventListener("pointerenter", () => { this._hover = el.getAttribute("data-room"); });
      el.addEventListener("pointerleave", () => { if (this._hover === el.getAttribute("data-room")) this._hover = null; });
      el.addEventListener("wheel", (e) => {   // mouse wheel over a room = music louder/quieter
        e.preventDefault();
        const now = Date.now();
        if (this._wheelT && now - this._wheelT < 250) return;   // at most 4 steps per second
        this._wheelT = now;
        const id = el.getAttribute("data-room");
        if (id && this._hass) this._hass.callService("script", "raum_klick", { raum: id, aktion: e.deltaY < 0 ? "lauter" : "leiser" });
      }, { passive: false });
      el.addEventListener("contextmenu", (e) => {   // right click / yellow – once music start/pause, twice within 0.5 s room off
        e.preventDefault();
        el.classList.add("pressed"); setTimeout(() => el.classList.remove("pressed"), 280);
        const id = el.getAttribute("data-room");
        clearTimeout(this._rkT);
        if (this._rkRoom !== id) this._rkN = 0;
        this._rkRoom = id;
        this._rkN = (this._rkN || 0) + 1;
        this._rkT = setTimeout(() => {
          const n = this._rkN; this._rkN = 0; this._rkRoom = null;
          if (!id || !this._hass) return;
          this._hass.callService("script", "raum_klick", n >= 2 ? { raum: id, klicks: 3 } : { raum: id, aktion: "musik" });
        }, 500);
      });
    });
    root.querySelectorAll(".lbl").forEach((el) => el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.keyCode === 13) { e.preventDefault(); this._open(el.getAttribute("data-room")); }
    }));

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
        if (ref.temp.textContent !== s.temp) ref.temp.textContent = s.temp;
        const ink = !!pool && this._bright(pool.rgb, +lop);
        if (o.ink !== ink) { o.ink = ink; ref.lbl.classList.toggle("ink", ink); }
        const ck = (s.win ? "w" : "") + (s.shade ? "s" : "") + (s.music ? "m" : "");
        if (o.ck !== ck) { o.ck = ck; ref.chips.innerHTML = ck.split("").map((c) => this._chips[c]).join(""); }
      }
    });
  }

  // How bright does the room centre get? (screen blend of the light over the floor, roughly Rec. 709)
  _bright(rgb, a) {
    const f = [0.13, 0.17, 0.27], c = rgb.split(",").map((x) => +x / 255);
    const r = c.map((v, i) => f[i] + a * v * (1 - f[i]));
    return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2] > 0.62;
  }

  /* ---------- Operation ---------- */
  _click(el, e) {  // touch → multi-tap logic, mouse/remote → pop-up right away
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
      if (id && this._hass) this._hass.callService("script", "raum_klick", { raum: id, klicks: n > 3 ? 3 : n });
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

  _key(e) {  // ← / → change the level; ↑ / ↓ over a room switch light scenes
    if (!this._config || !this._refs || e.defaultPrevented) return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const v = e.key === "ArrowUp" || e.keyCode === 38 ? "hoch" : e.key === "ArrowDown" || e.keyCode === 40 ? "runter" : "";
    if (v && this._hover && !(location.hash && location.hash.length > 1)) {
      e.preventDefault();
      if (this._hass) this._hass.callService("script", "raum_klick", { raum: this._hover, aktion: v });
      return;
    }
    if (this._config.mode !== "swipe" || !this._track) return;
    const d = e.key === "ArrowLeft" || e.keyCode === 37 ? -1 : e.key === "ArrowRight" || e.keyCode === 39 ? 1 : 0;
    if (!d) return;
    if (location.hash && location.hash.length > 1) return;  // room pop-up open
    let a = document.activeElement;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
    if (a && (a.localName === "input" || a.localName === "textarea" || a.localName === "select" || a.isContentEditable)) return;
    const r = this.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < 0 || r.top > window.innerHeight) return;  // only the visible card
    e.preventDefault();
    this._go(this._idx + d);
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

  @media (max-width: 600px) {
    ha-card.night { padding: 10px 8px 8px; }
    .tab { width: 4.4em; } .tab .l { display: none; } .tab .s { display: inline; }
  }
  @media (prefers-reduced-motion: reduce) {
    .core i, .ring, .chip.music i { animation: none !important; }
    .light, .spill, .edge, .core { transition: none; }
  }
`;

if (!customElements.get("floorplan-lite-card")) customElements.define("floorplan-lite-card", FloorplanLiteCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "floorplan-lite-card"))
  window.customCards.push({ type: "floorplan-lite-card", name: "Floorplan Lite",
    description: "Floor plan with lights in their colour, presence, motion, windows, shades and music", preview: false });
