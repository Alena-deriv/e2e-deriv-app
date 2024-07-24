import { derivApp } from '../../../support/locators'

describe('QATEST-136582: Redirection to other pages from dbot', () => {
  const sizes = ['mobile', 'desktop']
  beforeEach(() => {
    Cypress.prevAppId = 0 //TODO:Update once BOT-1926 is done
    cy.c_login({ user: 'dBot', rateLimitCheck: true })
  })

  sizes.forEach((size) => {
    it(`Redirect to deposit page from Dbot on ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_visitResponsive('appstore/traders-hub', { size: size })
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
      cy.c_openDbotThub()
      cy.c_rateLimit()
      if (isMobile) cy.findByTestId('close-icon', { timeout: 7000 }).click()
      cy.c_skipTour()
      if (isMobile) {
        derivApp.commonPage.mobileLocators.header.hamburgerMenuButton().click()
        cy.findByRole('heading', { name: 'Cashier' }).click()
        cy.findByRole('link', { name: 'Deposit' }).click()
      } else {
        cy.findByRole('button', { name: 'Deposit' }).click()
      }
      cy.findByTestId('dt_acc_info').should('exist')
      cy.findByText('Deposit via bank wire, credit card, and e-wallet').should(
        'be.visible'
      )
    })

    it(`Switching from Dbot to Dtrader on ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_visitResponsive('appstore/traders-hub', { size: size })
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
      cy.c_openDbotThub()
      if (isMobile) cy.findByTestId('close-icon', { timeout: 7000 }).click()
      cy.c_skipTour()
      if (isMobile) {
        derivApp.commonPage.mobileLocators.header.hamburgerMenuButton().click()
      }
      cy.findByTestId('dt_platform_switcher').click()
      cy.findByText(
        'A whole new trading experience on a powerful yet easy to use platform.'
      ).click()
      //check if the user is in dtrader page and is logged in
      cy.findByTestId('dt_positions_toggle', { timeout: 5000 }).should(
        'be.visible'
      )
      cy.findByTestId('dt_acc_info').should('be.visible')
    })
  })
})
