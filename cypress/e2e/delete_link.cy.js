import awsconfig from "../../aws-exports";

const apiUrl = awsconfig.API.endpoints[0].endpoint;
const myTestLink = "my-test-link";

describe("Delete link", () => {
  beforeEach(() => {
    cy.signIn();
    cy.removeAllLinksOwnedByUser();
    cy.createLinkCustom("https://www.cypress.io/", myTestLink);
    cy.visit("/");
    cy.contains("My Links").click();
  });

  it("deletes the link when click on the delete button", () => {
    cy.get(`link-item[url$="/${myTestLink}"]`)
      .as("link")
      .shadow()
      .within(() => {
        cy.intercept("DELETE", `${apiUrl}/links/${myTestLink}`).as("apiCall");
        cy.getByTestId("delete").click();
        cy.getByTestId("cancel", "confirm").should("be.visible");

        cy.getByTestId("confirm").click();
        cy.getByTestId("cancel", "confirm").should("be.disabled");

        cy.wait("@apiCall");
        cy.getByTestId("ico-success").should("be.visible");
        cy.getByTestId("edit", "delete").should("be.visible");
      });
    cy.get("@link").should("not.exist");
    cy.getByTestId("count-badge").invoke("text").should("equal", "-");
  });
});
