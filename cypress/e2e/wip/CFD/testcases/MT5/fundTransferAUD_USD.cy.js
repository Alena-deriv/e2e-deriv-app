import fundTransferPageObjects from '../../Pages/fundTransferPageObjects'
import mt5_tradershub from '../../Pages/mt5PageObjects'
const locators = require('../../PageElements/mt5TransferLocators.json')

describe('QATEST-37216 - MT5 Deposit & withdrawal for different fiat currencies (AUD-USD)', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.c_visitResponsive('/appstore/traders-hub', 'large')
    cy.c_login({ user: 'cfdfundTransferAUD' })
    mt5_tradershub.checkMT5AccountisPresent()
  })

  it('MT5 account deposit, AUD to Derived SVG', () => {
    fundTransferPageObjects.mt5_fiat_deposit(
      locators.fiatAccountAUD,
      locators.derivedSVG_Mt5Account
    )
  })

  it('MT5 account withdrawal, Derived SVG to AUD', () => {
    fundTransferPageObjects.mt5_fiat_withdrawal(
      locators.fiatAccountAUD,
      locators.derivedSVG_Mt5Account
    )
  })
})
