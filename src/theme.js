import { Ui } from "./ui";

export const Theme = {
  init: () => {
    Ui.Toggles.theme.addEventListener("change", switchTheme);
    applyUserSetting();
  },
};

function switchTheme() {
  document.documentElement.classList.toggle("dark");

  const newTheme = Ui.Toggles.theme.checked ? "dark" : "light";
  saveUserSetting(newTheme);
  dimLabel();
}

function applyUserSetting() {
  const savedTheme = loadUserSetting();
  const systemTheme = loadSystemSetting();
  if ([savedTheme, systemTheme].includes("dark")) {
    Ui.Toggles.theme.click();
  }
}

function loadUserSetting() {
  return localStorage.getItem("theme");
}

function saveUserSetting(pref) {
  localStorage.setItem("theme", pref);
}

function loadSystemSetting() {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function dimLabel() {
  document
    .querySelectorAll("label[for='toggle-theme']")
    .forEach((label) => label.classList.toggle("is-muted"));
}
