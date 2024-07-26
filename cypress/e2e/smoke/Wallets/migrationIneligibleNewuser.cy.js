describe('QATEST-154041 -  Client with USD for less than 3 months', () => {
  beforeEach(() => {
    cy.c_login({ user: 'walletMigrationNewClient' })
  })
  it('New user should not see  Wallets - Enable now banner', () => {
    cy.c_visitResponsive('/', { size: 'desktop' })
    cy.c_checkForBanner()
    cy.findByText('US Dollar').should('be.visible')
  })
  it('New user should not see  Wallets - Enable now banner on mobile', () => {
    cy.c_visitResponsive('/', { size: 'mobile' })
    cy.c_checkForBanner()
    cy.findByText('US Dollar').should('be.visible')
  })
})
