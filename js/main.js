import "../node_modules/papercss/dist/paper.min.css";
import "../css/wave.css";
import "../css/main.css";

import { shorten } from "./api";
import { doc } from "prettier";

String.prototype.isEmpty = function () {
  return this.length === 0 || !this.trim();
};

function toggleMode() {
  document.documentElement.classList.toggle("dark");
}

function showWaitingDots() {
  const div = document.createElement("div");
  div.id = "wave";
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    div.appendChild(dot);
  }

  const messageBox = document.getElementById("message");
  messageBox.innerHTML = "";
  messageBox.appendChild(div);
  messageBox.className = "alert alert-primary";
  messageBox.style.display = "block";
}

function showErrorMessage(text) {
  const messageBox = document.getElementById("message");
  messageBox.textContent = text;
  messageBox.className = "alert alert-danger";
  messageBox.style.display = "block";
}

function handleShortenOk(longUrl, shortUrl) {
  const shortLink = document.createElement("a");
  shortLink.id = "short-url";
  shortLink.href = shortUrl;
  shortLink.textContent = shortUrl;
  shortLink.setAttribute("popover-left", longUrl);

  const copyIcon = document.createElement("i");
  copyIcon.classList.add("far", "fa-clipboard");

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.setAttribute("popover-right", "Copy to clipboard");
  copyButton.classList.add("simple-button", "inline-button");
  copyButton.addEventListener("click", copyLinkToClipboard);
  copyButton.appendChild(copyIcon);

  const messageBox = document.getElementById("message");
  messageBox.innerHTML = "";
  messageBox.appendChild(shortLink);
  messageBox.appendChild(copyButton);
  messageBox.classList.add("alert", "alert-success");
  messageBox.style.display = "block";

  resetUi();
}

function showCustomize() {
  document.querySelector("button#customize").style.display = "none";
  document.querySelector("div#custom-path").style.display = "block";
  const customPath = document.querySelector("input#custom-path");
  customPath.value = "";
  customPath.focus();
}

function resetCustomize() {
  document.querySelector("button#customize").style.display = "block";
  document.querySelector("div#custom-path").style.display = "none";
  document.querySelector("input#custom-path").value = "";
}

function resetUi() {
  const urlInput = document.getElementById("url");
  urlInput.value = "";
  urlInput.focus();
  resetCustomize();
}

function copyLinkToClipboard() {
  const shortUrl = document.querySelector("a#short-url").textContent;
  navigator.clipboard.writeText(shortUrl);
}

document.forms.item(0).addEventListener("submit", function (ev) {
  ev.preventDefault();

  showWaitingDots();
  shorten(ev.target.url.value, ev.target["custom-path"].value)
    .then((shortUrl) => handleShortenOk(ev.target.url.value, shortUrl))
    .catch((error) => showErrorMessage(error.message));
});

document.getElementById("url").addEventListener("input", function () {
  document.getElementById("submit").disabled = this.value.isEmpty();
});

document
  .getElementById("dark-mode-toggle")
  .addEventListener("change", function () {
    toggleMode();
    document.getElementById("url").focus();
  });

document
  .querySelector("button#customize")
  .addEventListener("click", showCustomize);

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("url").focus();
  document.getElementById("custom-path").style.display = "none";
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.getElementById("dark-mode-toggle").click();
  }
});

document.addEventListener("keydown", function (ev) {
  if (
    ev.key == "Escape" &&
    document.querySelector("input#custom-path") == document.activeElement
  ) {
    resetCustomize();
  }
});
