import "~styles/index.scss";

import { API } from "./api";
import { MyLinks } from "./feature/my-links";
import { Shorten } from "./feature/shorten";
import { Theme } from "./theme";
import { User } from "./user";

document.addEventListener("DOMContentLoaded", () => {
  API.init();
  User.init();
  Theme.init();
  Shorten.init();
  MyLinks.init();
});
