import "~styles/index.scss";

import { Api } from "./api";
import { Auth } from "./auth";
import { Fontawesome } from "./fontawesome";
import { ThemeToggle } from "./theme-toggle";
import { Accessibility } from "./accessibility";
import { Shorten } from "./feature/shorten";
import { MyLinks } from "./feature/my-links";

Auth.alertSignInFailure();

document.addEventListener("DOMContentLoaded", () => {
  Accessibility.init();
  Auth.init();
  Api.init();
  ThemeToggle.init();
  Fontawesome.init();
  Shorten.init();
  MyLinks.init();
});
