import { error500, expectLinkCountEqualsTo, expectUnexpectedErrorMessage } from "../support/utils";

const myTestLink = "my-test-link";

describe("Delete link", () => {
  beforeEach(() => {
    cy.signIn();
    cy.deleteAllLinks();
    cy.createLinkCustom("https://www.cypress.io/", myTestLink);
    cy.visit("/");
    cy.contains("My Links").click();
  });

  it("deletes the link when click on the delete button", function() {
    cy.get(`short-link[url$="/${myTestLink}"]`)
      .as("link")
      .shadow()
      .within(() => {
        cy.intercept("DELETE", `${this.apiUrl}/links/${myTestLink}`).as("apiCall");

        cy.getByTestId("delete").click();
        cy.getByTestId("cancel", "confirm").should("be.visible");
        cy.getByTestId("confirm").click();

        cy.getByTestId("cancel").click();
        // cy.getByTestId("cancel", "confirm").should("be.disabled");
        cy.wait("@apiCall");
        cy.getByTestId("ico-success").should("be.visible");
        cy.getByTestId("edit", "delete").should("be.visible");
      });
    cy.get("@link").should("not.exist");
    expectLinkCountEqualsTo("-");
  });

  it("displays an error message on unexpected errors", function() {
    cy.get(`short-link[url$="/${myTestLink}"]`)
      .as("link")
      .shadow()
      .within(() => {
        cy.intercept("DELETE", `${this.apiUrl}/links/${myTestLink}`, error500).as("apiError");

        cy.getByTestId("delete").click();
        cy.getByTestId("confirm").click();

        cy.wait("@apiError");
        cy.getByTestId("ico-failure").should("be.visible");
      });
    expectUnexpectedErrorMessage();
    cy.get("@link").should("exist");
  });
});
