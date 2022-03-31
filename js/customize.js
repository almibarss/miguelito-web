const expandButton = document.querySelector("button#customize");
const customPathDiv = document.querySelector("div#custom-path");
const customPathInput = customPathDiv.querySelector("input");

export const Customize = {
  init: () => {
    expandButton.addEventListener("click", expand);
    customPathInput.addEventListener("keydown", collapseIfEscPressed);
  },
  collapse: () => {
    if (customPathDiv.classList.contains("hidden")) {
      return;
    }

    expandButton.classList.remove("hidden");
    customPathDiv.classList.add("hidden");
    customPathInput.value = "";
  },
  allow: () => {
    expandButton.classList.remove("hidden");
  },
  disallow: () => {
    expandButton.classList.add("hidden");
  },
};

function expand() {
  expandButton.classList.add("hidden");
  customPathDiv.classList.remove("hidden");
  customPathInput.focus();
}

function collapseIfEscPressed({ key }) {
  if (key === "Escape") {
    Customize.collapse();
  }
}
