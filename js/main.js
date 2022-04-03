import "../node_modules/papercss/dist/paper.min.css";
import "../css/main.css";
import "../css/waiting.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/regular";
import "@fortawesome/fontawesome-free/js/solid";

import { MyLinks } from "./feature/my-links";
import { Shorten } from "./feature/shorten";
import { Theme } from "./theme";
import { User } from "./user";

document.addEventListener("DOMContentLoaded", () => {
  User.init();
  Theme.init();
  Shorten.init();
  MyLinks.init();
});
