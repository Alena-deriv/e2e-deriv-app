import mt5_tradershub from './mt5PageObjects'
const locators = require('../PageElements/mt5TransferLocators.json')

class FundTransferPageObjects {
  transferAmount = '10'

  clickTransferButton = (mt5Account) => {
    cy.log('clicking transfer button')
    cy.get(locators.fundTransferLocators.mt5AccountHandle)
      .contains(mt5Account.subType)
      .next()
      .contains(mt5Account.jurisdiction)
      .parentsUntil(locators.fundTransferLocators.mt5TradingDetails)
      .parent()
      .siblings(locators.fundTransferLocators.mt5TradingActions)
      .within(() => {
        cy.get(locators.fundTransferLocators.transferButtonOnTradersHub).click()
      })

    cy.findByText('Transfer funds to your accounts', {
      exact: true,
    }).should('be.visible')
  }
  selectAccountFromDropdown = (account) => {
    cy.get(locators.fundTransferLocators.mt5TransferFromDropdown)
      .should('be.visible')
      .click()

    cy.get(locators.fundTransferLocators.dropdownList)
      .should('be.visible')
      .within(() => {
        cy.get(locators.fundTransferLocators.dropdownEntry)
          .contains(account)
          .scrollIntoView()
          .click({ force: true })
      })
  }
  selectAccountToDropdown = (account) => {
    cy.get(locators.fundTransferLocators.mt5TransferToDropdown)
      .should('be.visible')
      .click()

    cy.get(locators.fundTransferLocators.dropdownList)
      .should('be.visible')
      .within(() => {
        cy.get(locators.fundTransferLocators.dropdownEntry)
          .contains(account)
          .scrollIntoView()
          .click({ force: true })
      })
  }
  enterTransferAmount = (fiatAccountName, transactionType) => {
    cy.log(fiatAccountName)
    if (fiatAccountName == 'US Dollar') {
      cy.findByTestId(locators.fundTransferLocators.transferInputTestId)
        .click()
        .type(this.transferAmount)
    } else {
      cy.findByTestId(locators.fundTransferLocators.fromAmountTestId).click()
      cy.wait(500) // this wait was added to give some time to load conversionrate API
      if (
        fiatAccountName == 'Australian Dollar' &&
        transactionType == 'withdrawal'
      ) {
        this.transferAmount = 1
      }
      cy.findByTestId(locators.fundTransferLocators.fromAmountTestId)
        .click()
        .type(this.transferAmount)

      cy.findByTestId(locators.fundTransferLocators.toAmountTestId)
        .invoke('val')
        .as('convertedAmount')
        .then((convertedAmount) => {
          convertedAmount = Number(convertedAmount.replace(/[^0-9.-]+/g, ''))
          cy.log(convertedAmount)
          sessionStorage.setItem('c_convertedAmount', convertedAmount)
        })
    }
  }
  submitTransfer = () => {
    cy.get(locators.fundTransferLocators.transferSubmitButton)
      .contains('Transfer')
      .should('be.visible')
      .click()
    cy.findByText('Your funds have been transferred', {
      exact: true,
    }).should('be.visible')
    cy.get(locators.fundTransferLocators.closeButton)
      .should('be.visible')
      .contains('Close')
      .click()
  }
  validateBalance = (mt5Account, fiatAccount, transferType) => {
    cy.then(() => {
      const mt5BalanceBefore =
        mt5Account.type == 'Deriv MT5'
          ? parseFloat(
              sessionStorage
                .getItem(
                  `c_balance${mt5Account.subType}${mt5Account.jurisdiction}`
                )
                .replace(/[^\d.]/g, '')
            )
          : parseFloat(
              sessionStorage
                .getItem(`c_balance${mt5Account.code}`)
                .replace(/[^\d.]/g, '')
            )
      const currentCurrencyBalanceBefore = parseFloat(
        sessionStorage
          .getItem(`c_currentCurrencyBalance`)
          .replace(/[^\d.]/g, '')
      )
      cy.log(mt5BalanceBefore)
      cy.log(currentCurrencyBalanceBefore)

      cy.get(locators.fundTransferLocators.fiatBalanceLabel)
        .eq(1)
        .children()
        .eq(0)
        .invoke('text')
        .as('currentCurrencyBalanceAfter')
      cy.get('@currentCurrencyBalanceAfter').then(
        (currentCurrencyBalanceAfter) => {
          currentCurrencyBalanceAfter = Number(
            currentCurrencyBalanceAfter.replace(/[^0-9.-]+/g, '')
          )
          if (fiatAccount == 'US Dollar') {
            if (transferType == 'deposit') {
              expect(currentCurrencyBalanceAfter).to.eq(
                currentCurrencyBalanceBefore - parseInt(this.transferAmount)
              )
            } else {
              expect(currentCurrencyBalanceAfter).to.eq(
                currentCurrencyBalanceBefore + parseInt(this.transferAmount)
              )
            }
          } else {
            const convertedAmount = sessionStorage.getItem('c_convertedAmount')
            cy.log(convertedAmount)
            if (transferType == 'deposit') {
              expect(currentCurrencyBalanceAfter).to.eq(
                currentCurrencyBalanceBefore - parseInt(this.transferAmount)
              )
            } else {
              cy.log(currentCurrencyBalanceAfter)
              cy.log(currentCurrencyBalanceBefore)
              cy.log(convertedAmount)
              expect(currentCurrencyBalanceAfter).to.eq(
                Number(
                  (
                    currentCurrencyBalanceBefore + parseFloat(convertedAmount)
                  ).toFixed(2)
                )
              )
            }
          }
        }
      )
      cy.reload()
      cy.get(locators.fundTransferLocators.mt5AccountHandle)
        .contains(mt5Account.subType)
        .next()
        .contains(mt5Account.jurisdiction)
        .parentsUntil(locators.fundTransferLocators.mt5TradingDetails)
        .next()
        .children()
        .invoke('text')
        .as('mt5BalanceAfter')

      cy.get('@mt5BalanceAfter').then((mt5BalanceAfter) => {
        mt5BalanceAfter = Number(mt5BalanceAfter.replace(/[^0-9.-]+/g, ''))
        if (fiatAccount == 'US Dollar') {
          if (transferType == 'deposit') {
            expect(mt5BalanceAfter).to.eq(
              mt5BalanceBefore + parseFloat(this.transferAmount)
            )
          } else {
            expect(mt5BalanceAfter).to.eq(
              mt5BalanceBefore - parseFloat(this.transferAmount)
            )
          }
        } else {
          const convertedAmount = sessionStorage.getItem('c_convertedAmount')
          cy.log(convertedAmount)
          if (transferType == 'deposit') {
            expect(mt5BalanceAfter).to.eq(
              Number(
                (mt5BalanceBefore + parseFloat(convertedAmount)).toFixed(2)
              )
            )
          } else {
            expect(mt5BalanceAfter).to.eq(
              Number(
                (mt5BalanceBefore - parseFloat(this.transferAmount)).toFixed(2)
              )
            )
          }
        }
      })
    })
  }
  mt5Deposit = (fiatAccount, mt5Account) => {
    cy.c_getMt5AccountBalance(mt5Account)
    cy.c_getCurrentCurrencyBalance()
    this.clickTransferButton(mt5Account)
    this.selectAccountFromDropdown(fiatAccount.name)
    this.selectAccountToDropdown(
      mt5Account.subType + ' ' + mt5Account.jurisdiction
    )
    this.enterTransferAmount(fiatAccount.name, 'deposit')
    this.submitTransfer()
  }

  mt5withdrawal = (fiatAccount, mt5Account) => {
    cy.c_getMt5AccountBalance(mt5Account)
    cy.c_getCurrentCurrencyBalance()
    this.clickTransferButton(mt5Account)
    this.selectAccountFromDropdown(
      mt5Account.subType + ' ' + mt5Account.jurisdiction
    )
    this.selectAccountToDropdown(fiatAccount.name)
    this.enterTransferAmount(fiatAccount.name, 'withdrawal')
    this.submitTransfer()
  }

  mt5_fiat_deposit = (fiatAccount, mt5Account) => {
    mt5_tradershub.selectRealAccount()
    this.mt5Deposit(fiatAccount, mt5Account)
    this.validateBalance(mt5Account, fiatAccount.name, 'deposit')
  }
  mt5_fiat_withdrawal = (fiatAccount, mt5Account) => {
    mt5_tradershub.selectRealAccount()
    this.mt5withdrawal(fiatAccount, mt5Account)
    this.validateBalance(mt5Account, fiatAccount.name, 'withdrawal')
  }
}
export default new FundTransferPageObjects()
