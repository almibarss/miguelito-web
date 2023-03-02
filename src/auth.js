import { Auth as AwsAuth } from "@aws-amplify/auth";
import { Hub } from "@aws-amplify/core";

const userOneof = document.getElementById("user");
const signInButton = document.getElementById("btn-signin");
const signOutLink = document.getElementById("lnk-signout");
const username = document.getElementById("username");
const welcomePane = document.getElementById("welcome-pane");
const tablist = document.querySelector("[role=tablist]");

const authModal = {
  text: document.getElementById("signin-failure-desc"),
  window: document.getElementById("modal"),
  state: document.getElementById("signin-failure-modal"),
  closeBtn: document.getElementById("signin-failure-close-btn"),
  lastFocus: document.activeElement,
  open(errType) {
    this.text.classList.add(`is-${errType}`);
    this.lastFocus = document.activeElement;
    this.closeBtn.focus();
    this.focusRestrict();
    this.onClose(() => this.lastFocus.focus());
    this.onEscape(() => this.close());
    this.state.checked = true;
  },
  close() {
    this.state.checked = false;
    this.lastFocus.focus();
  },
  focusRestrict() {
    document.addEventListener("focus", (ev) => {
      if (!this.window.contains(ev.target)) {
        ev.stopPropagation();
        this.closeBtn.focus();
      }
    }, true);
  },
  onEscape(fn) {
    this.window.addEventListener("keydown", ({ key }) => {
      if (key === "Escape") {
        fn();
      }
    });
  },
  onClose(fn) {
    authModal.state.addEventListener("change", () => {
      if (!authModal.state.checked) {
        fn();
      }
    });
  }
};

export const Auth = {
  init() {
    Auth.currentUser()
      .then((user) => {
        displayUserName(user);
        showUserFunctions();
      })
      .catch(() => {
        promptSignIn();
        hideUserMenu();
      })
      .finally(hidePlaceholder);
    signInButton.addEventListener("click", async function() {
      return await AwsAuth.federatedSignIn({ provider: "Google" });
    });
    signOutLink.addEventListener("click", async function() {
      return await AwsAuth.deleteUser();
    });
  },
  currentUser() {
    return AwsAuth.currentSession().then((user) => {
      const idToken = user.getIdToken();
      return {
        name: idToken.payload.given_name,
        jwtToken: idToken.getJwtToken()
      };
    });
  },
  alertSignInFailure() {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      if (event !== "signIn_failure") {
        return;
      }
      if (data.message.includes("USER_NOT_FOUND")) {
        authModal.open("user-not-found");
      } else if (data.message.includes("WAITING_APPROVAL")) {
        authModal.open("waiting-approval");
      }
    });
  }
};

function promptSignIn() {
  tablist.replaceWith(welcomePane);
}

function showUserFunctions() {
  welcomePane.replaceWith(tablist);
}

function displayUserName({ name }) {
  userOneof.classList.add("is-user-menu");
  username.textContent = name;
}

function hideUserMenu() {
  userOneof.remove();
}

function hidePlaceholder() {
  userOneof.classList.remove("is-user-placeholder");
}
