import awsconfig from "../../aws-exports";
import { expectErrorMessageMatching } from "../support/utils";

const myTestLink = "my-test-link";

const apiUrl = awsconfig.API.endpoints[0].endpoint;
describe("Edit link", () => {
  beforeEach(() => {
    cy.signIn();
    cy.removeAllLinksOwnedByUser();
    cy.grantClipboardPermission();
    cy.createLinkCustom("https://www.cypress.io/", myTestLink);
    cy.visit("/");
    cy.contains("My Links").click();
  });

  it("updates the link data when given the correct input", function () {
    cy.fetchBaseUrl();
    cy.get(`link-item[url$="/${myTestLink}"]`)
      .shadow()
      .within(() => {
        cy.intercept("PATCH", `${apiUrl}/links/${myTestLink}`).as("apiCall");
        cy.getByTestId("edit").click();
        cy.getByTestId("cancel", "confirm").should("be.visible");
        cy.getByTestId("backhalf-edit")
          .clear()
          .type(`${myTestLink}-changed`, { force: true });
        cy.getByTestId("origin-edit")
          .clear()
          .type(`https://www.google.com`, { force: true });

        cy.getByTestId("confirm").click();
        cy.getByTestId("cancel", "confirm").should("be.disabled");

        cy.wait("@apiCall");
        cy.getByTestId("ico-success").should("be.visible");
        cy.getByTestId("link-url").should(
          "have.attr",
          "href",
          `${this.baseUrl}${myTestLink}-changed`
        );
        cy.getByTestId("link-origin").should(
          "have.text",
          "https://www.google.com"
        );
        cy.getByTestId("edit", "delete").should("be.visible");
      });
  });

  it("displays an error message when the new data is invalid", () => {
    cy.get(`link-item[url$="/${myTestLink}"]`)
      .shadow()
      .within(() => {
        cy.intercept("PATCH", `${apiUrl}/links/${myTestLink}`).as("apiCall");
        cy.getByTestId("edit").click();
        cy.getByTestId("backhalf-edit")
          .clear()
          .type("inv*lid character$", { force: true });

        cy.getByTestId("confirm").click();

        cy.wait("@apiCall");
        cy.getByTestId("ico-failure").should("be.visible");
        cy.getByTestId("edit", "delete").should("be.visible");
      });
    expectErrorMessageMatching(/backhalf does not match/i);
  });
});
