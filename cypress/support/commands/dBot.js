Cypress.Commands.add('c_switchToDemoBot', () => {
  cy.findByTestId('dt_acc_info').click()
  cy.findByText('Demo').click()
  cy.findAllByText('Demo').eq(1).click()
  cy.findByTestId('dt_acc_info').should('be.visible', { timeout: 7000 })
})

Cypress.Commands.add('c_runBot', () => {
  cy.get('.bot-dashboard.bot').should('be.visible')
  cy.findByRole('button', { name: 'Run' }).click({ force: true })
})

Cypress.Commands.add('c_stopBot', (waitduration = undefined) => {
  if (waitduration) {
    cy.wait(waitduration)
  }
  cy.findByRole('button', { name: 'Stop' }).click({ force: true })
})

Cypress.Commands.add('c_setBlockDuration', () => {
  cy.xpath(
    "(//*[@class='blocklyText' and text()='Duration:']/..)/*[@class='blocklyEditableText']"
  ).click()
  cy.findByRole('menuitemcheckbox', { name: 'Ticks' }).click()
  cy.findByRole('textbox').eq(1).type('2')
})

Cypress.Commands.add('c_skipTour', () => {
  cy.findByText('Skip').should('be.visible').click({ force: true })
})

Cypress.Commands.add('c_checkRunPanel', (clearPanel = false) => {
  cy.findByText('Summary').click()
  cy.get('#db-run-panel__clear-button').then(($clearButton) => {
    if ($clearButton.is(':disabled')) {
      // Check while bot is running
      cy.findByTestId('dt_mock_summary_card').should('be.visible')
      cy.findByRole('button', { name: 'Stop' }).should('be.visible')
      cy.findByText('Total profit/loss')
        .parent()
        .findByTestId('dt_span')
        .invoke('text')
        .then((text) => {
          cy.log('The total profit/loss is ' + text)
        })
    } else if ($clearButton.is(':visible')) {
      // Check while bot is not running
      cy.findByText('Bot is not running').should('be.visible')
      cy.findByRole('button', { name: 'Run' }).should('be.visible')
      cy.get('#db-run-panel__clear-button').click()
      if (clearPanel)
        cy.findByText('Ok').should('be.visible').click({ force: true })
    }
  })
})

Cypress.Commands.add('c_openDbotThub', () => {
  cy.findByTestId('dt_trading-app-card_real_deriv-bot')
    .findByRole('button', { name: 'Open' })
    .click({ force: true })
  cy.c_loadingCheck()
})

Cypress.Commands.add('c_deleteStrategy', (isMobile = false) => {
  if (isMobile) {
    cy.get('.dc-drawer__toggle').click({ force: true })
    cy.findAllByText('Dashboard').click()
    cy.findByRole('button', { name: 'Run' }).should('not.be.disabled')
    cy.get('.bot-list__item__actions').first().click()
    cy.findAllByTestId('dt_mobile_bot_list_action-delete').first().click({
      force: true,
    })
  } else {
    cy.findAllByText('Dashboard').click()
    cy.findAllByTestId('dt_desktop_bot_list_action-delete').first().click()
  }
  cy.findByText('Yes, delete').click({ force: true })
})

Cypress.Commands.add('c_journalCheck', () => {
  cy.findByText('Journal').click()
  cy.findByText('Filters').click()
  cy.findByText('Notifications').click()
  cy.get('div.journal__text journal__text--warn').should('not.exist')
  cy.findByText('System').click()
  cy.findByText('Errors').click()
  cy.findByText('There are no messages to display').should('be.visible')
})

Cypress.Commands.add('c_lossMartingaleCheck', (options = {}) => {
  const { retryCount = 0, maxRetries = 5 } = options
  cy.log('Checking martingale strategy when contract is loss')
  cy.wait(10000) //wait for the bot to run
  cy.findAllByTestId('dt_transactions_profit_loss')
    .should(() => {})
    .then(($el) => {
      if ($el.length > 0) {
        cy.findAllByTestId('dt_transactions_profit_loss')
          .last()
          .parents('.data-list__row--wrapper')
          .parent()
          .prev()
          .within(($el) => {
            cy.findByTestId('dt_transactions_item').should(
              'contain.text',
              '2.00 USD'
            )
          })
        cy.c_stopBot()
      } else {
        if (retryCount < maxRetries) {
          cy.c_stopBot()
          cy.log(`Retrying... Attempt number: ${retryCount + 1}`)
          cy.findByRole('button', { name: 'Run' }).should('not.be.disabled')
          cy.c_runBot()
          cy.c_lossMartingaleCheck({ ...options, retryCount: retryCount + 1 })
        } else {
          throw new Error(`Element not found after ${maxRetries} attempts.`)
        }
      }
    })
})

Cypress.Commands.add('c_winMartingaleCheck', (options = {}) => {
  const { retryCount = 0, maxRetries = 5 } = options
  cy.log('Checking martingale strategy when contract is won')
  cy.wait(10000) //wait for the bot to run
  cy.findAllByTestId('dt_transactions_profit_win')
    .should(() => {})
    .then(($el) => {
      if ($el.length > 0) {
        cy.findAllByTestId('dt_transactions_profit_win')
          .last()
          .parents('.data-list__row--wrapper')
          .parent()
          .prev()
          .within(($el) => {
            cy.findByTestId('dt_transactions_item').should(
              'contain.text',
              '1.00 USD'
            )
          })
        cy.c_stopBot()
      } else {
        if (retryCount < maxRetries) {
          cy.c_stopBot()
          cy.log(`Retrying... Attempt number: ${retryCount + 1}`)
          cy.findByRole('button', { name: 'Run' }).should('not.be.disabled')
          cy.c_runBot()
          cy.c_winMartingaleCheck({ ...options, retryCount: retryCount + 1 })
        } else {
          throw new Error(`Element not found after ${maxRetries} attempts.`)
        }
      }
    })
})
