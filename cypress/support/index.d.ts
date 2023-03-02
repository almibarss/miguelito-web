/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {

    createTestUser(): Chainable<any>;

    deleteTestUser(): Chainable<any>;

    signUp(): Chainable<any>;

    signIn(): Chainable<any>;

    fetchBaseUrl(): Chainable<any>;

    createLinkCustom(url: string, path: string): Chainable<any>;

    deleteAllLinks(): Chainable<any>;

    getByTestId(...dataTestId: string[]): Chainable<any>;
  }
}