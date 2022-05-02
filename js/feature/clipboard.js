import { Ui } from "../ui";
import { Shorten } from "./shorten";

let lastReadFromClipboard;
let watchInterval;
let watching;

export const Clipboard = {
  init: async () => {
    Ui.Buttons.shortenFromClipBoard.addEventListener("click", shortenClipboard);
    startWatching();
  },
  copyAndIgnoreUrl: (url) => {
    const wasWatching = watching;
    unwatch();
    return navigator.clipboard
      .writeText(url)
      .then(() => {
        // avoid alerting about shortened urls
        lastReadFromClipboard = url;
      })
      .finally(() => {
        if (wasWatching) {
          watch();
        }
      });
  },
};

async function startWatching() {
  const permissionStatus = await navigator.permissions.query({
    name: "clipboard-read",
  });
  const { state } = permissionStatus;
  logPermissionState("initial", state);

  switch (permissionStatus.state) {
    case "granted":
      watch();
      break;
    case "prompt":
      setTimeout(showClipboardModal, 1000);
      break;
  }

  permissionStatus.onchange = permissionChanged;
}

function permissionChanged() {
  const { state } = this;
  logPermissionState("changed", state);

  switch (state) {
    case "granted":
      watch();
      break;
    case "prompt":
      unwatch();
      setTimeout(showClipboardModal, 1000);
      break;
    case "denied":
      unwatch();
      Ui.warningWithTimeout("Clipboard watch disabled!", 2000);
      break;
  }
}

function watch() {
  watchInterval = setInterval(readUrl, 500);
  watching = true;
}

function unwatch() {
  clearInterval(watchInterval);
  watching = false;
}

function readUrl() {
  navigator.clipboard
    .readText()
    .then(skipDuplicates)
    .then(parseUrl)
    .then(showAlert)
    .catch(noop);
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

function skipDuplicates(text) {
  if (text === lastReadFromClipboard) {
    return Promise.reject("dupe");
  }
  lastReadFromClipboard = text;
  return Promise.resolve(text);
}

function parseUrl(text) {
  try {
    return Promise.resolve(new URL(text));
  } catch (error) {
    return Promise.reject(`Bad URL: ${text}`);
  }
}

function showAlert(url) {
  Ui.clipboardAlert(url);
}

function shortenClipboard() {
  const copiedUrl = document.querySelector("#clipboard-alert span").textContent;
  Shorten.shorten(copiedUrl);
}

function logPermissionState(stage, state) {
  console.log(`Clipboard permission state [${stage}]: ${state}`);
}

function noop() {}
