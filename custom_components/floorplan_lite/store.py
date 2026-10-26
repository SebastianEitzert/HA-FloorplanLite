"""Plans are kept in Home Assistant's storage (.storage/floorplan_lite), one entry per site."""

from __future__ import annotations

import re
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import OPENING_TYPES, STORAGE_KEY, STORAGE_VERSION

ID = vol.All(str, vol.Match(r"^[a-z0-9_]{1,64}$"))
POINT = vol.All([vol.Coerce(float)], vol.Length(min=2, max=2))
POLY = vol.All([POINT], vol.Length(min=2, max=2000))
NUM = vol.Coerce(float)

BACKGROUND = vol.Schema(
    {
        vol.Required("image"): vol.All(str, vol.Length(max=500)),  # /api/image/serve/<id>/original or another URL
        vol.Optional("x", default=0): NUM,  # position of the upper left corner in metres
        vol.Optional("y", default=0): NUM,
        vol.Optional("width", default=20): vol.All(NUM, vol.Range(min=0.1)),  # width in metres (scale)
        vol.Optional("height"): vol.All(NUM, vol.Range(min=0.1)),  # default: from the image's aspect ratio
        vol.Optional("rotation", default=0): NUM,
        vol.Optional("opacity", default=1): vol.All(NUM, vol.Range(min=0, max=1)),
        vol.Optional("mode", default="under"): vol.In(["under", "over", "hidden"]),
    }
)

LEVEL = vol.Schema(
    {
        vol.Required("id"): ID,
        vol.Required("name"): vol.All(str, vol.Length(max=60)),
        vol.Optional("short"): vol.All(str, vol.Length(max=8)),
        vol.Optional("view"): vol.All([NUM], vol.Length(min=4, max=4)),  # x, y, width, height in metres
        vol.Optional("background"): BACKGROUND,
    }
)

ROOM = vol.Schema(
    {
        vol.Required("id"): ID,  # also the hash of the Bubble Card pop-up (#id) and the HA area by default
        vol.Required("level"): ID,
        vol.Required("poly"): POLY,
        vol.Optional("key"): ID,  # entity set to use (several polygons can share one room, e.g. a gallery)
        vol.Optional("name"): vol.Any(None, vol.All(str, vol.Length(max=60))),  # None: part of another room, no label
        vol.Optional("building"): ID,
        vol.Optional("label_at"): POINT,
        vol.Optional("small", default=False): bool,
        vol.Optional("outdoor", default=False): bool,
        vol.Optional("color"): vol.All(str, vol.Length(max=32)),
        vol.Optional("area"): vol.All(str, vol.Length(max=255)),  # Home Assistant area the room stands for
    }
)

OUTLINE = vol.Schema(
    {
        vol.Required("level"): ID,
        vol.Required("poly"): POLY,
        vol.Optional("building"): ID,
        vol.Optional("ref"): vol.In(["outside", "center", "inside"]),  # which face the drawn line is (default centre)
    }
)

WALL = vol.Schema(  # inner wall: centre line, open or closed
    {
        vol.Required("level"): ID,
        vol.Required("poly"): POLY,
        vol.Optional("width"): vol.All(NUM, vol.Range(min=0.02, max=1.5)),  # thickness in metres, default style.wall_width
        vol.Optional("closed", default=False): bool,
    }
)

LINE = vol.Schema(  # dashed helper lines, e.g. a canopy or a terrace
    {
        vol.Required("level"): ID,
        vol.Required("poly"): POLY,
        vol.Optional("open", default=False): bool,
    }
)

ENTITY_LIST = vol.All([vol.All(str, vol.Length(max=255))], vol.Length(max=50))

OPENING = vol.Schema(
    {
        vol.Required("level"): ID,
        vol.Required("type"): vol.In(OPENING_TYPES),
        vol.Required("at"): POINT,  # centre on the wall
        vol.Optional("angle", default=0): NUM,  # direction of the wall in degrees (0 = along x)
        vol.Optional("width", default=0.9): vol.All(NUM, vol.Range(min=0.1, max=20)),
        vol.Optional("depth", default=0.24): vol.All(NUM, vol.Range(min=0.05, max=20)),  # wall thickness to cut, skylight: length
        vol.Optional("flip", default=False): bool,  # door swing side
        vol.Optional("entity"): vol.All(str, vol.Length(max=255)),  # older plans: one entity
        vol.Optional("entities"): ENTITY_LIST,  # window contact, cover, lock, garage door, button …
        vol.Optional("round", default=False): bool,  # skylight: a dome instead of a rectangle
        vol.Optional("confirm"): bool,  # ask before switching (default: doors and gates yes, windows no)
        vol.Optional("confirm_text"): vol.All(str, vol.Length(max=120)),  # own question instead of "Unlock?" / "Open?"
        vol.Optional("tap"): vol.In(["auto", "info"]),  # info: tapping only shows the entity's dialog
        vol.Optional("tilt_attribute"): vol.All(str, vol.Length(max=64)),  # tilted when this attribute of a contact …
        vol.Optional("tilt_value"): vol.All(str, vol.Length(max=64)),  # … (or tilt_entity's state) has this value
        vol.Optional("tilt_entity"): vol.All(str, vol.Length(max=255)),  # own entity for "tilted" (binary_sensor: on)
    }
)

ROOM_ENTITIES = vol.Schema(
    {
        vol.Optional("praesenz"): ENTITY_LIST,
        vol.Optional("bewegung"): ENTITY_LIST,
        vol.Optional("licht"): ENTITY_LIST,
        vol.Optional("hauptlicht"): vol.All(str, vol.Length(max=255)),  # fills the room; the other lights only as a seam
        vol.Optional("temp"): vol.All(str, vol.Length(max=255)),
        vol.Optional("fenster"): ENTITY_LIST,
        vol.Optional("beschattung"): ENTITY_LIST,
        vol.Optional("musik"): ENTITY_LIST,
    }
)

PLAN = vol.Schema(
    {
        vol.Required("id"): ID,
        vol.Required("name"): vol.All(str, vol.Length(max=80)),
        vol.Optional("rotation", default=0): NUM,  # turns the whole plan on screen (degrees)
        vol.Optional("north", default=0): NUM,  # direction of north in plan coordinates (degrees, 0 = up)
        vol.Optional("align_levels", default=False): bool,
        vol.Optional("room_walls", default=True): bool,  # rooms draw walls along their edges (plans without inner walls)  # all levels in one frame (upper levels above lower ones)
        vol.Optional("hide_label"): vol.All(str, vol.Length(max=255)),  # entities with this label are ignored
        vol.Optional("style", default=dict): vol.Schema({vol.Optional(str): vol.Any(str, NUM, [str])}),
        vol.Optional("buildings", default=list): [vol.Schema({vol.Required("id"): ID, vol.Required("name"): str})],
        vol.Required("levels"): vol.All([LEVEL], vol.Length(min=1, max=30)),
        vol.Optional("outlines", default=list): [OUTLINE],
        vol.Optional("walls", default=list): [WALL],
        vol.Optional("lines", default=list): [LINE],
        vol.Optional("rooms", default=list): [ROOM],
        vol.Optional("openings", default=list): [OPENING],
        vol.Optional("entities", default=dict): {ID: ROOM_ENTITIES},
    },
    extra=vol.REMOVE_EXTRA,
)


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9_]+", "_", text.lower()).strip("_")[:64] or "plan"


class PlanStore:
    """All plans of this Home Assistant instance."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.plans: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self.plans = dict(data.get("plans") or {})

    async def async_save_plan(self, plan: dict[str, Any]) -> dict[str, Any]:
        plan = validate_plan(plan)
        self.plans[plan["id"]] = plan
        await self._store.async_save({"plans": self.plans})
        return plan

    async def async_delete_plan(self, plan_id: str) -> bool:
        if self.plans.pop(plan_id, None) is None:
            return False
        await self._store.async_save({"plans": self.plans})
        return True


def validate_plan(plan: dict[str, Any]) -> dict[str, Any]:
    """Check a plan and its references (levels, buildings) – raises vol.Invalid."""
    plan = PLAN(plan)
    levels = {level["id"] for level in plan["levels"]}
    if len(levels) != len(plan["levels"]):
        raise vol.Invalid("level ids must be unique")
    buildings = {b["id"] for b in plan["buildings"]}
    for kind in ("outlines", "walls", "lines", "rooms", "openings"):
        for item in plan[kind]:
            if item["level"] not in levels:
                raise vol.Invalid(f"{kind}: unknown level {item['level']}")
            if item.get("building") and item["building"] not in buildings:
                raise vol.Invalid(f"{kind}: unknown building {item['building']}")
    return plan
