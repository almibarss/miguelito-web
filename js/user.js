import { currentUser, login, logout } from "./auth";
import { Customize } from "./customize";

export const User = {
  init: () => {
    bindUserActions();
    currentUser().then(userIsLoggedIn).catch(userIsNotLoggedIn);
  },
};

function bindUserActions() {
  document
    .querySelector(".user__profile a")
    .addEventListener("click", () => logout());
  document
    .querySelector(".user__login>button")
    .addEventListener("click", () => login());
  document
    .querySelector(".user__profile>button")
    .addEventListener("click", () => {
      const userProfile = document.querySelector(".user__profile");
      ["user__profile--expanded", "user__profile--collapsed"].forEach((cl) =>
        userProfile.classList.toggle(cl)
      );
    });
}

function userIsLoggedIn({ name: username }) {
  document.querySelector(".user").classList.add("user--loggedIn");
  document.querySelector(".user__profile .user__name").textContent = username;
  Customize.allow();
}

function userIsNotLoggedIn() {
  document.querySelector(".user").classList.remove("user--loggedIn");
  Customize.disallow();
}
