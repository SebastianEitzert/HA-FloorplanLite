<p align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/dark_logo.png"><img src="docs/images/logo.png" alt="Floorplan Lite" width="460"></picture></p>

# Floorplan Lite for Home Assistant

🇩🇪 [Deutsche Fassung](README.de.md)

<p align="center"><a href="https://buymeacoffee.com/SebastianEitzert"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=SebastianEitzert&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" height="45"></a></p>

A floor plan for your dashboards that is **light on CPU and GPU** and still looks good: rooms fill softly in the colour of
their lights, presence and motion show as calm dots and ripples, temperature, open windows, closed shades and playing
music appear right in the room. It runs smoothly on old tablets, TV browsers and software-rendered streams
(e.g. [TV Streamer](https://github.com/SebastianEitzert/TV-Streamer)) – plain SVG and CSS, no WebGL, no framework.

| Part | Status |
|---|---|
| Integration: central storage of plans (buildings, levels, rooms, walls, doors, windows, passages, garage doors, background images, colours, rotation), WebSocket API | **0.1** |
| Card `custom:floorplan-lite-card` – loaded automatically in every dashboard | **0.1** |
| Editor page in the sidebar – import/export as JSON, preview | **0.1** |
| Drawing editor: upload a satellite image or an old blueprint, set the scale, trace rooms and walls, place doors/windows, align to a wall or to north, colours, entities per room | **0.2** |
| Import: PDF, SVG, Sweet Home 3D (`.sh3d`), DXF | planned (0.3) |

## What the card shows

| | |
|---|---|
| **Light** | The room fills softly in the light colour (colour temperature or RGB), brightness = strength. The light shines slightly through the walls into neighbouring rooms. Coloured LEDs next to white light glow as a seam along the walls. With a **main light** per room (`hauptlicht`) only the main light fills the room and all other lights glow as the seam – main light off and others on: just the seam, the middle stays dark. White light reported as RGB (warm white from RGBW controllers) counts as white. |
| **Presence** | a calmly breathing dot (blue-violet) |
| **Motion** | an aqua dot with ripples up to the walls |
| **Temperature** | from a `climate` entity (current temperature) or a sensor |
| **Chips** | window open, shade closed, music playing (as a small equaliser) |
| **Openings** | doors with their swing, windows, passages without a door, garage doors |
| **Background** | per level an image under the plan (e.g. a satellite view, so the garden stays a photo) or over it with transparency, or hidden |

Tap a room to open the [Bubble Card](https://github.com/Clooos/Bubble-Card) pop-up with the hash `#<room>`.
With a mouse or a TV remote (e.g. through Moonlight): right click (LG remote: yellow) once over a room = music
start/pause, twice = room off, mouse wheel = music louder/quieter, ↑/↓ over a room = light scenes – these call a script
`script.raum_klick` with `raum`, `aktion`/`klicks` (optional; without the script nothing happens). ←/→ switch the level.

## Installation

1. **HACS** → ⋮ → *Custom repositories* → `https://github.com/SebastianEitzert/HA-FloorplanLite`, type *Integration* →
   download **Floorplan Lite** → restart Home Assistant.
2. *Settings → Devices & services → Add integration → Floorplan Lite*. The page **Floorplan Lite** appears in the
   sidebar (administrators only).
3. Create a plan on that page: upload a satellite image or a scan of your blueprint as the background, set the scale
   with two points of known distance, then trace rooms, outer walls and areas outside and click doors and windows onto
   the walls. Points snap to corners, edges, 45°/90° and a 5 cm grid (Shift: free angle). Enter the entities per room
   in the side panel. Rooms without a wall between them (open plan): tool *No wall*, then click the wall they share.
   Wall thickness and the plan's name (✎ next to the plan list) are in the side panel. Ctrl+Z/Y undo/redo, Ctrl+S saves.
4. Add the card to a dashboard:

```yaml
type: custom:floorplan-lite-card
plan: home            # plan id
mode: swipe           # one level large, swipe / tabs / arrows; without: all levels side by side
start: eg             # first level in swipe mode
floors: [eg, og]      # optional: only these levels
background: false     # optional: hide the background images
align: true           # optional: all levels in one frame – the attic stays above the house when swiping
tap: none             # optional: no pop-up on tap
hide_label: no_dboard # optional: ignore entities with this label (default: the plan's setting)
intro: false          # optional: no build-up animation
rooms:                # optional: entities per room – override the ones stored with the plan
  kitchen:
    licht: [light.kitchen_ceiling, light.kitchen_strip]
    hauptlicht: light.kitchen_ceiling   # optional: fills the room, the other lights only as a seam
    praesenz: [binary_sensor.kitchen_presence]
    bewegung: [binary_sensor.kitchen_motion]
    temp: climate.kitchen
    fenster: [binary_sensor.kitchen_window]
    beschattung: [cover.kitchen_blinds]
    musik: [media_player.kitchen]
```

## Plan format

Coordinates are in metres; `y` points down. A plan has:

| Key | Content |
|---|---|
| `id`, `name` | id (`a-z0-9_`) and name |
| `rotation` | turns the whole plan on screen (degrees); `north` gives the direction of north |
| `align_levels` | `true`: all levels share one frame, so upper levels are drawn above the lower ones (card option `align`) |
| `hide_label` | entities with this label are ignored (e.g. a label you already use to keep entities off dashboards) |
| `style` | colours: `background`, `floor` (two colours of the gradient), `wall`, `edge`, `text`; wall thickness in metres: `wall_width` (inner, 0.2), `outer_width` (0.5) |
| `buildings` | `[{id, name}]` – e.g. house, barn, garage |
| `levels` | `[{id, name, short, view?, background?}]` – `background`: `{image, x, y, width, height?, rotation, opacity, mode: under/over/hidden}` |
| `outlines` | outer walls per level and building: `{level, building, poly}` |
| `rooms` | `{id, level, poly, name, key?, building?, label_at?, small?, outdoor?, color?}` – `name: null` = part of another room; `outdoor` for areas outside (garden, terrace, yard) |
| `lines` | dashed helper lines (canopy, terrace): `{level, poly, open?}` |
| `openings` | `{level, type: door/window/passage/garage/open, at, angle, width, depth?, flip?}` – cut into the walls; `open` = no wall at all between two rooms (open-plan kitchen and living room) |
| `entities` | entities per room key (as in the card's `rooms`) |

## Development

```sh
pip install -r requirements_test.txt
pytest
```

## License

[GPL-3.0](LICENSE)
