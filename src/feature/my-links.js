import "../components/link-item";

import { API } from "../api";
import { currentUser } from "../auth";
import { Ui } from "../ui";

export const MyLinks = {
  init: () => {
    currentUser().then(loadUserLinks).catch(showSimpleUi);
    document.addEventListener("linkCreated", ({ detail: link }) => {
      insertLinkFirst(link);
      updateCount();
      flashCountBadge("success");
    });
  },
};

function loadUserLinks() {
  API.list()
    .then((links) => links.sort(byUpdateDate).reverse())
    .then(insertAsLinkItems)
    .finally(removePlaceholder);
  Ui.Inputs.searchLinks.addEventListener("input", filter);
}

function byUpdateDate(link1, link2) {
  return (
    Date.parse(link1.updated_at ?? link1.created_at) -
    Date.parse(link2.updated_at ?? link2.created_at)
  );
}

function insertAsLinkItems(links) {
  links.forEach(insertLinkLast);
}

function insertLinkFirst(link) {
  Ui.Lists.myLinks.prepend(createLinkItem(link));
}

function insertLinkLast(link) {
  Ui.Lists.myLinks.appendChild(createLinkItem(link));
}

function createLinkItem(link) {
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
  return linkItem;
}

function removePlaceholder() {
  Ui.Lists.myLinks
    .querySelectorAll(".placeholder")
    .forEach((pl) => pl.remove());
  updateCount();
}

function handleConfirmDelete(linkItem) {
  API.remove(linkItem.backhalf)
    .then(() => linkItem.confirm({ success: true }))
    .then(() => linkItem.deleteAnimated())
    .then(updateCount)
    .then(() => flashCountBadge("danger"))
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

function flashCountBadge(selector = "success") {
  Ui.Badges.linkCount.classList.add(selector);
  setTimeout(() => Ui.Badges.linkCount.classList.remove(selector), 2000);
}

function visibleItemCount() {
  return Ui.Lists.myLinks.querySelectorAll("link-item:not(.is-hidden)").length;
}

function showSimpleUi() {
  const form = Ui.Forms.shorten;
  const tabs = document.querySelector(".tabs");
  tabs.replaceWith(form);
}
