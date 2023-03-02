import { error500, expectLinkCountWithError, expectUnexpectedErrorMessage } from "../support/utils";

describe("List links", () => {
  beforeEach(() => {
    cy.signIn();
  });

  it("displays an error message on unexpected errors", function() {
    cy.intercept("GET", `${this.apiUrl}/links`, error500).as("apiError");

    cy.visit("/");

    cy.wait("@apiError");
    expectUnexpectedErrorMessage();
    expectLinkCountWithError();
  });
});
