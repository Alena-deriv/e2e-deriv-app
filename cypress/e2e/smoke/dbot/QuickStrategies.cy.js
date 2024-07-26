import BotBuilder from '../../../support/pageobjects/dbot/bot_builder_page'
import QuickStrategy from '../../../support/pageobjects/dbot/quick_strategy'

describe('QATEST-4212: Verify Martingale Quick Strategy', () => {
  const sizes = ['mobile', 'desktop']
  const botBuilder = new BotBuilder()
  const quickStrategy = new QuickStrategy()

  sizes.forEach((size) => {
    it(`Run Martingale Quick Strategy on ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_login({ user: 'dBot', size: size })
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
      cy.c_openDbotThub()
      if (isMobile) cy.findByTestId('close-icon', { timeout: 7000 }).click()
      cy.c_skipTour()
      cy.c_switchToDemoBot()
      botBuilder.openBotBuilderTab()
      cy.c_skipTour()
      quickStrategy.clickQuickStrategies() //Click on Quick Strategy and fill up the details
      if (isMobile) {
        cy.get('#dt_components_select-native_select-tag').select('MARTINGALE')
      } else {
        quickStrategy.clickOnStrategyTab('Martingale')
      }
      quickStrategy.quickStrategyMarketDropdown.should(
        'have.value',
        'Volatility 100 (1s) Index'
      )
      quickStrategy.chooseTradeType(isMobile)
      quickStrategy.fillUpContractSize()
      quickStrategy.fillUpLossProfitTreshold()
      quickStrategy.runBotQuickStrategy()
      cy.findByTestId('dt_bot_dashboard').should('be.visible')
      cy.findByText('Transactions').click()
      cy.c_lossMartingaleCheck()

      //Check for empty field on Quick Strategy modal
      if (isMobile) cy.get('.dc-drawer__toggle').click({ force: true })
      quickStrategy.clickQuickStrategies()
      cy.findByTestId('dt_qs_tradetype')
        .invoke('val')
        .should('not.be.empty')
        .then((value) => {
          cy.log(`Trade type ${value} is visible`)
          cy.findByTestId('dt_qs_durationtype')
            .scrollIntoView()
            .should('be.visible')
            .invoke('val')
            .should('not.be.empty')
            .then((value2) => {
              cy.log(`Duration ${value2} is visible`)
            })
        })
      quickStrategy.fillUpContractSize()
      quickStrategy.fillUpLossProfitTreshold()
      if (!isMobile) cy.findByTestId('dt_qs_contract_type').click()
      cy.findByText('Differs').click()
      quickStrategy.runBotQuickStrategy()
      cy.findByTestId('dt_bot_dashboard').should('be.visible')
      cy.findByText('Transactions').click()
      cy.c_winMartingaleCheck()
    })
  })
})
