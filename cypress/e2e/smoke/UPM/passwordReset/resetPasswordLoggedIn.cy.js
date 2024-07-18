import { derivApp } from '../../../../support/locators'
describe('QATEST-173426, QATEST-173432: Verify user should be able to reset password when logged-in', () => {
  let userEmail
  let pswdResetUrl
  const oldPassword = Cypress.env('credentials').test.masterUser.PSWD
  const newPassword = Cypress.env('credentials').production.masterUser.PSWD
  const size = ['small', 'desktop']
  const tradersHubSharedLocators = derivApp.tradersHubPage.sharedLocators

  const createMt5Account = (size) => {
    cy.c_visitResponsive('/', size)
    cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
    if (size === 'small') cy.findByRole('button', { name: 'CFDs' }).click()
    cy.findByTestId('dt_trading-app-card_real_standard')
      .findByTestId('dt_platform-name')
      .should('have.text', 'Standard')
    cy.findByTestId('dt_trading-app-card_real_standard')
      .findByRole('button', { name: 'Get' })
      .click()
    cy.findByText('St. Vincent & Grenadines').click()
    cy.findByRole('button', { name: 'Next' }).click()
    cy.findByText('Create a Deriv MT5 password').should('be.visible')
    cy.findByText(
      'You can use this password for all your Deriv MT5 accounts.'
    ).should('be.visible')
    cy.findByRole('button', { name: 'Create Deriv MT5 password' }).should(
      'be.disabled'
    )
    cy.findByTestId('dt_mt5_password').type(
      Cypress.env('credentials').test.mt5User.PSWD,
      {
        log: false,
      }
    )
    cy.findByRole('button', { name: 'Create Deriv MT5 password' }).click()
    cy.get('.dc-modal-body').should(
      'contain.text',
      'Success!Your Deriv MT5 Standard account is ready. Enable trading with your first transfer.'
    )
  }

  const resetPassword = () => {
    cy.c_visitResponsive('/account/passwords', size)
    cy.findAllByRole('button', { name: 'Change password' }).first().click()
    cy.findByText(`We’ve sent you an email`).should('be.visible')
    cy.findByText(
      'Please click on the link in the email to reset your password.'
    ).should('be.visible')
    cy.findByRole('button', { name: `Didn't receive the email?` })
      .should('be.visible')
      .and('be.enabled')
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
  }
  beforeEach(() => {
    cy.c_createCRAccount().then(() => {
      userEmail = Cypress.env('credentials').test.masterUser.ID
    })
    cy.c_login()
  })
  size.forEach((size) => {
    it(`Should be able to reset password when user has only CR account on ${size === 'small' ? 'mobile' : 'desktop'}`, () => {
      resetPassword()
      cy.c_validateLogin(userEmail, newPassword, oldPassword)
      cy.findAllByText(`Trader's Hub`).should('be.visible')
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
    })
  })
  size.forEach((size) => {
    it(`Should be able to reset password when user has CR and MT5 account on ${size === 'small' ? 'mobile' : 'desktop'}`, () => {
      createMt5Account(size)
      resetPassword()
      cy.c_validateLogin(userEmail, newPassword, oldPassword)
      cy.findAllByText(`Trader's Hub`).should('be.visible')
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
    })
  })
})
