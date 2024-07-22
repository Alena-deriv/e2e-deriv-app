export const tradersHubPageLocators = {
  mobileLocators: {
    //mobileLocator1 : () => cy.findByTestId('abc')
    //mobileLocator2 : () => cy.findByTestId('xyz')
  },
  desktopLocators: {
    //commonDesktopLocator1 : () => cy.findByTestId('abc')
    //commonDesktopLocator2 : () => cy.findByTestId('xyz')
  },
  sharedLocators: {
    legacyAccountInfo: () => cy.get('.header__acc-info'),
    resetPasswordModal: () => cy.findByRole('dialog'),
    resetPasswordInputField: () =>
      cy.findByRole('dialog').findByLabelText('Create a password'),
    resetPasswordButton: () =>
      cy
        .findByRole('dialog')
        .findByRole('button', { name: 'Reset my password' }),
    mt5StandardDemoSignupCard: () =>
      cy.findByTestId('dt_trading-app-card_demo_standard'),
    mt5StandardDemoAccountCard: () =>
      cy.findByTestId('dt_trading-app-card_demo_standard_svg'),
    mt5FinancialDemoSignupCard: () =>
      cy.findByTestId('dt_trading-app-card_demo_financial'),
    mt5FinancialDemoAccountCard: () =>
      cy.findByTestId('dt_trading-app-card_demo_financial_svg'),
  },
}
