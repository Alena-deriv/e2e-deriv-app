describe('QATEST-5724: CFDs - Create a demo Financial account using existing MT5 account password', () => {
  const sizes = ['mobile', 'desktop']
  let countryCode = 'co'

  beforeEach(() => {
    cy.c_createCRAccount({ country_code: countryCode })
    cy.c_login()
  })
  sizes.forEach((size) => {
    it(`Verify I can add a demo financial account using exisiting MT5 derived account password on ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_visitResponsive('appstore/traders-hub', { size: size })
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
      cy.c_checkTradersHubHomePage(isMobile)
      cy.c_switchToDemo()
      if (isMobile) cy.findByRole('button', { name: 'CFDs' }).click()
      cy.c_createMT5DemoAccount('Standard', {
        validateCreatedAccount: false,
      })
      cy.c_createMT5DemoAccount('Financial', { useExistingPswd: true })
    })
  })
})
