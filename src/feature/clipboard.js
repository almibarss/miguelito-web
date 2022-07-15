import { currentUser } from "../auth";
import { Ui } from "../ui";
import { Shorten } from "./shorten";

let watchInterval;

export const Clipboard = {
  init: async () => {
    document.addEventListener("copy", cacheUrlToIgnore);
    await startWatching();
  },
};

function cacheUrlToIgnore() {
  try {
    const copiedText = document.getSelection();
    new URL(copiedText);
    localStorage.setItem("lastCopiedUrl", copiedText);
  } catch (ignore) {
    // ignore texts other than URLs
  }
}

async function startWatching() {
  const permissionStatus = await navigator.permissions.query({
    name: "clipboard-read",
  });

  if (permissionStatus.state === "granted") {
    watch();
  } else if (permissionStatus.state === "prompt") {
    setTimeout(showClipboardModal, 1000);
  }

  permissionStatus.onchange = permissionChanged;
}

function permissionChanged() {
  const { state } = this;

  if (state === "granted") {
    watch();
  } else if (state === "prompt") {
    unwatch();
    setTimeout(showClipboardModal, 1000);
  } else if (state === "denied") {
    unwatch();
    Ui.warningWithTimeout("Clipboard watch disabled!", 2000);
  }
}

function watch() {
  watchInterval = setInterval(readUrlFromClipboard, 500);
}

function unwatch() {
  clearInterval(watchInterval);
}

async function readUrlFromClipboard() {
  try {
    const copiedText = await navigator.clipboard.readText();
    if (shouldIgnoreThisUrl(copiedText)) {
      return;
    }
    new URL(copiedText); // show only valid URLs
    Ui.Buttons.shortenFromClipBoard.addEventListener("click", shortenClipboard);
    Ui.Buttons.customFromClipBoard.addEventListener(
      "click",
      customFromClipboard
    );
    Ui.clipboardAlert(copiedText);
    ignoreSuggestedUrl(copiedText);
  } catch (ignore) {
    // ignore texts other than URLs
  }
}

function shouldIgnoreThisUrl(url) {
  return [
    localStorage.getItem("lastSuggestedUrl"),
    localStorage.getItem("lastCopiedUrl"),
  ].includes(url);
}

function ignoreSuggestedUrl(url) {
  localStorage.setItem("lastSuggestedUrl", url);
}

function showClipboardModal() {
  const modalCheck = document.getElementById("modal-check");
  modalCheck.checked = true;
  modalCheck.addEventListener("change", (ev) => {
    if (ev.target.value === "on") {
      // modal dismissed
      navigator.clipboard.read().catch(noop); // implicitly request permission
    }
  });
}

function shortenClipboard() {
  const copiedUrl = Ui.Text.suggestedUrl.textContent;
  Shorten.shorten(copiedUrl);
}

function customFromClipboard() {
  currentUser().then(doCustomFromClipboard).catch(denyCustomizeAndPromptLogin);
}

function doCustomFromClipboard() {
  Ui.Inputs.url.value = Ui.Text.suggestedUrl.textContent;
  Ui.Tabs.Shorten.activate();
  Shorten.expandCustomize();
  Ui.Buttons.submit.disabled = false;
  Ui.hideAlert();
}

function denyCustomizeAndPromptLogin() {
  Ui.Buttons.customFromClipBoard.classList.add("shake-horizontal");
  Ui.Buttons.customFromClipBoard.addEventListener("animationend", function () {
    this.classList.remove("shake-horizontal");
    Ui.Buttons.login.classList.add("shake-top");
    Ui.Buttons.login.addEventListener("animationend", function () {
      this.classList.remove("shake-top");
    });
  });
}

function noop() {}
