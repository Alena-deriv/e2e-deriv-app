describe('QATEST-54262 - Verify deposit functionality from account switcher', () => {
  const sizes = ['mobile', 'desktop']

  beforeEach(() => {
    cy.c_createCRAccount()
    cy.c_login()
  })

  sizes.forEach((size) => {
    it(`Should validate the deposit button from account switcher on ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_visitResponsive('/appstore/traders-hub', { size: size })
      cy.c_checkTradersHubHomePage(isMobile)
      cy.c_switchToReal()
      cy.c_closeNotificationHeader()
      cy.findByRole('button', { name: 'Deposit' }).click()
      cy.url().should('include', '/cashier/deposit')
      cy.findByText('Deposit via bank wire, credit card, and e-wallet').should(
        'be.visible'
      )
    })
  })
})
