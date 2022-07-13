import { currentUser, login, logout } from "./auth";
import { Shorten } from "./feature/shorten";
import { Ui } from "./ui";

export const User = {
  init: () => {
    Ui.Buttons.login.addEventListener("click", login);
    Ui.Buttons.logout.addEventListener("click", logout);
    Ui.Buttons.userProfile.addEventListener("click", toggleUserProfileOpen);
    currentUser().then(userIsLoggedIn).catch(userIsNotLoggedIn);
  },
};

function userIsLoggedIn({ name: username }) {
  document.querySelector(".user").classList.add("user--loggedIn");
  Ui.Text.username.textContent = username;
}

function userIsNotLoggedIn() {
  document.querySelector(".user").classList.remove("user--loggedIn");
}

function toggleUserProfileOpen() {
  const userProfile = document.querySelector(".user__profile");
  ["user__profile--expanded", "user__profile--collapsed"].forEach((cl) =>
    userProfile.classList.toggle(cl)
  );
}
