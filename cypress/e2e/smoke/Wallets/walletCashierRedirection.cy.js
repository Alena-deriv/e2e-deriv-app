describe('QATEST-139905 - Mobile wallet card redirection', () => {
  beforeEach(() => {
    cy.c_login({ user: 'walletloginEmail', app: 'wallets', size: 'mobile' })
  })
  it('should be able to switch and open deposit, withdraw and transfer in all the available wallets in Mobile', () => {
    switchAllAvailableWallets()
  })
})

//This function switches to all available wallets sequentially and visits Deposit, Withdrawal, Transfer pages(except demo wallet).

function switchAllAvailableWallets() {
  let walletText
  const performActionsOnElement = (currentIndex, totalElements) => {
    if (currentIndex >= totalElements) {
      return
    }
    cy.get('@allWallets')
      .eq(currentIndex)
      .click()
      .then(() => {
        cy.get('.wallets-card__carousel-content-details')
          .eq(currentIndex)
          .find('.wallets-card__details-bottom')
          .invoke('text')
          .then((text) => {
            walletText = text.trim().split(' ').slice(0, 1).join(' ') //Fetching expected wallet name.
            cy.log(`Text found in wallet details: ${walletText}`)
          })
        const actions = ['deposit', 'withdrawal', 'account-transfer'] //The actions to be performed for each wallet.
        let actionChain = Cypress.Promise.resolve()
        actions.forEach((action) => {
          actionChain = actionChain
            .then(() => {
              return cy
                .get('.wallets-mobile-actions__container')
                .scrollIntoView()
                .find('.wallets-mobile-actions')
                .find(`button[aria-label="${action}"]`)
                .click({ force: true })
            })
            .then(() => {
              return cy
                .get('.wallets-cashier-header')
                .invoke('text')
                .should((headerText) => {
                  expect(
                    headerText.trim().split(' ').slice(0, 1).join(' ')
                  ).to.include(walletText) //Expected wallet name validation
                })
                .then(() => {
                  cy.get('.wallets-cashier-header__close-icon').click()
                })
            })
        })

        actionChain.then(() => {
          performActionsOnElement(currentIndex + 1, totalElements)
        })
      })
  }

  cy.get(
    '.wallets-progress-bar-active.wallets-progress-bar-transition, .wallets-progress-bar-inactive.wallets-progress-bar-transition'
  ).as('allWallets') //Fetching all active and in-active wallets as an alias as they keep changing every time wallet switch happens.

  cy.get('@allWallets').then(($elements) => {
    performActionsOnElement(0, $elements.length - 1) // using -1 to skip demo account as temp solution.
  })
}
