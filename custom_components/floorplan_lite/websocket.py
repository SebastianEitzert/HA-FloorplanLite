"""WebSocket commands for the card (read) and the editor (write, admin only)."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import Event, HomeAssistant, callback

from .const import DOMAIN, EVENT_UPDATED
from .store import PlanStore


def async_register(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_list)
    websocket_api.async_register_command(hass, ws_get)
    websocket_api.async_register_command(hass, ws_save)
    websocket_api.async_register_command(hass, ws_delete)
    websocket_api.async_register_command(hass, ws_subscribe)


def _store(hass: HomeAssistant) -> PlanStore:
    return hass.data[DOMAIN]


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/list"})
@callback
def ws_list(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    plans = _store(hass).plans.values()
    connection.send_result(msg["id"], [{"id": p["id"], "name": p["name"]} for p in plans])


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/get", vol.Required("plan_id"): str})
@callback
def ws_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    plan = _store(hass).plans.get(msg["plan_id"])
    if plan is None:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Plan not found")
        return
    connection.send_result(msg["id"], plan)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/save", vol.Required("plan"): dict})
@websocket_api.async_response
async def ws_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    try:
        plan = await _store(hass).async_save_plan(msg["plan"])
    except vol.Invalid as err:
        connection.send_error(msg["id"], websocket_api.ERR_INVALID_FORMAT, str(err))
        return
    hass.bus.async_fire(EVENT_UPDATED, {"plan_id": plan["id"]})
    connection.send_result(msg["id"], plan)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/delete", vol.Required("plan_id"): str})
@websocket_api.async_response
async def ws_delete(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    if not await _store(hass).async_delete_plan(msg["plan_id"]):
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Plan not found")
        return
    hass.bus.async_fire(EVENT_UPDATED, {"plan_id": msg["plan_id"]})
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/subscribe", vol.Required("plan_id"): str})
@callback
def ws_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Send the plan now and again whenever it is saved – the card redraws without reloading the page."""
    plan_id = msg["plan_id"]

    @callback
    def _updated(event: Event) -> None:
        if event.data.get("plan_id") == plan_id:
            connection.send_message(websocket_api.event_message(msg["id"], {"plan": _store(hass).plans.get(plan_id)}))

    connection.subscriptions[msg["id"]] = hass.bus.async_listen(EVENT_UPDATED, _updated)
    connection.send_result(msg["id"])
    connection.send_message(websocket_api.event_message(msg["id"], {"plan": _store(hass).plans.get(plan_id)}))
