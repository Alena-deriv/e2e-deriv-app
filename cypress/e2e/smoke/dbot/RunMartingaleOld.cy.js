import RunPanel from '../../../support/pageobjects/dbot/run_panel'
import BotBuilder from '../../../support/pageobjects/dbot/bot_builder_page'
import BotDashboard from '../../../support/pageobjects/dbot/bot_dashboard_page'

describe('QATEST-99420, QATEST-4179: Import and run custom strategy', () => {
  const sizes = ['mobile', 'desktop']
  const botBuilder = new BotBuilder()
  const runPanel = new RunPanel()
  const dashboard = new BotDashboard()
  let totalPL

  sizes.forEach((size) => {
    it(`Run Martingale Old strategy on ${size}`, () => {
      const isMobile = size == 'mobile'
      cy.clearAllLocalStorage()
      cy.c_login({ user: 'dBot' })
      cy.c_visitResponsive('appstore/traders-hub', { size: size })
      //Wait for page to completely load
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
      cy.c_openDbotThub()
      if (isMobile) cy.findByTestId('close-icon', { timeout: 7000 }).click()
      cy.c_skipTour()
      cy.c_switchToDemoBot()
      botBuilder.openBotBuilderTab()
      cy.c_skipTour()
      botBuilder.importStrategyFromToolbar('MartingaleOld')
      cy.c_loadingCheck()
      cy.findByTestId('dt_bot_dashboard').should('be.visible')
      //Enter Expected profit, expected Loss, and Trade Amount
      cy.window().then((win) => {
        const martingaleValues = ['5', '4', '1'] //Expected Profit, Expected Loss, Trade Amount
        let call = 0
        cy.stub(win, 'prompt').callsFake(() => {
          return martingaleValues[call++]
        })
        cy.c_loadingCheck()
        cy.c_runBot()
      })

      //Wait for bot to complete
      cy.findByRole('button', { name: 'Run' }, { timeout: 120000 }).should(
        'be.visible'
      )
      runPanel.profitLossValue.should('be.visible')
      runPanel.profitLossValue.then(($value) => {
        totalPL = $value.text()
      })

      cy.findAllByText('Total profit/loss').then(($amt) => {
        if ($amt.hasClass('run-panel__stat-amount--positive')) {
          cy.on('window:alert', (str) => {
            expect(str).to.contain(
              `Expected Profit Made! Total Profit: ${totalPL}`
            )
          })
        } else {
          cy.on('window:alert', (str) => {
            expect(str).to.contain(
              `Maximum Loss Occurred! Total Loss: ${totalPL}`
            )
          })
        }
      })

      runPanel.transactionsTab.click() //Switch to transactions tab
      //Verify Stake doubles after a loss
      if (!isMobile)
        runPanel.runPanelScrollbar.scrollTo('bottom', {
          ensureScrollable: false,
        })
      runPanel.transactionAfterFirstLoss()
      cy.c_journalCheck()
      cy.c_deleteStrategy(isMobile)
    })
  })
})
