/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {

    signIn(): Chainable<any>

    grantClipboardPermission(): Chainable<any>

    fetchBaseUrl(): Chainable<any>

    createLinkCustom(url: string, path: string): Chainable<any>

    removeAllLinksOwnedByUser(): Chainable<any>

    getByTestId(...dataTestId: string[]): Chainable<any>
  }
}