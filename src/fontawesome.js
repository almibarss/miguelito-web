import { dom, library } from "@fortawesome/fontawesome-svg-core";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  faCheck,
  faClipboard,
  faFilter,
  faLock,
  faMagicWandSparkles,
  faMoon,
  faPen,
  faSun,
  faThumbsDown,
  faThumbsUp,
  faTimes,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export const Fontawesome = {
  init() {
    library.add(
      faCheck,
      faClipboard,
      faFilter,
      faLock,
      faMagicWandSparkles,
      faMoon,
      faPen,
      faSun,
      faThumbsDown,
      faThumbsUp,
      faTimes,
      faTrash,
      faUser,
      faGoogle
    );
    dom.watch();
  },
};
