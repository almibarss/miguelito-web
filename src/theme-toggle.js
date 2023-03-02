const themeToggle = document.getElementById("theme-toggle");
const storageKey = "theme";
const theme = {
  value: undefined,
  auto: true,
  pref() {
    return this.auto ? "auto" : this.value;
  },
  flip() {
    this.auto = false;
    this.value = (this.value === "dark") ? "light" : "dark";
    return this.value;
  }
};

export const ThemeToggle = {
  init() {
    getPreference();
    reflectPreference();
    watchPreference();
    themeToggle.addEventListener("click", switchTheme);
  }
};

function getPreference() {
  if (localStorage.getItem(storageKey) ?? "auto" !== "auto") {
    theme.auto = false;
    theme.value = localStorage.getItem(storageKey);
  } else {
    theme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
}

function reflectPreference() {
  document.documentElement.classList.toggle("dark", (theme.value === "dark"));
  themeToggle.setAttribute("aria-label", theme.pref());
}

function watchPreference() {
  window.matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", ({ matches: isDark }) => {
      theme.auto = true;
      theme.value = isDark ? "dark" : "light";
      reflectPreference();
      removePreference();
    });
}

function switchTheme() {
  theme.flip();
  reflectPreference();
  writePreference();
}

function writePreference() {
  localStorage.setItem(storageKey, theme.pref());
}

function removePreference() {
  localStorage.removeItem(storageKey);
}
