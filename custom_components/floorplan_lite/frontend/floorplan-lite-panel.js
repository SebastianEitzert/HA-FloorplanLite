/*
 * Floorplan Lite – editor page in the sidebar (admin only).
 *
 * Draw a floor plan over a satellite image or an old blueprint: buildings, levels, rooms, outer walls, areas outside,
 * helper lines and openings (doors, windows, passages, garage doors). Points snap to corners, edges, 45°/90° and a
 * grid. Coordinates are metres (y down). The plan is stored by the Floorplan Lite integration
 * (floorplan_lite/save) and drawn by the card custom:floorplan-lite-card.
 */

const T = {
  de: {
    title: "Floorplan Lite", plan: "Grundriss", newPlan: "Neuer Grundriss", planName: "Name des Grundrisses",
    save: "Speichern", saved: "Gespeichert", unsaved: "Ungespeicherte Änderungen", undo: "Rückgängig", redo: "Wiederholen",
    del: "Löschen", delPlan: "Grundriss „%s“ wirklich löschen?", importJson: "JSON importieren", exportJson: "JSON exportieren",
    preview: "Vorschau", fit: "Einpassen", none: "Noch kein Grundriss – lege einen neuen an.",
    leave: "Ungespeicherte Änderungen verwerfen?",
    tools: { select: "Auswählen / bearbeiten", room: "Raum zeichnen", outline: "Außenwand zeichnen", outdoor: "Bereich außen (Garten, Hof, Terrasse)",
      line: "Hilfslinie (Vordach …)", door: "Tür", window: "Fenster", passage: "Durchgang ohne Tür", garage: "Garagentor",
      image: "Hintergrundbild verschieben", scale: "Maßstab setzen (zwei Punkte)", alignWall: "Nach einer Wand ausrichten", pan: "Verschieben (Ansicht)" },
    hintDraw: "Klicken setzt Punkte · Klick auf den ersten Punkt oder Enter schließt · Rücktaste entfernt den letzten · Esc bricht ab · Umschalt: freier Winkel",
    hintLine: "Klicken setzt Punkte · Enter beendet · Esc bricht ab",
    hintOpening: "Auf eine Wand klicken, um die Öffnung zu setzen",
    hintSelect: "Element anklicken · Ecken ziehen · Doppelklick auf eine Kante fügt eine Ecke ein · Rechtsklick auf eine Ecke löscht sie · Entf löscht das Element",
    hintImage: "Bild mit der Maus verschieben", hintScale: "Zwei Punkte auf dem Bild anklicken, deren Abstand du kennst",
    hintAlign: "Eine Wand anklicken – der ganze Grundriss wird so gedreht, dass sie waagerecht liegt",
    scalePrompt: "Wie viele Meter liegen zwischen den beiden Punkten?",
    levels: "Stockwerke", level: "Stockwerk", addLevel: "Stockwerk hinzufügen", levelName: "Name des Stockwerks", levelShort: "Kürzel (z. B. EG)",
    copyOutlines: "Außenwände des aktuellen Stockwerks übernehmen?", delLevel: "Stockwerk „%s“ mit allen Räumen löschen?",
    up: "nach oben", down: "nach unten", buildings: "Gebäude", building: "Gebäude", addBuilding: "Gebäude hinzufügen", buildingName: "Name des Gebäudes",
    noBuilding: "– ohne –", delBuilding: "Gebäude „%s“ entfernen? Elemente bleiben erhalten.",
    background: "Hintergrundbild", upload: "Bild hochladen", removeImage: "Bild entfernen", opacity: "Deckkraft", mode: "Lage",
    modes: { under: "unter dem Plan", over: "über dem Plan", hidden: "ausgeblendet" }, rotation: "Drehung (Grad)", width: "Breite (m)",
    posX: "Links (m)", posY: "Oben (m)", uploading: "Wird hochgeladen …",
    planSettings: "Grundriss", name: "Name", alignLevels: "Stockwerke aneinander ausrichten", hideLabel: "Entitäten mit diesem Label ignorieren", north: "Norden (Grad, 0 = oben)",
    northAlign: "Nach Norden ausrichten", colors: "Farben", cBackground: "Hintergrund", cFloor1: "Boden hell", cFloor2: "Boden dunkel",
    cWall: "Wände", cEdge: "Kanten", reset: "zurücksetzen",
    room: "Raum", outline: "Außenwand", line: "Hilfslinie", opening: "Öffnung", id: "ID (Pop-up #…)", partOf: "Teil von Raum",
    partNone: "– eigener Raum –", ownEntities: "Eigene Entitäten (Schlüssel)", outdoorF: "Bereich außen", small: "kleine Beschriftung",
    color: "Farbe", noColor: "Standard", open: "offen (keine geschlossene Form)", type: "Art", widthM: "Breite (m)", depth: "Wandstärke (m)",
    flip: "Aufschlag spiegeln", entities: "Entitäten", ent: { licht: "Licht", hauptlicht: "Hauptlicht (füllt den Raum, die anderen als Saum)", praesenz: "Präsenz", bewegung: "Bewegung", temp: "Temperatur",
      fenster: "Fenster", beschattung: "Beschattung", musik: "Musik" },
    types: { door: "Tür", window: "Fenster", passage: "Durchgang", garage: "Garagentor" },
    invalid: "Fehler beim Speichern: %s", grid: "Raster", ghost: "Stockwerk darunter zeigen", dims: "Maße zeigen",
    entHint: "Entity-IDs, durch Komma getrennt",
  },
  en: {
    title: "Floorplan Lite", plan: "Floor plan", newPlan: "New floor plan", planName: "Name of the floor plan",
    save: "Save", saved: "Saved", unsaved: "Unsaved changes", undo: "Undo", redo: "Redo",
    del: "Delete", delPlan: "Really delete floor plan “%s”?", importJson: "Import JSON", exportJson: "Export JSON",
    preview: "Preview", fit: "Fit", none: "No floor plan yet – create a new one.",
    leave: "Discard unsaved changes?",
    tools: { select: "Select / edit", room: "Draw room", outline: "Draw outer wall", outdoor: "Area outside (garden, yard, terrace)",
      line: "Helper line (canopy …)", door: "Door", window: "Window", passage: "Passage without door", garage: "Garage door",
      image: "Move background image", scale: "Set scale (two points)", alignWall: "Align to a wall", pan: "Pan (view)" },
    hintDraw: "Click to add points · click the first point or Enter to close · Backspace removes the last · Esc cancels · Shift: free angle",
    hintLine: "Click to add points · Enter finishes · Esc cancels",
    hintOpening: "Click on a wall to place the opening",
    hintSelect: "Click an element · drag corners · double-click an edge to add a corner · right-click a corner to remove it · Del deletes the element",
    hintImage: "Drag the image with the mouse", hintScale: "Click two points on the image whose distance you know",
    hintAlign: "Click a wall – the whole plan is turned so that it is horizontal",
    scalePrompt: "How many metres are between the two points?",
    levels: "Levels", level: "Level", addLevel: "Add level", levelName: "Name of the level", levelShort: "Short name (e.g. GF)",
    copyOutlines: "Copy the outer walls of the current level?", delLevel: "Delete level “%s” with all its rooms?",
    up: "up", down: "down", buildings: "Buildings", building: "Building", addBuilding: "Add building", buildingName: "Name of the building",
    noBuilding: "– none –", delBuilding: "Remove building “%s”? Its elements stay.",
    background: "Background image", upload: "Upload image", removeImage: "Remove image", opacity: "Opacity", mode: "Position",
    modes: { under: "under the plan", over: "over the plan", hidden: "hidden" }, rotation: "Rotation (degrees)", width: "Width (m)",
    posX: "Left (m)", posY: "Top (m)", uploading: "Uploading …",
    planSettings: "Floor plan", name: "Name", alignLevels: "Align levels to each other", hideLabel: "Ignore entities with this label", north: "North (degrees, 0 = up)",
    northAlign: "Turn so north is up", colors: "Colours", cBackground: "Background", cFloor1: "Floor light", cFloor2: "Floor dark",
    cWall: "Walls", cEdge: "Edges", reset: "reset",
    room: "Room", outline: "Outer wall", line: "Helper line", opening: "Opening", id: "ID (pop-up #…)", partOf: "Part of room",
    partNone: "– own room –", ownEntities: "Own entities (key)", outdoorF: "Area outside", small: "small label",
    color: "Colour", noColor: "Default", open: "open (not a closed shape)", type: "Type", widthM: "Width (m)", depth: "Wall thickness (m)",
    flip: "Mirror swing", entities: "Entities", ent: { licht: "Light", hauptlicht: "Main light (fills the room, the others as a seam)", praesenz: "Presence", bewegung: "Motion", temp: "Temperature",
      fenster: "Window", beschattung: "Shade", musik: "Music" },
    types: { door: "Door", window: "Window", passage: "Passage", garage: "Garage door" },
    invalid: "Saving failed: %s", grid: "Grid", ghost: "Show level below", dims: "Show dimensions",
    entHint: "Entity ids, separated by commas",
  },
};

const ENT_FIELDS = [["licht", "light"], ["hauptlicht", "light"], ["praesenz", "binary_sensor"], ["bewegung", "binary_sensor"], ["temp", null],
  ["fenster", "binary_sensor"], ["beschattung", "cover"], ["musik", "media_player"]];
const SINGLE = ["temp", "hauptlicht"];  // one entity, not a list
const OPENING_TOOLS = ["door", "window", "passage", "garage"];
const POLY_TOOLS = ["room", "outline", "outdoor"];
const DEFAULT_STYLE = { background: "#131b30", floor: ["#2a3657", "#1c2541"], wall: "#4d5a7d", edge: "#8d9cc4" };
const ICONS = { select: "mdi:cursor-default", room: "mdi:vector-square", outline: "mdi:wall", outdoor: "mdi:tree",
  line: "mdi:vector-polyline", door: "mdi:door", window: "mdi:window-closed-variant", passage: "mdi:door-open",
  garage: "mdi:garage", image: "mdi:image-move", scale: "mdi:ruler", alignWall: "mdi:format-align-middle", pan: "mdi:pan" };

/* ---------- Geometry ---------- */
const R3 = (v) => Math.round(v * 1000) / 1000;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const len = (a) => Math.sqrt(a[0] * a[0] + a[1] * a[1]);
const dist = (a, b) => len(sub(a, b));
const rotP = (p, deg, c) => {
  const r = deg * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r), d = sub(p, c);
  return [R3(c[0] + d[0] * cs - d[1] * sn), R3(c[1] + d[0] * sn + d[1] * cs)];
};
const proj = (p, a, b) => {  // closest point on segment ab, t along it
  const ab = sub(b, a), l2 = ab[0] * ab[0] + ab[1] * ab[1];
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / l2)) : 0;
  return { p: [a[0] + ab[0] * t, a[1] + ab[1] * t], t };
};
const centroid = (p) => {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < p.length; i++) {
    const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length], f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a *= 0.5;
  return Math.abs(a) < 1e-6 ? p[0] : [cx / (6 * a), cy / (6 * a)];
};
const inside = (p, poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const bbox = (pts) => {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  pts.forEach(([x, y]) => { if (x < x1) x1 = x; if (y < y1) y1 = y; if (x > x2) x2 = x; if (y > y2) y2 = y; });
  return [x1, y1, x2, y2];
};
const pts = (p) => p.map(([x, y]) => `${x},${y}`).join(" ");
const slug = (s) => String(s).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
  .replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 64) || "x";
const esc = (s) => String(s === undefined || s === null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const clone = (o) => JSON.parse(JSON.stringify(o));
const openingRect = (o) => {
  const r = (o.angle || 0) * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r);
  const w = (o.width || 0.9) / 2, d = (o.depth || 0.24) / 2, x = o.at[0], y = o.at[1];
  const P = (a, b) => [x + dx * a - dy * b, y + dy * a + dx * b];
  return [P(-w, -d), P(w, -d), P(w, d), P(-w, d)];
};

class FloorplanLitePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tool = "select";
    this._sel = null;           // {kind: rooms|outlines|lines|openings, i}
    this._draft = null;         // points while drawing
    this._undo = []; this._redo = [];
    this._dirty = false;
    this._grid = true; this._ghost = true; this._dims = false;
    this._vb = null;            // view box in metres [x, y, w, h]
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) { this._shell(); this._loadList(); }
    if (this._card) this._card.hass = hass;
  }
  set narrow(v) { this._narrow = v; }
  set panel(p) { this._panelConf = p; }

  get t() {
    const l = (this._hass && ((this._hass.locale && this._hass.locale.language) || this._hass.language)) || "en";
    return T[String(l).slice(0, 2)] || T.en;
  }

  connectedCallback() {
    if (!this._onKey) { this._onKey = (e) => this._key(e); window.addEventListener("keydown", this._onKey); }
    if (!this._onUnload) {
      this._onUnload = (e) => { if (this._dirty) { e.preventDefault(); e.returnValue = ""; } };
      window.addEventListener("beforeunload", this._onUnload);
    }
  }
  disconnectedCallback() {
    if (this._onKey) { window.removeEventListener("keydown", this._onKey); this._onKey = null; }
    if (this._onUnload) { window.removeEventListener("beforeunload", this._onUnload); this._onUnload = null; }
  }

  /* ---------- Plans ---------- */
  async _loadList(selectId) {
    this._plans = await this._hass.callWS({ type: "floorplan_lite/list" });
    const id = selectId || (this._plan && this._plan.id) || (this._plans[0] && this._plans[0].id);
    if (id) await this._open(id, true); else { this._plan = null; this._renderAll(); }
  }

  async _open(id, force) {
    if (!force && this._dirty && !confirm(this.t.leave)) return this._renderAll();
    const plan = await this._hass.callWS({ type: "floorplan_lite/get", plan_id: id });
    this._setPlan(plan);
  }

  _setPlan(plan) {
    plan.levels = plan.levels || []; plan.rooms = plan.rooms || []; plan.outlines = plan.outlines || [];
    plan.lines = plan.lines || []; plan.openings = plan.openings || []; plan.buildings = plan.buildings || [];
    plan.entities = plan.entities || {}; plan.style = plan.style || {};
    this._plan = plan;
    this._level = (plan.levels[0] && plan.levels[0].id) || null;
    this._building = (plan.buildings[0] && plan.buildings[0].id) || "";
    this._sel = null; this._draft = null; this._undo = []; this._redo = []; this._dirty = false;
    this._vb = null;
    this._renderAll();
    this._fit();
  }

  _newPlan() {
    if (this._dirty && !confirm(this.t.leave)) return;
    const name = prompt(this.t.planName, this.t === T.de ? "Zuhause" : "Home");
    if (!name) return;
    let id = slug(name), n = 2;
    while ((this._plans || []).some((p) => p.id === id)) id = slug(name) + "_" + n++;
    const de = this.t === T.de;
    this._setPlan({ id, name, rotation: 0, north: 0, align_levels: true, style: {},
      buildings: [{ id: de ? "haus" : "house", name: de ? "Haus" : "House" }],
      levels: [{ id: de ? "eg" : "gf", name: de ? "Erdgeschoss" : "Ground floor", short: de ? "EG" : "GF" }],
      outlines: [], lines: [], rooms: [], openings: [], entities: {} });
    this._dirty = true;
    this._renderAll();
  }

  async _save() {
    if (!this._plan) return;
    try {
      const plan = await this._hass.callWS({ type: "floorplan_lite/save", plan: this._clean(this._plan) });
      this._dirty = false;
      this._plans = await this._hass.callWS({ type: "floorplan_lite/list" });
      this._plan.id = plan.id;
      this._status(this.t.saved);
      this._renderAll();
    } catch (e) {
      this._status(this.t.invalid.replace("%s", (e && e.message) || e), true);
    }
  }

  _clean(plan) {  // drop empty entity lists, keep the stored shape tidy
    const p = clone(plan);
    Object.keys(p.entities).forEach((k) => {
      const e = p.entities[k];
      Object.keys(e).forEach((f) => { if (!e[f] || (Array.isArray(e[f]) && !e[f].length)) delete e[f]; });
      if (!Object.keys(e).length) delete p.entities[k];
    });
    return p;
  }

  async _deletePlan() {
    if (!this._plan || !confirm(this.t.delPlan.replace("%s", this._plan.name))) return;
    try { await this._hass.callWS({ type: "floorplan_lite/delete", plan_id: this._plan.id }); } catch (e) { /* not saved yet */ }
    this._plan = null; this._dirty = false;
    await this._loadList();
  }

  _import() {
    const text = prompt(this.t.importJson);
    if (!text) return;
    try { const plan = JSON.parse(text); this._setPlan(plan); this._dirty = true; this._renderAll(); }
    catch (e) { this._status(String(e), true); }
  }

  _export() {
    const blob = new Blob([JSON.stringify(this._clean(this._plan), null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = this._plan.id + ".json"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- Undo ---------- */
  _change(fn) {  // every edit goes through here: snapshot for undo, then render
    this._undo.push(JSON.stringify(this._plan));
    if (this._undo.length > 150) this._undo.shift();
    this._redo = [];
    fn();
    this._dirty = true;
    this._renderAll();
  }
  _doUndo() {
    if (!this._undo.length) return;
    this._redo.push(JSON.stringify(this._plan));
    this._plan = JSON.parse(this._undo.pop()); this._sel = null; this._dirty = true; this._renderAll();
  }
  _doRedo() {
    if (!this._redo.length) return;
    this._undo.push(JSON.stringify(this._plan));
    this._plan = JSON.parse(this._redo.pop()); this._sel = null; this._dirty = true; this._renderAll();
  }

  /* ---------- Shell ---------- */
  _shell() {
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>
      <div class="app">
        <header>
          <ha-icon icon="mdi:floor-plan"></ha-icon><span class="title"></span>
          <select class="plans"></select>
          <button data-a="new" class="icon" title=""><ha-icon icon="mdi:plus"></ha-icon></button>
          <span class="sp"></span>
          <span class="status"></span>
          <button data-a="undo" class="icon"><ha-icon icon="mdi:undo"></ha-icon></button>
          <button data-a="redo" class="icon"><ha-icon icon="mdi:redo"></ha-icon></button>
          <button data-a="preview" class="icon"><ha-icon icon="mdi:eye"></ha-icon></button>
          <button data-a="import" class="icon"><ha-icon icon="mdi:upload"></ha-icon></button>
          <button data-a="export" class="icon"><ha-icon icon="mdi:download"></ha-icon></button>
          <button data-a="delete" class="icon"><ha-icon icon="mdi:delete"></ha-icon></button>
          <button data-a="save" class="primary"></button>
        </header>
        <div class="main">
          <nav class="tools"></nav>
          <div class="stage">
            <div class="levels"></div>
            <svg class="canvas" tabindex="0"></svg>
            <div class="hint"></div>
            <div class="zoom"><button data-z="in">+</button><button data-z="out">−</button><button data-z="fit"><ha-icon icon="mdi:fit-to-screen"></ha-icon></button></div>
            <div class="previewbox" hidden></div>
          </div>
          <aside class="side"></aside>
        </div>
        <input type="file" class="file" accept="image/*" hidden>
      </div>`;
    const R = this.shadowRoot;
    R.querySelector(".plans").addEventListener("change", (e) => this._open(e.target.value));
    R.querySelectorAll("header button").forEach((b) => b.addEventListener("click", () => this._header(b.getAttribute("data-a"))));
    R.querySelectorAll(".zoom button").forEach((b) => b.addEventListener("click", () => {
      const z = b.getAttribute("data-z");
      if (z === "fit") this._fit(); else this._zoom(z === "in" ? 0.8 : 1.25);
    }));
    R.querySelector(".file").addEventListener("change", (e) => this._upload(e.target.files && e.target.files[0]));
    const svg = R.querySelector(".canvas");
    svg.addEventListener("pointerdown", (e) => this._down(e));
    svg.addEventListener("pointermove", (e) => this._move(e));
    svg.addEventListener("pointerup", (e) => this._up(e));
    svg.addEventListener("pointercancel", (e) => this._up(e));
    svg.addEventListener("dblclick", (e) => this._dbl(e));
    svg.addEventListener("contextmenu", (e) => this._ctx(e));
    svg.addEventListener("wheel", (e) => { e.preventDefault(); this._zoom(e.deltaY > 0 ? 1.15 : 0.87, this._pt(e)); }, { passive: false });
    if (window.ResizeObserver) new ResizeObserver(() => this._renderCanvas()).observe(svg);
  }

  _header(a) {
    if (a === "new") return this._newPlan();
    if (!this._plan) return;
    if (a === "save") return this._save();
    if (a === "undo") return this._doUndo();
    if (a === "redo") return this._doRedo();
    if (a === "import") return this._import();
    if (a === "export") return this._export();
    if (a === "delete") return this._deletePlan();
    if (a === "preview") { this._preview = !this._preview; this._renderPreview(); }
  }

  _status(text, err) {
    const s = this.shadowRoot.querySelector(".status");
    s.textContent = text; s.className = "status" + (err ? " err" : "");
    clearTimeout(this._stT);
    if (!err) this._stT = setTimeout(() => this._renderHeader(), 2500);
  }

  _renderAll() {
    if (!this.shadowRoot.querySelector(".app")) return;
    this._renderHeader();
    this._renderTools();
    this._renderLevels();
    this._renderSide();
    this._renderCanvas();
    this._renderPreview();
  }

  _renderHeader() {
    const t = this.t, R = this.shadowRoot;
    R.querySelector(".title").textContent = t.title;
    const sel = R.querySelector(".plans");
    const list = (this._plans || []).slice();
    if (this._plan && !list.some((p) => p.id === this._plan.id)) list.push({ id: this._plan.id, name: this._plan.name });
    sel.innerHTML = list.map((p) => `<option value="${esc(p.id)}"${this._plan && p.id === this._plan.id ? " selected" : ""}>${esc(p.name)}</option>`).join("");
    sel.hidden = !list.length;
    const titles = { new: t.newPlan, undo: t.undo, redo: t.redo, preview: t.preview, import: t.importJson, export: t.exportJson, delete: t.del };
    R.querySelectorAll("header button").forEach((b) => {
      const a = b.getAttribute("data-a");
      if (titles[a]) b.title = titles[a];
      if (a !== "new") b.disabled = !this._plan;
    });
    R.querySelector('[data-a="save"]').textContent = t.save;
    R.querySelector('[data-a="undo"]').disabled = !this._undo.length;
    R.querySelector('[data-a="redo"]').disabled = !this._redo.length;
    const st = R.querySelector(".status");
    if (!st.classList.contains("err")) st.textContent = this._dirty ? t.unsaved : "";
  }

  _renderTools() {
    const t = this.t, nav = this.shadowRoot.querySelector(".tools");
    const groups = [["select", "pan"], ["room", "outline", "outdoor", "line"], OPENING_TOOLS, ["image", "scale", "alignWall"]];
    nav.innerHTML = groups.map((g) => `<div class="grp">${g.map((k) =>
      `<button class="tool${this._tool === k ? " on" : ""}" data-t="${k}" title="${esc(t.tools[k])}"${!this._plan ? " disabled" : ""}><ha-icon icon="${ICONS[k]}"></ha-icon></button>`).join("")}</div>`).join("");
    nav.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => this._setTool(b.getAttribute("data-t"))));
    const hint = { select: t.hintSelect, room: t.hintDraw, outline: t.hintDraw, outdoor: t.hintDraw, line: t.hintLine,
      image: t.hintImage, scale: t.hintScale, alignWall: t.hintAlign, pan: "" };
    this.shadowRoot.querySelector(".hint").textContent = this._plan ? (hint[this._tool] !== undefined ? hint[this._tool] : t.hintOpening) : t.none;
  }

  _setTool(k) {
    this._tool = k; this._draft = null; this._scaleA = null;
    if (k !== "select") this._sel = null;
    this._renderTools(); this._renderSide(); this._renderCanvas();
  }

  _renderLevels() {
    const box = this.shadowRoot.querySelector(".levels");
    if (!this._plan) { box.innerHTML = ""; return; }
    box.innerHTML = this._plan.levels.map((l) => `<button class="lv${l.id === this._level ? " on" : ""}" data-l="${esc(l.id)}">${esc(l.short || l.name)}</button>`).join("") +
      `<button class="lv add" data-l="+" title="${esc(this.t.addLevel)}">+</button>`;
    box.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      const l = b.getAttribute("data-l");
      if (l === "+") return this._addLevel();
      this._level = l; this._sel = null; this._draft = null; this._renderAll();
    }));
  }

  _addLevel() {
    const t = this.t;
    const name = prompt(t.levelName);
    if (!name) return;
    const short = prompt(t.levelShort, name.slice(0, 2).toUpperCase()) || name.slice(0, 2).toUpperCase();
    let id = slug(short || name), n = 2;
    while (this._plan.levels.some((l) => l.id === id)) id = slug(short || name) + "_" + n++;
    const copy = this._level && this._plan.outlines.some((o) => o.level === this._level) && confirm(t.copyOutlines);
    const from = this._level;
    this._change(() => {
      this._plan.levels.push({ id, name, short });
      if (copy) this._plan.outlines.filter((o) => o.level === from).forEach((o) => this._plan.outlines.push(Object.assign(clone(o), { level: id })));
      this._level = id;
    });
  }

  /* ---------- Side panel ---------- */
  _renderSide() {
    const side = this.shadowRoot.querySelector(".side");
    if (!this._plan) { side.innerHTML = ""; return; }
    let html = "";
    if (this._sel) html += this._selHtml();
    html += this._levelHtml() + this._planHtml();
    side.innerHTML = html;
    this._bindSide(side);
  }

  _field(label, input) { return `<label class="f"><span>${esc(label)}</span>${input}</label>`; }
  _num(key, val, step) { return `<input type="number" data-k="${key}" value="${val === undefined || val === null ? "" : R3(val)}" step="${step || 0.1}">`; }
  _chk(key, val) { return `<input type="checkbox" data-k="${key}"${val ? " checked" : ""}>`; }
  _txt(key, val) { return `<input type="text" data-k="${key}" value="${esc(val)}">`; }
  _color(key, val, def) { return `<span class="crow"><input type="color" data-k="${key}" value="${esc(val || def)}"><button class="mini" data-reset="${key}">${esc(this.t.reset)}</button></span>`; }
  _buildingSel(key, val) {
    return `<select data-k="${key}"><option value="">${esc(this.t.noBuilding)}</option>` +
      this._plan.buildings.map((b) => `<option value="${esc(b.id)}"${b.id === val ? " selected" : ""}>${esc(b.name)}</option>`).join("") + `</select>`;
  }

  _selHtml() {
    const t = this.t, s = this._sel, el = this._plan[s.kind][s.i];
    if (!el) { this._sel = null; return ""; }
    let h = `<section><h3>${esc({ rooms: el.outdoor ? t.tools.outdoor : t.room, outlines: t.outline, lines: t.line, openings: t.opening }[s.kind])}` +
      `<button class="mini danger" data-act="delsel">${esc(t.del)}</button></h3>`;
    if (s.kind === "rooms") {
      const others = [];
      this._plan.rooms.forEach((r, i) => { if (i !== s.i && r.name && others.indexOf(r.id) < 0) others.push(r.id); });
      const part = el.name === null || el.name === undefined && false;
      h += this._field(t.partOf, `<select data-k="partof"><option value="">${esc(t.partNone)}</option>` +
        others.map((id) => `<option value="${esc(id)}"${el.name === null && el.id === id ? " selected" : ""}>${esc(id)}</option>`).join("") + `</select>`);
      if (el.name !== null) {
        h += this._field(t.name, this._txt("name", el.name)) + this._field(t.id, this._txt("id", el.id));
      }
      h += this._field(t.building, this._buildingSel("building", el.building)) +
        this._field(t.outdoorF, this._chk("outdoor", el.outdoor)) + this._field(t.small, this._chk("small", el.small)) +
        this._field(t.color, this._color("color", el.color, "#2a3657")) +
        this._field(t.ownEntities, this._txt("key", el.key || ""));
      h += this._entitiesHtml(el.key || el.id);
      void part;
    } else if (s.kind === "outlines") {
      h += this._field(t.building, this._buildingSel("building", el.building));
    } else if (s.kind === "lines") {
      h += this._field(t.open, this._chk("open", el.open));
    } else if (s.kind === "openings") {
      h += this._field(t.type, `<select data-k="type">${OPENING_TOOLS.map((k) => `<option value="${k}"${el.type === k ? " selected" : ""}>${esc(t.types[k])}</option>`).join("")}</select>`) +
        this._field(t.widthM, this._num("width", el.width, 0.05)) + this._field(t.depth, this._num("depth", el.depth, 0.02)) +
        (el.type === "door" ? this._field(t.flip, this._chk("flip", el.flip)) : "");
    }
    return h + `</section>`;
  }

  _entitiesHtml(key) {
    const t = this.t, e = this._plan.entities[key] || {};
    return `<h4>${esc(t.entities)} <code>${esc(key)}</code></h4>` + ENT_FIELDS.map(([f]) => {
      const v = e[f];
      const val = Array.isArray(v) ? v.join(", ") : (v || "");
      return this._field(t.ent[f], `<input type="text" list="fl-ents-${f}" data-ent="${f}" data-key="${esc(key)}" value="${esc(val)}" placeholder="${esc(t.entHint)}">`);
    }).join("") + ENT_FIELDS.map(([f, dom]) => `<datalist id="fl-ents-${f}">${this._entityOptions(f === "temp" ? ["climate", "sensor"] : [dom])}</datalist>`).join("");
  }

  _labelOptions(cur) {
    const ids = {};
    const reg = (this._hass && this._hass.entities) || {};
    Object.keys(reg).forEach((id) => (reg[id].labels || []).forEach((l) => { ids[l] = 1; }));
    if (cur) ids[cur] = 1;
    return Object.keys(ids).sort().map((l) => `<option value="${esc(l)}"${l === cur ? " selected" : ""}>${esc(l)}</option>`).join("");
  }

  _entityOptions(domains) {
    const st = (this._hass && this._hass.states) || {}, reg = (this._hass && this._hass.entities) || {};
    const label = this._plan && this._plan.hide_label;
    return Object.keys(st).filter((id) => domains.indexOf(id.split(".")[0]) >= 0)
      .filter((id) => !(label && reg[id] && (reg[id].labels || []).indexOf(label) >= 0)).sort()
      .map((id) => `<option value="${esc(id)}">${esc((st[id].attributes && st[id].attributes.friendly_name) || "")}</option>`).join("");
  }

  _levelHtml() {
    const t = this.t, lv = this._lv();
    if (!lv) return "";
    const b = lv.background || null;
    let h = `<section><h3>${esc(t.level)}: ${esc(lv.name)}<span class="sp"></span>` +
      `<button class="mini" data-act="lvup" title="${esc(t.up)}">▲</button><button class="mini" data-act="lvdown" title="${esc(t.down)}">▼</button>` +
      `<button class="mini danger" data-act="lvdel">${esc(t.del)}</button></h3>` +
      this._field(t.name, `<input type="text" data-lv="name" value="${esc(lv.name)}">`) +
      this._field(t.levelShort, `<input type="text" data-lv="short" value="${esc(lv.short || "")}">`) +
      `<h4>${esc(t.background)}</h4>`;
    if (b && b.image) {
      h += this._field(t.mode, `<select data-bg="mode">${["under", "over", "hidden"].map((m) => `<option value="${m}"${(b.mode || "under") === m ? " selected" : ""}>${esc(t.modes[m])}</option>`).join("")}</select>`) +
        this._field(t.opacity, `<input type="range" min="0" max="1" step="0.05" data-bg="opacity" value="${b.opacity === undefined ? 1 : b.opacity}">`) +
        this._field(t.width, `<input type="number" step="0.1" data-bg="width" value="${R3(b.width)}">`) +
        this._field(t.rotation, `<input type="number" step="0.5" data-bg="rotation" value="${R3(b.rotation || 0)}">`) +
        this._field(t.posX, `<input type="number" step="0.1" data-bg="x" value="${R3(b.x || 0)}">`) +
        this._field(t.posY, `<input type="number" step="0.1" data-bg="y" value="${R3(b.y || 0)}">`) +
        `<div class="row"><button class="mini" data-act="upload">${esc(t.upload)}</button><button class="mini danger" data-act="rmimg">${esc(t.removeImage)}</button></div>`;
    } else {
      h += `<div class="row"><button class="mini" data-act="upload">${esc(t.upload)}</button></div>`;
    }
    return h + `<div class="row opts">` +
      `<label><input type="checkbox" data-view="grid"${this._grid ? " checked" : ""}> ${esc(t.grid)}</label>` +
      `<label><input type="checkbox" data-view="ghost"${this._ghost ? " checked" : ""}> ${esc(t.ghost)}</label>` +
      `<label><input type="checkbox" data-view="dims"${this._dims ? " checked" : ""}> ${esc(t.dims)}</label></div></section>`;
  }

  _planHtml() {
    const t = this.t, p = this._plan, s = p.style || {};
    const fl = Array.isArray(s.floor) ? s.floor : DEFAULT_STYLE.floor;
    return `<section><h3>${esc(t.planSettings)}</h3>` +
      this._field(t.name, `<input type="text" data-p="name" value="${esc(p.name)}">`) +
      this._field("ID", `<input type="text" data-p="id" value="${esc(p.id)}">`) +
      this._field(t.alignLevels, `<input type="checkbox" data-p="align_levels"${p.align_levels ? " checked" : ""}>`) +
      this._field(t.hideLabel, `<select data-p="hide_label"><option value="">–</option>${this._labelOptions(p.hide_label)}</select>`) +
      this._field(t.north, `<span class="crow"><input type="number" step="1" data-p="north" value="${R3(p.north || 0)}"><button class="mini" data-act="northup">${esc(t.northAlign)}</button></span>`) +
      `<h4>${esc(t.buildings)}</h4>` +
      p.buildings.map((b, i) => `<div class="row"><input type="text" data-b="${i}" value="${esc(b.name)}"><button class="mini danger" data-act="bdel" data-i="${i}">✕</button></div>`).join("") +
      `<div class="row"><button class="mini" data-act="badd">${esc(t.addBuilding)}</button>` +
      `<label class="cur">${esc(t.building)}: ${this._buildingSel("__cur", this._building)}</label></div>` +
      `<h4>${esc(t.colors)}</h4>` +
      this._field(t.cBackground, this._color("s_background", s.background, DEFAULT_STYLE.background)) +
      this._field(t.cFloor1, this._color("s_floor0", fl[0], DEFAULT_STYLE.floor[0])) +
      this._field(t.cFloor2, this._color("s_floor1", fl[1], DEFAULT_STYLE.floor[1])) +
      this._field(t.cWall, this._color("s_wall", s.wall, DEFAULT_STYLE.wall)) +
      this._field(t.cEdge, this._color("s_edge", s.edge, DEFAULT_STYLE.edge)) + `</section>`;
  }

  _bindSide(side) {
    const sel = this._sel, el = sel ? this._plan[sel.kind][sel.i] : null;
    side.querySelectorAll("[data-k]").forEach((inp) => {
      const k = inp.getAttribute("data-k");
      inp.addEventListener("change", () => {
        const v = inp.type === "checkbox" ? inp.checked : inp.type === "number" ? parseFloat(inp.value) : inp.value;
        if (k === "__cur") { this._building = v; return; }
        if (k.indexOf("s_") === 0) return this._setStyle(k.slice(2), v);
        if (!el) return;
        this._change(() => this._setProp(el, k, v));
      });
    });
    side.querySelectorAll("[data-reset]").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      const k = b.getAttribute("data-reset");
      if (k.indexOf("s_") === 0) return this._setStyle(k.slice(2), null);
      if (el) this._change(() => { delete el[k]; });
    }));
    side.querySelectorAll("[data-ent]").forEach((inp) => inp.addEventListener("change", () => {
      const f = inp.getAttribute("data-ent"), key = inp.getAttribute("data-key");
      const list = inp.value.split(",").map((x) => x.trim()).filter(Boolean);
      this._change(() => {
        const e = this._plan.entities[key] || (this._plan.entities[key] = {});
        if (SINGLE.indexOf(f) >= 0) { if (list[0]) e[f] = list[0]; else delete e[f]; } else e[f] = list;
      });
    }));
    side.querySelectorAll("[data-lv]").forEach((inp) => inp.addEventListener("change", () => {
      const lv = this._lv(); this._change(() => { lv[inp.getAttribute("data-lv")] = inp.value; });
    }));
    side.querySelectorAll("[data-bg]").forEach((inp) => inp.addEventListener(inp.type === "range" ? "input" : "change", () => {
      const lv = this._lv(), k = inp.getAttribute("data-bg");
      const v = inp.tagName === "SELECT" ? inp.value : parseFloat(inp.value);
      if (inp.type === "range") { lv.background[k] = v; this._dirty = true; this._renderCanvas(); this._renderHeader(); return; }
      this._change(() => {
        if (k === "width" && lv.background.height) lv.background.height *= v / lv.background.width;
        lv.background[k] = v;
      });
    }));
    side.querySelectorAll("[data-p]").forEach((inp) => inp.addEventListener("change", () => {
      const k = inp.getAttribute("data-p");
      const v = inp.type === "checkbox" ? inp.checked : inp.type === "number" ? parseFloat(inp.value) || 0 : inp.value;
      this._change(() => { if (v === "" && k === "hide_label") delete this._plan[k]; else this._plan[k] = k === "id" ? slug(v) : v; });
    }));
    side.querySelectorAll("[data-b]").forEach((inp) => inp.addEventListener("change", () => {
      const b = this._plan.buildings[+inp.getAttribute("data-b")]; this._change(() => { b.name = inp.value; });
    }));
    side.querySelectorAll("[data-view]").forEach((inp) => inp.addEventListener("change", () => {
      this["_" + inp.getAttribute("data-view")] = inp.checked; this._renderCanvas();
    }));
    side.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => this._act(b.getAttribute("data-act"), b)));
  }

  _setProp(el, k, v) {
    if (k === "partof") {
      if (v) { el.id = v; el.name = null; } else { el.name = el.name || el.id; }
      return;
    }
    if (k === "id") {
      const old = el.id, nid = slug(v);
      el.id = nid;
      if (!el.key && this._plan.entities[old] && !this._plan.entities[nid]) { this._plan.entities[nid] = this._plan.entities[old]; delete this._plan.entities[old]; }
      return;
    }
    if (k === "name") {
      el.name = v;
      return;
    }
    if (k === "key") { if (v) el.key = slug(v); else delete el.key; return; }
    if (k === "building" && !v) { delete el.building; return; }
    if (v === false || v === "") { delete el[k]; return; }
    el[k] = v;
  }

  _setStyle(k, v) {
    this._change(() => {
      const s = this._plan.style || (this._plan.style = {});
      if (k === "floor0" || k === "floor1") {
        const fl = Array.isArray(s.floor) ? s.floor.slice() : DEFAULT_STYLE.floor.slice();
        fl[k === "floor0" ? 0 : 1] = v || DEFAULT_STYLE.floor[k === "floor0" ? 0 : 1];
        s.floor = fl;
        if (!v && fl[0] === DEFAULT_STYLE.floor[0] && fl[1] === DEFAULT_STYLE.floor[1]) delete s.floor;
        return;
      }
      if (v) s[k] = v; else delete s[k];
    });
  }

  _act(a, btn) {
    const t = this.t, p = this._plan;
    if (a === "delsel") return this._deleteSel();
    if (a === "upload") return this.shadowRoot.querySelector(".file").click();
    if (a === "rmimg") return this._change(() => { delete this._lv().background; });
    if (a === "lvdel") {
      const lv = this._lv();
      if (!lv || p.levels.length < 2 || !confirm(t.delLevel.replace("%s", lv.name))) return;
      return this._change(() => {
        p.levels = p.levels.filter((l) => l.id !== lv.id);
        ["rooms", "outlines", "lines", "openings"].forEach((k) => { p[k] = p[k].filter((x) => x.level !== lv.id); });
        this._level = p.levels[0].id; this._sel = null;
      });
    }
    if (a === "lvup" || a === "lvdown") {
      const i = p.levels.findIndex((l) => l.id === this._level), j = a === "lvup" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= p.levels.length) return;
      return this._change(() => { const x = p.levels[i]; p.levels[i] = p.levels[j]; p.levels[j] = x; });
    }
    if (a === "badd") {
      const name = prompt(t.buildingName);
      if (!name) return;
      let id = slug(name), n = 2;
      while (p.buildings.some((b) => b.id === id)) id = slug(name) + "_" + n++;
      return this._change(() => { p.buildings.push({ id, name }); this._building = id; });
    }
    if (a === "bdel") {
      const b = p.buildings[+btn.getAttribute("data-i")];
      if (!b || !confirm(t.delBuilding.replace("%s", b.name))) return;
      return this._change(() => {
        p.buildings = p.buildings.filter((x) => x !== b);
        ["rooms", "outlines"].forEach((k) => p[k].forEach((x) => { if (x.building === b.id) delete x.building; }));
        if (this._building === b.id) this._building = "";
      });
    }
    if (a === "northup") {
      const n = p.north || 0;
      if (!n) return;
      return this._change(() => { this._rotateAll(-n); p.north = 0; });
    }
  }

  /* ---------- Background image ---------- */
  async _upload(file) {
    if (!file) return;
    this._status(this.t.uploading);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await this._hass.fetchWithAuth("/api/image/upload", { method: "POST", body: fd });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const info = await resp.json();
      const url = `/api/image/serve/${info.id}/original`;
      const size = await new Promise((res) => {
        const img = new Image();
        img.onload = () => res([img.naturalWidth, img.naturalHeight]);
        img.onerror = () => res(null);
        img.src = URL.createObjectURL(file);
      });
      const lv = this._lv(), vb = this._vb || [0, 0, 30, 20];
      const width = R3(Math.max(10, vb[2] * 0.8));
      this._change(() => {
        lv.background = { image: url, x: R3(vb[0] + vb[2] * 0.1), y: R3(vb[1] + vb[3] * 0.1), width,
          height: size ? R3(width * size[1] / size[0]) : undefined, rotation: 0, opacity: 0.6, mode: "under" };
        if (!lv.background.height) delete lv.background.height;
      });
      this._status(this.t.hintScale);
      this._setTool("scale");
    } catch (e) {
      this._status(String((e && e.message) || e), true);
    }
    this.shadowRoot.querySelector(".file").value = "";
  }

  /* ---------- Plan helpers ---------- */
  _lv() { return this._plan && this._plan.levels.find((l) => l.id === this._level); }
  _of(kind) { return this._plan[kind].map((x, i) => ({ x, i })).filter((e) => e.x.level === this._level); }
  _below() {
    const i = this._plan.levels.findIndex((l) => l.id === this._level);
    return i > 0 ? this._plan.levels[i - 1].id : null;
  }

  _rotateAll(deg, c) {  // turn the whole plan (all levels, images) – coordinates stay in metres
    const p = this._plan;
    if (!c) {
      const all = [];
      ["rooms", "outlines", "lines"].forEach((k) => p[k].forEach((x) => x.poly.forEach((q) => all.push(q))));
      const b = all.length ? bbox(all) : [0, 0, 0, 0];
      c = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
    }
    ["rooms", "outlines", "lines"].forEach((k) => p[k].forEach((x) => {
      x.poly = x.poly.map((q) => rotP(q, deg, c));
      if (x.label_at) x.label_at = rotP(x.label_at, deg, c);
    }));
    p.openings.forEach((o) => { o.at = rotP(o.at, deg, c); o.angle = R3(((o.angle || 0) + deg) % 360); });
    p.levels.forEach((l) => {
      delete l.view;
      if (l.background) {
        const q = rotP([l.background.x || 0, l.background.y || 0], deg, c);
        l.background.x = q[0]; l.background.y = q[1];
        l.background.rotation = R3(((l.background.rotation || 0) + deg) % 360);
      }
    });
    p.north = R3((((p.north || 0) + deg) % 360 + 360) % 360);
    this._vb = null;
  }

  _deleteSel() {
    const s = this._sel;
    if (!s) return;
    this._change(() => { this._plan[s.kind].splice(s.i, 1); this._sel = null; });
  }

  /* ---------- Canvas ---------- */
  _svg() { return this.shadowRoot.querySelector(".canvas"); }

  _fit() {
    if (!this._plan) return;
    const all = [];
    ["rooms", "outlines", "lines"].forEach((k) => this._of(k).forEach((e) => e.x.poly.forEach((q) => all.push(q))));
    const lv = this._lv(), b = lv && lv.background;
    if (b && b.image) { all.push([b.x || 0, b.y || 0]); all.push([(b.x || 0) + b.width, (b.y || 0) + (b.height || b.width * 0.66)]); }
    const svg = this._svg(), W = svg.clientWidth || 800, H = svg.clientHeight || 600;
    let [x1, y1, x2, y2] = all.length ? bbox(all) : [-2, -2, 18, 12];
    x1 -= 2; y1 -= 2; x2 += 2; y2 += 2;
    let w = x2 - x1, h = y2 - y1;
    if (w / h < W / H) { const nw = h * W / H; x1 -= (nw - w) / 2; w = nw; } else { const nh = w * H / W; y1 -= (nh - h) / 2; h = nh; }
    this._vb = [x1, y1, w, h];
    this._renderCanvas();
  }

  _zoom(f, at) {
    if (!this._vb) return;
    const [x, y, w, h] = this._vb, c = at || [x + w / 2, y + h / 2];
    this._vb = [c[0] - (c[0] - x) * f, c[1] - (c[1] - y) * f, w * f, h * f];
    this._renderCanvas();
  }

  _scale() {  // metres per screen pixel
    const svg = this._svg();
    return this._vb ? this._vb[2] / (svg.clientWidth || 800) : 0.05;
  }

  _pt(e) {
    const svg = this._svg(), r = svg.getBoundingClientRect(), vb = this._vb || [0, 0, 1, 1];
    // preserveAspectRatio none: x and y scale independently (the view box always matches the canvas aspect)
    return [vb[0] + (e.clientX - r.left) / r.width * vb[2], vb[1] + (e.clientY - r.top) / r.height * vb[3]];
  }

  _renderCanvas() {
    const svg = this._svg();
    if (!svg) return;
    if (!this._plan || !this._level) { svg.innerHTML = ""; return; }
    if (!this._vb) { this._fit(); return; }
    const W = svg.clientWidth || 800, H = svg.clientHeight || 600;
    // keep the aspect of the view box equal to the canvas
    const [vx, vy, vw] = this._vb, vh = vw * H / W;
    this._vb[3] = vh;
    svg.setAttribute("viewBox", `${vx} ${vy} ${vw} ${vh}`);
    svg.setAttribute("preserveAspectRatio", "none");
    const px = this._scale(), p = this._plan, st = Object.assign({}, DEFAULT_STYLE, p.style || {});
    const fl = Array.isArray(st.floor) ? st.floor : DEFAULT_STYLE.floor;
    let h = `<defs><linearGradient id="fl" gradientUnits="userSpaceOnUse" x1="${vx}" y1="${vy}" x2="${vx + vw}" y2="${vy + vh}">` +
      `<stop offset="0" stop-color="${esc(fl[0])}"/><stop offset="1" stop-color="${esc(fl[1])}"/></linearGradient></defs>`;
    h += `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${esc(st.background)}"/>`;
    const lv = this._lv(), bg = lv && lv.background;
    const bgHtml = bg && bg.image ? `<image class="bg" href="${esc(bg.image)}" x="${bg.x || 0}" y="${bg.y || 0}" width="${bg.width}" height="${bg.height || bg.width * 4}" ` +
      `preserveAspectRatio="${bg.height ? "none" : "xMinYMin meet"}" opacity="${bg.mode === "hidden" ? 0.15 : (bg.opacity === undefined ? 1 : bg.opacity)}"` +
      (bg.rotation ? ` transform="rotate(${bg.rotation} ${bg.x || 0} ${bg.y || 0})"` : "") + `/>` : "";
    if (!bg || bg.mode !== "over") h += bgHtml;
    if (this._grid) h += this._gridHtml(px);
    if (this._ghost) {
      const below = this._below();
      if (below) {
        ["outlines", "rooms"].forEach((k) => p[k].filter((x) => x.level === below).forEach((x) =>
          { h += `<polygon class="ghost" points="${pts(x.poly)}" stroke-width="${2 * px}"/>`; }));
      }
    }
    const S = this._sel;
    this._of("rooms").forEach(({ x, i }) => {
      const sel = S && S.kind === "rooms" && S.i === i;
      h += `<polygon class="room${x.outdoor ? " out" : ""}${sel ? " sel" : ""}" data-k="rooms" data-i="${i}" points="${pts(x.poly)}" ` +
        `fill="${x.color ? esc(x.color) : x.outdoor ? "rgba(90,160,110,.28)" : "url(#fl)"}" stroke="${esc(st.wall)}" stroke-width="${x.outdoor ? 2 * px : 0.2}"/>`;
    });
    this._of("outlines").forEach(({ x, i }) => {
      const sel = S && S.kind === "outlines" && S.i === i;
      h += `<polygon class="outline${sel ? " sel" : ""}" data-k="outlines" data-i="${i}" points="${pts(x.poly)}" stroke="${esc(st.wall)}" stroke-width="0.5"/>`;
    });
    this._of("lines").forEach(({ x, i }) => {
      const sel = S && S.kind === "lines" && S.i === i;
      h += `<${x.open ? "polyline" : "polygon"} class="hline${sel ? " sel" : ""}" data-k="lines" data-i="${i}" points="${pts(x.poly)}" stroke="${esc(st.edge)}" stroke-width="${3 * px}"/>`;
    });
    this._of("openings").forEach(({ x, i }) => {
      const sel = S && S.kind === "openings" && S.i === i;
      h += `<polygon class="op${sel ? " sel" : ""}" data-k="openings" data-i="${i}" points="${pts(openingRect(x))}" fill="${esc(st.background)}"/>` + this._openingSym(x, px);
    });
    if (bg && bg.mode === "over") h += bgHtml;
    // labels
    this._of("rooms").forEach(({ x, i }) => {
      if (!x.name) return;
      const c = x.label_at || centroid(x.poly), fs = 13 * px;
      h += `<text class="lbl" data-k="rooms" data-i="${i}" data-label="1" x="${c[0]}" y="${c[1]}" font-size="${x.small ? fs * 0.8 : fs}">${esc(x.name)}</text>`;
    });
    if (this._dims) h += this._dimsHtml(px);
    // handles of the selection
    if (S && this._plan[S.kind][S.i] && S.kind !== "openings") {
      const el = this._plan[S.kind][S.i];
      el.poly.forEach((q, j) => { h += `<circle class="handle" data-v="${j}" cx="${q[0]}" cy="${q[1]}" r="${6 * px}" stroke-width="${2 * px}"/>`; });
      if (S.kind === "rooms" && el.name) {
        const c = el.label_at || centroid(el.poly);
        h += `<rect class="lhandle" data-lh="1" x="${c[0] - 5 * px}" y="${c[1] + 8 * px}" width="${10 * px}" height="${10 * px}" stroke-width="${2 * px}"/>`;
      }
    }
    // draft and snap
    if (this._draft && this._draft.length) {
      const d = this._draft.concat(this._hover ? [this._hover] : []);
      h += `<polyline class="draft" points="${pts(d)}" stroke-width="${2 * px}"/>`;
      this._draft.forEach((q, j) => { h += `<circle class="dpt${j === 0 ? " first" : ""}" cx="${q[0]}" cy="${q[1]}" r="${(j === 0 ? 6 : 4) * px}"/>`; });
      if (this._hover && this._draft.length) {
        const a = this._draft[this._draft.length - 1], m = [(a[0] + this._hover[0]) / 2, (a[1] + this._hover[1]) / 2];
        h += `<text class="len" x="${m[0]}" y="${m[1] - 6 * px}" font-size="${12 * px}">${dist(a, this._hover).toFixed(2)} m</text>`;
      }
    }
    if (this._scaleA) h += `<circle class="dpt first" cx="${this._scaleA[0]}" cy="${this._scaleA[1]}" r="${6 * px}"/>` +
      (this._hover ? `<line class="draft" x1="${this._scaleA[0]}" y1="${this._scaleA[1]}" x2="${this._hover[0]}" y2="${this._hover[1]}" stroke-width="${2 * px}"/>` : "");
    if (this._snapMark) h += `<circle class="snap" cx="${this._snapMark[0]}" cy="${this._snapMark[1]}" r="${8 * px}" stroke-width="${2 * px}"/>`;
    if (this._openingPreview) h += `<polygon class="op preview" points="${pts(openingRect(this._openingPreview))}"/>` + this._openingSym(this._openingPreview, px);
    // north arrow
    const n = p.north || 0, nc = [vx + vw - 40 * px, vy + 46 * px];
    h += `<g class="north" transform="rotate(${n} ${nc[0]} ${nc[1]})"><path d="M${nc[0]} ${nc[1] - 22 * px} L${nc[0] + 8 * px} ${nc[1] + 8 * px} L${nc[0]} ${nc[1] + 2 * px} L${nc[0] - 8 * px} ${nc[1] + 8 * px} Z"/>` +
      `<text x="${nc[0]}" y="${nc[1] - 26 * px}" font-size="${12 * px}">N</text></g>`;
    svg.innerHTML = h;
  }

  _gridHtml(px) {
    const [vx, vy, vw, vh] = this._vb;
    const step = px * 40 > 2 ? 5 : px * 40 > 0.5 ? 1 : 0.5;
    let h = `<g class="grid" stroke-width="${px}">`;
    const x0 = Math.floor(vx / step) * step, y0 = Math.floor(vy / step) * step;
    for (let x = x0; x <= vx + vw; x += step) h += `<line x1="${x}" y1="${vy}" x2="${x}" y2="${vy + vh}"${Math.round(x / step) % 5 === 0 ? ' class="m"' : ""}/>`;
    for (let y = y0; y <= vy + vh; y += step) h += `<line x1="${vx}" y1="${y}" x2="${vx + vw}" y2="${y}"${Math.round(y / step) % 5 === 0 ? ' class="m"' : ""}/>`;
    return h + "</g>";
  }

  _dimsHtml(px) {
    let h = "";
    const edge = (a, b) => {
      const d = dist(a, b);
      if (d < 0.5) return;
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      h += `<text class="dim" x="${m[0]}" y="${m[1]}" font-size="${10 * px}">${d.toFixed(2)}</text>`;
    };
    ["rooms", "outlines"].forEach((k) => this._of(k).forEach(({ x }) => x.poly.forEach((q, j) => edge(q, x.poly[(j + 1) % x.poly.length]))));
    return h;
  }

  _openingSym(o, px) {
    const r = (o.angle || 0) * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r), w = (o.width || 0.9) / 2;
    const a = [o.at[0] - dx * w, o.at[1] - dy * w], b = [o.at[0] + dx * w, o.at[1] + dy * w];
    const line = (p, q, cls) => `<line class="${cls}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke-width="${2.5 * px}"/>`;
    if (o.type === "window") return line(a, b, "sym win");
    if (o.type === "garage") return line(a, b, "sym gar");
    if (o.type === "door") {
      const s = o.flip ? -1 : 1, L = 2 * w, tip = [a[0] - dy * L * s, a[1] + dx * L * s];
      return line(a, tip, "sym") + `<path class="sym swing" d="M${tip[0]} ${tip[1]} A${L} ${L} 0 0 ${s > 0 ? 0 : 1} ${b[0]} ${b[1]}" stroke-width="${1.5 * px}"/>`;
    }
    return "";
  }

  /* ---------- Snapping ---------- */
  _snap(p, from, free) {
    const tol = 10 * this._scale();
    let best = null, bd = tol;
    const polys = [];
    ["rooms", "outlines", "lines"].forEach((k) => this._of(k).forEach(({ x }) => polys.push(x.poly)));
    const below = this._ghost && this._below();
    if (below) ["rooms", "outlines"].forEach((k) => this._plan[k].filter((x) => x.level === below).forEach((x) => polys.push(x.poly)));
    if (this._draft) polys.push(this._draft);
    polys.forEach((poly) => poly.forEach((q) => { const d = dist(p, q); if (d < bd) { bd = d; best = q; } }));
    if (best) { this._snapMark = best; return best.slice(); }
    let q = p;
    if (from && !free) {  // 45° steps relative to the last point
      const v = sub(p, from), L = len(v);
      if (L > 0) {
        const ang = Math.round(Math.atan2(v[1], v[0]) / (Math.PI / 4)) * (Math.PI / 4);
        q = [from[0] + Math.cos(ang) * L, from[1] + Math.sin(ang) * L];
      }
    }
    // onto an edge
    let eb = null; bd = tol;
    polys.forEach((poly) => poly.forEach((a, j) => {
      if (poly === this._draft && j === poly.length - 1) return;
      const b = poly[(j + 1) % poly.length], pr = proj(q, a, b), d = dist(q, pr.p);
      if (d < bd) { bd = d; eb = pr.p; }
    }));
    if (eb) { this._snapMark = eb; return [R3(eb[0]), R3(eb[1])]; }
    this._snapMark = null;
    const g = 0.05;  // 5 cm grid
    return [R3(Math.round(q[0] / g) * g), R3(Math.round(q[1] / g) * g)];
  }

  _nearestWall(p) {  // nearest edge of a room or outer wall on this level
    const tol = 14 * this._scale();
    let best = null;
    ["outlines", "rooms"].forEach((k) => this._of(k).forEach(({ x }) => {
      if (k === "rooms" && x.outdoor) return;
      x.poly.forEach((a, j) => {
        const b = x.poly[(j + 1) % x.poly.length], pr = proj(p, a, b), d = dist(p, pr.p);
        if (d < tol && (!best || d < best.d)) best = { d, p: pr.p, a, b, outer: k === "outlines" };
      });
    }));
    return best;
  }

  _hit(e) {  // element under the pointer: handle, label handle or element
    const t = e.target;
    if (t.hasAttribute && t.hasAttribute("data-v")) return { v: +t.getAttribute("data-v") };
    if (t.hasAttribute && t.hasAttribute("data-lh")) return { lh: true };
    if (t.hasAttribute && t.hasAttribute("data-k")) return { kind: t.getAttribute("data-k"), i: +t.getAttribute("data-i") };
    return null;
  }

  /* ---------- Pointer ---------- */
  _down(e) {
    if (!this._plan || !this._vb) return;
    const svg = this._svg();
    const p = this._pt(e);
    if (e.button === 1 || this._tool === "pan" || (e.button === 0 && this._space)) {
      this._drag = { pan: true, start: [e.clientX, e.clientY], vb: this._vb.slice() };
      svg.setPointerCapture(e.pointerId); return;
    }
    if (e.button !== 0) return;
    const tool = this._tool;
    if (POLY_TOOLS.indexOf(tool) >= 0 || tool === "line") return this._draftClick(this._snap(p, this._draft && this._draft[this._draft.length - 1], e.shiftKey), e);
    if (OPENING_TOOLS.indexOf(tool) >= 0) {
      const w = this._nearestWall(p);
      if (!w) return;
      const ang = Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) * 180 / Math.PI;
      const width = { door: 0.9, window: 1.2, passage: 0.9, garage: 2.5 }[tool];
      return this._change(() => {
        this._plan.openings.push({ level: this._level, type: tool, at: [R3(w.p[0]), R3(w.p[1])], angle: R3(ang), width, depth: w.outer ? 0.54 : 0.24 });
        this._openingPreview = null;
      });
    }
    if (tool === "scale") {
      if (!this._scaleA) { this._scaleA = p; this._renderCanvas(); return; }
      const a = this._scaleA, d = dist(a, p);
      this._scaleA = null;
      const real = parseFloat(String(prompt(this.t.scalePrompt, d.toFixed(2)) || "").replace(",", "."));
      const lv = this._lv();
      if (!real || !d || !lv || !lv.background) return this._renderCanvas();
      const f = real / d, bg = lv.background;
      return this._change(() => {
        bg.x = R3(a[0] + ((bg.x || 0) - a[0]) * f); bg.y = R3(a[1] + ((bg.y || 0) - a[1]) * f);
        bg.width = R3(bg.width * f); if (bg.height) bg.height = R3(bg.height * f);
        this._vb = [a[0] + (this._vb[0] - a[0]) * f, a[1] + (this._vb[1] - a[1]) * f, this._vb[2] * f, this._vb[3] * f];
      });
    }
    if (tool === "alignWall") {
      const w = this._nearestWall(p);
      if (!w) return;
      let ang = Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) * 180 / Math.PI;
      ang = ((ang % 180) + 180) % 180; if (ang > 90) ang -= 180;  // shortest turn to horizontal
      if (Math.abs(ang) < 0.01) return;
      return this._change(() => { this._rotateAll(-ang); this._setTool("select"); });
    }
    if (tool === "image") {
      const lv = this._lv();
      if (!lv || !lv.background) return;
      this._undo.push(JSON.stringify(this._plan)); this._redo = [];
      this._drag = { img: true, start: p, x: lv.background.x || 0, y: lv.background.y || 0 };
      svg.setPointerCapture(e.pointerId); return;
    }
    // select
    const hit = this._hit(e);
    if (hit && hit.v !== undefined && this._sel) {
      this._undo.push(JSON.stringify(this._plan)); this._redo = [];
      this._drag = { vertex: hit.v }; svg.setPointerCapture(e.pointerId); return;
    }
    if (hit && hit.lh && this._sel) {
      this._undo.push(JSON.stringify(this._plan)); this._redo = [];
      this._drag = { label: true }; svg.setPointerCapture(e.pointerId); return;
    }
    if (hit && hit.kind) {
      const same = this._sel && this._sel.kind === hit.kind && this._sel.i === hit.i;
      this._sel = { kind: hit.kind, i: hit.i };
      if (same || hit.kind === "openings") {
        this._undo.push(JSON.stringify(this._plan)); this._redo = [];
        this._drag = { body: true, start: p, orig: clone(this._plan[hit.kind][hit.i]), moved: false };
        svg.setPointerCapture(e.pointerId);
      }
      this._renderSide(); this._renderCanvas(); return;
    }
    this._sel = null;
    this._drag = { pan: true, start: [e.clientX, e.clientY], vb: this._vb.slice() };
    svg.setPointerCapture(e.pointerId);
    this._renderSide(); this._renderCanvas();
  }

  _move(e) {
    if (!this._plan || !this._vb) return;
    const p = this._pt(e), d = this._drag;
    if (d && d.pan) {
      const r = this._svg().getBoundingClientRect(), f = this._vb[2] / r.width;
      this._vb = [d.vb[0] - (e.clientX - d.start[0]) * f, d.vb[1] - (e.clientY - d.start[1]) * f, d.vb[2], d.vb[3]];
      return this._renderCanvas();
    }
    if (d && d.img) {
      const bg = this._lv().background;
      bg.x = R3(d.x + p[0] - d.start[0]); bg.y = R3(d.y + p[1] - d.start[1]);
      this._dirty = true; return this._renderCanvas();
    }
    if (d && d.vertex !== undefined) {
      const el = this._plan[this._sel.kind][this._sel.i];
      const old = el.poly[d.vertex];
      el.poly[d.vertex] = [NaN, NaN];  // ignore itself while snapping
      el.poly[d.vertex] = this._snap(p, null, true) || old;
      this._dirty = true; return this._renderCanvas();
    }
    if (d && d.label) {
      const el = this._plan[this._sel.kind][this._sel.i];
      el.label_at = [R3(p[0]), R3(p[1])]; this._dirty = true; return this._renderCanvas();
    }
    if (d && d.body) {
      const el = this._plan[this._sel.kind][this._sel.i], g = 0.05;
      const dx = Math.round((p[0] - d.start[0]) / g) * g, dy = Math.round((p[1] - d.start[1]) / g) * g;
      if (!dx && !dy && !d.moved) return;
      d.moved = true;
      if (this._sel.kind === "openings") {
        const w = this._nearestWall(p);
        if (w) {
          el.at = [R3(w.p[0]), R3(w.p[1])];
          el.angle = R3(Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) * 180 / Math.PI);
        }
      } else {
        el.poly = d.orig.poly.map((q) => [R3(q[0] + dx), R3(q[1] + dy)]);
        if (d.orig.label_at) el.label_at = [R3(d.orig.label_at[0] + dx), R3(d.orig.label_at[1] + dy)];
      }
      this._dirty = true; return this._renderCanvas();
    }
    const tool = this._tool;
    if (POLY_TOOLS.indexOf(tool) >= 0 || tool === "line") {
      this._hover = this._snap(p, this._draft && this._draft[this._draft.length - 1], e.shiftKey);
      return this._renderCanvas();
    }
    if (tool === "scale" && this._scaleA) { this._hover = p; return this._renderCanvas(); }
    if (OPENING_TOOLS.indexOf(tool) >= 0) {
      const w = this._nearestWall(p);
      this._openingPreview = w ? { type: tool, at: w.p, angle: Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) * 180 / Math.PI,
        width: { door: 0.9, window: 1.2, passage: 0.9, garage: 2.5 }[tool], depth: w.outer ? 0.54 : 0.24 } : null;
      return this._renderCanvas();
    }
  }

  _up(e) {
    const d = this._drag;
    this._drag = null;
    try { this._svg().releasePointerCapture(e.pointerId); } catch (x) { /* not captured */ }
    if (!d) return;
    if (d.body && !d.moved) this._undo.pop();
    this._snapMark = null;
    if (d.vertex !== undefined || d.body || d.label || d.img) { this._renderAll(); }
  }

  _dbl(e) {  // double click on an edge of the selection inserts a corner
    if (this._tool !== "select" || !this._sel || this._sel.kind === "openings") return;
    const el = this._plan[this._sel.kind][this._sel.i], p = this._pt(e), tol = 10 * this._scale();
    let best = null;
    el.poly.forEach((a, j) => {
      if (this._sel.kind === "lines" && el.open && j === el.poly.length - 1) return;
      const b = el.poly[(j + 1) % el.poly.length], pr = proj(p, a, b), d = dist(p, pr.p);
      if (d < tol && (!best || d < best.d)) best = { d, j, p: pr.p };
    });
    if (best) this._change(() => { el.poly.splice(best.j + 1, 0, [R3(best.p[0]), R3(best.p[1])]); });
  }

  _ctx(e) {  // right click on a corner removes it
    e.preventDefault();
    const hit = this._hit(e);
    if (this._draft) { this._draft.pop(); if (!this._draft.length) this._draft = null; return this._renderCanvas(); }
    if (!hit || hit.v === undefined || !this._sel) return;
    const el = this._plan[this._sel.kind][this._sel.i], min = this._sel.kind === "lines" ? 2 : 3;
    if (el.poly.length <= min) return;
    this._change(() => { el.poly.splice(hit.v, 1); });
  }

  _draftClick(p) {
    const d = this._draft || (this._draft = []);
    if (d.length >= 3 && this._tool !== "line" && dist(p, d[0]) < 1e-6) return this._finish();
    if (d.length && dist(p, d[d.length - 1]) < 1e-6) return;
    d.push(p);
    this._renderCanvas();
  }

  _finish() {
    const d = this._draft, tool = this._tool;
    this._draft = null; this._hover = null; this._snapMark = null;
    if (!d || d.length < (tool === "line" ? 2 : 3)) return this._renderCanvas();
    const p = this._plan;
    this._change(() => {
      if (tool === "outline") {
        const o = { level: this._level, poly: d };
        if (this._building) o.building = this._building;
        p.outlines.push(o);
        this._sel = { kind: "outlines", i: p.outlines.length - 1 };
      } else if (tool === "line") {
        p.lines.push({ level: this._level, poly: d, open: true });
        this._sel = { kind: "lines", i: p.lines.length - 1 };
      } else {
        const base = tool === "outdoor" ? (this.t === T.de ? "Garten" : "Garden") : (this.t === T.de ? "Raum" : "Room");
        let n = 1, name = base + " " + n;
        while (p.rooms.some((r) => r.name === name)) name = base + " " + ++n;
        let id = slug(name), k = 2;
        while (p.rooms.some((r) => r.id === id)) id = slug(name) + "_" + k++;
        const r = { id, level: this._level, name, poly: d };
        if (tool === "outdoor") r.outdoor = true;
        if (this._building && tool !== "outdoor") r.building = this._building;
        p.rooms.push(r);
        this._sel = { kind: "rooms", i: p.rooms.length - 1 };
      }
    });
    this._setTool("select");
  }

  _key(e) {
    if (!this.isConnected || !this._plan) return;
    const path = e.composedPath ? e.composedPath() : [];
    const typing = path.some((n) => n && (n.tagName === "INPUT" || n.tagName === "TEXTAREA" || n.tagName === "SELECT"));
    if (e.key === " " && !typing) { this._space = e.type === "keydown"; }
    if (typing) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); return e.shiftKey ? this._doRedo() : this._doUndo(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") { e.preventDefault(); return this._doRedo(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); return this._save(); }
    if (e.key === "Escape") { this._draft = null; this._scaleA = null; this._sel = null; this._renderSide(); return this._renderCanvas(); }
    if (e.key === "Enter" && this._draft) { e.preventDefault(); return this._finish(); }
    if (e.key === "Backspace" && this._draft) { e.preventDefault(); this._draft.pop(); if (!this._draft.length) this._draft = null; return this._renderCanvas(); }
    if ((e.key === "Delete" || e.key === "Backspace") && this._sel) { e.preventDefault(); return this._deleteSel(); }
  }

  /* ---------- Preview with the real card ---------- */
  _renderPreview() {
    const box = this.shadowRoot.querySelector(".previewbox");
    if (!box) return;
    box.hidden = !this._preview || !this._plan;
    if (box.hidden) { box.innerHTML = ""; this._card = null; return; }
    if (!customElements.get("floorplan-lite-card")) { box.textContent = "floorplan-lite-card?"; return; }
    if (!this._card) { box.innerHTML = ""; this._card = document.createElement("floorplan-lite-card"); box.appendChild(this._card); }
    const ids = this._plan.levels.map((l) => l.id);
    this._card.setConfig({ plan: this._plan.id, plan_data: clone(this._plan), mode: "swipe", start: this._level, intro: false, tap: "none", floors: ids });
    this._card.hass = this._hass;
  }
}

const STYLES = `
  :host { display: block; height: 100%; background: var(--primary-background-color); color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif); }
  * { box-sizing: border-box; }
  .app { display: flex; flex-direction: column; height: 100%; }
  header { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--app-header-background-color, var(--primary-color));
    color: var(--app-header-text-color, #fff); }
  header .title { font-size: 18px; margin-right: 8px; }
  header select { max-width: 220px; }
  header .sp { flex: 1; }
  .status { font-size: 13px; opacity: .9; margin-right: 6px; } .status.err { color: #ffd0d0; font-weight: 500; }
  button { font: inherit; font-size: 13px; padding: 5px 10px; border-radius: 8px; border: 1px solid var(--divider-color); cursor: pointer;
    background: var(--secondary-background-color); color: var(--primary-text-color); }
  button:disabled { opacity: .4; cursor: default; }
  header button { background: rgba(255,255,255,.12); color: inherit; border-color: rgba(255,255,255,.2); }
  header button.primary { background: #fff; color: var(--primary-color); font-weight: 500; }
  button.icon { padding: 4px 6px; } button ha-icon { --mdc-icon-size: 20px; display: flex; }
  .main { flex: 1; display: flex; min-height: 0; }
  .tools { display: flex; flex-direction: column; gap: 10px; padding: 8px 6px; border-right: 1px solid var(--divider-color);
    background: var(--card-background-color); overflow-y: auto; }
  .grp { display: flex; flex-direction: column; gap: 4px; }
  .tool { width: 40px; height: 40px; padding: 0; display: flex; align-items: center; justify-content: center; }
  .tool.on { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: transparent; }
  .stage { flex: 1; position: relative; min-width: 0; }
  .canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; touch-action: none; outline: none; cursor: crosshair; display: block; }
  .levels { position: absolute; top: 8px; left: 8px; z-index: 2; display: flex; gap: 4px; flex-wrap: wrap; }
  .lv { background: rgba(20,28,50,.85); color: #dfe6f7; border-color: rgba(255,255,255,.15); }
  .lv.on { background: var(--primary-color); color: #fff; }
  .hint { position: absolute; bottom: 8px; left: 8px; right: 140px; z-index: 2; font-size: 12px; color: #c9d3ea;
    background: rgba(13,20,39,.75); padding: 4px 8px; border-radius: 6px; pointer-events: none; }
  .hint:empty { display: none; }
  .zoom { position: absolute; bottom: 8px; right: 8px; z-index: 2; display: flex; gap: 4px; }
  .zoom button { background: rgba(20,28,50,.85); color: #dfe6f7; border-color: rgba(255,255,255,.15); min-width: 32px; }
  .previewbox { position: absolute; top: 48px; right: 8px; width: min(440px, 45%); z-index: 3; max-height: calc(100% - 100px); overflow: auto;
    box-shadow: 0 8px 30px rgba(0,0,0,.5); border-radius: 12px; }
  .side { width: 320px; overflow-y: auto; border-left: 1px solid var(--divider-color); background: var(--card-background-color); padding: 4px 12px 16px; }
  section { border-bottom: 1px solid var(--divider-color); padding: 8px 0 10px; }
  h3 { font-size: 15px; margin: 6px 0 8px; display: flex; align-items: center; gap: 6px; }
  h3 .sp { flex: 1; } h3 .danger { margin-left: auto; }
  h4 { font-size: 13px; margin: 12px 0 6px; opacity: .85; } h4 code { font-size: 11px; opacity: .7; }
  .f { display: flex; align-items: center; gap: 8px; margin: 4px 0; font-size: 13px; }
  .f > span { width: 118px; flex: 0 0 auto; opacity: .85; }
  .f input[type=text], .f input[type=number], .f select { flex: 1; min-width: 0; }
  input[type=text], input[type=number], select { font: inherit; font-size: 13px; padding: 4px 6px; border-radius: 6px;
    border: 1px solid var(--divider-color); background: var(--primary-background-color); color: var(--primary-text-color); }
  input[type=range] { flex: 1; }
  .crow { display: flex; gap: 6px; align-items: center; flex: 1; } .crow input[type=number] { width: 70px; flex: 0 0 auto; }
  .row { display: flex; gap: 6px; align-items: center; margin: 6px 0; flex-wrap: wrap; } .row input[type=text] { flex: 1; }
  .opts label, .cur { font-size: 12px; display: flex; align-items: center; gap: 4px; }
  .mini { padding: 2px 8px; font-size: 12px; } .danger { color: var(--error-color); }
  /* canvas */
  .grid line { stroke: rgba(160,182,230,.08); } .grid line.m { stroke: rgba(160,182,230,.18); }
  .room { stroke-linejoin: miter; cursor: pointer; } .room.out { stroke-dasharray: .3 .2; }
  .outline { fill: none; stroke-linejoin: miter; cursor: pointer; pointer-events: stroke; }
  .hline { fill: none; stroke-dasharray: .3 .22; cursor: pointer; pointer-events: stroke; opacity: .7; }
  .ghost { fill: none; stroke: rgba(255,255,255,.35); stroke-dasharray: .25 .2; pointer-events: none; }
  .sel { stroke: #4fc3ff !important; } .room.sel { filter: brightness(1.25); }
  .op { cursor: pointer; } .op.sel { stroke: #4fc3ff; stroke-width: .05; } .op.preview { fill: rgba(79,195,255,.5); pointer-events: none; }
  .sym { stroke: #8d9cc4; fill: none; pointer-events: none; stroke-linecap: round; } .sym.win { stroke: #9fd3ff; } .sym.gar { stroke-dasharray: .25 .18; }
  .sym.swing { stroke-dasharray: .12 .1; opacity: .7; }
  .lbl { fill: #e8eefb; text-anchor: middle; dominant-baseline: middle; pointer-events: none; paint-order: stroke; stroke: rgba(3,7,18,.8); stroke-width: .06; }
  .dim { fill: #ffd9a0; text-anchor: middle; dominant-baseline: middle; pointer-events: none; paint-order: stroke; stroke: rgba(3,7,18,.9); stroke-width: .05; }
  .handle { fill: #fff; stroke: #4fc3ff; cursor: move; } .lhandle { fill: #ffcd91; stroke: #4fc3ff; cursor: move; }
  .draft { fill: none; stroke: #4fc3ff; stroke-dasharray: .2 .12; pointer-events: none; }
  .dpt { fill: #4fc3ff; pointer-events: none; } .dpt.first { fill: #fff; stroke: #4fc3ff; stroke-width: .05; }
  .snap { fill: none; stroke: #ffcd91; pointer-events: none; }
  .len { fill: #fff; text-anchor: middle; pointer-events: none; paint-order: stroke; stroke: rgba(3,7,18,.9); stroke-width: .06; }
  .north path { fill: #ffcd91; opacity: .9; } .north text { fill: #ffcd91; text-anchor: middle; font-weight: 600; }
  image.bg { pointer-events: none; }
  @media (max-width: 900px) { .side { width: 250px; } }
`;

if (!customElements.get("floorplan-lite-panel")) customElements.define("floorplan-lite-panel", FloorplanLitePanel);
