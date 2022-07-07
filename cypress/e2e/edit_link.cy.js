let myTestLink = "my-test-link";

describe("Edit links", () => {
  beforeEach(() => {
    cy.signIn();
    cy.grantClipboardPermission();
    cy.createLinkCustom("https://www.cypress.io/", myTestLink);
    cy.visit("/");
    cy.contains("My Links").click();
  });

  afterEach(() => {
    cy.removeLink(myTestLink);
  });

  it("performs successfully when given the correct input", () => {
    cy.get(`link-item[url$="/${myTestLink}"]`)
      .shadow()
      .within(() => {
        const myTestLinkChanged = `${myTestLink}-changed`;
        cy.getByTestId("btn-edit").click();
        cy.getByTestId("btn-cancel", "btn-confirm").should("be.visible");
        cy.getByTestId("input-url")
          .clear()
          .type(myTestLinkChanged, { force: true });
        cy.getByTestId("input-origin")
          .clear()
          .type(`https://www.google.com`, { force: true });

        cy.getByTestId("btn-confirm").click();
        cy.getByTestId("btn-confirm", "btn-cancel").should("be.disabled");

        cy.getByTestId("ico-success").should("be.visible");
        cy.getByTestId("link-url").then(($link) => {
          const updatedLink = new RegExp(`/${myTestLinkChanged}$`);
          expect($link.text()).to.match(updatedLink);
          expect($link).to.have.attr("href").match(updatedLink);
        });
        cy.getByTestId("link-origin").should(
          "have.text",
          "https://www.google.com"
        );
        myTestLink = myTestLinkChanged;
      });
  });

  it("shows an error message when the changes are invalid", () => {
    cy.get(`link-item[url$="/${myTestLink}"]`)
      .shadow()
      .within(() => {
        cy.getByTestId("btn-edit").click();
        cy.getByTestId("input-url")
          .clear()
          .type("inv*lid character$", { force: true });

        cy.getByTestId("btn-confirm").click();

        cy.getByTestId("ico-failure").should("be.visible");
      });
    cy.getByTestId("alert")
      .should("be.visible")
      .and("have.class", "alert-danger")
      .and("contain.text", "Path does not match");
  });
});
