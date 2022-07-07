import "../components/link-item";

import { API } from "../api";
import { currentUser } from "../auth";
import { Ui } from "../ui";

export const MyLinks = {
  init: () => {
    currentUser().then(loadUserUrls).catch(showSimpleUi);
  },
};

function loadUserUrls() {
  API.list().then(insertAsLinkItems).then(updateCount);
  Ui.Inputs.searchLinks.addEventListener("input", filter);
}

function insertAsLinkItems(urls) {
  urls.forEach(insertLink);
}

function insertLink(url) {
  const linkItem = document.createElement("link-item");
  linkItem.setAttribute("url", url.shortened_url);
  linkItem.setAttribute("origin", url.links_to);
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
  API.remove(linkItem.path)
    .then(() => linkItem.confirm({ success: true }))
    .then(() => linkItem.deleteAnimated())
    .catch((error) => {
      Ui.errorWithTimeout(error.message, 2000);
      linkItem.confirm({ success: false });
    });
}

function handleConfirmEdit(linkItem, confirmEvent) {
  API.update(linkItem.path, confirmEvent.detail.newData)
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
