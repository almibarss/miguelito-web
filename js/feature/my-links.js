import { API } from "../api";
import { currentUser } from "../auth";
import { Ui } from "../ui";

export const MyLinks = {
  init: () => {
    currentUser().then(loadUserUrls).catch(showSimpleUi);
  },
};

function loadUserUrls() {
  API.list().then((urls) => urls.forEach(display));
}

function display(url) {
  const newLinkItem = Ui.Lists.myLinks.querySelector("li").cloneNode(true);
  const a = newLinkItem.querySelector("a");
  a.setAttribute("href", url.links_to);
  a.textContent = url.shortened_url;
  newLinkItem.show();
  Ui.Lists.myLinks.appendChild(newLinkItem);
}

function showSimpleUi() {
  const form = Ui.Forms.shorten;
  const tabs = document.querySelector(".tabs");
  tabs.replaceWith(form);
}
