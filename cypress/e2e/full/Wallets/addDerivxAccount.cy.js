function clickAddDerivxButton() {
  cy.get('.wallets-available-dxtrade__icon')
    .parent('.wallets-trading-account-card')
    .click()
}

function verifyDerivxCreation(accountType) {
  let expectedText
  if (accountType === 'Real') {
    expectedText = 'Create a Deriv X password'
    cy.get('div').contains(expectedText).should('be.visible')
    cy.findByPlaceholderText('Deriv X password')
      .click()
      .type(Cypress.env('credentials').test.mt5User.PSWD)
    cy.findByRole('button', { name: 'Create Deriv X password' }).click()
  } else {
    expectedText = 'Enter your Deriv X password' // Adjust this text based on your actual requirement
    cy.get('div').contains(expectedText).should('be.visible')
    cy.findByPlaceholderText('Deriv X password')
      .click()
      .type(Cypress.env('credentials').test.mt5User.PSWD)
    cy.findByRole('button', { name: 'Add account' }).click()
  }
}

function verifyTransferFundsMessage(accountType) {
  if (accountType === 'Real') {
    cy.findByText('Your Deriv X account is ready').should('be.visible')
    cy.findByRole('button', { name: 'Maybe later' }).should('exist')
    cy.findByRole('button', { name: 'Transfer funds' }).should('exist')
    cy.findByRole('button', { name: 'Maybe later' }).click()
  } else {
    cy.findByText('Your Deriv X demo account is ready').should('be.visible')
    cy.findByRole('button', { name: 'OK' }).click()
  }
}

function expandDemoWallet() {
  cy.get('label').find('span').click()
  cy.findByText('USD Demo Wallet').should('be.visible')
}
function existingAccountCheck(walletBanner) {
  cy.get(walletBanner).contains('.wallets-text', ' USD').should('be.visible') //To check page load
  cy.findByText('CFDs', { exact: true }).should('be.visible').click()
  return cy
    .get('.wallets-added-dxtrade__details, .wallets-available-dxtrade__details')
    .then(($details) => {
      if ($details.hasClass('wallets-added-dxtrade__details')) {
        return 'added'
      } else if ($details.hasClass('wallets-available-dxtrade__details')) {
        return 'available'
      } else {
        return 'none'
      }
    })
}
function addDerivXaccount(status, accountType) {
  if (status === 'available') {
    cy.log(accountType + ' DerivX account ready to add')
    clickAddDerivxButton()
    verifyDerivxCreation(accountType)
    verifyTransferFundsMessage(accountType)
  } else if (status === 'added') {
    cy.log(accountType + ' DerivX account added already')
    cy.get('.wallets-added-dxtrade__details')
      .should('exist')
      .within(() => {
        cy.contains('.wallets-text', 'Deriv X').should('exist')
      })
  } else {
    cy.fail('DerivX account already exist')
  }
}

describe('QATEST-98821 - Add demo derivx account and QATEST-98824 add real derivx account', () => {
  it('should be able to add DerivX USD account', () => {
    cy.c_login({ user: 'walletloginEmail' })
    cy.c_visitResponsive('/', 'large')
    existingAccountCheck('.wallets-balance__container').then((status) => {
      addDerivXaccount(status, 'Real')
    })
    expandDemoWallet()
    existingAccountCheck('.wallets-balance__container').then((status) => {
      addDerivXaccount(status, 'Demo')
    })
  })
  it('should be able to add DerivX USD account in responsive', () => {
    cy.log('add derivx account')
    cy.c_login({ user: 'walletloginEmailMobile' })
    cy.c_visitResponsive('/', 'small')
    cy.c_skipPasskeysV2()
    existingAccountCheck('.wallets-card__details-bottom').then((status) => {
      addDerivXaccount(status, 'Real')
    })
    cy.get('.wallets-carousel-content__title').scrollIntoView()
    cy.c_switchWalletsAccountDemo()
    existingAccountCheck('.wallets-card__details-bottom').then((status) => {
      addDerivXaccount(status, 'Demo')
    })
  })
})