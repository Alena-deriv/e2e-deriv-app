describe('QATEST-5699: Create a Financial Demo CFD account', () => {
  const size = ['small', 'desktop']
  let countryCode = 'co'

  beforeEach(() => {
    cy.c_createCRAccount({ country_code: countryCode })
    cy.c_login()
  })
  size.forEach((size) => {
    it(`Verify I can signup for a demo financial CFD account on ${size == 'small' ? 'mobile' : 'desktop'}`, () => {
      const isMobile = size == 'small' ? true : false
      cy.c_visitResponsive('appstore/traders-hub', size)
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
      cy.c_checkTradersHubHomePage(isMobile)
      cy.c_switchToDemo()
      if (isMobile) cy.findByRole('button', { name: 'CFDs' }).click()
      cy.c_createMT5DemoAccount('Financial')
    })
  })
})
