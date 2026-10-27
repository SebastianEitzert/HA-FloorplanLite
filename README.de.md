<p align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/SebastianEitzert/HA-FloorplanLite/main/docs/images/dark_logo.png"><img src="https://raw.githubusercontent.com/SebastianEitzert/HA-FloorplanLite/main/docs/images/logo.png" alt="Floorplan Lite" width="460"></picture></p>

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
| Zeichen-Editor: Satellitenbild oder alten Bauplan hochladen, Maßstab setzen, Räume und Wände nachzeichnen, Türen/Fenster setzen, nach einer Wand oder nach Norden ausrichten, Farben, Entitäten je Raum | **0.2** |
| Import: PDF, SVG, Sweet Home 3D (`.sh3d`), DXF | geplant (0.3) |

## Was die Karte zeigt

| | |
|---|---|
| **Licht** | Der Raum füllt sich weich in der Lichtfarbe (Farbtemperatur oder RGB), Helligkeit = Stärke. Das Licht strahlt leicht durch die Wände in Nachbarräume. Farbige LEDs neben Weißlicht leuchten als Saum entlang der Wände. Mit einem **Hauptlicht** je Raum (`hauptlicht`) füllt nur das Hauptlicht den Raum, alle anderen Lichter leuchten als Saum – Hauptlicht aus und andere an: nur der Saum, die Mitte bleibt dunkel. Weißlicht, das als RGB gemeldet wird (Warmweiß von RGBW-Controllern), zählt als Weiß. Schalter lassen sich von Hand als Licht oder Hauptlicht wählen; Lichter und Schalter ohne eigene Farbe leuchten in der *Lichtfarbe* des Raums (Warmweiß, Neutralweiß, Kaltweiß, Bernstein oder eine eigene Farbe). |
| **Präsenz** | ruhig atmender Lichtpunkt (Blau-Violett) |
| **Bewegung** | Lichtpunkt in Aqua mit Wellen bis an die Wände |
| **Temperatur** | aus einer `climate`-Entität (aktuelle Temperatur) oder einem Sensor |
| **Marken** | Fenster offen, Beschattung zu, Musik läuft (als kleiner Equalizer) |
| **Öffnungen** | Türen mit Schwenkbereich, Fenster, Dachfenster und Lichtkuppeln, Durchgänge ohne Tür, Garagentore – mit Entitäten (Kontakt, Cover, Schloss, Tor) zeigt sich ein offenes Schloss rot; Antippen eines Fensters öffnet seinen Dialog, bei Tür und Tor wird mit oder ohne Rückfrage geöffnet/geschlossen/aufgeschlossen; offene erscheinen rot-orange, gekippte Fenster (`tilted`/`gekippt`) gestrichelt gelb – ebenso die Marke im Raum (offen geht vor gekippt) |
| **Beschattung** | je Fenster ein Rollladen oder eine Jalousie, außen an der Wand gezeichnet: ein Balken für den geschlossenen Teil (`current_position`), Jalousien mit Lamellenwinkel als Lamellen, gedreht nach `current_tilt_position` (zu: längs der Wand, offen: quer); fahrende Beschattung pulsiert |
| **Kurzanzeige** | nach lauter / leiser / Wiedergabe zeigt der Raum 3 s die Lautstärke, nach einem Szenenwechsel den Namen der Szene (statt der Temperatur) |
| **Hintergrund** | je Stockwerk ein Bild unter dem Plan (z. B. Satellitenbild, damit der Garten ein Foto bleibt), darüber mit Transparenz oder ausgeblendet |

Tippen auf einen Raum öffnet das [Bubble-Card](https://github.com/Clooos/Bubble-Card)-Pop-up mit dem Hash `#<raum>`.
←/→ wechseln das Stockwerk. Alles andere über einem Raum – ↑/↓, Mausrad, Rechtsklick (LG-Fernbedienung: Gelb) ein- oder
zweimal, Medientasten, die Farb- und Wiedergabetasten des [TV Streamers](https://github.com/SebastianEitzert/TV-Streamer),
Doppel-/Dreifachtippen – geht an ein Skript (Kartenoption `script`, Standard `script.raum_klick`) mit `raum` (Bereich des
Raums), `aktion` (`hoch`, `runter`, `lauter`, `leiser`, `gelb`, `play`, `pause`, `play_pause`, `stop`, `weiter`,
`zurueck`, `blau`, `gruen`, `rot`, `tipp2`, `tipp3` und `…2` für zweimal gedrückt) sowie `lichter` und `player` des Raums. Was passiert, entscheidet das Skript.

Die Integration bringt dafür eine Vorlage mit: *Einstellungen → Automationen & Szenen → Blueprints → **Floorplan Lite –
keys, clicks and wheel over a room** → Skript erstellen* und als `script.raum_klick` speichern. Je Ereignis wählst du:
Szene weiter / zurück, Licht an/aus, Raum aus, Musik Start / Pause / Stopp, lauter / leiser (nur wenn Musik läuft oder
immer), Titel weiter / zurück – oder nichts; dasselbe noch einmal für jede Fernbedienungstaste zweimal gedrückt. Nur Tasten mit
einer Aktion für *zweimal* warten auf den zweiten Druck (einstellbar, Standard 0,4 s), alle anderen reagieren sofort. Die Szenen eines Raums sind die seinem Bereich zugeordneten und die, deren
Name mit dem Raumnamen beginnt; die Runde geht aus → erste Szenen → die übrigen → aus, ein Raum ohne Szenen schaltet seine
Lichter an und aus. Welche Lichter und Player: genau die im Grundriss für den Raum eingetragenen (auch Schalter); nur wenn dort keine
stehen, die des Bereichs, eingegrenzt durch Erlauben-/Sperren-Listen für Integrationen und Labels. Name der Aus-Szene, Standard-Player je Raum und *Modi* sind Einstellungen: Solange ein Modus (Nacht, Kino …) an ist, kommen seine Szenen zuerst – der oberste Modus hat Vorrang. Mit dem TV Streamer nutzt der Streamer Blau und Grün auch selbst, Rot öffnet das Moonlight-Menü; die Vorlage weist an diesen Tasten darauf hin.
Ohne Skript gehen Wiedergabe / Pause direkt an die Musik-Player des Raums.

## Installation

1. **HACS** → ⋮ → *Benutzerdefinierte Repositories* → `https://github.com/SebastianEitzert/HA-FloorplanLite`, Typ
   *Integration* → **Floorplan Lite** herunterladen → Home Assistant neu starten.
2. *Einstellungen → Geräte & Dienste → Integration hinzufügen → Floorplan Lite*. In der Seitenleiste erscheint die Seite
   **Floorplan Lite** (nur für Administratoren).
3. Dort einen Grundriss anlegen – Reihenfolge: Außenwände, Innenwände, dann Räume (*Raum erzeugen* füllt per Klick die
   Fläche bis zu den Wänden, *Raum zeichnen* frei mit Einrasten, *Raum teilen* zerschneidet einen Raum). Als Vorlage: Satellitenbild, Foto oder Scan des alten Papierplans oder eine PDF als Hintergrund
   hochladen (einen schiefen Scan mit zwei Punkten gerade ausrichten), mit zwei Punkten
   bekannten Abstands den Maßstab setzen, dann Räume, Außenwände und Bereiche außen nachzeichnen und Türen und Fenster
   auf die Wände klicken. Punkte rasten an Ecken, Kanten, 45°/90° und einem 5-cm-Raster ein (Umschalt: freier Winkel).
   Die Entitäten je Raum in der Seitenleiste eintragen. Räume ohne Wand dazwischen (offener Bereich): Werkzeug *Keine
   Wand*, dann die gemeinsame Wand anklicken. Ein Stockwerk lässt sich samt Inhalt als Grundlage des nächsten kopieren. Wandstärken und den Namen des Grundrisses (✎ neben der Auswahl) gibt es in
   der Seitenleiste. Strg+Z/Y rückgängig/wiederholen, Strg+S speichert.
   Wähle für jeden Raum einen Home-Assistant-Bereich: Name, ID und die dort gefundenen Entitäten werden übernommen
   (oder jedes Mal live aus dem Bereich gelesen). *Pop-up-YAML erzeugen* baut je Raum ein Bubble-Card-Pop-up (`#raum`) –
   zum Kopieren oder direkt in ein Dashboard eingetragen.
4. Die Karte ins Dashboard einfügen – mit dem grafischen Karten-Editor oder in YAML:

```yaml
type: custom:floorplan-lite-card
plan: zuhause         # ID des Grundrisses
mode: swipe           # ein Stockwerk groß, wischen / Reiter / Pfeile; ohne: alle nebeneinander
start: eg             # erstes Stockwerk im Wisch-Modus
floors: [eg, og]      # optional: nur diese Stockwerke
background: false     # optional: Hintergrundbilder ausblenden
align: true           # optional: Stockwerke aneinander ausrichten – das DG bleibt beim Wischen über dem Haus
tap: none             # optional: kein Pop-up beim Tippen
hide_label: [no_dboard] # optional: Entitäten mit diesen Labels ignorieren (Vorgabe: Einstellung des Grundrisses)
script: script.raum_klick # optional: das Skript für Tasten, Klicks und Mausrad über einem Raum
scroll_keys: true    # optional: ↑/↓ scrollen die Seite (Vorgabe: nein – dafür ist das Rad da; für Fernbedienungen ohne Rad)
intro: false          # optional: keine Aufbau-Animation
rooms:                # optional: Entitäten je Raum – ersetzen die im Grundriss gespeicherten
  kuche:
    licht: [light.kuche_decke, light.kuche_led]
    hauptlicht: light.kuche_decke   # optional: füllt den Raum, die anderen Lichter nur als Saum
    praesenz: [binary_sensor.prasenz_kuche]
    bewegung: [binary_sensor.bewegung_kuche]
    temp: climate.kuche
    fenster: [binary_sensor.fenster_kuche]
    beschattung: [cover.jalousien_kuche]
    musik: [media_player.kuche]
```

## Grundstück: mehrere Gebäude in einer Karte

Ein **Grundstück** legst du im Grundriss-Editor an: oben ⌂+ („Neues Grundstück“). Seine Gebäude sind deine anderen
Grundrisse – an ihre Stelle ziehen (Umschalt+Rad dreht, Alt+Rad skaliert, Warnung bei Überlappung) – und gemeinsame
Außenbereiche (Hof, Garten) zeichnest du dort und verknüpfst sie mit einem Home-Assistant-Bereich samt Entitäten. In
der Karte genügt dann `plan: <grundstück>`; was zum Dashboard gehört – Startansicht, Benutzer, Schaltflächen,
Aus-Schalter, „nur diese Gebäude“ – stellst du im visuellen Karten-Editor ein. (`buildings` innerhalb eines einzelnen
Grundrisses sind *Gebäudeteile* einer Zeichnung, z. B. Stall und Garage.)

```yaml
type: custom:floorplan-lite-card
plan: gelaende          # ein Grundstück aus dem Grundriss-Editor
```

Das Grundstück kann auch direkt in der Karte stehen (`site:`), mit denselben Schlüsseln, die der Editor speichert:

```yaml
type: custom:floorplan-lite-card
site:
  buildings:
    - plan: zuhause         # Grundriss-ID
      name: Haus
      site_floor: eg        # Geschoss in der Grundstücksansicht (Standard: unterstes)
      x: 0                  # Lage auf dem Grundstück in Metern (ohne x/y: automatisch nebeneinander)
      y: 0
      rotation: 0
      scale: 1
      building: haus        # optional: nur dieses Gebäude des Grundrisses (dessen `buildings`)
    - plan: ranch
      name: Ranch
  areas:                    # gemeinsame Außenbereiche, Polygon in Grundstücks-Koordinaten
    - id: hof_vornen        # Bereichs-ID in Home Assistant = Pop-up #hof_vornen
      name: Hof vorne
      poly: [[14, -2], [37, -2], [37, 12], [14, 12]]
      licht: [light.hof]    # dieselben Felder wie Räume: licht, hauptlicht, musik, praesenz, bewegung, fenster, beschattung, temp
  show: [ranch]             # optional: nur diese Gebäude – eines = nur dieses Gebäude, ohne Grundstücksebene
  raster: true              # optional: 5-m-Raster in der Grundstücksansicht (zum Ausrichten)
  site_background: {image: /local/grundstueck.jpg, x: -10, y: -10, width: 120, opacity: 0.6}
start: grundstueck          # Startansicht: grundstueck, <grundriss>, <grundriss>:<stockwerk> oder ein Raum
follow:                     # je Home-Assistant-Benutzer (Name oder ID)
  Sebastian: {art: standort, geofence: person.sebastian, ble: [sensor.handy_area], ble_letzter: [sensor.handy_area_last_seen], max_alter: 30}
  TV: {art: fest, vorlage: "{{ 'wohnzimmer' if geraet == 'wohnzimmer' else 'schlafzimmer' }}"}
follow_floor: true          # beim Folgen auch das Stockwerk wechseln (false: nur das Gebäude)
follow_hold: 120            # nach eigener Navigation 120 s nicht springen
nachbar_rand: 0.15          # Rand um ein Gebäude, in dem Außenbereiche gezeigt werden (15 %)
aus_schalter: {site: true, ranch: false}   # Aus-Schalter je Ebene
musik_aus: pause            # pause | stop | off
aus_mit_aussen: false       # „Gebäude aus“ schließt die Außenbereiche ein
buttons:                    # eigene Schaltflächen links oben, je Ebene, mit den üblichen HA-Aktionen
  site:
    - {icon: mdi:flash, name: Energie, tap_action: {action: navigate, navigation_path: /energy}}
  zuhause:
    - {icon: mdi:cctv, name: Kameras, tap_action: {action: navigate, navigation_path: "#kameras"}}
```

- **Drei Ebenen:** Grundstück → Gebäude → Stockwerk. Die Leiste oben wechselt zwischen Grundstück und Gebäuden, die
  Reiter darunter zwischen den Stockwerken des Gebäudes. Tippen auf ein Gebäude im Grundstück zoomt in dessen zuletzt
  gewähltes Stockwerk; hinaus mit „⤢ Grundstück“, zwei Fingern zusammen, Strg+Mausrad oder Zurück (die Ansicht steht in
  der Adresse, `#plan=zuhause&floor=og`). Fernbedienung: ↑/↓ zoomen hinein / hinaus, solange der Zeiger über keinem Raum
  steht (über einem Raum bleiben es die Lichtszenen), ←/→ wechseln das Stockwerk.
- **Grundstücksansicht:** alle Gebäude im `site_floor` mit Licht, Präsenz und Bewegung, über jedem Gebäude eine
  Zusammenfassung (Lichter an, Fenster offen, Musik). Außenbereiche erscheinen vollständig, in einer Gebäudeansicht der
  angrenzende Teil (innerhalb von `nachbar_rand`) – bedient werden sie genau wie Räume (Pop-up, Skript, Rad, Tasten).
- **Startansicht:** Die Adresse gewinnt (`?raum=<raum>` oder `?ansicht=<grundriss>[:<stockwerk>]` /
  `?ansicht=grundstueck`, auch als `#raum=…`), dann der `follow`-Eintrag des Benutzers, dann `start`. *Standort*:
  Geofence nicht zu Hause → Grundstück; sonst der neueste Bluetooth-Bereich (z. B. Bermuda), sonst der letzte, wenn er
  höchstens `max_alter` Minuten alt ist; „Du bist hier“ markiert den Raum. *Fest*: feste Ansicht oder fester Raum, oder
  eine Vorlage, die eins davon liefert (Variablen `benutzer`, `geraet`); `geraet` ist der Name des TV Streamers (ab 0.4.7)
  oder einmalig mit `?geraet=<name>` gesetzt. Räume und Bereiche werden über Raum-ID, HA-Bereichs-ID oder Bereichsnamen
  gefunden.
- **Aus** (rechts oben): „Alles aus“ im Grundstück, „<Gebäude> aus“ im Gebäude – Lichter und Musik der in der Karte
  eingetragenen Räume, die an sind bzw. spielen; zweimal innerhalb von 3 s drücken, ein kurzer Hinweis nennt die Anzahl.
- **Nur ein Gebäude:** `site.show: [ranch]` zeigt nur dieses Gebäude (mit den angrenzenden Außenbereichen). Innerhalb
  eines einzelnen Grundrisses mit mehreren `buildings` zeigt die Kartenoption `building: <id>` nur dieses Gebäude.
- Der visuelle Karten-Editor bietet die Benutzer (mit Live-Vorschau der Vorlage) und alle Karten-Einstellungen oben.

## Format eines Grundrisses

Koordinaten in Metern, `y` zeigt nach unten. Ein Grundriss enthält:

| Schlüssel | Inhalt |
|---|---|
| `id`, `name` | ID (`a-z0-9_`) und Name |
| `rotation` | dreht den ganzen Plan auf dem Bildschirm (Grad); `north` gibt die Nordrichtung an |
| `align_levels` | `true`: alle Stockwerke im selben Ausschnitt, obere liegen genau über den unteren (Kartenoption `align`) |
| `hide_labels` | Entitäten mit einem dieser Labels werden ignoriert (z. B. ein Label, mit dem du Entitäten schon aus Dashboards heraushältst) |
| `style` | Farben: `background`, `floor` (zwei Farben des Verlaufs), `wall`, `edge`, `text`; Wandstärke in Metern: `wall_width` (innen, 0,2), `outer_width` (0,5) |
| `buildings` | `[{id, name}]` – z. B. Haus, Stall, Garage |
| `levels` | `[{id, name, short, view?, background?}]` – `background`: `{image, x, y, width, height?, rotation, opacity, mode: under/over/hidden}` |
| `outlines` | Außenwände je Stockwerk und Gebäude: `{level, building, poly}` |
| `walls` | Innenwände (Mittellinie): `{level, poly, width?, closed?}` – `width` in Metern, sonst `style.wall_width` |
| `room_walls` | `true` (Vorgabe älterer Grundrisse): Räume zeichnen Wände entlang ihres Rands; neue Grundrisse: `false`, die Wände kommen aus `outlines` und `walls` |
| `rooms` | `{id, level, poly, name, key?, building?, label_at?, small?, outdoor?, color?, area?, area_live?}` – `name: null` = Teil eines anderen Raums; `outdoor` für Bereiche außerhalb (Garten, Terrasse, Hof) |
| `lines` | gestrichelte Hilfslinien (Vordach, Terrasse): `{level, poly, open?}` |
| `openings` | `{level, type: door/window/passage/garage/open/skylight, at, angle, width, depth?, flip?, round?, entities?, confirm?, confirm_text?, tap?}` – werden aus den Wänden ausgeschnitten; `open` = gar keine Wand zwischen zwei Räumen (offene Küche und Wohnzimmer) |
| `entities` | Entitäten je Raum-Schlüssel (wie `rooms` der Karte) |

## Entwicklung

```sh
pip install -r requirements_test.txt
pytest
```

## Lizenz

[GPL-3.0](LICENSE)
