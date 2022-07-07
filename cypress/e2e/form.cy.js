describe("The Home Page", () => {
  it("displays url input with focus", () => {
    cy.visit("/about");

    cy.findByLabelText(/enter url/i)
      .should("exist")
      .and("have.focus");
  });
});
