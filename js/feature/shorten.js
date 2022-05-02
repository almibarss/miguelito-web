import { API } from "../api";
import { Ui } from "../ui";

const customPathDiv = document.querySelector("div#custom-path");

export const Shorten = {
  init: () => {
    Ui.Forms.shorten.addEventListener("submit", submitUrl);
    Ui.Inputs.url.addEventListener("input", Ui.hideAlert);
    Ui.Inputs.url.addEventListener("input", function () {
      Ui.Buttons.submit.disabled = this.value.isEmpty();
    });
    Ui.Inputs.customPath.addEventListener("keydown", collapseIfEscPressed);
    Ui.Buttons.customize.addEventListener("click", expandCustomize);
    document.addEventListener("paste", pasteIntoUrlInputAsDefault);
  },
  shorten: (inputUrl, customPath) => {
    freezeUi();
    API.shorten(inputUrl, customPath)
      .then((shortUrl) => handleOk(inputUrl, shortUrl))
      .catch((error) => Ui.error(error.message))
      .finally(unfreezeUi);
  },
  Customize: {
    collapse: () => {
      if (customPathDiv.classList.contains("hidden")) {
        return;
      }

      Ui.Buttons.customize.show();
      customPathDiv.hide();
      Ui.Inputs.customPath.value = "";
    },
    allow: () => {
      Ui.Buttons.customize.show();
    },
    disallow: () => {
      Ui.Buttons.customize.hide();
    },
  },
};

function submitUrl(ev) {
  ev.preventDefault();

  const {
    // eslint-disable-next-line prettier/prettier
    "url": { value: inputUrl },
    "custom-path": { value: customPath },
  } = ev.target;
  Shorten.shorten(inputUrl, customPath);
}

function freezeUi() {
  Ui.waiting();
  Ui.Buttons.submit.disabled = true;
  Ui.Inputs.url.disabled = true;
  document.removeEventListener("paste", pasteIntoUrlInputAsDefault);
}

function unfreezeUi() {
  Ui.Buttons.submit.disabled = false;
  Ui.Inputs.url.disabled = false;
  document.addEventListener("paste", pasteIntoUrlInputAsDefault);
}

function handleOk(longUrl, shortUrl) {
  Ui.shortenedUrl(longUrl, shortUrl);
  Ui.Inputs.url.value = "";
  Shorten.Customize.collapse();
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

function expandCustomize() {
  Ui.Buttons.customize.hide();
  customPathDiv.show();
  Ui.Inputs.customPath.focus();
}

function collapseIfEscPressed({ key }) {
  if (key === "Escape") {
    Shorten.Customize.collapse();
  }
}
