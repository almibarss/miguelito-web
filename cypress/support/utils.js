export const expectSuccessMessageContainingLink = (
  expectedHostname,
  expectedBackhalf
) => {
  cy.getByTestId("alert")
    .should("be.visible")
    .and("have.class", "alert-success")
    .find("a")
    .should("have.attr", "href", expectedHostname + expectedBackhalf);
};

export const expectErrorMessageMatching = (expr) => {
  cy.getByTestId("alert")
    .should("be.visible")
    .and("have.class", "alert-danger")
    .invoke("text")
    .should("match", expr);
};

export const expectExistingLinkItem = (
  expectedHostname,
  expectedBackhalf,
  expectedOrigin
) => {
  cy.get(
    `link-item[url="${expectedHostname}${expectedBackhalf}"][origin="${expectedOrigin}"]`
  );
};
