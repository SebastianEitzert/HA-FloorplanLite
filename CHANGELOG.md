# Changelog

All notable changes to this project. Versions follow the `version` in `custom_components/floorplan_lite/manifest.json`.

## Unreleased
- Site editor: „Show dimensions“ (ruler in the tool bar) labels the edges of buildings and areas outside with their length; the choice is remembered.
- Card: a site background image no longer enlarges the site view – the view follows the buildings and areas, the image is cut off.
- Site editor: the background can be moved („Move background“: drag; Shift+wheel turns, Alt+wheel scales around the pointer) and turned to a line („Turn background“: two points on a boundary or wall, then the wanted direction).
- Site editor: tools as icons in a bar on the left (like the floor plan editor), with tooltips; new tools „Edit areas outside“ (drag corners, without moving buildings by accident) and „Draw area outside“; „Edit“ next to each area in the list.
- Site editor: drawing and editing areas outside snaps to corners and edges of buildings and other areas, else 45° steps and a 0.25 m grid (Shift: free); corners of areas can be dragged, double-click an edge adds a corner, a corner removes it.
- Editor page keeps the window height: only the side panel scrolls, the drawing area stays in place.
- Site editor: the grid no longer slips when the editor area changes its size (the view keeps the frame's shape).
- Editor: the north arrow of a plan that stands on a site follows the site (site north and the building's turn); the
  field shows where it comes from. Plans without a site keep their own adjustable north.

## 0.8.0 – 2026-10-27
- Compass rose in every view (top bar on a site, plan corner otherwise) showing where north is; `kompass: false` hides it.
- North and view alignment: the site editor sets north for the site view (`site.north`, degrees, 0 = up) and whether
  building views keep their own axis or turn north up (`site.ausrichtung: achse | norden`); a card can override it with
  `ausrichtung` (also in the card editor). A single plan uses its `north` the same way.
- Building badges on the site sit in the middle of the building by default and can be dragged in the site editor
  (`label_at`, double-click resets).

## 0.7.2 – 2026-10-27
- Measure lines in the site editor: „Corner to corner“ can keep the line (default). One line fixes a building's
  position to another building's corner (with offset in metres), two lines fix its turn as well; moving or turning the
  other building takes it along. Fixed buildings can't be dragged; click a measure line to release it. Stored as
  `site.links`.
- README logos use absolute image links, so HACS shows them.

## 0.7.1 – 2026-10-27
- Site editor uses the full editor area (no longer cut off): zoom with the wheel, pan by dragging the empty canvas, lists
  in the side panel.
- Placing buildings with real measures: „Corner to corner“ (pick a corner of the building to move, then a corner of
  the other building, enter an offset in metres), „Align to background“ (two building corners onto two points of a
  shared site plan, optionally scaling), background image/PDF upload for the site and „Background scale“ (two points
  plus the real length). Corners snap.

## 0.7.0 – 2026-10-27
- The site moves into the floor plan editor: „New site“ (⌂+) creates a plan whose buildings are other plans – drag,
  turn, scale them with an overlap warning, draw the shared areas outside and link them to HA areas with their
  entities, background image and grid. A card needs only `plan: <site>`; the card editor keeps what belongs to the
  dashboard (start view, users with template preview, buttons, off button, shown buildings). `site:` in the card still
  works and can override `show`.
- „Buildings“ inside a single plan are now called building parts, with a hint to the site.

## 0.6.0 – 2026-10-27
- **Site** (card option `site`, without it nothing changes): several plans as buildings on one property, placed by
  `x`/`y`/`rotation`/`scale` or automatically side by side. Three levels – site, building, level – with a bar on top,
  zoom by tap, „⤢ Site“, pinch, Ctrl+wheel, the remote's ↑/↓ (not over a room) and Back (view in the address,
  `#plan=…&floor=…`). Site view with every building's `site_floor` and a summary per building.
- Shared **areas outside** (`site.areas`) in site coordinates: complete on the site, the part next to a building in its
  view (`nachbar_rand`); operated like rooms.
- **Start view and following the location:** address (`?raum=`, `?ansicht=`, also as hash) → per-user `follow`
  (*standort*: geofence and Bluetooth areas such as Bermuda; *fest*: view, room or template with `benutzer` / `geraet`)
  → `start`. „You are here“ / „This TV“ marks the room; `follow_floor`, `follow_hold`.
- **Off button** per level (two presses, only what is on or playing, `musik_aus`, `aus_mit_aussen`, `aus_schalter`) and
  **own buttons** top left (`buttons`, standard HA actions).
- Only one building: `site.show`, and the card option `building` for a plan with several buildings.
- Visual editor: site step (drag buildings, turn / scale, overlap warning, draw areas outside), users with live template
  preview, all site options.

## 0.5.1 – 2026-10-26
- ↑/↓ no longer scroll the page while a floor plan card is visible – the wheel does. Card option `scroll_keys: true`
  (visual editor: „Arrow keys ↑/↓ scroll the page“) brings scrolling back for remotes without a wheel. Text fields,
  sliders, dialogs and pop-ups keep their arrow keys.

## 0.5.0 – 2026-10-26
- All keys, clicks, wheel steps and taps over a room go to a script (card option `script`, default
  `script.raum_klick`) as `{raum, aktion, lichter, player}` – the card itself only opens the pop-up and changes the
  level. New event names: `gelb` / `gelb2` (right click or yellow once / twice), `tipp2` / `tipp3`, `play_pause`,
  `stop`, `weiter`, `zurueck`, `blau`, `gruen`, `rot`. `raum` is the room's area when it has one.
- Script blueprint *Floorplan Lite – keys, clicks and wheel over a room*, installed with the integration: what each event
  does is a setting; scenes of a room by area or name (no fixed names), rooms without scenes switch their lights on and
  off, louder / quieter only while music plays (or always), standard players per room, modes in priority order
  (night, cinema … – their scenes come first while on), an action for every remote key pressed twice (`hoch2`,
  `gelb2`, `play2` = next track …) with an adjustable waiting time – only keys with a „twice“ action wait, the card asks
  the script which ones (`aktion: config`). Allow and block lists of integrations and labels, for lights and for
  players. The lights and players entered for the room in the floor plan are the ones that are switched (switches too);
  the lists only filter the area's entities when the plan has none (optional: also the plan's). Older cards
  (`klicks`, `aktion: musik`) still work with it.
- Short display in the room's label: the volume after louder / quieter / play, the scene's name after a scene change.
- Roller shutter or blind per window (`shade`): drawn outside the wall, closed part as a bar, blinds with their slats
  turned by the tilt; moving shades pulse; tapping a window with only a contact opens the shade.
- Open windows, doors and gates in the chip's red-orange, tilted ones dashed yellow; the open chip has its own icon.
- Switches can be chosen as lights and main light (by hand – the area fill still takes lights only); per room a light
  colour for lights and switches without one (warm white, neutral, cold, amber, red, green, blue, purple or own).
- Editor: openings on the same wall keep 5 cm apart and never overlap when placed or dragged.

## 0.4.3 – 2026-10-26
- Fix "configuration error" in place of the card: another dashboard plugin can swap the browser's custom-element
  registry for a polyfilled one right after start-up, after this card had registered (it loads first). The card now
  checks for a few seconds and registers again where needed.

## 0.4.2 – 2026-10-26
- Remote / keyboard arrow keys with several cards on a page (or next to another floor plan card): the card under the
  pointer takes them, otherwise the first visible one – before, a card higher up could take them all.

## 0.4.1 – 2026-10-26
- Play / pause with the pointer over a room start / pause its music – media keys, or the remote keys of the TV Streamer
  (`tv-streamer-key` event). With `script.raum_klick` it gets `aktion: play` / `pause`, otherwise the room's media
  players are used directly. A single right click (LG remote: yellow) over a room no longer starts the music, so it is
  free for something else; twice still switches the room off.

## 0.4.0 – 2026-10-26
- Several labels to ignore (`hide_labels`, card option `hide_label` as a list); the older single label still works.
- Rooms can take their entities live from their area (`area_live`): new devices in the area show up by themselves.
- *Create pop-up YAML* per room or for all rooms: a Bubble Card pop-up (`#room`) either with auto-entities by area
  (dynamic, like hand-made area pop-ups) or with fixed tiles; copy it, or add it to a dashboard view directly
  (pop-ups whose hash is already there stay untouched).
- Drawing snaps softly: within 4° of horizontal, vertical, 45°, parallel or square to any wall on the level, and with
  priority square to the wall a line starts on (also on slanted walls) or to the last drawn line; in between it draws
  freely (Shift: no angle snapping). Corners line up with other corners (dashed guide), a right-angle mark shows square
  corners, the label shows length and angle. Dragging a corner snaps both of its edges the same way.
- Visual editor for the card in the dashboard (plan, display, start level, levels shown, align, background images,
  build-up animation, tap, label to ignore) – no YAML needed; the card picker starts with the first stored plan.
- Rooms from Home Assistant areas: choose the area of a room – name, id and the entities found in it (lights, presence,
  motion, window contacts, shades, music, thermostat or temperature) are filled in; *Fill all rooms that have an area*.
- Windows: choose where "tilted" comes from – automatic, an attribute of the contact (with value), or an entity of its own.
- Outer walls: choose which face the drawn line is (`ref`: outside, centre, inside); new outer walls use the outside
  face, so a wall drawn 18 m long is 18 m outside, like on a blueprint. Doors and windows sit in the middle of the wall,
  inner walls, rooms and corners snap to all faces, and a wall ending at a face counts as joined when generating rooms.
- Editing afterwards snaps too: while a corner is dragged both edges show their length (plus right-angle marks and
  guides); a moved element snaps its corners to other corners and walls. A split line may start on any face of a wall.

## 0.3.0 – 2026-10-26
- Background from a PDF: the editor turns a page of the PDF (choose which, for multi-page plans) into an image, sharp
  enough for tracing an old blueprint. pdf.js (Apache-2.0) ships with the integration and only loads when a PDF is chosen.
- Tool *Straighten background*: two points on a wall of a crooked scan or photo of a paper plan – only the image turns
  until that line is exactly horizontal or vertical.
- *Copy level*: copies outer walls, rooms, doors, windows and helper lines to a new level, so levels that build on each
  other need not be drawn again. Copied rooms get ids of their own without entities.
- Outer walls, inner walls and rooms are separate: *Draw inner wall* (centre line, own thickness, snaps to corners and
  walls), *Generate room* (click into an area – the room fills it up to the surrounding walls; wall stubs ending in the
  room are ignored), *Draw room* (corners snap to wall corners and walls, or free) and *Split room* (a line from edge to
  edge, with bends if needed). New plans use this (`room_walls: false`); existing plans keep rooms that draw their own
  walls until the setting is switched off.
- Windows, doors and gates get entities (window contact, cover, lock, garage door, button, switch): open ones glow
  orange, an unlocked lock red. Tapping a window opens the entity's dialog; tapping a door or gate asks first
  ("Garage door – open?", with *Details*) and then works the lock, cover or button.
- Roof windows and domes (`skylight`, rectangular or `round`), placed anywhere in a room, with entities like windows.
- Per opening: *Ask first* (`confirm`, default on for doors and gates), an own question (`confirm_text`, default
  "Unlock?" / "Open?") and *Tap: only show details* (`tap: info`). Without the question a tap switches at once: the
  lock unlocks (or locks), a gate or electric window opens or closes, a moving one stops.
- Tilted windows: recognised from the state or an attribute (`zustand: gekippt`, `tilted`) – yellow window mark in the
  room, dashed yellow line at the window. Lock state from a contact attribute (`schloss: aufgeschlossen`) shows too.
  A raised shutter or blind no longer counts as an open window.

## 0.2.3 – 2026-10-26
- No wall (`open`): the outer wall stays whole where the open part meets it, also at slanted corners; the open part
  reaches right up to it.

## 0.2.2 – 2026-10-26
- Editor: own dialogs instead of the browser's prompt/confirm, which the Home Assistant app blocks – creating a new
  plan, levels and buildings now works there too.
- Rename a plan (name and id) with ✎ next to the plan list; a changed id replaces the old entry on saving.
- Wall thickness of inner and outer walls (plan settings, `style.wall_width` / `style.outer_width`).
- Rooms without a wall between them: opening type `open` and the tool *No wall*, which removes exactly the part of the
  wall two rooms share – both stay rooms of their own (open-plan kitchen and living room).

## 0.2.1 – 2026-10-26
- Main light: it fills the room and all other lights of the room glow as the seam along the walls; main light off and
  other lights on shows only the seam with a dark middle.

## 0.2.0 – 2026-10-26
- Drawing editor in the sidebar page: upload a background image per level (satellite view, scanned blueprint), set
  the scale from two points, move it, show it under or over the plan; draw rooms, outer walls, areas outside and helper
  lines with snapping to corners, edges, 45°/90° and a grid; click doors, windows, passages and garage doors onto
  walls; drag corners and labels, insert and delete corners; align the plan to a wall or to north; levels and
  buildings; colours; entities per room with suggestions; undo/redo; live preview.
- Main light per room (`hauptlicht`): while it is on, it alone colours the room; the other lights only count when it
  is off.
- White light reported as RGB (e.g. warm white from an RGBW controller) now counts as white instead of as a colour light.
- `hide_label` (plan setting or card option): entities with this label are ignored.

## 0.1.2 – 2026-10-26
- Levels can be aligned to each other: plan setting `align_levels` or card option `align: true` draws all levels in one
  frame, so an attic stays above the house when swiping between levels.

## 0.1.1 – 2026-10-26
- Icon and logo (shown in Home Assistant under Settings → Devices & services and in the README).

## 0.1.0 – 2026-10-26
- First version: integration with central storage of plans (buildings, levels, rooms, outer walls, helper lines,
  doors, windows, passages, garage doors, background image per level, colours, rotation), WebSocket API, the card
  `custom:floorplan-lite-card` (loaded automatically in every dashboard) and an editor page in the sidebar (import and
  export as JSON, preview).
- Look and behaviour of the card taken over from a proven self-made card: lights glow in their colour, presence and
  motion dots, temperature, window/shade/music chips, swipe between levels, TV remote and mouse operation.
