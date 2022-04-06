import { API } from "../api";
import { currentUser } from "../auth";
import { Ui } from "../ui";

export const MyLinks = {
  init: () => {
    currentUser().then(loadUserUrls).catch(showSimpleUi);
  },
};

function loadUserUrls() {
  API.list().then((urls) => urls.forEach(insertLink));
  Ui.Inputs.searchLinks.addEventListener("input", filterList);
}

function insertLink(url) {
  const newLinkItem = Ui.Lists.myLinks.querySelector("li").cloneNode(true);
  bindActions(newLinkItem);

  const a = newLinkItem.querySelector("a");
  a.setAttribute("href", url.shortened_url);
  a.textContent = url.shortened_url;

  const span = newLinkItem.querySelector("span");
  span.textContent = url.links_to;

  newLinkItem.classList.remove("template-item");
  Ui.Lists.myLinks.appendChild(newLinkItem);
}

function bindActions(linkItem) {
  linkItem
    .querySelector(".delete-button")
    .addEventListener("click", confirmDelete);
  linkItem.querySelector(".confirm-button").addEventListener("click", doDelete);
  linkItem
    .querySelector(".cancel-button")
    .addEventListener("click", cancelDelete);
}

function filterList(inputEvent) {
  const searchText = inputEvent.target.value;
  const linkItems = Ui.Lists.myLinks.querySelectorAll("li");
  for (const item of linkItems) {
    if (matchesSearch(item, searchText)) {
      highlightSearch(item, searchText);
      item.show();
    } else {
      item.hide();
    }
  }
}

function matchesSearch(item, searchText) {
  const shortUrl = item.querySelector("a");
  const longUrl = item.querySelector("span");
  return (
    shortUrl.textContent.includes(searchText) ||
    longUrl.textContent.includes(searchText)
  );
}

function highlightSearch(item, searchText) {
  const regex = new RegExp(searchText, "gi");
  for (const url of [item.querySelector("a"), item.querySelector("span")]) {
    url.innerHTML = url.innerHTML
      .replace(/(<mark class="background-warning">|<\/mark>)/gim, "")
      .replace(regex, '<mark class="background-warning">$&</mark>');
  }
}

function confirmDelete(clickEvent) {
  const enclosingLinkItem = clickEvent.target.closest("li");
  ["border", "border-danger", "shadow"].forEach((cl) =>
    enclosingLinkItem.classList.add(cl)
  );
  showConfirmActions(enclosingLinkItem);
}

function doDelete(clickEvent) {
  clickEvent.target.closest("li").remove();
}

function cancelDelete(clickEvent) {
  const enclosingLinkItem = clickEvent.target.closest("li");
  ["border", "border-danger", "shadow"].forEach((cl) =>
    enclosingLinkItem.classList.remove(cl)
  );
  hideConfirmActions(enclosingLinkItem);
}

function showConfirmActions(linkItem) {
  linkItem.querySelector(".confirm-button").show();
  linkItem.querySelector(".cancel-button").show();
  linkItem.querySelector(".delete-button").hide();
}

function hideConfirmActions(linkItem) {
  linkItem.querySelector(".confirm-button").hide();
  linkItem.querySelector(".cancel-button").hide();
  linkItem.querySelector(".delete-button").show();
}

function showSimpleUi() {
  const form = Ui.Forms.shorten;
  const tabs = document.querySelector(".tabs");
  tabs.replaceWith(form);
}
