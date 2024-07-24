describe('QATEST-4745 Trigger KYC check in different scenarios.', () => {
  beforeEach(() => {
    cy.c_login({ user: 'kycUserWithFundsMF' })
  })

  it('MF client, cashier should be locked until submits both POI and POA', () => {
    /* check that withdrawal is locked until user submits POI and POA */
    cy.c_visitResponsive('/cashier/', { size: 'mobile' })
    cy.get('#dt_mobile_drawer_toggle').click()
    cy.contains('Cashier').click()
    cy.contains('Withdrawal').click()
    cy.contains('Cashier is locked').should('be.visible')
    cy.contains(
      'You can make a withdrawal once the verification of your account is complete.'
    ).should('be.visible')
  })
  /*
    Note: We have not included the tests to cover submission of POI and POA since this is a startic account.
    This test will check if POI and POA gets triggered if we attempt to make withdrawal $
    */
})
