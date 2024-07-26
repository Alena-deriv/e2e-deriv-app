/**
 * This file is still work in progress to remove Payment method
 * Currently not needed for test.
 */

Cypress.Commands.add(
  'c_visitCashierBackOffice',
  (endpoint = `/default.asp`) => {
    cy.viewport('macbook-16')
    cy.visit(`${Cypress.env('cashierBoUrl')}${endpoint}`, {
      auth: {
        username: Cypress.env('cashierBoLogin'),
        password: Cypress.env('cashierBoPassword'),
      },
    })
  }
)

Cypress.Commands.add('c_checkForRecords', (options = {}) => {
  const {
    retryCount = 1,
    maxRetries = 3,
    retryWaitTime = 1000,
    recordType = 'record',
    sessionVariable = 'c_recordAlreadyExists',
  } = options
  cy.document().then((doc) => {
    let noRecordMessage = doc.querySelector('.alertnote')
    if (noRecordMessage) {
      cy.log(`No ${recordType} Found`)
      sessionStorage.setItem(sessionVariable, false)
    } else if (retryCount <= maxRetries) {
      cy.log(
        `retrying in ${retryWaitTime / 1000}s... Attempt number: ${retryCount}`
      )
      cy.wait(retryWaitTime, { log: false })
      cy.c_checkForRecords({ ...options, retryCount: retryCount + 1 })
    } else {
      cy.log(`${recordType} Found`)
      sessionStorage.setItem(sessionVariable, true)
    }
  })
})

Cypress.Commands.add('c_removePaymentMethodFromCashierBO', (options = {}) => {
  const {
    creditCard = Cypress.env('cashierCreditCard'),
    isWallet = false,
    server = 'Test', // Options: 'Test', 'QAXX'
    company = '(SVG) LLC', // Options: '(SVG) LLC', 'Investments Ltd', '(DSL) Ltd'
    currency = 'USD', // Options: 'USD', 'AUD', 'GBP', 'EUR', 'ADA', 'BNB', 'XRP'
  } = options
  let endpoint = '/customer/search.asp'
  let sessionVariable = 'c_paymentMethodAlreadyExists'
  let recordType = 'Payment Method'
  let maskedCreditCard =
    creditCard.slice(0, 6) + '******' + creditCard.slice(12)
  let frontEnd = `${server} ${company} ${currency} [${currency}]`
  if (isWallet) frontEnd = `${server} ${company} WLT ${currency} [${currency}]`
  cy.c_visitCashierBackOffice(endpoint)
  cy.get('select[id="SbookID"]').select(frontEnd)
  cy.findByRole('button', { name: 'Go' }).click()
  cy.get('select[id="Criteria"]').select('Payment Method & Account ≫')
  cy.get('input[id="AccountIdentifier"]').type(maskedCreditCard)
  cy.get('input[id="GlobalReporting"]').check({ force: true })
  cy.findByRole('button', { name: 'Search' }).click()
  cy.c_checkForRecords({
    sessionVariable,
    recordType,
  })
  cy.then(() => {
    if (sessionStorage.getItem('c_paymentMethodAlreadyExists') == 'true') {
      cy.log('Deleting Duplicate Payment Method')
      cy.get('table[id="tblSearchResults"] tbody').within(() => {
        cy.get('tr').each((record) => {
          cy.wrap(record).within(() => {
            cy.findByText(maskedCreditCard).should('be.visible')
          })
        })
        cy.findAllByText(`${server} ${company} ${currency}`).eq(0).click()
      })
      cy.findByRole('button', { name: 'Methods' }).click()
      cy.pause()
      cy.get('button[title="Delete Entry..."]').click()
      cy.pause()
      cy.frameLoaded('#iRuleContent')
      cy.enter('#iRuleContent').then((getBody) => {
        getBody().find('button[id="OkBtn"]').click()
      })
      cy.enter('#iRuleContent').then((getBody) => {
        getBody().find('.jBox-Confirm-button-submit').click()
      })
      cy.findByText('No records found.').should('be.visible')
    }
  })
})
