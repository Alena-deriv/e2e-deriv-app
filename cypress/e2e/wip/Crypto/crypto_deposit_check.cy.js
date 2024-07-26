const sizes = ['mobile', 'desktop']
sizes.forEach((size) => {
  describe(`QATEST-715 - Test Case summary here on ${size}`, () => {
    beforeEach(() => {
      cy.c_login({ user: 'allcrypto' })
    })
    it(`should be able to check crypto account from Traders Hub on ${size}`, () => {
      cy.c_visitResponsive('', { size: size })
      const isMobile = size == 'mobile' ? true : false
      const cryptocurrencies = [
        {
          name: 'Bitcoin',
        },
        {
          name: 'Ethereum',
        },
        {
          name: 'Litecoin',
        },
        {
          name: 'Tether ERC20',
        },
        {
          name: 'USD Coin',
        },
        {
          name: 'Tether TRC20',
        },
      ]
      cryptocurrencies.forEach((crypto) => {
        cy.c_closeNotificationHeader()
        cy.c_selectCurrency(crypto)
        cy.c_checkTotalAssetSummary()
        cy.c_closeNotificationHeader()
        cy.findByRole('button', { name: 'Deposit' }).click()

        cy.findByText('Transaction status').should('be.visible')
        cy.get('.transactions-crypto-transaction-status-side-note').should(
          'exist'
        )
        cy.get('.side-note').should('exist')
        cy.findAllByText
        cy.findByText('To avoid loss of funds:').should('be.visible')
        cy.get("canvas[class*='qrcode']").should('be.visible')
        cy.get("canvas[class*='qrcode']").then(($canvas) => {
          const imageData = $canvas[0]
            .getContext('2d')
            .getImageData(0, 0, $canvas[0].width, $canvas[0].height)
          const code = Cypress.jsQR(
            imageData.data,
            imageData.width,
            imageData.height
          )
          expect(code).to.not.be.null
          const qrCodeValue = code.data
          cy.log('QR Code Value:', qrCodeValue)
          cy.get('.deposit-crypto-wallet-address__hash-container')
            .invoke('text')
            .then((actionContainerValue) => {
              const trimmedQRCodeValue = qrCodeValue.trim()
              const trimmedActionContainerValue = actionContainerValue.trim()
              expect(trimmedQRCodeValue).to.equal(trimmedActionContainerValue)
            })
        })
        cy.get('.deposit-crypto-wallet-address__hash-container').should('exist')
        cy.get('.deposit-crypto-wallet-address__action-container').click()
        cy.get('.deposit-crypto-wallet-address__hash-container')
          .invoke('text')
          .then((expectedValue) => {
            cy.get('.deposit-crypto-wallet-address__action-container')
              .click()
              .then(() => {
                cy.window().then((win) => {
                  cy.wrap(win.navigator.clipboard.readText()).then(
                    (copiedValue) => {
                      expect(copiedValue.trim()).to.equal(expectedValue.trim())
                    }
                  )
                })
              })
          })
        if (isMobile) {
          cy.get('#dt_mobile_drawer_toggle').click()
          cy.findAllByRole('link', { name: "Trader's Hub" }).click()
        } else {
          cy.findByTestId('dt_traders_hub_home_button').click()
        }
      })
    })
  })
})
