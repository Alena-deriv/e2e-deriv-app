const size = ['small', 'desktop']

describe("QATEST-5930 - Validate the hyperlinks on Trader's hub", () => {
  beforeEach(() => {
    cy.c_createCRAccount()
    cy.c_login()
  })
  size.forEach((size) => {
    it(`Should navigate to all links in traders hub home page and validate its redirection in ${size == 'small' ? 'mobile' : 'desktop'}`, () => {
      const isMobile = size == 'small' ? true : false
      cy.c_visitResponsive('/appstore/traders-hub', size)
      //Wait for page to load
      cy.findByTestId('dt_trading-app-card_real_deriv-trader')
        .findByText('Deriv Trader')
        .should('be.visible')
      cy.c_closeNotificationHeader()
      cy.findAllByRole('link', { name: 'Learn more' })
        .first()
        .c_clickToOpenInSamePage()
      cy.findByRole('heading', {
        name: 'Trade over 50 assets with Options',
      }).should('be.visible')
      cy.url().should('contain', '/trade/options')
      cy.go('back')
      if (isMobile) {
        cy.findByRole('button', { name: 'CFDs' }).click()
      }
      cy.findAllByRole('link', { name: 'Learn more' })
        .last()
        .c_clickToOpenInSamePage()
      cy.findByRole('heading', {
        name: 'Trade global markets with CFDs',
      }).should('be.visible')
      cy.url().should('contain', '/trade/cfds')
      cy.go('back')
      if (isMobile) {
        cy.findByRole('button', { name: 'CFDs' }).click()
      }
      cy.findByText('Compare accounts').click()
      cy.findByText('Compare CFDs accounts').should('be.visible')
      cy.url().should('contain', '/cfd-compare-acccounts')
    })
  })
})
