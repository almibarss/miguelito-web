import { Alert } from "../alert";
import { Api, AuthError, UnknownError } from "../api";

const urlInput = document.getElementById("input-url");
const submitBtn = document.getElementById("submit");
const customizeExpandBtn = document.getElementById("btn-customize");
const customizeBox = document.getElementById("custom-backhalf");
const customizePrefix = customizeBox.querySelector(".prefixed-input__prefix");
const customizeInput = customizeBox.querySelector(".prefixed-input__text");
const customizeCloseBtn = customizeBox.querySelector(".btn-close");
const customizeState = document.getElementById("custom-backhalf-state");
const form = document.forms.item(0);

export const Shorten = {
  init() {
    document.addEventListener("baseUrlReceived", ({ detail: baseUrl }) => {
      customizePrefix.textContent = `${baseUrl.hostname}/`;
      customizeInput.style.maxWidth = `${customizePrefix.clientWidth}px`;
    });
    form.addEventListener("submit", submitUrl);
    form.addEventListener("input", disableSubmitOnInvalidData);
    customizeInput.addEventListener("keydown", collapseCustomizeIfEscPressed);
    customizeExpandBtn.addEventListener("click", changeCustomizeExpanded);
    customizeState.addEventListener("change", handleCustomizeStateChange);
  },
};

function submitUrl(ev) {
  ev.preventDefault();
  const {
    url: { value: url },
    backhalf: { value: backhalf },
  } = ev.target;
  const trimmedUrl = url.trim();
  const customizeExpanded = !customizeState.checked;
  if (customizeExpanded) {
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

function disableSubmitOnInvalidData() {
  submitBtn.disabled = form.matches(":invalid");
}

function collapseCustomizeIfEscPressed({ key }) {
  if (key !== "Escape") {
    return;
  }
  changeCustomizeCollapsed();
}

function changeCustomizeCollapsed() {
  setCustomizeState({ expanded: false });
}

function changeCustomizeExpanded() {
  setCustomizeState({ expanded: true });
}

function handleCustomizeStateChange({ target: stateCheckbox }) {
  const customizeExpanded = !stateCheckbox.checked;
  customizeExpandBtn.disabled = customizeExpanded;
  customizeCloseBtn.setAttribute("aria-expanded", customizeExpanded);
  customizeExpandBtn.setAttribute("aria-expanded", customizeExpanded);
  customizeInput.disabled = !customizeExpanded;
  if (customizeExpanded) {
    customizeInput.value = "";
    customizeInput.focus();
  }
  disableSubmitOnInvalidData();
}

function setCustomizeState({ expanded }) {
  customizeState.checked = !expanded;
  customizeState.dispatchEvent(new Event("change", { bubbles: true }));
}

function resetForm() {
  clearAllTextFields();
  changeCustomizeCollapsed();
}

function clearAllTextFields() {
  form
    .querySelectorAll('input[type="text"], input[type="url"]')
    .forEach((input) => (input.value = ""));
}

function sendLinkCreatedEvent(newLink) {
  const event = new CustomEvent("linkCreated", {
    detail: newLink,
  });
  document.dispatchEvent(event);
}
