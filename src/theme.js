const themeToggle = document.getElementById("toggle-theme");

export const Theme = {
  init: () => {
    themeToggle.addEventListener("change", switchTheme);
    applyUserSetting();
  },
};

function switchTheme() {
  document.documentElement.classList.toggle("dark");

  const newTheme = themeToggle.checked ? "dark" : "light";
  saveUserSetting(newTheme);
  dimLabel();
}

function applyUserSetting() {
  const savedTheme = loadUserSetting();
  const systemTheme = loadSystemSetting();
  if ([savedTheme, systemTheme].includes("dark")) {
    themeToggle.click();
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
    .forEach((label) => label.classList.toggle("text-muted"));
}
