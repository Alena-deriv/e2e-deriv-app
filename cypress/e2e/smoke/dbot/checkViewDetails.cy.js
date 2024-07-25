import RunPanel from '../../../support/pageobjects/dbot/run_panel'
import BotBuilder from '../../../support/pageobjects/dbot/bot_builder_page'
import BotDashboard from '../../../support/pageobjects/dbot/bot_dashboard_page'

describe('QATEST-4340 - View Details Button on Run Panel', () => {
  const runPanel = new RunPanel()
  const botBuilder = new BotBuilder()
  const botDashboard = new BotDashboard()

  it(`Checking View Details on Transaction tab for mobile'}`, () => {
    cy.c_login({ user: 'dBot' })
    cy.c_visitResponsive('/bot', { size: 'mobile' })
    cy.findByTestId('close-icon', { timeout: 15000 }).click()
    cy.c_skipTour()
    botBuilder.openBotBuilderTab()
    cy.c_skipTour()

    botDashboard.drawerToggleMobile.click()
    runPanel.transactionsTab.click()
    cy.findByRole('button', { name: 'View Detail' }).should('be.disabled')
    botDashboard.drawerToggleMobile.click()

    // Specifying asset and purchasing contracts
    botBuilder.changeMarketOnBlocklyWorkspace(2, 'Volatility 100 (1s) Index')
    cy.c_runBot()
    cy.c_checkRunPanel()
    cy.c_stopBot(6000)
    runPanel.transactionsTab.click()

    // Getting the details of contract from Transaction page and storing it
    cy.findAllByTestId('dt_transactions_item_entry_spot')
      .first()
      .invoke('text')
      .then((text) => {
        const entrySpot = parseFloat(text)
        cy.wrap(entrySpot).as('entrySpot')
      })

    cy.findAllByTestId('dt_transactions_item_exit_spot')
      .first()
      .invoke('text')
      .then((text) => {
        const exitSpot = parseFloat(text)
        cy.wrap(exitSpot).as('exitSpot')
      })

    cy.findAllByTestId('dt_transactions_item_stake')
      .first()
      .invoke('text')
      .then((text) => {
        const stake = parseFloat(text)
        cy.wrap(stake).as('stake')
      })

    cy.findAllByTestId('dt_transactions_item_profit')
      .first()
      .invoke('text')
      .then((text) => {
        const profitLoss = parseFloat(text)
        cy.wrap(profitLoss).as('profitLoss')
      })

    // Counting number of contracts in Transaction page
    cy.findAllByTestId('dt_transactions_item')
      .its('length')
      .then((count) => {
        cy.wrap(count).as('contractCount')
      })

    cy.findByRole('button', { name: 'View Detail' })
      .should('be.enabled')
      .click()
    cy.findByText('Transactions detailed summary').should('be.visible')

    // Ensuring it has the same number of contracts in both Transaction and View details section
    cy.findAllByTestId('dt_mobile_transaction_card')
      .its('length')
      .then((count) => {
        cy.wrap(count).as('vContractCount')
      })
      .then(function () {
        expect(this.contractCount).to.equal(this.vContractCount)
      })

    botBuilder.volatilityHundredLogo.should('exist')
    botBuilder.upDownRiseFallLogo.should('exist')

    // Getting details from Transaction details
    cy.findAllByTestId('dt_mobile_transaction_card')
      .first()
      .should('exist')
      .and('be.visible')

    cy.get('.transaction-details-modal-mobile__small-title')
      .first()
      .invoke('text')
      .should('equal', 'Ref. ID')

    cy.get('.transaction-details-modal-mobile__label')
      .eq(1)
      .invoke('text')
      .should('match', /^\d+$/)

    cy.get('.transaction-details-modal-mobile__small-title')
      .eq(1)
      .invoke('text')
      .should('equal', 'Timestamp')

    cy.get('.transaction-details-modal-mobile__label')
      .eq(2)
      .invoke('text')
      .should('match', /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} GMT/)

    cy.get('.transaction-details-modal-mobile__small-title')
      .eq(2)
      .invoke('text')
      .should('equal', 'Entry Spot')

    cy.get('.transaction-details-modal-mobile__label')
      .eq(3)
      .invoke('text')
      .then((text) => {
        const vEntrySpot = parseFloat(text)
        cy.wrap(vEntrySpot).as('vEntrySpot')
      })
      .then(function () {
        expect(this.entrySpot).to.equal(this.vEntrySpot)
      })

    cy.get('.transaction-details-modal-mobile__small-title')
      .eq(3)
      .invoke('text')
      .should('equal', 'Buy Price')

    cy.findByTestId('transaction_details_cards')
      .get('.transaction-details-modal-mobile__label')
      .eq(4)
      .invoke('text')
      .then((text) => {
        const vStake = parseFloat(text)
        cy.wrap(vStake).as('vStake')
      })
      .then(function () {
        expect(this.stake).to.equal(this.vStake)
      })

    cy.get('.transaction-details-modal-mobile__small-title')
      .eq(4)
      .invoke('text')
      .should('equal', 'Exit Spot')

    cy.get('.transaction-details-modal-mobile__label')
      .eq(5)
      .invoke('text')
      .then((text) => {
        const vExitSpot = parseFloat(text)
        cy.wrap(vExitSpot).as('vExitSpot')
      })
      .then(function () {
        expect(this.exitSpot).to.equal(this.vExitSpot)
      })

    cy.get('.transaction-details-modal-mobile__large-title')
      .first()
      .invoke('text')
      .should('equal', 'Profit / Loss')

    cy.get('.transaction-details-modal-mobile__label')
      .eq(7)
      .invoke('text')
      .then((text) => {
        const vProfitLoss = parseFloat(text)
        cy.wrap(vProfitLoss).as('vProfitLoss')
      })
      .then(function () {
        expect(this.profitLoss).to.equal(this.vProfitLoss)
      })

    cy.findByTestId('dt_page_overlay_header_close').click()
  })
})
