import { getCurrentDate } from '../../../support/helper/utility'
const CURRENT_DATE = getCurrentDate()
describe('QATEST-4745 Trigger KYC check in different scenarios.', () => {
  beforeEach(() => {
    cy.c_createCRAccount({ country_code: 'co' })
    cy.c_login()
  })
  it('High risk client, withdrawal should be locked.', () => {
    /* Visit BO */
    cy.c_visitBackOffice({ login: true })
    cy.findByText('Client Management').click()
    cy.findByPlaceholderText('email@domain.com')
      .should('exist')
      .clear()
      .type(Cypress.env('credentials').test.masterUser.ID)
    cy.findByRole('button', { name: /View \/ Edit/i }).click()
    cy.get('.link').eq(1).should('be.visible').click()
    cy.get('select[name="client_aml_risk_classification"]')
      .select('High')
      .type('{enter}')
    /* Check withdrawal lock on FE */
    cy.c_visitResponsive('/cashier/', { size: 'mobile' })
    cy.get('#dt_mobile_drawer_toggle').click()
    cy.findByText('Cashier').click()
    cy.findByText('Withdrawal').click()
    cy.findByText('Withdrawals are locked').should('be.visible')
    cy.findByTestId('dt_empty_state_description').should(
      'have.text',
      'You can only make deposits. Please complete the financial assessment to unlock withdrawals.'
    )
    /* submit FA */
    cy.findByTestId('dt_financial_assessment_link').should('be.visible').click()
    cy.c_financialAssessmentForm()
    /* Check on withdrawal that only POI and POA are required */
    cy.c_visitResponsive('/cashier/', { size: 'mobile' })
    cy.get('#dt_mobile_drawer_toggle').click()
    cy.findByText('Cashier').click()
    cy.findByText('Withdrawal').click()
    cy.contains(
      'Your account has not been authenticated. Please submit your proof of identity and proof of address to authenticate your account and request for withdrawals.'
    )
    /* submit POI */
    cy.contains('a', 'proof of identity').click()
    cy.get('select[name="country_input"]').select('Colombia')
    cy.contains('button', 'Next').click()
    cy.c_submitOnfidoPoiPage()
    cy.contains('a.dc-btn--primary', 'Submit proof of address').click()

    /* submit POA */
    cy.c_uploadDocument()
    cy.findByRole('button', { name: 'Save and submit' })
      .should('be.enabled')
      .click()
    cy.findByText('Your documents were submitted successfully').should(
      'be.visible'
    )
    /* Verify docs from BO */
    cy.c_visitBackOffice({ login: false })
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
    /* check FE on withdrawal page no cashier lock is there */
    cy.c_visitResponsive('/cashier/', { size: 'mobile' })
    cy.get('#dt_mobile_drawer_toggle').click()
    cy.findByText('Cashier').click()
    cy.findByText('Withdrawal').click()
    cy.findByText('You have no funds in your USD account').should('be.visible')
  })
  it('Creation of MT5 regulated account, should ask for both POI and POA', () => {
    cy.c_visitResponsive('/', { size: 'mobile' })
    /* check that to create MT5 regulated account, you have to submit POI and POA */
    cy.findByRole('button', { name: 'CFDs' }).click()
    cy.findByTestId('dt_trading-app-card_real_standard')
      .contains('button', 'Get')
      .click()
    cy.findByText('British Virgin Islands').should('be.visible').click()
    cy.c_SubmitOnfidoMt5()
    cy.findByTestId('dt_mt5_password').type(
      Cypress.env('credentials').test.mt5User.PSWD
    )
    cy.contains('button', 'Create Deriv MT5 password').click()
    cy.contains('Your Deriv MT5 Standard account is ready.').should(
      'be.visible'
    )
  })
})
