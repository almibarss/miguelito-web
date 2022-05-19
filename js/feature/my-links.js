import { API } from "../api";
import { currentUser } from "../auth";
import { Ui } from "../ui";
import { LinkItem } from "./link-item";

export const MyLinks = {
  init: () => {
    currentUser().then(loadUserUrls).catch(showSimpleUi);
  },
};

function loadUserUrls() {
  API.list().then(insertAsLinkItems).then(updateCount);
  Ui.Inputs.searchLinks.addEventListener("input", filterList);
}

function insertAsLinkItems(urls) {
  urls.forEach(insertLink);
}

function insertLink(url) {
  const newLinkItem = Ui.Lists.myLinks.querySelector("li").cloneNode(true);
  bindActions(newLinkItem);
  newLinkItem.dataset["path"] = url.path;

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
    .querySelector(".btn-delete")
    .addEventListener("click", confirmDelete);
  linkItem.querySelector(".btn-confirm").addEventListener("click", doDelete);
  linkItem.querySelector(".btn-cancel").addEventListener("click", cancelDelete);
}

function filterList(inputEvent) {
  const searchText = inputEvent.target.value;
  const linkItems = Ui.Lists.myLinks.querySelectorAll(
    "li:not([class='template-item'])"
  );
  for (const item of linkItems) {
    if (matchesSearch(item, searchText)) {
      highlightSearch(item, searchText);
      item.show();
    } else {
      item.hide();
    }
  }
  updateCount();
}

function matchesSearch(item, searchText) {
  const shortUrl = item.querySelector("a");
  const longUrl = item.querySelector("span");
  return (
    shortUrl.textContent.includesCaseInsensitive(searchText) ||
    longUrl.textContent.includesCaseInsensitive(searchText)
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
  const linkItem = new LinkItem(clickEvent.target.closest("li"));
  linkItem.toggleHighlight().toggleConfirmDelete();
}

function cancelDelete(clickEvent) {
  const linkItem = new LinkItem(clickEvent.target.closest("li"));
  linkItem.toggleHighlight().toggleConfirmDelete();
}

function doDelete(clickEvent) {
  const linkItem = new LinkItem(clickEvent.target.closest("li"));
  linkItem.toggleHighlight().toggleConfirmDelete().startWaiting();
  API.remove(linkItem.path)
    .then(() => handleDeleteOk(linkItem))
    .catch((error) => handleDeleteError(linkItem, error));
}

function handleDeleteOk(linkItem) {
  linkItem.doneWaiting().success().removeAfter(1000).then(updateCount);
}

function handleDeleteError(linkItem, error) {
  Ui.errorWithTimeout(error.message, 5000);
  linkItem.doneWaiting().failure().resetAfter(1500);
}

function updateCount() {
  const searchText = Ui.Inputs.searchLinks.value;
  const countBadge = Ui.Badges.linkCount;
  const itemCount = visibleItemCount();
  if (searchText.isEmpty()) {
    updateCountUnfiltered(countBadge, itemCount);
  } else {
    updateCountFiltered(countBadge, itemCount);
  }
}

function updateCountUnfiltered(countBadge, itemCount) {
  if (itemCount === 0) {
    countBadge.hide();
    return;
  }
  countBadge.replaceChild(
    document.createTextNode(itemCount),
    countBadge.lastChild
  );
  countBadge.show();
  countBadge.querySelector(".fa-filter").hide();
}

function updateCountFiltered(countBadge, itemCount) {
  countBadge.replaceChild(
    document.createTextNode(` ${itemCount > 0 ? itemCount : "-"}`),
    countBadge.lastChild
  );
  countBadge.show();
  countBadge.querySelector(".fa-filter").show();
}

function visibleItemCount() {
  return Ui.Lists.myLinks.querySelectorAll(
    "li:not([class='template-item']):not([class='hidden'])"
  ).length;
}

function showSimpleUi() {
  const form = Ui.Forms.shorten;
  const tabs = document.querySelector(".tabs");
  tabs.replaceWith(form);
}
