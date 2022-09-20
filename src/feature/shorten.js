import { Alert } from "../alert";
import { API } from "../api";
import { currentUser } from "../auth";
import { User } from "../user";

const urlInput = document.getElementById("input-url");
const submitBtn = document.getElementById("submit");
const customizeBtn = document.getElementById("btn-customize");
const customizeBox = document.getElementById("custom-backhalf");
const customizePrefix = customizeBox.querySelector(".prefixed-input__prefix");
const customizeInput = customizeBox.querySelector(".prefixed-input__text");
const form = document.forms.item(0);

export const Shorten = {
  init: () => {
    document.addEventListener("baseUrlReceived", ({ detail: baseUrl }) => {
      customizePrefix.textContent = `${baseUrl.hostname}/`;
      customizeInput.style.maxWidth = `${customizePrefix.clientWidth}px` ;
    });
    urlInput.addEventListener("input", function () {
      const isInputEmpty = this.value.trim().length === 0;
      submitBtn.disabled = isInputEmpty;
    });
    form.addEventListener("submit", submitUrl);
    customizeInput.addEventListener("keydown", collapseIfEscPressed);
    customizeBtn.addEventListener("click", handleCustomize);
    customizeBox.addEventListener("animationstart", showCustomizeAnimated);
    customizeBox.addEventListener("animationend", hideCustomizeAnimated);
  },
};

function submitUrl(ev) {
  ev.preventDefault();
  const {
    url: { value: url },
    backhalf: { value: backhalf },
  } = ev.target;
  const trimmedUrl = url.trim();
  if (customizeBox.dataset.mode === "open") {
    shorten(trimmedUrl, backhalf);
  } else {
    shorten(trimmedUrl);
  }
}

function shorten(url, backhalf) {
  startWaiting();
  API.shorten(url, backhalf)
    .then(handleOk)
    .catch(handleError)
    .finally(doneWaiting);
}

function handleOk(newLink) {
  Alert.shortLinkCreated(newLink.url, newLink.origin);
  sendLinkCreatedEvent(newLink);
  resetForm();
}

function handleError(error) {
  Alert.error(error.message);
}

function startWaiting() {
  submitBtn.classList.add("is-waiting");
  submitBtn.classList.remove("is-label");
  disableInput();
}

function doneWaiting() {
  submitBtn.classList.remove("is-waiting");
  submitBtn.classList.add("is-label");
  enableInput();
}

function enableInput() {
  urlInput.disabled = false;
  submitBtn.disabled = urlInput.value.trim().length === 0;
}

function disableInput() {
  submitBtn.disabled = true;
  urlInput.disabled = true;
}

function handleCustomize() {
  currentUser().then(toggleCustomize).catch(denyCustomizeAndPromptSignIn);
}

function toggleCustomize() {
  if (customizeBox.dataset.mode === "closed") {
    customizeBox.classList.add("slide-in-top");
    customizeBox.dataset.mode = "open";
    customizeInput.value = "";
  } else {
    customizeBox.classList.add("slide-out-top");
    customizeBox.dataset.mode = "closed";
  }
}

function denyCustomizeAndPromptSignIn() {
  customizeBtn.classList.add("shake-horizontal");
  customizeBtn.addEventListener("animationend", function () {
    this.classList.remove("shake-horizontal");
    User.shakeSignIn();
  });
}

function resetForm() {
  urlInput.value = "";
  customizeInput.value = "";
  collapseCustomize();
}

function collapseCustomize() {
  if (customizeBox.dataset.mode === "open") {
    toggleCustomize();
  }
}

function sendLinkCreatedEvent(newLink) {
  const event = new CustomEvent("linkCreated", {
    detail: newLink,
  });
  document.dispatchEvent(event);
}

function collapseIfEscPressed({ key }) {
  if (key === "Escape") {
    collapseCustomize();
  }
}

function showCustomizeAnimated({ animationName }) {
  if (animationName === "slide-in-top") {
    this.classList.remove("hidden-top");
  }
}

function hideCustomizeAnimated({ animationName }) {
  this.classList.remove(animationName);
  if (animationName === "slide-out-top") {
    this.classList.add("hidden-top");
  } else if (animationName === "slide-in-top") {
    customizeInput.focus();
  }
}
