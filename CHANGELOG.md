# Changelog

All notable changes to this project. Versions follow the `version` in `custom_components/floorplan_lite/manifest.json`.

## Unreleased
- All keys, clicks, wheel steps and taps over a room go to a script (card option `script`, default
  `script.raum_klick`) as `{raum, aktion, lichter, player}` – the card itself only opens the pop-up and changes the
  level. New event names: `gelb` / `gelb2` (right click or yellow once / twice), `tipp2` / `tipp3`, `play_pause`,
  `stop`, `weiter`, `zurueck`, `blau`, `gruen`, `rot`. `raum` is the room's area when it has one.
- Script blueprint *Floorplan Lite – keys, clicks and wheel over a room*, installed with the integration: what each event
  does is a setting; scenes of a room by area or name (no fixed names), rooms without scenes switch their lights on and
  off, louder / quieter only while music plays (or always), standard players per room, modes in priority order
  (night, cinema … – their scenes come first while on), play twice = next track (`play2`). Older cards
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
