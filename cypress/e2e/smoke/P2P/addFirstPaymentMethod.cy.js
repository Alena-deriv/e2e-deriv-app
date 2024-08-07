import { generateAccountNumberString } from '../../../support/helper/utility'

let paymentName = 'PayPal'
let paymentID = generateAccountNumberString(12)

describe('QATEST-2821 - My Profile page : User add their first payment method', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage()
    cy.c_login({ user: 'p2pStandardAccountWithoutAds', size: 'mobile' })
  })

  it('Should be able to add first payment method on mobile.', () => {
    cy.c_navigateToP2P()
    cy.findByText('My profile').click()
    cy.findByText('Available Deriv P2P balance').should('be.visible')
    cy.findByText('Payment methods').should('be.visible').click()
    cy.findByText('Payment methods').should('be.visible')
    cy.c_deleteAllPM()
    cy.findByText('You haven’t added any payment methods yet').should(
      'be.visible'
    )
    cy.findByRole('button', { name: 'Add payment methods' })
      .should('be.visible')
      .click()
    cy.c_addPaymentMethod(paymentID, paymentName, 'fixed')
  })
})
