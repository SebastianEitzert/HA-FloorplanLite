"""Floorplan Lite: store, WebSocket API and setup."""

from __future__ import annotations

import pytest
import voluptuous as vol
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.floorplan_lite.const import DOMAIN
from custom_components.floorplan_lite.store import validate_plan

PLAN = {
    "id": "home",
    "name": "Home",
    "levels": [{"id": "eg", "name": "Ground floor", "short": "GF"}],
    "buildings": [{"id": "house", "name": "House"}],
    "outlines": [{"level": "eg", "building": "house", "poly": [[0, 0], [10, 0], [10, 8], [0, 8]]}],
    "rooms": [
        {"id": "kitchen", "level": "eg", "name": "Kitchen", "poly": [[0, 0], [5, 0], [5, 8], [0, 8]]},
        {"id": "garden", "level": "eg", "name": "Garden", "outdoor": True, "poly": [[10, 0], [20, 0], [20, 8], [10, 8]]},
    ],
    "openings": [{"level": "eg", "type": "door", "at": [5, 4], "angle": 90, "width": 0.9}],
    "entities": {"kitchen": {"licht": ["light.kitchen"], "temp": "climate.kitchen"}},
}


def test_validate_plan() -> None:
    plan = validate_plan(PLAN)
    assert plan["rotation"] == 0 and plan["openings"][0]["depth"] == 0.24
    with pytest.raises(vol.Invalid):
        validate_plan({**PLAN, "rooms": [{**PLAN["rooms"][0], "level": "og"}]})  # unknown level
    with pytest.raises(vol.Invalid):
        validate_plan({**PLAN, "id": "Bad Id"})
    with pytest.raises(vol.Invalid):
        validate_plan({**PLAN, "openings": [{"level": "eg", "type": "trapdoor", "at": [1, 1]}]})


async def _setup(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, unique_id=DOMAIN)
    entry.add_to_hass(hass)
    assert await async_setup_component(hass, DOMAIN, {})
    await hass.async_block_till_done()
    return entry


async def test_websocket_save_get_subscribe(hass: HomeAssistant, hass_ws_client, hass_admin_user) -> None:
    await _setup(hass)
    ws = await hass_ws_client(hass)

    await ws.send_json({"id": 1, "type": f"{DOMAIN}/subscribe", "plan_id": "home"})
    assert (await ws.receive_json())["success"]
    assert (await ws.receive_json())["event"] == {"plan": None}  # not there yet

    await ws.send_json({"id": 2, "type": f"{DOMAIN}/save", "plan": PLAN})
    msg = await ws.receive_json()
    if msg["id"] == 1:  # the subscription may report first
        pushed, msg = msg, await ws.receive_json()
    else:
        pushed = await ws.receive_json()
    assert msg["success"] and msg["result"]["id"] == "home"
    assert pushed["event"]["plan"]["name"] == "Home"

    await ws.send_json({"id": 3, "type": f"{DOMAIN}/list"})
    assert (await ws.receive_json())["result"] == [{"id": "home", "name": "Home"}]
    await ws.send_json({"id": 4, "type": f"{DOMAIN}/get", "plan_id": "home"})
    assert (await ws.receive_json())["result"]["rooms"][1]["outdoor"] is True

    await ws.send_json({"id": 5, "type": f"{DOMAIN}/save", "plan": {**PLAN, "levels": []}})
    msg = await ws.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "invalid_format"


async def test_save_needs_admin(hass: HomeAssistant, hass_ws_client, hass_read_only_access_token) -> None:
    await _setup(hass)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    await ws.send_json({"id": 1, "type": f"{DOMAIN}/save", "plan": PLAN})
    msg = await ws.receive_json()
    assert not msg["success"] and msg["error"]["code"] == "unauthorized"
    await ws.send_json({"id": 2, "type": f"{DOMAIN}/list"})  # reading is allowed (dashboards of normal users)
    assert (await ws.receive_json())["success"]


async def test_panel_and_card(hass: HomeAssistant, hass_client) -> None:
    entry = await _setup(hass)  # setting up the component loads the entry as well
    assert "floorplan-lite" in hass.data["frontend_panels"]
    client = await hass_client()
    resp = await client.get("/floorplan_lite_static/floorplan-lite-card.js")
    assert resp.status == 200 and "floorplan-lite-card" in await resp.text()
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert "floorplan-lite" not in hass.data["frontend_panels"]
