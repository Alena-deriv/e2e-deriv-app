describe('QATEST-5925: Verify Change currency functionality for the account which has balance', () => {
  const sizes = ['mobile', 'desktop']

  beforeEach(() => {
    cy.c_login()
  })

  sizes.forEach((size) => {
    it(`Should not be able to change currency on ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_visitResponsive('/appstore/traders-hub', {
        size: size,
      })
      cy.c_checkTradersHubHomePage(isMobile)
      cy.c_closeNotificationHeader()
      cy.findByTestId('dt_currency-switcher__arrow').click()
      cy.findByRole('button', { name: 'Add or manage account' }).click()
      cy.findByText('Fiat currencies').click()
      cy.findByRole('heading', { name: 'Change your currency' }).should(
        'be.visible'
      )
      cy.findByRole('heading', {
        name: 'Choose the currency you would like to trade with.',
      }).should('be.visible')
      cy.findByRole('button', { name: 'Change currency' }).should('be.disabled')
      cy.get('.change-currency.account-wizard--disabled').should('exist')
    })
  })
})
