const themeToggle = document.querySelector(
  ".theme-selector .theme-selector__toggle"
);

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

  updateIcon("sun", newTheme === "light" ? "solid" : "regular");
  updateIcon("moon", newTheme === "dark" ? "solid" : "regular");
}

function updateIcon(name, style) {
  const icon = document.querySelector(`.fa-${name}`);
  icon.parentElement.replaceChild(newIcon(name, style), icon);

  // font-awesome transforms the icon element into a svg at runtime
  function newIcon(name, style) {
    const i = document.createElement("i");
    [`fa-${name}`, `fa-${style}`].forEach((cl) => i.classList.add(cl));
    return i;
  }
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
