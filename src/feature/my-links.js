import "../components/link-item";

import { API } from "../api";
import { currentUser } from "../auth";
import { Ui } from "../ui";

export const MyLinks = {
  init: () => {
    currentUser().then(loadUserLinks).catch(showSimpleUi);
  },
};

function loadUserLinks() {
  API.list().then(includeShortUrl).then(insertAsLinkItems).then(updateCount);
  Ui.Inputs.searchLinks.addEventListener("input", filter);
}

function includeShortUrl(links) {
  return links.map((link) => {
    return { ...link, url: buildShortUrl(link.backhalf) };
  });
}

function buildShortUrl(backhalf) {
  return localStorage.getItem("baseUrl") + backhalf;
}

function insertAsLinkItems(links) {
  links.forEach(insertLink);
}

function insertLink(link) {
  const linkItem = document.createElement("link-item");
  linkItem.setAttribute("url", link.url);
  linkItem.setAttribute("origin", link.origin);
  linkItem.addEventListener("confirm", (ev) => {
    if (ev.detail.type === "delete") {
      handleConfirmDelete(linkItem);
    } else {
      handleConfirmEdit(linkItem, ev);
    }
  });
  Ui.Lists.myLinks.appendChild(linkItem);
}

function handleConfirmDelete(linkItem) {
  API.remove(linkItem.backhalf)
    .then(() => linkItem.confirm({ success: true }))
    .then(() => linkItem.deleteAnimated())
    .catch((error) => {
      Ui.errorWithTimeout(error.message, 2000);
      linkItem.confirm({ success: false });
    });
}

function handleConfirmEdit(linkItem, confirmEvent) {
  API.update(linkItem.backhalf, confirmEvent.detail.newData)
    .then(() => linkItem.confirm({ success: true }))
    .catch((error) => {
      Ui.errorWithTimeout(error.message, 2000);
      linkItem.confirm({ success: false });
    });
}

function filter(inputEvent) {
  const searchText = inputEvent.target.value;
  const links = Ui.Lists.myLinks.querySelectorAll("link-item");
  links.forEach((link) => link.filter(searchText));
  updateCount();
}

function updateCount() {
  const searchText = Ui.Inputs.searchLinks.value;
  const countBadge = Ui.Badges.linkCount;
  const itemCount = visibleItemCount();
  countBadge.classList.toggle("is-filtered", !searchText.isEmpty());
  countBadge.replaceAllText("beforeend", itemCount > 0 ? itemCount : "-");
}

function visibleItemCount() {
  return Ui.Lists.myLinks.querySelectorAll("link-item:not(.is-hidden)").length;
}

function showSimpleUi() {
  const form = Ui.Forms.shorten;
  const tabs = document.querySelector(".tabs");
  tabs.replaceWith(form);
}
