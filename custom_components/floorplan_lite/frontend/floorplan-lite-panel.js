/*
 * Floorplan Lite – editor page in the sidebar (admin only).
 * Step 1: list, import and export plans as JSON, preview with the card. The drawing editor follows.
 */

const T = {
  de: { title: "Floorplan Lite", plans: "Grundrisse", none: "Noch kein Grundriss angelegt.", importT: "Import (JSON)",
    importB: "Importieren / Speichern", export: "Exportieren", del: "Löschen", confirm: "Grundriss „%s“ wirklich löschen?",
    saved: "Gespeichert: %s", preview: "Vorschau", hint: "Den Zeichen-Editor (Bild hochladen, nachzeichnen, Türen/Fenster) gibt es in der nächsten Version. Bis dahin lassen sich Grundrisse als JSON importieren.",
    card: "Karte im Dashboard:" },
  en: { title: "Floorplan Lite", plans: "Floor plans", none: "No floor plan yet.", importT: "Import (JSON)",
    importB: "Import / save", export: "Export", del: "Delete", confirm: "Really delete floor plan “%s”?",
    saved: "Saved: %s", preview: "Preview", hint: "The drawing editor (upload an image, trace, doors/windows) comes with the next version. Until then floor plans can be imported as JSON.",
    card: "Card in a dashboard:" },
};

class FloorplanLitePanel extends HTMLElement {
  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) { this._render(); this._load(); }
    if (this._card) this._card.hass = hass;
  }
  set narrow(v) { this._narrow = v; }
  set panel(p) { this._panel = p; }

  get _t() {
    const l = (this._hass && (this._hass.locale && this._hass.locale.language || this._hass.language)) || "en";
    return T[String(l).slice(0, 2)] || T.en;
  }

  async _load() {
    this._plans = await this._hass.callWS({ type: "floorplan_lite/list" });
    this._renderList();
  }

  _render() {
    const t = this._t;
    this.innerHTML = `
      <style>
        floorplan-lite-panel { display: block; height: 100%; overflow: auto; background: var(--primary-background-color); color: var(--primary-text-color); }
        .fl-wrap { max-width: 1100px; margin: 0 auto; padding: 16px; }
        .fl-head { display: flex; align-items: center; gap: 12px; font-size: 22px; margin: 4px 0 16px; }
        .fl-box { background: var(--card-background-color); border-radius: 12px; padding: 16px; margin-bottom: 16px;
          box-shadow: var(--ha-card-box-shadow, none); border: 1px solid var(--divider-color); }
        .fl-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--divider-color); }
        .fl-row:last-child { border-bottom: 0; }
        .fl-row .n { flex: 1; } .fl-row code { opacity: .7; }
        textarea { width: 100%; min-height: 160px; box-sizing: border-box; font-family: monospace; font-size: 12px;
          background: var(--primary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color); border-radius: 8px; padding: 8px; }
        button { font: inherit; padding: 6px 14px; border-radius: 8px; border: 1px solid var(--divider-color); cursor: pointer;
          background: var(--secondary-background-color); color: var(--primary-text-color); }
        button.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: transparent; }
        .fl-msg { margin-top: 8px; min-height: 1.2em; } .fl-msg.err { color: var(--error-color); }
        .fl-hint { opacity: .75; font-size: 14px; }
        pre { white-space: pre-wrap; margin: 6px 0 0; font-size: 12px; opacity: .8; }
      </style>
      <div class="fl-wrap">
        <div class="fl-head"><ha-icon icon="mdi:floor-plan"></ha-icon>${t.title}</div>
        <div class="fl-box"><h3 style="margin-top:0">${t.plans}</h3><div class="fl-list"></div></div>
        <div class="fl-box"><h3 style="margin-top:0">${t.importT}</h3><p class="fl-hint">${t.hint}</p>
          <textarea class="fl-json" spellcheck="false"></textarea>
          <div style="margin-top:8px"><button class="primary fl-save">${t.importB}</button></div>
          <div class="fl-msg"></div></div>
        <div class="fl-box fl-prev" hidden><h3 style="margin-top:0">${t.preview}</h3><div class="fl-card"></div>
          <p class="fl-hint">${t.card}</p><pre class="fl-yaml"></pre></div>
      </div>`;
    this.querySelector(".fl-save").addEventListener("click", () => this._save());
  }

  _renderList() {
    const t = this._t, list = this.querySelector(".fl-list");
    if (!this._plans.length) { list.innerHTML = `<div class="fl-hint">${t.none}</div>`; return; }
    list.innerHTML = this._plans.map((p) => `<div class="fl-row" data-id="${p.id}"><span class="n">${this._esc(p.name)} <code>${p.id}</code></span>` +
      `<button data-a="show">${t.preview}</button><button data-a="export">${t.export}</button><button data-a="del">${t.del}</button></div>`).join("");
    list.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => this._action(b.closest(".fl-row").getAttribute("data-id"), b.getAttribute("data-a"))));
  }

  async _action(id, a) {
    const t = this._t;
    if (a === "del") {
      if (!confirm(t.confirm.replace("%s", id))) return;
      await this._hass.callWS({ type: "floorplan_lite/delete", plan_id: id });
      return this._load();
    }
    if (a === "export") {
      const plan = await this._hass.callWS({ type: "floorplan_lite/get", plan_id: id });
      this.querySelector(".fl-json").value = JSON.stringify(plan, null, 1);
      return;
    }
    this._preview(id);
  }

  async _save() {
    const t = this._t, msg = this.querySelector(".fl-msg");
    msg.className = "fl-msg"; msg.textContent = "";
    try {
      const plan = await this._hass.callWS({ type: "floorplan_lite/save", plan: JSON.parse(this.querySelector(".fl-json").value) });
      msg.textContent = t.saved.replace("%s", plan.name);
      await this._load();
      this._preview(plan.id);
    } catch (e) {
      msg.className = "fl-msg err"; msg.textContent = (e && e.message) || String(e);
    }
  }

  _preview(id) {
    const box = this.querySelector(".fl-prev"), holder = this.querySelector(".fl-card");
    box.hidden = false;
    holder.innerHTML = "";
    this._card = document.createElement("floorplan-lite-card");
    this._card.setConfig({ plan: id, mode: "swipe", intro: false, tap: "none" });
    this._card.hass = this._hass;
    holder.appendChild(this._card);
    this.querySelector(".fl-yaml").textContent = `type: custom:floorplan-lite-card\nplan: ${id}\nmode: swipe`;
  }

  _esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]); }
}

if (!customElements.get("floorplan-lite-panel")) customElements.define("floorplan-lite-panel", FloorplanLitePanel);
