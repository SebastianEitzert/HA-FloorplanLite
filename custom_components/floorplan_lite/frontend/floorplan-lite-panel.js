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
    newSite: "Neues Grundstück (mehrere Grundrisse als Gebäude)", siteName: "Name des Grundstücks",
    siteSide: "Grundstück: Die Gebäude sind andere Grundrisse – ziehen, drehen, skalieren. Außenbereiche (Hof, Garten) zeichnest du hier und verknüpfst sie mit einem Home-Assistant-Bereich. In einer Karte genügt dann plan: <dieses Grundstück>; Startansicht, Benutzer und Schaltflächen stellst du in der Karte ein.",
    partsHint: "Gebäudeteile innerhalb dieses Grundrisses (z. B. Stall und Garage in einer Zeichnung). Mehrere Grundrisse auf einem Grundstück: oben „Neues Grundstück“.",
    save: "Speichern", ok: "OK", cancel: "Abbrechen", rename: "Umbenennen", idHint: "Karten im Dashboard verweisen über die ID auf den Grundriss (plan: …). Nach einer Änderung dort anpassen.",
    wallInner: "Innenwände (cm)", wallOuter: "Außenwände (cm)", saved: "Gespeichert", unsaved: "Ungespeicherte Änderungen", undo: "Rückgängig", redo: "Wiederholen",
    del: "Löschen", delPlan: "Grundriss „%s“ wirklich löschen?", importJson: "JSON importieren", exportJson: "JSON exportieren",
    preview: "Vorschau", fit: "Einpassen", none: "Noch kein Grundriss – lege einen neuen an.",
    leave: "Ungespeicherte Änderungen verwerfen?",
    tools: { select: "Auswählen / bearbeiten", room: "Raum zeichnen", roomGen: "Raum erzeugen (in eine Fläche klicken)", split: "Raum teilen (Linie von Wand zu Wand)", wall: "Innenwand zeichnen", outline: "Außenwand zeichnen", outdoor: "Bereich außen (Garten, Hof, Terrasse)",
      line: "Hilfslinie (Vordach …)", door: "Tür", window: "Fenster", passage: "Durchgang ohne Tür", garage: "Garagentor", skylight: "Dachfenster / Lichtkuppel (frei im Raum)", openWall: "Keine Wand (offener Bereich)",
      image: "Hintergrundbild verschieben", scale: "Maßstab setzen (zwei Punkte)", alignWall: "Nach einer Wand ausrichten", straighten: "Hintergrund gerade ausrichten (zwei Punkte)", pan: "Verschieben (Ansicht)" },
    hintDraw: "Klicken setzt Punkte · Klick auf den ersten Punkt oder Enter schließt · Rücktaste entfernt den letzten · Esc bricht ab · Umschalt: freier Winkel",
    hintLine: "Klicken setzt Punkte · Enter oder erneuter Klick auf den letzten Punkt beendet · Esc bricht ab",
    hintWall: "Innenwand: Klicken setzt Punkte, sie springen auf Wandecken und Wände · Enter oder erneuter Klick auf den letzten Punkt beendet · Klick auf den ersten Punkt schließt · Umschalt: freier Winkel",
    hintRoomGen: "In eine von Wänden umschlossene Fläche klicken – der Raum füllt sie bis zu den Wänden",
    hintSplit: "Linie quer durch einen Raum zeichnen: Anfang und Ende auf seinem Rand, Zwischenpunkte für Knicke · Enter oder erneuter Klick auf den letzten Punkt teilt", noSplit: "Die Linie muss auf dem Rand eines Raums beginnen und enden und ihn durchqueren",
    noFace: "Hier ist keine geschlossene Fläche – fehlt ein Stück Wand?", haveRoom: "Hier ist schon ein Raum",
    hintOpening: "Auf eine Wand klicken, um die Öffnung zu setzen",
    hintOpenWall: "Auf die Wand zwischen zwei Räumen klicken – sie verschwindet ganz, beide bleiben eigene Räume (offene Küche, Wohn-Ess-Bereich)",
    hintSelect: "Element anklicken · Ecken ziehen · Doppelklick auf eine Kante fügt eine Ecke ein · Rechtsklick auf eine Ecke löscht sie · Entf löscht das Element",
    hintImage: "Bild mit der Maus verschieben", hintScale: "Zwei Punkte auf dem Bild anklicken, deren Abstand du kennst",
    hintAlign: "Eine Wand anklicken – der ganze Grundriss wird so gedreht, dass sie waagerecht liegt",
    hintStraighten: "Zwei Punkte auf einer Wand des Bildes anklicken – nur das Bild wird gedreht, bis diese Linie genau waagerecht oder senkrecht liegt (für schief eingescannte oder fotografierte Pläne)",
    copyLevel: "Stockwerk kopieren", copyLevelText: "Alles von „%s“ (Außenwände, Räume, Türen, Fenster, Hilfslinien) in ein neues Stockwerk kopieren. Die kopierten Räume bekommen eigene IDs ohne Entitäten.",
    scalePrompt: "Wie viele Meter liegen zwischen den beiden Punkten?",
    levels: "Stockwerke", level: "Stockwerk", addLevel: "Stockwerk hinzufügen", levelName: "Name des Stockwerks", levelShort: "Kürzel (z. B. EG)",
    copyOutlines: "Außenwände des aktuellen Stockwerks übernehmen?", delLevel: "Stockwerk „%s“ mit allen Räumen löschen?",
    up: "nach oben", down: "nach unten", buildings: "Gebäudeteile", building: "Gebäudeteil", addBuilding: "Gebäudeteil hinzufügen", buildingName: "Name des Gebäudeteils",
    noBuilding: "– ohne –", delBuilding: "Gebäude „%s“ entfernen? Elemente bleiben erhalten.",
    background: "Hintergrundbild", upload: "Bild oder PDF hochladen", removeImage: "Bild entfernen", opacity: "Deckkraft", mode: "Lage",
    modes: { under: "unter dem Plan", over: "über dem Plan", hidden: "ausgeblendet" }, rotation: "Drehung (Grad)", width: "Breite (m)",
    posX: "Links (m)", posY: "Oben (m)", uploading: "Wird hochgeladen …", rendering: "PDF wird umgewandelt …", pdfPage: "Die PDF hat %s Seiten – welche soll der Hintergrund werden?", page: "Seite",
    planSettings: "Grundriss", name: "Name", alignLevels: "Stockwerke aneinander ausrichten", hideLabel: "Entitäten mit diesen Labels ignorieren (Strg/⌘ für mehrere)", north: "Norden (Grad, 0 = oben)",
    northAlign: "Nach Norden ausrichten", colors: "Farben", cBackground: "Hintergrund", cFloor1: "Boden hell", cFloor2: "Boden dunkel",
    cWall: "Wände", cEdge: "Kanten", reset: "zurücksetzen",
    area: "Bereich (Home Assistant)", areaNone: "– keiner –", areaUsed: "schon im Plan", fill: "Entitäten aus dem Bereich übernehmen",
    filled: "%s Entitäten übernommen", fillNone: "Im Bereich keine passenden Entitäten gefunden",
    fillAll: "Alle Räume mit Bereich ausfüllen", areaLive: "Entitäten live aus dem Bereich (neue Geräte erscheinen von selbst)",
    popup: "Pop-up-YAML erzeugen", popupAll: "Pop-ups für alle Räume", popStyle: "Art",
    popAuto: "Wie Bereichs-Pop-ups: Bubble Card + auto-entities (dynamisch nach Bereich)", popStatic: "Einfach: Bubble Card mit festen Kacheln",
    copy: "Kopieren", copied: "Kopiert", dashboard: "Dashboard", view: "Ansicht", insert: "In Dashboard eintragen", close: "Schließen",
    more: "Weitere", inserted: "%s Pop-ups eingetragen, %s schon vorhanden", insertAsk: "%s Pop-ups in „%d“ → „%v“ eintragen? Vorhandene Pop-ups mit gleichem Hash bleiben unverändert.",
    strategy: "Dieses Dashboard wird automatisch erzeugt und kann nicht bearbeitet werden", noArea: "ohne Bereich → einfache Kacheln",
    defaultDash: "Übersicht (Standard)", areaHint: "Wähle den Bereich – Name, ID und die gefundenen Entitäten werden übernommen.",
    room: "Raum", wallEl: "Innenwand", wallWidth: "Stärke (m)", closedF: "geschlossen", roomWalls: "Räume zeichnen eigene Wände (ohne Innenwände)", outline: "Außenwand", refF: "Gezeichnete Linie ist", refOut: "Außenkante (Maß außen)", refMid: "Wandmitte", refIn: "Innenkante (Maß innen)", line: "Hilfslinie", opening: "Öffnung", id: "ID (Pop-up #…)", partOf: "Teil von Raum",
    partNone: "– eigener Raum –", ownEntities: "Eigene Entitäten (Schlüssel)", outdoorF: "Bereich außen", small: "kleine Beschriftung",
    color: "Farbe", noColor: "Standard", open: "offen (keine geschlossene Form)", type: "Art", widthM: "Breite (m)", depth: "Wandstärke (m)",
    flip: "Aufschlag spiegeln", entities: "Entitäten", ent: { licht: "Licht", hauptlicht: "Hauptlicht (füllt den Raum, die anderen als Saum)", praesenz: "Präsenz", bewegung: "Bewegung", temp: "Temperatur",
      fenster: "Fenster", beschattung: "Beschattung", musik: "Musik" },
    types: { door: "Tür", window: "Fenster", passage: "Durchgang", garage: "Garagentor", open: "Offen (keine Wand)", skylight: "Dachfenster / Lichtkuppel" },
    opEntities: "Entitäten (Kontakt, Cover, Schloss, Tor …)", opEntHint: "Antippen schaltet Schloss, Cover (Tor, elektrisches Fenster) oder Taster – mit Sicherheitsabfrage nach Rückfrage, sonst sofort. Ohne schaltbare Entität öffnet sich die Karte der ersten Entität. Gekippte Fenster werden erkannt (Zustand/Attribut gekippt oder tilted).",
    lengthM: "Länge (m)", angleDeg: "Drehung (Grad)", roundF: "rund (Lichtkuppel)",
    shadeF: "Rollladen / Jalousie davor", lightColour: "Lichtfarbe (Lichter und Schalter ohne eigene Farbe)",
    lc: { warm: "Warmweiß", neutral: "Neutralweiß", cold: "Kaltweiß", amber: "Bernstein", red: "Rot", green: "Grün", blue: "Blau", purple: "Violett", own: "eigene Farbe →" },
    tiltF: "Gekippt erkennen", tiltAuto: "automatisch (gekippt/tilted)", tiltAttr: "aus einem Attribut", tiltEnt: "aus einer eigenen Entität",
    tiltAttrF: "Attribut", tiltValF: "Wert für gekippt", tiltEntF: "Entität für gekippt", tiltValPh: "z. B. gekippt",
    confirmF: "Sicherheitsabfrage", confirmText: "Text der Abfrage", confirmPh: "Standard: Aufschließen? / Öffnen?",
    tapF: "Antippen", tapAuto: "Schalten (Schloss, Cover, Taster)", tapInfo: "Nur Details zeigen",
    invalid: "Fehler beim Speichern: %s", grid: "Raster", ghost: "Stockwerk darunter zeigen", dims: "Maße zeigen",
    entHint: "Entity-IDs, durch Komma getrennt",
  },
  en: {
    title: "Floorplan Lite", plan: "Floor plan", newPlan: "New floor plan", planName: "Name of the floor plan",
    newSite: "New site (several floor plans as buildings)", siteName: "Name of the site",
    siteSide: "Site: the buildings are other floor plans – drag, turn, scale them. Draw areas outside (yard, garden) here and link them to a Home Assistant area. A card then only needs plan: <this site>; start view, users and buttons are set in the card.",
    partsHint: "Building parts within this floor plan (e.g. barn and garage in one drawing). Several floor plans on one property: „New site“ at the top.",
    save: "Save", ok: "OK", cancel: "Cancel", rename: "Rename", idHint: "Dashboard cards refer to the plan by its id (plan: …). Update them after a change.",
    wallInner: "Inner walls (cm)", wallOuter: "Outer walls (cm)", saved: "Saved", unsaved: "Unsaved changes", undo: "Undo", redo: "Redo",
    del: "Delete", delPlan: "Really delete floor plan “%s”?", importJson: "Import JSON", exportJson: "Export JSON",
    preview: "Preview", fit: "Fit", none: "No floor plan yet – create a new one.",
    leave: "Discard unsaved changes?",
    tools: { select: "Select / edit", room: "Draw room", roomGen: "Generate room (click into an area)", split: "Split room (line from wall to wall)", wall: "Draw inner wall", outline: "Draw outer wall", outdoor: "Area outside (garden, yard, terrace)",
      line: "Helper line (canopy …)", door: "Door", window: "Window", passage: "Passage without door", garage: "Garage door", skylight: "Roof window / dome (anywhere in a room)", openWall: "No wall (open plan)",
      image: "Move background image", scale: "Set scale (two points)", alignWall: "Align to a wall", straighten: "Straighten background (two points)", pan: "Pan (view)" },
    hintDraw: "Click to add points · click the first point or Enter to close · Backspace removes the last · Esc cancels · Shift: free angle",
    hintLine: "Click to add points · Enter or clicking the last point again finishes · Esc cancels",
    hintWall: "Inner wall: click to add points, they snap to wall corners and walls · Enter or clicking the last point again finishes · clicking the first point closes it · Shift: free angle",
    hintRoomGen: "Click into an area enclosed by walls – the room fills it up to the walls",
    hintSplit: "Draw a line across a room: start and end on its edge, points in between for bends · Enter or clicking the last point again splits", noSplit: "The line has to start and end on the edge of a room and cross it",
    noFace: "No closed area here – is a piece of wall missing?", haveRoom: "There is a room here already",
    hintOpening: "Click on a wall to place the opening",
    hintOpenWall: "Click the wall between two rooms – it disappears completely, both stay rooms of their own (open kitchen, living-dining area)",
    hintSelect: "Click an element · drag corners · double-click an edge to add a corner · right-click a corner to remove it · Del deletes the element",
    hintImage: "Drag the image with the mouse", hintScale: "Click two points on the image whose distance you know",
    hintAlign: "Click a wall – the whole plan is turned so that it is horizontal",
    hintStraighten: "Click two points on a wall in the image – only the image turns until that line is exactly horizontal or vertical (for crooked scans or photos of paper plans)",
    copyLevel: "Copy level", copyLevelText: "Copy everything of “%s” (outer walls, rooms, doors, windows, helper lines) to a new level. The copied rooms get ids of their own without entities.",
    scalePrompt: "How many metres are between the two points?",
    levels: "Levels", level: "Level", addLevel: "Add level", levelName: "Name of the level", levelShort: "Short name (e.g. GF)",
    copyOutlines: "Copy the outer walls of the current level?", delLevel: "Delete level “%s” with all its rooms?",
    up: "up", down: "down", buildings: "Building parts", building: "Building part", addBuilding: "Add building part", buildingName: "Name of the building part",
    noBuilding: "– none –", delBuilding: "Remove building “%s”? Its elements stay.",
    background: "Background image", upload: "Upload image or PDF", removeImage: "Remove image", opacity: "Opacity", mode: "Position",
    modes: { under: "under the plan", over: "over the plan", hidden: "hidden" }, rotation: "Rotation (degrees)", width: "Width (m)",
    posX: "Left (m)", posY: "Top (m)", uploading: "Uploading …", rendering: "Converting PDF …", pdfPage: "The PDF has %s pages – which one should be the background?", page: "Page",
    planSettings: "Floor plan", name: "Name", alignLevels: "Align levels to each other", hideLabel: "Ignore entities with these labels (Ctrl/⌘ for several)", north: "North (degrees, 0 = up)",
    northAlign: "Turn so north is up", colors: "Colours", cBackground: "Background", cFloor1: "Floor light", cFloor2: "Floor dark",
    cWall: "Walls", cEdge: "Edges", reset: "reset",
    area: "Area (Home Assistant)", areaNone: "– none –", areaUsed: "already in the plan", fill: "Take entities from the area",
    filled: "%s entities taken over", fillNone: "No matching entities found in the area",
    fillAll: "Fill all rooms that have an area", areaLive: "Entities live from the area (new devices show up by themselves)",
    popup: "Create pop-up YAML", popupAll: "Pop-ups for all rooms", popStyle: "Kind",
    popAuto: "Like area pop-ups: Bubble Card + auto-entities (dynamic by area)", popStatic: "Simple: Bubble Card with fixed tiles",
    copy: "Copy", copied: "Copied", dashboard: "Dashboard", view: "View", insert: "Add to dashboard", close: "Close",
    more: "More", inserted: "%s pop-ups added, %s already there", insertAsk: "Add %s pop-ups to “%d” → “%v”? Existing pop-ups with the same hash stay as they are.",
    strategy: "This dashboard is generated automatically and cannot be edited", noArea: "no area → simple tiles",
    defaultDash: "Overview (default)", areaHint: "Choose the area – name, id and the entities found are taken over.",
    room: "Room", wallEl: "Inner wall", wallWidth: "Thickness (m)", closedF: "closed", roomWalls: "Rooms draw their own walls (without inner walls)", outline: "Outer wall", refF: "The drawn line is", refOut: "outside face (outside size)", refMid: "centre of the wall", refIn: "inside face (inside size)", line: "Helper line", opening: "Opening", id: "ID (pop-up #…)", partOf: "Part of room",
    partNone: "– own room –", ownEntities: "Own entities (key)", outdoorF: "Area outside", small: "small label",
    color: "Colour", noColor: "Default", open: "open (not a closed shape)", type: "Type", widthM: "Width (m)", depth: "Wall thickness (m)",
    flip: "Mirror swing", entities: "Entities", ent: { licht: "Light", hauptlicht: "Main light (fills the room, the others as a seam)", praesenz: "Presence", bewegung: "Motion", temp: "Temperature",
      fenster: "Window", beschattung: "Shade", musik: "Music" },
    types: { door: "Door", window: "Window", passage: "Passage", garage: "Garage door", open: "Open (no wall)", skylight: "Roof window / dome" },
    opEntities: "Entities (contact, cover, lock, gate …)", opEntHint: "Tapping works the lock, cover (gate, electric window) or button – after a question if \"Ask first\" is ticked, otherwise at once. Without anything to switch, the first entity's dialog opens. Tilted windows are recognised (state or attribute tilted/gekippt).",
    lengthM: "Length (m)", angleDeg: "Rotation (degrees)", roundF: "round (dome)",
    shadeF: "Roller shutter / blind in front", lightColour: "Light colour (lights and switches without a colour of their own)",
    lc: { warm: "Warm white", neutral: "Neutral white", cold: "Cold white", amber: "Amber", red: "Red", green: "Green", blue: "Blue", purple: "Purple", own: "own colour →" },
    tiltF: "Detect tilted", tiltAuto: "automatic (tilted/gekippt)", tiltAttr: "from an attribute", tiltEnt: "from an entity of its own",
    tiltAttrF: "Attribute", tiltValF: "Value for tilted", tiltEntF: "Entity for tilted", tiltValPh: "e.g. tilted",
    confirmF: "Ask first", confirmText: "Question", confirmPh: "Default: Unlock? / Open?",
    tapF: "Tap", tapAuto: "Switch (lock, cover, button)", tapInfo: "Only show details",
    invalid: "Saving failed: %s", grid: "Grid", ghost: "Show level below", dims: "Show dimensions",
    entHint: "Entity ids, separated by commas",
  },
};

const ENT_FIELDS = [["licht", ["light", "switch"]], ["hauptlicht", ["light", "switch"]], ["praesenz", "binary_sensor"], ["bewegung", "binary_sensor"], ["temp", null],
  ["fenster", "binary_sensor"], ["beschattung", "cover"], ["musik", "media_player"]];
const SINGLE = ["temp", "hauptlicht"];  // one entity, not a list
const LIGHT_COLOURS = [["", "warm"], ["#fff1e0", "neutral"], ["#e4ecff", "cold"], ["#ffb347", "amber"], ["#ff5a4a", "red"],
  ["#5adc78", "green"], ["#5a8cff", "blue"], ["#b07aff", "purple"]];
const OPENING_TOOLS = ["door", "window", "passage", "garage"];
const POLY_TOOLS = ["room", "outline", "outdoor"];
const SHAPES = ["rooms", "outlines", "walls", "lines"];  // elements with a poly
const PDFJS = "/floorplan_lite_static/vendor/pdfjs/";  // pdf.js, loaded only when a PDF is chosen
const WALLS = { wall_width: 0.2, outer_width: 0.5 };  // wall thickness in metres (style keys), as in the card
const DEFAULT_STYLE = { background: "#131b30", floor: ["#2a3657", "#1c2541"], wall: "#4d5a7d", edge: "#8d9cc4" };
const ICONS = { select: "mdi:cursor-default", room: "mdi:vector-square", roomGen: "mdi:format-color-fill", split: "mdi:content-cut", wall: "mdi:vector-polyline-edit", outline: "mdi:wall", outdoor: "mdi:tree",
  line: "mdi:vector-polyline", door: "mdi:door", window: "mdi:window-closed-variant", passage: "mdi:door-open",
  garage: "mdi:garage", skylight: "mdi:window-shutter-open", openWall: "mdi:arrow-expand-horizontal", image: "mdi:image-move", scale: "mdi:ruler", alignWall: "mdi:format-align-middle", straighten: "mdi:format-rotate-90", pan: "mdi:pan" };

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

const area = (p) => p.reduce((s, q, i) => { const r = p[(i + 1) % p.length]; return s + q[0] * r[1] - r[0] * q[1]; }, 0) / 2;
const grow = (p, d) => {  // move a polygon outwards by d (mitred), as in the card
  const sg = area(p) > 0 ? 1 : -1, n = p.length;
  const off = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1; return [sg * dy / l, -sg * dx / l]; };
  return p.map((q, i) => {
    const a = p[(i - 1 + n) % n], b = p[(i + 1) % n];
    const n1 = off(a, q), n2 = off(q, b), mx = n1[0] + n2[0], my = n1[1] + n2[1];
    const k = d / Math.max(0.2, (mx * n1[0] + my * n1[1]));
    return [R3(q[0] + mx * k), R3(q[1] + my * k)];
  });
};

/* Smallest closed area around p formed by wall centre lines (segments [[a, b], …]). Walls are split where they meet
   or cross (2 cm tolerance), loose ends are pruned, then the faces of the resulting graph are walked. */
function faceAt(segs, p) {
  const T = 0.02, nodes = [], node = (q) => {
    for (let i = 0; i < nodes.length; i++) if (dist(nodes[i], q) < T) return i;
    nodes.push(q); return nodes.length - 1;
  };
  const cuts = segs.map(() => [0, 1]);
  segs.forEach(([a, b], i) => segs.forEach(([c, d], j) => {
    if (j <= i) return;
    const r = sub(b, a), s2 = sub(d, c), den = r[0] * s2[1] - r[1] * s2[0], ac = sub(c, a);
    if (Math.abs(den) > 1e-9) {  // crossing
      const t = (ac[0] * s2[1] - ac[1] * s2[0]) / den, u = (ac[0] * r[1] - ac[1] * r[0]) / den;
      const lr = len(r), ls = len(s2);
      if (t > -T / lr && t < 1 + T / lr && u > -T / ls && u < 1 + T / ls) { cuts[i].push(Math.min(1, Math.max(0, t))); cuts[j].push(Math.min(1, Math.max(0, u))); }
    }
    [[c, i, a, b], [d, i, a, b], [a, j, c, d], [b, j, c, d]].forEach(([q, k, e, f2]) => {  // an end touching the other wall
      const pr = proj(q, e, f2);
      if (dist(q, pr.p) < T) cuts[k].push(pr.t);
    });
  }));
  const adj = {}, link = (u, v) => {
    if (u === v) return;
    (adj[u] = adj[u] || []); (adj[v] = adj[v] || []);
    if (adj[u].indexOf(v) < 0) { adj[u].push(v); adj[v].push(u); }
  };
  segs.forEach(([a, b], i) => {
    const ts = cuts[i].sort((x, y) => x - y);
    let prev = null;
    ts.forEach((t) => { const n = node([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); if (prev !== null) link(prev, n); prev = n; });
  });
  let pruned = true;  // loose ends (a wall that stops in the room) do not bound an area
  while (pruned) {
    pruned = false;
    Object.keys(adj).forEach((u) => {
      if (adj[u].length === 1) { const v = adj[u][0]; adj[v] = adj[v].filter((x) => x !== +u); delete adj[u]; pruned = true; }
      else if (!adj[u].length) delete adj[u];
    });
  }
  const ang = (u, v) => Math.atan2(nodes[v][1] - nodes[u][1], nodes[v][0] - nodes[u][0]);
  Object.keys(adj).forEach((u) => adj[u].sort((v, w) => ang(+u, v) - ang(+u, w)));
  const seen = {};
  let best = null;
  Object.keys(adj).forEach((u0) => adj[u0].forEach((v0) => {
    let u = +u0, v = v0;
    const face = [];
    for (let guard = 0; guard < 2000 && !seen[u + ">" + v]; guard++) {
      seen[u + ">" + v] = 1; face.push(nodes[u]);
      const list = adj[v], k = list.indexOf(u), w = list[(k - 1 + list.length) % list.length];  // next edge clockwise
      u = v; v = w;
    }
    if (face.length < 3) return;
    const A = Math.abs(area(face));
    if (A > 0.05 && inside(p, face) && (!best || A < best.A)) best = { A, face };
  }));
  if (!best) return null;
  const f = best.face.filter((q, i, arr) => {  // drop points on a straight line
    const a = arr[(i - 1 + arr.length) % arr.length], b = arr[(i + 1) % arr.length], r = sub(b, a);
    return Math.abs((q[0] - a[0]) * r[1] - (q[1] - a[1]) * r[0]) / (len(r) || 1) > 0.005;
  });
  return f.map((q) => [R3(q[0]), R3(q[1])]);
}

/* Small YAML writer for the generated cards (maps, lists, strings, numbers, booleans). */
function toYaml(v, ind) {
  ind = ind || "";
  const scalar = (x) => {
    if (typeof x === "number" || typeof x === "boolean") return String(x);
    const str = String(x);
    return /^[\w./-][\w ./+-]*$/.test(str) && !/^(true|false|yes|no|on|off|null|~|\d[\d.]*)$/i.test(str) && !/\s$/.test(str) ? str : JSON.stringify(str);
  };
  if (Array.isArray(v)) {
    if (!v.length) return "[]";
    return v.map((x) => {
      if (x && typeof x === "object" && !Array.isArray(x) && Object.keys(x).length) {
        const inner = toYaml(x, ind + "  ");
        return ind + "- " + inner.slice(ind.length + 2);
      }
      return ind + "- " + (x && typeof x === "object" ? toYaml(x, ind + "  ").trim() : scalar(x));
    }).join("\n");
  }
  if (v && typeof v === "object") {
    const keys = Object.keys(v);
    if (!keys.length) return "{}";
    return keys.map((k) => {
      const x = v[k];
      if (x && typeof x === "object" && (Array.isArray(x) ? x.length : Object.keys(x).length)) return ind + k + ":\n" + toYaml(x, ind + "  ");
      return ind + k + ": " + (x && typeof x === "object" ? (Array.isArray(x) ? "[]" : "{}") : scalar(x));
    }).join("\n");
  }
  return ind + scalar(v);
}

/* Cut a polygon along a path whose ends lie on its edges → two polygons, or null. */
function splitPoly(poly, path) {
  const n = poly.length, onEdge = (q) => {
    let best = null;
    poly.forEach((a, j) => { const pr = proj(q, a, poly[(j + 1) % n]), d = dist(q, pr.p); if (d < 0.03 && (!best || d < best.d)) best = { d, j, t: pr.t }; });
    return best;
  };
  const a = path[0], b = path[path.length - 1], ea = onEdge(a), eb = onEdge(b);
  if (!ea || !eb || (ea.j === eb.j && Math.abs(ea.t - eb.t) < 1e-6)) return null;
  const mid = path.slice(1, -1);
  const walk = (from, to) => {  // corners after edge `from` up to and including the start of edge `to`
    const out = [];
    let j = from.j;
    if (from.j === to.j && to.t > from.t) return out;
    do { j = (j + 1) % n; out.push(poly[j]); } while (j !== to.j);
    return out;
  };
  const p1 = [a].concat(walk(ea, eb), [b], mid.slice().reverse());
  const p2 = [b].concat(walk(eb, ea), [a], mid);
  if (p1.length < 3 || p2.length < 3 || Math.abs(area(p1)) < 0.05 || Math.abs(area(p2)) < 0.05) return null;
  return [p1, p2];
}

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

  /* ---------- Dialog (prompt() and confirm() are blocked in the companion app) ---------- */
  _dialog(text, fields, hint) {  // resolves to the field values (or [] without fields), null on cancel
    return new Promise((resolve) => {
      const t = this.t, box = document.createElement("div");
      const val = (v) => (v === undefined || v === null ? "" : v);
      box.className = "dlg";
      box.innerHTML = `<form><p>${esc(text)}</p>` + (fields || []).map((f, i) => `<label><span>${esc(f.label || "")}</span>` +
        (f.type === "textarea" ? `<textarea data-i="${i}" rows="8">${esc(val(f.value))}</textarea>`
          : `<input type="${f.type || "text"}" step="any" data-i="${i}" value="${esc(val(f.value))}">`) + `</label>`).join("") +
        (hint ? `<p class="dhint">${esc(hint)}</p>` : "") +
        `<div class="btns"><button type="button" class="cancel">${esc(t.cancel)}</button><button type="submit" class="primary">${esc(t.ok)}</button></div></form>`;
      const done = (v) => { box.remove(); resolve(v); };
      const form = box.querySelector("form");
      form.addEventListener("submit", (e) => { e.preventDefault(); done(Array.prototype.map.call(form.querySelectorAll("[data-i]"), (x) => x.value.trim())); });
      form.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); done(null); } });
      box.querySelector(".cancel").addEventListener("click", () => done(null));
      box.addEventListener("pointerdown", (e) => { if (e.target === box) done(null); });
      this.shadowRoot.querySelector(".app").appendChild(box);
      const first = form.querySelector("[data-i]") || form.querySelector(".primary");
      first.focus(); if (first.select) first.select();
    });
  }

  /* ---------- Plans ---------- */
  async _loadList(selectId) {
    this._plans = await this._hass.callWS({ type: "floorplan_lite/list" });
    const id = selectId || (this._plan && this._plan.id) || (this._plans[0] && this._plans[0].id);
    if (id) await this._open(id, true); else { this._plan = null; this._renderAll(); }
  }

  async _open(id, force) {
    if (!force && this._dirty && !(await this._dialog(this.t.leave))) return this._renderAll();
    const plan = await this._hass.callWS({ type: "floorplan_lite/get", plan_id: id });
    this._setPlan(plan);
    this._storedId = plan.id;
  }

  _setPlan(plan) {
    plan.levels = plan.levels || []; plan.rooms = plan.rooms || []; plan.outlines = plan.outlines || [];
    plan.lines = plan.lines || []; plan.walls = plan.walls || []; plan.openings = plan.openings || []; plan.buildings = plan.buildings || [];
    plan.entities = plan.entities || {}; plan.style = plan.style || {};
    this._plan = plan;
    this._level = (plan.levels[0] && plan.levels[0].id) || null;
    this._building = (plan.buildings[0] && plan.buildings[0].id) || "";
    this._sel = null; this._draft = null; this._undo = []; this._redo = []; this._dirty = false;
    this._vb = null;
    this._renderAll();
    this._fit();
  }

  async _newPlan() {
    if (this._dirty && !(await this._dialog(this.t.leave))) return;
    const r = await this._dialog(this.t.newPlan, [{ label: this.t.planName, value: "" }]);
    const name = r && r[0];
    if (!name) return;
    let id = slug(name), n = 2;
    while ((this._plans || []).some((p) => p.id === id)) id = slug(name) + "_" + n++;
    const de = this.t === T.de;
    this._setPlan({ id, name, rotation: 0, north: 0, align_levels: true, style: {},
      buildings: [{ id: de ? "haus" : "house", name: de ? "Haus" : "House" }],
      levels: [{ id: de ? "eg" : "gf", name: de ? "Erdgeschoss" : "Ground floor", short: de ? "EG" : "GF" }],
      outlines: [], walls: [], lines: [], rooms: [], openings: [], entities: {}, room_walls: false });
    this._storedId = null;
    this._dirty = true;
    this._renderAll();
  }

  async _newSite() {  // a property: other plans become its buildings, side by side until placed
    if (this._dirty && !(await this._dialog(this.t.leave))) return;
    const r = await this._dialog(this.t.newSite, [{ label: this.t.siteName, value: "" }]);
    const name = r && r[0];
    if (!name) return;
    let id = slug(name), n = 2;
    while ((this._plans || []).some((p) => p.id === id)) id = slug(name) + "_" + n++;
    const blds = [];
    for (const p of this._plans || []) {
      let full = null;
      try { full = await this._hass.callWS({ type: "floorplan_lite/get", plan_id: p.id }); } catch (e) { full = null; }
      if (full && !full.site) blds.push({ plan: p.id, name: p.name });
    }
    this._setPlan({ id, name, site: { buildings: blds, areas: [] }, levels: [], style: {}, buildings: [],
      outlines: [], walls: [], lines: [], rooms: [], openings: [], entities: {}, room_walls: false });
    this._storedId = null;
    this._dirty = true;
    this._renderAll();
  }

  _renderSiteEditor() {  // a property: its own editor instead of the drawing tools
    const R = this.shadowRoot, box = R.querySelector(".siteed"), site = !!(this._plan && this._plan.site);
    ["canvas", "zoom", "hint", "levels"].forEach((c) => { const el = R.querySelector("." + c); if (el) el.style.display = site ? "none" : ""; });
    box.hidden = !site;
    if (!site) return false;
    if (!customElements.get("floorplan-lite-site-editor")) { box.textContent = "floorplan-lite-site-editor?"; return true; }
    if (!this._siteEd) {
      this._siteEd = document.createElement("floorplan-lite-site-editor");
      this._siteEd.addEventListener("site-changed", (e) => {
        this._undo.push(JSON.stringify(this._plan));
        this._redo = [];
        this._plan.site = e.detail.site;
        this._dirty = true;
        this._renderHeader();
        this._renderPreview();
      });
      box.appendChild(this._siteEd);
    }
    this._siteEd.hass = this._hass;
    this._siteEd.siteId = this._plan.id;
    this._siteEd.plans = this._plans || [];
    this._siteEd.site = this._plan.site;
    return true;
  }

  async _save() {
    if (!this._plan) return;
    try {
      const plan = await this._hass.callWS({ type: "floorplan_lite/save", plan: this._clean(this._plan) });
      if (this._storedId && this._storedId !== plan.id) {  // renamed id: the old entry goes
        await this._hass.callWS({ type: "floorplan_lite/delete", plan_id: this._storedId });
      }
      this._storedId = plan.id;
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
    if (!this._plan || !(await this._dialog(this.t.delPlan.replace("%s", this._plan.name)))) return;
    if (this._storedId) await this._hass.callWS({ type: "floorplan_lite/delete", plan_id: this._storedId });
    this._storedId = null;
    this._plan = null; this._dirty = false;
    await this._loadList();
  }

  async _rename() {
    const t = this.t, p = this._plan;
    const r = await this._dialog(t.rename, [{ label: t.name, value: p.name }, { label: "ID", value: p.id }], t.idHint);
    if (!r || !r[0]) return;
    const id = slug(r[1] || r[0]);
    if (id !== this._storedId && (this._plans || []).some((x) => x.id === id)) return this._status(t.invalid.replace("%s", "ID " + id), true);
    this._change(() => { p.name = r[0]; p.id = id; });
  }

  async _import() {
    const r = await this._dialog(this.t.importJson, [{ type: "textarea", value: "" }]);
    const text = r && r[0];
    if (!text) return;
    try {
      const plan = JSON.parse(text), keep = this._storedId === plan.id ? plan.id : null;
      this._setPlan(plan); this._storedId = keep; this._dirty = true; this._renderAll();
    }
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
          <button data-a="rename" class="icon"><ha-icon icon="mdi:pencil"></ha-icon></button>
          <button data-a="new" class="icon" title=""><ha-icon icon="mdi:plus"></ha-icon></button>
          <button data-a="newsite" class="icon" title=""><ha-icon icon="mdi:home-group"></ha-icon></button>
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
            <div class="siteed" hidden></div>
          </div>
          <aside class="side"></aside>
        </div>
        <input type="file" class="file" accept="image/*,application/pdf,.pdf" hidden>
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
    if (a === "newsite") return this._newSite();
    if (!this._plan) return;
    if (a === "save") return this._save();
    if (a === "rename") return this._rename();
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
    if (this._renderSiteEditor()) {
      this.shadowRoot.querySelector(".tools").innerHTML = "";
      this.shadowRoot.querySelector(".side").innerHTML = `<p class="small">${esc(this.t.siteSide)}</p>`;
      this._renderPreview();
      return;
    }
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
    const titles = { newsite: t.newSite, rename: t.rename, new: t.newPlan, undo: t.undo, redo: t.redo, preview: t.preview, import: t.importJson, export: t.exportJson, delete: t.del };
    R.querySelectorAll("header button").forEach((b) => {
      const a = b.getAttribute("data-a");
      if (titles[a]) b.title = titles[a];
      if (a !== "new" && a !== "newsite") b.disabled = !this._plan;
    });
    R.querySelector('[data-a="save"]').textContent = t.save;
    R.querySelector('[data-a="undo"]').disabled = !this._undo.length;
    R.querySelector('[data-a="redo"]').disabled = !this._redo.length;
    const st = R.querySelector(".status");
    if (!st.classList.contains("err")) st.textContent = this._dirty ? t.unsaved : "";
  }

  _renderTools() {
    const t = this.t, nav = this.shadowRoot.querySelector(".tools");
    const groups = [["select", "pan"], ["outline", "wall", "roomGen", "room", "split", "outdoor", "line"], OPENING_TOOLS.concat(["skylight", "openWall"]), ["image", "scale", "straighten", "alignWall"]];
    nav.innerHTML = groups.map((g) => `<div class="grp">${g.map((k) =>
      `<button class="tool${this._tool === k ? " on" : ""}" data-t="${k}" title="${esc(t.tools[k])}"${!this._plan ? " disabled" : ""}><ha-icon icon="${ICONS[k]}"></ha-icon></button>`).join("")}</div>`).join("");
    nav.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => this._setTool(b.getAttribute("data-t"))));
    const hint = { select: t.hintSelect, wall: t.hintWall, roomGen: t.hintRoomGen, split: t.hintSplit, room: t.hintDraw, outline: t.hintDraw, outdoor: t.hintDraw, line: t.hintLine,
      image: t.hintImage, openWall: t.hintOpenWall, scale: t.hintScale, straighten: t.hintStraighten, alignWall: t.hintAlign, pan: "" };
    this.shadowRoot.querySelector(".hint").textContent = this._plan ? (hint[this._tool] !== undefined ? hint[this._tool] : t.hintOpening) : t.none;
  }

  _setTool(k) {
    this._tool = k; this._draft = null; this._scaleA = null; this._guides = []; this._right = null; this._snapMark = null;
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

  async _addLevel() {
    const t = this.t;
    const r = await this._dialog(t.addLevel, [{ label: t.levelName }, { label: t.levelShort }]);
    const name = r && r[0];
    if (!name) return;
    const short = r[1] || name.slice(0, 2).toUpperCase();
    let id = slug(short || name), n = 2;
    while (this._plan.levels.some((l) => l.id === id)) id = slug(short || name) + "_" + n++;
    const copy = this._level && this._plan.outlines.some((o) => o.level === this._level) && !!(await this._dialog(t.copyOutlines));
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
    let h = `<section><h3>${esc({ rooms: el.outdoor ? t.tools.outdoor : t.room, outlines: t.outline, walls: t.wallEl, lines: t.line, openings: t.opening }[s.kind])}` +
      `<button class="mini danger" data-act="delsel">${esc(t.del)}</button></h3>`;
    if (s.kind === "rooms") {
      const areas = this._areas(), used = {};
      this._plan.rooms.forEach((r) => { if (r.area) used[r.area] = 1; });
      h += this._field(t.area, `<select data-area="1"><option value="">${esc(t.areaNone)}</option>` +
        areas.map((a) => `<option value="${esc(a.id)}"${el.area === a.id ? " selected" : ""}>${esc(a.name)}${used[a.id] && el.area !== a.id ? " (" + esc(t.areaUsed) + ")" : ""}</option>`).join("") + `</select>`) +
        (el.area ? this._field(t.areaLive, this._chk("area_live", el.area_live)) + `<div class="row"><button class="mini" data-act="fill">${esc(t.fill)}</button></div>`
          : `<p class="small">${esc(t.areaHint)}</p>`) +
        (el.name !== null ? `<div class="row"><button class="mini" data-act="popup">${esc(t.popup)}</button></div>` : "");
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
      h += this._field(t.refF, `<select data-k="ref">${[["outside", t.refOut], ["center", t.refMid], ["inside", t.refIn]]
        .map(([v, l]) => `<option value="${v}"${(el.ref || "center") === v ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`) +
        this._field(t.building, this._buildingSel("building", el.building));
    } else if (s.kind === "walls") {
      h += this._field(t.wallWidth, this._num("width", el.width || this._wall("wall_width"), 0.01)) + this._field(t.closedF, this._chk("closed", el.closed));
    } else if (s.kind === "lines") {
      h += this._field(t.open, this._chk("open", el.open));
    } else if (s.kind === "openings") {
      const sky = el.type === "skylight", ents = (el.entities || []).concat(el.entity && (el.entities || []).indexOf(el.entity) < 0 ? [el.entity] : []);
      h += this._field(t.type, `<select data-k="type">${(sky ? ["skylight"] : OPENING_TOOLS.concat(["open"])).map((k) => `<option value="${k}"${el.type === k ? " selected" : ""}>${esc(t.types[k])}</option>`).join("")}</select>`) +
        this._field(t.widthM, this._num("width", el.width, 0.05)) + this._field(sky ? t.lengthM : t.depth, this._num("depth", el.depth, 0.02)) +
        (sky ? this._field(t.angleDeg, this._num("angle", el.angle || 0, 1)) + this._field(t.roundF, this._chk("round", el.round)) : "") +
        (el.type === "door" ? this._field(t.flip, this._chk("flip", el.flip)) : "") +
        (el.type === "passage" || el.type === "open" ? "" :
          this._field(t.opEntities, `<input type="text" list="fl-ents-op" data-oent="1" value="${esc(ents.join(", "))}" placeholder="${esc(t.entHint)}">`) +
          (el.type === "window" || sky ? this._tiltHtml(el, s.i, ents) : "") +
          (el.type === "garage" ? "" : this._field(t.shadeF, `<input type="text" list="fl-ents-shade" data-k="shade" value="${esc(el.shade || "")}" placeholder="cover.…">`) +
            `<datalist id="fl-ents-shade">${this._entityOptions(["cover"])}</datalist>`) +
          this._field(t.tapF, `<select data-otap="1"><option value="auto">${esc(t.tapAuto)}</option><option value="info"${el.tap === "info" ? " selected" : ""}>${esc(t.tapInfo)}</option></select>`) +
          this._field(t.confirmF, `<input type="checkbox" data-oconf="1"${(el.confirm !== undefined ? el.confirm : el.type === "door" || el.type === "garage") ? " checked" : ""}>`) +
          this._field(t.confirmText, `<input type="text" data-k="confirm_text" value="${esc(el.confirm_text || "")}" placeholder="${esc(t.confirmPh)}">`) +
          `<p class="small">${esc(t.opEntHint)}</p><datalist id="fl-ents-op">${this._entityOptions(["binary_sensor", "cover", "lock", "button", "switch"])}</datalist>`);
    }
    return h + `</section>`;
  }

  _tiltHtml(el, i, ents) {  // where "tilted" comes from: automatic, an attribute of the contact, or an entity of its own
    const t = this.t, ui = this._tiltUi || (this._tiltUi = {});
    const mode = el.tilt_entity ? "entity" : el.tilt_attribute ? "attribute" : ui[i] || "auto";
    const st = (this._hass && this._hass.states) || {}, attrs = {};
    ents.forEach((id) => { if (st[id]) Object.keys(st[id].attributes || {}).forEach((k) => { attrs[k] = 1; }); });
    if (el.tilt_entity && st[el.tilt_entity]) Object.keys(st[el.tilt_entity].attributes || {}).forEach((k) => { attrs[k] = 1; });
    let h = this._field(t.tiltF, `<select data-tilt="${i}">` + [["auto", t.tiltAuto], ["attribute", t.tiltAttr], ["entity", t.tiltEnt]]
      .map(([v, l]) => `<option value="${v}"${mode === v ? " selected" : ""}>${esc(l)}</option>`).join("") + `</select>`);
    if (mode === "entity") h += this._field(t.tiltEntF, `<input type="text" list="fl-ents-tilt" data-k="tilt_entity" value="${esc(el.tilt_entity || "")}">`) +
      `<datalist id="fl-ents-tilt">${this._entityOptions(["binary_sensor", "sensor", "select", "input_select"])}</datalist>`;
    if (mode === "attribute") h += this._field(t.tiltAttrF, `<input type="text" list="fl-attrs" data-k="tilt_attribute" value="${esc(el.tilt_attribute || "")}">`) +
      `<datalist id="fl-attrs">${Object.keys(attrs).sort().map((k) => `<option value="${esc(k)}">`).join("")}</datalist>`;
    if (mode !== "auto") h += this._field(t.tiltValF, `<input type="text" data-k="tilt_value" value="${esc(el.tilt_value || "")}" placeholder="${esc(t.tiltValPh)}">`);
    return h;
  }

  _entitiesHtml(key) {
    const t = this.t, e = this._plan.entities[key] || {};
    return `<h4>${esc(t.entities)} <code>${esc(key)}</code></h4>` + ENT_FIELDS.map(([f]) => {
      const v = e[f];
      const val = Array.isArray(v) ? v.join(", ") : (v || "");
      return this._field(t.ent[f], `<input type="text" list="fl-ents-${f}" data-ent="${f}" data-key="${esc(key)}" value="${esc(val)}" placeholder="${esc(t.entHint)}">`);
    }).join("") + ENT_FIELDS.map(([f, dom]) => `<datalist id="fl-ents-${f}">${this._entityOptions(f === "temp" ? ["climate", "sensor"] : [].concat(dom))}</datalist>`).join("") +
      this._lightColourHtml(key, e.lichtfarbe);
  }

  /* Colour of the room's lights and switches that report none (a switched circuit, a dimmer): warm white by default */
  _lightColourHtml(key, cur) {
    const t = this.t, preset = LIGHT_COLOURS.some((c) => c[0] === (cur || ""));
    return this._field(t.lightColour, `<div class="row"><select data-lfarbe="${esc(key)}">` +
      LIGHT_COLOURS.map(([v, n]) => `<option value="${v}"${(cur || "") === v ? " selected" : ""}>${esc(t.lc[n])}</option>`).join("") +
      `<option value="own"${preset ? "" : " selected"}>${esc(t.lc.own)}</option></select>` +
      `<input type="color" data-lfarbe-c="${esc(key)}" value="${esc(cur || "#ffd098")}"></div>`);
  }

  _labelOptions(cur) {
    const ids = {};
    const reg = (this._hass && this._hass.entities) || {};
    Object.keys(reg).forEach((id) => (reg[id].labels || []).forEach((l) => { ids[l] = 1; }));
    cur.forEach((l) => { ids[l] = 1; });
    return Object.keys(ids).sort().map((l) => `<option value="${esc(l)}"${cur.indexOf(l) >= 0 ? " selected" : ""}>${esc(l)}</option>`).join("");
  }

  _hideLabels() { const p = this._plan || {}; return (p.hide_labels || []).concat(p.hide_label ? [p.hide_label] : []); }
  _isHidden(id, reg) {
    const ls = this._hideLabels(), e = reg && reg[id];
    return !!(ls.length && e && (e.labels || []).some((l) => ls.indexOf(l) >= 0));
  }

  _entityOptions(domains) {
    const st = (this._hass && this._hass.states) || {}, reg = (this._hass && this._hass.entities) || {};
    return Object.keys(st).filter((id) => domains.indexOf(id.split(".")[0]) >= 0)
      .filter((id) => !this._isHidden(id, reg)).sort()
      .map((id) => `<option value="${esc(id)}">${esc((st[id].attributes && st[id].attributes.friendly_name) || "")}</option>`).join("");
  }

  _levelHtml() {
    const t = this.t, lv = this._lv();
    if (!lv) return "";
    const b = lv.background || null;
    let h = `<section><h3>${esc(t.level)}: ${esc(lv.name)}</h3><div class="row">` +
      `<button class="mini" data-act="lvup" title="${esc(t.up)}">▲</button><button class="mini" data-act="lvdown" title="${esc(t.down)}">▼</button>` +
      `<button class="mini" data-act="lvcopy">${esc(t.copyLevel)}</button><button class="mini danger" data-act="lvdel">${esc(t.del)}</button></div>` +
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
      this._field(t.hideLabel, `<select multiple size="5" data-hidel="1">${this._labelOptions(this._hideLabels())}</select>`) +
      this._field(t.north, `<span class="crow"><input type="number" step="1" data-p="north" value="${R3(p.north || 0)}"><button class="mini" data-act="northup">${esc(t.northAlign)}</button></span>`) +
      `<h4>${esc(t.buildings)}</h4><p class="small">${esc(t.partsHint)}</p>` +
      p.buildings.map((b, i) => `<div class="row"><input type="text" data-b="${i}" value="${esc(b.name)}"><button class="mini danger" data-act="bdel" data-i="${i}">✕</button></div>`).join("") +
      `<div class="row"><button class="mini" data-act="badd">${esc(t.addBuilding)}</button>` +
      `<label class="cur">${esc(t.building)}: ${this._buildingSel("__cur", this._building)}</label></div>` +
      `<div class="row"><button class="mini" data-act="fillall">${esc(t.fillAll)}</button><button class="mini" data-act="popupall">${esc(t.popupAll)}</button></div>` +
      this._field(t.roomWalls, `<input type="checkbox" data-p="room_walls"${p.room_walls !== false ? " checked" : ""}>`) +
      this._field(t.wallInner, `<input type="number" min="5" max="150" step="1" data-wall="wall_width" value="${Math.round(this._wall("wall_width") * 100)}">`) +
      this._field(t.wallOuter, `<input type="number" min="5" max="150" step="1" data-wall="outer_width" value="${Math.round(this._wall("outer_width") * 100)}">`) +
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
    const setColour = (key, v) => this._change(() => {
      const e = this._plan.entities[key] || (this._plan.entities[key] = {});
      if (v) e.lichtfarbe = v; else delete e.lichtfarbe;
    });
    side.querySelectorAll("[data-lfarbe]").forEach((inp) => inp.addEventListener("change", () => {
      const key = inp.getAttribute("data-lfarbe"), c = side.querySelector(`[data-lfarbe-c="${key}"]`);
      setColour(key, inp.value === "own" ? (c ? c.value : "") : inp.value);
    }));
    side.querySelectorAll("[data-lfarbe-c]").forEach((inp) => inp.addEventListener("change", () => setColour(inp.getAttribute("data-lfarbe-c"), inp.value)));
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
      this._change(() => { this._plan[k] = k === "id" ? slug(v) : v; });
    }));
    side.querySelectorAll("[data-area]").forEach((inp) => inp.addEventListener("change", () => {
      if (!el) return;
      const a = this._areas().find((x) => x.id === inp.value);
      let n = 0;
      this._change(() => {
        if (!a) { delete el.area; return; }
        el.area = a.id;
        if (!el.name || /^(Raum|Room|Garten|Garden) \d+$/.test(el.name)) el.name = a.name;  // a default name gives way
        if (/^(raum|room|garten|garden)_\d+(_\d+)?$/.test(el.id)) {
          const nid = slug(a.id);
          if (!this._plan.rooms.some((r) => r !== el && r.id === nid)) this._setProp(el, "id", nid);
        }
        const key = el.key || el.id, e = this._plan.entities[key];
        if (!e || !Object.keys(e).some((k) => (Array.isArray(e[k]) ? e[k].length : e[k]))) n = this._fill(key, a.id);
      });
      if (n) this._status(this.t.filled.replace("%s", n));
    }));
    side.querySelectorAll("[data-tilt]").forEach((inp) => inp.addEventListener("change", () => {
      if (!el) return;
      (this._tiltUi || (this._tiltUi = {}))[inp.getAttribute("data-tilt")] = inp.value;
      this._change(() => {
        if (inp.value !== "entity") delete el.tilt_entity;
        if (inp.value !== "attribute") delete el.tilt_attribute;
        if (inp.value === "auto") delete el.tilt_value;
      });
    }));
    side.querySelectorAll("[data-hidel]").forEach((inp) => inp.addEventListener("change", () => {
      const v = Array.prototype.filter.call(inp.options, (o) => o.selected).map((o) => o.value);
      this._change(() => { delete this._plan.hide_label; if (v.length) this._plan.hide_labels = v; else delete this._plan.hide_labels; });
    }));
    side.querySelectorAll("[data-oconf]").forEach((inp) => inp.addEventListener("change", () => {
      if (el) this._change(() => { el.confirm = inp.checked; });  // stored either way: the default differs by type
    }));
    side.querySelectorAll("[data-otap]").forEach((inp) => inp.addEventListener("change", () => {
      if (el) this._change(() => { if (inp.value === "info") el.tap = "info"; else delete el.tap; });
    }));
    side.querySelectorAll("[data-oent]").forEach((inp) => inp.addEventListener("change", () => {
      const list = inp.value.split(",").map((x) => x.trim()).filter(Boolean);
      if (!el) return;
      this._change(() => { delete el.entity; if (list.length) el.entities = list; else delete el.entities; });
    }));
    side.querySelectorAll("[data-wall]").forEach((inp) => inp.addEventListener("change", () => {
      const k = inp.getAttribute("data-wall"), v = Math.min(1.5, Math.max(0.05, (parseFloat(inp.value) || 0) / 100));
      const old = this._wall(k), p = this._plan;
      this._change(() => {
        p.style = p.style || {};
        if (Math.abs(v - WALLS[k]) < 0.001) delete p.style[k]; else p.style[k] = R3(v);
        // openings cut through these walls get the new depth
        p.openings.forEach((o) => { if (Math.abs((o.depth || 0.24) - (old + 0.04)) < 0.006) o.depth = R3(v + 0.04); });
      });
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

  async _act(a, btn) {
    const t = this.t, p = this._plan;
    if (a === "delsel") return this._deleteSel();
    if (a === "popup" || a === "popupall") {
      const seen = {}, rooms = (a === "popup" ? [p[this._sel.kind][this._sel.i]] : p.rooms).filter((r) => {
        if (!r || r.name === null || r.outdoor && !r.area || seen[r.id]) return false;
        seen[r.id] = 1; return true;
      });
      return this._popupDialog(rooms);
    }
    if (a === "fill" || a === "fillall") {
      let n = 0;
      const rooms = a === "fill" ? [this._plan[this._sel.kind][this._sel.i]] : p.rooms.filter((r) => r.area && r.name !== null);
      this._change(() => { rooms.forEach((r) => { if (r && r.area) n += this._fill(r.key || r.id, r.area); }); });
      return this._status(n ? t.filled.replace("%s", n) : t.fillNone, !n);
    }
    if (a === "upload") return this.shadowRoot.querySelector(".file").click();
    if (a === "rmimg") return this._change(() => { delete this._lv().background; });
    if (a === "lvdel") {
      const lv = this._lv();
      if (!lv || p.levels.length < 2 || !(await this._dialog(t.delLevel.replace("%s", lv.name)))) return;
      return this._change(() => {
        p.levels = p.levels.filter((l) => l.id !== lv.id);
        SHAPES.concat(["openings"]).forEach((k) => { p[k] = p[k].filter((x) => x.level !== lv.id); });
        this._level = p.levels[0].id; this._sel = null;
      });
    }
    if (a === "lvcopy") {
      const lv = this._lv();
      if (!lv) return;
      const r = await this._dialog(t.copyLevelText.replace("%s", lv.name), [{ label: t.levelName, value: lv.name }, { label: t.levelShort, value: "" }]);
      const name = r && r[0];
      if (!name) return;
      const short = r[1] || name.slice(0, 2).toUpperCase();
      let id = slug(short || name), n = 2;
      while (p.levels.some((l) => l.id === id)) id = slug(short || name) + "_" + n++;
      const ids = {};
      p.rooms.forEach((x) => { ids[x.id] = 1; });
      const rid = (old) => { let x = (old + "_" + id).slice(0, 64), k = 2; while (ids[x]) x = (old + "_" + id + "_" + k++).slice(0, 64); ids[x] = 1; return x; };
      return this._change(() => {
        const copy = { id, name, short };
        if (lv.view) copy.view = lv.view.slice();
        p.levels.splice(p.levels.indexOf(lv) + 1, 0, copy);
        const map = {};  // old room id → new one, so parts of a room (name: null) stay together
        ["outlines", "walls", "lines", "openings", "rooms"].forEach((k) => p[k].filter((x) => x.level === lv.id).forEach((x) => {
          const c = Object.assign(clone(x), { level: id });
          if (k === "rooms") { c.id = map[x.id] || (map[x.id] = rid(x.id)); delete c.key; }
          p[k].push(c);
        }));
        this._level = id; this._sel = null;
      });
    }
    if (a === "lvup" || a === "lvdown") {
      const i = p.levels.findIndex((l) => l.id === this._level), j = a === "lvup" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= p.levels.length) return;
      return this._change(() => { const x = p.levels[i]; p.levels[i] = p.levels[j]; p.levels[j] = x; });
    }
    if (a === "badd") {
      const r = await this._dialog(t.addBuilding, [{ label: t.buildingName }]);
      const name = r && r[0];
      if (!name) return;
      let id = slug(name), n = 2;
      while (p.buildings.some((b) => b.id === id)) id = slug(name) + "_" + n++;
      return this._change(() => { p.buildings.push({ id, name }); this._building = id; });
    }
    if (a === "bdel") {
      const b = p.buildings[+btn.getAttribute("data-i")];
      if (!b || !(await this._dialog(t.delBuilding.replace("%s", b.name)))) return;
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
  async _pdfToImage(file) {  // first (or chosen) page of a PDF as a PNG, about 4000 px on the long side
    this._status(this.t.rendering);
    const pdfjs = await import(PDFJS + "pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.mjs";
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    let n = 1;
    if (doc.numPages > 1) {
      const r = await this._dialog(this.t.pdfPage.replace("%s", doc.numPages), [{ label: this.t.page, type: "number", value: "1" }]);
      if (!r) return null;
      n = Math.min(doc.numPages, Math.max(1, parseInt(r[0], 10) || 1));
    }
    const page = await doc.getPage(n), v1 = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: Math.min(6, 4000 / Math.max(v1.width, v1.height)) });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vp.width); canvas.height = Math.round(vp.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, canvas, viewport: vp }).promise;
    doc.destroy();
    let blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    let type = "image/png";
    if (blob.size > 8e6) { blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.88)); type = "image/jpeg"; }
    return new File([blob], file.name.replace(/\.pdf$/i, "") + (type === "image/png" ? ".png" : ".jpg"), { type });
  }

  async _upload(file) {
    if (!file) return;
    try {
      if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) file = await this._pdfToImage(file);
      if (!file) { this.shadowRoot.querySelector(".file").value = ""; return this._renderHeader(); }
      this._status(this.t.uploading);
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
      SHAPES.forEach((k) => p[k].forEach((x) => x.poly.forEach((q) => all.push(q))));
      const b = all.length ? bbox(all) : [0, 0, 0, 0];
      c = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
    }
    SHAPES.forEach((k) => p[k].forEach((x) => {
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
    if (this._plan && this._plan.site) return;
    if (!this._plan) return;
    const all = [];
    SHAPES.forEach((k) => this._of(k).forEach((e) => e.x.poly.forEach((q) => all.push(q))));
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

  _wall(k) {  // thickness of the inner (wall_width) or outer (outer_width) walls in metres
    const v = this._plan && this._plan.style && this._plan.style[k];
    return typeof v === "number" && v > 0 ? v : WALLS[k];
  }

  _renderCanvas() {
    if (this._plan && this._plan.site) return;
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
        ["outlines", "rooms", "walls"].forEach((k) => p[k].filter((x) => x.level === below).forEach((x) =>
          { h += `<poly${k === "walls" && !x.closed ? "line" : "gon"} class="ghost" points="${pts(x.poly)}" stroke-width="${2 * px}"/>`; }));
      }
    }
    const S = this._sel, rw = p.room_walls !== false;
    this._of("rooms").forEach(({ x, i }) => {
      const sel = S && S.kind === "rooms" && S.i === i;
      h += `<polygon class="room${x.outdoor ? " out" : ""}${sel ? " sel" : ""}" data-k="rooms" data-i="${i}" points="${pts(x.poly)}" ` +
        `fill="${x.color ? esc(x.color) : x.outdoor ? "rgba(90,160,110,.28)" : "url(#fl)"}" stroke="${esc(rw ? st.wall : st.edge)}" stroke-width="${x.outdoor || !rw ? 2 * px : this._wall("wall_width")}"${rw ? "" : ` stroke-opacity=".5"`}/>`;
    });
    const opening = ({ x, i }) => {
      const sel = S && S.kind === "openings" && S.i === i;
      if (x.type === "skylight") {
        const shape = x.round ? `<ellipse class="op sky${sel ? " sel" : ""}" data-k="openings" data-i="${i}" cx="${x.at[0]}" cy="${x.at[1]}" rx="${(x.width || 0.8) / 2}" ry="${(x.depth || 1.2) / 2}" transform="rotate(${x.angle || 0} ${x.at[0]} ${x.at[1]})"/>`
          : `<polygon class="op sky${sel ? " sel" : ""}" data-k="openings" data-i="${i}" points="${pts(openingRect(x))}"/>`;
        h += shape; return;
      }
      h += `<polygon class="op${sel ? " sel" : ""}" data-k="openings" data-i="${i}" points="${pts(openingRect(x))}" fill="${x.type === "open" ? "url(#fl)" : esc(st.background)}"/>` + this._openingSym(x, px);
    };
    this._of("walls").forEach(({ x, i }) => {
      const sel = S && S.kind === "walls" && S.i === i;
      h += `<poly${x.closed ? "gon" : "line"} class="wall${sel ? " sel" : ""}" data-k="walls" data-i="${i}" points="${pts(x.poly)}" stroke="${esc(st.wall)}" ` +
        `stroke-width="${x.width || this._wall("wall_width")}"/>`;
    });
    this._of("openings").filter(({ x }) => x.type === "open").forEach(opening);  // under the outer walls, which stay whole
    this._of("outlines").forEach(({ x, i }) => {
      const sel = S && S.kind === "outlines" && S.i === i;
      h += `<polygon class="outline${sel ? " sel" : ""}" data-k="outlines" data-i="${i}" points="${pts(this._centre(x))}" stroke="${esc(st.wall)}" stroke-width="${this._wall("outer_width")}"/>`;
      if (x.ref === "outside" || x.ref === "inside") h += `<polygon class="refline" points="${pts(x.poly)}" stroke-width="${1.5 * px}"/>`;  // the line that was drawn
    });
    this._of("lines").forEach(({ x, i }) => {
      const sel = S && S.kind === "lines" && S.i === i;
      h += `<${x.open ? "polyline" : "polygon"} class="hline${sel ? " sel" : ""}" data-k="lines" data-i="${i}" points="${pts(x.poly)}" stroke="${esc(st.edge)}" stroke-width="${3 * px}"/>`;
    });
    this._of("openings").filter(({ x }) => x.type !== "open").forEach(opening);
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
        let label = dist(a, this._hover).toFixed(2).replace(".", this.t === T.de ? "," : ".") + " m";
        const b0 = this._draft.length >= 2 ? this._draft[this._draft.length - 2] : null;
        if (b0) {  // angle between the last line and this one
          const u = sub(b0, a), w = sub(this._hover, a), lu = len(u), lw = len(w);
          if (lu > 0 && lw > 0) label += " · " + Math.round(Math.acos(Math.max(-1, Math.min(1, (u[0] * w[0] + u[1] * w[1]) / (lu * lw)))) * 180 / Math.PI) + "°";
        }
        h += `<text class="len" x="${m[0]}" y="${m[1] - 6 * px}" font-size="${12 * px}">${label}</text>`;
      }
    }
    if (this._scaleA) h += `<circle class="dpt first" cx="${this._scaleA[0]}" cy="${this._scaleA[1]}" r="${6 * px}"/>` +
      (this._hover ? `<line class="draft" x1="${this._scaleA[0]}" y1="${this._scaleA[1]}" x2="${this._hover[0]}" y2="${this._hover[1]}" stroke-width="${2 * px}"/>` : "");
    const dr = this._drag;
    if (dr && dr.vertex !== undefined && this._sel && this._sel.kind !== "openings") {  // lengths of both edges while a corner moves
      const el = this._plan[this._sel.kind][this._sel.i], n = el.poly.length, v = el.poly[dr.vertex];
      const comma = (x) => x.toFixed(2).replace(".", this.t === T.de ? "," : ".");
      [el.poly[(dr.vertex - 1 + n) % n], el.poly[(dr.vertex + 1) % n]].forEach((o, k) => {
        if (!o || !v || (k === 0 && dr.vertex === 0 && n < 3) || o === v) return;
        const m = [(o[0] + v[0]) / 2, (o[1] + v[1]) / 2];
        h += `<text class="len" x="${m[0]}" y="${m[1] - 6 * px}" font-size="${12 * px}">${comma(dist(o, v))} m</text>`;
      });
    }
    (this._guides || []).forEach(([g, q]) => {
      const L = Math.max(vw, vh), u = sub(q, g), l = len(u) || 1, e = [u[0] / l * L, u[1] / l * L];
      h += `<line class="guide" x1="${g[0] - e[0]}" y1="${g[1] - e[1]}" x2="${q[0] + e[0]}" y2="${q[1] + e[1]}" stroke-width="${px}" stroke-dasharray="${4 * px} ${4 * px}"/>`;
    });
    (this._right || []).forEach(([c, u, w]) => {
      const k = 10 * px, a2 = [c[0] + u[0] * k, c[1] + u[1] * k], b2 = [c[0] + w[0] * k, c[1] + w[1] * k], m = [a2[0] + w[0] * k, a2[1] + w[1] * k];
      h += `<polyline class="right" points="${pts([a2, m, b2])}" stroke-width="${1.5 * px}"/>`;
    });
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

  /* ---------- Snapping ----------
     Order: a corner nearby → angle (soft: within 4° of horizontal/vertical/45°, of parallel or square to any wall on this
     level, or square to the last drawn line) → lining up with another corner (dashed guide) → onto a wall → 5 cm grid.
     `nb` are the neighbours of a dragged corner: both edges then snap the same way. */
  _snapPolys() {
    const polys = [], closed = (k, x) => (k === "walls" ? !!x.closed : k === "lines" ? !x.open : true);
    SHAPES.forEach((k) => this._of(k).forEach(({ x }) => polys.push({ poly: x.poly, closed: closed(k, x), src: x })));
    const ow = this._wall("outer_width");
    this._of("outlines").forEach(({ x }) => {  // outer walls: their other faces and centre line are worth snapping to as well
      const c = this._centre(x);
      [c, grow(c, ow / 2), grow(c, -ow / 2)].forEach((poly) => polys.push({ poly, closed: true, src: x }));
    });
    const below = this._ghost && this._below();
    if (below) ["rooms", "outlines", "walls"].forEach((k) => this._plan[k].filter((x) => x.level === below).forEach((x) => polys.push({ poly: x.poly, closed: closed(k, x) })));
    if (this._draft) polys.push({ poly: this._draft, closed: false });
    return polys;
  }

  _dirs(polys) {  // directions worth snapping to (radians, 0…π)
    const out = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4], addDir = (r) => {
      r = ((r % Math.PI) + Math.PI) % Math.PI;
      if (!out.some((x) => Math.abs(x - r) < 0.002 || Math.abs(x - r) > Math.PI - 0.002)) out.push(r);
    };
    polys.forEach(({ poly, closed }) => poly.forEach((a, j) => {
      if (!closed && j === poly.length - 1) return;
      const b = poly[(j + 1) % poly.length];
      if (!isFinite(a[0]) || !isFinite(b[0]) || dist(a, b) < 0.3) return;
      const r = Math.atan2(b[1] - a[1], b[0] - a[0]);
      addDir(r); addDir(r + Math.PI / 2);
    }));
    return out;
  }

  _angleTo(from, p, dirs, first) {  // the snapped unit direction from `from` towards p, or null; `first` wins when in reach
    const v = sub(p, from), L = len(v);
    if (L < 0.05) return null;
    const ang = Math.atan2(v[1], v[0]), lim = 4 * Math.PI / 180;
    const pick = (list) => {
      let best = null, bd = lim;
      list.forEach((r) => [r, r + Math.PI, r - Math.PI].forEach((c) => { const d = Math.abs(ang - c); if (d < bd) { bd = d; best = c; } }));
      return best;
    };
    let best = first && first.length ? pick(first) : null;
    if (best === null) best = pick(dirs);
    return best === null ? null : [Math.cos(best), Math.sin(best)];
  }

  _ownDirs(a, polys) {  // square and parallel to the walls the point lies on
    const out = [];
    polys.forEach(({ poly, closed }) => poly.forEach((q, j) => {
      if (!closed && j === poly.length - 1) return;
      const b = poly[(j + 1) % poly.length];
      if (!isFinite(q[0]) || !isFinite(b[0]) || dist(q, b) < 0.3 || dist(a, proj(a, q, b).p) > 0.02) return;
      const r = Math.atan2(b[1] - q[1], b[0] - q[0]);
      out.push(r, r + Math.PI / 2);
    }));
    return out;
  }

  _snap(p, from, free, nb) {
    const px = this._scale(), tol = 10 * px;
    this._guides = []; this._right = null; this._snapMark = null;
    const polys = this._snapPolys();
    let best = null, bd = tol;
    polys.forEach(({ poly }) => poly.forEach((q) => { if (q === from) return; const d = dist(p, q); if (d < bd) { bd = d; best = q; } }));
    if (best) { this._snapMark = best; return best.slice(); }
    const anchors = (nb || (from ? [from] : [])).filter((x) => x && isFinite(x[0]));
    const lines = [];  // [point, unit direction] the result has to lie on
    let q = p;
    if (!free && anchors.length) {
      const dirs = this._dirs(polys);
      const d = this._draft, prev = d && d.length >= 2 && !nb ? d[d.length - 2] : null;
      anchors.forEach((a) => {
        const own = this._ownDirs(a, polys.filter((x) => x.poly !== d));
        if (prev && a === from) { const r = Math.atan2(from[1] - prev[1], from[0] - prev[0]); own.unshift(r, r + Math.PI / 2); }
        const u = this._angleTo(a, p, dirs, own);
        if (u) lines.push([a, u]);
      });
      if (lines.length === 2) {  // a dragged corner: both edges snapped → where the two lines meet
        const [[a, u], [c, w]] = lines, den = u[0] * w[1] - u[1] * w[0];
        if (Math.abs(den) > 1e-6) { const t = ((c[0] - a[0]) * w[1] - (c[1] - a[1]) * w[0]) / den; q = [a[0] + u[0] * t, a[1] + u[1] * t]; } else lines.pop();
      }
      if (lines.length === 1) { const [a, u] = lines[0], t = (p[0] - a[0]) * u[0] + (p[1] - a[1]) * u[1]; q = [a[0] + u[0] * t, a[1] + u[1] * t]; }
      // line up with other corners (horizontal / vertical guides)
      if (lines.length < 2) {
        let gx = null, gy = null, dx = tol, dy = tol;
        polys.forEach(({ poly }) => poly.forEach((v) => {
          if (!isFinite(v[0]) || anchors.indexOf(v) >= 0 && lines.length) return;
          if (Math.abs(v[0] - q[0]) < dx) { dx = Math.abs(v[0] - q[0]); gx = v; }
          if (Math.abs(v[1] - q[1]) < dy) { dy = Math.abs(v[1] - q[1]); gy = v; }
        }));
        const along = (fix, k) => {  // keep the snapped angle: slide along its line until x (k = 0) or y (k = 1) matches
          const [a, u] = lines[0];
          if (Math.abs(u[k]) < 0.05) return false;
          const t = (fix - a[k]) / u[k]; q = [a[0] + u[0] * t, a[1] + u[1] * t]; return true;
        };
        if (gx && (!lines.length ? (q = [gx[0], q[1]], true) : along(gx[0], 0))) this._guides.push([gx, q.slice()]);
        else if (gy && (!lines.length ? (q = [q[0], gy[1]], true) : along(gy[1], 1))) this._guides.push([gy, q.slice()]);
        if (gx && gy && !lines.length) { q = [gx[0], gy[1]]; this._guides = [[gx, q.slice()], [gy, q.slice()]]; }
      }
    }
    // onto a wall: along the snapped line if there is one
    let eb = null; bd = tol;
    polys.forEach(({ poly, closed: c }) => poly.forEach((a, j) => {
      if (!c && j === poly.length - 1) return;
      const b = poly[(j + 1) % poly.length];
      if (!isFinite(a[0]) || !isFinite(b[0])) return;
      let hit = proj(q, a, b).p;
      if (lines.length === 1) {
        const [o, u] = lines[0], e = sub(b, a), den = u[0] * e[1] - u[1] * e[0];
        if (Math.abs(den) < 1e-6) return;
        const t = ((a[0] - o[0]) * e[1] - (a[1] - o[1]) * e[0]) / den, s2 = ((a[0] - o[0]) * u[1] - (a[1] - o[1]) * u[0]) / den;
        if (s2 < 0 || s2 > 1) return;
        hit = [o[0] + u[0] * t, o[1] + u[1] * t];
      } else if (lines.length === 2) return;
      const dd = dist(q, hit);
      if (dd < bd) { bd = dd; eb = hit; }
    }));
    if (eb) { this._snapMark = eb; q = eb; }
    else if (!lines.length && !this._guides.length) {  // 5 cm grid
      const g = 0.05; q = [Math.round(q[0] / g) * g, Math.round(q[1] / g) * g];
    } else if (lines.length === 1 && !this._guides.length) {  // whole 5 cm along the line
      const [a, u] = lines[0], t = Math.round(((q[0] - a[0]) * u[0] + (q[1] - a[1]) * u[1]) / 0.05) * 0.05;
      q = [a[0] + u[0] * t, a[1] + u[1] * t];
    }
    // right angle marks: at each anchor whose edge now stands square to its other edge
    const marks = [], sq = (c, x, y) => {
      const u = sub(x, c), w = sub(y, c), lu = len(u), lw = len(w);
      if (lu > 0.05 && lw > 0.05 && Math.abs((u[0] * w[0] + u[1] * w[1]) / (lu * lw)) < 0.01) marks.push([c, [u[0] / lu, u[1] / lu], [w[0] / lw, w[1] / lw]]);
    };
    if (from && !nb) {
      const d = this._draft;
      if (d && d.length >= 2) sq(from, d[d.length - 2], q);
      else this._ownDirs(from, polys.filter((x) => x.poly !== d)).forEach((r, i) => {  // square to the wall it starts on
        if (i % 2 === 0 && !marks.length) sq(from, [from[0] + Math.cos(r), from[1] + Math.sin(r)], q);
      });
    }
    if (nb && nb[0] && nb[1]) sq(q, nb[0], nb[1]);
    this._right = marks; this._lines = lines;
    return [R3(q[0]), R3(q[1])];
  }

  _centre(o) {  // centre line of an outer wall – the drawn line can be its outside or inside face
    const w = this._wall("outer_width");
    return o.ref === "outside" ? grow(o.poly, -w / 2) : o.ref === "inside" ? grow(o.poly, w / 2) : o.poly;
  }

  _onOutline(q) {  // point on an outer wall of this level (any of its faces)?
    const w = this._wall("outer_width");
    return this._of("outlines").some(({ x }) => {
      const c = this._centre(x);
      return [c, grow(c, -w / 2), x.poly].some((poly) => poly.some((a, j) => dist(q, proj(q, a, poly[(j + 1) % poly.length]).p) < 0.02));
    });
  }

  _nearestWall(p) {  // nearest edge of a room or outer wall on this level
    const tol = 14 * this._scale();
    let best = null;
    ["outlines", "walls", "rooms"].forEach((k) => this._of(k).forEach(({ x }) => {
      if (k === "rooms" && (x.outdoor || this._plan.room_walls === false)) return;
      const poly = k === "outlines" ? this._centre(x) : x.poly;
      poly.forEach((a, j) => {
        if (k === "walls" && !x.closed && j === poly.length - 1) return;
        const b = poly[(j + 1) % poly.length], pr = proj(p, a, b), d = dist(p, pr.p);
        if (d < tol && (!best || d < best.d)) best = { d, p: pr.p, a, b, outer: k === "outlines", width: k === "walls" ? x.width : undefined };
      });
    }));
    return best;
  }

  /* Openings on the same wall keep a small gap (5 cm) and never overlap: a placed or dragged one stops at its neighbour. */
  _keepGap(op, self) {
    if (op.type === "skylight") return op;
    const r = (op.angle || 0) * Math.PI / 180, u = [Math.cos(r), Math.sin(r)], GAP = 0.05;
    const others = this._plan.openings.filter((o) => o !== self && o.level === op.level && o.type !== "skylight");
    for (let pass = 0; pass < 4; pass++) {
      let moved = false;
      others.forEach((o) => {
        const da = Math.abs((((o.angle || 0) - (op.angle || 0)) % 180 + 180) % 180);
        if (Math.min(da, 180 - da) > 3) return;  // not the same wall direction
        const v = [o.at[0] - op.at[0], o.at[1] - op.at[1]], along = v[0] * u[0] + v[1] * u[1], across = Math.abs(v[0] * u[1] - v[1] * u[0]);
        const need = ((op.width || 0.9) + (o.width || 0.9)) / 2 + GAP;
        if (across > 0.2 || Math.abs(along) >= need - 1e-4) return;
        const k = (along >= 0 ? -1 : 1) * (need - Math.abs(along));
        op.at = [R3(op.at[0] + u[0] * k), R3(op.at[1] + u[1] * k)];
        moved = true;
      });
      if (!moved) break;
    }
    return op;
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
    if (POLY_TOOLS.indexOf(tool) >= 0 || tool === "line" || tool === "wall" || tool === "split") return this._draftClick(this._snap(p, this._draft && this._draft[this._draft.length - 1], e.shiftKey), e);
    if (tool === "roomGen") return this._roomAt(p);
    if (OPENING_TOOLS.indexOf(tool) >= 0) {
      const w = this._nearestWall(p);
      if (!w) return;
      const ang = Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) * 180 / Math.PI;
      const width = { door: 0.9, window: 1.2, passage: 0.9, garage: 2.5 }[tool];
      return this._change(() => {
        this._plan.openings.push(this._keepGap({ level: this._level, type: tool, at: [R3(w.p[0]), R3(w.p[1])], angle: R3(ang), width, depth: R3((w.width || this._wall(w.outer ? "outer_width" : "wall_width")) + 0.04) }));
        this._openingPreview = null;
        this._sel = { kind: "openings", i: this._plan.openings.length - 1 };  // its fields (entities …) show right away
      });
    }
    if (tool === "skylight") {  // free in the room, turned like the nearest wall
      const w = this._nearestWall(p);
      return this._change(() => {
        this._plan.openings.push({ level: this._level, type: "skylight", at: [R3(p[0]), R3(p[1])],
          angle: w ? R3(Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) * 180 / Math.PI) : 0, width: 0.8, depth: 1.2 });
        this._sel = { kind: "openings", i: this._plan.openings.length - 1 };
        this._setTool("select");
      });
    }
    if (tool === "openWall") {  // no wall where two rooms meet: cut the shared part up to the walls at its ends
      const w = this._nearestWall(p);
      if (!w || w.outer) return;
      const L = dist(w.a, w.b), u = [(w.b[0] - w.a[0]) / L, (w.b[1] - w.a[1]) / L];
      const along = (q) => (q[0] - w.a[0]) * u[0] + (q[1] - w.a[1]) * u[1];
      const off = (q) => Math.abs((q[0] - w.a[0]) * u[1] - (q[1] - w.a[1]) * u[0]);
      const tp = along(w.p);
      let lo = 0, hi = L;
      this._of("rooms").forEach(({ x }) => {
        if (x.outdoor) return;
        x.poly.forEach((c, j) => {
          const d = x.poly[(j + 1) % x.poly.length];
          if (off(c) > 0.02 || off(d) > 0.02) return;  // not on the same line
          const t1 = Math.min(along(c), along(d)), t2 = Math.max(along(c), along(d));
          if (t2 - t1 > 0.05 && tp >= t1 - 0.01 && tp <= t2 + 0.01 && (t1 > 0.01 || t2 < L - 0.01)) { lo = Math.max(lo, t1); hi = Math.min(hi, t2); }
        });
      });
      const at = (t) => [w.a[0] + u[0] * t, w.a[1] + u[1] * t];
      const end = (t) => (this._onOutline(at(t)) ? 0 : this._wall("wall_width") / 2);  // up to the outer wall, which stays whole
      const t0 = lo + end(lo), t1 = hi - end(hi), width = t1 - t0;
      if (width < 0.1) return;
      const c = at((t0 + t1) / 2);
      return this._change(() => {
        this._plan.openings.push({ level: this._level, type: "open", at: [R3(c[0]), R3(c[1])],
          angle: R3(Math.atan2(u[1], u[0]) * 180 / Math.PI), width: R3(width), depth: R3(this._wall("wall_width") + 0.04) });
      });
    }
    if (tool === "scale") {
      if (!this._scaleA) { this._scaleA = p; this._renderCanvas(); return; }
      const a = this._scaleA, d = dist(a, p);
      this._scaleA = null;
      return this._dialog(this.t.scalePrompt, [{ type: "number", value: d.toFixed(2) }]).then((r) => {
        const real = parseFloat(String((r && r[0]) || "").replace(",", "."));
        const lv = this._lv();
        if (!real || !d || !lv || !lv.background) return this._renderCanvas();
        const f = real / d, bg = lv.background;
        this._change(() => {
        bg.x = R3(a[0] + ((bg.x || 0) - a[0]) * f); bg.y = R3(a[1] + ((bg.y || 0) - a[1]) * f);
        bg.width = R3(bg.width * f); if (bg.height) bg.height = R3(bg.height * f);
        this._vb = [a[0] + (this._vb[0] - a[0]) * f, a[1] + (this._vb[1] - a[1]) * f, this._vb[2] * f, this._vb[3] * f];
        });
      });
    }
    if (tool === "straighten") {  // turn only the background so the line a–b becomes horizontal or vertical
      const lv = this._lv(), bg = lv && lv.background;
      if (!bg) return;
      if (!this._scaleA) { this._scaleA = p; this._renderCanvas(); return; }
      const a = this._scaleA;
      this._scaleA = null;
      if (dist(a, p) < 0.05) return this._renderCanvas();
      const ang = Math.atan2(p[1] - a[1], p[0] - a[0]) * 180 / Math.PI;
      const d = -(ang - Math.round(ang / 90) * 90), r = d * Math.PI / 180;
      if (Math.abs(d) < 0.01) return this._renderCanvas();
      const x = (bg.x || 0) - a[0], y = (bg.y || 0) - a[1];  // the corner the image turns about moves around a
      return this._change(() => {
        bg.x = R3(a[0] + x * Math.cos(r) - y * Math.sin(r)); bg.y = R3(a[1] + x * Math.sin(r) + y * Math.cos(r));
        bg.rotation = R3((bg.rotation || 0) + d);
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
      const n = el.poly.length, open = (this._sel.kind === "walls" && !el.closed) || (this._sel.kind === "lines" && el.open);
      const nb = [d.vertex > 0 || !open ? el.poly[(d.vertex - 1 + n) % n] : null, d.vertex < n - 1 || !open ? el.poly[(d.vertex + 1) % n] : null];
      el.poly[d.vertex] = this._snap(p, null, e.shiftKey, nb) || old;
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
      if (this._sel.kind === "openings" && el.type === "skylight") {
        el.at = [R3(d.orig.at[0] + dx), R3(d.orig.at[1] + dy)];
      } else if (this._sel.kind === "openings") {
        const w = this._nearestWall(p);
        if (w) {
          el.at = [R3(w.p[0]), R3(w.p[1])];
          el.angle = R3(Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) * 180 / Math.PI);
          this._keepGap(el, el);
        }
      } else {
        let mx = dx, my = dy;
        const raw = [p[0] - d.start[0], p[1] - d.start[1]], tol = 10 * this._scale(), others = this._snapPolys().filter((x) => x.src !== el && x.poly !== el.poly);
        let bd = tol, best = null;  // a corner of the moved element meets a corner or a wall of another one
        d.orig.poly.forEach((q) => {
          const m = [q[0] + raw[0], q[1] + raw[1]];
          others.forEach(({ poly, closed: c }) => poly.forEach((a, j) => {
            if (!isFinite(a[0])) return;
            const dv = dist(m, a);
            if (dv < bd) { bd = dv; best = [a[0] - q[0], a[1] - q[1], a]; }
            if ((c || j < poly.length - 1) && dv >= tol) {
              const b = poly[(j + 1) % poly.length], pr = proj(m, a, b), de = dist(m, pr.p);
              if (de < bd * 0.8) { bd = de; best = [pr.p[0] - q[0], pr.p[1] - q[1], pr.p]; }
            }
          }));
        });
        if (best) { mx = best[0]; my = best[1]; this._snapMark = best[2]; } else this._snapMark = null;
        el.poly = d.orig.poly.map((q) => [R3(q[0] + mx), R3(q[1] + my)]);
        if (d.orig.label_at) el.label_at = [R3(d.orig.label_at[0] + mx), R3(d.orig.label_at[1] + my)];
      }
      this._dirty = true; return this._renderCanvas();
    }
    const tool = this._tool;
    if (POLY_TOOLS.indexOf(tool) >= 0 || tool === "line" || tool === "wall" || tool === "split") {
      this._hover = this._snap(p, this._draft && this._draft[this._draft.length - 1], e.shiftKey);
      return this._renderCanvas();
    }
    if ((tool === "scale" || tool === "straighten") && this._scaleA) { this._hover = p; return this._renderCanvas(); }
    if (OPENING_TOOLS.indexOf(tool) >= 0) {
      const w = this._nearestWall(p);
      this._openingPreview = w ? { type: tool, at: w.p, angle: Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) * 180 / Math.PI,
        width: { door: 0.9, window: 1.2, passage: 0.9, garage: 2.5 }[tool], depth: R3((w.width || this._wall(w.outer ? "outer_width" : "wall_width")) + 0.04) } : null;
      return this._renderCanvas();
    }
  }

  _up(e) {
    const d = this._drag;
    this._drag = null;
    try { this._svg().releasePointerCapture(e.pointerId); } catch (x) { /* not captured */ }
    if (!d) return;
    if (d.body && !d.moved) this._undo.pop();
    this._snapMark = null; this._guides = []; this._right = null;
    if (d.vertex !== undefined || d.body || d.label || d.img) { this._renderAll(); }
  }

  _dbl(e) {  // double click on an edge of the selection inserts a corner
    if (this._tool !== "select" || !this._sel || this._sel.kind === "openings") return;
    const el = this._plan[this._sel.kind][this._sel.i], p = this._pt(e), tol = 10 * this._scale();
    let best = null;
    el.poly.forEach((a, j) => {
      if (((this._sel.kind === "lines" && el.open) || (this._sel.kind === "walls" && !el.closed)) && j === el.poly.length - 1) return;
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
    const el = this._plan[this._sel.kind][this._sel.i], min = this._sel.kind === "lines" || this._sel.kind === "walls" ? 2 : 3;
    if (el.poly.length <= min) return;
    this._change(() => { el.poly.splice(hit.v, 1); });
  }

  _draftClick(p) {
    const d = this._draft || (this._draft = []), open = this._tool === "line" || this._tool === "wall" || this._tool === "split";
    if (d.length >= 3 && dist(p, d[0]) < 1e-6) { if (open) this._closed = true; return this._finish(); }
    if (d.length && dist(p, d[d.length - 1]) < 1e-6) { if (open && d.length >= 2) this._finish(); return; }
    d.push(p);
    this._renderCanvas();
  }

  _finish() {
    const d = this._draft, tool = this._tool, closedWall = !!this._closed;
    this._draft = null; this._hover = null; this._snapMark = null; this._closed = false; this._guides = []; this._right = null;
    if (!d || d.length < (tool === "line" || tool === "wall" || tool === "split" ? 2 : 3)) return this._renderCanvas();
    const p = this._plan;
    if (tool === "split") return this._split(d);
    if (tool === "wall") {  // keep the tool: walls are drawn one after another
      this._change(() => { const w = { level: this._level, poly: d }; if (closedWall) w.closed = true; p.walls.push(w); });
      return;
    }
    this._change(() => {
      if (tool === "outline") {
        const o = { level: this._level, poly: d, ref: "outside" };  // like a blueprint: the drawn size is the outside size
        if (this._building) o.building = this._building;
        p.outlines.push(o);
        this._sel = { kind: "outlines", i: p.outlines.length - 1 };
      } else if (tool === "line") {
        p.lines.push({ level: this._level, poly: d, open: !closedWall });
        this._sel = { kind: "lines", i: p.lines.length - 1 };
      } else {
        const nm = this._newRoomName(tool === "outdoor");
        const r = { id: nm.id, level: this._level, name: nm.name, poly: d };
        if (tool === "outdoor") r.outdoor = true;
        if (this._building && tool !== "outdoor") r.building = this._building;
        p.rooms.push(r);
        this._sel = { kind: "rooms", i: p.rooms.length - 1 };
      }
    });
    this._setTool("select");
  }

  _areas() {  // Home Assistant areas, sorted by name
    const a = (this._hass && this._hass.areas) || {};
    return Object.keys(a).map((id) => ({ id, name: a[id].name || id })).sort((x, y) => x.name.localeCompare(y.name));
  }

  /* ---------- Pop-up cards for the rooms (Bubble Card, hash #room) ---------- */
  _popupCard(r, style) {
    const t = this.t, areas = (this._hass && this._hass.areas) || {}, a = r.area && areas[r.area];
    const head = { type: "custom:bubble-card", card_type: "pop-up", hash: "#" + r.id, name: r.name || r.id, icon: (a && a.icon) || "mdi:floor-plan" };
    const hide = this._hideLabels().map((l) => ({ label: l }));
    if (style === "auto" && r.area) {
      const ar = r.area, grid = (include, exclude) => ({ type: "custom:auto-entities", show_empty: false, card: { type: "grid", columns: 2, square: false },
        card_param: "cards", sort: { method: "name" }, filter: { include, exclude: hide.concat(exclude || []) } });
      const contacts = ["window", "door", "opening", "garage_door"];
      head.cards = [
        grid([{ area: ar, domain: "light", options: { type: "tile", features: [{ type: "light-brightness" }], features_position: "inline" } }]),
        grid([{ area: ar, domain: "cover", options: { type: "tile", features: [{ type: "cover-open-close" }, { type: "cover-position" }] } },
          { area: ar, domain: "climate", options: { type: "tile", features: [{ type: "target-temperature" }] } }]),
        grid(contacts.map((dc) => ({ area: ar, domain: "binary_sensor", attributes: { device_class: dc }, options: { type: "tile" } }))
          .concat([{ area: ar, domain: "media_player", options: { type: "tile", features: [{ type: "media-player-volume-slider" }], features_position: "inline" } }])),
        { type: "custom:auto-entities", show_empty: false, card: { type: "entities", title: t.more }, sort: { method: "name" },
          filter: { include: [{ area: ar }], exclude: hide.concat([{ state: "unavailable" }, { state: "unknown" }],
            contacts.map((dc) => ({ domain: "binary_sensor", attributes: { device_class: dc } })),
            ["light", "cover", "climate", "media_player", "camera", "update", "automation", "device_tracker", "notify", "event", "image",
              "conversation", "stt", "tts", "assist_satellite", "ai_task", "wake_word", "button", "number", "select", "text", "time", "date",
              "remote", "input_select", "input_number", "input_button"].map((d) => ({ domain: d }))) } },
      ];
      return head;
    }
    // fixed tiles from the room's entities (and those of its area)
    const key = r.key || r.id, e = Object.assign({}, this._plan.entities[key] || {});
    if (r.area) {
      const tmp = { entities: {} }, keep = this._plan;
      this._plan = Object.assign({}, keep, { entities: tmp.entities }); this._fill("x", r.area); const found = tmp.entities.x || {}; this._plan = keep;
      Object.keys(found).forEach((f) => { if (f === "temp") e.temp = e.temp || found.temp; else e[f] = (e[f] || []).concat(found[f].filter((id) => (e[f] || []).indexOf(id) < 0)); });
    }
    const tile = (id, features, inline) => { const c = { type: "tile", entity: id }; if (features) c.features = features; if (inline) c.features_position = "inline"; return c; };
    const cards = [].concat(
      (e.licht || []).map((id) => tile(id, [{ type: "light-brightness" }], true)),
      (e.beschattung || []).map((id) => tile(id, [{ type: "cover-open-close" }, { type: "cover-position" }])),
      e.temp && e.temp.indexOf("climate.") === 0 ? [tile(e.temp, [{ type: "target-temperature" }])] : e.temp ? [tile(e.temp)] : [],
      (e.fenster || []).map((id) => tile(id)),
      (e.musik || []).map((id) => tile(id, [{ type: "media-player-volume-slider" }], true)),
      (e.praesenz || []).concat(e.bewegung || []).map((id) => tile(id)));
    head.cards = [{ type: "grid", columns: 2, square: false, cards: cards }];
    return head;
  }

  async _popupDialog(rooms) {
    const t = this.t, box = document.createElement("div");
    let dashes = [];
    try { dashes = (await this._hass.callWS({ type: "lovelace/dashboards/list" })).filter((d) => d.mode !== "yaml"); } catch (e) { dashes = []; }
    dashes.unshift({ url_path: "", title: t.defaultDash });
    box.className = "dlg";
    box.innerHTML = `<form class="wide"><p><b>${esc(rooms.length === 1 ? t.popup : t.popupAll)}</b></p>` +
      `<label><span>${esc(t.popStyle)}</span><select class="pst"><option value="auto">${esc(t.popAuto)}</option><option value="static">${esc(t.popStatic)}</option></select></label>` +
      `<p class="dhint nar"></p><textarea class="yaml" rows="16" spellcheck="false"></textarea>` +
      `<div class="btns"><button type="button" class="cpy">${esc(t.copy)}</button><span class="sp"></span>` +
      `<select class="dsh">${dashes.map((d) => `<option value="${esc(d.url_path || "")}">${esc(d.title || d.url_path)}</option>`).join("")}</select>` +
      `<select class="vw"></select><button type="button" class="ins primary">${esc(t.insert)}</button><button type="button" class="cls">${esc(t.close)}</button></div></form>`;
    this.shadowRoot.querySelector(".app").appendChild(box);
    const q = (c) => box.querySelector(c);
    const cards = () => rooms.map((r) => this._popupCard(r, q(".pst").value));
    const show = () => {
      const list = cards();
      q(".yaml").value = list.map((c) => toYaml(c)).join("\n# ---\n");
      const without = rooms.filter((r) => !r.area).map((r) => r.name || r.id);
      q(".nar").textContent = q(".pst").value === "auto" && without.length ? without.join(", ") + ": " + t.noArea : "";
    };
    let conf = null;
    const loadViews = async () => {
      const url = q(".dsh").value || null;
      try { conf = await this._hass.callWS({ type: "lovelace/config", url_path: url }); } catch (e) { conf = null; }
      const views = conf && conf.views ? conf.views : [];
      q(".vw").innerHTML = views.map((v, i) => `<option value="${i}">${esc(v.title || v.path || "#" + (i + 1))}</option>`).join("");
      q(".ins").disabled = !views.length;
    };
    q(".pst").addEventListener("change", show);
    q(".dsh").addEventListener("change", loadViews);
    q(".cls").addEventListener("click", () => box.remove());
    q(".cpy").addEventListener("click", () => {
      const ta = q(".yaml");
      const ok = () => { q(".cpy").textContent = t.copied; setTimeout(() => { q(".cpy").textContent = t.copy; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(ok, () => { ta.select(); document.execCommand("copy"); ok(); });
      else { ta.select(); document.execCommand("copy"); ok(); }
    });
    q(".ins").addEventListener("click", async () => {
      if (!conf || !conf.views) return;
      if (conf.strategy) return this._status(t.strategy, true);
      const vi = +q(".vw").value, view = conf.views[vi], dn = q(".dsh").selectedOptions[0].textContent;
      const text = t.insertAsk.replace("%s", rooms.length).replace("%d", dn).replace("%v", view.title || view.path || "#" + (vi + 1));
      if (!(await this._dialog(text))) return;
      const all = JSON.stringify(view), add = cards().filter((c) => all.indexOf(`"hash":"${c.hash}"`) < 0);
      if (add.length) {
        if (view.sections) {  // sections view: next to existing pop-ups, otherwise in a section of their own
          const sec = view.sections.find((x) => (x.cards || []).some((c) => c.card_type === "pop-up"));
          if (sec) sec.cards = sec.cards.concat(add); else view.sections.push({ type: "grid", cards: add });
        } else view.cards = (view.cards || []).concat(add);
        await this._hass.callWS({ type: "lovelace/config/save", url_path: q(".dsh").value || null, config: conf });
      }
      this._status(t.inserted.replace("%s", add.length).replace("%s", rooms.length - add.length));
      box.remove();
    });
    show();
    loadViews();
  }

  /* Entities of an area, sorted into the room fields; adds what is missing, keeps what is there. Returns how many were added. */
  _fill(key, areaId) {
    const H = this._hass, reg = H.entities || {}, dev = H.devices || {}, st = H.states || {};
    const found = { licht: [], praesenz: [], bewegung: [], fenster: [], beschattung: [], musik: [] };
    let climate = null, sensor = null;
    Object.keys(reg).sort().forEach((id) => {
      const e = reg[id], s = st[id];
      if (!s || e.hidden || e.entity_category || this._isHidden(id, reg)) return;
      const area = e.area_id || (e.device_id && dev[e.device_id] && dev[e.device_id].area_id);
      if (area !== areaId) return;
      const d = id.split(".")[0], dc = s.attributes.device_class;
      if (d === "light") found.licht.push(id);
      else if (d === "binary_sensor" && (dc === "occupancy" || dc === "presence")) found.praesenz.push(id);
      else if (d === "binary_sensor" && dc === "motion") found.bewegung.push(id);
      else if (d === "binary_sensor" && ["window", "door", "opening", "garage_door"].indexOf(dc) >= 0) found.fenster.push(id);
      else if (d === "cover" && ["garage", "door", "gate", "window"].indexOf(dc) < 0) found.beschattung.push(id);
      else if (d === "media_player" && dc !== "tv") found.musik.push(id);
      else if (d === "climate" && !climate) climate = id;
      else if (d === "sensor" && dc === "temperature" && !sensor) sensor = id;
    });
    const e = this._plan.entities[key] || (this._plan.entities[key] = {});
    let n = 0;
    Object.keys(found).forEach((f) => found[f].forEach((id) => {
      const list = e[f] || (e[f] = []);
      if (list.indexOf(id) < 0) { list.push(id); n++; }
    }));
    if (!e.temp && (climate || sensor)) { e.temp = climate || sensor; n++; }
    return n;
  }

  _newRoomName(outdoor) {
    const p = this._plan, base = outdoor ? (this.t === T.de ? "Garten" : "Garden") : (this.t === T.de ? "Raum" : "Room");
    let n = 1, name = base + " " + n;
    while (p.rooms.some((r) => r.name === name)) name = base + " " + ++n;
    let id = slug(name), k = 2;
    while (p.rooms.some((r) => r.id === id)) id = slug(name) + "_" + k++;
    return { id, name };
  }

  _roomAt(p) {  // "generate room": fill the area around p up to the walls
    const pl = this._plan, have = this._of("rooms").find(({ x }) => !x.outdoor && inside(p, x.poly));
    if (have) { this._sel = { kind: "rooms", i: have.i }; this._renderAll(); return this._status(this.t.haveRoom); }
    const segs = [], add2 = (poly, closed) => poly.forEach((a, j) => { if (closed || j < poly.length - 1) segs.push([a, poly[(j + 1) % poly.length]]); });
    this._of("outlines").forEach(({ x }) => add2(this._centre(x), true));
    this._of("walls").forEach(({ x }) => add2(x.poly, !!x.closed));
    // a wall that ends at the face of another wall (outer wall: inside face) is joined to that wall's centre line
    const centres = [], ow = this._wall("outer_width"), iw = this._wall("wall_width");
    this._of("outlines").forEach(({ x }) => { const c = this._centre(x); c.forEach((a, j) => centres.push([a, c[(j + 1) % c.length], ow / 2])); });
    this._of("walls").forEach(({ x }) => x.poly.forEach((a, j) => { if (x.closed || j < x.poly.length - 1) centres.push([a, x.poly[(j + 1) % x.poly.length], (x.width || iw) / 2, x]); }));
    this._of("walls").forEach(({ x }) => {
      if (x.closed) return;
      [x.poly[0], x.poly[x.poly.length - 1]].forEach((e) => {
        let best = null;
        centres.forEach(([a, b, half, own]) => {
          if (own === x) return;
          const pr = proj(e, a, b), d = dist(e, pr.p);
          if (d > 0.01 && d <= half + 0.03 && (!best || d < best.d)) best = { d, p: pr.p };
        });
        if (best) segs.push([e, best.p]);
      });
    });
    this._of("rooms").forEach(({ x }) => { if (!x.outdoor) add2(x.poly, true); });
    const face = faceAt(segs, p);
    if (!face) return this._status(this.t.noFace, true);
    const nm = this._newRoomName(false);
    this._change(() => {
      const r = { id: nm.id, level: this._level, name: nm.name, poly: face };
      if (this._building) r.building = this._building;
      pl.rooms.push(r);
      this._sel = { kind: "rooms", i: pl.rooms.length - 1 };
    });
  }

  _split(path) {  // cut the room the path crosses into two
    const pl = this._plan, mid = path.length > 2 ? path[1] : [(path[0][0] + path[1][0]) / 2, (path[0][1] + path[1][1]) / 2];
    // the ends may lie on any face of a wall: move each end along its line to where it meets the room's edge
    const fit = (poly) => {
      const q = path.map((x) => x.slice()), meet = (from, to) => {
        const u = sub(to, from);
        let best = null;
        poly.forEach((a, j) => {
          const b = poly[(j + 1) % poly.length], e = sub(b, a), den = u[0] * e[1] - u[1] * e[0];
          if (Math.abs(den) < 1e-9) return;
          const t = ((a[0] - from[0]) * e[1] - (a[1] - from[1]) * e[0]) / den, s2 = ((a[0] - from[0]) * u[1] - (a[1] - from[1]) * u[0]) / den;
          if (s2 < -1e-6 || s2 > 1 + 1e-6 || t > 0.999) return;  // on the edge, towards the start of the line
          if (!best || Math.abs(t) < Math.abs(best.t)) best = { t, p: [R3(from[0] + u[0] * t), R3(from[1] + u[1] * t)] };
        });
        return best ? best.p : from;
      };
      q[0] = meet(q[0], q[1]);
      q[q.length - 1] = meet(q[q.length - 1], q[q.length - 2]);
      return q;
    };
    const hit = this._of("rooms").find(({ x }) => inside(mid, x.poly) && splitPoly(x.poly, fit(x.poly)));
    if (!hit) { this._status(this.t.noSplit, true); return this._renderCanvas(); }
    path = fit(hit.x.poly);
    const r = hit.x, parts = splitPoly(r.poly, path), nm = this._newRoomName(r.outdoor);
    this._change(() => {
      const keep = r.label_at && inside(r.label_at, parts[1]) ? 1 : 0;
      const other = Object.assign(clone(r), { id: nm.id, name: nm.name, poly: parts[1 - keep] });
      delete other.label_at; delete other.key; delete other.color;
      r.poly = parts[keep];
      pl.rooms.push(other);
      this._sel = { kind: "rooms", i: pl.rooms.length - 1 };
    });
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
    if (this._plan.site) {
      this._card.setConfig({ plan: this._plan.id, plan_data: clone(this._plan), intro: false, tap: "none" });
      this._card.hass = this._hass;
      return;
    }
    const ids = this._plan.levels.map((l) => l.id);
    this._card.setConfig({ plan: this._plan.id, plan_data: clone(this._plan), mode: "swipe", start: this._level, intro: false, tap: "none", floors: ids });
    this._card.hass = this._hass;
  }
}

const STYLES = `
  .dlg { position: fixed; inset: 0; top: 0; left: 0; right: 0; bottom: 0; z-index: 20; display: flex; align-items: center; justify-content: center;
    background: rgba(0, 0, 0, .45); }
  .siteed { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: auto; padding: 12px 16px; }
  .dlg form.wide { width: min(760px, calc(100vw - 32px)); }
  .dlg textarea.yaml { font-family: monospace; font-size: 12px; white-space: pre; }
  .dlg .btns select { max-width: 180px; }
  .dlg .btns .sp { flex: 1; }
  .dlg form { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); border-radius: 12px; padding: 18px;
    width: min(440px, calc(100vw - 32px)); box-shadow: 0 8px 30px rgba(0, 0, 0, .5); }
  .dlg p { margin: 0 0 12px; } .dlg .dhint { font-size: 12px; opacity: .7; }
  .dlg label { display: block; margin-bottom: 10px; font-size: 13px; }
  .dlg label span { display: block; margin-bottom: 4px; opacity: .8; }
  .dlg input, .dlg textarea { width: 100%; font: inherit; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--divider-color);
    background: var(--primary-background-color); color: var(--primary-text-color); }
  .dlg .primary { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: transparent; }
  .dlg .btns { display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; }
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
  .op.sky { fill: rgba(159, 211, 255, .3); stroke: #9fd3ff; stroke-width: .05; }
  .small { font-size: 11px; opacity: .7; margin: 0 0 8px; }
  .refline { fill: none; stroke: #ffd166; stroke-dasharray: .2 .15; opacity: .7; pointer-events: none; }
  .wall { fill: none; stroke-linejoin: miter; stroke-linecap: square; cursor: pointer; pointer-events: stroke; }
  .wall.sel { stroke: #4fc3ff; }
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
  .guide { stroke: #ffd166; opacity: .8; pointer-events: none; }
  .right { fill: none; stroke: #ffd166; pointer-events: none; }
  .dpt { fill: #4fc3ff; pointer-events: none; } .dpt.first { fill: #fff; stroke: #4fc3ff; stroke-width: .05; }
  .snap { fill: none; stroke: #ffcd91; pointer-events: none; }
  .len { fill: #fff; text-anchor: middle; pointer-events: none; paint-order: stroke; stroke: rgba(3,7,18,.9); stroke-width: .06; }
  .north path { fill: #ffcd91; opacity: .9; } .north text { fill: #ffcd91; text-anchor: middle; font-weight: 600; }
  image.bg { pointer-events: none; }
  @media (max-width: 900px) { .side { width: 250px; } }
`;

if (!customElements.get("floorplan-lite-panel")) customElements.define("floorplan-lite-panel", FloorplanLitePanel);
