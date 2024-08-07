let fixedRate = 1.25
let minOrder = 5
let maxOrder = 10

describe('QATEST-2469 - Edit Advert Details - Fixed Rate', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage()
    cy.clearAllSessionStorage()
    cy.c_login({ user: 'p2pFixedRate', size: 'mobile' })
  })
  it('Should be able to edit sell type advert and verify all fields and messages for fixed rate.', () => {
    cy.c_navigateToP2P()
    cy.c_clickMyAdTab()
    cy.c_createNewAd('sell')
    cy.c_inputAdDetails(fixedRate, minOrder, maxOrder, 'Sell', 'fixed', {
      paymentMethod: 'Skrill',
    })
    cy.c_editAdAndVerify('sell', minOrder, maxOrder, 'fixed')
  })
  it('Should be able to edit buy type advert and verify all fields and messages for fixed rate.', () => {
    cy.c_navigateToP2P()
    cy.c_clickMyAdTab()
    cy.c_createNewAd('buy')
    cy.c_inputAdDetails(fixedRate, minOrder, maxOrder, 'Buy', 'fixed')
    cy.c_editAdAndVerify('buy', minOrder, maxOrder, 'fixed')
  })
})
