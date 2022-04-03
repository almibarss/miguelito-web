export const Ui = {
  Inputs: {
    url: document.getElementById("url"),
    customPath: document.querySelector("#custom-path input"),
  },
  Buttons: {
    submit: document.getElementById("submit"),
    customize: document.getElementById("customize"),
    login: document.querySelector(".user__login>button"),
    logout: document.querySelector(".user__profile a"),
    userProfile: document.querySelector(".user__profile>button"),
    theme: document.querySelector(".theme-selector .theme-selector__toggle"),
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
  shortenedUrl: (longUrl, shortUrl) => {
    const shortLink = document.querySelector("#success a");
    shortLink.href = shortUrl;
    shortLink.textContent = shortUrl;
    shortLink.setAttribute("popover-left", longUrl);

    document
      .getElementById("copy-to-clipboard")
      .addEventListener("click", () => navigator.clipboard.writeText(shortUrl));

    document.getElementById("message").className =
      "success alert alert-success";
  },
  waiting: () => {
    document.getElementById("message").className =
      "waiting alert alert-warning";
  },
  error: (message) => {
    document.getElementById("error").textContent = message;
    document.getElementById("message").className = "error alert alert-danger";
  },
  clearMessage: () => {
    document.getElementById("message").hide();
  },
};

HTMLElement.prototype.hide = function () {
  this.classList.add("hidden");
};

HTMLElement.prototype.show = function () {
  this.classList.remove("hidden");
};
