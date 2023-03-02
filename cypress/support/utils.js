export const error500 = {
  statusCode: 500,
  body: "oops!",
}

export function expectSuccessMessageContainingLink(
  expectedHostname,
  expectedBackhalf
) {
  cy.getByTestId("alert-success")
    .should("be.visible")
    .and("have.class", "alert-success")
    .find("a")
    .should("have.attr", "href", expectedHostname + expectedBackhalf);
}

export function expectUnexpectedErrorMessage() {
  expectErrorMessageMatching(/something went wrong/i);
}

export function expectErrorMessageMatching(expr) {
  cy.getByTestId("alert-error")
    .should("be.visible")
    .and("have.class", "alert-danger")
    .invoke("text")
    .should("match", expr);
}

export function expectExistingLinkItem(
  expectedHostname,
  expectedBackhalf,
  expectedOrigin
) {
  cy.get(`short-link[url="${expectedHostname}${expectedBackhalf}"]`)
    .should("have.attr", "origin", expectedOrigin);
}

export function expectLinkCountEqualsTo(count) {
  cy.getByTestId("count-badge")
    .invoke("text")
    .then((t) => t.trim())
    .should("equal", count.toString());
}

export function expectLinkCountWithError() {
  cy.getByTestId("count-badge")
    .should("have.class", "danger")
    .invoke("text")
    .then((t) => t.trim())
    .should("equal", "X")
}
