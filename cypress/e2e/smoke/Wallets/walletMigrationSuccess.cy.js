function migratetoWallet() {
  cy.get('#modal_root div')
    .filter((index, element) => {
      return Cypress.$(element).text().includes('Introducing WalletsUse')
    })
    .eq(2)
    .should('be.visible')
  cy.findByRole('button', { name: 'Enable now' }).click()
  cy.findByText("You're almost there!").should('be.visible')
  cy.findByText(/To complete your Wallet setup/).should('be.visible')
  cy.findByRole('button', { name: 'Log out' }).should('be.visible').click()
  cy.c_login({ relogin: true })
  cy.findByText('Your Wallets are ready!').should('be.visible')
  cy.findAllByText(/Explore the exciting new/).should('be.visible')
  cy.findByRole('button', { name: 'Get started' }).should('be.visible').click()
  cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
}
function createSiblingAcct(acctCount) {
  cy.findByTestId('dt_currency-switcher__arrow').click()
  cy.findByRole('button', { name: 'Add or manage account' }).click()
  cy.get('.currency-list__item').eq(acctCount).click()
  cy.findByRole('button', { name: 'Add account' }).click()
  cy.findByRole('heading', { name: 'Success!' }).should('be.visible')
  cy.findByRole('button', { name: 'Deposit now' }).should('be.enabled')
  cy.findByRole('button', { name: 'Maybe later' }).click()
}
function getCurrencyList() {
  return cy
    .get('div.currency-list__items')
    .find('label')
    .then(($labels) => {
      const totalCurrenciesCount = $labels.length
      return totalCurrenciesCount
    })
}
function checkCyrptoWalletExistance() {
  const currency_code = ['BTC', 'ETH', 'LTC', 'tUSDT', 'eUSDT', 'USDC']
  // loop to make sure it check for all available currency
  currency_code.forEach((currency_code) => {
    cy.c_switchWalletsAccount(currency_code)
    cy.findByText('Withdraw').should('exist')
    cy.get('.wallets-balance__container').should('contain.text', '0.00')
    cy.get('section')
      .contains('OptionsPredict the market,')
      .parent()
      .findByRole('button')
      .should('exist')
    cy.findByText('Withdraw').click()
    cy.contains(`No funds in ${currency_code} Wallet`).should('exist')
    cy.findByTestId('dt_traders_hub_home_button').click()
    cy.findByText('Deposit').should('exist', { timeout: 3000 }).click()
    cy.get('canvas').should('be.visible', { timeout: 3000 })
    cy.findByTestId('dt_traders_hub_home_button').click()
  })
}
function checkFiatWalletExistance() {
  cy.findByText('Withdraw').click()
  cy.findByText('No funds in USD Wallet').should('be.visible')
  cy.findByTestId('dt_traders_hub_home_button').click()
  cy.findByText('Deposit').should('exist', { timeout: 3000 }).click()
  cy.get('iframe[class=wallets-deposit-fiat__iframe]').should('be.visible')
  cy.findByTestId('dt_traders_hub_home_button').click()
}
function checkDemoExistance() {
  cy.c_switchWalletsAccount('USD Demo')
  cy.findByText('Reset balance').should('be.visible')
  cy.c_switchWalletsAccount('USD')
}
const countyCode = ['aq']
countyCode.forEach((countyCode) => {
  describe(`QATEST-154293 Migration Success Without Fiat payment method before migration for ${countyCode} and QATEST-154290 Migration Success With Fiat and Crypto account`, () => {
    beforeEach(() => {
      cy.c_createCRAccount({ country_code: countyCode })
    })

    it('should be able to migrate Fiat account', () => {
      cy.c_login()
      migratetoWallet()
      checkFiatWalletExistance()
      checkDemoExistance()
    })
    it('should be able to migrate Fiat with Crypto account', () => {
      cy.c_login()
      cy.get('.dc-modal-header__close').click()
      cy.findByTestId('dt_currency-switcher__arrow').click()
      cy.findByRole('button', { name: 'Add or manage account' }).click()
      getCurrencyList().then((totalCurrencyCount) => {
        cy.findByTestId('dt_modal_close_icon').click()
        for (let acctCount = 0; acctCount < totalCurrencyCount; acctCount++) {
          createSiblingAcct(acctCount)
        }
      })
      cy.findByRole('button', { name: "Let's go" }).click()
      migratetoWallet()
      checkCyrptoWalletExistance()
      checkDemoExistance()
    })
  })
})
