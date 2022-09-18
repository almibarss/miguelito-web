export const Ui = {
  Inputs: {
    url: document.getElementById("input-url"),
    backhalf: document.querySelector("#input-backhalf"),
    backhalfEditable: document.querySelector("#input-backhalf input"),
    searchLinks: document.querySelector("#search-links"),
  },
  Buttons: {
    submit: document.getElementById("submit"),
    customize: document.getElementById("btn-customize"),
    dismissAlert: document.querySelector("label[for='alert-check']"),
  },
  Toggles: {
    theme: document.getElementById("toggle-theme"),
  },
  Links: {
    signin: document.getElementById("lnk-signin"),
    signout: document.getElementById("lnk-signout"),
  },
  Forms: {
    shorten: document.forms.item(0),
  },
  Text: {
    username: document.getElementById("username"),
  },
  Lists: {
    myLinks: document.querySelector("#my-links ul"),
  },
  Tabs: {
    Shorten: {
      isActive: () => document.getElementById("tab1").checked,
      label: document.querySelector("label[for=tab1]"),
      activate: () => (document.getElementById("tab1").checked = true),
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
    const shortLink = document.querySelector(
      "#shortened-url-alert #shortened-url-alert__url"
    );
    shortLink.href = shortUrl;
    const url = new URL(shortUrl);
    shortLink.textContent = `${url.hostname}${url.pathname}`;

    document
      .getElementById("shortened-url-alert__btn-copy")
      .addEventListener("click", () => copyToClipboard(shortUrl));

    displayAlertType("shortened-url-alert");
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
  hideAlert: () => {
    document.getElementById("alert-check").checked = true;
  },
  shakeSignin: () => {
    const signinContainer = Ui.Links.signin.closest("div");
    signinContainer.classList.add("shake-top");
    signinContainer.addEventListener("animationend", function () {
      this.classList.remove("shake-top");
    });
  },
};

async function copyToClipboard(url) {
  localStorage.setItem("lastCopiedUrl", url);
  await navigator.clipboard.writeText(url);
  Ui.successWithTimeout("URL copied!", 2000);
}

function displayAlertType(type) {
  const alert = document.getElementById("alert");
  alert.className = "alert dismissible";
  const alertClasses = {
    "shortened-url-alert": "alert-success",
    "simple-message-success": "alert-success",
    "simple-message-error": "alert-danger",
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

HTMLSpanElement.prototype.replaceAllText = function (position, newText) {
  const notText = [...this.childNodes].filter(
    (n) => n.nodeType !== Node.TEXT_NODE
  );
  this.replaceChildren(...notText);
  this.insertAdjacentText(position, newText);
};

DOMTokenList.prototype.removeStartingWith = function (...prefixes) {
  const values = [...this.values()];
  const toBeRemoved = [];
  values.forEach((v) => {
    if (prefixes.filter((prefix) => v.startsWith(prefix)).length > 0) {
      toBeRemoved.push(v);
    }
  });
  this.remove(...toBeRemoved);
};

Element.prototype.hide = function () {
  this.classList.add("is-hidden");
};

Element.prototype.show = function () {
  this.classList.remove("is-hidden");
};

String.prototype.isEmpty = function () {
  return this.length === 0 || !this.trim();
};

String.prototype.includesCaseInsensitive = function (anotherString) {
  return this.toLowerCase().includes(anotherString.toLowerCase());
};
