const locators = require('../PageElements/mt5TransferLocators.json')
class mt5_tradershub {
  get tradershubDropDown() {
    return cy.get(locators.mt5Locators.tradershubDropDown)
  }

  get selectReal() {
    return cy.get(locators.mt5Locators.real)
  }
  selectRealAccount = () => {
    this.tradershubDropDown.click()
    this.selectReal.click()
  }
  checkMT5AccountisPresent = () => {
    cy.findByTestId('dt_traders_hub')
      .findByText('Deriv MT5')
      .should('be.visible')
    cy.get(`[data-testid='dt_platform-name']`, { timeout: 2000 })
    cy.findByTestId('dt_trading-app-card_real_standard')
      .should(() => {})
      .findByRole('button', {
        name: 'Get',
      })
      .should(() => {})
      .then(($el) => {
        if ($el.length) {
          this.createMT5Account()
          cy.log('Added MT5 Account')
        } else cy.log('MT5 account already exists')
      })
  }
  createMT5Account = () => {
    cy.findByTestId('dt_trading-app-card_real_standard')
      .findByRole('button', { name: 'Get' })
      .click()
    cy.findByText('St. Vincent & Grenadines').click()
    cy.findByRole('button', { name: 'Next' }).click()
    cy.findByText('Create a Deriv MT5 password').should('be.visible')
    cy.findByTestId('dt_mt5_password')
      .click()
      .type(Cypress.env('mt5Password'), {
        log: false,
      })
    cy.findByRole('button', { name: 'Create Deriv MT5 password' }).click()
    cy.findByRole('button', { name: 'Maybe later' })
      .should('be.visible')
      .click()
  }
}

export default new mt5_tradershub()
