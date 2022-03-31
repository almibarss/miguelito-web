import "../node_modules/papercss/dist/paper.min.css";
import "../css/main.css";
import "../css/waiting.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/regular";
import "@fortawesome/fontawesome-free/js/solid";

import Amplify from "@aws-amplify/core";

import awsconfig from "../aws-exports";
import { shorten } from "./api";
import { currentUser, login, logout } from "./auth";
import { Customize } from "./customize";
import { Theme } from "./theme";

Amplify.configure(awsconfig);

String.prototype.isEmpty = function () {
  return this.length === 0 || !this.trim();
};

function showWaitingDots() {
  document.getElementById("message").className = "waiting alert alert-warning";
}

function showErrorMessage(text) {
  document.getElementById("error").textContent = text;
  document.getElementById("message").className = "error alert alert-danger";
}

function handleShortenOk(longUrl, shortUrl) {
  const shortLink = document.getElementById("short-url");
  shortLink.href = shortUrl;
  shortLink.textContent = shortUrl;
  shortLink.setAttribute("popover-left", longUrl);

  document
    .getElementById("copy-to-clipboard")
    .addEventListener("click", () => navigator.clipboard.writeText(shortUrl));

  document.getElementById("message").className = "success alert alert-success";

  resetUi();
}

function resetUi() {
  const urlInput = document.getElementById("url");
  urlInput.value = "";
  urlInput.focus();
  Customize.collapse();
}

document.forms.item(0).addEventListener("submit", function (ev) {
  ev.preventDefault();

  showWaitingDots();
  const {
    // eslint-disable-next-line prettier/prettier
    "url": { value: inputUrl },
    "custom-path": { value: customPath },
  } = ev.target;
  shorten(inputUrl, customPath)
    .then((shortUrl) => handleShortenOk(inputUrl, shortUrl))
    .catch((error) => showErrorMessage(error.message));
});

document.getElementById("url").addEventListener("input", function () {
  document.getElementById("message").classList.add("hidden");
  document.getElementById("submit").disabled = this.value.isEmpty();
});

document
  .querySelector(".user__profile>button")
  .addEventListener("click", () => {
    const userProfile = document.querySelector(".user__profile");
    if (!userProfile.classList.toggle("user__profile--expanded")) {
      userProfile.classList.add("user__profile--collapsed");
    } else {
      userProfile.classList.remove("user__profile--collapsed");
    }
  });

document.addEventListener("paste", (ev) => {
  ev.preventDefault();
  const paste = (ev.clipboardData || window.clipboard).getData("text");
  document.getElementById("url").value = paste;
});

function userIsLoggedIn({ name: username }) {
  document.querySelector(".user").classList.add("user--loggedIn");
  document.querySelector(".user__profile .user__name").textContent = username;
  Customize.allow();
}

function userIsNotLoggedIn() {
  document.querySelector(".user").classList.remove("user--loggedIn");
  Customize.disallow();
}

document.addEventListener("DOMContentLoaded", () => {
  currentUser().then(userIsLoggedIn).catch(userIsNotLoggedIn);
  Customize.init();
  Theme.init();
  document
    .querySelector(".user__profile a")
    .addEventListener("click", () => logout());
  document
    .querySelector(".user__login>button")
    .addEventListener("click", () => login());
  document.getElementById("url").focus();
});

document.addEventListener("keydown", function (ev) {
  if (
    ev.key === "Escape" &&
    document.querySelector("input#custom-path") === document.activeElement
  ) {
    Customize.collapse();
  }
});
