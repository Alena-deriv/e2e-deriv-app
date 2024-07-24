import { getCurrentDate } from '../../../support/helper/utility'
const CURRENT_DATE = getCurrentDate()

describe('QATEST-4880 Types of cashier lock when POI expired - MF account', () => {
  beforeEach(() => {
    cy.c_createMFAccount({ country_code: 'de' })
    cy.c_login()
    cy.c_navigateToPoiResponsive('Germany')
  })

  it('Should have cashier lock when POI expire for MF.', () => {
    /* Submit POI */
    cy.c_submitOnfidoPoiPage()
    cy.c_waitUntilElementIsFound({
      cyLocator: () => cy.findByText('Your proof of identity is verified'),
      timeout: 4000,
      maxRetries: 5,
    })

    /* Submit POA */
    cy.c_navigateToPoaResponsive()
    cy.c_submitPoa()

    /* Create MT5 account */
    cy.c_visitResponsive('/', 'small')
    cy.findByRole('button', { name: 'CFDs' }).click()
    cy.contains('button', 'Get').click()
    cy.findByText('Malta').should('be.visible').click()
    cy.get('.dc-checkbox__box').click()
    cy.findByTestId('dt_modal_footer').contains('button', 'Next').click()
    cy.findByTestId('dt_mt5_password').type(
      Cypress.env('credentials').test.mt5User.PSWD
    )
    cy.contains('button', 'Create Deriv MT5 password').click()

    /* Visit BO */
    cy.c_visitBackOffice({ login: true })
    cy.findByText('Client Management').click()
    cy.findByPlaceholderText('email@domain.com')
      .should('exist')
      .clear()
      .type(Cypress.env('credentials').test.masterUser.ID)
    cy.findByRole('button', { name: /View \/ Edit/i }).click()
    cy.get('.link').eq(1).should('be.visible').click()
    cy.get('#documents_wrapper table tbody tr td input[type="checkbox"]')
      .first()
      .should('exist')
      .check()
    cy.findByRole('button', { name: /Verify Checked Files/i }).click()
    cy.get('select[name="client_authentication"]')
      .select('Authenticated with scans')
      .type('{enter}')
    cy.get(
      '#documents_wrapper table tbody tr td input[name^="expiration_date_"]'
    )
      .clear()
      .type('2021-09-20')
    cy.get('input[value="Save client details"]').last().click()
    /* Check for cashier lock in BO */
    cy.contains('Cashier is locked').should('not.exist')
    cy.contains('POI has expired').should('be.visible')
    /* Check cashier lock on FE */
    cy.c_visitResponsive('/cashier/deposit', 'small')
    cy.contains('Cashier is locked').should('be.visible')
    cy.contains(
      'The identification documents you submitted have expired. Please submit valid identity documents to unlock Cashier.'
    ).should('be.visible')

    /* Check that user can still continue trading */
    cy.c_visitResponsive('/', 'small')
    cy.findByRole('button', { name: 'Multipliers' }).click()
    cy.findByRole('button', { name: 'Open' }).click()
    cy.get('div.cq-symbol-select-btn')
      .find('span.ic-icon.cq-symbol-dropdown')
      .click()
    cy.contains('div.sc-mcd__item__name', 'AUD/JPY').click()
    cy.get('#dt_purchase_multdown_button').should('be.visible')

    /* Check for cashier lock won't be able to do some transfers to MT5 */
    cy.get('svg.dc-icon.header__mobile-drawer-icon').click()
    cy.findByText('Cashier').click()
    cy.findByText('Transfer').click()
    cy.contains(
      'The identification documents you submitted have expired. Please submit valid identity documents to unlock Cashier. '
    ).should('be.visible')
  })
})
