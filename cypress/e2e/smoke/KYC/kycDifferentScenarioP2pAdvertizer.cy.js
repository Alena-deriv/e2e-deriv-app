import { generateRandomName } from '../../../support/helper/utility'
import { getCurrentDate } from '../../../support/helper/utility'
const CURRENT_DATE = getCurrentDate()
describe('QATEST-4745 Trigger KYC check in different scenarios.', () => {
  beforeEach(() => {
    cy.c_createCRAccount({ country_code: 'aq' })
    cy.c_login()
  })
  it('p2p advertizer, POI/POA should be required to buy/sell.', () => {
    /* Visit cashier page */
    cy.c_visitResponsive('/cashier/', { size: 'mobile' })
    cy.get('#dt_mobile_drawer_toggle').click()
    cy.findByText('Cashier').click()
    cy.findByText('Deriv P2P').click()
    cy.contains('li', 'My ads').click()
    cy.findByText('Verify your identity and address to use Deriv P2P.').should(
      'be.visible'
    )
    /*submit POI */
    cy.findByText('Upload documents to verify your identity.')
      .should('be.visible')
      .click()
    cy.get('select[name="country_input"]').select('Antarctica')
    cy.c_SubmitPoiThroughManual()
    /* Submit POA */
    cy.c_visitResponsive('/account/proof-of-address/', { size: 'mobile' })
    cy.c_uploadDocument()
    cy.findByRole('button', { name: 'Save and submit' })
      .should('be.enabled')
      .click()
    cy.findByText('Your documents were submitted successfully').should(
      'be.visible'
    )
    /* Visit BO and verify docs */
    cy.c_visitBackOffice({ login: true })
    cy.findByText('Client Management').click()
    cy.findByPlaceholderText('email@domain.com')
      .should('exist')
      .clear()
      .type(Cypress.env('credentials').test.masterUser.ID)
    cy.findByRole('button', { name: /View \/ Edit/i }).click()
    cy.get('.link').eq(1).should('be.visible').click()
    cy.get(
      '#documents_wrapper table tbody tr td input[name^="issue_date_"]'
    ).type(CURRENT_DATE)
    cy.get('#documents_wrapper table tbody tr td input[type="checkbox"]')
      .should('exist')
      .check()
    cy.findByRole('button', { name: /Verify Checked Files/i }).click()
    cy.get('select[name="client_authentication"]')
      .select('Authenticated with scans')
      .type('{enter}')
    /* visit p2p page and check that you are able to create an advertizer */
    cy.c_visitResponsive('/cashier/', { size: 'mobile' })
    cy.get('#dt_mobile_drawer_toggle').click()
    cy.findByText('Cashier').click()
    cy.findByText('Deriv P2P').click()
    cy.contains('li', 'My ads').click()
    cy.findByText(
      'Looking to buy or sell USD? You can post your own ad for others to respond.'
    ).should('be.visible')
    cy.contains('button', 'Create new ad').click()
    cy.findByLabelText('Your nickname').type(
      generateRandomName({ fakeProfile: false })
    )
    cy.contains('button', 'Confirm').should('be.enabled').click()
    cy.get(
      '.notification.notification--announce[data-testid="dt_default_component"]'
    ).should('be.visible')
  })
})
