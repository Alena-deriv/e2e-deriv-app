describe('QATEST-5729: CFDs - Create a Swap-free demo account using existing MT5 account password', () => {
  const sizes = ['mobile', 'desktop']
  let countryCode = 'co'

  beforeEach(() => {
    cy.c_createCRAccount({ country_code: countryCode })
    cy.c_login()
  })
  sizes.forEach((size) => {
    it(`Verify I can add a demo Swap-free account using exisiting MT5 derived account password on ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_visitResponsive('appstore/traders-hub', { size: size })
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
      cy.c_checkTradersHubHomePage(isMobile)
      cy.c_switchToDemo()
      if (isMobile) cy.findByRole('button', { name: 'CFDs' }).click()
      cy.findByTestId('dt_trading-app-card_demo_standard')
        .findByTestId('dt_platform-name')
        .should('have.text', 'Standard')
      cy.findByTestId('dt_trading-app-card_demo_standard')
        .findByRole('button', { name: 'Get' })
        .click()
      cy.findByText('Create a Deriv MT5 password').should('be.visible')
      cy.findByText(
        'You can use this password for all your Deriv MT5 accounts.'
      ).should('be.visible')
      cy.findByTestId('dt_mt5_password').type(
        Cypress.env('credentials').test.masterUser.PSWD,
        {
          log: false,
        }
      )
      cy.findByRole('button', { name: 'Create Deriv MT5 password' }).click()
      cy.findByRole('heading', { name: 'Success!' }).should('be.visible')
      cy.get('.dc-modal-body').should(
        'contain.text',
        'Success!Your demo Deriv MT5 Standard account is ready.'
      )
      cy.findByRole('button', { name: 'Continue' }).click()
      cy.findByTestId('dt_trading-app-card_demo_standard_svg')
        .findByTestId('dt_cfd-account-name')
        .should('have.text', 'Standard')
      cy.findByText('10,000.00 USD').should('be.visible')
      cy.findByRole('button', { name: 'Top up' }).should('exist')
      cy.findByTestId('dt_trading-app-card_demo_swap-free')
        .findByTestId('dt_platform-name')
        .should('have.text', 'Swap-Free')
      cy.findByTestId('dt_trading-app-card_demo_swap-free')
        .findByRole('button', { name: 'Get' })
        .click()
      cy.findByText('Enter your Deriv MT5 password').should('be.visible')
      cy.findByText(
        'Enter your Deriv MT5 password to add a MT5 Demo Swap-Free account.'
      ).should('be.visible')
      cy.findByRole('button', { name: 'Add account' }).should('be.disabled')
      cy.findByRole('button', { name: 'Forgot password?' }).should('be.visible')
      //Validate Bad Password
      cy.findByTestId('dt_mt5_password').type(
        Cypress.env('credentials').production.masterUser.PSWD,
        {
          log: false,
        }
      )
      cy.findByRole('button', { name: 'Add account' }).click()
      cy.findByText('That password is incorrect. Please try again.').should(
        'be.visible'
      )
      cy.findByText(
        'Hint: You may have entered your Deriv password, which is different from your Deriv MT5 password.'
      ).should('be.visible')
      cy.findByRole('button', { name: 'Add account' }).should('be.disabled')
      cy.findByRole('button', { name: 'Forgot password?' }).should('be.enabled')
      cy.findByTestId('dt_mt5_password').type(
        Cypress.env('credentials').test.mt5User.PSWD,
        {
          log: false,
        }
      )
      cy.findByRole('button', { name: 'Add account' }).click()
      cy.get('.dc-modal-body').should(
        'contain.text',
        'Success!Your demo Deriv MT5 Swap-Free account is ready.'
      )
      cy.findByRole('button', { name: 'Continue' }).click()
      cy.findByTestId('dt_trading-app-card_demo_swap-free_svg')
        .findByTestId('dt_cfd-account-name')
        .should('have.text', 'Swap-Free')
      cy.findAllByText('10,000.00 USD').eq(1).should('be.visible')
      cy.findAllByRole('button', { name: 'Top up' }).eq(1).should('exist')
      cy.findByTestId('dt_trading-app-card_demo_swap-free_svg')
        .findByRole('button', { name: 'Open' })
        .click({ force: true })
      cy.get('div.cfd-trade-modal-container')
        .findByText('Swap-Free')
        .should('be.visible')
      cy.get('div.cfd-trade-modal-container')
        .findByText('Demo')
        .should('be.visible')
      cy.get('div.cfd-trade-modal-container')
        .findByText('Deriv.com Limited')
        .should('be.visible')
    })
  })
})
