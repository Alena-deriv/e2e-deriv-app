import BotDashboard from '../../../support/pageobjects/dbot/bot_dashboard_page'

describe('QATEST-4126: Log in Deriv Bot platform page from deriv.com', () => {
  const botDashboard = new BotDashboard()
  beforeEach(() => {
    cy.c_visitResponsive(`${Cypress.env('derivComProdURL')}/dbot`, 'desktop')
    cy.findByText('Automated bot trading. No coding required.').should('exist')
  })

  it('Login from deriv.com and redirect to dbot on app.deriv.com', () => {
    if (Cypress.config().baseUrl == Cypress.env('prodURL')) {
      // added an if here so later can add on for staging check
      cy.findByRole('link', { name: 'Log in' }).click()
      cy.findByLabelText('Email').type(
        Cypress.env('credentials').production.dBot.ID
      )
      cy.findByLabelText('Password').type(
        Cypress.env('credentials').production.dBot.PSWD
      )
      cy.findByRole('button', { name: 'Log in' }).click()
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
      cy.c_openDbotThub()
      botDashboard.botBuilderDash.should('be.visible')
      cy.c_visitResponsive(`${Cypress.env('derivComProdURL')}dbot`, 'desktop')
      cy.get('.tab-for-buttons')
        .eq(1)
        .should('contain.text', 'Trade now')
        .scrollIntoView({ timeout: 5000 })
        .should('have.attr', 'href')
        .then((href) => {
          cy.request(href).its('status').should('eq', 200)
        })
    }
  })
})
