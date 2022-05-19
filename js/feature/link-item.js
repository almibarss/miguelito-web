export class LinkItem {
  constructor(linkItem) {
    this.linkItem = linkItem;
    this.deleteButton = linkItem.querySelector(".btn-delete");
  }

  get path() {
    return this.linkItem.dataset.path;
  }

  toggleHighlight() {
    ["border", "border-danger", "shadow"].forEach((cl) =>
      this.linkItem.classList.toggle(cl)
    );
    return this;
  }

  toggleConfirmDelete() {
    this.linkItem.classList.toggle("link-item--confirmDelete");
    return this;
  }

  startWaiting() {
    const del = this.deleteButton;
    ["btn-danger", "btn-success"].forEach((cl) => del.classList.remove(cl));
    del.classList.add("btn-primary", "btn-delete--waiting");
    del.disabled = true;
    return this;
  }

  doneWaiting() {
    const del = this.deleteButton;
    ["btn-primary", "btn-delete--waiting"].forEach((cl) =>
      del.classList.remove(cl)
    );
    del.classList.add("btn-danger");
    del.disabled = false;
    return this;
  }

  success() {
    const del = this.deleteButton;
    ["btn-warning", "btn-danger"].forEach((cl) => del.classList.remove(cl));
    del.classList.add("btn-success", "btn-delete--success");
    return this;
  }

  failure() {
    const del = this.deleteButton;
    ["btn-warning", "btn-success"].forEach((cl) => del.classList.remove(cl));
    del.classList.add("btn-danger", "btn-delete--failure", "shake-horizontal");
    return this;
  }

  removeAfter(millis) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(this.removeAnimated()), millis)
    );
  }

  removeAnimated() {
    return new Promise((resolve) => {
      const li = this.linkItem;
      li.addEventListener("animationend", () => {
        li.remove();
        resolve();
      });
      li.classList.add("removed-item");
    });
  }

  resetAfter(millis) {
    setTimeout(() => this.reset(), millis);
  }

  reset() {
    const del = this.deleteButton;
    ["btn-warning", "btn-success"].forEach((cl) => del.classList.remove(cl));
    [
      "btn-delete--waiting",
      "btn-delete--failure",
      "btn-delete--success",
      "shake-horizontal",
    ].forEach((cl) => del.classList.remove(cl));
    del.classList.add("btn-danger");
    del.disabled = false;
  }
}
