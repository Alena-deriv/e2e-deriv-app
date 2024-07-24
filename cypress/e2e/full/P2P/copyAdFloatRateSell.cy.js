let floatRate = 0.01
let minOrder = 6
let maxOrder = 10

describe('QATEST-145658 - Copy Ad - Float Rate - Sell Ad', () => {
  beforeEach(() => {
    cy.c_login({
      user: 'p2pCopyAdFloatRateSellAd',
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
        cy.c_inputAdDetails(floatRate, minOrder, maxOrder, 'Sell', 'float')
      }
      cy.c_getExistingAdDetailsForValidation('sell', 'float')
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
          null,
          { floatRate: 'true' }
        )
        cy.c_deleteCopiedAd()
      })
    })
  })
})
