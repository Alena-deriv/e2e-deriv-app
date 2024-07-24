// This test needs fresh account each time
describe('QATEST-142456 - Add Trading account', () => {
  beforeEach(() => {
    cy.c_login({ user: 'walletloginEmail', app: 'wallets' })
  })

  it(
    'should add trading account to wallet account (Crypto)',
    { scrollBehavior: false },
    () => {
      cy.c_visitResponsive('/', { size: 'desktop' })
      cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
      cy.c_setupTradeAccount('BTC')
      cy.c_setupTradeAccount('ETH')
      cy.c_setupTradeAccount('LTC')
    }
  )

  it(
    'should add trading account to wallet account (Crypto) on mobile',
    { scrollBehavior: false },
    () => {
      cy.c_visitResponsive('/', { size: 'mobile' })
      cy.c_WaitUntilWalletsPageIsLoaded()
      cy.c_switchWalletsAccountResponsive('BTC')
      cy.c_setupTradeAccountResponsive('BTC')
      cy.c_switchWalletsAccountResponsive('ETH')
      cy.c_setupTradeAccountResponsive('ETH')
      cy.c_switchWalletsAccountResponsive('LTC')
      cy.c_setupTradeAccountResponsive('LTC')
    }
  )
})
