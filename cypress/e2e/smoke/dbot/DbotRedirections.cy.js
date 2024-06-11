describe('QATEST-136582: Redirection to other pages from dbot', () => {
  beforeEach(() => {
    cy.c_login({ user: 'dBot', rateLimitCheck: true })
    cy.c_visitResponsive('/appstore/traders-hub', 'large')
    cy.c_openDbotThub()
    cy.c_skipTour()
  })

  it('Redirect to deposit page from Dbot', () => {
    cy.findByRole('button', { name: 'Deposit' }).click()
    cy.findByTestId('dt_acc_info').should('be.visible')
    cy.findByText('Deposit via bank wire, credit card, and e-wallet').should(
      'be.visible'
    )
  })

  it('Switching from Dbot to Dtrader', () => {
    cy.findByTestId('dt_platform_switcher').click()
    cy.findByTestId('dt_div_100_vh').should('be.visible')
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
