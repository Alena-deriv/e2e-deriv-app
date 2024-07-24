import { generateCPFNumber, generateRandomName } from '../helper/utility'

Cypress.Commands.add('c_navigateToPoi', (country) => {
  cy.get('a[href="/account/personal-details"]').click()
  cy.findByRole('link', { name: 'Proof of identity' }).click()
  cy.findByLabel('Country').click()
  cy.findByText(country).click()
  cy.contains(country).click()
  cy.contains('button', 'Next').click()
})

Cypress.Commands.add('c_navigateToPoiResponsive', (country, options = {}) => {
  const { size = 'mobile' } = options
  cy.c_visitResponsive('/account/proof-of-identity', { size: size })
  cy.c_closeNotificationHeader()
  cy.get('select[name="country_input"]').select(country)
  cy.contains('button', 'Next').click()
})

Cypress.Commands.add('c_navigateToPoaResponsive', (options = {}) => {
  const { size = 'mobile' } = options
  cy.c_visitResponsive('/account/proof-of-address', { size: size })
  cy.c_closeNotificationHeader()
})

Cypress.Commands.add('c_submitPoa', () => {
  cy.findByRole('button', { name: 'Save and submit' }).should('not.be.enabled')
  cy.c_uploadDocument()
  cy.findByRole('button', { name: 'Save and submit' })
    .should('be.enabled')
    .click()
  cy.findByText('Your documents were submitted successfully').should(
    'be.visible'
  )
})

Cypress.Commands.add('c_submitIdv', () => {
  cy.get('select[name="document_type"]').select('Passport')
  cy.findByLabelText('Enter your document number').type('G0000001')
  cy.get('.dc-checkbox__box').click()
  cy.findByRole('button', { name: 'Verify' }).click()
})

Cypress.Commands.add('c_SubmitPoiThroughManual', (country) => {
  cy.contains('button', 'Next').click()
  cy.findByText('Passport').should('be.visible').click()
  cy.findByLabelText('Passport number*').type('232344')
  cy.get('.dc-datepicker__native').type('2025-09-20')
  cy.findByRole('button', { name: 'Next' }).should('not.be.enabled')
  cy.c_uploadDocument()
  cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
  cy.findByRole('button', { name: 'Confirm and upload' }).should(
    'not.be.enabled'
  )
  cy.c_uploadDocument()
  cy.findByRole('button', { name: 'Confirm and upload' })
    .should('be.enabled')
    .click()
  cy.findByText('Your documents were submitted successfully').should(
    'be.visible'
  )
})

Cypress.Commands.add('c_submitOnfidoPoiPage', () => {
  cy.findByTestId('date_of_birth').type('1990-01-01')
  cy.findByText('Choose document').should('be.visible')
  cy.get('.dc-checkbox__box').click()
  cy.findByText('Passport').click()
  cy.findByText('Submit passport photo pages').should('be.visible')
  cy.findByText('or upload photo – no scans or photocopies').click()
  cy.findByText('Upload passport photo page').should('be.visible')
  cy.c_uploadDocument()
  cy.findByText('Confirm').click()
  cy.findByText('Continue').click()
  cy.findByText('Take a selfie').should('be.visible')
  cy.get('.onfido-sdk-ui-Camera-btn').click()
  cy.findByText('Confirm').click()
  cy.findByText('Your documents were submitted successfully').should(
    'be.visible'
  )
})

Cypress.Commands.add('c_onfidoSecondRun', (country) => {
  cy.get('select[name="country_input"]').select(country)
  cy.findByRole('button', { name: 'Next' }).click()
  cy.get('.dc-checkbox__box').click()
  cy.findByText('Passport').click()
  cy.findByText('or upload photo – no scans or photocopies').click()
  cy.c_uploadDocument()
  cy.findByText('Confirm').click()
  cy.findByText('Continue').click()
  cy.get('.onfido-sdk-ui-Camera-btn').click()
  cy.findByText('Confirm').click()
})

Cypress.Commands.add('c_SubmitOnfidoMt5', () => {
  cy.get('.dc-checkbox__box').click()
  cy.contains('button', 'Next').click()
  cy.findByTestId('date_of_birth').clear().type('1990-01-01')
  cy.get('.dc-checkbox__box').click()
  cy.findByText('Passport').click()
  cy.findByText('Submit passport photo pages').should('be.visible')
  cy.findByText('or upload photo – no scans or photocopies').click()
  cy.findByText('Upload passport photo page').should('be.visible')
  cy.c_uploadDocument()
  cy.findByText('Confirm').click()
  cy.findByText('Continue').click()
  cy.findByText('Take a selfie').should('be.visible')
  cy.get('.onfido-sdk-ui-Camera-btn').click()
  cy.findByText('Confirm').click()
  cy.c_uploadDocument()
  cy.findByRole('button', { name: 'Continue' }).click()
})

Cypress.Commands.add('c_financialAssessmentForm', () => {
  cy.get('select[name="income_source"]').select('Salaried Employee')
  cy.get('select[name="employment_status"]').select('Employed')
  cy.get('select[name="employment_industry"]').select('Construction')
  cy.get('select[name="occupation"]').select('Managers')
  cy.get('select[name="source_of_wealth"]').select('Cash Business')
  cy.get('select[name="education_level"]').select('Tertiary')
  cy.get('select[name="net_income"]').select('$25,000 - $50,000')
  cy.get('select[name="estimated_worth"]').select('$100,000 - $250,000')
  cy.get('select[name="account_turnover"]').select('Less than $25,000')
  cy.contains('button', 'Submit').should('be.enabled').click()
  cy.findByText('Financial assessment submitted successfully').should(
    'be.visible'
  )
})

Cypress.Commands.add('c_resetData', (options = {}) => {
  const { size = 'desktop' } = options
  cy.c_visitResponsive('/', { size: size })
  cy.c_visitBackOffice()
  cy.findByText('Client Management').click()
  cy.findByPlaceholderText('email@domain.com')
    .should('exist')
    .clear()
    .type(Cypress.env('credentials').test.masterUser.ID)
  cy.findByRole('button', { name: /View \/ Edit/i }).click()
  cy.get('.link').eq(1).should('be.visible').click()
  cy.get('input[name="last_name"]')
    .clear()
    .type(generateRandomName())
    .type('{enter}')
})

Cypress.Commands.add('c_uploadDocument', () => {
  cy.get('input[type=file]').selectFile(
    'cypress/fixtures/kyc/testDriversLicense.jpeg',
    { force: true }
  )
})

Cypress.Commands.add('c_verifyAccount', (options = {}) => {
  const { size = 'mobile' } = options
  const CPFDocumentNumber = generateCPFNumber()
  cy.get('select[name="document_type"]').select('CPF')
  cy.findByLabelText('Enter your document number')
    .type(CPFDocumentNumber)
    .should('have.value', CPFDocumentNumber)
  cy.get('.dc-checkbox__box').click()
  cy.findByRole('button', { name: 'Verify' }).click()
  cy.c_rateLimit({
    waitTimeAfterError: 15000,
    isLanguageTest: true,
    maxRetries: 6,
  })
  cy.c_closeNotificationHeader()
  cy.c_visitResponsive('/account/proof-of-identity', { size: size })
  cy.contains('ID verification passed').should('be.visible')
  cy.contains('a', 'Continue trading').should('be.visible')
})

Cypress.Commands.add('c_uploadDocument', () => {
  cy.get('input[type=file]').selectFile(
    'cypress/fixtures/kyc/testDriversLicense.jpeg',
    { force: true }
  )
})
