function addcryptowallet(platform) {
  cy.get('.wallets-add-more__carousel-wrapper')
    .find('button')
    .then((buttons) => {
      const buttoncount = buttons.filter(
        (index, button) => Cypress.$(button).text().trim() === 'Add'
      ).length // To get the exact match of the text
      cy.log(`Number of buttons": ${buttoncount}`)
      if (buttoncount > 0) {
        cy.log('Button with text "Add" found')
        for (let i = buttoncount; i > 0; i--) {
          cy.findByTestId('dt-wallets-add-more').scrollIntoView()
          cy.get('.wallets-add-more__banner')
            .first({ timeout: 3000 })
            .should('be.visible')
          let walletname
          cy.wait(5000) // this wait is needed as text updated with a slight delay that should be fixed in next phase
          cy.get('.wallets-add-more__content')
            .eq(0)
            .find('span')
            .eq(0)
            .invoke('text')
            .then((text) => {
              walletname = text.trim()
              cy.get('.wallets-add-more__card')
                .eq(0)
                .find('button')
                .click({ force: true })
              cy.findByRole('button', { name: 'Deposit' }).should('exist')
              cy.findByRole('button', { name: 'Maybe later' }).should('exist')
              if ((buttoncount - i) % 2 === 0) {
                cy.findByRole('button', { name: 'Deposit' }).click({
                  force: true,
                })
                cy.findByText(walletname).should('be.visible')
                cy.findByText('Deposit').should('be.visible')
                cy.findByText('Transaction status').should('be.visible')
                cy.findByText(/To avoid loss of funds/).should('be.visible')
                cy.findByTestId('dt_legacy_copy_icon').click({ force: true })
                if (`${platform}` == `desktop`) {
                  cy.findByText('Copied!').should('be.visible')
                }
                cy.findByText('Try Fiat onramp').should('be.visible')
                if (`${platform}` == `mobile`) {
                  cy.findByTestId('dt_close_btn').click({ force: true })
                } else {
                  cy.findByText("Trader's Hub").click()
                }
              } else {
                cy.findByRole('button', { name: 'Maybe later' }).click({
                  force: true,
                })
                cy.wait(3000)
                cy.findAllByText(`${walletname}`).eq(0).should('exist')
              }
              cy.findByTestId('dt-wallets-add-more').scrollIntoView()
              cy.get('[class*="wallets-add-more__content"]')
                .contains(walletname)
                .parent()
                .parent()
                .find('button', { timeout: 15000 })
                .then((button) => {
                  expect(button).to.contain('Added')
                })
              if (`${platform}` == `desktop`) {
                checkWalletAccountSwitcher(walletname)
              }
            })
        }
      } else {
        cy.fail('All wallets are already added')
      }
    })
}
function checkWalletAccountSwitcher(walletname) {
  cy.get('.wallets-listcard-dropdown', { timeout: 10000 })
    .scrollIntoView()
    .should('be.visible')
  cy.get('.wallets-listcard-dropdown').click()
  cy.contains(`${walletname}`).should('exist')
}
const size = ['mobile', 'desktop']
size.forEach((size) => {
  describe(`QATEST-98773 - Add crypto wallet account on ${size}`, () => {
    beforeEach(() => {
      cy.c_createCRAccount({ country_code: 'aq' })
      cy.c_login()
      cy.c_migratetoWallet({ size: size })
    })

    it('should be able to add more wallets', () => {
      cy.c_visitResponsive('/', { size: 'desktop' })
      addcryptowallet(size)
    })
  })
})
