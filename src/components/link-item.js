import styles from "!raw-loader!sass-loader!./link.scss";

import { Utils } from "../utils";
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
  }

  // noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    Object.values(this.inputs).forEach((input) => {
      input.addEventListener("keydown", this.handleActionKeys.bind(this));
      input.addEventListener(
        "input",
        this.disableConfirmOnEmptyInput.bind(this)
      );
    });
    Object.values(this.buttons).forEach((btn) => {
      btn.addEventListener("click", this.handleButtonClick.bind(this));
    });
  }

  // noinspection JSUnusedGlobalSymbols
  disconnectedCallback() {
    Object.values(this.inputs).forEach((input) => {
      input.removeEventListener("keydown", this.handleActionKeys.bind(this));
      input.removeEventListener(
        "input",
        this.disableConfirmOnEmptyInput.bind(this)
      );
    });
    Object.values(this.buttons).forEach((btn) => {
      btn.removeEventListener("click", this.handleButtonClick.bind(this));
    });
  }

  disableConfirmOnEmptyInput() {
    const isInputEmpty =
      this.inputs.backhalf.value.trim().length === 0 ||
      this.inputs.origin.value.trim().length === 0;
    this.buttons.ok.disabled = isInputEmpty;
  }

  handleActionKeys({ key }) {
    if (key === "Enter") {
      if (this.buttons.ok.disabled === false) {
        this.awaitConfirm();
      }
    } else if (key === "Escape") {
      this.cancelAction();
    }
  }

  handleButtonClick({ currentTarget: button }) {
    if (button === this.buttons.edit) {
      this.setAttribute("action", "edit");
      this.inputs.backhalf.select();
      this.inputs.backhalf.focus();
    } else if (button === this.buttons.delete) {
      this.setAttribute("action", "delete");
    } else if (button === this.buttons.ok) {
      this.awaitConfirm();
    } else if (button === this.buttons.cancel) {
      this.cancelAction();
    }
  }

  awaitConfirm() {
    this.buttons.ok.classList.add("waiting");
    this.disableInput();
    this.sendConfirmedEvent();
  }

  cancelAction() {
    this.removeAttribute("action");
    this.inputs.origin.value = this.data.origin.textContent;
    this.updateUrl();
  }

  confirm({ success }) {
    this.buttons.ok.classList.remove("waiting");
    if (success) {
      this.confirmSuccess();
    } else {
      this.confirmFailure();
    }
    return this.resetAfterDelay(); // so that the user can see the result feedback
  }

  confirmSuccess() {
    if (this.getAttribute("action") === "edit") {
      this.url.pathname = this.inputs.backhalf.value;
      this.updateUrl();
      this.setAttribute("origin", this.inputs.origin.value);
    }
    this.buttons.ok.classList.add("success");
  }

  confirmFailure() {
    if (this.getAttribute("action") === "edit") {
      this.updateUrl();
      this.inputs.origin.value = this.getAttribute("origin");
    }
    this.buttons.ok.classList.add("failure");
  }

  resetAfterDelay() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.removeAttribute("action");
        this.buttons.ok.classList.remove("success", "failure");
        this.enableInput();
        resolve();
      }, 2000);
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
    Utils.replaceAllTextWithinElement(
      this.inputs.backhalf.parentElement,
      `${this.url.host}/`,
      "afterbegin"
    );
    this.inputs.backhalf.value = this.url.pathname.replace(/^\//, "");
  }

  setOrigin(newValue) {
    this.data.origin.textContent = newValue;
    this.inputs.origin.value = newValue;
  }

  disableInput() {
    this.setDisabled(true);
  }

  enableInput() {
    this.setDisabled(false);
  }

  setDisabled(value) {
    [...Object.values(this.buttons), ...Object.values(this.inputs)].forEach(
      (elem) => {
        elem.disabled = value;
      }
    );
  }

  sendConfirmedEvent() {
    if (this.getAttribute("action") === "delete") {
      this.dispatchEvent(new Event("deleteConfirmed"));
    } else if (this.getAttribute("action") === "edit") {
      this.dispatchEvent(
        new CustomEvent("editConfirmed", { detail: this.changedData() })
      );
    }
  }

  changedData() {
    return {
      ...(this.inputs.backhalf.value !== this.backhalf && {
        backhalf: this.inputs.backhalf.value,
      }),
      ...(this.inputs.origin.value !== this.data.origin.textContent && {
        origin: this.inputs.origin.value,
      }),
    };
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
      this.url.pathname.toLowerCase().includes(searchText.toLowerCase()) ||
      this.getAttribute("origin")
        .toLowerCase()
        .includes(searchText.toLowerCase());
    this.classList.toggle("hidden", !match);
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
