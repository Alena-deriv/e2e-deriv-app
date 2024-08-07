function checkWalletBanner(deviceType) {
  cy.findByRole('heading', { name: 'Why Wallets' }).should('be.visible')
  cy.findByText('Deposit, transfer, trade').should('be.visible')
  cy.findByText('Better funds segregation')
  if (deviceType == 'mobile') {
    cy.findByTestId('dt_swipeable')
      .trigger('touchstart', { force: true, position: 'right' })
      .trigger('touchmove', { force: true, position: 'left' })
      .trigger('touchend', { force: true })
  } else {
    cy.findByRole('button', { name: 'Next' }).click()
  }

  cy.findByText('Ready to enable Wallets', { timeout: 30000 })
  cy.contains('Wallets will become your')
  if (deviceType == 'mobile') {
    cy.findByTestId('dt_swipeable')
      .trigger('touchstart', { force: true, position: 'right' })
      .trigger('touchmove', { force: true, position: 'left' })
      .trigger('touchend', { force: true })
    cy.get('.dc-progress-bar-tracker-circle ').click()
  } else {
    cy.findByRole('button', { name: 'Back' })
    cy.findByRole('button', { name: 'Back' }).click()
  }

  cy.findByRole('heading', { name: 'Why Wallets' }).should('be.visible')
  cy.findByText('Deposit, transfer, trade').should('be.visible')
  cy.findByText('Better funds segregation')
  if (deviceType == 'mobile') {
    cy.get('.dc-swipeable__view')
      .trigger('touchstart', 'right', { force: true, timeout: 1000 })
      .trigger('touchmove', 'left', { force: true })
      .trigger('touchend', { force: true })
    cy.findByRole('button', { name: 'Enable' }).should('exist')
    cy.findAllByTestId('dt_dc_mobile_dialog_close_btn').click()
  } else {
    cy.findByRole('button', { name: 'Next' }).click()
    cy.findByRole('button', { name: 'Enable' }).should('exist')
    cy.get('#modal_root').findAllByRole('button').first().click()
  }
}
function checkAccountNotMigrated() {
  cy.findByText(`Trader's Hub`, { timeout: 30000 }).should('be.visible')
  for (let i = 1; i < 4; i++) {
    cy.get('input[value="USD Wallet"]')
      .should(() => {})
      .then(($text) => {
        if ($text.length) {
          cy.log('Account is migrated!')
          cy.c_walletLogout()
          cy.c_visitResponsive('/', { size: 'desktop' })
          cy.c_login({ user: `eligibleMigration${i}` })
        } else {
          cy.log('account is not migrated!')
          return
        }
      })
  }
}
describe('QATEST-154253 - Migration country eligibility', () => {
  beforeEach(() => {
    cy.c_login({ user: 'eligibleMigration1' })
  })

  it('should be able to see the tour for Fiat Wallets', () => {
    cy.c_visitResponsive('/', { size: 'desktop' })
    checkAccountNotMigrated()
    cy.contains('Enjoy seamless transactions').should('be.visible')
    cy.get('#modal_root').findByRole('button', { name: 'Enable now' }).click()
    checkWalletBanner('desktop')
    cy.contains('— A smarter way to manage').should('be.visible')
    cy.findByRole('button', { name: 'Enable now' }).click()
    checkWalletBanner('desktop')
  })

  it('should be able to see the tour for Fiat Wallets on mobile', () => {
    cy.c_visitResponsive('/', { size: 'mobile' })
    checkAccountNotMigrated()
    cy.contains('Enjoy seamless transactions').should('be.visible')
    cy.get('#modal_root').findByRole('button', { name: 'Enable now' }).click()
    checkWalletBanner('mobile')
    cy.contains('— A smarter way to manage').should('be.visible')
    cy.findByRole('button', { name: 'Enable now' }).click()
    checkWalletBanner('mobile')
  })
})
