/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {

    signIn(): Chainable<any>

    grantClipboardPermission(): Chainable<any>

    createLinkCustom(url: string, path: string): Chainable<any>

    removeLink(path: string): Chainable<any>

    getByTestId(...dataTestId: string[]): Chainable<any>
  }
}