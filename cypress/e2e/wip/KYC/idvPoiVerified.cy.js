import { generateRandomName } from '../../../support/helper/utility'

describe('QATEST-22037 IDV verified by Smile Identity provider', () => {
  beforeEach(() => {
    cy.c_createCRAccount({ country_code: 'za' })
    cy.c_login()
    cy.c_navigateToPoiResponsive('South Africa')
  })

  it('Should Return IDV Verified', () => {
    cy.get('select[name="document_type"]').select('National ID Number')
    cy.findByLabelText('Enter your document number').type('0000000000000')
    cy.findByTestId('first_name').clear().type('Joe')
    cy.findByTestId('last_name').clear().type('Leo')
    cy.findByTestId('date_of_birth').type('2000-09-20')
    cy.get('.dc-checkbox__box').click()
    cy.findByRole('button', { name: 'Verify' }).click()
    cy.c_closeNotificationHeader()
    cy.c_waitUntilElementIsFound({
      cyLocator: () => cy.findByText('ID verification passed'),
      timeout: 4000,
      maxRetries: 5,
    })
    cy.contains('a', 'Continue trading').should('be.visible')

    // Revert names to be rerun again
    cy.c_visitBackOffice()
    cy.findByText('Client Management').click()
    cy.findByPlaceholderText('email@domain.com')
      .should('exist')
      .clear()
      .type(Cypress.env('credentials').test.masterUser.ID)
    cy.findByRole('button', { name: /View \/ Edit/i }).click()
    cy.get('.link').eq(1).should('be.visible').click()

    cy.get('input[name="last_name"]').type(generateRandomName()).type('{enter}')
  })
})
