import "@testing-library/cypress/add-commands";

import { Auth } from "@aws-amplify/auth";

import awsconfig from "../../aws-config.dev";
import { testuser } from "./e2e";

const apiUrl = awsconfig.API.endpoints[0].endpoint;

Auth.configure(awsconfig);

const dataTestAttr = "data-testid";

Cypress.Commands.add("signIn", () => {
  const idToken = Auth.signIn(testuser.username, testuser.password).then(
    (cognitoUser) => cognitoUser.signInUserSession.idToken.jwtToken
  );
  // idToken is actually a promise but as per the official documentation (https://docs.cypress.io/api/commands/wrap#Promises):
  // "You can wrap promises returned by the application code. Cypress commands will
  // automatically wait for the promise to resolve before continuing with the yielded
  // value to the next command or assertion."
  cy.wrap(idToken).as("idToken");
});

Cypress.Commands.add("fetchBaseUrl", () => {
  cy.request(`${apiUrl}/info`).then(({ body: { base_url } }) => {
    cy.wrap(base_url).as("baseUrl");
  });
});

Cypress.Commands.add("createLinkCustom", function (url, backhalf) {
  const options = {
    url: `${apiUrl}/links`,
    method: "POST",
    body: { origin: url, backhalf },
    auth: {
      bearer: this.idToken,
    },
  };
  cy.request(options);
});

Cypress.Commands.add("removeAllLinksOwnedByUser", function () {
  const options = {
    url: `${apiUrl}/links`,
    method: "DELETE",
    auth: {
      bearer: this.idToken,
    },
  };
  cy.request(options);
});

Cypress.Commands.add("getByTestId", (...dataTestIds) => {
  const sel = dataTestIds.map((id) => `[${dataTestAttr}="${id}"]`).join(",");
  return cy.get(sel);
});
