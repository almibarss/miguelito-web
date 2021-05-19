import "../node_modules/papercss/dist/paper.min.css";
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import "../css/main.css";
import "../css/waiting.css";

import Auth from "@aws-amplify/auth";
import Amplify from "@aws-amplify/core";

import awsconfig from "../aws-exports";
import { shorten } from "./api";

Amplify.configure(awsconfig);

String.prototype.isEmpty = function () {
  return this.length === 0 || !this.trim();
};

function toggleMode() {
  document.documentElement.classList.toggle("dark");
}

function showWaitingDots() {
  document.getElementById("message").className = "";
}

function showErrorMessage(text) {
  document.getElementById("error").textContent = text;
  document.getElementById("message").className = "alert alert-danger";
}

function handleShortenOk(longUrl, shortUrl) {
  const shortLink = document.getElementById("short-url");
  shortLink.href = shortUrl;
  shortLink.textContent = shortUrl;
  shortLink.setAttribute("popover-left", longUrl);

  document
    .getElementById("copy-to-clipboard")
    .addEventListener("click", () => navigator.clipboard.writeText(shortUrl));

  document.getElementById("message").className = "alert alert-success";

  resetUi();
}

function showCustomize() {
  document.querySelector("button#customize").classList.add("hidden");
  document.querySelector("div#custom-path").classList.remove("hidden");
  const customPath = document.querySelector("input#custom-path");
  customPath.value = "";
  customPath.focus();
}

function resetCustomize() {
  document.querySelector("button#customize").classList.remove("hidden");
  document.querySelector("div#custom-path").classList.add("hidden");
  document.querySelector("input#custom-path").value = "";
}

function resetUi() {
  const urlInput = document.getElementById("url");
  urlInput.value = "";
  urlInput.focus();
  resetCustomize();
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
  .getElementById("dark-mode-toggle")
  .addEventListener("change", function () {
    toggleMode();
    document.getElementById("url").focus();
  });

document
  .querySelector(".user__profile>button")
  .addEventListener("click", () =>
  document .querySelector(".user__profile").classList.toggle("user__profile--expanded")
);

document
  .querySelector("button#customize")
  .addEventListener("click", showCustomize);

document.addEventListener("DOMContentLoaded", function () {
  Auth.currentAuthenticatedUser().then((user) => {
      document.querySelector(".user").classList.add("user--loggedIn");
      document.querySelector("button#customize").classList.remove("hidden");
      document.querySelector(
        ".user__profile .user__name"
      ).textContent = user.signInUserSession.idToken.payload.given_name;
    })
    .catch((error) => {
      console.error(error);
      document.querySelector(".user").classList.remove("user--loggedIn");
      document.querySelector("button#customize").classList.add("hidden");
    });
  document
    .querySelector(".user__profile a")
    .addEventListener("click", () => Auth.signOut());
  document
    .querySelector(".user__login>button")
    .addEventListener("click", () => Auth.federatedSignIn({ provider: "Google" }));
  document.getElementById("url").focus();
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
