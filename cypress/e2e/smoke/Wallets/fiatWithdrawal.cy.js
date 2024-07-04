Cypress.Commands.add(
  'c_verifyWalletsWithdrawalScreenContentAfterLink',
  (platform) => {
    let verification_url = Cypress.env('verificationUrl')
    const code = verification_url.match(/code=([A-Za-z0-9]{8})/)
    const verification_code = code[1]
    if (`${platform}` == `mobile`) {
      cy.c_visitResponsive(
        `/wallet/withdrawal?verification=${verification_code}`,
        'small'
      )
    } else {
      cy.c_visitResponsive(
        `/wallet/withdrawal?verification=${verification_code}`,
        'large'
      )
    }
    cy.c_loadingCheck()
    cy.c_rateLimit({ waitTimeAfterError: 15000, maxRetries: 5 })
    cy.c_skipPasskeysV2()
    cy.get('iframe[class=wallets-withdrawal-fiat__iframe]').should('be.visible')
    cy.get('iframe.wallets-withdrawal-fiat__iframe').then(($iframe) => {
      const iframe = $iframe.contents()
      cy.wrap(iframe).find('#prCurrentBalance').should('be.visible')
      cy.wrap(iframe).find('#prPayoutReview').should('be.visible')
      cy.wrap(iframe).find('#prAvailableBalance').should('be.visible')
      if (iframe.find('#payoutoptions').length > 0) {
        cy.wrap(iframe).find('#payoutoptions').should('be.visible') // information message when payment option is available
        cy.wrap(iframe).find('#amountTooltip').should('be.visible')
        cy.wrap(iframe).find('.paymentmethodarea').should('be.visible')
      } else {
        cy.wrap(iframe).find('#noPayoutOptionsMsg').should('be.visible') // information message when payment option is not available
      }
    })
  }
)
function performFiatWithdraw() {
  cy.c_skipPasskeysV2()
  cy.findByText('Withdraw').parent().click()
  cy.findByText('Confirm your identity to make a withdrawal.').should(
    'be.visible'
  )
  if (cy.findByRole('button', { name: 'Send email' }).should('be.visible')) {
    cy.findByRole('button', { name: 'Send email' })
      .should('be.enabled')
      .wait(500)
    cy.findByRole('button', { name: 'Send email' }).click({ force: true })
  }
  cy.findByText("We've sent you an email.")
  cy.c_emailVerification(
    '-CustomerIO_request_payment_withdraw.html',
    Cypress.env('credentials').test.walletloginEmail.ID,
    'QA script',
    {
      baseUrl: Cypress.env('configServer') + '/events',
    }
  )
}

describe('QATEST-98812 - Fiat withdrawal access iframe from email verification link', () => {
  //Prerequisites: Fiat wallet account in backend prod staging with USD wallet
  beforeEach(() => {
    cy.c_login({ user: 'walletloginEmail' })
  })

  it('should be able to access doughflow iframe', () => {
    cy.log('Access Fiat Withdrawal Iframe Through Email Link')
    cy.c_visitResponsive('/', 'large')
    cy.c_skipPasskeysV2()
    cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
    cy.c_skipPasskeysV2()
    cy.c_rateLimit({ waitTimeAfterError: 15000, maxRetries: 5 })
    performFiatWithdraw()
    cy.c_verifyWalletsWithdrawalScreenContentAfterLink('desktop')
  })
  it('should be able to access doughflow iframe in responsive', () => {
    cy.log('Access Fiat Withdrawal Iframe Through Email Link')
    cy.c_visitResponsive('/', 'small')
    cy.c_WaitUntilWalletsPageIsLoaded()
    cy.c_skipPasskeysV2()
    cy.c_rateLimit({ waitTimeAfterError: 15000, maxRetries: 5 })
    performFiatWithdraw()
    cy.c_verifyWalletsWithdrawalScreenContentAfterLink('mobile')
  })
})
