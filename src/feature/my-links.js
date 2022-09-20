import "../components/link-item";

import { Alert } from "../alert";
import { API } from "../api";
import { currentUser } from "../auth";

const searchInput = document.getElementById("search-links");
const myLinksList = document.getElementById("my-links");
const linkCountBadge = document.getElementById("count-badge");
const linkCount = linkCountBadge.querySelector("span");

export const MyLinks = {
  init: () => {
    currentUser().then(loadUserLinks).catch(showSimpleUi);
    document.addEventListener("linkCreated", insertLinkCreated);
  },
};

async function loadUserLinks() {
  try {
    const links = await API.list();
    links.sort(byUpdateDate).reverse();
    insertAsLinkItems(links);
    searchInput.addEventListener("input", filterList);
  } catch (ignore) {
    // TODO: show an error message
  } finally {
    removePlaceholder();
    updateCount();
  }
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

function insertLinkCreated({ detail: link }) {
  insertLinkFirst(link);
  updateCount();
  flashCountBadge("success");
}

function insertLinkFirst(link) {
  myLinksList.prepend(createLinkItem(link));
}

function insertLinkLast(link) {
  myLinksList.appendChild(createLinkItem(link));
}

function createLinkItem(link) {
  const linkItem = document.createElement("link-item");
  linkItem.setAttribute("url", link.url);
  linkItem.setAttribute("origin", link.origin);
  linkItem.addEventListener("editConfirmed", handleEditConfirmed);
  linkItem.addEventListener("deleteConfirmed", handleDeleteConfirmed);
  return linkItem;
}

async function handleEditConfirmed(ev) {
  const linkItem = ev.target;
  try {
    await API.update(linkItem.backhalf, ev.detail);
    linkItem.confirm({ success: true });
  } catch (error) {
    Alert.error(error.message);
    linkItem.confirm({ success: false });
  }
}

async function handleDeleteConfirmed(ev) {
  const linkItem = ev.target;
  try {
    await API.remove(linkItem.backhalf);
    await linkItem.confirm({ success: true });
    await linkItem.deleteAnimated();
    updateCount();
    flashCountBadge("danger");
  } catch (error) {
    Alert.error(error.message);
    linkItem.confirm({ success: false });
  }
}

function removePlaceholder() {
  myLinksList.querySelectorAll(".placeholder").forEach((p) => p.remove());
  linkCountBadge.classList.remove("placeholder");
}

function filterList(inputEvent) {
  const searchText = inputEvent.target.value;
  const links = myLinksList.querySelectorAll("link-item");
  links.forEach((link) => link.filter(searchText));
  updateCount();
}

function updateCount() {
  const searchTextIsNotEmpty = searchInput.value.trim().length !== 0;
  linkCountBadge.classList.toggle("filtered", searchTextIsNotEmpty);
  const itemCount = visibleItemCount();
  linkCount.innerText = itemCount > 0 ? itemCount : "-";
}

function flashCountBadge(selector = "success") {
  linkCountBadge.classList.add(selector);
  setTimeout(() => linkCountBadge.classList.remove(selector), 2000);
}

function visibleItemCount() {
  return myLinksList.querySelectorAll(
    "link-item:not(.hidden):not(.placeholder)"
  ).length;
}

function showSimpleUi() {
  const form = document.getElementById("content1");
  const tabs = document.querySelector(".tabs");
  tabs.replaceWith(form);
}
