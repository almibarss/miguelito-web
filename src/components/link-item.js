import styles from "!raw-loader!sass-loader!./link.scss";

import html from "./template.html";

class LinkItem extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>${styles}</style>${html}`;

    this.buttons = {
      edit: this.shadowRoot.querySelector(".btn-action-edit"),
      delete: this.shadowRoot.querySelector(".btn-action-delete"),
      ok: this.shadowRoot.querySelector(".btn-confirm-ok"),
      cancel: this.shadowRoot.querySelector(".btn-confirm-cancel"),
    };
    this.data = {
      url: this.shadowRoot.querySelector(".url"),
      origin: this.shadowRoot.querySelector(".origin"),
    };
    this.inputs = {
      backhalf: this.shadowRoot.querySelector(".input-url input"),
      origin: this.shadowRoot.querySelector(".input-origin"),
    };
    this.item = this.shadowRoot.querySelector("li");

    this.inputs.backhalf.addEventListener("focus", this);
    this.inputs.backhalf.addEventListener("blur", this);
    Object.values(this.buttons).forEach((btn) => {
      btn.addEventListener("click", this);
    });
  }

  // noinspection JSUnusedGlobalSymbols
  disconnectedCallback() {
    Object.values(this.buttons).forEach((btn) => {
      btn.removeEventListener("click", this);
    });
  }

  static get observedAttributes() {
    return ["url", "origin"];
  }

  // noinspection JSUnusedGlobalSymbols
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "url":
        this.setUrl(newValue);
        break;
      case "origin":
        this.setOrigin(newValue);
        break;
      default:
        throw `invalid attribute ${name}`;
    }
  }

  setUrl(newValue) {
    this.url = new URL(newValue);
    this.updateUrl();
  }

  updateUrl() {
    this.data.url.href = this.url.href;
    this.data.url.textContent = this.url.host + this.url.pathname;
    this.inputs.backhalf.parentElement.replaceAllText(
      "afterbegin",
      `${this.url.host}/`
    );
    this.inputs.backhalf.value = this.url.pathname.replace(/^\//, "");
  }

  setOrigin(newValue) {
    this.data.origin.textContent = newValue;
    this.inputs.origin.value = newValue;
  }

  // noinspection JSUnusedGlobalSymbols

  handleEvent({ currentTarget: target, type }) {
    if (target === this.inputs.backhalf) {
      if (type === "focus") {
        this.inputs.backhalf.parentElement.style.borderColor =
          "var(--secondary)";
      } else if (type === "blur") {
        this.inputs.backhalf.parentElement.removeAttribute("style");
      }
    }

    if (type === "click") {
      if (target === this.buttons.edit) {
        this.setAttribute("action", "edit");
        this.startEdit();
      } else if (target === this.buttons.delete) {
        this.setAttribute("action", "delete");
      } else if (target === this.buttons.cancel) {
        this.removeAttribute("action");
      } else if (target === this.buttons.ok) {
        this.handleConfirm();
      }
    }
  }

  startEdit() {
    this.inputs.backhalf.select();
    this.inputs.backhalf.focus();
  }

  handleConfirm() {
    this.classList.add("is-confirm");
    this.disable();
    this.sendEvent();
  }

  disable() {
    this.setDisabled(true);
  }

  enable() {
    this.setDisabled(false);
  }

  setDisabled(value) {
    [...Object.values(this.buttons), ...Object.values(this.inputs)].forEach(
      (elem) => {
        elem.disabled = value;
      }
    );
  }

  sendEvent() {
    const currentAction = this.getAttribute("action");
    const event = new CustomEvent("confirm", {
      detail: {
        type: currentAction,
      },
    });
    if (currentAction === "edit") {
      event.detail.newData = {
        ...(this.inputs.backhalf.value !== this.backhalf && {
          backhalf: this.inputs.backhalf.value,
        }),
        ...(this.inputs.origin.value !== this.data.origin.textContent && {
          origin: this.inputs.origin.value,
        }),
      };
    }
    this.dispatchEvent(event);
  }

  async confirm({ success }) {
    this.classList.remove("is-confirm");
    if (success) {
      this.confirmSuccess();
    } else {
      this.confirmFailure();
    }
    return new Promise((resolve) => {
      setTimeout(
        (that) => {
          that.removeAttribute("action");
          that.classList.removeStartingWith("is-");
          this.enable();
          resolve();
        },
        2000,
        this
      );
    });
  }

  confirmSuccess() {
    if (this.getAttribute("action") === "edit") {
      this.url.pathname = this.inputs.backhalf.value;
      this.updateUrl();
      this.setAttribute("origin", this.inputs.origin.value);
    }
    this.classList.add("is-success");
  }

  confirmFailure() {
    if (this.getAttribute("action") === "edit") {
      this.reset();
    }
    this.classList.add("is-failure");
  }

  reset() {
    this.updateUrl();
    this.inputs.origin.value = this.getAttribute("origin");
  }

  deleteAnimated() {
    this.item.classList.add("removed-item");
    return new Promise((resolve) => {
      this.item.addEventListener("animationend", () => {
        this.remove();
        resolve();
      });
    });
  }

  filter(searchText) {
    this.highlightSearch(searchText);
    const match =
      this.url.pathname.includesCaseInsensitive(searchText) ||
      this.getAttribute("origin").includesCaseInsensitive(searchText);
    this.classList.toggle("is-hidden", !match);
    return match;
  }

  highlightSearch(searchText) {
    const regex = new RegExp(searchText, "i");
    for (const elem of [this.data.url, this.data.origin]) {
      elem.innerHTML = elem.innerHTML
        .replace(/(<mark class="background-warning">|<\/mark>)/gim, "")
        .replace(regex, '<mark class="background-warning">$&</mark>');
    }
  }

  get backhalf() {
    return this.url.pathname.replace(/^\//, "");
  }
}

window.customElements.define("link-item", LinkItem);
