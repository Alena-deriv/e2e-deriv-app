describe('QATEST-20010 Withdrawal Request: Fiat - Different language', () => {
  beforeEach(() => {
    cy.clearAllCookies()
    cy.clearAllLocalStorage()
    cy.c_login({
      user: 'cashierWithdrawal',
      backEndProd: true,
      rateLimitCheck: true,
    })
    cy.fixture('cashierLegacy/withdrawalLanguageContent').as('languageDetails')
  })
  it(`should verify withdrawal request page with different languages for mobile screen size`, () => {
    cy.get('@languageDetails').then((languageDetails) => {
      cy.c_visitResponsive(
        `appstore/traders-hub?lang=${languageDetails.english.urlCode}`,
        {
          rateLimitCheck: true,
          size: 'mobile',
        }
      )
      cy.c_visitResponsive(
        `cashier/withdrawal/?lang=${languageDetails.english.urlCode}`,
        {
          rateLimitCheck: true,
          size: 'mobile',
        }
      )
      cy.c_loadingCheck()
      sessionStorage.setItem('c_prevLanguage', languageDetails.english.urlCode)
      const languageDetailsArray = Object.entries(languageDetails)
      const randomIndex = Math.floor(Math.random() * 4)
      cy.c_checkWithdrawalScreen(languageDetailsArray[randomIndex], {
        size: 'mobile',
      })
      cy.c_checkWithdrawalScreen(languageDetailsArray[4], { size: 'mobile' })
    })
  })
  it(`should verify withdrawal request page with different languages for desktop screen size`, () => {
    cy.get('@languageDetails').then((languageDetails) => {
      cy.c_visitResponsive(
        `cashier/withdrawal/?lang=${languageDetails.english.urlCode}`,
        {
          rateLimitCheck: true,
          size: 'desktop',
        }
      )
      cy.then(() => {
        if (sessionStorage.getItem('c_rateLimitOnVisitOccured') == 'true') {
          cy.reload()
          sessionStorage.removeItem('c_rateLimitOnVisitOccured')
        }
      })
      cy.c_loadingCheck()
      sessionStorage.setItem('c_prevLanguage', languageDetails.english.urlCode)
      const languageDetailsArray = Object.entries(languageDetails)
      const randomIndex = Math.floor(Math.random() * 4)
      cy.c_checkWithdrawalScreen(languageDetailsArray[randomIndex], {
        size: 'desktop',
      })
      cy.c_checkWithdrawalScreen(languageDetailsArray[4], { size: 'desktop' })
    })
  })
})
