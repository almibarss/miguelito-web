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
  messageBox.appendChild(shortenLink);
  messageBox.appendChild(copyButton);
  messageBox.classList.add("alert", "alert-success");
  messageBox.style.display = "block";
}

function showCustomize() {
  $("button#customize").hide();
  $("div#custom-path").show();
  $("input#custom-path").val("").focus();
}

function resetCustomize() {
  $("button#customize").show();
  $("div#custom-path").hide();
  $("input#custom-path").val("");
}

function resetUi() {
  $("#url").val("");
  resetCustomize();
}

function copyLinkToClipboard() {
  navigator.clipboard.writeText($("a#short-url").text());
}

function shortenLink(apiUrl, longUrl, customPath) {
  $.ajax(apiUrl, {
    type: "POST",
    data: JSON.stringify({ url: longUrl, custom_path: customPath }),
  })
    .done(function (responseJSON) {
      const protocol = `${window.location.protocol}//`;
      const host = `${window.location.host}/`;
      const shortUrl = protocol + host + responseJSON.path;
      displayShortenedUrl(longUrl, shortUrl);
      resetUi();
    })
    .fail(function (data) {
      if (data.responseJSON.detail) {
        console.error(data.responseJSON.detail);
      }
      if (data.status === 400) {
        showErrorMessage(data.responseJSON.message);
      } else {
        showErrorMessage("unexpected error ¯_(ツ)_/¯");
      }
      $("#url").select();
    });
}

document.forms.item(0).addEventListener("submit", function (ev) {
  ev.preventDefault();

  showWaitingDots();
  shortenLink(
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
