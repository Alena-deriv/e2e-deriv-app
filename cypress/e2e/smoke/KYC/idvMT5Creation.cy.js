import { generateCPFNumber } from '../../../support/helper/utility'

const CPFDocumentNumber = generateCPFNumber()
describe('QATEST-149356 POI through MT5 acc creation', () => {
  beforeEach(() => {
    cy.c_createCRAccount({ country_code: 'br' })
    cy.c_login()
  })
  it('should be able to upload POI through MT5 account creation, first try will fail and second will pass', () => {
    cy.c_visitResponsive('appstore/traders-hub', 'small')
    cy.findByRole('button', { name: 'CFDs' }).click()
    cy.findByTestId('dt_trading-app-card_real_standard')
      .findByRole('button', { name: 'Get' })
      .click()
    cy.findByText('British Virgin Islands').click()
    cy.get('input.dc-checkbox__input').check({ force: true })
    cy.findByRole('button', { name: 'Next' }).click()
    // As document will fail either way, we do not input personal details
    cy.get('select[name="document_type"]').select('CPF')
    cy.findByLabelText('Enter your document number').type('184.677.461-65')
    cy.get('.dc-checkbox__box').click()
    cy.findByRole('button', { name: 'Next' }).click().wait(3500)
    cy.findByTestId('dt_dc_mobile_dialog_close_btn').click()
    // Failure expected due to document rejected test data
    cy.findByText('Your proof of identity verification has failed', {
      timeout: 50000,
    })
      .should('exist')
      .c_closeNotificationHeader()

    //Second attempt through MT5 account creation
    cy.c_visitResponsive('appstore/traders-hub', 'small')
    cy.findByRole('button', { name: 'CFDs' }).click()
    cy.findByTestId('dt_trading-app-card_real_standard')
      .findByRole('button', { name: 'Get' })
      .click()
    cy.findByText('British Virgin Islands').click()
    cy.get('input.dc-checkbox__input').check({ force: true })
    cy.findByRole('button', { name: 'Next' }).click()
    cy.get('select[name="document_type"]').select('CPF')
    cy.findByLabelText('Enter your document number').type(CPFDocumentNumber)
    cy.get('.dc-checkbox__box').click()
    cy.findByRole('button', { name: 'Verify' }).click()
    cy.get('input[type=file]').selectFile(
      'cypress/fixtures/kyc/testDocument.jpg',
      { force: true }
    )
    cy.findByRole('button', { name: 'Continue' }).click()
    cy.findByText('Create a Deriv MT5 password').should('be.visible')
    cy.findByText(
      'You can use this password for all your Deriv MT5 accounts.'
    ).should('be.visible')
    cy.findByRole('button', { name: 'Create Deriv MT5 password' }).should(
      'be.disabled'
    )
    cy.findByTestId('dt_mt5_password').type(
      Cypress.env('credentials').test.mt5User.PSWD,
      {
        log: false,
      }
    )
    cy.findByRole('button', { name: 'Create Deriv MT5 password' }).click()
    //Checks MT5 account was created correctly
    cy.get('.dc-modal-body').should(
      'contain.text',
      'Your Deriv MT5 Standard account is ready. Enable trading with your first transfer.'
    )
    cy.findByRole('button', { name: 'Transfer now' }).should('exist')
    cy.findByRole('button', { name: 'Maybe later' }).click()
    cy.findByText('0.00 USD').should('be.visible')
    cy.findByRole('button', { name: 'Transfer' }).should('exist')
    cy.findByRole('button', { name: 'Open' }).should('exist')
    cy.findByTestId('dt_trading-app-card_real_standard_bvi')
      .findByTestId('dt_cfd-account-name')
      .should('have.text', 'Standard')
    //Checks both POI and POA were submitted correctly
    cy.c_visitResponsive('/account/proof-of-identity', 'small')
    cy.contains('ID verification passed').should('be.visible')
    cy.c_navigateToPoaResponsive()
    cy.findByText('Your documents were submitted successfully').should(
      'be.visible'
    )
  })
})
