function changeMT5Password(size) {
  cy.findByText('Standard', { timeout: 10000 })
    .should('be.visible')
    .then(() => {
      cy.findByText('CFDs on derived and financial instruments')
        .should(() => {})
        .then((el) => {
          if (el.length) {
            cy.log('no MT5 account exist, creating MT5 account')
            cy.c_CreateMT5Account('Standard', 'St. Vincent & Grenadines')
          }
          cy.log('changing MT5 password')
          cy.findAllByText('Standard')
            .parents('.wallets-added-mt5__details')
            .click()
          cy.findByText('DerivSVG-Server').should('be.visible')
          cy.findByText('Password')
            .parent()
            .within(() => {
              cy.get('.deriv-tooltip__trigger').click()
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
          cy.findByRole('button', { name: 'Investor Password' }).should('exist')
          cy.c_emailVerification(
            'New%20DMT5%20password%20request.html',
            'QA script',
            {
              baseUrl: Cypress.env('configServer') + '/emails',
              isMT5ResetPassword: true,
            }
          )
          cy.then(() => {
            cy.c_visitResponsive(Cypress.env('verificationUrl'), { size: size })
          })
          cy.c_waitUntilElementIsFound({
            cyLocator: () => cy.findByText('Create a new Deriv MT5 password'),
            timeout: 4000,
            maxRetries: 5,
          })
          cy.findByText('Create a new Deriv MT5 password', {
            timeout: 4000,
          }).should('be.visible')
          cy.findByPlaceholderText('Deriv MT5 password')
            .click()
            .type('Abcd1234')
          cy.findByText(
            /Please include at least 1 special character such/
          ).should('be.visible')
          cy.findByPlaceholderText('Deriv MT5 password').clear()
          cy.findByPlaceholderText('Deriv MT5 password')
            .click()
            .type(Cypress.env('credentials').test.mt5User.PSWD)
          cy.findByRole('button', { name: 'Create' }).click()
          cy.findByText('Success', { timeout: 2000 }).should('be.visible')
          cy.findByText(
            /You have a new Deriv MT5 password to log in to your Deriv/
          ).should('be.visible')
          cy.findByRole('button', { name: 'Done' }).click()
        })
    })
}
const size = ['mobile', 'desktop']
size.forEach((size) => {
  describe(`QATEST-99774 - MT5 reset password on ${size}`, () => {
    beforeEach(() => {
      cy.c_login({ user: 'walletloginEmail', app: 'wallets' })
    })
    it('should be able to change mt5 password', () => {
      cy.log('change mt5 password')
      cy.c_visitResponsive('/', { size: size })
      cy.findByText('CFDs', { exact: true }).should('be.visible')
      changeMT5Password(size)
    })
  })
})
