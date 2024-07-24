import BotBuilder from '../../../support/pageobjects/dbot/bot_builder_page'
import BotDashboard from '../../../support/pageobjects/dbot/bot_dashboard_page'

describe('QATEST-4233, QATEST-4238, QATEST-4228: Verify toolbar on bot builder page', () => {
  const sizes = ['mobile', 'desktop']
  const botDashboard = new BotDashboard()
  const botBuilder = new BotBuilder()
  let strategyName = 'Stock_Netherland_25' + Math.random().toString()

  beforeEach(() => {
    cy.c_login({ user: 'dBot' })
  })

  sizes.forEach((size) => {
    it(`Import and Export strategy from toolbar on ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_visitResponsive('appstore/traders-hub', { size: size })
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
      cy.c_openDbotThub()
      if (isMobile) cy.findByTestId('close-icon', { timeout: 7000 }).click()
      cy.c_skipTour()
      cy.c_switchToDemoBot()
      botBuilder.openBotBuilderTab()
      cy.c_skipTour()
      cy.log('Saving strategy from Toolbar')
      botBuilder.changeMarketOnBlocklyWorkspace(0, 'Stock Indices')
      botBuilder.changeMarketOnBlocklyWorkspace(1, 'European indices')
      botBuilder.saveStrategyFromToolbar(strategyName)
      botDashboard.goToDashboard()
      botDashboard.strategySaveStatus(strategyName).should('have.text', 'Local')
      cy.log('Importing strategy from Toolbar')
      botBuilder.openBotBuilderTab()
      botBuilder.importStrategyFromToolbar('MartingaleOld')
      cy.c_loadingCheck()
      cy.findByText('You’ve successfully imported a bot.').should('be.visible')
      cy.log('Reset Workspace from Toolbar')
      cy.findByTestId('dt_toolbar_reset_button').click()
      cy.findByRole('button', { name: 'OK' }).click()
      cy.c_loadingCheck()
      cy.findAllByText('Martingale').should('not.exist')
    })
  })
})
