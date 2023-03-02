import "@testing-library/cypress/add-commands";

import { Auth } from "@aws-amplify/auth";
// For admin-level Cognito APIs:
// https://www.maxivanov.io/aws-cognito-amplify-vs-amazon-cognito-identity-js-vs-aws-sdk/
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";

import awsconfig from "../../aws-config.dev";

const testuser = {
  username: Cypress.env("test_username"),
  password: Cypress.env("test_password"),
  email: Cypress.env("test_email")
};

const awscredentials = {
  accessKeyId: Cypress.env("aws_accessKeyId"),
  secretAccessKey: Cypress.env("aws_secretAccessKey")
};


const cognitoIdp = new CognitoIdentityProvider({
  region: awsconfig.Auth.region,
  credentials: {
    accessKeyId: awscredentials.accessKeyId,
    secretAccessKey: awscredentials.secretAccessKey
  }
});

const dataTestAttr = "data-testid";
Auth.configure(awsconfig);

before(() => {
  if (awscredentials.accessKeyId === undefined || awscredentials.secretAccessKey === undefined) {
    throw Error("aws credentials not found!");
  }
  if (testuser.username === undefined || testuser.password === undefined) {
    throw Error("test user not defined!");
  }
  cy.log(`Creating test user ${testuser.email}`);
  cy.createTestUser();
  cy.wrap(awsconfig.API.endpoints[0].endpoint).as("apiUrl");
});

beforeEach(() => {
  cy.log(`Sign in as ${testuser.email}`);
  cy.signIn();  // Cypress clears state after each test
});

after(() => {
  cy.log(`Deleting test user ${testuser.email}`);
  cy.deleteTestUser();
});

Cypress.Commands.add("createTestUser", () => {
  return cognitoIdp.adminCreateUser({
      Username: testuser.username,
      TemporaryPassword: testuser.password,
      UserPoolId: awsconfig.Auth.userPoolId,
      MessageAction: "SUPPRESS",
      UserAttributes: [
        {
          Name: "email",
          Value: testuser.email
        }
      ]
    }
  ).catch((err) => {
    if (err.name !== "UsernameExistsException") {
      throw err;
    }
  });
});

Cypress.Commands.add("deleteTestUser", () => {
  cognitoIdp.adminDeleteUser({
    Username: testuser.username,
    UserPoolId: awsconfig.Auth.userPoolId
  }).catch(() => {
  });
});

Cypress.Commands.add("signIn", () => {
  function signInTestUser() {
    return Auth.signIn(testuser.username, testuser.password);
  }

  function respondToAuthChallenge(session) {
    return cognitoIdp.respondToAuthChallenge({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ClientId: awsconfig.Auth.userPoolWebClientId,
      Session: session,
      ChallengeResponses: {
        USERNAME: testuser.username,
        NEW_PASSWORD: testuser.password
      }
    });
  }

  cy.wrap(
    signInTestUser()
      .then((authResponse) => {
        if (authResponse.challengeName === "NEW_PASSWORD_REQUIRED") {
          return respondToAuthChallenge(authResponse.Session).then(signInTestUser);
        }
      })
      .then(() => Auth.currentSession())
      .then((user) => user.getIdToken().getJwtToken()))
    .as("idToken");
});

Cypress.Commands.add("fetchBaseUrl", function() {
  cy.request(`${this.apiUrl}/info`)
    .then(({ body: { base_url } }) => {
      cy.wrap(base_url).as("baseUrl");
    });
});

Cypress.Commands.add("createLinkCustom", function(url, backhalf) {
  cy.request({
    url: `${this.apiUrl}/links`,
    method: "POST",
    body: { origin: url, backhalf },
    auth: {
      bearer: this.idToken
    }
  });
});

Cypress.Commands.add("deleteAllLinks", function() {
  cy.request({
    url: `${this.apiUrl}/admin/links`,
    method: "DELETE",
    auth: {
      bearer: this.idToken
    }
  });
});

Cypress.Commands.add("getByTestId", (...dataTestIds) => {
  const sel = dataTestIds.map((id) => `[${dataTestAttr}="${id}"]`).join(",");
  return cy.get(sel);
});
