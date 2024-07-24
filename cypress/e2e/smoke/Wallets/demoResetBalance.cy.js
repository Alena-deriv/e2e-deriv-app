function reset_balance_demo(platform) {
  if (`${platform}` == `mobile`) {
    cy.c_switchWalletsAccountDemo()
    cy.contains('Reset balance', { timeout: 10000 }).should('be.visible')
    cy.findByText('Reset balance').parent().click()
  } else {
    cy.c_switchWalletsAccount('USD Demo')
    cy.findByText('Reset balance').should('be.visible').click()
  }
  cy.get('[class="wallets-cashier-content"]')
    .findByRole('button', { name: 'Reset balance' })
    .click()
  cy.findByText('Success').should('exist')
  cy.findByRole('button', { name: 'Transfer funds' }).click()
  //To check if Transfer tab is active on clicking Transfer funds
  cy.get('.wallets-cashier-header__tab--active').should(
    'contain.text',
    'Transfer'
  )
}

describe('QATEST-98815 - Demo reset balance', () => {
  //Prerequisites: Demo wallet account in any qa box with USD demo funds
  beforeEach(() => {
    cy.c_login({ user: 'walletloginEmail', app: 'wallets' })
  })

  it('should be able to reset balance for demo wallet', () => {
    cy.log('Reset Balance for Demo Account')
    cy.c_visitResponsive('/', { size: 'desktop' })
    cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
    reset_balance_demo('desktop')
  })
  it('should be able to reset balance for demo wallet on mobile', () => {
    cy.log('Reset Balance for Demo Account')
    cy.c_visitResponsive('/', { size: 'mobile' })
    cy.c_WaitUntilWalletsPageIsLoaded()
    reset_balance_demo('mobile')
  })
})
