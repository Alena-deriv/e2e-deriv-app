import { derivApp } from '../../../../support/locators'
describe('QATEST-173757: Verify user should be able to reset password when logged-out', () => {
  let userEmail
  let pswdResetUrl
  const oldPassword = Cypress.env('credentials').test.masterUser.PSWD
  const newPassword = Cypress.env('credentials').production.masterUser.PSWD
  const size = ['small', 'desktop']
  const tradersHubSharedLocators = derivApp.tradersHubPage.sharedLocators

  beforeEach(() => {
    cy.c_createCRAccount().then(() => {
      userEmail = Cypress.env('credentials').test.masterUser.ID
    })
  })
  size.forEach((size) => {
    it(`Should be able to reset password when user is logged out on ${size === 'small' ? 'mobile' : 'desktop'}`, () => {
      cy.visit('/endpoint', {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'config.server_url',
            Cypress.env('stdConfigServer')
          )
          win.localStorage.setItem(
            'config.app_id',
            Cypress.env('stdConfigAppId')
          )
        },
      })
      cy.visit(Cypress.env('derivComProdURL'), {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            'config.server_url',
            Cypress.env('stdConfigServer')
          )
          win.localStorage.setItem(
            'config.app_id',
            Cypress.env('stdConfigAppId')
          )
        },
      })
      cy.c_visitResponsive(
        `${Cypress.env('derivComProdURL')}reset-password`,
        size
      )
      cy.get('input#email-reset-password').clear().type(userEmail)
      cy.findByRole('button', { name: 'Reset my password' }).click()
      cy.findByText(
        'Please check your email and click on the link provided to reset your password.'
      ).should('be.visible')
      cy.c_emailVerification('reset_password_request.html', userEmail).then(
        () => {
          pswdResetUrl = Cypress.env('verificationUrl')
        }
      )
      cy.then(() => {
        cy.c_visitResponsive(pswdResetUrl, size)
      })
      tradersHubSharedLocators
        .resetPasswordModal()
        .findByRole('heading', { name: 'Reset your password' })
        .should('be.visible')
      tradersHubSharedLocators
        .resetPasswordModal()
        .findByRole('heading', { name: 'Reset your password' })
        .should('be.visible')
      tradersHubSharedLocators
        .resetPasswordModal()
        .findByText(
          `Strong passwords contain at least 8 characters. combine uppercase and lowercase letters, numbers, and symbols.`
        )
        .should('be.visible')
      tradersHubSharedLocators.resetPasswordButton().should('be.visible')
      tradersHubSharedLocators.resetPasswordInputField().should('be.visible')
      tradersHubSharedLocators
        .resetPasswordInputField()
        .clear()
        .type(newPassword, { log: false })
      tradersHubSharedLocators.resetPasswordButton().click()
      cy.findByRole('button', { name: 'Log in' }).click()
      cy.c_validateLogin(userEmail, newPassword, oldPassword)
      cy.findAllByText(`Trader's Hub`).should('be.visible')
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
    })
  })
})
