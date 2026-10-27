# HANDOFF – HA-FloorplanLite

Stand: 2026-10-27. Diese Datei wird bei jeder Änderung mitgepflegt. Sie ist öffentlich: keine Zugangsdaten, IPs, Entitäts-IDs, Plan- oder Benutzernamen. Installationsbezogene Details stehen in einer privaten Übergabedatei außerhalb des Repos.

## 1. Stand

| | |
|---|---|
| Letztes Release | **0.10.1**, Tag `v0.10.1` (GitHub-Release mit `floorplan_lite.zip`) |
| Dateien unter `www/` | keine – Karte und Editor werden von der Integration ausgeliefert |
| Ressourcen-URL | keine Lovelace-Ressource. Die Integration registriert `/floorplan_lite_static/floorplan-lite-card.js?v=<version>` per `add_extra_js_url`, den Editor `/floorplan_lite_static/floorplan-lite-panel.js?v=<version>` |
| Branch mit neuer Arbeit | `next` (= `main` nach 0.10.1) |

## 2. Funktionsumfang (bis 0.10.1)

- Grundstück als eigener Plan (`site`): Gebäude, Lage/Drehung/Maßstab, Maßlinien, Norden, Hintergrund, Grundstücksgrenze, Symbole.
- Außenbereiche (`areas`), Treppen (`stairs`), Startansicht/Folgen je Benutzer (`follow`), Adressparameter.
- Aus-Schalter je Ebene/Stockwerk über das Skript (`event: off`), eigene Buttons, feste Kartenhöhe, Wischen zwischen Stockwerken.
- Englische Aliase für alle Optionen, Skript-Vorlage auf Englisch, Entitätspicker im Editor.

Halb fertig: nichts. Offen: Höhe `fill` in HA am echten Gerät prüfen.

## 3. Nicht gepushte Änderungen

Keine.

## 4. Aufbau

```
custom_components/floorplan_lite/
  __init__.py        Setup: statische Pfade, Karte (add_extra_js_url), Editor-Panel, Blueprint-Installation
  websocket.py       WS-Befehle floorplan_lite/list|get|save|delete|subscribe
  store.py           Speicher (.storage) und Schema der Pläne
  config_flow.py     Einrichtung ohne Eingaben (eine Instanz)
  blueprints/script/room_click.yaml   Skript-Vorlage, wird nach <config>/blueprints/script/floorplan_lite/ kopiert
  frontend/floorplan-lite-card.js     Karte + Karten-Editor (kein Build, reines JS)
  frontend/floorplan-lite-panel.js    Grundriss-Editor (Seitenleiste)
  frontend/vendor/                    pdf.js für PDF-Hintergründe
tests/               pytest (pytest-homeassistant-custom-component)
tools/, docs/        Hilfsskripte, Bilder
```

- **Kein Bundling.** Prüfung: `node --check` je Datei. Die Karte muss Chrome 68 können: keine `??`, kein `?.`, kein `aspect-ratio`, kein `inset`, kein flex-`gap`, keine Klassenfelder. CI prüft `??`/`?.`.
- **Tests:** `pip install -r requirements_test.txt && pytest -q`. Action `validate.yml` (Python-Tests, JS-Syntax, Chrome-68-Check, hassfest/HACS).

## 5. Release

Version in `custom_components/floorplan_lite/manifest.json` erhöhen, `CHANGELOG.md` `## <version> – <Datum>`, `next` per fast-forward auf `main` mergen und pushen. `release.yml` erstellt Tag `v<version>`, Release-Notes und `floorplan_lite.zip`. Danach in HA über HACS aktualisieren und HA neu starten.

Arbeitsweise: Änderungen sammeln sich auf `next`; Release erst, wenn der Maintainer es freigibt. Commits unter der GitHub-noreply-Adresse des Maintainers. Doku zweisprachig (Deutsch/Englisch), Skript-Vorlage Englisch.

## 6. Schnittstellen

- Die Karte nutzt die HA-Frontend-Verbindung (`hass.callWS`, `hass.callService`, `render_template`-Abo). Pläne liegen in `.storage`, Zugriff nur über die WS-Befehle (Admin für save/delete).
- Klicks/Tasten über Räumen gehen an das konfigurierte Skript (Felder `room`, `event`, `lights`, `players`; ältere Vorlage `raum`, `aktion`, `lichter`, `player`).
- TV-Streamer: die Karte liest `window.__tvStreamer.name` und hört auf das Ereignis `tv-streamer-key`. Die View-Adresse `#plan=…&floor=…` ist kein Pop-up.

## 7. Entscheidungen

- Grundstück im Grundriss-Editor statt in der Karte.
- Maßlinien statt nur Ziehen – echte Abstände zwischen Gebäuden.
- Treppen „eckig“ als Standard mit der Stufenverteilung der runden Form.
- Geteilte Räume bekommen „keine Wand“ statt Raumwände generell abzuschalten.
- Skript-Vorlage nur Englisch, Kartenoptionen zweisprachig.
- Aus-Schalter über das Skript (Aus-Szene), weil direktes Ausschalten Präsenz-gesteuerte Lichter nicht beendet.
- Gemeinsamer Rahmen für alle Ansichten (keine Höhensprünge), abschaltbar.
