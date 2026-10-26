"""Constants for Floorplan Lite."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "floorplan_lite"
NAME: Final = "Floorplan Lite"

STORAGE_KEY: Final = DOMAIN
STORAGE_VERSION: Final = 1

# Frontend files (card and editor panel) are served from the integration folder.
STATIC_URL: Final = "/floorplan_lite_static"
CARD_FILE: Final = "floorplan-lite-card.js"
PANEL_FILE: Final = "floorplan-lite-panel.js"
PANEL_URL_PATH: Final = "floorplan-lite"
PANEL_COMPONENT: Final = "floorplan-lite-panel"

EVENT_UPDATED: Final = f"{DOMAIN}_updated"  # a plan was saved or deleted

# Opening types a wall can have
OPENING_TYPES: Final = ["window", "door", "passage", "garage"]
