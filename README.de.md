<p align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/dark_logo.png"><img src="docs/images/logo.png" alt="Floorplan Lite" width="460"></picture></p>

# Floorplan Lite für Home Assistant

🇬🇧 [English version](README.md)

<p align="center"><a href="https://buymeacoffee.com/SebastianEitzert"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=SebastianEitzert&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" height="45"></a></p>

Ein Grundriss für deine Dashboards, der **CPU und Grafikkarte schont** und trotzdem hochwertig aussieht: Räume füllen
sich weich in der Farbe ihres Lichts, Präsenz und Bewegung erscheinen als ruhige Punkte und Wellen, Temperatur, offene
Fenster, geschlossene Beschattung und laufende Musik direkt im Raum. Läuft flüssig auf alten Tablets, Fernseher-Browsern
und in Software gezeichneten Streams (z. B. [TV Streamer](https://github.com/SebastianEitzert/TV-Streamer)) – reines SVG
und CSS, kein WebGL, kein Framework.

| Teil | Stand |
|---|---|
| Integration: zentrale Ablage der Grundrisse (Gebäude, Stockwerke, Räume, Wände, Türen, Fenster, Durchgänge, Garagentore, Hintergrundbilder, Farben, Drehung), WebSocket-Schnittstelle | **0.1** |
| Karte `custom:floorplan-lite-card` – in jedem Dashboard automatisch verfügbar | **0.1** |
| Editor-Seite in der Seitenleiste – Import/Export als JSON, Vorschau | **0.1** |
| Zeichen-Editor: Satellitenbild oder alten Bauplan hochladen, Maßstab setzen, Räume und Wände nachzeichnen, Türen/Fenster setzen, nach einer Wand oder nach Norden ausrichten, Farben | geplant (0.2) |
| Import: PDF, SVG, Sweet Home 3D (`.sh3d`), DXF | geplant (0.3) |

## Was die Karte zeigt

| | |
|---|---|
| **Licht** | Der Raum füllt sich weich in der Lichtfarbe (Farbtemperatur oder RGB), Helligkeit = Stärke. Das Licht strahlt leicht durch die Wände in Nachbarräume. Farbige LEDs neben Weißlicht leuchten als Saum entlang der Wände. |
| **Präsenz** | ruhig atmender Lichtpunkt (Blau-Violett) |
| **Bewegung** | Lichtpunkt in Aqua mit Wellen bis an die Wände |
| **Temperatur** | aus einer `climate`-Entität (aktuelle Temperatur) oder einem Sensor |
| **Marken** | Fenster offen, Beschattung zu, Musik läuft (als kleiner Equalizer) |
| **Öffnungen** | Türen mit Schwenkbereich, Fenster, Durchgänge ohne Tür, Garagentore |
| **Hintergrund** | je Stockwerk ein Bild unter dem Plan (z. B. Satellitenbild, damit der Garten ein Foto bleibt), darüber mit Transparenz oder ausgeblendet |

Tippen auf einen Raum öffnet das [Bubble-Card](https://github.com/Clooos/Bubble-Card)-Pop-up mit dem Hash `#<raum>`.
Mit Maus oder Fernseher-Fernbedienung (z. B. über Moonlight): Rechtsklick (LG-Fernbedienung: Gelb) einmal über einem Raum =
Musik Start/Pause, zweimal = Raum aus, Mausrad = Musik lauter/leiser, ↑/↓ über einem Raum = Lichtszenen – das ruft ein
Skript `script.raum_klick` mit `raum`, `aktion`/`klicks` auf (optional; ohne das Skript passiert nichts). ←/→ wechseln das Stockwerk.

## Installation

1. **HACS** → ⋮ → *Benutzerdefinierte Repositories* → `https://github.com/SebastianEitzert/HA-FloorplanLite`, Typ
   *Integration* → **Floorplan Lite** herunterladen → Home Assistant neu starten.
2. *Einstellungen → Geräte & Dienste → Integration hinzufügen → Floorplan Lite*. In der Seitenleiste erscheint die Seite
   **Floorplan Lite** (nur für Administratoren).
3. Dort einen Grundriss anlegen (0.1: Grundriss als JSON importieren; der Zeichen-Editor folgt).
4. Die Karte ins Dashboard einfügen:

```yaml
type: custom:floorplan-lite-card
plan: zuhause         # ID des Grundrisses
mode: swipe           # ein Stockwerk groß, wischen / Reiter / Pfeile; ohne: alle nebeneinander
start: eg             # erstes Stockwerk im Wisch-Modus
floors: [eg, og]      # optional: nur diese Stockwerke
background: false     # optional: Hintergrundbilder ausblenden
align: true           # optional: Stockwerke aneinander ausrichten – das DG bleibt beim Wischen über dem Haus
tap: none             # optional: kein Pop-up beim Tippen
intro: false          # optional: keine Aufbau-Animation
rooms:                # optional: Entitäten je Raum – ersetzen die im Grundriss gespeicherten
  kuche:
    licht: [light.kuche_decke, light.kuche_led]
    praesenz: [binary_sensor.prasenz_kuche]
    bewegung: [binary_sensor.bewegung_kuche]
    temp: climate.kuche
    fenster: [binary_sensor.fenster_kuche]
    beschattung: [cover.jalousien_kuche]
    musik: [media_player.kuche]
```

## Format eines Grundrisses

Koordinaten in Metern, `y` zeigt nach unten. Ein Grundriss enthält:

| Schlüssel | Inhalt |
|---|---|
| `id`, `name` | ID (`a-z0-9_`) und Name |
| `rotation` | dreht den ganzen Plan auf dem Bildschirm (Grad); `north` gibt die Nordrichtung an |
| `align_levels` | `true`: alle Stockwerke im selben Ausschnitt, obere liegen genau über den unteren (Kartenoption `align`) |
| `style` | Farben: `background`, `floor` (zwei Farben des Verlaufs), `wall`, `edge`, `text` |
| `buildings` | `[{id, name}]` – z. B. Haus, Stall, Garage |
| `levels` | `[{id, name, short, view?, background?}]` – `background`: `{image, x, y, width, height?, rotation, opacity, mode: under/over/hidden}` |
| `outlines` | Außenwände je Stockwerk und Gebäude: `{level, building, poly}` |
| `rooms` | `{id, level, poly, name, key?, building?, label_at?, small?, outdoor?, color?}` – `name: null` = Teil eines anderen Raums; `outdoor` für Bereiche außerhalb (Garten, Terrasse, Hof) |
| `lines` | gestrichelte Hilfslinien (Vordach, Terrasse): `{level, poly, open?}` |
| `openings` | `{level, type: door/window/passage/garage, at, angle, width, depth?, flip?}` – werden aus den Wänden ausgeschnitten |
| `entities` | Entitäten je Raum-Schlüssel (wie `rooms` der Karte) |

## Entwicklung

```sh
pip install -r requirements_test.txt
pytest
```

## Lizenz

[GPL-3.0](LICENSE)
