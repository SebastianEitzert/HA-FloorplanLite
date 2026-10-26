# Changelog

All notable changes to this project. Versions follow the `version` in `custom_components/floorplan_lite/manifest.json`.

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
