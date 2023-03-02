const tabs = document.querySelectorAll('[role="tab"]');
const tabList = document.querySelector('[role="tablist"]');

// Enable arrow navigation between tabs in the tab list
let tabFocus = 0;

export const Accessibility = {
  init() {
    clickLabelsOnKeyEnter();
    tabs.forEach((tab) => {
      tab.addEventListener("click", changeTabs);
    });
    tabList.addEventListener("keydown", (ev) => {
      // exclude tab focus switch on text inputs and custom elements
      if (['url', 'text', 'search'].includes(ev.target.type) || customElements.get(ev.target.nodeName.toLowerCase()) !== undefined) {
        return;
      }
      if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
        changeTabFocus(ev.key);
      }
    });
  }
};

function clickLabelsOnKeyEnter() {
  const interactiveLabels = document.querySelectorAll("label[role=button], label[role=tab]");
  interactiveLabels.forEach((label) => {
    label.addEventListener("keydown", function({ key }) {
      if (key === "Enter") {
        this.click();
      }
    });
  });
}

function changeTabs({ target }) {
  const parent = target.parentNode;

  // Remove all current selected tabs
  parent
    .querySelectorAll('[aria-selected="true"]')
    .forEach((t) => t.setAttribute("aria-selected", false));

  // Set this tab as selected
  target.setAttribute("aria-selected", true);
}

function changeTabFocus(key) {
  tabs[tabFocus].setAttribute("tabindex", -1);
  if (key === "ArrowRight") {
    // If we're at the end, go to the start
    if (++tabFocus >= tabs.length) {
      tabFocus = 0;
    }
    // Move left
  } else if (key === "ArrowLeft") {
    // If we're at the start, move to the end
    if (--tabFocus < 0) {
      tabFocus = tabs.length - 1;
    }
  }

  tabs[tabFocus].setAttribute("tabindex", 0);
  tabs[tabFocus].focus();
}