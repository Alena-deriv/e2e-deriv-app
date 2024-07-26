const depositAmount = (Math.random() * (50 - 10 + 1) + 10).toFixed(2) // random number between 10 to 50
const sizes = ['mobile', 'desktop']
let withdrawalLink, calculatedBalance

sizes.forEach((size) => {
  describe(`QATEST-19928, QATEST-19950 - Deposit: Perform Deposit for Fiat account using Credit Card, Withdrawal: Perform Withdrawal for Fiat account to Credit Card`, () => {
    beforeEach(() => {
      cy.c_login({
        user: 'cashierLegacyDoughflow',
        rateLimitCheck: true,
        size: size,
      })
      cy.intercept('https://doughflow-test.4x.my/Cashier/CC_Deposit.asp').as(
        'depositComplete'
      )
      cy.intercept('https://doughflow-test.4x.my/Cashier/PayoutRequest.asp').as(
        'payoutRequest'
      )
      cy.intercept('https://doughflow-test.4x.my/Cashier/PayoutDetails.asp').as(
        'payoutDetails'
      )
      cy.fixture('cashierLegacy/withdrawalLanguageContent').as(
        'languageDetails'
      )
    })
    it(`should perform credit card deposit using doughflow. Screen size: ${size}`, () => {
      cy.c_getCurrentCurrencyBalance()
      cy.c_visitResponsive('/cashier/deposit', { size: size })
      cy.c_loadingCheck()
      cy.findByText('Deposit via the following payment methods:')
        .should('be.visible')
        .click()
      cy.c_loadingCheck()
      cy.frameLoaded('.deposit-fiat-iframe__iframe')
      cy.enter('.deposit-fiat-iframe__iframe').then((getBody) => {
        getBody().find('#exp_CreditCard').next('a').click({ force: true })
      })
      cy.wait(3000) //cannot avoid this wait as waiting for all 244 APis to complete causes cypress to slow down and take more then a minute.
      cy.frameLoaded('.deposit-fiat-iframe__iframe', { timeout: 60000 })
      cy.enter('.deposit-fiat-iframe__iframe', { timeout: 120000 }).then(
        (getBody) => {
          getBody()
            .find('#cardnumber')
            .clear()
            .type(Cypress.env('cashierCreditCard'))
          getBody().find('#cardexp').clear().type('10/2026')
          getBody().find('#CVV').clear().type(Cypress.env('cashierCvvApprove'))
          getBody().find('#convertedamount').clear().type(depositAmount)
          getBody().find('#SubmitBtn').click()
        }
      )
      if (size == 'mobile') {
        cy.findByTestId('dt_themed_scrollbars').scrollTo('top')
      }
      cy.wait('@depositComplete', { timeout: 30000 })
      cy.wait(500) //Needed because after the API is completed UI takes some time to to load Iframe
      cy.enter('.deposit-fiat-iframe__iframe', { timeout: 90000 }).then(
        (getBody) => {
          getBody()
            .find('.formheader')
            .should('contain.text', '\n\t\tTransaction Approved\n\t')
          getBody()
            .find('#cmBalance .balanceamount')
            .then((val) => {
              const regex = /[\$\£\€]\s*([\d,]+\.\d{2})\s*(USD|GBP|AUD|EUR)/
              const match = val.text().trim().match(regex)
              const extractedBalance = match ? `${match[1]} ${match[2]}` : null
              cy.log(`New Balance with Payouts Pending: ${extractedBalance}`)
            })
        }
      )
      cy.then(() => {
        calculatedBalance = (
          parseFloat(
            sessionStorage
              .getItem('c_currentCurrencyBalance')
              .replace(/[^\d.]/g, '')
          ) + parseFloat(depositAmount)
        ).toFixed(2)
      })
      cy.then(() => {
        cy.findByTestId('dt_balance').then((balanceContainer) => {
          let newBalance = parseFloat(
            balanceContainer.text().replace(/[^0-9.-]/g, '')
          ).toFixed(2)
          expect(parseFloat(newBalance)).to.be.eq(parseFloat(calculatedBalance))
        })
        cy.c_visitResponsive('/', size)
        cy.c_checkTotalAssetSummary()
        cy.findAllByTestId('dt_balance_text_container').each(
          (balanceContainer) => {
            let newBalance = parseFloat(
              balanceContainer.text().replace(/[^0-9.-]/g, '')
            ).toFixed(2)
            expect(parseFloat(newBalance)).to.be.eq(
              parseFloat(calculatedBalance)
            )
          }
        )
      })
    })
    it(`should perform credit card withdrawal using doughflow. Screen size: ${size}`, () => {
      cy.get('@languageDetails').then((languageDetails) => {
        cy.c_visitResponsive(
          `cashier/withdrawal/?lang=${languageDetails.english.urlCode}`,
          {
            rateLimitCheck: true,
            size: size,
          }
        )
        cy.then(() => {
          if (sessionStorage.getItem('c_rateLimitOnVisitOccured') == 'true') {
            cy.reload()
            sessionStorage.removeItem('c_rateLimitOnVisitOccured')
          }
        })
        cy.c_loadingCheck()
        sessionStorage.setItem(
          'c_prevLanguage',
          languageDetails.english.urlCode
        )
        const languageDetailsArray = Object.entries(languageDetails)
        cy.c_checkWithdrawalScreen(languageDetailsArray[4], {
          size: size,
          isLanguageTest: false,
          performWitdrawal: true,
          isProd: false,
        })
        cy.enter('.cashier__content').then((getBody) => {
          getBody().find('#amount').type(depositAmount)
          getBody().find('#PayoutOptionCCPayout').click()
        })
        cy.wait('@payoutRequest')
        cy.wait(500) //Needed because after the API is completed UI takes some time to to load Iframe
        cy.frameLoaded('.cashier__content', { timeout: 60000 })
        cy.enter('.cashier__content').then((getBody) => {
          getBody()
            .find('.amountholder.totalamount')
            .then((val) => {
              const regex = /[\£\€\$]([\d,]+\.\d{2})/
              const match = val.text().trim().match(regex)
              const extractedBalance = match ? `${match[1]}` : null

              cy.log(`Extracted Withdrawal Balance: ${extractedBalance}`)
              expect(parseFloat(extractedBalance).toFixed(2)).to.be.eql(
                depositAmount
              )
            })
          getBody().find('.sliderbutton').click()
          getBody()
            .find(
              `[data-cardnumber="${Cypress.env('cashierCreditCard').slice(0, 6) + '******' + Cypress.env('cashierCreditCard').slice(12)}"]`
            )
            .click()
          getBody().find('#SubmitBtn').click()
        })
        cy.wait('@payoutDetails')
        cy.wait(500) //Needed because after the API is completed UI takes some time to to load Iframe
        cy.frameLoaded('.cashier__content', { timeout: 60000 })
        cy.enter('.cashier__content').then((getBody) => {
          getBody()
            .find('.formheader')
            .should('contain.text', '\nPayout Request Confirmation\n')
        })
      })
    })
  })
})
