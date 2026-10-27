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
Doppel-/Dreifachtippen – geht an ein Skript (Kartenoption `script`, Standard `script.raum_klick`) mit `room` (Bereich des
Raums), `event` (`up`, `down`, `wheel_up`, `wheel_down`, `yellow`, `play`, `pause`, `play_pause`, `stop`, `next`,
`previous`, `blue`, `green`, `red`, `double_tap`, `triple_tap` und `…_twice` für zweimal gedrückt) sowie `lights` und `players` des Raums. Was passiert, entscheidet das Skript.

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

### Karten-Optionen – vollständige Übersicht

| Option | Werte (Standard) | Wirkung / hängt ab von |
|---|---|---|
| `plan` | ID eines Grundrisses oder Grundstücks | der gespeicherte Plan; ein Grundstück schaltet die Karte in den Grundstücks-Modus (siehe *Grundstück*) |
| `mode` | `swipe` / – (alle Stockwerke nebeneinander) | `swipe`: ein Stockwerk groß, wechseln mit Wischen, Reitern, ←/→ |
| `start` | Stockwerks-ID (erstes) | erstes Stockwerk bei `swipe`; im Grundstück: `grundstueck`, `<plan>`, `<plan>:<stockwerk>` oder ein Raum |
| `floors` | Liste von Stockwerks-IDs (alle) | nur diese Stockwerke, in dieser Reihenfolge |
| `building` | ID eines Gebäudeteils | nur dieser Gebäudeteil des Grundrisses (`buildings` des Plans) |
| `background` | `false` (gezeigt) | blendet alle Hintergrundbilder aus |
| `align` | `true` / `false` (`align_levels` des Plans) | alle Stockwerke in einem Rahmen – obere bleiben beim Wischen über den unteren |
| `ausrichtung` | `achse` / `norden` (Einstellung von Plan / Grundstück) | `norden` dreht Grundriss- bzw. Gebäudeansichten so, dass Norden oben ist; `achse` behält die eigene Achse der Zeichnung |
| `kompass` | `false` (gezeigt) | blendet die Windrose aus |
| `andere_geschosse` | `true` (`false`) | Außenwände der anderen Stockwerke als feine gestrichelte Hilfslinien – z. B. zeigt das Dachgeschoss, wo das Erdgeschoss endet; mit `align: true` teilen alle Stockwerke einen Rahmen, dann sind die Linien ganz zu sehen |
| `tap` | `none` (Pop-up + Skript) | `none`: kein Pop-up beim Antippen und keine Ereignisse an das Skript |
| `script` | Skript-Entität (`script.raum_klick`) | bekommt Tasten, Klicks, Mausrad und Tippen über einem Raum (siehe *Skript-Vorlage*) |
| `scroll_keys` | `true` (`false`) | ↑/↓ scrollen zusätzlich die Seite – nur für Fernbedienungen ohne Rad |
| `hide_label` | Liste von Labels (`hide_labels` des Plans) | Entitäten mit einem dieser Labels werden in der ganzen Karte ignoriert |
| `intro` | `false` (an) | keine Aufbau-Animation (auch aus bei „Bewegung reduzieren“) |
| `rooms` | `{<raum-schlüssel>: {…}}` | Entitäten je Raum, überschreiben die im Plan gespeicherten – Schlüssel in der nächsten Tabelle |
| `site` | Objekt | ein in die Karte geschriebenes Grundstück (hat Vorrang vor dem gespeicherten); auch `site.show` |
| `site_title` | Text | Titel der Grundstücksebene |
| `follow`, `follow_floor`, `follow_hold`, `nachbar_rand`, `buttons`, `aus_schalter`, `musik_aus`, `aus_mit_aussen` | | Grundstücks-Optionen, siehe *Grundstück* |
| `plan_data` / `plans_data` | Plan-JSON | ein Plan (oder Pläne nach ID) direkt statt der gespeicherten – für Tests und zum Teilen |

**Entitäten je Raum** (`rooms.<schlüssel>` in der Karte oder im Seitenbereich des Editors – dieselben Schlüssel):

| Schlüssel | Entitäten | Dargestellt als / genutzt für |
|---|---|---|
| `licht` | Lichter, Schalter (Liste) | Lichtfüllung und Saum; Skript „Licht an/aus“ und „Raum an“ bei Szenen |
| `hauptlicht` | ein Licht oder Schalter | füllt allein den Raum, die anderen leuchten nur als Saum |
| `lichtfarbe` | `warm`, `neutral`, `cold`, `amber`, `red`, `green`, `blue`, `purple` oder `#rrggbb` | Farbe für Lichter / Schalter ohne eigene Farbe |
| `praesenz` | binary_sensors | atmender Punkt |
| `bewegung` | binary_sensors | Punkt mit Wellen |
| `temp` | climate oder sensor | Temperatur in der Beschriftung |
| `fenster` | binary_sensors / covers | Chip „Fenster offen“ (gekippt gestrichelt) |
| `beschattung` | covers | Chip „Beschattung zu“ |
| `musik` | media_player | Equalizer-Chip; Musik-Aktionen und Lautstärke im Skript; Aus-Schalter |

Ohne Entitäten nimmt ein Raum mit `area` (und `area_live`) sie aus seinem Home-Assistant-Bereich. Entitäten mit einem
Label aus `hide_label` zählen nie.

### Empfehlung: Kiosk Mode für Fernseher und Wandpanels

Für einen Fernseher (z. B. über den [TV Streamer](https://github.com/SebastianEitzert/TV-Streamer)) oder ein
Wandtablet blendest du Kopfzeile und Seitenleiste von Home Assistant mit [Kiosk Mode](https://github.com/NemesisRE/kiosk-mode)
aus (HACS → Frontend → *Kiosk Mode*). Eingestellt wird es je Benutzer in der Roh-Konfiguration des Dashboards (⋮ →
*Dashboard bearbeiten* → ⋮ → *Raw-Konfigurationseditor*), ganz oben neben `views:` – hier nur für den Benutzer, mit dem
sich der Fernseher anmeldet, alle anderen behalten die normale Ansicht:

```yaml
kiosk_mode:
  user_settings:
    - users: [tv]          # Name(n) der Home-Assistant-Benutzer, klein geschrieben
      kiosk: true          # blendet Kopfzeile und Seitenleiste aus
views:
  - ...
```

Um das Dashboard als dieser Benutzer trotzdem zu bearbeiten, `?disable_km` an die Adresse hängen. Ohne eigenen
Benutzer schaltet `?kiosk` in der Adresse des Dashboards es nur für dieses Gerät ein.

## Grundriss-Editor

Die Seite **Floorplan Lite** in der Seitenleiste (nur Administratoren). Oben: Grundriss-Liste, **+** neuer Grundriss,
**⌂+** neues Grundstück, ✎ umbenennen (die ID nutzen die Karten: `plan: …`), Rückgängig / Wiederholen, Vorschau (die
echte Karte neben dem Editor), JSON importieren / exportieren, löschen und speichern (Strg+S).

**Werkzeuge** (linke Leiste):

| Werkzeug | Was es tut |
|---|---|
| Auswählen / bearbeiten | Element anklicken; Ecken ziehen; Doppelklick auf eine Kante fügt eine Ecke ein; Rechtsklick auf eine Ecke löscht sie; Entf löscht das Element |
| Außenwand | Gebäudeumriss zeichnen – die gezeichnete Linie kann Außenkante, Wandmitte oder Innenkante sein |
| Innenwand | Mittellinie der Innenwände; Punkte springen auf Wandecken und Wände |
| Raum erzeugen | in eine von Wänden umschlossene Fläche klicken – der Raum füllt sie |
| Raum zeichnen / Raum teilen | frei mit Einrasten / eine Linie von Rand zu Rand teilt einen Raum |
| Bereich außen | Garten, Terrasse, Hof – wie ein Raum gezeichnet, ohne Wände dargestellt |
| Hilfslinie | gestrichelte Linien (Vordach, Terrassenkante) |
| Treppe | die **Lauflinie** zeichnen, vom Antritt (Punkt) bis zum Austritt (Pfeil), an jeder Wendung ein Punkt; Wendungen werden mit dem *Radius* gewendelt (Abstand der Lauflinie vom Wendelpunkt – z. B. 0,6 bei 1,00 m Laufbreite um einen 20-cm-Kern, 0 = Podest-Ecke), die Stufen fächern sich dort auf – *eckig* (Standard: gerade Wangen, Stufen verteilt wie bei der runden Form) oder *rund*. Seitenbereich: Breite, Steigungen, Radius, Form, *führt nach* (Standard: nächstes Stockwerk, dort gestrichelt); Länge der Lauflinie und Auftritt werden angezeigt. Punkte fangen wie bei allen Linien (Ecken, Kanten, 45°/90° zum vorigen Punkt, Raster) und zusätzlich die Laufmitte (halbe Treppenbreite von den Wänden) |
| Tür, Fenster, Durchgang, Garagentor | auf eine Wand klicken; Breite, Aufschlag (spiegeln), Entitäten und Sicherheitsabfrage im Seitenbereich |
| Dachfenster / Lichtkuppel | frei im Raum, eckig oder rund |
| Keine Wand | die Wand zwischen zwei Räumen anklicken – sie verschwindet, beide bleiben Räume (offene Küche) |
| Hintergrund: verschieben, Maßstab, gerade ausrichten | Bild verschieben; zwei Punkte bekannten Abstands setzen den Maßstab; zwei Punkte auf einer Wand des Bildes drehen nur das Bild gerade |
| Nach einer Wand ausrichten | dreht den ganzen Grundriss, bis die angeklickte Wand waagerecht liegt |

Zeichnen: Klick setzt Punkte, Klick auf den ersten Punkt oder Enter schließt, Rücktaste entfernt den letzten Punkt,
Esc bricht ab, Umschalt = freier Winkel. Punkte rasten auf Ecken, Kanten, 45°/90° und ein 5-cm-Raster ein; *Raster*,
*Stockwerk darunter zeigen* und *Maße zeigen* lassen sich einschalten.

**Seitenbereich:** ohne Auswahl die Einstellungen des Grundrisses – Name, Wandstärken, Farben, Norden (Grad) und „Nach
Norden ausrichten“, Labels, deren Entitäten ignoriert werden, Stockwerke (hinzufügen, umbenennen, sortieren,
**Stockwerk kopieren** mit allem darauf), Gebäudeteile, Hintergrundbild je Stockwerk (Bild oder PDF – PDFs werden
umgewandelt, bei mehreren Seiten wird gefragt –, Deckkraft, unter / über dem Plan / ausgeblendet). Mit einem Raum
ausgewählt: **Home-Assistant-Bereich** (übernimmt Name, ID und die gefundenen Entitäten, oder „live aus dem Bereich“,
dann erscheinen neue Geräte von selbst), die Entitäten je Rolle (Licht, Hauptlicht, Präsenz, Bewegung, Temperatur,
Fenster, Beschattung, Musik), Lichtfarbe für Lichter ohne eigene Farbe, kleine Beschriftung, Farbe. *Alle Räume mit
Bereich ausfüllen* macht das für alle Räume. **Pop-up-YAML erzeugen** baut je Raum ein Bubble-Card-Pop-up (dynamisch
mit auto-entities oder einfache Kacheln) – zum Kopieren oder direkt in eine Dashboard-Ansicht eingetragen.

**Grundstücks-Editor** (ein Plan, angelegt mit ⌂+): Die Werkzeuge sind Symbole in der Leiste links (Name beim
Drüberfahren), die Zeichenfläche zeigt alle Gebäude, die Listen stehen im Seitenbereich. *Außenbereich bearbeiten*
zeigt die Ecken aller Bereiche zum Ziehen (Gebäude bleiben stehen); *Bearbeiten* neben einem Bereich in der Liste ebenso.

- *Verschieben*: Gebäude ziehen; Umschalt+Rad dreht, Alt+Rad skaliert; Rad zoomt, Ziehen auf freier Fläche verschiebt
  die Ansicht.
- *Ecke an Ecke*: Ecke des zu bewegenden Gebäudes anklicken, dann eine Ecke eines anderen Gebäudes, Abstand in Metern
  eingeben (0 / 0 = bündig). Mit „dauerhaft als Maßlinie“ (Standard) bleibt die Linie: eine Linie legt die Lage fest,
  zwei auch die Drehung; wird das andere Gebäude bewegt, wandert es mit. Fixierte Gebäude lassen sich nicht ziehen –
  Maßlinie anklicken löst sie.
- *Hintergrund verschieben* (ziehen; Umschalt+Rad dreht, Alt+Rad skaliert um den Mauszeiger) und *Hintergrund drehen*
  (zwei Punkte auf einer Linie des Bildes, z. B. einer Grundstücksgrenze, dann ihre Richtung: 0 = waagerecht, 90 = senkrecht).
- *Hintergrund (Bild/PDF)* + *Hintergrund-Maßstab* (zwei Punkte und die echte Länge) + *Am Hintergrund ausrichten* (zwei
  Ecken eines Gebäudes auf zwei Punkte eines Lageplans, wahlweise mit Skalieren) – Platzieren nach einem gemeinsamen
  Lageplan.
- *Maße anzeigen* (Lineal): Kantenlängen von Gebäuden und Außenbereichen; bleibt je Browser gespeichert.
- *Außenbereich zeichnen*: gemeinsame Bereiche (Hof, Garten) mit HA-Bereich und Entitäten. Punkte fangen Ecken und
  Kanten von Gebäuden und anderen Außenbereichen, sonst 45°-Schritte und 0,25-m-Raster (Umschalt: frei). Ecken eines
  Bereichs ziehen bearbeitet ihn (gleicher Punktfang); Doppelklick auf eine Kante fügt eine Ecke ein, auf eine Ecke löscht sie.
- *Darstellung*: Norden in der Grundstücksansicht (Grad, 0 = oben, im Uhrzeigersinn), Gebäudeansichten an der eigenen
  Hauptachse oder Norden oben, 5-m-Raster, Hintergrund. Den Gebäudenamen ziehen verschiebt sein Badge, Doppelklick setzt
  es zurück.

## Skript-Vorlage (Tasten, Klicks, Mausrad)

Die Karte schickt jede Taste, jeden Klick, jeden Radschritt und jedes Tippen über einem Raum an ein Skript – mit `room`
(Bereich), `event`, `lights` und `players`. Die Integration installiert dafür eine Blueprint-Vorlage (mit jedem Release
aktualisiert):

1. *Einstellungen → Automationen & Szenen → Blueprints → **Floorplan Lite – keys, clicks and wheel over a room** →
   Skript erstellen*.
2. Als **`script.raum_klick`** speichern (oder in der Karte `script:` auf dein Skript setzen).
3. Einstellungen später im Skript ändern; mit einer neuen Version der Integration folgt das Skript der Vorlage.

**Alle Einstellungen** – jedes Tasten- / Klick-Ereignis bekommt eine Aktion: `nothing` (nichts), `scene_next`,
`scene_previous`, `light_toggle` (erste Szene / aus), `light_on` (erste Szene), `light_off`, `room_off` (Lichter aus,
Musik Stopp), `music_play`, `music_pause`, `music_toggle`, `music_stop`, `volume_up`, `volume_down`, `next_track`,
`previous_track`. „Szene weiter“ in einem Raum ohne Szenen = Licht an/aus.

| Einstellung | Standard | Bedeutung |
|---|---|---|
| `up` / `down` | Szene weiter / zurück | ↑ / ↓ – Pfeiltasten der Tastatur, Steuerkreuz der TV-Fernbedienung (Zeiger über einem Raum) |
| `wheel_up` / `wheel_down` | lauter / leiser | Mausrad, Rad der Magic Remote |
| `yellow` | nichts | Rechtsklick, LG-Taste Gelb |
| `play`, `pause`, `play_pause`, `stop` | Start, Pause, Start/Pause, Stopp | Medientasten von TV-Fernbedienung / PC-Tastatur |
| `next`, `previous` | Titel weiter / zurück | Titeltasten der PC-Tastatur |
| `blue`, `green`, `red` | nichts | LG-Farbtasten über den TV Streamer – Blau lädt beim Streamer zusätzlich neu, Grün hat dort eine eigene Funktion, Rot öffnet das Moonlight-Menü |
| `double_tap`, `triple_tap` | Licht an/aus, Raum aus | Doppel- / Dreifachtippen auf einem Touchscreen |
| `double_ms` | 400 ms | Wartezeit auf den zweiten Druck – nur bei Tasten, deren `…_twice` nicht `nothing` ist |
| `up_twice` … `red_twice` | `yellow_twice` Raum aus, `play_twice` nächster Titel, sonst nichts | dieselbe Taste zweimal; eine Taste mit Aktion hier führt ihre Einzelaktion erst nach der Wartezeit aus |
| `volume_mode` | nur bei laufender Musik | lauter / leiser ändern nur spielende Player oder immer |
| `standard_players` | `{}` | `{bereich: [media_player…]}` – Play startet diese, wenn nichts läuft (ohne: alle Player des Raums) |
| `players_plan_always` | an | im Grundriss eingetragene Player zählen immer; aus = die Listen unten filtern sie auch |
| `players_allow_integrations` / `_labels` | leer | nicht leer: nur Player dieser Integrationen (Domain, z. B. `loxone`, `sonos`) / Labels zählen |
| `players_block_integrations` / `_labels` | leer | diese zählen nie – Sperren gewinnt vor Erlauben |
| `scenes_by_name` | an | Szenen, deren Name mit dem Raumnamen beginnt („Küche Abend“), gehören zum Raum, neben den dem Bereich zugeordneten |
| `room_names` | `{}` | `{bereich: name}`, wenn die Szenen einen anderen Namen als der Bereich nutzen, z. B. `kinderzimmer_1: Kind 1` |
| `off_names` | `Off`, `Aus` | eine Szene mit diesem Namen (nach dem Raumnamen) ist „aus“; ohne sie werden die Lichter ausgeschaltet |
| `first_names` | leer | diese Szenen kommen in der Runde zuerst, in dieser Reihenfolge |
| `modes` | leer | Liste von `{entity, state (on), scenes}` – solange die Entität diesen Zustand hat, kommen ihre Szenen direkt nach „aus“; der oberste Modus zuerst |
| `lights_plan_always` | an | im Grundriss eingetragene Lichter zählen immer; aus = die Listen unten filtern sie auch |
| `lights_allow_integrations` / `_labels` | leer | nicht leer: nur Bereichs-Lichter dieser Integrationen (`loxone`, `shelly`, `hue`, `template`, `group` …) / Labels zählen – Schalter des Bereichs zählen, wenn sie ein erlaubtes Label tragen |
| `lights_block_integrations` / `_labels` | leer | diese schalten nie und halten den Raum nie „an“ (z. B. Status-LEDs) |

**Felder, die die Karte schickt:** `room` (Bereichs-ID), `event` (Ereignisname, `…_twice` für zweimal, oder `config` – das
Skript antwortet, welche Tasten zweimal nutzen und `double_ms`; die Karte fragt höchstens einmal pro Minute), `lights`
und `players` (die Entitäten des Raums aus dem Plan; leer = das Skript nimmt die des Bereichs, gefiltert). Modus
`parallel`, höchstens 10 gleichzeitig.

**Abhängigkeiten:** Für die Szenen-Aktionen braucht es Szenen (sonst Licht an/aus); `off_names` / `first_names` /
`modes` ordnen nur Szenen; die Erlauben-/Sperren-Listen wirken nur bei Räumen ohne Entitäten im Plan, außer
`…_plan_always` ist aus; `double_ms` verzögert nur Tasten mit Zweimal-Aktion; Farbtasten gibt es nur mit dem TV Streamer.

**Welche Lichter?** Genau die im Editor für den Raum eingetragenen (Licht, Hauptlicht – auch Schalter). Nur ein Raum
ohne Einträge nimmt die Lichter seines Bereichs, gefiltert durch die Listen. Szenen schalten, was sie enthalten. Ein
Raum ohne Szenen schaltet seine Lichter an und aus. Die Szenenrunde: aus → erste Szenen → die übrigen (alphabetisch) →
aus. Das Skript läuft einmal je Ereignis (Modus *parallel*); eine Automation ist nicht nötig.

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
aus_schalter: {site: true, zuhause: alle, ranch: false}   # Aus-Schalter – Werte und Beispiele unten
musik_aus: pause            # pause | stop | off
aus_mit_aussen: false       # „Gebäude aus“ schließt die Außenbereiche ein
buttons:                    # eigene Schaltflächen links oben, je Ebene, mit den üblichen HA-Aktionen
  site:
    - {icon: mdi:flash, name: Energie, tap_action: {action: navigate, navigation_path: /energy}}
  zuhause:
    - {icon: mdi:cctv, name: Kameras, tap_action: {action: navigate, navigation_path: "#kameras"}}
```

**Grundstücks-Schlüssel** (vom Grundstücks-Editor gespeichert oder im `site:` der Karte):

| Schlüssel | Werte (Standard) | Wirkung |
|---|---|---|
| `buildings[].plan` | Grundriss-ID | der als Gebäude platzierte Grundriss |
| `buildings[].name` | Text (Name des Plans) | Name in der Leiste und auf dem Badge |
| `buildings[].site_floor` | Stockwerks-ID (unterstes) | das auf dem Grundstück gezeigte Stockwerk |
| `buildings[].building` | ID eines Gebäudeteils | nur dieser Teil des Grundrisses |
| `buildings[].x`, `y`, `rotation`, `scale` | Meter, Grad, Faktor (nebeneinander, 0, 1) | Lage auf dem Grundstück; gesetzt durch Ziehen, Maßlinien oder Ausrichten |
| `buildings[].label_at` | `[x, y]` (Mitte) | wo das Badge sitzt – Namen im Editor ziehen |
| `areas[]` | `{id, name, area, poly, licht, hauptlicht, musik, praesenz, bewegung, fenster, beschattung, temp, area_live}` | gemeinsame Außenbereiche, verhalten sich wie Räume |
| `links[]` | `{plan, at, to, to_at, dx, dy}` | Maßlinien: Ecke `at` von `plan` sitzt an Ecke `to_at` von `to` + Abstand; 1 Linie = Lage, 2 = auch Drehung |
| `north` | Grad (0 = oben) | Norden in der Grundstücksansicht; Gebäudeansichten berechnen ihren daraus und aus ihrer Drehung |
| `ausrichtung` | `achse` / `norden` (`achse`) | Gebäudeansichten an der eigenen Achse oder Norden oben (Karten-Option übersteuert) |
| `raster` | `true` (`false`) | 5-m-Raster in der Grundstücksansicht |
| `site_background` | `{image, x, y, width, height, rotation, opacity, mode}` | Hintergrund des Grundstücks (gemeinsamer Lageplan) |
| `show` | Liste von Grundriss-IDs (alle) | nur diese Gebäude; eines = dieses Gebäude allein ohne Grundstücksebene |

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
- **Eigene Schaltfläche, die ein Pop-up oder Dashboard öffnet** – im Karten-Editor *+ Schaltfläche*, Ebene und Symbol
  wählen, Aktion *Navigieren* mit dem Pfad `#kameras` (ein Bubble-Card-Pop-up mit diesem Hash) oder
  `/dashboard-tv/kameras` (eine Dashboard-Ansicht). Den Aus-Schalter gibt es dort als Schalter je Ebene. In YAML:

```yaml
buttons:
  site:
    - {icon: mdi:cctv, name: Kameras, tap_action: {action: navigate, navigation_path: "#kameras"}}
    - {icon: mdi:flash, name: Energie, tap_action: {action: navigate, navigation_path: /energy}}
  ranch:
    - {icon: mdi:horse, tap_action: {action: more-info, entity: sensor.stall_temperatur}}
aus_schalter:              # Aus-Schalter (oben rechts) – Schlüssel: site, <grundriss-id> (Gebäude) oder <grundriss-id>:<stockwerk> (ein Stockwerk, hat Vorrang)
  site: true                # Grundstück: „Alles aus“ (true = Standard, false = keiner)
  ranch: false              # kein Aus-Schalter in der Ranch
  zuhause: alle             # Haus: „Haus aus“ + „Haus EG aus“ + „Haus OG aus“ + … (einer je Stockwerk)
  zuhause:dg: false         # aber in der Dachgeschoss-Ansicht gar keiner
```

| Wert | Schalter in einer Gebäudeansicht |
|---|---|
| `true` / nicht gesetzt | „<Gebäude> aus“ – das ganze Gebäude |
| `stockwerk` | „<Gebäude> OG aus“ – nur die Räume des gezeigten Stockwerks |
| `beide` | „<Gebäude> aus“ + „<Gebäude> OG aus“ (das gezeigte Stockwerk) |
| `alle` | „<Gebäude> aus“ + ein Schalter je Stockwerk („EG aus“, „OG aus“ …), auf jedem Stockwerk |
| `false` | keiner |

Jeder Aus-Schalter braucht zwei Drücke innerhalb von 3 s; er schaltet die Lichter (Lichter, Schalter) aus und stoppt
die Musik (`musik_aus`) der im Plan eingetragenen Räume, die an sind oder spielen; Außenbereiche nur mit
`aus_mit_aussen: true`. Im Karten-Editor: *Aus-Schalter je Ebene*, eine Auswahl je Gebäude.
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
| `stairs` | `{level, poly (Lauflinie, unten → oben), width (1), steps (16), radius? (width × 0,6), form? (eckig / rund), to_level?, building?}` |
| `openings` | `{level, type: door/window/passage/garage/open/skylight, at, angle, width, depth?, flip?, round?, entities?, confirm?, confirm_text?, tap?}` – werden aus den Wänden ausgeschnitten; `open` = gar keine Wand zwischen zwei Räumen (offene Küche und Wohnzimmer) |
| `entities` | Entitäten je Raum-Schlüssel (wie `rooms` der Karte) |

## Englische und deutsche Namen

Jede Option kann englisch oder deutsch geschrieben werden – beides funktioniert, auch gemischt; der Karten-Editor
behält die Sprache deines YAML bei (neue Karten: deutsch). Die Skript-Vorlage ist nur englisch (Felder `room`, `event`,
`lights`, `players`; Ereignisse `up`, `down`, `wheel_up`, `wheel_down`, `yellow`, `play`, `pause`, `play_pause`, `stop`,
`next`, `previous`, `blue`, `green`, `red`, `double_tap`, `triple_tap`, zweimal gedrückt mit `_twice`).

| Deutsch | Englisch | | Deutsch | Englisch |
|---|---|---|---|---|
| `aus_schalter` | `off_buttons` | | `licht` | `light` |
| `musik_aus` | `music_off` | | `hauptlicht` | `main_light` |
| `aus_mit_aussen` | `off_with_outside` | | `praesenz` | `presence` |
| `ausrichtung` | `orientation` | | `bewegung` | `motion` |
| `kompass` | `compass` | | `temp` | `temperature` |
| `andere_geschosse` | `other_floors` | | `fenster` | `windows` |
| `nachbar_rand` | `neighbour_margin` | | `beschattung` | `shades` |
| `follow.<benutzer>.art` | `type` | | `musik` | `music` |
| `vorlage` | `template` | | `lichtfarbe` | `light_colour` |
| `ansicht` | `view` | | Werte `standort` / `fest` | `location` / `fixed` |
| `raum` | `room` | | `stockwerk` / `beide` / `alle` | `floor` / `both` / `all` |
| `ble_letzter` | `ble_last` | | `achse` / `norden` | `axis` / `north` |
| `max_alter` | `max_age` | | `grundstueck` (Startansicht) | `site` |
| Vorlagen-Variablen `benutzer`, `geraet` | `user`, `device` | | Adresse `?raum=`, `?ansicht=`, `?geraet=` | `?room=`, `?view=`, `?device=` |

## Probleme und Lösungen

| Problem | Lösung |
|---|---|
| **„Konfigurationsfehler“ bei allen Floorplan-Karten** (oft in der Companion-App nach einem Update) | die App hat noch das alte Frontend: Seite nach unten ziehen zum Neuladen; hilft das nicht, *Einstellungen → Companion App → Fehlerbehebung → Frontend-Cache zurücksetzen* und die App neu starten. Im Browser: Strg+Umschalt+R |
| Editor oder Karte sehen nach einem Update aus wie vorher | nach dem HACS-Update Home Assistant neu starten, dann die Seite neu laden (wie oben) |
| Tasten / Mausrad über einem Raum tun nichts | gibt es das Skript `script.raum_klick` (oder das aus `script:` der Karte)? Aus der Vorlage erstellen; seine Ablaufverfolgung zeigt, was ankam |
| ↑/↓ scrollen die Seite | Standard ist nein; `scroll_keys: true` nur für Fernbedienungen ohne Rad |
| Das Badge eines Gebäudes sitzt an der falschen Stelle | den Namen im Grundstücks-Editor verschieben |
| Die Karte zeigt ein altes Grundstück | ein in die Karte geschriebenes `site:` hat Vorrang vor dem gespeicherten – entfernen und `plan: <grundstück-id>` nutzen |

## Entwicklung

```sh
pip install -r requirements_test.txt
pytest
```

## Lizenz

[GPL-3.0](LICENSE)
