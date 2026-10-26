"""Floorplan Lite: floor plans for Home Assistant dashboards – light on CPU and GPU, high-quality look.

The integration stores the plans (buildings, levels, rooms, walls, openings, background images) centrally, serves the
Lovelace card (loaded automatically in every dashboard) and adds the editor as a page in the sidebar.
"""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from . import websocket
from .const import CARD_FILE, DOMAIN, NAME, PANEL_COMPONENT, PANEL_FILE, PANEL_URL_PATH, STATIC_URL
from .store import PlanStore

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
FRONTEND_DIR = Path(__file__).parent / "frontend"
BLUEPRINT_DIR = Path(__file__).parent / "blueprints"


def _version() -> str:
    # cache-busting query for the browser: changes with every release
    import json

    return json.loads((Path(__file__).parent / "manifest.json").read_text())["version"]


def _install_blueprints(config_dir: str) -> None:
    """Copy the bundled blueprints to <config>/blueprints/<domain>/floorplan_lite/ – again whenever a release changed them."""
    for src in BLUEPRINT_DIR.glob("*/*.yaml"):
        dst = Path(config_dir) / "blueprints" / src.parent.name / DOMAIN / src.name
        text = src.read_text(encoding="utf-8")
        if dst.exists() and dst.read_text(encoding="utf-8") == text:
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(text, encoding="utf-8")


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    store = PlanStore(hass)
    await store.async_load()
    hass.data[DOMAIN] = store
    websocket.async_register(hass)
    version = await hass.async_add_executor_job(_version)
    await hass.http.async_register_static_paths([StaticPathConfig(STATIC_URL, str(FRONTEND_DIR), cache_headers=False)])
    # the card is available in every dashboard without adding a resource by hand
    frontend.add_extra_js_url(hass, f"{STATIC_URL}/{CARD_FILE}?v={version}")
    hass.data[f"{DOMAIN}_version"] = version
    # the script blueprint behind the card's keys, clicks and wheel (script.raum_klick by default)
    await hass.async_add_executor_job(_install_blueprints, hass.config.config_dir)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    version = hass.data[f"{DOMAIN}_version"]
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_COMPONENT,
        sidebar_title=NAME,
        sidebar_icon="mdi:floor-plan",
        module_url=f"{STATIC_URL}/{PANEL_FILE}?v={version}",
        require_admin=True,
        config={},
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    frontend.async_remove_panel(hass, PANEL_URL_PATH)
    return True
