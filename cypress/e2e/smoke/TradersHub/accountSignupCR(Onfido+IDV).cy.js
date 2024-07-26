import { generateRandomNumber } from '../../../support/helper/commonJsUtility'
import { generateEpoch } from '../../../support/helper/utility'

describe('QATEST-24427,5533,5827 - Cypress test for ROW account sign up', () => {
  let nationalIDNumIDV
  const sizes = ['mobile', 'desktop']
  let countryIDV = Cypress.env('countries').KE
  let taxIDNumIDV = Cypress.env('taxIDNum').KE
  let countryOnfido = Cypress.env('countries').CO
  let nationalIDNumOnfido = Cypress.env('nationalIDNum').CO
  let taxIDNumOnfido = Cypress.env('taxIDNum').CO
  let currency = Cypress.env('accountCurrency').USD

  sizes.forEach((size) => {
    it(`New account sign up ROW - Onfido supported country on ${size}`, () => {
      const isMobile = size == 'mobile' ? true : false
      const signUpEmail = `sanity${generateEpoch()}onfido@deriv.com`
      cy.c_demoAccountSignup(countryOnfido, signUpEmail, { size: size })
      if (isMobile) cy.findByTestId('dt_dc_mobile_dialog_close_btn').click()
      else cy.findByTestId('dt_modal_close_icon').click()
      cy.findByText('Take me to Demo account').should('be.visible')
      cy.findByRole('button', { name: 'Yes' }).click()
      cy.findByText('Add a Deriv account').should('not.exist')
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')
      cy.findByTestId('dt_dropdown_display').click()
      cy.get('#real').click()
      cy.findByText('Add a Deriv account').should('be.visible')
      cy.c_generateRandomName().then((firstName) => {
        cy.c_personalDetails(
          firstName,
          'Onfido',
          countryOnfido,
          nationalIDNumOnfido,
          taxIDNumOnfido,
          currency,
          { isMobile: isMobile }
        )
      })
      cy.c_addressDetails()
      cy.c_completeFatcaDeclarationAgreement()
      cy.c_addAccount()
      cy.c_checkTradersHubHomePage(isMobile)
      cy.c_closeNotificationHeader()
      cy.c_manageAccountsetting(countryOnfido, {
        isMobile: isMobile,
      })
    })
  })
  sizes.forEach((size) => {
    it(`New account sign up ROW - IDV supported country on ${size}`, () => {
      nationalIDNumIDV = generateRandomNumber()
      const isMobile = size == 'mobile' ? true : false
      const signUpEmail = `sanity${generateEpoch()}idv@deriv.com`
      cy.c_demoAccountSignup(countryIDV, signUpEmail, { size: size })
      if (isMobile) cy.findByTestId('dt_dc_mobile_dialog_close_btn').click()
      else cy.findByTestId('dt_modal_close_icon').click()
      cy.findByText('Take me to Demo account').should('be.visible')
      cy.findByRole('button', { name: 'No' }).click()
      cy.findByText('Add a Deriv account').should('be.visible')
      cy.c_generateRandomName().then((firstName) => {
        cy.c_personalDetails(
          firstName,
          'IDV',
          countryIDV,
          nationalIDNumIDV,
          taxIDNumIDV,
          currency,
          { isMobile: isMobile }
        )
      })
      cy.c_addressDetails()
      cy.c_completeFatcaDeclarationAgreement()
      cy.c_addAccount()
      cy.findAllByTestId('dt_balance_text_container').should('have.length', '2')

      cy.c_checkTradersHubHomePage(isMobile)
      cy.c_closeNotificationHeader()
      cy.c_manageAccountsetting(countryIDV, {
        isMobile: isMobile,
        isIDV: true,
      })
    })
  })
})
