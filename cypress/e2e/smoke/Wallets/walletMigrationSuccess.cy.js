function migratetoWallet(size) {
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
  cy.c_login({ relogin: true, app: 'wallets' })
  cy.c_visitResponsive('/', { size: size })
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
function checkCyrptoWalletExistance(size) {
  const currency_code = ['BTC', 'ETH', 'eUSDT', 'LTC', 'tUSDT', 'USDC']
  // loop to make sure it check for all available currency
  currency_code.forEach((currency_code) => {
    if (`${size}` == `mobile`) {
      cy.c_switchWalletsAccountResponsive(currency_code)
      cy.findByText('Withdraw').should('exist')
      cy.get('.wallets-card__details-bottom').should('contain.text', '0.00')
    } else {
      cy.c_switchWalletsAccount(currency_code)
      cy.findByText('Withdraw').should('exist')
      cy.get('.wallets-balance__container').should('contain.text', '0.00')
      cy.get('section')
        .contains('OptionsPredict the market,')
        .parent()
        .findByRole('button')
        .should('exist')
    }
    cy.findByText('Withdraw').parent().click()
    cy.contains(`No funds in ${currency_code} Wallet`).should('exist')
    if (`${size}` == `mobile`) {
      cy.findByText('Deposit')
        .should('exist', { timeout: 3000 })
        .parent()
        .click()
      cy.get('canvas').should('be.visible', { timeout: 3000 })
      cy.findByTestId('dt_close_btn').click()
    } else {
      cy.findByTestId('dt_traders_hub_home_button').click()
      cy.findByText('Deposit')
        .should('exist', { timeout: 3000 })
        .parent()
        .click()
      cy.get('canvas').should('be.visible', { timeout: 3000 })
      cy.findByTestId('dt_traders_hub_home_button').click()
    }
  })
  if (`${size}` == `mobile`) {
    cy.get('div.wallets-progress-bar')
      .find('div.wallets-progress-bar-inactive')
      .first()
      .click()
  }
}
function checkFiatWalletExistance(size) {
  cy.get('.traders-hub-header').should('not.contain.text', 'Cashier')
  cy.findByText('Withdraw').parent().click()
  cy.findByText('No funds in USD Wallet').should('be.visible')
  if (`${size}` == `mobile`) {
    cy.findByText('Deposit').should('exist', { timeout: 3000 }).parent().click()
    cy.get('iframe[class=wallets-deposit-fiat__iframe]').should('be.visible')
    cy.findByTestId('dt_close_btn').click()
  } else {
    cy.findByTestId('dt_traders_hub_home_button').click()
    cy.findByText('Deposit').should('exist', { timeout: 3000 }).parent().click()
    cy.get('iframe[class=wallets-deposit-fiat__iframe]').should('be.visible')
    cy.findByTestId('dt_traders_hub_home_button').click()
  }
}
function checkDemoExistance(size) {
  if (`${size}` == `mobile`) {
    cy.c_switchWalletsAccountDemo()
    cy.findByText('Reset balance').should('be.visible')
    cy.wait(2000) // balance is updated with a slight delay in UI
    cy.get('.wallets-card__details-bottom').should(
      'contain.text',
      '10,000.00 USD'
    )
    cy.findByRole('button', { name: 'Options' }).click({ force: true })
    cy.get('.wallets-deriv-apps-section').should(
      'contain.text',
      '10,000.00 USD'
    )
  } else {
    cy.c_switchWalletsAccount('USD Demo')
    cy.findByText('Reset balance').should('be.visible')
    cy.get('.wallets-balance__container').should(
      'contain.text',
      '10,000.00 USD'
    )
    cy.get('.wallets-deriv-apps-section').should(
      'contain.text',
      '10,000.00 USD'
    )
  }
}
const countyCode = ['aq']
const size = ['mobile', 'desktop']
countyCode.forEach((countyCode) => {
  size.forEach((size) => {
    describe(`QATEST-154290 Migration Success With Fiat and Crypto account ${countyCode} in ${size}`, () => {
      beforeEach(() => {
        cy.c_createCRAccount({ country_code: countyCode })
      })
      it(`should be able to migrate Fiat account ${size}`, () => {
        cy.c_login({ size: size })
        cy.c_visitResponsive('/', { size: size })
        migratetoWallet(size)
        checkFiatWalletExistance(size)
        checkDemoExistance(size)
      })
      it('should be able to migrate Fiat with Crypto account', () => {
        cy.c_login()
        cy.c_visitResponsive('/', { size: size })
        cy.get('.dc-modal-header__close').click()
        cy.findByTestId('dt_currency-switcher__arrow').click()
        cy.findByRole('button', { name: 'Add or manage account' }).click()
        getCurrencyList().then((totalCurrencyCount) => {
          if (`${size}` == `mobile`) {
            cy.findByTestId('dt_dc_mobile_dialog_close_btn').click()
          } else {
            cy.findByTestId('dt_modal_close_icon').click()
          }
          for (let acctCount = 0; acctCount < totalCurrencyCount; acctCount++) {
            createSiblingAcct(acctCount)
          }
        })
        cy.findByRole('button', { name: "Let's go" }).click()
        migratetoWallet(size)
        checkCyrptoWalletExistance(size)
        checkDemoExistance(size)
      })
    })
  })
})
