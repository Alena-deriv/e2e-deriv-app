describe('QATEST-125246 Verify the hyperlinks on Traders Hub', () => {
  const sizes = ['mobile', 'desktop']
  let countryCode = 'co'

  beforeEach(() => {
    cy.c_createCRAccount({ country_code: countryCode })
    cy.c_login()
  })
  sizes.forEach((size) => {
    it(`Should validate the hyperlinks in tradershub for RU ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_visitResponsive('/', { size: size })
      if (isMobile) {
        cy.findAllByTestId('dt_balance_text_container').should(
          'have.length',
          '2'
        )
        cy.c_checkTradersHubHomePage(isMobile)
        cy.c_changeLanguageMobile('RU')
      } else {
        cy.c_changeLanguageDesktop('RU')
      }
      cy.c_checkHyperLinks('RU', isMobile)
    })
  })
})
