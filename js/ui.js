import { Clipboard } from "./feature/clipboard";

export const Ui = {
  Inputs: {
    url: document.getElementById("url"),
    customPath: document.querySelector("#custom-path input"),
    searchLinks: document.querySelector("#search-links"),
  },
  Buttons: {
    submit: document.getElementById("submit"),
    customize: document.getElementById("customize"),
    login: document.querySelector(".user__login>button"),
    logout: document.querySelector(".user__profile a"),
    userProfile: document.querySelector(".user__profile>button"),
    theme: document.querySelector(".theme-selector .theme-selector__toggle"),
    shortenFromClipBoard: document.querySelector("#clipboard-alert button"),
  },
  Forms: {
    shorten: document.forms.item(0),
  },
  Text: {
    username: document.querySelector(".user__profile .user__name"),
  },
  Lists: {
    myLinks: document.querySelector("#my-links ul"),
  },
  Tabs: {
    Shorten: {
      isActive: () => document.getElementById("tab1").checked,
      label: document.querySelector("label[for=tab1]"),
    },
    MyLinks: {
      isActive: () => document.getElementById("tab2").checked,
      label: document.querySelector("label[for=tab2]"),
    },
  },
  Badges: {
    linkCount: document.querySelector("label[for=tab2] .badge"),
  },
  shortenedUrl: (longUrl, shortUrl) => {
    const shortLink = document.querySelector("#url-shortened a");
    shortLink.href = shortUrl;
    shortLink.textContent = shortUrl;

    document
      .getElementById("copy-to-clipboard")
      .addEventListener("click", () => {
        Clipboard.copyAndIgnoreUrl(shortUrl).then(() => {
          Ui.successWithTimeout("URL copied!", 2000);
        });
      });

    displayAlertType("url-shortened");
  },
  waiting: () => {
    displayAlertType("waiting");
  },
  success: (message) => {
    document.getElementById("simple-message").textContent = message;
    displayAlertType("simple-message-success");
  },
  successWithTimeout: (message, timeout) => {
    Ui.success(message);
    setTimeout(Ui.hideAlert, timeout);
  },
  error: (message) => {
    document.getElementById("simple-message").textContent = message;
    displayAlertType("simple-message-error");
  },
  errorWithTimeout: (message, timeout) => {
    Ui.error(message);
    setTimeout(Ui.hideAlert, timeout);
  },
  warning: (message) => {
    document.getElementById("simple-message").textContent = message;
    displayAlertType("simple-message-warning");
  },
  warningWithTimeout: (message, timeout) => {
    Ui.warning(message);
    setTimeout(Ui.hideAlert, timeout);
  },
  clipboardAlert: (url) => {
    document.querySelector("#clipboard-alert span").textContent = url;
    displayAlertType("clipboard-alert");
  },
  hideAlert: () => {
    document.getElementById("alert-check").checked = true;
  },
};
function displayAlertType(type) {
  const alert = document.getElementById("alert");
  alert.className = "alert dismissible";
  const alertClasses = {
    "url-shortened": "alert-success",
    "simple-message-success": "alert-success",
    "simple-message-error": "alert-danger",
    "clipboard-alert": "alert-warning",
    waiting: "alert-primary",
    "simple-message-warning": "alert-warning",
  };
  alert.classList.add(alertClasses[type]);
  if (type.startsWith("simple-message-")) {
    type = "simple-message";
  }
  alert.classList.add(type);

  document.getElementById("alert-check").checked = false;
}

Element.prototype.hide = function () {
  this.classList.add("hidden");
};

Element.prototype.show = function () {
  this.classList.remove("hidden");
};

String.prototype.isEmpty = function () {
  return this.length === 0 || !this.trim();
};

String.prototype.includesCaseInsensitive = function (anotherString) {
  return this.toLowerCase().includes(anotherString.toLowerCase());
};
