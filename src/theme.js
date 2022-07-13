import { Ui } from "./ui";

export const Theme = {
  init: () => {
    Ui.Buttons.theme.addEventListener("change", switchTheme);
    applyUserSetting();
  },
};

function switchTheme() {
  document.documentElement.classList.toggle("dark");

  const newTheme = Ui.Buttons.theme.checked ? "dark" : "light";
  saveUserSetting(newTheme);
}

function applyUserSetting() {
  const savedTheme = loadUserSetting();
  const systemTheme = loadSystemSetting();
  if ([savedTheme, systemTheme].includes("dark")) {
    Ui.Buttons.theme.click();
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
