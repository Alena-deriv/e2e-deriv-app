import { derivApp } from '../../../support/locators'

const fiatAccount = {
  type: 'Fiat currencies',
  name: 'US Dollar',
  code: 'USD',
}
const cryptoAccount = {
  type: 'Cryptocurrencies',
  name: 'Bitcoin',
  code: 'BTC',
}

const sizes = ['mobile', 'desktop']

sizes.forEach((size) => {
  describe(`QATEST-165256 - PA: Crypto Deposit screen should load fine for Payment Agent in screen size: ${size}`, () => {
    beforeEach(() => {
      cy.clearAllSessionStorage()
      cy.c_login({ user: 'cashierLegacyPA', size: size })
      if (size == 'mobile') {
        cy.findByRole('button', { name: 'Options' }).should('be.visible')
      } else {
        cy.findByText('Options').should('be.visible')
      }
      cy.c_loadingCheck()
      cy.c_closeNotificationHeader()
    })
    it(`should verify deposit screen for crypto is loaded properly.`, () => {
      cy.c_verifyActiveCurrencyAccount(fiatAccount, { closeModalAtEnd: false })
      cy.c_checkCurrencyAccountExists(cryptoAccount, {
        modalAlreadyOpened: true,
        closeModalAtEnd: false,
      })
      cy.then(() => {
        if (
          sessionStorage.getItem(`c_is${cryptoAccount.code}AccountCreated`) ==
          'false'
        ) {
          cy.c_createNewCurrencyAccount(cryptoAccount, { size: size })
        } else if (
          sessionStorage.getItem(`c_is${cryptoAccount.code}AccountCreated`) ==
          'true'
        ) {
          cy.c_closeModal()
        }
      })
      cy.c_selectCurrency(cryptoAccount, {
        modalAlreadyOpened: false,
        closeModalAtEnd: true,
      })
      cy.c_checkTotalAssetSummary()
      cy.c_verifyActiveCurrencyAccount(cryptoAccount)
      if (size == 'mobile') {
        derivApp.commonPage.mobileLocators.header.hamburgerMenuButton().click()
        derivApp.commonPage.mobileLocators.sideMenu.sidePanel().within(() => {
          derivApp.commonPage.mobileLocators.sideMenu.cashierButton().click()
          derivApp.commonPage.mobileLocators.sideMenu.depositButton().click()
        })
      } else {
        derivApp.commonPage.desktopLocators.header.cashierButton().click()
      }
      cy.c_loadingCheck()
      cy.findByText('Deposit via payment agents').should('be.visible')
      cy.findByText('Deposit cryptocurrencies')
        .should('be.visible')
        .next('[data-testid="dt_cashier_onboarding_card"]')
        .click()
      cy.findByText('Choose a cryptocurrency account').should('be.visible')
      cy.findByText(
        'Choose one of your accounts or add a new cryptocurrency account'
      ).should('be.visible')
      cy.findByRole('button', { name: 'Continue' }).should('be.disabled')
      cy.findByText(cryptoAccount.name).should('be.visible').click()
      cy.findByRole('button', { name: 'Continue' }).should('be.enabled').click()
      cy.c_loadingCheck()
      cy.findByText('Sorry for the interruption').should('not.exist')
      cy.findByText('Deposit cryptocurrencies').should('be.visible')
      cy.findByText(
        `Send only ${cryptoAccount.name} (${cryptoAccount.code}) to this address.`
      ).should('be.visible')
      cy.get('.deposit-crypto-disclaimers').should('be.visible')
      cy.findByText('Note:').should('be.visible')
      cy.findByText('Transaction status').should('be.visible')
    })
  })
})
