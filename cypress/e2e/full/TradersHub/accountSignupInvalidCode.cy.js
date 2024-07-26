import { generateEpoch } from '../../../support/helper/utility'

describe('QATEST-5547: Verify signup with invalid verification code', () => {
  const sizes = ['mobile', 'desktop']
  let country = Cypress.env('countries').CO

  sizes.forEach((size) => {
    it(`Verify user cant proceed to signup with invalid verification code on ${size}`, () => {
      const signUpEmail = `sanity${generateEpoch()}invl@deriv.com`
      cy.c_setEndpoint(`${Cypress.env('derivComProdURL')}`, {
        size: size,
      })
      cy.c_setEndpoint(`/endpoint`, { size: size })
      cy.c_enterValidEmail(signUpEmail, { size: size })
      cy.c_emailVerification('account_opening_new.html', signUpEmail)
      cy.then(() => {
        cy.c_visitResponsive(
          `${Cypress.env('derivComProdURL')}signup-success/?email=${signUpEmail}`,
          { size: size }
        )
        cy.findByText(new RegExp(signUpEmail)).should('be.visible')
        cy.findByRole('link', {
          name: `Didn’t receive the email?`,
        }).click()
        cy.findByText(
          `If you don't see an email from us within a few minutes, a few things could have happened:`
        ).should('be.visible')
        cy.findByRole('button', {
          name: 'Try again',
        }).click()
        cy.c_enterValidEmail(signUpEmail, { size: size })
        cy.c_visitResponsive(Cypress.env('verificationUrl'), {
          size: size,
        }).then(() => {
          cy.window().then((win) => {
            win.localStorage.setItem(
              'config.server_url',
              Cypress.env('stdConfigServer')
            )
            win.localStorage.setItem(
              'config.app_id',
              Cypress.env('stdConfigAppId')
            )
          })
        })
        cy.get('h1').contains('Select your country and').should('be.visible')
        cy.c_selectCountryOfResidence(country)
        cy.c_selectCitizenship(country)
        cy.c_enterPassword()
        cy.findByText('Your token has expired or is invalid.').should(
          'be.visible'
        )
        cy.findByRole('button', {
          name: 'Cancel',
        }).should('be.enabled')
        cy.findByRole('button', {
          name: 'Create new account',
        }).should('be.enabled')
        cy.c_visitResponsive('/', { size: size })
        cy.c_uiLogin({
          username: signUpEmail,
          password: Cypress.env('credentials').test.masterUser.PSWD,
          size: size,
        })
        cy.findByText(
          `Your email and/or password is incorrect. Perhaps you signed up with a social account?`
        ).should('be.visible')
      })
    })
  })
})
