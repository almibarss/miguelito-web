import { Alert } from "../alert";
import { Api, AuthError, UnknownError } from "../api";

const urlInput = document.getElementById("input-url");
const submitBtn = document.getElementById("submit");
const customizeBtn = document.getElementById("btn-customize");
const customizeBox = document.getElementById("custom-backhalf");
const customizePrefix = customizeBox.querySelector(".prefixed-input__prefix");
const customizeInput = customizeBox.querySelector(".prefixed-input__text");
const form = document.forms.item(0);

export const Shorten = {
  init() {
    document.addEventListener("baseUrlReceived", ({ detail: baseUrl }) => {
      customizePrefix.textContent = `${baseUrl.hostname}/`;
      customizeInput.style.maxWidth = `${customizePrefix.clientWidth}px`;
    });
    form.addEventListener("submit", submitUrl);
    customizeInput.addEventListener("keydown", collapseCustomizeIfEscPressed);
    customizeBtn.addEventListener("click", toggleCustomize);
    customizeBox.addEventListener("animationstart", showCustomizeAnimated);
    customizeBox.addEventListener("animationend", hideCustomizeAnimated);
  }
};

function submitUrl(ev) {
  ev.preventDefault();
  const {
    url: { value: url },
    backhalf: { value: backhalf }
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
  Api.shorten(url, backhalf)
    .then(handleOk)
    .catch(handleError)
    .finally(doneWaiting);
}

function handleOk(newLink) {
  Alert.shortLinkCreated(newLink.url);
  sendLinkCreatedEvent(newLink);
  resetForm();
}

function handleError(error) {
  if (error instanceof AuthError) {
    Alert.error("oops, it looks like your account is not activated ( ´･_･`)");
  } else if (error instanceof UnknownError) {
    Alert.error("oops, something went wrong (◕‸ ◕✿)");
  } else {
    Alert.error(error.message);
  }
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
  submitBtn.disabled = false;
}

function disableInput() {
  submitBtn.disabled = true;
  urlInput.disabled = true;
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

function collapseCustomize() {
  if (customizeBox.dataset.mode === "open") {
    toggleCustomize();
  }
}

function collapseCustomizeIfEscPressed({ key }) {
  if (key === "Escape") {
    collapseCustomize();
  }
}

function resetForm() {
  urlInput.value = "";
  customizeInput.value = "";
  collapseCustomize();
}

function sendLinkCreatedEvent(newLink) {
  const event = new CustomEvent("linkCreated", {
    detail: newLink
  });
  document.dispatchEvent(event);
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
