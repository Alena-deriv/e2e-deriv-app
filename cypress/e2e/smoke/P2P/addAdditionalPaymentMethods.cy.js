import { generateAccountNumberString } from '../../../support/helper/utility'

let paymentName = 'Alipay'
let paymentID = generateAccountNumberString(12)
let additionalPaymentName = 'Other'
let additionalPaymentID = generateAccountNumberString(12)

describe('QATEST-2811 - My profile page - User with existing payment method add new payment method', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage()
    cy.c_login({ user: 'p2pStandardAccountWithoutAds', size: 'mobile' })
  })

  it('Should be able to add additional payment method on mobile.', () => {
    cy.c_navigateToP2P()
    cy.findByText('My profile').click()
    cy.findByText('Available Deriv P2P balance').should('be.visible')
    cy.findByText('Payment methods').should('be.visible').click()
    cy.findByText('Payment methods').should('be.visible')
    cy.findByRole('button').should('exist').and('contain.text', 'Add').click()
    cy.c_addPaymentMethod(paymentID, paymentName, 'fixed')
    cy.findByRole('button').should('exist').and('contain.text', 'Add').click()
    cy.c_addPaymentMethod(additionalPaymentID, additionalPaymentName, 'fixed')
    cy.c_deletePaymentMethod(paymentID, paymentName)
    cy.c_deletePaymentMethod(additionalPaymentID, additionalPaymentName)
  })
})
