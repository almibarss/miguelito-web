import { currentUser, signin, signout } from "./auth";

const userOneof = document.getElementById("user");
const signInLink = document.getElementById("lnk-signin");
const signOutLink = document.getElementById("lnk-signout");
const username = document.getElementById("username");

export const User = {
  init: () => {
    signInLink.addEventListener("click", signin);
    signOutLink.addEventListener("click", signout);
    currentUser().then(userIsLoggedIn).catch(noUser).finally(removePlaceholder);
  },
  shakeSignIn: () => {
    const signInBox = signInLink.closest("div");
    signInBox.scrollIntoView({ behavior: "smooth", block: "center" });
    signInBox.classList.add("shake-top");
    signInBox.addEventListener("animationend", function () {
      this.classList.remove("shake-top");
    });
  },
};

function userIsLoggedIn({ name }) {
  userOneof.classList.add("is-user-menu");
  username.textContent = name;
}

function noUser() {
  userOneof.classList.add("is-signin");
}

function removePlaceholder() {
  userOneof.classList.remove("is-user-placeholder");
}
