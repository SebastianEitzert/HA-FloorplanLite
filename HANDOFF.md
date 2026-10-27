# HANDOFF – HA-FloorplanLite

Stand: 2026-10-27 (abends). Diese Datei wird bei jeder Änderung mitgepflegt. Keine Zugangsdaten hier ablegen.

## 1. Stand

| | |
|---|---|
| Letztes Release | **0.10.1**, Tag `v0.10.1` (GitHub-Release mit `floorplan_lite.zip`) |
| In Home Assistant eingespielt | 0.10.0 – 0.10.1 ist veröffentlicht, aber noch nicht über HACS installiert (über HACS, HA danach neu gestartet). Die neue englische Skript-Vorlage liegt unter `blueprints/script/floorplan_lite/room_click.yaml`, `script.raum_klick` ist darauf umgestellt. |
| Dateien unter `www/` | **keine** – die Karte und der Editor werden von der Integration selbst ausgeliefert |
| Ressourcen-URL | keine Lovelace-Ressource. Die Integration registriert `/floorplan_lite_static/floorplan-lite-card.js?v=<manifest-version>` per `add_extra_js_url`, der Editor (Seitenleiste) `/floorplan_lite_static/floorplan-lite-panel.js?v=<version>` |
| Alte Karte (Vorgänger) | `/local/kressbach-grundriss-card.js?v=6.10` als Lovelace-Ressource, wird auf `tv-dashboard/grundriss-test` noch zum Vergleich gezeigt |
| Branch mit neuer Arbeit | `next` (= `main` nach 0.10.0) |

## 2. Aktueller Auftrag

Grundstücks-Ebene mit Gebäuden, Außenbereichen, Startansicht/Standort, Aus-Schaltern und eigenen Buttons.

**Erledigt und released (0.6.0 – 0.9.0):**
- Grundstück als eigener Plan (`site` im Plan): Gebäude = andere Pläne, Lage/Drehung/Maßstab, Maßlinien (`links`), Norden (`north`), Ausrichtung der Gebäudeansichten (`ausrichtung`), Badge-Position (`label_at`), Hintergrund/Lageplan.
- Außenbereiche (`areas`) mit HA-Bereich und Entitäten; Punktfang, Ecken bearbeiten.
- Startansicht/Folgen je Benutzer (`follow`: Standort per Geofence + Bermuda-BLE, oder fest/Vorlage mit `geraet`), Adressparameter `?raum=`/`?ansicht=`/`?geraet=`.
- Aus-Schalter je Ebene/Stockwerk (`aus_schalter`: `true`/`false`/`stockwerk`/`beide`/`alle`), eigene Buttons je Ebene (`buttons`), beides im Karten-Editor.
- Windrose, Treppen (`stairs`), englische Aliase für alle Optionen, Skript-Vorlage auf Englisch.

**Released in 0.10.0:**
- Treppe per Klick auf die Fläche auswählbar (`floorplan-lite-panel.js`, Klasse `.shit`).
- Grundstücksgrenze `site.boundary` (Editor-Werkzeug „boundary“, Karte `.boundary`).
- Kein Zoom nach Schließen eines Pop-ups (`_open`, `_hashChanged` in `floorplan-lite-card.js`).
- Symbole für Grundstück/Gebäude (`site.icon`, `buildings[].icon`), zweizeilige Leiste am Handy, Aus-Menü (`.offm`).
- Feste Kartenhöhe (`_sizeViews`, Optionen `hoehe`/`height` mit `fill`, `legende`/`legend`, `rahmen`/`frame`).
- Wischen wechselt Stockwerke (`_pinch`), Zurück führt vom Gebäude aufs Grundstück (`_setHash` pusht).
- Aus-Schalter rufen das Skript je Raum mit `event: off` auf (`_off`), Vorlage: `off` → immer `room_off` (Aus-Szene).

**Released in 0.10.1:** Entitätsauswahl im Grundriss-Editor mit HA-Entitätspicker (`_entPick`, `_mountPicks` in `floorplan-lite-panel.js`; außerhalb von HA Textfeld als Ersatz).

**Halb fertig:** nichts offen im Code.

**Doku:** README hat Abschnitte zu Grundstück, Standort mit Bermuda, Kiosk Mode (seit 27.10. abends).

**Fehlt noch / offen:**
- Nach dem nächsten Release: TV-Karte auf `tv-dashboard` ggf. auf `height: fill` und `legend: false` stellen (Sebastian hat noch nicht zugestimmt).
- Prüfen am echten Gerät: Aus-Schalter schaltet Loxone-Präsenzlichter über die Aus-Szene wirklich aus; Höhe `fill` in HA (eigener Scrollbereich, evtl. `calc(100vh - 20px)` nötig).

## 3. Nicht committete / nicht gepushte Änderungen

Keine. Alles ist auf `next` gepusht (`git log main..next`).

## 4. Aufbau

```
custom_components/floorplan_lite/
  __init__.py        Setup: statische Pfade, Karte (add_extra_js_url), Editor-Panel, Blueprint-Installation
  websocket.py       WS-Befehle floorplan_lite/list|get|save|delete|subscribe
  store.py           Speicher (.storage) und voluptuous-Schema der Pläne (PLAN, SITE, STAIR …)
  config_flow.py     Einrichtung ohne Eingaben (eine Instanz)
  blueprints/script/room_click.yaml   Skript-Vorlage, wird nach <config>/blueprints/script/floorplan_lite/ kopiert
  frontend/floorplan-lite-card.js     Karte + Karten-Editor + Grundstücks-Editor-Element (kein Build, reines JS)
  frontend/floorplan-lite-panel.js    Grundriss-Editor (Seitenleiste)
  frontend/vendor/                    pdf.js für PDF-Hintergründe
tests/               pytest (pytest-homeassistant-custom-component)
tools/, docs/        Hilfsskripte, Bilder
```

- **Kein Bundling.** Die JS-Dateien werden direkt ausgeliefert. Prüfung: `node --check` für jede Datei. Die Karte muss Chrome 68 können: keine `??`, kein `?.`, kein `aspect-ratio`, kein `inset`, kein flex-`gap`, keine Klassenfelder. CI prüft `??`/`?.`.
- **Tests:** `pip install -r requirements_test.txt && pytest -q`. GitHub Action `validate.yml` (Python-Tests, JS-Syntax, Chrome-68-Check, hassfest/HACS).
- **Release:** Version in `custom_components/floorplan_lite/manifest.json` erhöhen, in `CHANGELOG.md` `## <version> – <Datum>` eintragen, `next` per fast-forward auf `main` mergen und pushen. `release.yml` erstellt Tag `v<version>`, Release-Notes und `floorplan_lite.zip`. Danach in HA über HACS aktualisieren und HA neu starten.
- **Commits:** Autor `SebastianEitzert <35038662+SebastianEitzert@users.noreply.github.com>` (keine private Mailadresse). Arbeit sammelt sich auf `next`, Release erst nach „alles drin“ von Sebastian.

## 5. Verbindung zu Home Assistant und zum TV Streamer

- Keine eigene Verbindung: die Karte nutzt die HA-Frontend-Verbindung (`hass.callWS`, `hass.callService`, `render_template`-Abo).
- Pläne liegen in HA `.storage` (Schlüssel siehe `const.py`), Zugriff nur über die WS-Befehle (Admin für save/delete).
- Tasten/Klicks/Rad über Räumen gehen an `script.raum_klick` (Felder `room`, `event`, `lights`, `players`; ältere Vorlage: `raum`, `aktion`, `lichter`, `player`). Die Karte erkennt die Vorlage an den Feldern des Skripts.
- TV Streamer: die Karte liest `window.__tvStreamer.name` (Gerätename für Vorlagen) und hört auf das Ereignis `tv-streamer-key` (Farb-/Medientasten). Die View-Adresse `#plan=…&floor=…` ist kein Pop-up (Streamer ab 0.4.8 berücksichtigt das bei Zurück).

## 6. Bekannte Fehler, offene Fragen, Entscheidungen

**Bekannt / offen:**
- Höhe `fill` ist nur im Testbrowser geprüft; in HA scrollt die Ansicht in einem eigenen Container.
- Die Symbole (ha-icon) sind im lokalen Test nicht sichtbar, in HA schon.
- Fragen an Sebastian: TV-Karte auf `height: fill` + `legend: false` umstellen? Commits weiter unter seinem Namen (der Stop-Hook möchte „Claude“, Sebastians Vorgabe hat Vorrang).

**Entscheidungen:**
- Grundstück im Grundriss-Editor statt in der Karte – dort sucht man es (Sebastian, 0.7.0).
- Maßlinien statt nur Ziehen – echte Abstände zwischen Gebäuden (0.7.2).
- Treppen „eckig“ als Standard mit der Stufenverteilung der runden Form – so sieht Sebastians Treppe aus; die „Verziehen“-Formel wurde verworfen, weil die runde Verteilung besser aussah.
- Geteilte Räume bekommen „keine Wand“ statt Raumwände generell abzuschalten – sonst wäre der Durchgang Küche–Wohnzimmer verloren gegangen.
- Skript-Vorlage nur Englisch, Kartenoptionen zweisprachig; der Karten-Editor behält die Sprache des YAML.
- Aus-Schalter über das Skript (Aus-Szene), weil direktes Ausschalten Loxone-Präsenzlichter nicht beendet.
- Gemeinsamer Rahmen für alle Ansichten (keine Höhensprünge), abschaltbar, höchstens so hoch wie breit.

## 7. Geänderte HA-Objekte

| Objekt | ID | Änderung | Sicherung |
|---|---|---|---|
| Skript | `script.raum_klick` | aus der Vorlage `floorplan_lite/room_click.yaml`; 27.10. Einstellungen auf englische Namen (`yellow`, `yellow_twice`, `play_twice`) | `script.script.raum_klick.20261026_202615.yaml`, `script.script.raum_klick.20261027_122341.yaml` |
| Dashboard | `tv-dashboard`, Ansicht `grundriss-test` (Index 3) | Testabschnitt „Grundstück (Test)“: Karte mit `plan: horsepower_ranch`, `follow` für Sebastian (Standort) und TV (fest/Vorlage), Buttons Kameras/Energie | – |
| Dashboard | `tv-dashboard` | `kiosk_mode` für Benutzer TV (bestand schon, nicht geändert) | – |
| Pläne (Floorplan-Speicher) | `zuhause`, `ranch`, `horsepower_ranch` | von Sebastian im Editor angelegt/bearbeitet | – |
| Blueprint | `blueprints/script/floorplan_lite/room_click.yaml` | wird bei jedem Start der Integration aus dem Paket aktualisiert | – |

Keine Automationen oder Helfer geändert.
