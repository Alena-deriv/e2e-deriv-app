import RunPanel from '../../../support/pageobjects/dbot/run_panel'
import BotBuilder from '../../../support/pageobjects/dbot/bot_builder_page'

describe('QATEST-99419: Import and run custom strategy', () => {
  const botBuilder = new BotBuilder()
  const runPanel = new RunPanel()
  let beforePurchaseBalanceString
  let beforePurchaseBalanceNumber
  let afterPurchaseBalanceString

  beforeEach(() => {
    cy.c_login({ user: 'dBot' })
    cy.c_visitResponsive('/appstore/traders-hub', 'large')
    cy.c_openDbotThub()
    cy.c_loadingCheck()
    cy.c_skipTour()
    cy.c_switchToDemoBot()
  })

  it('Run Timely Balance Strategy', () => {
    botBuilder.openBotBuilderTab()
    cy.c_skipTour()
    botBuilder.importStrategyFromToolbar('TimelyBalance')
    cy.findByTestId('dt_bot_dashboard').should('be.visible')
    cy.findByTestId('dt_balance').then(($el) => {
      beforePurchaseBalanceString = $el.text()
      beforePurchaseBalanceNumber = parseFloat(
        $el.text().replace('USD', '').replace(/,/g, '').trim()
      )
    })

    cy.c_runBot()
    cy.c_checkRunPanel()
    cy.c_stopBot(7000)
    runPanel.journalTab.click()
    runPanel.runPanelScrollbar
      .scrollTo('bottom', { ensureScrollable: false })
      .then(() => {
        runPanel.secondBeforePurchaseText.then(($el) => {
          afterPurchaseBalanceString = $el
            .text()
            .replace('[BEFORE_PURCHASE]:', '[AFTER_PURCHASE]:')
          runPanel.afterPurchase.should(
            'contain.text',
            afterPurchaseBalanceString
          )
        })
        runPanel.beforePurchase.should(
          'contain.text',
          `[BEFORE_PURCHASE]:   Number:  ${beforePurchaseBalanceNumber}      --      String:  ${beforePurchaseBalanceString}`
        )
      })
  })

  after(() => {
    cy.c_deleteStrategy()
  })
})
