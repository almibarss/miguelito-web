import { currentUser, signin, signout } from "./auth";
import { Ui } from "./ui";

const usermenu = document.querySelector("nav .container-exclusive.user");

export const User = {
  init: () => {
    Ui.Links.signin.addEventListener("click", signin);
    Ui.Links.signout.addEventListener("click", signout);
    currentUser().then(userIsLoggedIn).catch(userIsNotLoggedIn);
  },
};

function userIsLoggedIn({ name: username }) {
  ["is-placeholder", "is-profile"].forEach((cl) =>
    usermenu.classList.toggle(cl)
  );
  Ui.Text.username.textContent = username;
}

function userIsNotLoggedIn() {
  ["is-placeholder", "is-lnk-signin"].forEach((cl) =>
    usermenu.classList.toggle(cl)
  );
}
