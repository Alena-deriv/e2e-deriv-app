// This test needs fresh account each time
function changeMT5Password() {
  cy.findByText('Derived', { timeout: 10000 })
    .should('be.visible')
    .then(() => {
      cy.findByText('This account offers CFDs on derived instruments.')
        .should(() => {})
        .then((el) => {
          if (el.length) {
            cy.fail('no MT5 account exist')
          } else {
            cy.log('changing MT5 password')
            cy.findAllByText('Derived')
              .parents('.wallets-added-mt5__details')
              .click()
            cy.findByText('DerivSVG-Server').should('be.visible')
            cy.findByText('Password')
              .parent()
              .within(() => {
                cy.get('.wallets-tooltip').click()
              })
            cy.findByText('Manage Deriv MT5 password').should('be.visible')
            cy.findByText(
              'Use this password to log in to your Deriv MT5 accounts on the desktop, web, and mobile apps.'
            ).should('be.visible')
            cy.findByRole('button', { name: 'Change password' }).click()
            cy.contains('Confirm to change your Deriv').should('exist')
            cy.contains('This will change the password to all of your ').should(
              'exist'
            )
            cy.findByRole('button', { name: 'Confirm' }).click()
            cy.findByText('We’ve sent you an email').should('exist')
            cy.findByRole('button', {
              name: "Didn't receive the email?",
            }).should('exist')
            cy.findByRole('button', { name: 'Investor Password' }).should(
              'exist'
            )
            cy.c_emailVerification(
              'New%20DMT5%20password%20request.html',
              'QA script',
              {
                baseUrl: Cypress.env('configServer') + '/emails',
                isMT5ResetPassword: true,
              }
            )
            cy.then(() => {
              cy.c_visitResponsive(Cypress.env('verificationUrl'), {
                size: 'desktop',
              })
            })
            cy.findByText('Create a new Deriv MT5 password', {
              timeout: 3000,
            }).should('be.visible')
            cy.findByPlaceholderText('Deriv MT5 password')
              .click()
              .type(Cypress.env('credentials').test.mt5User.PSWD)
            cy.findByRole('button', { name: 'Create' }).click()
          }
        })
    })
}
describe('QATEST-99774 - MT5 reset password', () => {
  beforeEach(() => {
    cy.c_login({ user: 'walletloginEmail', app: 'wallets' })
  })
  it('should be able to change mt5 password on mobile', () => {
    cy.log('change mt5 password')
    cy.c_visitResponsive('/', { size: 'mobile' })
    cy.c_WaitUntilWalletsPageIsLoaded()
    cy.findByText('CFDs', { exact: true }).should('be.visible')
    changeMT5Password()
  })
})
