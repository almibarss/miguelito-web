import "../components/short-link";

import { Alert } from "../alert";
import { Api, AuthError, UnknownError } from "../api";
import { Auth } from "../auth";

const searchInput = document.getElementById("search-links");
const myLinksList = document.getElementById("my-links");
const linkCountBadge = document.getElementById("count-badge");
const linkCount = linkCountBadge.querySelector("span");
const mutationObserver = new MutationObserver(disableLinksOnPendingAction);

export const MyLinks = {
  init() {
    Auth.currentUser().then(loadUserLinks).catch(noop);
    document.addEventListener("linkCreated", insertLinkCreated);
    searchInput.addEventListener("input", filterList);
    myLinksList.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        scrollOneByOne(event);
      }
    });
  }
};

async function loadUserLinks() {
  try {
    const links = await Api.list();
    links.sort(byUpdateDate).reverse();
    insertAsLinkItems(links);
    updateCount();
  } catch (error) {
    alertError(error);
    updateCountWithError();
  } finally {
    removePlaceholder();
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

function resetSearch() {
  searchInput.value = ''
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
}

function insertLinkCreated({ detail: link }) {
  insertLinkFirst(link, { filtered: isListFiltered() });
  updateCount();
  flashCountBadge();
  resetSearch();
}

function isListFiltered() {
  return searchInput.value.trim().length > 0;
}

function insertLinkFirst(link, options) {
  const shortLink = createShortLink(link);
  if (options?.filtered) {
    shortLink.classList.add("filtered");
  }
  myLinksList.prepend(shortLink);
}

function insertLinkLast(link) {
  myLinksList.appendChild(createShortLink(link));
}

function createShortLink(link) {
  const shortLink = document.createElement("short-link");
  shortLink.setAttribute("url", link.url);
  shortLink.setAttribute("origin", link.origin);
  shortLink.setAttribute("role", "listitem");
  shortLink.addEventListener("editConfirmed", handleEditConfirmed);
  shortLink.addEventListener("deleteConfirmed", handleDeleteConfirmed);
  mutationObserver.observe(shortLink, { attributes: true });
  return shortLink;
}


function disableLinksOnPendingAction(mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.type !== "attributes" || mutation.attributeName !== "action") {
      return;
    }
    const pendingAction = mutation.target.getAttribute("action") !== null;
    searchInput.disabled = pendingAction;
    myLinksList.querySelectorAll("short-link:not([action])").forEach((link) => {
      if (pendingAction) {
        link.setAttribute("disabled", "");
      } else {
        link.removeAttribute("disabled");
      }
    });
  }
}

async function handleEditConfirmed(ev) {
  const shortLink = ev.target;
  try {
    await Api.update(shortLink.backhalf, ev.detail);
    shortLink.confirmAction({ success: true }).then(resetSearch);
  } catch (error) {
    confirmActionWithError(error, shortLink);
  }
}

async function handleDeleteConfirmed(ev) {
  const linkItem = ev.target;
  try {
    await Api.remove(linkItem.backhalf);
    await linkItem.confirmAction({ success: true });
    await linkItem.deleteAnimated();
    updateCount();
    flashCountBadge();
  } catch (error) {
    confirmActionWithError(error, linkItem);
  }
}

function confirmActionWithError(error, linkItem) {
  alertError(error);
  linkItem.confirmAction({ success: false });
}

function alertError(error) {
  if (error instanceof AuthError) {
    Alert.error("oops, it looks like your account is not activated ( ´･_･`)");
  } else if (error instanceof UnknownError) {
    Alert.error("oops, something went wrong (◕‸ ◕✿)");
  } else {
    Alert.error(error.message);
  }
}

function removePlaceholder() {
  myLinksList.querySelectorAll(".placeholder").forEach((p) => p.remove());
  linkCountBadge.classList.remove("placeholder");
}

function filterList() {
  const searchText = searchInput.value;
  const links = myLinksList.querySelectorAll("short-link");
  links.forEach((link) => link.classList.toggle("filtered", !link.filter(searchText)));
  updateCount();
}

function updateCount() {
  const searchTextIsNotEmpty = searchInput.value.trim().length !== 0;
  linkCountBadge.classList.toggle("filtered", searchTextIsNotEmpty);
  const itemCount = visibleItemCount();
  linkCount.innerText = itemCount > 0 ? itemCount : "-";
}

function updateCountWithError() {
  linkCountBadge.classList.remove("secondary");
  linkCountBadge.classList.add("danger");
  linkCount.innerText = "X";
}

function flashCountBadge() {
  const color = "warning";
  linkCountBadge.classList.add(color);
  setTimeout(() => linkCountBadge.classList.remove(color), 2000);
}

function visibleItemCount() {
  return myLinksList.querySelectorAll(
    "short-link:not(.filtered, .placeholder)"
  ).length;
}

function scrollOneByOne({ key }) {
  const focusedLink = document.activeElement;
  if (focusedLink.getAttribute("action") !== null) {
    return;
  }
  const links = myLinksList.querySelectorAll("short-link:not(.filtered)");
  let focusedLinkIdx = [].indexOf.call(Array.from(links), focusedLink);
  if (key === "ArrowDown" && focusedLinkIdx < links.length - 1) {
    ++focusedLinkIdx;
  } else if (key === "ArrowUp" && focusedLinkIdx > 0) {
    --focusedLinkIdx;
  }
  links[focusedLinkIdx].focus();
}

function noop() {
}
