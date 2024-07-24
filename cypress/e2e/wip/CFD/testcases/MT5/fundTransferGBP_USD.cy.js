import fundTransferPageObjects from '../../Pages/fundTransferPageObjects'
import mt5_tradershub from '../../Pages/mt5PageObjects'
const locators = require('../../PageElements/mt5TransferLocators.json')

describe('QATEST-37216 - MT5 Deposit & withdrawal for different fiat currencies (GBP-USD)', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.c_login({ user: 'cfdfundTransferGBP', size: 'desktop' })
    mt5_tradershub.checkMT5AccountisPresent()
  })

  it('MT5 account deposit, GBP to Derived SVG', () => {
    fundTransferPageObjects.mt5_fiat_deposit(
      locators.fiatAccountGBP,
      locators.derivedSVG_Mt5Account
    )
  })

  it('MT5 account withdrawal, Derived SVG to GBP', () => {
    fundTransferPageObjects.mt5_fiat_withdrawal(
      locators.fiatAccountGBP,
      locators.derivedSVG_Mt5Account
    )
  })
})
