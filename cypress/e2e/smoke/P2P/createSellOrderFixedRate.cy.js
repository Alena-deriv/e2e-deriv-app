let fixedRate = 1.21
let minOrder = 1
let maxOrder = 10
const pm1 = 'Bank Transfer'
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

describe('QATEST-2561 - Place a Sell Order same currency ads - Fixed Rate', () => {
  before(() => {
    cy.clearAllSessionStorage()
  })
  beforeEach(() => {
    if (isSellAdUser == true) {
      loginWithNewUser('p2pFixedRatePK1', false)
    } else {
      loginWithNewUser('p2pFixedRatePK2', true)
    }
  })
  it('Should be able to create buy type advert and verify all fields and messages for fixed rate.', () => {
    cy.c_navigateToP2P()
    cy.findByText('My profile').should('be.visible').click()
    cy.findByText('Available Deriv P2P balance').should('be.visible')
    cy.c_getProfileName().then((name) => {
      nicknameAndAmount.buyer = name
    })
    cy.c_getProfileBalance().then((balance) => {
      nicknameAndAmount.buyerBalanceBeforeBuying = balance
    })
    cy.c_clickMyAdTab()
    cy.c_createNewAd('buy')
    cy.c_inputAdDetails(fixedRate, minOrder, maxOrder, 'Buy', 'fixed')
  })
  it('Should be able to place a sell order for cross border advert for fixed rate.', () => {
    cy.c_navigateToP2P()
    cy.findByText('My profile').should('be.visible').click()
    cy.findByText('Available Deriv P2P balance').should('be.visible')
    cy.c_getProfileName().then((name) => {
      nicknameAndAmount.seller = name
    })
    cy.c_getProfileBalance().then((balance) => {
      nicknameAndAmount.sellerBalanceBeforeSelling = balance
    })
    cy.wait(2000) // Give buffer before creating order
    cy.then(() => {
      cy.c_createSellOrder(
        nicknameAndAmount.buyer,
        minOrder,
        maxOrder,
        fiatCurrency,
        pm1,
        'sell',
        'fixed'
      )
    })
    cy.c_waitForPayment()
  })
  it("Should be able to click on I've Paid and provide the POT attachment.", () => {
    cy.c_navigateToP2P()
    cy.findByText('Orders').should('be.visible').click()
    cy.c_rateLimit({
      waitTimeAfterError: 15000,
      maxRetries: 5,
    })
    cy.then(() => {
      cy.findByText('Pay now').should('be.visible').click()
      cy.wait(2000) // verify "I've paid" button in the page
      cy.findByRole('button', { name: "I've paid" }).should('be.visible')
      cy.findByText('Send')
        .next('span')
        .invoke('text')
        .then((sendAmount) => {
          nicknameAndAmount.amount = sendAmount.trim()
        })
        .then(() => {
          cy.findByRole('button', { name: "I've paid" }).click()
          cy.c_uploadPOT('cypress/fixtures/P2P/orderCompletion.png')
          cy.findByText('Waiting for the seller to confirm').should(
            'be.visible'
          )
          cy.findByText(
            "Don't risk your funds with cash transactions. Use bank transfers or e-wallets instead."
          ).should('be.visible')
        })
    })
  })
  it("Should be able to see I've Received Button and confirm the payment.", () => {
    cy.c_navigateToP2P()
    cy.findByText('Orders').should('be.visible').click()
    cy.c_rateLimit({
      waitTimeAfterError: 15000,
      maxRetries: 5,
    })
    cy.c_confirmOrder(
      nicknameAndAmount,
      'sell',
      Cypress.env('credentials').test.p2pFixedRatePK2.ID
    )
    cy.c_giveRating('buyer')
    cy.findByText('Completed').should('be.visible')
    cy.findByTestId('dt_page_overlay_header_close').click()
    cy.c_navigateToP2P()
    cy.findByText('My profile').should('be.visible').click()
    cy.findByText('Available Deriv P2P balance').should('be.visible')
    cy.c_getProfileBalance().then((balance) => {
      nicknameAndAmount.sellerBalanceAfterSelling = balance
    })
    cy.then(() => {
      cy.c_confirmBalance(
        nicknameAndAmount.sellerBalanceBeforeSelling,
        nicknameAndAmount.sellerBalanceAfterSelling,
        minOrder,
        'seller',
        'sell'
      )
    })
  })
  it('Should be able to verify completed order for buyer.', () => {
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
        minOrder,
        'buyer',
        'sell'
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
  })
})
