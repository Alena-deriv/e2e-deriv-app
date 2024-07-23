import fundTransferPageObjects from '../../Pages/fundTransferPageObjects'
import mt5_tradershub from '../../Pages/mt5PageObjects'
const locators = require('../../PageElements/mt5TransferLocators.json')

describe('QATEST-37180 - MT5 Deposit & withdrawal for same fiat currency (USD-USD)', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.c_visitResponsive('/appstore/traders-hub', 'large')
    //cy.c_login()
    cy.c_login({ user: 'cfdfundTransferUSD' })
    mt5_tradershub.checkMT5AccountisPresent()
  })

  it('MT5 account deposit, USD to Derived SVG', () => {
    fundTransferPageObjects.mt5_fiat_deposit(
      locators.fiatAccountUSD,
      locators.derivedSVG_Mt5Account
    )
  })

  it('MT5 account withdrawal, Derived SVG to USD', () => {
    fundTransferPageObjects.mt5_fiat_withdrawal(
      locators.fiatAccountUSD,
      locators.derivedSVG_Mt5Account
    )
  })
})
