const defaultTimeout = 3000;

const alert = {
  show() {
    this.box.scrollIntoView({ behavior: "smooth", block: "center" });
    this.state.checked = false;
  },
  hide() {
    this.state.checked = true;
  },
};

const error = {
  box: document.getElementById("alert-error"),
  state: document.getElementById("alert-error-state"),
  __proto__: alert,
};

const success = {
  box: document.getElementById("alert-success"),
  state: document.getElementById("alert-success-state"),
  __proto__: alert,
};

const shortLink = {
  box: document.getElementById("alert-short"),
  state: document.getElementById("alert-short-state"),
  __proto__: alert,
};

export const Alert = {
  error: (message) => {
    error.box.textContent = message;
    error.show();
    setTimeout(() => error.hide(), defaultTimeout);
  },
  success: (message) => {
    success.box.textContent = message;
    success.show();
    setTimeout(() => success.hide(), defaultTimeout);
  },
  shortLinkCreated: (shortUrl, originUrl) => {
    const link = shortLink.box.querySelector("a");
    const url = new URL(shortUrl);
    link.href = shortUrl;
    link.textContent = `${url.hostname}${url.pathname}`;
    // link.setAttribute("popover-top", originUrl);
    const copyBtn = shortLink.box.querySelector("label");
    copyBtn.addEventListener("click", () => copyToClipboard(shortUrl));

    shortLink.show();
  },
};

async function copyToClipboard(url) {
  await navigator.clipboard.writeText(url);
  Alert.success("URL copied!", defaultTimeout);
}
