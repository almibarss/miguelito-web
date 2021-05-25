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
  localStorage.setItem('theme', 
    document.querySelector(".theme-selector .theme-selector__toggle").checked ? "dark": "light");

  document.querySelectorAll(".theme-selector .theme-selector__label").forEach(label => {
    label.classList.toggle("theme-selector__label--muted");
    const icon = label.querySelector("i");
    icon.classList.toggle("far");
    icon.classList.toggle("fas");
  });
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
  .querySelector(".theme-selector .theme-selector__toggle")
  .addEventListener("change", function () {
    toggleMode();
    document.getElementById("url").focus();
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

  applyTheme();
});

function applyTheme() {
  const savedThemePref = localStorage.getItem("theme");
  const systemThemePref = getSystemThemePreference();
  if (savedThemePref == "dark" || !savedThemePref && systemThemePref == "dark") {
    document.querySelector(".theme-selector .theme-selector__toggle").click();
  }
}

function getSystemThemePreference() {
  return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
}

document.addEventListener("keydown", function (ev) {
  if (
    ev.key == "Escape" &&
    document.querySelector("input#custom-path") == document.activeElement
  ) {
    resetCustomize();
  }
});
