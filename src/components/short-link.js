import { dom } from "@fortawesome/fontawesome-svg-core";

import styles from "!raw-loader!sass-loader!./link.scss";

import { Fontawesome } from "../fontawesome";
import { Utils } from "../utils";
import html from "./template.html";

class ShortLink extends HTMLElement {
  constructor() {
    super()
      .attachShadow({ mode: "open", delegatesFocus: true })
      .innerHTML = `<style>${styles}</style>${html}`;

    const sr = this.shadowRoot;
    this.wrapperDiv = sr.querySelector("div");
    this.buttons = {
      edit: sr.querySelector(".btn-action-edit"),
      delete: sr.querySelector(".btn-action-delete"),
      ok: sr.querySelector(".btn-confirm-ok"),
      cancel: sr.querySelector(".btn-confirm-cancel")
    };
    this.data = {
      url: sr.querySelector(".url"),
      origin: sr.querySelector(".origin")
    };
    this.inputs = {
      backhalf: sr.querySelector(".input-url input"),
      origin: sr.querySelector(".input-origin")
    };
  }

// noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    Fontawesome.init();
    dom.i2svg({
      node: this.shadowRoot
    });
    this.wrapperDiv.addEventListener("keydown", this);
    Object.values(this.buttons).forEach((btn) => {
      btn.addEventListener("click", this);
    });
  }

  // noinspection JSUnusedGlobalSymbols
  disconnectedCallback() {
    this.wrapperDiv.removeEventListener("keydown", this);
    Object.values(this.buttons).forEach((btn) => {
      btn.removeEventListener("click", this);
    });
  }

  // noinspection JSUnusedGlobalSymbols
  handleEvent(event) {
    if (event.type === "keydown") {
      this.handleKeyPress(event);
    }
    if (event.type === "click") {
      this.handleButtonClick(event);
    }
  }

  handleKeyPress(event) {
    const userIsEditing = () => Object.values(this.inputs).includes(event.target);
    const buttonIsFocused = () => Object.values(this.buttons).includes(event.target);

    if (event.key === "Enter" && !buttonIsFocused()) {
      userIsEditing() || this.getAttribute("action") !== null ? this.awaitConfirm() : this.startEdit();
    }
    if (event.key === "Escape") {
      this.cancelAction();
    }
    if (["Backspace", "Delete"].includes(event.key) && !userIsEditing()) {
      this.startDelete();
    }
  }

  handleButtonClick({ currentTarget: button }) {
    if (button === this.buttons.edit) {
      this.startEdit();
    } else if (button === this.buttons.delete) {
      this.startDelete();
    } else if (button === this.buttons.ok) {
      this.awaitConfirm();
    } else if (button === this.buttons.cancel) {
      this.cancelAction();
    }
  }

  startDelete() {
    this.setAttribute("action", "delete");
    this.wrapperDiv.focus();
    this.dispatchEvent(new Event("actionRequired"));
  }

  startEdit() {
    this.setAttribute("action", "edit");
    this.inputs.backhalf.focus();
    this.dispatchEvent(new Event("actionRequired"));
  }

  awaitConfirm() {
    this.buttons.ok.classList.add("waiting");
    this.setAttribute("disabled", "")
    // this.disableInput();
    this.sendConfirmedEvent();
  }

  cancelAction() {
    this.removeAttribute("action");
    this.inputs.origin.value = this.data.origin.textContent;
    this.updateUrl();
    this.focus();
  }

  confirmAction({ success }) {
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
        this.removeAttribute("disabled");
        // this.enableInput();
        resolve();
      }, 2000);
    });
  }

  static get observedAttributes() {
    return ["url", "origin", "disabled"];
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
      case "disabled":
        newValue !== null ? this.disable() : this.enable();
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

  disable() {
    [this.wrapperDiv, this.data.url,
      ...Object.values(this.inputs),
      ...Object.values(this.buttons)
    ].forEach((focusable) => {
      focusable.setAttribute("tabindex", -1);
    });
  }

  enable() {
    [this.wrapperDiv, this.data.url,
      ...Object.values(this.inputs),
      ...Object.values(this.buttons)
    ].forEach((focusable) => {
      focusable.setAttribute("tabindex", 0);
    });
  }

  // disableInput() {
  //   this.setDisabled(true);
  // }
  //
  // enableInput() {
  //   this.setDisabled(false);
  // }
  //
  // setDisabled(value) {
  //   [...Object.values(this.buttons), ...Object.values(this.inputs)].forEach((elem) => {
  //       elem.disabled = value;
  //     }
  //   );
  // }

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
        backhalf: this.inputs.backhalf.value
      }),
      ...(this.inputs.origin.value !== this.data.origin.textContent && {
        origin: this.inputs.origin.value
      })
    };
  }

  deleteAnimated() {
    this.wrapperDiv.classList.add("removed-item");
    return new Promise((resolve) => {
      this.wrapperDiv.addEventListener("animationend", () => {
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
    return match;
  }

  highlightSearch(searchText) {
    const regex = new RegExp(searchText, "i");
    for (const elem of [this.data.url, this.data.origin]) {
      elem.innerHTML = elem.innerHTML
        .replace(/(<mark class="background-warning">|<\/mark>)/gim, "")
        .replace(regex, "<mark class=\"background-warning\">$&</mark>");
    }
  }

  get backhalf() {
    return this.url.pathname.replace(/^\//, "");
  }
}

window.customElements.define("short-link", ShortLink);
