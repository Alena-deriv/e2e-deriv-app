describe('QATEST-154138 -  Client without currency added', () => {
  beforeEach(() => {
    cy.c_login({ user: 'walletMigrationNoCurrency', app: 'wallets' })
  })
  it('Client without currency added should not see  Wallets - Enable now banner', () => {
    cy.c_visitResponsive('/', { size: 'desktop' })
    cy.c_checkForBanner()
    cy.findByText('No currency assigned').should('be.visible')
  })
  it('Client without currency added should not see  Wallets - Enable now banner on mobile', () => {
    cy.c_visitResponsive('/', { size: 'mobile' })
    cy.c_checkForBanner()
    cy.findByText('No currency assigned').should('be.visible')
  })
})
