import { API } from "../api";
import { Ui } from "../ui";

export const MyLinks = {
  init: () => {
    API.list().then((urls) => urls.forEach(display));
  },
};

function display(url) {
  const newLinkItem = Ui.Lists.myLinks.querySelector("li").cloneNode(true);
  const a = newLinkItem.querySelector("a");
  a.setAttribute("href", url.links_to);
  a.textContent = url.shortened_url;
  newLinkItem.show();
  Ui.Lists.myLinks.appendChild(newLinkItem);
}
