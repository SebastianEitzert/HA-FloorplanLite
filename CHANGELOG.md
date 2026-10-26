# Changelog

All notable changes to this project. Versions follow the `version` in `custom_components/floorplan_lite/manifest.json`.

## Unreleased
- Background from a PDF: the editor turns a page of the PDF (choose which, for multi-page plans) into an image, sharp
  enough for tracing an old blueprint. pdf.js (Apache-2.0) ships with the integration and only loads when a PDF is chosen.
- Tool *Straighten background*: two points on a wall of a crooked scan or photo of a paper plan – only the image turns
  until that line is exactly horizontal or vertical.
- *Copy level*: copies outer walls, rooms, doors, windows and helper lines to a new level, so levels that build on each
  other need not be drawn again. Copied rooms get ids of their own without entities.

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
