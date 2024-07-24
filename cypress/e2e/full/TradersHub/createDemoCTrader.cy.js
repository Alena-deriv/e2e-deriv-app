describe('QATEST-5708 - Create a new Demo cTrader account', () => {
  const sizes = ['mobile', 'desktop']

  beforeEach(() => {
    cy.c_createCRAccount()
    cy.c_login()
  })

  sizes.forEach((size) => {
    it(`Should create a new demo cTrader account on ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_visitResponsive('appstore/traders-hub', { size: size })
      cy.c_checkTradersHubHomePage(isMobile)
      cy.c_closeNotificationHeader()
      cy.c_switchToDemo()
      if (isMobile) cy.findByRole('button', { name: 'CFDs' }).click()
      cy.findByTestId('dt_trading-app-card_demo_deriv-ctrader')
        .findByRole('button', { name: 'Get' })
        .click()
      cy.findByRole('heading', { name: 'Success!' }).should('be.visible')
      cy.get('.dc-modal-body').should(
        'contain.text',
        'Congratulations, you have successfully created your demo Deriv cTrader  account.'
      )
      cy.findByRole('button', { name: 'Continue' }).click()
      cy.findByText('10,000.00 USD').should('be.visible')
      cy.findByRole('button', { name: 'Top up' }).should('exist')
    })
  })
})
