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
| **Light** | The room fills softly in the light colour (colour temperature or RGB), brightness = strength. The light shines slightly through the walls into neighbouring rooms. Coloured LEDs next to white light glow as a seam along the walls. With a **main light** per room (`hauptlicht`) only the main light fills the room and all other lights glow as the seam – main light off and others on: just the seam, the middle stays dark. White light reported as RGB (warm white from RGBW controllers) counts as white. Switches can be chosen as lights or main light by hand; lights and switches without a colour of their own glow in the room's *light colour* (warm white, neutral, cold, amber or a colour of your own). |
| **Presence** | a calmly breathing dot (blue-violet) |
| **Motion** | an aqua dot with ripples up to the walls |
| **Temperature** | from a `climate` entity (current temperature) or a sensor |
| **Chips** | window open, shade closed, music playing (as a small equaliser) |
| **Openings** | doors with their swing, windows, roof windows and domes, passages without a door, garage doors – with entities (contact, cover, lock, gate) an unlocked lock shows red; tap a window for its dialog, tap a door or gate to open/close/unlock it, with or without a confirmation; open ones show in red-orange, tilted windows (`tilted`/`gekippt`) dashed in yellow – the chip in the room's label too (open wins over tilted) |
| **Shades** | a roller shutter or blind per window, drawn on the outside of the wall: a bar for the closed part (`current_position`), blinds with a tilt as slats turned by `current_tilt_position` (along the wall when shut, across when open); moving shades pulse |
| **Short display** | after louder / quieter / play the room's label shows the volume for 3 s, after a scene was switched the scene's name (instead of the temperature) |
| **Background** | per level an image under the plan (e.g. a satellite view, so the garden stays a photo) or over it with transparency, or hidden |

Tap a room to open the [Bubble Card](https://github.com/Clooos/Bubble-Card) pop-up with the hash `#<room>`.
←/→ switch the level. Everything else over a room – ↑/↓, mouse wheel, right click (LG remote: yellow) once or twice,
media keys, the [TV Streamer](https://github.com/SebastianEitzert/TV-Streamer)'s colour and play keys, double / triple
tap – goes to a script (card option `script`, default `script.raum_klick`) with `raum` (the room's area), `aktion`
(`hoch`, `runter`, `lauter`, `leiser`, `gelb`, `play`, `pause`, `play_pause`, `stop`, `weiter`, `zurueck`,
`blau`, `gruen`, `rot`, `tipp2`, `tipp3`, and `…2` for a key pressed twice) and the room's `lichter` and `player`.
The script decides what happens.

The integration installs a blueprint for it: *Settings → Automations & scenes → Blueprints → **Floorplan Lite – keys,
clicks and wheel over a room** → Create script*, and save it as `script.raum_klick`. Per event you choose: next /
previous scene, light on/off, room off, music play / pause / stop, louder / quieter (only while music plays, or always),
next / previous track – or nothing; the same once more for every remote key pressed twice. Only keys with an action
for *twice* wait for the second press (adjustable, default 0.4 s), all others react at once. A room's scenes are those assigned to its area and those whose name starts with the
room's name; the cycle runs off → first scenes → the others → off, and a room without scenes switches its lights on and
off. Which lights and players: exactly the ones entered for the room in the floor plan (switches too); only when there
are none, the area's, limited by allow / block lists of integrations and labels. Names of the off scene, standard players per room and *modes* are settings: while a mode (night, cinema …) is on, its scenes come first – the topmost mode wins. With the TV Streamer, blue and green are also used by the streamer itself and red opens Moonlight's menu; the blueprint says so at those keys. Without a
script, play / pause go straight to the room's media players.

## Installation

1. **HACS** → ⋮ → *Custom repositories* → `https://github.com/SebastianEitzert/HA-FloorplanLite`, type *Integration* →
   download **Floorplan Lite** → restart Home Assistant.
2. *Settings → Devices & services → Add integration → Floorplan Lite*. The page **Floorplan Lite** appears in the
   sidebar (administrators only).
3. Create a plan on that page – order: outer walls, inner walls, then rooms (*Generate room* fills the area up to the
   walls with one click, *Draw room* freely with snapping, *Split room* cuts a room in two). As a template: upload a satellite image, a photo or scan of your old paper blueprint or a PDF as the
   background (straighten a crooked scan with two points), set the scale
   with two points of known distance, then trace rooms, outer walls and areas outside and click doors and windows onto
   the walls. Points snap to corners, edges, 45°/90° and a 5 cm grid (Shift: free angle). Enter the entities per room
   in the side panel. Rooms without a wall between them (open plan): tool *No wall*, then click the wall they share.
   A level can be copied with everything on it as the start of the next one. Wall thickness and the plan's name (✎ next to the plan list) are in the side panel. Ctrl+Z/Y undo/redo, Ctrl+S saves.
   Choose a Home Assistant area for each room: name, id and the entities found there are filled in (or taken live
   from the area every time). *Create pop-up YAML* builds a Bubble Card pop-up (`#room`) per room – to copy, or added
   to a dashboard directly.
4. Add the card to a dashboard – with the visual card editor, or in YAML:

```yaml
type: custom:floorplan-lite-card
plan: home            # plan id
mode: swipe           # one level large, swipe / tabs / arrows; without: all levels side by side
start: eg             # first level in swipe mode
floors: [eg, og]      # optional: only these levels
background: false     # optional: hide the background images
align: true           # optional: all levels in one frame – the attic stays above the house when swiping
tap: none             # optional: no pop-up on tap
hide_label: [no_dboard] # optional: ignore entities with these labels (default: the plan's setting)
script: script.raum_klick # optional: the script for keys, clicks and the wheel over a room
scroll_keys: true    # optional: ↑/↓ scroll the page (default: no – the wheel does; for remotes without a wheel)
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
| `hide_labels` | entities with one of these labels are ignored (e.g. a label you already use to keep entities off dashboards) |
| `style` | colours: `background`, `floor` (two colours of the gradient), `wall`, `edge`, `text`; wall thickness in metres: `wall_width` (inner, 0.2), `outer_width` (0.5) |
| `buildings` | `[{id, name}]` – e.g. house, barn, garage |
| `levels` | `[{id, name, short, view?, background?}]` – `background`: `{image, x, y, width, height?, rotation, opacity, mode: under/over/hidden}` |
| `outlines` | outer walls per level and building: `{level, building, poly}` |
| `walls` | inner walls (centre line): `{level, poly, width?, closed?}` – `width` in metres, otherwise `style.wall_width` |
| `room_walls` | `true` (default of older plans): rooms draw walls along their edges; new plans: `false`, the walls come from `outlines` and `walls` |
| `rooms` | `{id, level, poly, name, key?, building?, label_at?, small?, outdoor?, color?, area?, area_live?}` – `name: null` = part of another room; `outdoor` for areas outside (garden, terrace, yard) |
| `lines` | dashed helper lines (canopy, terrace): `{level, poly, open?}` |
| `openings` | `{level, type: door/window/passage/garage/open/skylight, at, angle, width, depth?, flip?, round?, entities?, confirm?, confirm_text?, tap?}` – cut into the walls; `open` = no wall at all between two rooms (open-plan kitchen and living room) |
| `entities` | entities per room key (as in the card's `rooms`) |

## Development

```sh
pip install -r requirements_test.txt
pytest
```

## License

[GPL-3.0](LICENSE)
