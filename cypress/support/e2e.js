import "./commands";

export const testuser = {
  username: Cypress.env("username"),
  password: Cypress.env("password"),
};

before(() => {
  if (testuser.username === undefined || testuser.password === undefined) {
    throw new Error("no test user data found for running the tests!");
  }
});
