import { shorten } from "../api";
import { Ui } from "../ui";

const customPathDiv = document.querySelector("div#custom-path");

export const Shorten = {
  init: () => {
    Ui.Forms.shorten.addEventListener("submit", submitUrl);
    Ui.Inputs.url.addEventListener("input", Ui.clearMessage);
    Ui.Inputs.url.addEventListener("input", function () {
      Ui.Buttons.submit.disabled = this.value.isEmpty();
    });
    Ui.Inputs.customPath.addEventListener("keydown", collapseIfEscPressed);
    Ui.Buttons.customize.addEventListener("click", expandCustomize);
    document.addEventListener("paste", pasteIntoUrlInputAsDefault);
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

String.prototype.isEmpty = function () {
  return this.length === 0 || !this.trim();
};

function submitUrl(ev) {
  ev.preventDefault();
  Ui.waiting();

  const {
    // eslint-disable-next-line prettier/prettier
    "url": { value: inputUrl },
    "custom-path": { value: customPath },
  } = ev.target;
  shorten(inputUrl, customPath)
    .then((shortUrl) => handleOk(inputUrl, shortUrl))
    .catch((error) => Ui.error(error.message));
}

function handleOk(longUrl, shortUrl) {
  Ui.shortenedUrl(longUrl, shortUrl);
  Ui.Inputs.url.value = "";
  Shorten.Customize.collapse();
}

function pasteIntoUrlInputAsDefault(ev) {
  ev.preventDefault();

  const paste = (ev.clipboardData || window.clipboard).getData("text");
  Ui.Inputs.url.value = paste;
  Ui.Inputs.url.dispatchEvent(new Event("input"));
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
