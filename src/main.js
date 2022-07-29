import "../node_modules/papercss/dist/paper.min.css";
import "../css/main.css";
import "../css/waiting.css";

import { API } from "./api";
import { Clipboard } from "./feature/clipboard";
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
  Clipboard.init();
});
