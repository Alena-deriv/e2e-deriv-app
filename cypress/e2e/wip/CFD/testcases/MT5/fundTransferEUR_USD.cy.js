import fundTransferPageObjects from '../../Pages/fundTransferPageObjects'
import mt5_tradershub from '../../Pages/mt5PageObjects.js'
const locators = require('../../PageElements/mt5TransferLocators.json')

describe('QATEST-37204 - MT5 Deposit & withdrawal for different fiat currencies (EUR-USD)', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.c_login({ user: 'cfdfundTransferEUR', size: 'desktop' })
    mt5_tradershub.checkMT5AccountisPresent()
  })

  it('MT5 account deposit, EUR to Derived SVG', () => {
    fundTransferPageObjects.mt5_fiat_deposit(
      locators.fiatAccountEUR,
      locators.derivedSVG_Mt5Account
    )
  })

  it('MT5 account withdrawal, Derived SVG to EUR', () => {
    fundTransferPageObjects.mt5_fiat_withdrawal(
      locators.fiatAccountEUR,
      locators.derivedSVG_Mt5Account
    )
  })
})
