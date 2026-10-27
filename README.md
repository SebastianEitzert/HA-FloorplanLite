<p align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/SebastianEitzert/HA-FloorplanLite/main/docs/images/dark_logo.png"><img src="https://raw.githubusercontent.com/SebastianEitzert/HA-FloorplanLite/main/docs/images/logo.png" alt="Floorplan Lite" width="460"></picture></p>

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
| **Light** | The room fills softly in the light colour (colour temperature or RGB), brightness = strength. The light shines slightly through the walls into neighbouring rooms. Coloured LEDs next to white light glow as a seam along the walls. With a **main light** per room (`main_light`) only the main light fills the room and all other lights glow as the seam – main light off and others on: just the seam, the middle stays dark. White light reported as RGB (warm white from RGBW controllers) counts as white. Switches can be chosen as lights or main light by hand; lights and switches without a colour of their own glow in the room's *light colour* (warm white, neutral, cold, amber or a colour of your own). |
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
tap – goes to a script (card option `script`, default `script.raum_klick`) with `room` (the room's area), `event`
(`up`, `down`, `wheel_up`, `wheel_down`, `yellow`, `play`, `pause`, `play_pause`, `stop`, `next`, `previous`,
`blue`, `green`, `red`, `double_tap`, `triple_tap`, and `…_twice` for a key pressed twice) and the room's `lights` and `players`.
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
    light: [light.kitchen_ceiling, light.kitchen_strip]
    main_light: light.kitchen_ceiling   # optional: fills the room, the other lights only as a seam
    presence: [binary_sensor.kitchen_presence]
    motion: [binary_sensor.kitchen_motion]
    temp: climate.kitchen
    windows: [binary_sensor.kitchen_window]
    shades: [cover.kitchen_blinds]
    music: [media_player.kitchen]
```

### Card options – complete reference

| Option | Values (default) | Effect / depends on |
|---|---|---|
| `plan` | plan or site id | the stored plan; a site switches the card to site mode (see *Site*) |
| `mode` | `swipe` / – (all levels side by side) | `swipe`: one level large, change with swipe, tabs, ←/→ |
| `start` | level id (first level) | first level in `swipe`; in a site: `site`, `<plan>`, `<plan>:<level>` or a room |
| `floors` | list of level ids (all) | only these levels, in this order |
| `building` | building part id | only this building part of the plan (the plan's `buildings`) |
| `background` | `false` (shown) | hides all background images |
| `align` | `true` / `false` (plan's `align_levels`) | all levels in one frame – upper levels stay above the lower ones when swiping |
| `orientation` | `axis` / `north` (plan / site setting) | `north` turns plan or building views so north is up; `axis` keeps the drawing's own axis |
| `compass` | `false` (shown) | hides the compass rose |
| `other_floors` | `true` (`false`) | outer walls of the other levels as faint dashed helper lines – e.g. the attic shows where the ground floor ends; with `align: true` all levels share one frame so the lines are fully in view |
| `tap` | `none` (pop-up + script) | `none`: no pop-up on tap and no events to the script |
| `script` | script entity (`script.raum_klick`) | receives keys, clicks, wheel and taps over a room (see *Script blueprint*) |
| `scroll_keys` | `true` (`false`) | ↑/↓ also scroll the page – only for remotes without a wheel |
| `hide_label` | list of labels (plan's `hide_labels`) | entities with one of these labels are ignored everywhere in the card |
| `intro` | `false` (on) | no build-up animation (also off with „reduce motion“) |
| `rooms` | `{<room key>: {…}}` | entities per room, override the ones stored in the plan – keys in the next table |
| `site` | object | a site written into the card (wins over a stored one); also `site.show` |
| `site_title` | text | title of the site level |
| `follow`, `follow_floor`, `follow_hold`, `neighbour_margin`, `buttons`, `off_buttons`, `music_off`, `off_with_outside` | | site options, see *Site* |
| `plan_data` / `plans_data` | plan JSON | a plan (or plans by id) inline instead of the stored ones – for tests and sharing |

**Entities per room** (`rooms.<key>` in the card, or in the editor's side panel – the same keys):

| Key | Entities | Shown as / used for |
|---|---|---|
| `light` | lights, switches (list) | light fill and seam; script „light on/off“ and scenes' „room on“ |
| `main_light` | one light or switch | fills the room alone, the others only glow as the seam |
| `light_colour` | `warm`, `neutral`, `cold`, `amber`, `red`, `green`, `blue`, `purple` or `#rrggbb` | colour for lights / switches without a colour of their own |
| `presence` | binary_sensors | breathing dot |
| `motion` | binary_sensors | dot with ripples |
| `temp` | climate or sensor | temperature in the label |
| `windows` | binary_sensors / covers | „window open“ chip (tilted dashed) |
| `shades` | covers | „shade closed“ chip |
| `music` | media_players | equaliser chip; script music actions and volume; „off“ buttons |

Without entities a room with an `area` (and `area_live`) takes them from its Home Assistant area. Entities with a
label from `hide_label` never count.

### Recommended: Kiosk Mode for TVs and wall panels

For a TV (e.g. through the [TV Streamer](https://github.com/SebastianEitzert/TV-Streamer)) or a wall tablet, hide Home
Assistant's header and sidebar with [Kiosk Mode](https://github.com/NemesisRE/kiosk-mode) (HACS → Frontend → *Kiosk
Mode*). Set it per user in the dashboard's raw configuration (⋮ → *Edit dashboard* → ⋮ → *Raw configuration editor*),
at the top level next to `views:` – here only for the user the TV logs in with, everyone else keeps the normal view:

```yaml
kiosk_mode:
  user_settings:
    - users: [tv]          # Home Assistant user name(s), lower case
      kiosk: true          # hides header and sidebar
views:
  - ...
```

To edit the dashboard as that user anyway, add `?disable_km` to the address. Without a separate user,
`?kiosk` in the address of the dashboard switches it on for that device only.

## Floor plan editor

The page **Floorplan Lite** in the sidebar (administrators only). At the top: the plan list, **+** new floor plan,
**⌂+** new site, ✎ rename (the id is what cards use: `plan: …`), undo / redo, preview (the real card next to the
editor), JSON import / export, delete and save (Ctrl+S).

**Tools** (left bar):

| Tool | What it does |
|---|---|
| Select / edit | click an element; drag corners; double-click an edge adds a corner; right-click a corner deletes it; Del deletes the element |
| Outer wall | draw the building outline – the drawn line can be the outside face, the centre or the inside face of the wall |
| Inner wall | centre line of inner walls; points snap to wall corners and walls |
| Generate room | click into an area enclosed by walls – the room fills it |
| Draw room / Split room | draw freely with snapping / a line from edge to edge cuts a room in two |
| Area outside | garden, terrace, yard – drawn like a room, shown without walls |
| Helper line | dashed lines (canopy, terrace edge) |
| Stair | draw the **walking line** from the bottom step (dot) to the top one (arrow), a point at every turn; turns are wound with the *radius* (distance of the walking line from the turning point – e.g. 0.6 for a 1.00 m run around a 20 cm core, 0 = landing corner), the steps fan out there – *square* (default: straight strings, the steps lie as in the round form) or *round*. Side panel: width, risers, radius, shape, *leads to* (default: the next level, where it shows dashed); walking line length and going are shown. Points snap like all lines (corners, edges, 45°/90° to the previous point, grid) and to the middle of a run (half the stair width from the walls) |
| Door, window, passage, garage door | click onto a wall; width, swing (mirror), entities and confirmation in the side panel |
| Skylight / dome | free inside a room, square or round |
| No wall | click the wall between two rooms – it disappears, both stay rooms (open plan) |
| Background: move, scale, straighten | move the image; two points of known distance set the scale; two points on a wall of the image turn only the image straight |
| Align to a wall | turns the whole plan so the clicked wall is horizontal |

Drawing: click sets points, click on the first point or Enter closes, Backspace removes the last point, Esc cancels,
Shift = free angle. Points snap to corners, edges, 45°/90° and a 5 cm grid; *Grid*, *Show level below* and
*Show dimensions* can be switched on.

**Side panel:** with nothing selected the plan settings – name, wall thickness, colours, north (degrees) and „Align
to north“, labels whose entities are ignored, levels (add, rename, reorder, **copy level** with everything on it),
building parts, background image per level (image or PDF – PDFs are converted, multi-page ones ask for the page –,
opacity, under / over / hidden). With a room selected: **Home Assistant area** (fills name, id and the entities found
there, or „live from the area“ so new devices appear by themselves), the entities per role (light, main light,
presence, motion, temperature, windows, shades, music), light colour for lights without one of their own, small label,
colour. *Fill all rooms with area* does it for every room. **Create pop-up YAML** builds a Bubble Card pop-up per room
(dynamic with auto-entities or simple tiles) – to copy, or written into a dashboard view directly.

**Site editor** (a plan made with ⌂+): the tools are icons in the bar on the left (hover for their names), the drawing
area shows all buildings, the lists are in the side panel. *Edit areas outside* shows the corners of all areas to drag
(buildings stay put); *Edit* next to an area in the list does the same.

- *Move*: drag a building; Shift+wheel turns, Alt+wheel scales; wheel zooms, dragging the empty area pans.
- *Corner to corner*: click a corner of the building to move, then a corner of another building, enter the offset in
  metres (0 / 0 = flush). With „keep as measure line“ (default) the line stays: one line fixes the position, two lines
  the turn too; moving the other building takes it along. Fixed buildings can't be dragged – click a measure line to
  release it.
- *Move background* (drag; Shift+wheel turns, Alt+wheel scales around the pointer) and *Turn background* (two points on
  a line of the image, e.g. a boundary, then its direction: 0 = horizontal, 90 = vertical).
- *Background (image/PDF)* + *Background scale* (two points and the real length) + *Align to background* (two corners of
  a building onto two points of a site plan, optionally scaling) – placing to a shared site plan.
- *Show dimensions* (ruler): edge lengths of buildings and areas outside; remembered per browser.
- *Draw area outside*: shared areas (yard, garden) with HA area and entities. Points snap to corners and edges of
  buildings and other areas, else 45° steps and a 0.25 m grid (Shift: free). Drag an area's corners to edit it (same
  snapping); double-click an edge adds a corner, double-click a corner removes it.
- *Appearance*: north in the site view (degrees, 0 = up, clockwise), building views along their own axis or north up,
  5 m grid, background settings. Drag a building's name to move its badge, double-click resets it.

## Script blueprint (keys, clicks, wheel)

The card sends every key, click, wheel step and tap over a room to a script as `room` (area), `event`, `lights` and
`players`. The integration installs a blueprint for it (updated with every release):

1. *Settings → Automations & scenes → Blueprints → **Floorplan Lite – keys, clicks and wheel over a room** → Create
   script*.
2. Save it as **`script.raum_klick`** (or set the card option `script:` to your script).
3. Change the settings later in the script; with a new version of the integration the script follows the blueprint.

**All settings** – every key / click event takes one action: `nothing`, `scene_next`, `scene_previous`,
`light_toggle` (first scene / off), `light_on` (first scene), `light_off`, `room_off` (lights off, music stop),
`music_play`, `music_pause`, `music_toggle`, `music_stop`, `volume_up`, `volume_down`, `next_track`, `previous_track`.
„Next scene“ in a room without scenes = light on/off.

| Setting | Default | Meaning |
|---|---|---|
| `up` / `down` | next / previous scene | ↑ / ↓ – keyboard arrows, TV remote D-pad (pointer over a room) |
| `wheel_up` / `wheel_down` | louder / quieter | mouse wheel, Magic Remote wheel |
| `yellow` | nothing | right click, LG yellow key |
| `play`, `pause`, `play_pause`, `stop` | play, pause, play/pause, stop | media keys of the TV remote / PC keyboard |
| `next`, `previous` | next / previous track | PC keyboard track keys |
| `blue`, `green`, `red` | nothing | LG colour keys through the TV Streamer – blue is also the streamer's reload, green its own function, red Moonlight's menu |
| `double_tap`, `triple_tap` | light on/off, room off | double / triple tap on a touch screen |
| `double_ms` | 400 ms | waiting time for a second press – only for keys whose `…_twice` is not `nothing` |
| `up_twice` … `red_twice` | `yellow_twice` room off, `play_twice` next track, others nothing | the same key pressed twice; a key with an action here runs its single action only after the waiting time |
| `volume_mode` | only while playing | louder / quieter only change players that play, or always |
| `standard_players` | `{}` | `{area: [media_player…]}` – play starts these when nothing plays (without: all players of the room) |
| `players_plan_always` | on | players entered in the floor plan always count; off = the lists below filter them too |
| `players_allow_integrations` / `_labels` | empty | not empty: only players of these integrations (domain, e.g. `loxone`, `sonos`) / labels count |
| `players_block_integrations` / `_labels` | empty | these never count – block wins over allow |
| `scenes_by_name` | on | scenes whose name starts with the room's name („Kitchen Evening“) belong to the room, besides those assigned to its area |
| `room_names` | `{}` | `{area: name}` when the scenes use another name than the area, e.g. `kids_room_1: Kid 1` |
| `off_names` | `Off`, `Aus` | a scene with this name (after the room's name) is „off“; without one the lights are switched off |
| `first_names` | empty | these scenes come first in the cycle, in this order |
| `modes` | empty | list of `{entity, state (on), scenes}` – while the entity has that state its scenes come right after off; topmost mode first |
| `lights_plan_always` | on | lights entered in the floor plan always count; off = the lists below filter them too |
| `lights_allow_integrations` / `_labels` | empty | not empty: only area lights of these integrations (`loxone`, `shelly`, `hue`, `template`, `group` …) / labels count – switches of the area count when they carry an allowed label |
| `lights_block_integrations` / `_labels` | empty | these never switch and never keep the room „on“ (e.g. status LEDs) |

**Fields the card sends:** `room` (area id), `event` (event name, `…_twice` for twice, or `config` – the script answers
which keys use twice and `double_ms`, the card asks at most once a minute), `lights` and `players` (the room's entities
from the plan; empty = the script uses the area's, filtered). Mode `parallel`, at most 10 at once.

**Dependencies:** scenes are needed for the scene actions (otherwise light on/off); `off_names` / `first_names` /
`modes` only order scenes; the allow / block lists only matter for rooms without entities in the plan unless
`…_plan_always` is off; `double_ms` only delays keys with a twice action; colour keys only exist with the TV Streamer.

**Which lights?** Exactly the ones entered for the room in the editor (light, main light – switches too). Only a room
with none there uses its area's lights, filtered by the lists. Scenes switch whatever they contain. A room without
scenes simply switches its lights on and off. The scene cycle: off → first scenes → the others (alphabetical) → off.
The script runs once per event (mode *parallel*); no automation is needed.

## Site: several buildings in one card

A **site** is set up in the floor plan editor: ⌂+ („New site“) at the top. Its buildings are your other floor plans –
drag them into place (Shift+wheel turns, Alt+wheel scales, overlap warning), and draw shared areas outside (yard,
garden) that you link to a Home Assistant area with their entities. The card then only needs `plan: <site id>`; what
belongs to the dashboard – start view, users, buttons, off button, „show only these buildings“ – is set in the card's
visual editor. (`buildings` inside a single floor plan are *building parts* of one drawing, e.g. barn and garage.)

```yaml
type: custom:floorplan-lite-card
plan: property          # a site from the floor plan editor
```

The site can also be written into the card (`site:`), with the same keys the editor stores:

```yaml
type: custom:floorplan-lite-card
site:
  buildings:
    - plan: home            # plan id
      name: House
      site_floor: eg        # level shown on the site (default: the lowest)
      x: 0                  # position on the site in metres (without x/y: automatically side by side)
      y: 0
      rotation: 0
      scale: 1
      building: house       # optional: only this building of the plan (its `buildings`)
    - plan: ranch
      name: Ranch
  areas:                    # shared areas outside, polygon in site coordinates
    - id: front_yard        # Home Assistant area id = pop-up #front_yard
      name: Front yard
      poly: [[14, -2], [37, -2], [37, 12], [14, 12]]
      light: [light.yard]   # same fields as rooms: light, main_light, music, presence, motion, windows, shades, temp
  show: [ranch]             # optional: only these buildings – one = that building alone, without the site level
  raster: true              # optional: 5 m grid in the site view (for placing)
  site_background: {image: /local/site.jpg, x: -10, y: -10, width: 120, opacity: 0.6}
start: site          # start view: site, <plan>, <plan>:<level> or a room
follow:                     # per Home Assistant user (name or id)
  Sebastian: {type: location, geofence: person.sebastian, ble: [sensor.phone_area], ble_last: [sensor.phone_area_last_seen], max_age: 30}
  TV: {type: fixed, template: "{{ 'living_room' if device == 'living_room' else 'bedroom' }}"}
follow_floor: true          # following also changes the level (false: only the building)
follow_hold: 120            # no jumps for 120 s after own navigation
neighbour_margin: 0.15          # margin around a building in which areas outside are shown (15 %)
off_buttons: {site: true, home: all, ranch: false}   # off buttons – values and examples below
music_off: pause            # pause | stop | off
off_with_outside: false       # „building off“ includes the areas outside
buttons:                    # own buttons top left, per level, with the standard HA actions
  site:
    - {icon: mdi:flash, name: Energy, tap_action: {action: navigate, navigation_path: /energy}}
  home:
    - {icon: mdi:cctv, name: Cameras, tap_action: {action: navigate, navigation_path: "#cameras"}}
```

**Site keys** (stored by the site editor, or in the card's `site:`; the editor stores the German names – `licht`, `ausrichtung` … –, both work):

| Key | Values (default) | Effect |
|---|---|---|
| `buildings[].plan` | plan id | the floor plan placed as building |
| `buildings[].name` | text (plan name) | name in the bar and on the badge |
| `buildings[].site_floor` | level id (lowest) | the level drawn on the site |
| `buildings[].building` | building part id | only this part of the plan |
| `buildings[].x`, `y`, `rotation`, `scale` | metres, degrees, factor (side by side, 0, 1) | position on the site; set by dragging, measure lines or alignment |
| `buildings[].label_at` | `[x, y]` (middle) | where the badge sits – drag the name in the editor |
| `areas[]` | `{id, name, area, poly, light, main_light, music, presence, motion, windows, shades, temp, area_live}` | shared areas outside, work like rooms |
| `links[]` | `{plan, at, to, to_at, dx, dy}` | measure lines: corner `at` of `plan` sits at corner `to_at` of `to` + offset; 1 line = position, 2 = also turn |
| `north` | degrees (0 = up) | north in the site view; building views get theirs from it and their rotation |
| `orientation` | `axis` / `north` (`axis`) | building views along their own axis or north up (card option overrides) |
| `raster` | `true` (`false`) | 5 m grid in the site view |
| `site_background` | `{image, x, y, width, height, rotation, opacity, mode}` | background of the site (shared site plan) |
| `show` | list of plan ids (all) | only these buildings; one = that building alone without the site level |

- **Three levels:** site → building → level. The bar at the top switches between the site and the buildings, the tabs
  below between the building's levels. Tapping a building on the site zooms into its last level; out with
  „⤢ Site“, two fingers together, Ctrl+wheel or Back (the view is in the address, `#plan=home&floor=og`). TV remote:
  ↑/↓ zoom in / out while the pointer is not over a room (over a room they stay the light scenes), ←/→ change the level.
- **Site view:** every building on its `site_floor` with light, presence and motion, above each building a summary
  (lights on, windows open, music). Areas outside are shown completely; in a building's view the part next to it
  (within `neighbour_margin`) – they work exactly like rooms (pop-up, script, wheel, keys).
- **Start view:** the address wins (`?room=<room>` or `?view=<plan>[:<level>]` / `?view=site`, also as
  `#room=…`), then the user's `follow` entry, then `start`. *location*: geofence not at home → site; otherwise the
  newest Bluetooth area (e.g. Bermuda), else the last one if it is at most `max_age` minutes old; „You are here“ marks
  the room. *fixed*: a fixed view or room, or a template returning one (variables `user`, `device`); `device` is the
  TV Streamer's name (from 0.4.7) or set once with `?device=<name>`. Rooms and areas are found by room id, HA area id
  or area name.
- **Off** (top right): „All off“ on the site, „<building> off“ in a building – lights and music of the rooms entered in
  the card that are on or playing; press twice within 3 s, a short note tells how many devices were switched.
- **Only one building:** `site.show: [ranch]` shows that building alone (with the shared areas next to it). Within a
  single plan with several `buildings`, the card option `building: <id>` shows only that building.
- The visual card editor offers the users (with a live preview of the template), **own buttons** (level, icon, name,
  tap action) and the **off button per level** as switches, and all card options above.
- **Own button that opens a pop-up or a dashboard** – in the card editor *+ Button*, choose level and icon, tap action
  *Navigate* with the path `#cameras` (a Bubble Card pop-up with that hash) or `/dashboard-tv/cameras` (a dashboard view).
  In YAML:

```yaml
buttons:
  site:
    - {icon: mdi:cctv, name: Cameras, tap_action: {action: navigate, navigation_path: "#cameras"}}
    - {icon: mdi:flash, name: Energy, tap_action: {action: navigate, navigation_path: /energy}}
  ranch:
    - {icon: mdi:horse, tap_action: {action: more-info, entity: sensor.stable_temperature}}
off_buttons:              # off buttons (top right) – key: site, <plan id> (building) or <plan id>:<level> (one floor, wins)
  site: true                # site view: „All off“ (true = default, false = none)
  ranch: false              # no off button in the ranch
  home: all                # house: „House off“ + „House EG off“ + „House OG off“ + … (one per floor)
  home:dg: false            # but none at all in the attic view
```

| Value | Buttons in a building view |
|---|---|
| `true` / not set | „<building> off“ – the whole building |
| `floor` | „<building> OG off“ – only the rooms of the floor shown |
| `both` | „<building> off“ + „<building> OG off“ (the floor shown) |
| `all` | „<building> off“ + one button per floor („EG off“, „OG off“ …), on every floor |
| `false` | none |

Every off button needs two presses within 3 s; it switches off the lights (lights, switches) and stops the music
(`music_off`) of the rooms entered in the plan that are on or playing; areas outside only with `off_with_outside: true`.
In the card editor: *Off button per level*, a choice per building.

## Plan format

Coordinates are in metres; `y` points down. A plan has:

| Key | Content |
|---|---|
| `id`, `name` | id (`a-z0-9_`) and name |
| `rotation` | turns the whole plan on screen (degrees); `north` gives the direction of north |
| `align_levels` | `true`: all levels share one frame, so upper levels are drawn above the lower ones (card option `align`) |
| `hide_labels` | entities with one of these labels are ignored (e.g. a label you already use to keep entities off dashboards) |
| `style` | colours: `background`, `floor` (two colours of the gradient), `wall`, `edge`, `text`; wall thickness in metres: `wall_width` (inner, 0.2), `outer_width` (0.5) |
| `site` | a site instead of levels – all keys in *Site keys* above |
| `buildings` | building parts `[{id, name}]` – e.g. barn and garage in one drawing; outer walls and rooms carry their `building` – the card option `building: <id>` shows only that one |
| `levels` | `[{id, name, short, view?, background?}]` – `background`: `{image, x, y, width, height?, rotation, opacity, mode: under/over/hidden}` |
| `outlines` | outer walls per level and building: `{level, building, poly}` |
| `walls` | inner walls (centre line): `{level, poly, width?, closed?}` – `width` in metres, otherwise `style.wall_width` |
| `room_walls` | `true` (default of older plans): rooms draw walls along their edges; new plans: `false`, the walls come from `outlines` and `walls` |
| `rooms` | `{id, level, poly, name, key?, building?, label_at?, small?, outdoor?, color?, area?, area_live?}` – `name: null` = part of another room; `outdoor` for areas outside (garden, terrace, yard) |
| `lines` | dashed helper lines (canopy, terrace): `{level, poly, open?}` |
| `stairs` | `{level, poly (walking line, bottom → top), width (1), steps (16), radius? (width × 0.6), form? (eckig / rund), to_level?, building?}` |
| `openings` | `{level, type: door/window/passage/garage/open/skylight, at, angle, width, depth?, flip?, round?, entities?, confirm?, confirm_text?, tap?}` – cut into the walls; `open` = no wall at all between two rooms (open-plan kitchen and living room) |
| `entities` | entities per room key (as in the card's `rooms`) |

## English and German names

Every option can be written in English or in German – both work, also mixed; the card editor keeps the language your
YAML uses (new cards: German). The script blueprint uses English only.

| English | German | | English | German |
|---|---|---|---|---|
| `off_buttons` | `aus_schalter` | | `light` | `licht` |
| `music_off` | `musik_aus` | | `main_light` | `hauptlicht` |
| `off_with_outside` | `aus_mit_aussen` | | `presence` | `praesenz` |
| `orientation` | `ausrichtung` | | `motion` | `bewegung` |
| `compass` | `kompass` | | `temperature` | `temp` |
| `other_floors` | `andere_geschosse` | | `windows` | `fenster` |
| `neighbour_margin` | `nachbar_rand` | | `shades` | `beschattung` |
| `follow.<user>.type` | `art` | | `music` | `musik` |
| `template` | `vorlage` | | `light_colour` | `lichtfarbe` |
| `view` | `ansicht` | | values `location` / `fixed` | `standort` / `fest` |
| `room` | `raum` | | `floor` / `both` / `all` | `stockwerk` / `beide` / `alle` |
| `ble_last` | `ble_letzter` | | `axis` / `north` | `achse` / `norden` |
| `max_age` | `max_alter` | | `site` (start view) | `grundstueck` |
| template variables `user`, `device` | `benutzer`, `geraet` | | address `?room=`, `?view=`, `?device=` | `?raum=`, `?ansicht=`, `?geraet=` |

## Troubleshooting

| Problem | Solution |
|---|---|
| **„Configuration error“ on all Floorplan cards** (often in the Companion app after an update) | the app still has the old frontend: pull down to reload; if that doesn't help *Settings → Companion app → Troubleshooting → Reset frontend cache* and restart the app. In a browser: reload with Ctrl+Shift+R |
| Editor or card looks like the old version after an update | restart Home Assistant after the HACS update, then reload the page (as above) |
| Keys / wheel over a room do nothing | is there a script `script.raum_klick` (or the one in the card's `script:`)? Create it from the blueprint; its traces show what arrived |
| ↑/↓ scroll the page | default is no; `scroll_keys: true` only for remotes without a wheel |
| A building's badge on the site sits in the wrong place | drag its name in the site editor |
| The card shows an old site | a `site:` written into the card wins over the stored site – remove it and use `plan: <site id>` |

## Development

```sh
pip install -r requirements_test.txt
pytest
```

## License

[GPL-3.0](LICENSE)
