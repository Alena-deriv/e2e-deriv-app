let fixedRate = 1.25
let minOrder = 6
let maxOrder = 10

describe('QATEST-145642 - Copy Ad - Fixed Rate - Sell Ad', () => {
  beforeEach(() => {
    cy.c_login({
      user: 'p2pCopyAdFixedRateSellAd',
      rateLimitCheck: true,
      size: 'mobile',
    })
  })

  it('Should be able to copy an already existing sell type advert successfully.', () => {
    cy.c_navigateToP2P()
    cy.c_clickMyAdTab()
    cy.c_checkForExistingAds().then((adExists) => {
      if (adExists == false) {
        cy.c_createNewAd('sell')
        cy.c_inputAdDetails(fixedRate, minOrder, maxOrder, 'Sell', 'fixed')
      }
      cy.c_getExistingAdDetailsForValidation('Sell', 'fixed')
      cy.then(() => {
        cy.get('.wizard__main-step').prev().children().last().click()
        cy.contains('span[class="dc-text"]', 'Sell USD')
          .siblings('.dc-dropdown-container')
          .should('be.visible')
          .click()
        cy.findByText('Copy').parent().click()
        cy.c_copyExistingAd(
          sessionStorage.getItem('c_offerAmount'),
          sessionStorage.getItem('c_rateValue'),
          sessionStorage.getItem('c_instructions'),
          sessionStorage.getItem('c_orderCompletionTime'),
          sessionStorage.getItem('c_contactInfo')
        )
        cy.c_deleteCopiedAd()
      })
    })
  })
})
