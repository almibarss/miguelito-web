const expandButton = document.querySelector("button#customize");
const customPathDiv = document.querySelector("div#custom-path");
const customPathInput = document.querySelector("input#custom-path");

export const Customize = {
  init: () => {
    expandButton.addEventListener("click", expand);
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
