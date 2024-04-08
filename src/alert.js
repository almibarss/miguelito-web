const hideTimeout = 3000;

const alert = {
  show() {
    this.content.scrollIntoView({ behavior: "smooth", block: "center" });
    this.state.checked = false;
  },
  hide() {
    this.state.checked = true;
  },
};

const error = {
  content: document.getElementById("alert-error"),
  state: document.getElementById("alert-error-state"),
  __proto__: alert
};

const success = {
  content: document.getElementById("alert-success"),
  state: document.getElementById("alert-success-state"),
  __proto__: alert
};

const shortLink = {
  content: document.getElementById("alert-short"),
  state: document.getElementById("alert-short-state"),
  __proto__: alert
};

export const Alert = {
  error: (message) => {
    error.content.textContent = message;
    error.show();
    setTimeout(() => error.hide(), hideTimeout);
  },
  success: (message) => {
    success.content.textContent = message;
    success.show();
    setTimeout(() => success.hide(), hideTimeout);
  },
  shortLinkCreated: (shortUrl) => {
    const link = shortLink.content.querySelector("a");
    const url = new URL(shortUrl);
    link.href = shortUrl;
    link.textContent = `${url.hostname}${url.pathname}`;
    const copyBtn = shortLink.content.querySelector("label");
    copyBtn.addEventListener("click", () => copyToClipboard(shortUrl));

    shortLink.show();
  }
};

async function copyToClipboard(url) {
  await navigator.clipboard.writeText(url);
  Alert.success("URL copied!", hideTimeout);
}
