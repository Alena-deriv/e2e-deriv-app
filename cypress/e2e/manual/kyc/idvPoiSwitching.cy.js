describe('QATEST-123731 - IDV (2 attempts) and Onfido (1 attempt) failed clients are redirected to manual upload', () => {
  beforeEach(() => {
    cy.c_createCRAccount({ country_code: 'gh' })
    cy.c_login()
    cy.c_navigateToPoiResponsive('Ghana')
  })

  it('IDV (2 attempts) and Onfido (1 attempt) failed clients should be redirected to manual upload', () => {
    // IDV flow
    cy.c_submitIdv() // first IDV attempt
    cy.contains('Your documents were submitted successfully').should(
      'be.visible'
    )
    cy.c_closeNotificationHeader()
    cy.c_waitUntilElementIsFound({
      cyLocator: () =>
        cy.findByText('Your identity verification failed because:'),
      timeout: 4000,
      maxRetries: 5,
    })

    cy.get('select[name="country_input"]').select('Ghana')
    cy.findByRole('button', { name: 'Next' }).click()

    cy.c_submitIdv() // second IDV attempt
    cy.c_waitUntilElementIsFound({
      cyLocator: () => cy.findByText(/ID verification failed/),
      timeout: 4000,
      maxRetries: 5,
    })

    // Onfido flow
    cy.findByRole('button', { name: 'Upload identity document' }).click()
    cy.c_onfidoSecondRun('Ghana')
    cy.findByText('Your documents were submitted successfully').should(
      'be.visible'
    )
    // Manual flow
    cy.c_waitUntilElementIsFound({
      cyLocator: () =>
        cy.findByText('Please upload one of the following documents:'),
      timeout: 4000,
      maxRetries: 5,
    })
    cy.findByText('Please upload one of the following documents:').should(
      'be.visible'
    )
  })
})
