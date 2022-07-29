import { API } from "../api";
import { currentUser } from "../auth";
import { Ui } from "../ui";

export const Shorten = {
  init: () => {
    document.addEventListener("baseUrlReceived", ({ detail: baseUrl }) => {
      Ui.Inputs.backhalf.replaceAllText("afterbegin", `${baseUrl.hostname}/`);
    });
    Ui.Forms.shorten.addEventListener("submit", submitUrl);
    Ui.Inputs.url.addEventListener("input", Ui.hideAlert);
    Ui.Inputs.url.addEventListener("input", function () {
      Ui.Buttons.submit.disabled = this.value.isEmpty();
    });
    Ui.Inputs.backhalfEditable.addEventListener(
      "keydown",
      collapseIfEscPressed
    );
    Ui.Buttons.customize.addEventListener("click", Shorten.expandCustomize);
    document.addEventListener("paste", pasteIntoUrlInputAsDefault);
  },
  shorten: (url, backhalf) => {
    freezeUi();
    API.shorten(url, backhalf)
      .then(handleOk)
      .catch((error) => Ui.error(error.message))
      .finally(unfreezeUi);
  },

  expandCustomize: () => {
    currentUser().then(doExpandCustomize).catch(denyCustomizeAndPromptLogin);
  },
};

function submitUrl(ev) {
  ev.preventDefault();
  const {
    url: { value: url },
    backhalf: { value: backhalf },
  } = ev.target;
  Shorten.shorten(url, backhalf);
}

function freezeUi() {
  Ui.waiting();
  Ui.Buttons.submit.disabled = true;
  Ui.Inputs.url.disabled = true;
  document.removeEventListener("paste", pasteIntoUrlInputAsDefault);
}

function unfreezeUi() {
  Ui.Inputs.url.disabled = false;
  Ui.Buttons.submit.disabled = Ui.Inputs.url.value.isEmpty();
  document.addEventListener("paste", pasteIntoUrlInputAsDefault);
}

function handleOk(newLink) {
  Ui.shortenedUrl(newLink.origin, newLink.url);
  resetUi();
  sendEvent(newLink);
}

function sendEvent(newLink) {
  const event = new CustomEvent("linkCreated", {
    detail: newLink,
  });
  document.dispatchEvent(event);
}

function resetUi() {
  Ui.Inputs.url.value = "";
  collapseCustomize();
}

function pasteIntoUrlInputAsDefault(ev) {
  if (ev.target === Ui.Inputs.url) {
    // allow normal paste when url input is focused
    return;
  }
  if (!Ui.Tabs.Shorten.isActive()) {
    // do not intercept URLs when other tabs are active
    return;
  }
  const paste = (ev.clipboardData || window.clipboard).getData("text");
  if (!containsValidUrl(paste)) {
    // do not automatically paste other than URLs
    return;
  }

  ev.preventDefault();
  Ui.Inputs.url.value = paste;
  Ui.Inputs.url.dispatchEvent(new Event("input"));
}

function containsValidUrl(text) {
  try {
    new URL(text);
    return true;
  } catch (ignored) {
    return false;
  }
}

function collapseCustomize() {
  Ui.Inputs.backhalf.hide();
  Ui.Buttons.customize.show();
}

function doExpandCustomize() {
  Ui.Buttons.customize.hide();
  Ui.Inputs.backhalf.show();
  Ui.Inputs.backhalfEditable.value = "";
  Ui.Inputs.backhalfEditable.focus();
}

function denyCustomizeAndPromptLogin() {
  Ui.Buttons.customize.classList.add("shake-horizontal");
  Ui.Buttons.customize.addEventListener("animationend", function () {
    this.classList.remove("shake-horizontal");
    Ui.Buttons.login.classList.add("shake-top");
    Ui.Buttons.login.addEventListener("animationend", function () {
      this.classList.remove("shake-top");
    });
  });
}

function collapseIfEscPressed({ key }) {
  if (key === "Escape") {
    collapseCustomize();
  }
}
