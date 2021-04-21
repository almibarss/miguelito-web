import "../node_modules/papercss/dist/paper.min.css";
import "../css/wave.css";
import "../css/main.css";

import $ from "jquery";

String.prototype.isEmpty = function () {
  return this.length === 0 || !this.trim();
};

function toggleMode() {
  document.documentElement.classList.toggle("dark");
}

function showWaitingDots() {
  const dot = document.createElement("span");
  dot.classList.add("dot");

  const div = document.createElement("div");
  div.appendChild(dot);
  div.appendChild(dot);
  div.appendChild(dot);

  const messageBox = document.getElementById("message");
  messageBox.innerHTML = "";
  messageBox.appendChild(div);
  messageBox.className = "alert alert-primary";
  messageBox.style.display = "block";
}

function showErrorMessage(text) {
  const messageBox = document.getElementById("message");
  messageBox.textContent = text;
  messageBox.className = "alert alert-danger";
  messageBox.style.display = "block";
}

function displayShortenedUrl(longUrl, shortUrl) {
  const shortLink = document.createElement("a");
  shortLink.id = "short-url";
  shortLink.href = shortUrl;
  shortLink.textContent = shortUrl;
  shortLink.setAttribute("popover-left", longUrl);

  const copyIcon = document.createElement("i");
  copyIcon.classList.add("far", "fa-clipboard");

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.setAttribute("popover-right", "Copy to clipboard");
  copyButton.classList.add("simple-button", "inline-button");
  copyButton.addEventListener("click", copyLinkToClipboard);
  copyButton.appendChild(copyIcon);

  const messageBox = document.getElementById("message");
  messageBox.innerHTML = "";
  messageBox.appendChild(shortenUrl);
  messageBox.appendChild(copyButton);
  messageBox.classList.add("alert", "alert-success");
  messageBox.style.display = "block";
}

function showCustomize() {
  document.querySelector("button#customize").style.display = "none";
  document.querySelector("div#custom-path").style.display = "block";
  const customPath = document.querySelector("input#custom-path");
  customPath.value = "";
  customPath.focus();
}

function resetCustomize() {
  document.querySelector("button#customize").style.display = "block";
  document.querySelector("div#custom-path").style.display = "none";
  document.querySelector("input#custom-path").value = "";
}

function resetUi() {
  document.getElementById("url").value = "";
  resetCustomize();
}

function copyLinkToClipboard() {
  const shortUrl = document.querySelector("a#short-url").textContent;
  navigator.clipboard.writeText(shortUrl);
}

function filterStatusOk(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else if (response.status == 400) {
    return Promise.reject(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}

function toJson(response) {
  return response.json();
}

function shortenUrl(apiUrl, inputUrl, customPath) {
  fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({ url: inputUrl, custom_path: customPath }),
  })
    .then(filterStatusOk)
    .then(toJson)
    .then(function (response) {
      const shortUrl = `${window.location.protocol}//${window.location.host}/${response.path}`;
      displayShortenedUrl(inputUrl, shortUrl);
      resetUi();
    })
    .catch(function (error) {
      if (error instanceof Error) {
        console.error(error);
      } else {
        error.json().then(function (errorJson) {
          showErrorMessage(errorJson.message);
        });
      }
      document.getElementById("url").focus();
    });
}

document.forms.item(0).addEventListener("submit", function (ev) {
  ev.preventDefault();

  showWaitingDots();
  shortenUrl(
    ev.target.action,
    ev.target.url.value,
    ev.target["custom-path"].value
  );
});

$("#url").on("input", function () {
  $("#submit").attr("disabled", $(this).val().isEmpty());
  if ($("#message").is(":visible")) {
    $("#message").delay(2000).fadeOut();
  }
});
$("#dark-mode-toggle").change(function () {
  toggleMode();
  $("#url").focus();
});
$("button#customize").on("click", showCustomize);
$(document).ready(function () {
  $("#url").focus();
  $("#custom-path").hide();
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    $("#dark-mode-toggle").prop("checked", true);
    toggleMode();
  }
});
$(document).keydown(function (event) {
  if (event.key == "Escape" && $("input#custom-path").is(":focus")) {
    resetCustomize();
  }
});
