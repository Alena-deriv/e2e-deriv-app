Cypress.Commands.add('c_switchWalletsAccount', (account) => {
  if (account == 'USD Demo') {
    cy.findByText('USD Demo Wallet')
      .should(() => {})
      .then((el) => {
        if (el.length) {
          cy.log('you are in demo wallet')
        } else {
          cy.get('.wallets-list-header__slider').click()
        }
      })
  } else {
    cy.findByText('USD Demo Wallet')
      .should(() => {})
      .then((el) => {
        if (el.length) {
          cy.log('you are in demo wallet')
          cy.get('.wallets-list-header__slider').click()
        } else {
          cy.log('you are in real wallet')
        }
      })
    cy.get('.wallets-listcard-dropdown__button', { timeout: 10000 }).should(
      'exist'
    )
    cy.get('.wallets-listcard-dropdown__button').click()
    cy.get('.wallets-listcard-dropdown__item')
      .contains(`${account} Wallet`)
      .click()
    cy.c_rateLimit({ waitTimeAfterError: 15000, maxRetries: 5 })
  }
})

Cypress.Commands.add('c_switchWalletsAccountResponsive', (account) => {
  let currentIndex = 0 // Initialize index counter

  const checkForWallet = () => {
    return new Cypress.Promise((resolve) => {
      const elementsWithText = Cypress.$(`:contains("${account}")`)
      const visibleElementsWithText = elementsWithText.filter(
        (index, element) => Cypress.$(element).is(':visible')
      )
      if (visibleElementsWithText.length > 0) {
        cy.log('no scroll')
        resolve(true)
      } else {
        cy.log('scroll')
        resolve(false)
      }
    })
  }

  const clickNext = () => {
    return cy
      .get('div.wallets-progress-bar')
      .find('div.wallets-progress-bar-active')
      .next()
      .click()
  }

  const keepClickingNext = () => {
    clickNext().then(() => {
      checkForWallet().then((isTextVisible) => {
        if (!isTextVisible) {
          keepClickingNext()
        }
      })
    })
  }

  keepClickingNext()
  cy.c_rateLimit({ waitTimeAfterError: 15000, maxRetries: 5 })
})

Cypress.Commands.add('c_switchWalletsAccountDemo', () => {
  /// this is a temp solution for https://deriv-group.slack.com/archives/C0548T15K1P/p1714546473367569
  cy.findByText('Standard', { timeout: 3000 }).should('exist')
  cy.get('div.wallets-progress-bar')
    .find('div.wallets-progress-bar-inactive')
    .last()
    .click({ force: true })
})

Cypress.Commands.add('c_checkForBanner', () => {
  cy.findByTestId('dt_div_100_vh')
    .findByText("Trader's Hub")
    .should('be.visible')
  cy.findByText('Deriv Trader', { timeout: 20000 }).should('be.visible')
  cy.findByText('Enjoy seamless transactions').should('not.exist')
})

Cypress.Commands.add('c_setupTradeAccount', (wallet, requireNew = true) => {
  cy.c_switchWalletsAccount(wallet)
  cy.findByRole('button', { name: 'Get' })
    .should(() => {})
    .then((button) => {
      if (button.length) {
        cy.wrap(button).click()
        cy.wait(1000)
        cy.findByRole('button', { name: 'Transfer funds' }).should('be.visible')
        cy.findByRole('button', { name: 'Maybe later', timeout: 3000 })
          .should('be.visible')
          .and('be.enabled')
          .click()
        cy.findByTestId('dt_themed_scrollbars')
          .findByText("Trader's Hub")
          .should('be.visible')
      } else {
        if (requireNew) {
          cy.fail('Trading account already added')
        } else {
          cy.log('Trading account already added')
        }
      }
    })
})

Cypress.Commands.add('c_setupTradeAccountResponsive', (wallet) => {
  cy.findByRole('button', { name: 'Options' }).click()
  cy.findByRole('button', { name: 'Get' })
    .should(() => {})
    .then((button) => {
      if (button.length) {
        cy.wrap(button).click()
        cy.findByRole('button', { name: 'Transfer funds' }).should('be.visible')
        cy.wait(500)
        cy.findByRole('button', { name: 'Maybe later', timeout: 3000 })
          .should('be.visible')
          .and('be.enabled')
          .click()
        cy.findByText("Trader's Hub").should('be.visible')
      }
    })
})
Cypress.Commands.add('c_WaitUntilWalletsPageIsLoaded', () => {
  cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
  cy.get('.wallets-trading-account-card__content')
    .contains('.wallets-text', 'Financial', { timeout: 3000 })
    .parent()
    .closest('.wallets-added-mt5__details, .wallets-available-mt5__details')
})
Cypress.Commands.add(
  'c_CreateMT5Account',
  (mt5AccountType, jurisdiction, options = {}) => {
    const { isMobile = false } = options
    cy.get('span.wallets-text').contains(mt5AccountType).click()

    cy.findByText(`Choose a jurisdiction`, { exact: true }).should('be.visible')
    if (jurisdiction === 'St. Vincent & Grenadines') {
      cy.findByText(jurisdiction).click()
    } else if (jurisdiction === 'British Virgin Islands') {
      cy.findByText(jurisdiction, { exact: true }).click()
      cy.findByText('I confirm and accept Deriv (BVI) Ltd‘s').click()
    }

    cy.findByRole('button', { name: 'Next' }).click()

    let expectedText
    if (mt5AccountType === 'Standard') {
      expectedText = 'Create a Deriv MT5'
      cy.get('div').contains(expectedText).should('be.visible')
      cy.findByPlaceholderText('Deriv MT5 password')
        .click()
        .type(Cypress.env('credentials').test.mt5User.PSWD)
      cy.findByRole('button', { name: 'Create Deriv MT5 password' }).click()
    } else {
      expectedText = 'Enter your Deriv MT5 password'
      cy.get('div').contains(expectedText).should('be.visible')
      cy.findByPlaceholderText('Deriv MT5 password')
        .click()
        .type(Cypress.env('credentials').test.mt5User.PSWD)
      cy.findByRole('button', { name: 'Add account' }).click()
    }

    cy.findByText(
      `Transfer funds from your USD Wallet to your ${mt5AccountType} account to start trading.`
    ).should('be.visible')

    cy.get(`div:contains("MT5 ${mt5AccountType}USD Wallet0.00 USD")`)
      .eq(2)
      .should('be.visible')
    if (isMobile) {
      cy.findByRole('button', { name: 'OK' }).should('be.visible').click()
    } else {
      cy.findByRole('button', { name: 'Transfer funds' }).should('be.visible')
      cy.findByRole('button', { name: 'Maybe later' })
        .should('be.visible')
        .click()
    }
  }
)
Cypress.Commands.add('c_migratetoWallet', (size) => {
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
})
