// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import "@testing-library/cypress/add-commands";

import { RestAPI } from "@aws-amplify/api-rest";
import { Auth } from "@aws-amplify/auth";

import awsconfig from "../../aws-exports";

Auth.configure(awsconfig);
RestAPI.configure(awsconfig);

const testUser = {
  username: Cypress.env("username"),
  password: Cypress.env("password"),
};

const dataTestAttr = "data-testid";

Cypress.Commands.add("signIn", () => {
  const idToken = Auth.signIn(testUser.username, testUser.password).then(
    (cognitoUser) => cognitoUser.signInUserSession.idToken.jwtToken
  );
  cy.wrap(idToken).as("idToken");
});

Cypress.Commands.add("grantClipboardPermission", () => {
  cy.wrap(
    Cypress.automation("remote:debugger:protocol", {
      command: "Browser.grantPermissions",
      params: {
        permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
        // make the permission tighter by allowing the current origin only
        // like "http://localhost:56978"
        origin: window.location.origin,
      },
    })
  );
});

Cypress.Commands.add("createLinkCustom", (url, path) => {
  cy.get("@idToken").then((idToken) => {
    return RestAPI.post("miguelito", "/urls", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: { url, custom_path: path },
    });
  });
});

Cypress.Commands.add("removeLink", (path) => {
  cy.get("@idToken").then((idToken) => {
    return RestAPI.del("miguelito", `/urls/${path}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  });
});

Cypress.Commands.add("getByTestId", (...dataTestIds) => {
  const sel = dataTestIds.map((id) => `[${dataTestAttr}="${id}"]`).join(",");
  return cy.get(sel);
});
