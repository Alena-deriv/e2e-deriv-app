let floatRate = 0.01
let minOrder = 1
let maxOrder = 10
let nicknameAndAmount = {
  sellerBalanceBeforeSelling: '',
  sellerBalanceAfterSelling: '',
  buyerBalanceBeforeBuying: '',
  buyerBalanceAfterBuying: '',
  buyer: '',
  seller: '',
  amount: '',
}
let fiatCurrency = 'USD'

let isSellAdUser = true
const loginWithNewUser = (userAccount, isSellAdUserAccount) => {
  Cypress.prevAppId = 0
  cy.c_login({ user: userAccount, rateLimitCheck: true, size: 'mobile' })
  isSellAdUser = isSellAdUserAccount
}

describe('QATEST-50478, QATEST-2709, QATEST-2542, QATEST-2769, QATEST-2610, QATEST-2791, QATEST-2800 - Advertise floating-type sell ad, search for advertiser and place buy order with same currency, confirm order with 2FA and give rating recommendation for both buyer and seller, Chat Functionality Active, Chat functionality Closed', () => {
  before(() => {
    cy.clearAllSessionStorage()
  })
  beforeEach(() => {
    if (isSellAdUser == true) {
      loginWithNewUser('p2pFloatingSellAd1', false)
    } else {
      loginWithNewUser('p2pFloatingSellAd2', true)
    }
  })
  it('Should be able to create sell type advert and verify all fields and messages for floating rate.', () => {
    cy.c_navigateToP2P()
    cy.findByText('My profile').should('be.visible').click()
    cy.findByText('Available Deriv P2P balance').should('be.visible')
    cy.c_getProfileName().then((name) => {
      nicknameAndAmount.seller = name
    })
    cy.c_getProfileBalance().then((balance) => {
      nicknameAndAmount.sellerBalanceBeforeSelling = balance
    })
    cy.c_clickMyAdTab()
    cy.c_createNewAd('sell')
    cy.c_inputAdDetails(floatRate, minOrder, maxOrder, 'Sell', 'float', {
      paymentMethod: 'Skrill',
    })
  })
  it('Should be able to place an order for advert and verify all fields and messages for floating rate.', () => {
    cy.c_navigateToP2P()
    cy.findByText('My profile').should('be.visible').click()
    cy.findByText('Available Deriv P2P balance').should('be.visible')
    cy.c_getProfileName().then((name) => {
      nicknameAndAmount.buyer = name
    })
    cy.c_getProfileBalance().then((balance) => {
      nicknameAndAmount.buyerBalanceBeforeBuying = balance
    })
    cy.then(() => {
      cy.c_createBuyOrder(
        nicknameAndAmount.seller,
        minOrder,
        maxOrder,
        fiatCurrency
      ).then((sendAmount) => {
        nicknameAndAmount.amount = sendAmount
      })
      cy.then(() => {
        cy.c_verifyOrderPlacementScreen(
          nicknameAndAmount.seller,
          sessionStorage.getItem('c_rateOfOneDollar'),
          sessionStorage.getItem('c_paymentMethods'),
          sessionStorage.getItem('c_sellersInstructions')
        )
      })
      cy.then(() => {
        cy.c_verifyPaymentConfirmationScreenContent(
          nicknameAndAmount.amount,
          nicknameAndAmount.seller
        )
        cy.c_uploadPOT('cypress/fixtures/P2P/orderCompletion.png')
        cy.findByText('Waiting for the seller to confirm').should('be.visible')
      })
    })
  })
  it("Should be able to confirm sell order from verification link, give rating to buyer and then confirm seller's balance.", () => {
    cy.c_navigateToP2P()
    cy.findByText('Orders').should('be.visible').click()
    cy.c_rateLimit({
      waitTimeAfterError: 15000,
      maxRetries: 5,
    })
    cy.c_confirmOrder(
      nicknameAndAmount,
      'buy',
      Cypress.env('credentials').test.p2pFloatingSellAd1.ID,
      { checkChat: 'true' }
    )
    cy.c_giveRating('buyer')
    cy.findByText('Completed').should('be.visible')
    cy.findByTestId('dt_mobile_full_page_return_icon')
      .should('be.visible')
      .click()
    cy.findByText('My profile').should('be.visible').click()
    cy.findByText('Available Deriv P2P balance').should('be.visible')
    cy.c_getProfileBalance().then((balance) => {
      nicknameAndAmount.sellerBalanceAfterSelling = balance
    })
    cy.then(() => {
      cy.c_confirmBalance(
        nicknameAndAmount.sellerBalanceBeforeSelling,
        nicknameAndAmount.sellerBalanceAfterSelling,
        maxOrder,
        'buyer',
        'buy'
      )
    })
  })
  it("Should be able to confirm buyer's balance and give rating to seller.", () => {
    cy.c_navigateToP2P()
    cy.findByText('My profile').should('be.visible').click()
    cy.findByText('Available Deriv P2P balance').should('be.visible')
    cy.c_getProfileBalance().then((balance) => {
      nicknameAndAmount.buyerBalanceAfterBuying = balance
    })
    cy.then(() => {
      cy.c_confirmBalance(
        nicknameAndAmount.buyerBalanceBeforeBuying,
        nicknameAndAmount.buyerBalanceAfterBuying,
        maxOrder,
        'seller',
        'buy'
      )
    })
    cy.findByText('Orders').should('be.visible').click()
    cy.findByRole('button', { name: 'Past orders' })
      .should('be.visible')
      .click()
    cy.findAllByText('Completed').eq(0).should('be.visible').click()
    cy.findByText('Buy USD order').should('be.visible')
    cy.findByText(nicknameAndAmount.seller).should('be.visible')
    cy.findByRole('button', { name: 'Rate this transaction' })
      .should('be.visible')
      .click()
    cy.findByText('How would you rate this transaction?').should('be.visible')
    cy.c_giveRating('seller')
    cy.c_validateBuyerSellerClosedChat()
  })
})
