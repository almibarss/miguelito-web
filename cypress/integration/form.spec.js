describe("The Home Page", () => {
  it("displays url input with focus", () => {
    cy.visit("/");

    cy.findByLabelText(/enter url/i)
      .should("exist")
      .and("have.focus");
  });
});
