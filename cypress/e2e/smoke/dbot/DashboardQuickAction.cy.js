import BotDashboard from '../../../support/pageobjects/dbot/bot_dashboard_page'
import QuickStrategy from '../../../support/pageobjects/dbot/quick_strategy'

describe('QATEST-4140: Dashboard quick action to Quick Strategy and Bot Builder', () => {
  const botDashboard = new BotDashboard()
  const quickStrategy = new QuickStrategy()
  const sizes = ['mobile', 'desktop']

  sizes.forEach((size) => {
    it(`Go to Bot Builder on ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_visitResponsive('/bot', { size: size })
      if (isMobile) {
        cy.findByTestId('close-icon', { timeout: 7000 }).click()
      }
      cy.c_skipTour()
      botDashboard.openQsQaction()
      botDashboard.botBuilderActiveTab.should('exist')
    })
  })

  sizes.forEach((size) => {
    it(`Go to Quick Strategy on ${size}`, () => {
      const isMobile = size === 'mobile' ? true : false
      cy.c_visitResponsive('/bot', { size: size })
      if (isMobile) {
        cy.findByTestId('close-icon', { timeout: 7000 }).click()
      }
      cy.c_skipTour()
      botDashboard.openQsQaction()
      botDashboard.botBuilderActiveTab.should('exist')
      quickStrategy.quickStrategyMarketDropdown.should('be.visible')
    })
  })
})
