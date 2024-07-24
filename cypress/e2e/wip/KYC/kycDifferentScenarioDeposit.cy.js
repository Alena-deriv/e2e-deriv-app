import { getCurrentDate } from '../../../support/helper/utility'
const CURRENT_DATE = getCurrentDate()
describe('QATEST-4745 Trigger KYC check in different scenarios.', () => {
  beforeEach(() => {
    cy.c_login({ user: 'kycUserWithFundsCR' })
  })
  it('Depositing more than 200$ for CR client, should trigger for POI/POA .', () => {
    /* check that you won't be able to do transfer from CR more than 250$ will ask for POI and POA */
    cy.c_visitResponsive('/cashier/', { size: 'mobile' })
    cy.get('#dt_mobile_drawer_toggle').click()
    cy.contains('Cashier').click()
    cy.contains('Transfer').click()
    cy.findByTestId('dt_converter_from_amount_input').type('250', {
      timeout: 3000,
    })
    cy.findByRole('button', { name: 'Transfer' }).click()
    cy.findByText(
      'You have exceeded 200.00 USD in cumulative transactions. To continue, you will need to verify your identity.'
    )
    /*
    Note: We have not included the tests to cover submission of POI and POA since this is a startic account.
    This test will check if POI and POA gets triggered if we attempt to make a transfer of more than 200 $
    */
  })
})
