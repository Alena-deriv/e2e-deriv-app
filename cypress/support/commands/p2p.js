import { generateAccountNumberString } from '../helper/utility'

let rate = 0.01
let marketRate
let rateCalculation
let deltaValue = 0.5
let calculatedValue
let regexPattern
let paymentIDForCopyAdSell = generateAccountNumberString(12)
const pm1 = 'Other'
const pm2 = 'Bank Transfer'
const pm3 = 'Skrill'
let paymentID = generateAccountNumberString(12)
let paymentIDForSecondPaymentType = generateAccountNumberString(12)
let secondPaymentMethod = 'WeChat Pay'

Cypress.Commands.add('c_createNewAd', (adType) => {
  cy.c_loadingCheck()
  cy.get('body', { timeout: 30000 }).then((body) => {
    if (body.find('.no-ads__message', { timeout: 10000 }).length > 0) {
      cy.findByRole('button', { name: 'Create new ad' })
        .should('be.visible')
        .click()
    } else if (body.find('#toggle-my-ads', { timeout: 10000 }).length > 0) {
      cy.c_removeExistingAds(adType)
      cy.findByRole('button', { name: 'Create new ad' })
        .should('be.visible')
        .click()
    }
  })
})

Cypress.Commands.add('c_clickMyAdTab', () => {
  cy.findByText('My ads').should('be.visible').click()
})

Cypress.Commands.add('c_postBuyAd', () => {
  cy.findByTestId('offer_amount').click().type('10')
  cy.findByTestId('float_rate_type')
    .click()
    .clear()
    .type(rate, { parseSpecialCharSequences: false })
  cy.findByTestId('min_transaction').click().clear().type('5')
  cy.findByTestId('max_transaction').click().clear().type('10')
  cy.c_PaymentMethod()
  cy.c_postAd()
})

Cypress.Commands.add('c_verifyExchangeRate', (rate) => {
  rateCalculation = rate * 0.01
  calculatedValue = rateCalculation * marketRate + marketRate
  regexPattern = /^Your rate is = (\d+(\.\d+)?) NZD$/
  cy.get('.floating-rate__hint')
    .invoke('text')
    .then((text) => {
      const match = text.match(regexPattern)
      if (match && match[1]) {
        const rateValue = parseFloat(match[1])
        expect(rateValue).to.be.closeTo(calculatedValue, deltaValue)
      } else {
        throw new Error('Rate string does not match the expected pattern')
      }
    })
})

Cypress.Commands.add('c_verifyFixedRate', (fixedRateValue) => {
  cy.findByTestId('fixed_rate_type').clear()
  cy.findByText('Fixed rate is required').should('be.visible')
  cy.findByTestId('fixed_rate_type').type('abc').should('have.value', 'abc')
  cy.findByText('Enter a valid amount').should('be.visible')
  cy.findByTestId('fixed_rate_type')
    .clear()
    .type('10abc')
    .should('have.value', '10abc')
  cy.findByText('Enter a valid amount').should('be.visible')
  cy.findByTestId('fixed_rate_type')
    .clear()
    .type('!@#')
    .should('have.value', '!@#')
  cy.findByText('Enter a valid amount').should('be.visible')
  cy.findByTestId('fixed_rate_type').clear().type(fixedRateValue)
})

Cypress.Commands.add('c_verifyTextAreaBlock', (blockName) => {
  cy.c_verifyTextAreaLength(blockName, 0)
  cy.findByTestId(blockName).clear()
  if (blockName == 'contact_info') {
    cy.findByText('Contact details is required').should('be.visible')
  }
  cy.findByTestId(blockName).clear().type('abc').should('have.value', 'abc')
  cy.c_verifyTextAreaLength(blockName, 'abc'.length)
  let textLimitCheck = generateAccountNumberString(300)
  cy.findByTestId(blockName)
    .clear()
    .type(textLimitCheck)
    .should('have.value', textLimitCheck)
  cy.c_verifyTextAreaLength(blockName, textLimitCheck.length)
  cy.findByTestId(blockName)
    .clear()
    .type(textLimitCheck + '1')
    .should('have.value', textLimitCheck)
  cy.c_verifyTextAreaLength(blockName, textLimitCheck.length)
  cy.findByTestId(blockName)
    .clear()
    .type('Text area info block.')
    .should('have.value', 'Text area info block.')
  cy.c_verifyTextAreaLength(blockName, 'Text area info block.'.length)
})

Cypress.Commands.add('c_verifyTextAreaLength', (blockName, textLength) => {
  cy.findByTestId(blockName)
    .parents('.dc-input__wrapper')
    .find('.dc-input__footer .dc-input__counter')
    .should('contain.text', `${textLength}/300`)
})

Cypress.Commands.add('c_checkForExistingAds', () => {
  cy.c_loadingCheck()
  return cy.get('body', { timeout: 10000 }).then((body) => {
    if (body.find('.no-ads__message', { timeout: 10000 }).length > 0) {
      return false
    } else if (body.find('#toggle-my-ads', { timeout: 10000 }).length > 0) {
      return true
    }
  })
})

Cypress.Commands.add('c_getAdTypeAndRateType', () => {
  cy.contains('.dc-text', 'Ad type')
    .next('.copy-advert-form__field')
    .invoke('text')
    .then((adType) => {
      sessionStorage.setItem('c_adType', adType.trim())
    })
  cy.get('.dc-input__container')
    .children('.dc-input__label')
    .eq(1)
    .invoke('text')
    .then((rateType) => {
      sessionStorage.setItem('c_rateType', rateType.trim())
    })
  cy.then(() => {
    return cy.wrap({
      adType: sessionStorage.getItem('c_adType'),
      rateType: sessionStorage.getItem('c_rateType'),
    })
  })
})

Cypress.Commands.add(
  'c_inputAdDetails',
  (rateValue, minOrder, maxOrder, adType, rateType, options = {}) => {
    const { paymentMethod = 'PayPal' } = options
    cy.findByText(`${adType} USD`).click()
    cy.findByTestId('offer_amount')
      .next('span.dc-text')
      .invoke('text')
      .then((fiatCurrency) => {
        sessionStorage.setItem('c_fiatCurrency', fiatCurrency.trim())
      })
    if (rateType == 'fixed') {
      cy.findByTestId('fixed_rate_type')
        .next('span.dc-text')
        .invoke('text')
        .then((localCurrency) => {
          sessionStorage.setItem('c_localCurrency', localCurrency.trim())
        })
    } else if (rateType == 'float') {
      cy.get('.floating-rate__hint')
        .invoke('text')
        .then((localCurrency) => {
          sessionStorage.setItem('c_localCurrency', localCurrency.trim())
        })
    }
    cy.then(() => {
      cy.findByTestId('offer_amount').type('10').should('have.value', '10')
      if (rateType == 'fixed') {
        cy.findByTestId('fixed_rate_type')
          .type(rateValue)
          .should('have.value', rateValue)
      } else if (rateType == 'float') {
        if (adType == 'buy') {
          cy.c_verifyRate()
          cy.findByTestId('float_rate_type')
            .click()
            .clear()
            .type(-rate, { parseSpecialCharSequences: false })
            .should('have.value', (-rate).toString())
        } else if (adType == 'sell') {
          cy.findByTestId('float_rate_type')
            .click()
            .clear()
            .type(rate, { parseSpecialCharSequences: false })
            .should('have.value', rate.toString())
        }
      }
      cy.findByTestId('min_transaction')
        .type(minOrder)
        .should('have.value', minOrder)
      cy.findByTestId('max_transaction')
        .type(maxOrder)
        .should('have.value', maxOrder)
      if (adType == 'Sell') {
        cy.findByTestId('contact_info')
          .type('Contact Info Block')
          .should('have.value', 'Contact Info Block')
      }
      cy.findByTestId('default_advert_description')
        .type('Description Block')
        .should('have.value', 'Description Block')
      cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
      cy.findByText('Set payment details').should('be.visible')
      cy.findByTestId('dt_dropdown_display').click()
      cy.findByText('15 minutes').should('be.visible').click({ force: true })
      if (adType == 'Sell') {
        cy.findByTestId('dt_payment_method_card_add_icon')
          .should('be.visible')
          .click()
        cy.c_addPaymentMethod(paymentIDForCopyAdSell, paymentMethod, rateType)
        cy.findByText(paymentIDForCopyAdSell)
          .should('exist')
          .parent()
          .prev()
          .find('.dc-checkbox')
          .and('exist')
          .click()
        cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
        cy.findByText('Set ad conditions').should('be.visible')
      } else if (adType == 'Buy') {
        cy.c_PaymentMethod()
      }
      cy.c_verifyPostAd()
      cy.c_verifyAdOnMyAdsScreen(
        adType,
        sessionStorage.getItem('c_fiatCurrency'),
        sessionStorage.getItem('c_localCurrency'),
        rateValue,
        minOrder,
        maxOrder,
        rateType
      )
    })
  }
)

Cypress.Commands.add(
  'c_verifyAdOnMyAdsScreen',
  (
    adType,
    fiatCurrency,
    localCurrency,
    rateValue,
    minOrder,
    maxOrder,
    rateType
  ) => {
    cy.findByText('Active').should('be.visible')
    cy.findByText(`${adType} ${fiatCurrency}`).should('be.visible')
    if (rateType === 'float') {
      const ratePrefix = adType === 'Buy' ? '-' : '+'
      cy.findByText(`${ratePrefix}${rateValue}%`).should('be.visible')
    } else if (rateType === 'fixed') {
      cy.findByText(`${rateValue} ${localCurrency}`).should('be.visible')
    }
    cy.findByText(
      `${minOrder.toFixed(2)} - ${maxOrder.toFixed(2)} ${fiatCurrency}`
    ).should('be.visible')
  }
)

Cypress.Commands.add(
  'c_getExistingAdDetailsForValidation',
  (adType, rateType) => {
    cy.findByTestId('dt_dropdown_container').should('be.visible').click()
    cy.findByText('Edit').parent().click()
    cy.findByTestId('offer_amount')
      .invoke('val')
      .then((offerAmount) => {
        sessionStorage.setItem('c_offerAmount', offerAmount)
      })
    if (rateType == 'fixed') {
      cy.findByTestId('fixed_rate_type')
        .invoke('val')
        .then((rateValue) => {
          sessionStorage.setItem('c_rateValue', rateValue.trim())
        })
    } else if (rateType == 'float') {
      if (adType == 'buy') {
        cy.findByTestId('float_rate_type')
          .invoke('val')
          .then((rateValue) => {
            sessionStorage.setItem('c_rateValue', rateValue.trim())
          })
      } else if (adType == 'sell') {
        cy.findByTestId('float_rate_type')
          .invoke('val')
          .then((rateValue) => {
            sessionStorage.setItem('c_rateValue', rateValue.trim())
          })
      }
    }
    if (adType == 'sell') {
      cy.findByTestId('contact_info')
        .invoke('text')
        .then((contactInfo) => {
          sessionStorage.setItem('c_contactInfo', contactInfo.trim())
        })
    }
    cy.findByTestId('default_advert_description')
      .invoke('text')
      .then((instructions) => {
        sessionStorage.setItem('c_instructions', instructions.trim())
      })
    cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
    cy.findByText('Edit payment details').should('be.visible')
    cy.get('span[name="order_completion_time"]')
      .invoke('text')
      .then((orderCompletionTime) => {
        sessionStorage.setItem(
          'c_orderCompletionTime',
          orderCompletionTime.trim()
        )
      })
  }
)

Cypress.Commands.add(
  'c_copyExistingAd',
  (
    offerAmount,
    rateValue,
    instructions,
    orderCompletionTime,
    contactDetails,
    options = {}
  ) => {
    const { floatRate = 'false' } = options
    cy.c_getAdTypeAndRateType().then(({ adType, rateType }) => {
      cy.findByTestId('offer_amount')
        .invoke('val')
        .then((offerAmountFromCopyAdScreen) => {
          cy.log(
            'Offer amount match: ',
            offerAmount === offerAmountFromCopyAdScreen
          )
        })
      if (floatRate == 'true') {
        rateType = 'Floating Rate'
      }
      if (rateType == 'Fixed Rate') {
        cy.findByTestId('fixed_rate_type')
          .invoke('val')
          .then((rateValueFromCopyAdScreen) => {
            cy.log(
              'Rate value match: ',
              rateValue === rateValueFromCopyAdScreen
            )
          })
      } else if (rateType == 'Floating Rate') {
        cy.findByTestId('float_rate_type')
          .invoke('val')
          .then((rateValueFromCopyAdScreen) => {
            cy.log(
              'Rate value match: ',
              rateValue === rateValueFromCopyAdScreen
            )
          })
      }
      if (adType == 'Sell') {
        cy.get('span[class="dc-text"]')
          .contains('Contact details')
          .next()
          .invoke('text')
          .then((contactDetailsFromCopyAdScreen) => {
            cy.log(
              'Contact details match: ',
              contactDetails === contactDetailsFromCopyAdScreen
            )
          })
      }
      cy.get('span[class="dc-text"]')
        .contains('Instructions')
        .next()
        .invoke('text')
        .then((instructionsFromCopyAdScreen) => {
          cy.log(
            'Instructions match: ',
            instructions === instructionsFromCopyAdScreen
          )
        })
      cy.get('span[class="dc-text"]')
        .contains('Order must be completed in')
        .next()
        .invoke('text')
        .then((orderCompletionTimeFromCopyAds) => {
          cy.log(
            'Order completion time match: ',
            orderCompletionTime === orderCompletionTimeFromCopyAds
          )
        })
      cy.findByTestId('offer_amount')
        .clear()
        .type(parseFloat(offerAmount) + 1)
        .should('have.value', parseFloat(offerAmount) + 1)
      if (rateType == 'Fixed Rate') {
        cy.findByTestId('fixed_rate_type')
          .clear()
          .type(parseFloat(rateValue) + 1)
          .should('have.value', parseFloat(rateValue) + 1)
      } else if (rateType == 'Floating Rate') {
        cy.findByTestId('float_rate_type')
          .clear()
          .type(parseFloat(rateValue) + 1)
          .should('have.value', parseFloat(rateValue) + 1)
      }
      cy.findByTestId('min_transaction')
        .clear()
        .type(parseFloat(offerAmount) + 1)
        .should('have.value', parseFloat(offerAmount) + 1)
      cy.findByTestId('max_transaction')
        .clear()
        .type(parseFloat(offerAmount) + 1)
        .should('have.value', parseFloat(offerAmount) + 1)
      cy.findByTestId('dt_edit_payment_methods').should('not.exist')
      cy.findByTestId('dt_edit_counterparty conditions').should('not.exist')
      cy.findByRole('button', { name: 'Cancel' }).should('be.enabled').click()
      cy.findByText(
        "If you choose to cancel, the details you've entered will be lost."
      ).should('be.visible')
      cy.findByRole('button', { name: 'Go back' }).should('be.enabled').click()
      cy.findByRole('button', { name: 'Create ad' })
        .should('be.enabled')
        .click()
      cy.findByText("You've created an ad").should('be.visible')
      cy.findByText(
        "If the ad doesn't receive an order for 3 days, it will be deactivated."
      ).should('be.visible')
      cy.findByText('Don’t show this message again.').should('be.visible')
      cy.findByRole('button', { name: 'OK' }).should('be.enabled').click()
    })
  }
)

Cypress.Commands.add('c_deleteCopiedAd', () => {
  cy.get('.my-ads-table__row .dc-dropdown-container')
    .eq(0)
    .should('be.visible')
    .click()
  cy.findByText('Delete').parent().click()
  cy.findByText('Do you want to delete this ad?').should('be.visible')
  cy.findByText('You will NOT be able to restore it.').should('be.visible')
  cy.findByRole('button', { name: 'Cancel' }).should('be.enabled')
  cy.findByRole('button', { name: 'Delete' }).should('be.enabled').click()
  cy.findByText('Hide my ads').should('be.visible')
})

Cypress.Commands.add('c_verifyRate', () => {
  cy.findByTestId('float_rate_type').click().clear()
  cy.findByText('Floating rate is required').should('be.visible')
  cy.findByTestId('float_rate_type').click().clear().type('abc')
  cy.findByText('Floating rate is required').should('be.visible')
  cy.findByTestId('float_rate_type').click().clear().type('10abc')
  cy.findByTestId('float_rate_type').invoke('val').should('eq', '10')
  cy.findByTestId('float_rate_type').click().clear().type('!@#')
  cy.findByText('Floating rate is required').should('be.visible')
  cy.findByTestId('float_rate_type').click().clear().type('1234')
  cy.findByText("Enter a value that's within -10.00% to +10.00%").should(
    'be.visible'
  )
  cy.findByTestId('float_rate_type')
    .click()
    .clear()
    .type(rate, { parseSpecialCharSequences: false })
  cy.get('.floating-rate__mkt-rate')
    .invoke('text')
    .then((text) => {
      const match = text.match(/of the market rate1 USD = (\d+(\.\d+)?)/)
      marketRate = parseFloat(match[1])
      if (match) {
        cy.c_verifyExchangeRate(rate)
        // Verify clicking plus button twice
        cy.get('#floating_rate_input_add')
          .click({ force: true })
          .click({ force: true })
        rate = rate + 0.02
        cy.c_verifyExchangeRate(rate)
        // // verify minus button once
        cy.get('#floating_rate_input_sub').click({ force: true })
        rate = rate - 0.01
        cy.c_verifyExchangeRate(rate)
      } else {
        throw new Error('Text does not match the expected pattern')
      }

      cy.findByTestId('float_rate_type')
        .click()
        .clear()
        .type(-rate, { parseSpecialCharSequences: false })
    })
})

Cypress.Commands.add('c_verifyPostAd', () => {
  cy.findByRole('button', { name: 'Post ad' }).should('be.enabled').click()
  cy.findByText("You've created an ad").should('be.visible')
  cy.findByText(
    "If the ad doesn't receive an order for 3 days, it will be deactivated."
  ).should('be.visible')
  cy.findByText('Don’t show this message again.').should('be.visible')
  cy.findByRole('button', { name: 'OK' }).should('be.enabled').click()
})

Cypress.Commands.add('c_verifyTooltip', () => {
  cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
  cy.findByText('Set payment details').should('be.visible')
  cy.findByTestId('dt_order_time_selection_info_icon').click()
  cy.contains('Orders will expire if they aren’t completed within this time.')
  cy.findByRole('button', { name: 'OK' }).click()
})

Cypress.Commands.add('c_verifyCompletionOrderDropdown', () => {
  cy.findByTestId('dt_dropdown_display').click()
  cy.findAllByText('1 hour').should('be.visible')
  cy.findAllByText('45 minutes').should('be.visible')
  cy.findAllByText('30 minutes').should('be.visible')
  cy.findAllByText('15 minutes').should('be.visible').click({ force: true })
})

Cypress.Commands.add(
  'c_verifyMaxMin',
  (selector, expectedValue, expectedValidation) => {
    cy.findByTestId(selector).click().type('abc')
    cy.findByText('Only numbers are allowed.').should('be.visible')
    cy.findByTestId(selector).click().clear().type('123abc')
    cy.findByText('Only numbers are allowed.').should('be.visible')
    cy.findByTestId(selector).click().clear().type('!@#')
    cy.findByText('Only numbers are allowed.').should('be.visible')
    cy.findByTestId(selector).click().clear().type('1234567890123456')
    cy.findByTestId(selector).should('have.value', '123456789012345')
    cy.findByTestId(selector).click().clear()
    cy.findByText(`${expectedValidation} limit is required`).should(
      'be.visible'
    )
    cy.findByTestId(selector).click().type('11')
    cy.findByText(`Amount should not be below ${expectedValidation} limit`)
      .scrollIntoView()
      .should('be.visible')
    cy.findByText(`${expectedValidation} limit should not exceed Amount`)
      .scrollIntoView()
      .should('be.visible')
    cy.findByTestId(selector).click().clear().type(expectedValue)
  }
)

Cypress.Commands.add('c_PaymentMethod', () => {
  cy.findByPlaceholderText('Add').click()
  cy.findByText(pm1).click()
  cy.findByPlaceholderText('Add').click()
  cy.findByText(pm2).click()
  cy.findByPlaceholderText('Add').click()
  cy.findByText(pm3).click()
  cy.findByPlaceholderText('Add').should('not.exist')
  cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
  cy.findByText('Set ad conditions').should('be.visible')
})

Cypress.Commands.add('c_verifyAmountFiled', () => {
  cy.findByTestId('offer_amount').click().type('abc')
  cy.findByText('Enter a valid amount').should('be.visible')
  cy.findByTestId('offer_amount').click().clear().type('123abc')
  cy.findByText('Enter a valid amount').should('be.visible')
  cy.findByTestId('offer_amount').click().clear().type('!@#')
  cy.findByText('Enter a valid amount').should('be.visible')
  cy.findByTestId('offer_amount').click().clear().type('1234567890123456')
  cy.findByTestId('offer_amount').should('have.value', '123456789012345')
  cy.findByTestId('offer_amount').click().clear()
  cy.findByText('Amount is required').should('be.visible')
  cy.findByTestId('offer_amount').click().type('10')
})

Cypress.Commands.add('c_postAd', () => {
  cy.findByRole('button', { name: 'Post ad' }).should('be.enabled').click()
  cy.findByRole('button', { name: 'Ok' }).should('be.enabled').click()
})

Cypress.Commands.add('c_removeExistingAds', (adType, options = {}) => {
  const { size = 'mobile' } = options
  cy.get('.my-ads-table__row .dc-dropdown-container')
    .its('length')
    .then((numberOfAds) => {
      cy.log('Number of Ads:', numberOfAds)
      cy.get('.my-ads-table__row .dc-dropdown-container').each(
        ($el, index, $list) => {
          cy.log('The index is:', index)
          cy.wrap($el).click()
          cy.findByText('Delete').parent().click()
          cy.findByText('Do you want to delete this ad?').should('be.visible')
          cy.findByText('You will NOT be able to restore it.').should(
            'be.visible'
          )
          cy.findByRole('button', { name: 'Delete' })
            .should('be.enabled')
            .click()
            .should('not.exist', {
              timeout: 10000,
            })
          if (index < numberOfAds - 1) {
            // this wait needed to provide a buffer after deleting each row, which helps avoid flaky failures.
            cy.wait(1000)
          }
        }
      )
    })
  cy.findByText('My profile').click()
  cy.findByText('Available Deriv P2P balance').should('be.visible')
  cy.findByText('Payment methods').should('be.visible').click()
  cy.findByText('Payment methods').should('be.visible')
  cy.c_deleteAllPM()
  cy.findByRole('button', { name: /Add/ }).should('be.visible')
  cy.c_visitResponsive('/cashier/p2p', { size: size })
  cy.c_clickMyAdTab()
})

Cypress.Commands.add('c_verifyDynamicMsg', () => {
  cy.get('.message-selector')
    .should('be.visible')
    .invoke('text')
    .then((messageText) => {
      const messagePattern =
        /If the ad doesn't receive an order for \d+ days, it will be deactivated./
      expect(messageText).to.match(messagePattern)
    })
})

Cypress.Commands.add('c_navigateToDerivP2P', () => {
  cy.c_rateLimit({
    waitTimeAfterError: 15000,
    maxRetries: 5,
  })
  cy.findAllByTestId('dt_balance_text_container', { timeout: 30000 }).should(
    'have.length',
    '2'
  )
  cy.get('#dt_mobile_drawer_toggle').should('be.visible').click()
  cy.findByRole('heading', { name: 'Cashier' }).should('be.visible').click()
  cy.findByRole('link', { name: 'Deriv P2P' }).should('be.visible').click()
})

Cypress.Commands.add('c_deleteAllPM', () => {
  cy.document().then((doc) => {
    let paymentCard = doc.querySelector('.dc-dropdown__container')
    if (paymentCard) {
      cy.get('.dc-dropdown__container').first().click()
      cy.get('#delete').should('be.visible').click()
      cy.findByRole('button', { name: 'Yes, remove' })
        .should('be.visible')
        .click()
        .and('not.exist')
      paymentCard = null
      cy.then(() => {
        cy.c_deleteAllPM()
      })
    } else {
      cy.log('No PMs available')
    }
  })
})

Cypress.Commands.add(
  'c_addPaymentMethod',
  (paymentID, paymentMethod, rateType) => {
    if (paymentMethod == 'Bank Transfer') {
      if (rateType === 'fixed') {
        cy.findByRole('textbox', { name: 'Payment method' })
          .clear()
          .type(paymentMethod)
          .should('have.value', paymentMethod)
        cy.findByText(paymentMethod).click()
      }
      cy.findByRole('textbox', { name: 'Account Number' })
        .clear()
        .type(paymentID)
        .should('have.value', paymentID)
      cy.findByRole('textbox', { name: 'SWIFT or IFSC code' })
        .clear()
        .type('9087')
        .should('have.value', '9087')
      cy.findByRole('textbox', { name: 'Bank Name' })
        .clear()
        .type('Banking Name')
        .should('have.value', 'Banking Name')
      cy.findByRole('textbox', { name: 'Branch' })
        .clear()
        .type('Branch number 42')
        .should('have.value', 'Branch number 42')
      cy.get('textarea[name="instructions"]')
        .type('Follow instructions.')
        .should('have.value', 'Follow instructions.')
      cy.findByRole('button', { name: 'Add' }).should('not.be.disabled').click()
      cy.findByText('Payment methods').should('be.visible')
      cy.findByText(paymentID).should('be.visible')
    } else if (
      paymentMethod === 'PayPal' ||
      paymentMethod === 'WeChat Pay' ||
      paymentMethod === 'Skrill' ||
      paymentMethod === 'Alipay'
    ) {
      cy.findByRole('textbox', { name: 'Payment method' })
        .clear()
        .type(paymentMethod)
        .should('have.value', paymentMethod)
      cy.findByText(paymentMethod).click()
      cy.get('input[name="account"]')
        .clear()
        .type(paymentID)
        .should('have.value', paymentID)
      cy.get('textarea[name="instructions"]')
        .type('Follow instructions.')
        .should('have.value', 'Follow instructions.')
      cy.findByRole('button', { name: 'Add' }).should('not.be.disabled').click()
      cy.findByText('Payment methods').should('be.visible')
      cy.findByText(paymentID).should('be.visible')
    } else if (paymentMethod == 'Other') {
      cy.findByRole('textbox', { name: 'Payment method' })
        .clear()
        .type(paymentMethod)
        .should('have.value', paymentMethod)
      cy.findByText(paymentMethod).click()
      cy.findByRole('textbox', { name: 'Account ID / phone number / email' })
        .clear()
        .type(paymentID)
        .should('have.value', paymentID)
      cy.findByRole('textbox', { name: 'Payment method name' })
        .clear()
        .type(paymentMethod)
        .should('have.value', paymentMethod)
      cy.get('textarea[name="instructions"]')
        .type('Follow instructions.')
        .should('have.value', 'Follow instructions.')
      cy.findByRole('button', { name: 'Add' }).should('not.be.disabled').click()
      cy.findByText('Payment methods').should('be.visible')
      cy.findByText(paymentID).should('be.visible')
    }
  }
)

Cypress.Commands.add('c_deletePaymentMethod', (paymentID, paymentName) => {
  cy.findByText(paymentID)
    .should('exist')
    .parent()
    .prev()
    .find('.dc-dropdown-container')
    .and('exist')
    .click()
  cy.get('#delete').should('be.visible').click()
  cy.findByText(`Delete ${paymentName}?`).should('be.visible')
  cy.findByRole('button', { name: 'Yes, remove' }).should('be.visible').click()
  cy.findByText(paymentID).should('not.exist')
})

Cypress.Commands.add('c_verifyBuyAds', () => {
  cy.findByText('Active').should('be.visible')
  cy.findByText('Buy USD').should('be.visible')
  cy.findByText('Float').should('be.visible')
  cy.findByText('-0.01%').should('be.visible')
  cy.findByText(5 + '.00 - ' + 10 + '.00 USD')
  cy.contains(pm1)
  cy.contains(pm2)
  cy.contains(pm3)
})

Cypress.Commands.add('c_adDetailsFieldLength', (blockName, textLength) => {
  cy.get(`textarea[name=${blockName}]`)
    .parents('.dc-input__wrapper')
    .find('.dc-input__footer .dc-input__counter')
    .should('contain.text', `${textLength}/300`)
})

Cypress.Commands.add('c_adDetailsFieldText', (blockName) => {
  cy.get(`textarea[name=${blockName}]`)
    .invoke('val')
    .then((text) => {
      let textLength = text.length
      cy.c_adDetailsFieldLength(blockName, textLength)
    })
  cy.get(`textarea[name=${blockName}]`).clear()
  cy.get(`textarea[name=${blockName}]`)
    .clear()
    .type('abc')
    .should('have.value', 'abc')
  cy.c_adDetailsFieldLength(blockName, 'abc'.length)
  let textLimitCheck = generateAccountNumberString(300)
  cy.get(`textarea[name=${blockName}]`)
    .clear()
    .type(textLimitCheck)
    .should('have.value', textLimitCheck)
  cy.c_adDetailsFieldLength(blockName, textLimitCheck.length)
  cy.get(`textarea[name=${blockName}]`)
    .clear()
    .type(textLimitCheck + '1')
    .should('have.value', textLimitCheck)
  cy.c_adDetailsFieldLength(blockName, textLimitCheck.length)
  let textForField = generateAccountNumberString(20)
  cy.get(`textarea[name=${blockName}]`)
    .clear()
    .type(textForField)
    .should('have.value', textForField)
  cy.c_adDetailsFieldLength(blockName, textForField.length)
})

Cypress.Commands.add('c_giveRating', (advertiserType) => {
  cy.get('.rating-modal__star')
    .eq(1)
    .within(() => {
      cy.get('svg').eq(3).click({ force: true })
    })
  cy.findByText(`Would you recommend this ${advertiserType}?`)
  cy.findByRole('button', { name: 'No' }).should('be.visible').click()
  cy.findByRole('button', { name: 'Yes' }).should('be.visible').click()
  cy.findByRole('button', { name: 'Done' }).should('be.visible').click()
  cy.findByText('Your transaction experience').should('be.visible')
  cy.get('span[title="4 out of 5"]').should('be.visible')
  cy.findByText('Recommended').should('be.visible')
})

Cypress.Commands.add(
  'c_verifyBuyOrderField',
  (minOrder, maxOrder, fiatCurrency) => {
    cy.get('input[name="amount"]').clear().type('abc').should('have.value', '')
    cy.findByText('Enter a valid amount').should('be.visible')
    cy.get('input[name="amount"]')
      .clear()
      .type('5abc')
      .should('have.value', '5')
    cy.get('input[name="amount"]').clear().type('!@#').should('have.value', '')
    cy.findByText('Enter a valid amount').should('be.visible')
    cy.get('input[name="amount"]')
      .clear()
      .type(maxOrder + 1)
      .should('have.value', maxOrder + 1)
    cy.findByText(`Maximum is ${maxOrder.toFixed(2)} ${fiatCurrency}`).should(
      'be.visible'
    )
    cy.get('input[name="amount"]')
      .clear()
      .type(minOrder - 0.5)
      .should('have.value', minOrder - 0.5)
    cy.findByText(`Minimum is ${minOrder.toFixed(2)} ${fiatCurrency}`).should(
      'be.visible'
    )
    cy.get('input[name="amount"]')
      .clear()
      .type(maxOrder)
      .should('have.value', maxOrder)
  }
)

Cypress.Commands.add(
  'c_verifyPaymentConfirmationScreenContent',
  (sendAmount, nickname) => {
    cy.findByText('Payment confirmation').should('be.visible')
    const POTText = `Please make sure that you\'ve paid ${sendAmount} to ${nickname}, and upload the receipt as proof of your payment`
    cy.get('.dc-modal-body')
      .find('.dc-text')
      .eq(0)
      .invoke('text')
      .then((POTMessageCheck) => {
        expect(POTMessageCheck).to.eq(POTText)
      })
    cy.findByText(
      'Sending forged documents will result in an immediate and permanent ban.'
    ).should('be.visible')
    cy.findByText('We accept JPG, PDF, or PNG (up to 5MB).').should(
      'be.visible'
    )
  }
)

Cypress.Commands.add(
  'c_verifyOrderPlacementScreen',
  (nickname, rateOfOneDollar, paymentMethods, instructions) => {
    cy.findByText(nickname).should('be.visible')
    cy.findByText(rateOfOneDollar).should('be.visible')
    cy.findByText(paymentMethods).should('be.visible')
    cy.findByText(instructions).should('be.visible')
    cy.findByRole('button', { name: 'Expand all' }).should('be.visible').click()
    cy.findByRole('button', { name: 'Collapse all' }).should('be.visible')
    cy.findByRole('button', { name: 'Cancel order' }).should('be.enabled')
    cy.findByRole('button', { name: "I've paid" })
      .should('not.be.disabled')
      .click()
  }
)

Cypress.Commands.add('c_checkForEmptyAdScreenMessage', (adType, adTypeOpp) => {
  cy.findByRole('button', { name: adType }).should('be.visible').click()
  cy.findByText('No ads for this currency 😞').should('be.visible')
  cy.findByText(
    'Looking to buy or sell USD? You can post your own ad for others to respond.'
  ).should('be.visible')
  cy.findByRole('button', { name: 'Create ad' }).should('be.visible').click()
  cy.get('.wizard__main-step').prev().children().last().click()
  cy.findByText('You have no ads 😞').should('be.visible')
  cy.findByText(
    'Looking to buy or sell USD? You can post your own ad for others to respond.'
  ).should('be.visible')
  cy.findByRole('button', { name: 'Create new ad' }).should('be.visible')
  cy.findByText('Buy / Sell').should('be.visible').click()
  cy.get('div[class="search-box"]').should('be.visible')
})

Cypress.Commands.add('c_checkForNonEmptyStateAdScreen', () => {
  cy.findByText('No ads for this currency 😞').should('not.exist')
  cy.findByText(
    'Looking to buy or sell USD? You can post your own ad for others to respond.'
  ).should('not.exist')
  cy.findByRole('button', { name: 'Create ad' }).should('not.exist')
  cy.get('.buy-sell-row').should('exist')
})

Cypress.Commands.add('c_sortAdBy', (sortBy) => {
  cy.findByTestId('sort-div').should('be.visible').click()
  cy.findByText(sortBy).should('be.visible')
  cy.contains('.dc-text', sortBy)
    .closest('.dc-radio-group__item')
    .find('input[type="radio"]')
    .then(($radio) => {
      if (!$radio.is(':checked')) {
        cy.wrap($radio).click({ force: true }).and('be.checked')
      } else {
        cy.get('body').click({ x: 10, y: 10 })
        cy.get('.dc-modal').should('not.exist')
        cy.findByText('Buy / Sell').should('be.visible')
      }
    })
})

Cypress.Commands.add('c_getExchangeRatesFromScreen', (adType, options = {}) => {
  const { sortArray = false } = options
  let ratesArray = []
  cy.findByRole('button', { name: adType }).should('be.visible').click()
  cy.get('.buy-sell-row__rate').each(($parent) => {
    cy.wrap($parent)
      .children()
      .eq(1)
      .invoke('text')
      .then((text) => {
        let cleanedText = text.replace('IDR', '').replace(/,/g, '').trim()
        let rate = parseFloat(cleanedText).toFixed(2)
        ratesArray.push(parseFloat(rate))
      })
  })
  cy.then(() => {
    if (sortArray) {
      ratesArray.sort((a, b) => (adType === 'Buy' ? a - b : b - a))
    } else {
      cy.log('Not sorting rates array')
    }
    return cy.wrap(JSON.stringify(ratesArray))
  })
})

Cypress.Commands.add(
  'c_verifyAdSummary',
  (adType, totalAmount, fixedRateValue, fiatCurrency, localCurrency) => {
    totalAmount = totalAmount.toFixed(2)
    fixedRateValue = fixedRateValue.toFixed(2)
    let totalPrice = totalAmount * fixedRateValue
    regexPattern = `You\'re creating an ad to ${adType} ${totalAmount} ${fiatCurrency} for ${totalPrice.toFixed(2)} ${localCurrency} (${fixedRateValue} ${localCurrency}/${fiatCurrency})`
    cy.get('.create-ad-summary')
      .eq(0)
      .invoke('text')
      .then((spanText) => {
        expect(spanText).to.eq(regexPattern)
      })
  }
)

Cypress.Commands.add('c_getProfileName', () => {
  return cy
    .get('.my-profile-name__column')
    .children('.dc-text')
    .invoke('text')
    .then((name) => {
      return name
    })
})

Cypress.Commands.add('c_getProfileBalance', () => {
  return cy
    .get('.my-profile-balance__amount')
    .children('span')
    .invoke('text')
    .then((balanceText) => {
      const cleanedText = balanceText.replace(',', '').replace('USD', '').trim()
      const floatValue = parseFloat(cleanedText).toFixed(2)
      return floatValue
    })
})

Cypress.Commands.add('c_navigateToP2P', () => {
  cy.c_navigateToDerivP2P()
  cy.c_rateLimit({
    waitTimeAfterError: 15000,
    maxRetries: 5,
  })
  cy.findByText('Deriv P2P').should('exist')
  cy.c_closeNotificationHeader()
})

Cypress.Commands.add(
  'c_confirmBalance',
  (balanceBefore, balanceAfter, amount, advertiserType, orderType) => {
    let calculatedBalanceAfter

    if (orderType === 'buy') {
      if (advertiserType === 'buyer') {
        calculatedBalanceAfter = (
          parseFloat(balanceBefore) - parseFloat(amount)
        ).toFixed(2)
      } else if (advertiserType === 'seller') {
        calculatedBalanceAfter = (
          parseFloat(balanceBefore) + parseFloat(amount)
        ).toFixed(2)
      } else {
        throw new Error('Invalid advertiser type for buy order')
      }
    } else if (orderType === 'sell') {
      if (advertiserType === 'buyer') {
        calculatedBalanceAfter = (
          parseFloat(balanceBefore) + parseFloat(amount)
        ).toFixed(2)
      } else if (advertiserType === 'seller') {
        calculatedBalanceAfter = (
          parseFloat(balanceBefore) - parseFloat(amount)
        ).toFixed(2)
      } else {
        throw new Error('Invalid advertiser type for sell order')
      }
    } else {
      throw new Error('Invalid order type')
    }

    if (balanceAfter !== calculatedBalanceAfter) {
      throw new Error(
        `Balance is not correct: Balance Before = ${balanceBefore}, Balance After = ${balanceAfter}, Amount = ${amount}`
      )
    } else {
      cy.log(
        `Balance is correct: Balance Before = ${balanceBefore}, Balance After = ${balanceAfter}, Amount = ${amount}`
      )
    }
  }
)

Cypress.Commands.add(
  'c_createBuyOrder',
  (sellerNickname, minOrder, maxOrder, fiatCurrency, options = {}) => {
    const { rateType = 'float' } = options
    cy.findByText('Buy / Sell').should('be.visible').click()
    cy.findByPlaceholderText('Search')
      .should('be.visible')
      .type(sellerNickname)
      .should('have.value', sellerNickname)
    cy.wait(2000) // verify only one sell-usd button in the page
    cy.get('.buy-sell-row__advertiser')
      .next('.buy-sell-row__information')
      .find('button[type="submit"]')
      .should('be.visible')
      .click()
    if (rateType == 'float') {
      cy.findByText('Floating').should('be.visible')
    }
    cy.findByText('Seller').next('p').should('have.text', sellerNickname)
    cy.findByText(
      `Limit: ${minOrder.toFixed(2)}–${maxOrder.toFixed(2)} ${fiatCurrency}`
    ).should('be.visible')
    cy.c_verifyBuyOrderField(minOrder, maxOrder, fiatCurrency)
    cy.findAllByText('Rate (1 USD)')
      .eq(0)
      .closest('.buy-sell-form__field-rate')
      .next('p')
      .invoke('text')
      .then((rateOfOneDollar) => {
        sessionStorage.setItem('c_rateOfOneDollar', rateOfOneDollar.trim())
      })
    cy.findByText('Payment methods')
      .next('div')
      .children('p')
      .invoke('text')
      .then((paymentMethods) => {
        sessionStorage.setItem('c_paymentMethods', paymentMethods.trim())
      })
    cy.findByText("Seller's instructions")
      .next('p')
      .invoke('text')
      .then((sellersInstructions) => {
        sessionStorage.setItem(
          'c_sellersInstructions',
          sellersInstructions.trim()
        )
      })
    cy.findByText('Orders must be completed in')
      .next('p')
      .invoke('text')
      .then((orderCompletionTime) => {
        sessionStorage.setItem(
          'c_orderCompletionTime',
          orderCompletionTime.trim()
        )
      })

    return cy.then(() => {
      cy.findByRole('button', { name: 'Cancel' })
        .scrollIntoView()
        .should('be.enabled')
      cy.findByRole('button', { name: 'Confirm' })
        .should('not.be.disabled')
        .click()
      cy.c_validateBuyerChattoSeller()
      cy.findAllByTestId('dt_mobile_full_page_return_icon').eq(1).click()
      cy.findByRole('button', { name: "I've paid" }).should('be.visible')
      cy.findByText('Send')
        .next('span')
        .invoke('text')
        .then((sendAmount) => {
          return sendAmount
        })
    })
  }
)

Cypress.Commands.add(
  'c_createSellOrder',
  (
    sellerNickname,
    minOrder,
    maxOrder,
    fiatCurrency,
    paymentMethod,
    rateType
  ) => {
    cy.findByText('Buy / Sell').should('be.visible').click()
    cy.findByRole('button', { name: 'Sell' }).should('be.visible').click()
    cy.findByPlaceholderText('Search')
      .should('be.visible')
      .type(sellerNickname)
      .should('have.value', sellerNickname)
      .click()
    cy.wait(2000) // verify only one sell-usd button in the page
    cy.get('.buy-sell-row__advertiser')
      .next('.buy-sell-row__information')
      .find('button[type="submit"]')
      .should('be.visible')
      .click()
    cy.findByTestId('dt_ic_cashier_bank_transfer').should('be.visible')
    cy.findByRole('button', { name: 'Confirm' }).should('be.disabled')
    cy.get('body', { timeout: 50000 }).then((body) => {
      if (body.text().includes('You may choose up to 3.')) {
        cy.get('.dc-checkbox__box', { timeout: 30000 })
          .should('be.visible')
          .click()
      } else {
        cy.findByText(
          "To place an order, add one of the advertiser's preferred payment methods:"
        ).should('be.visible')
        cy.contains('.payment-method-card--add', 'Bank Transfer')
          .findByTestId('dt_payment_method_card_add_icon')
          .click()
        cy.get('input[name="choose_payment_method"][value="Bank Transfer"]', {
          timeout: 10000,
        }).should('be.visible')
        cy.c_addPaymentMethod(paymentID, paymentMethod, rateType)
        cy.contains(paymentMethod).click()
        cy.get('.dc-checkbox__box', { timeout: 30000 })
          .should('be.visible')
          .click()
      }
    })
    cy.get('textarea').scrollIntoView().type('Test')
    cy.findByRole('button', { name: 'Confirm' }).should('be.visible').click()
  }
)

Cypress.Commands.add('c_uploadPOT', (filePath) => {
  cy.findByTestId('dt_file_upload_input').selectFile(filePath, { force: true })
  cy.findByTestId('dt_remove_file_icon').should('be.visible')
  cy.findByRole('button', { name: 'Go Back' })
    .should('be.visible')
    .and('be.enabled')
  cy.findByRole('button', { name: 'Confirm' })
    .should('be.visible')
    .and('be.enabled')
    .click()
  cy.c_rateLimit({
    waitTimeAfterError: 15000,
    maxRetries: 5,
  })
})

Cypress.Commands.add('c_waitForPayment', () => {
  cy.findByText('Wait for payment').should('be.visible')
  cy.findByText(
    "Don't risk your funds with cash transactions. Use bank transfers or e-wallets instead."
  ).should('be.visible')
})

Cypress.Commands.add(
  'c_confirmOrder',
  (nicknameAndAmount, orderType, emailAddress, options = {}) => {
    const { checkChat = 'false', size = 'mobile' } = options
    cy.findByText('Confirm payment').should('be.visible').click()
    cy.findByText(
      "Don't risk your funds with cash transactions. Use bank transfers or e-wallets instead."
    ).should('be.visible')
    if (checkChat == 'true') {
      cy.c_validateSellerChatToBuyer()
      cy.findAllByTestId('dt_mobile_full_page_return_icon').eq(1).click()
    }
    cy.then(() => {
      cy.findByRole('button', { name: "I've received payment" })
        .should('be.enabled')
        .click()
      cy.findByText('Has the buyer paid you?').should('be.visible')
      cy.findByText('I didn’t receive the email').should('be.visible')
      cy.findByTestId('dt_modal_close_icon').should('be.visible').click()

      cy.c_emailVerification(
        'track_p2p_order_confirm_verify.html',
        emailAddress
      )

      cy.then(() => {
        cy.c_visitResponsive(Cypress.env('verificationUrl'), {
          size: size,
        })
      })
      cy.log(`nicknameAndAmount.amount is ${nicknameAndAmount.amount}`)
      const transactionText =
        orderType === 'buy'
          ? `If you’ve received ${nicknameAndAmount.amount} from ${nicknameAndAmount.seller} in your bank account or e-wallet, hit the button below to complete the order.`
          : `If you’ve received ${nicknameAndAmount.amount} from ${nicknameAndAmount.buyer} in your bank account or e-wallet, hit the button below to complete the order.`
      cy.findByText('One last step before we close this order').should(
        'be.visible'
      )
      cy.findByTestId('dt_modal_footer')
        .prev()
        .children()
        .last()
        .invoke('text')
        .then((messageString) => {
          expect(messageString).to.eq(transactionText)
        })
      cy.findByRole('button', { name: 'Confirm' }).should('be.enabled').click()
      cy.findByText('How would you rate this transaction?').should('be.visible')
    })
  }
)

Cypress.Commands.add('c_filterByPaymentMethod', (PM) => {
  cy.findByText('Payment methods').should('be.visible').click()
  cy.findByText(PM).should('be.visible').click()
  cy.findByRole('button', { name: 'Confirm' }).should('be.enabled').click()
  cy.findByRole('button', { name: 'Apply' }).should('be.enabled').click()
})

Cypress.Commands.add('c_resetFilter', () => {
  cy.findByTestId('sort-div').next().click()
  cy.findByText('Deriv P2P', { timeout: 10000 }).should('not.be.visible')
  cy.findByText('Filter', { timeout: 10000 }).should('be.visible')
  cy.findByRole('button', { name: 'Reset' }).should('be.enabled').click()
})

Cypress.Commands.add(
  'c_addBuyOrderDetails',
  (paymentMethod, amount, rate, min, max) => {
    cy.findByTestId('offer_amount').click().type(amount)
    cy.findByTestId('fixed_rate_type').type(rate)
    cy.findByTestId('min_transaction').click().type(min)
    cy.findByTestId('max_transaction').click().type(max)
    cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
    cy.findByPlaceholderText('Add').should('be.visible').click()
    cy.findByText(paymentMethod).click()
    cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
    cy.c_verifyPostAd()
  }
)

Cypress.Commands.add('c_addSellOrderDetails', (options) => {
  const {
    paymentMethod = '',
    amount = '',
    rate = '',
    min = '',
    max = '',
    rateType = '',
  } = options
  cy.get(':nth-child(2) > .dc-radio-group__circle').click()
  cy.findByTestId('offer_amount').click().type(amount)
  cy.findByTestId('fixed_rate_type').type(rate)
  cy.findByTestId('min_transaction').click().type(min)
  cy.findByTestId('max_transaction').click().type(max)
  cy.findByTestId('contact_info').click().type('Test')
  cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
  cy.get('body', { timeout: 10000 }).then((body) => {
    if (body.find(paymentMethod, { timeout: 10000 }).length > 0) {
      cy.contains(paymentMethod).click()
    } else {
      cy.findByTestId('dt_payment_method_card_add_icon')
        .should('be.visible')
        .click()
      cy.get('input[name="payment_method"]').click()
      cy.c_addPaymentMethod(paymentID, paymentMethod, rateType)
      cy.contains(paymentMethod).click()
    }
  })
  cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
  cy.c_verifyPostAd()
})

Cypress.Commands.add(
  'c_editAdAndVerify',
  (adType, minOrder, maxOrder, rateType) => {
    cy.findByTestId('dt_dropdown_container').should('be.visible').click()
    cy.findByText('Edit').parent().click()
    cy.findByTestId('offer_amount').should('be.disabled')
    cy.findByTestId('min_transaction')
      .clear()
      .type(minOrder + 1)
    cy.findByTestId('max_transaction').clear().type(maxOrder)
    cy.findByRole('button', { name: 'Cancel' }).should('be.enabled').click()
    cy.findByText('Cancel your edits?').should('be.visible')
    cy.findByText(
      'If you choose to cancel, the edited details will be lost.'
    ).should('be.visible')
    cy.findByRole('button', { name: "Don't cancel" }).should('be.enabled')
    cy.findByTestId('dt_modal_footer')
      .findByRole('button', { name: 'Cancel' })
      .should('be.enabled')
      .click()
    cy.c_loadingCheck()
    cy.findByRole('button', { name: 'Create new ad' }).should('be.visible')
    cy.findByTestId('dt_dropdown_container').should('be.visible').click()
    cy.findByText('Edit').parent().click()
    cy.findByTestId('offer_amount').should('be.disabled')
    cy.findByTestId('min_transaction')
      .clear()
      .type(minOrder + 1)
    cy.findByTestId('max_transaction').clear().type(maxOrder)
    cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
    cy.findByText('Edit payment details').should('be.visible')
    cy.findByRole('button', { name: 'Previous' }).should('be.enabled').click()
    cy.findByText('Edit ad type and amount').should('be.visible')
    cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
    cy.findByText('Edit payment details').should('be.visible')
    cy.findByTestId('dt_dropdown_display').click()
    cy.findByText('30 minutes').should('be.visible').click({ force: true })
    if (adType == 'buy') {
      cy.get('.dc-input__trailing-icon')
        .first()
        .trigger('touchstart')
        .trigger('touchend')
      cy.findByPlaceholderText('Add').should('be.visible')
    } else if (adType == 'sell') {
      cy.findByTestId('dt_payment_method_card_add_icon')
        .should('be.visible')
        .click()
      cy.c_addPaymentMethod(
        paymentIDForSecondPaymentType,
        secondPaymentMethod,
        rateType
      )
      cy.findByText(paymentIDForSecondPaymentType)
        .should('exist')
        .parent()
        .prev()
        .find('.dc-checkbox')
        .and('exist')
        .click()
    }
    cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
    cy.findByText('Edit ad conditions').should('be.visible')
    cy.findByRole('button', { name: 'Previous' }).should('be.enabled').click()
    cy.findByText('Edit payment details').should('be.visible')
    cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
    cy.findByText('Edit ad conditions').should('be.visible')
    cy.findByText('30 days').should('be.visible').click()
    cy.findByText('90%').should('be.visible').click()
    cy.findByPlaceholderText('All countries').click()
    cy.findAllByText('Preferred countries').should('be.visible')
    cy.findByText('All countries').should('be.visible').click()
    cy.findByText('Andorra').should('be.visible').click()
    cy.findByRole('button', { name: 'Apply' }).should('be.enabled').click()
    cy.findByText('Edit ad conditions').should('be.visible')
    cy.findByRole('button', { name: 'Save changes' })
      .should('be.enabled')
      .click()
    cy.findByTestId('dt_dropdown_container').should('be.visible').click()
    cy.findByText('Edit').parent().click()
    cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
    cy.findByText('Edit payment details').should('be.visible')
    cy.findByTestId('dt_dropdown_display').should('have.text', '30 minutes')
    if (adType == 'buy') {
      cy.findByPlaceholderText('Add').should('be.visible')
    } else if (adType == 'sell') {
      cy.findByText(paymentIDForSecondPaymentType).should('be.visible')
      cy.findByText(secondPaymentMethod).should('be.visible')
    }
    cy.findByRole('button', { name: 'Next' }).should('be.enabled').click()
    cy.findByText('Edit ad conditions').should('be.visible')
    cy.findByText('30 days').should(($el) => {
      const classForJoined = $el.attr('class').split(' ')
      const selectedClassForJoined = classForJoined.some((className) =>
        className.endsWith('--selected')
      )
      expect(selectedClassForJoined).to.be.true
    })
    cy.findByText('90%')
      .should('be.visible')
      .should(($el) => {
        const classForCompletionRate = $el.attr('class').split(' ')
        const selectedClassForCompletionRate = classForCompletionRate.some(
          (className) => className.endsWith('--selected')
        )
        expect(selectedClassForCompletionRate).to.be.true
      })
    cy.findByPlaceholderText('All countries').should('have.value', 'Andorra')
    cy.get('.wizard__main-step').prev().children().last().click()
    cy.findByText(`${(minOrder + 1).toFixed(2)} - ${maxOrder.toFixed(2)} USD`)
  }
)

Cypress.Commands.add('c_validateBuyerChattoSeller', () => {
  cy.findByTestId('testid').should('be.visible').click()
  cy.findByText(
    "Hello! This is where you can chat with the counterparty to confirm the order details.Note: In case of a dispute, we'll use this chat as a reference."
  ).should('be.visible')
  cy.get('.chat-footer-icon-container').click()
  cy.c_enterMessageFieldText()
  cy.get('input[type="file"]').selectFile(
    'cypress/fixtures/P2P/orderCompletion.png',
    { force: true }
  )
  cy.get('.chat-footer-icon-container').click()
  cy.get('.chat-messages-item--outgoing').should('have.length', 2)
  cy.get('.order-chat__messages-item-timestamp').should('have.length', 2)
})

Cypress.Commands.add('c_validateBuyerSellerClosedChat', () => {
  cy.findByTestId('testid').click()
  cy.get('.chat-messages-item-image').should('have.length', 3)
  cy.get('.chat-messages-item--incoming').should('have.length', 2)
  cy.get('.order-chat__messages-item-timestamp').should('have.length', 5)
  cy.findByText('This conversation is closed.').should('be.visible')
  cy.findByPlaceholderText('Enter message').should('not.exist')
})

Cypress.Commands.add('c_validateSellerChatToBuyer', () => {
  cy.findByTestId('testid').click()
  cy.findByText(
    "Hello! This is where you can chat with the counterparty to confirm the order details.Note: In case of a dispute, we'll use this chat as a reference."
  ).should('be.visible')
  cy.get('.chat-messages-item--incoming').should('have.length', 3)
  cy.get('.order-chat__messages-item-timestamp').should('have.length', 3)
  cy.get('.chat-messages-item-image').should('have.length', 2)
  cy.get('.chat-footer-icon-container').click()
  cy.get('input[type="file"]').selectFile(
    'cypress/fixtures/P2P/orderCompletion.png',
    { force: true }
  )
  cy.c_enterMessageFieldText()
  cy.get('.chat-footer-icon-container').click()
  cy.get('.chat-messages-item--outgoing').should('have.length', 2)
  cy.get('.chat-messages-item-image').should('have.length', 3)
})

Cypress.Commands.add('c_enterMessageFieldLength', (textLength) => {
  cy.findByPlaceholderText('Enter message')
    .parents('.dc-input__wrapper')
    .find('.dc-input__footer .dc-input__counter')
    .should('contain.text', `${textLength}/5000`)
})

Cypress.Commands.add('c_enterMessageFieldText', () => {
  cy.findByPlaceholderText('Enter message')
    .invoke('val')
    .then((text) => {
      let textLength = text.length
      cy.c_enterMessageFieldLength(textLength)
    })
  cy.findByPlaceholderText('Enter message').clear()
  cy.findByPlaceholderText('Enter message')
    .clear()
    .type('abc')
    .should('have.value', 'abc')
  cy.c_enterMessageFieldLength('abc'.length)
  let textLimitCheck = generateAccountNumberString(5000)
  cy.findByPlaceholderText('Enter message')
    .clear()
    .type(textLimitCheck)
    .should('have.value', textLimitCheck)
  cy.c_enterMessageFieldLength(textLimitCheck.length)
  cy.findByPlaceholderText('Enter message')
    .clear()
    .type(textLimitCheck + '1')
    .should('have.value', textLimitCheck)
  cy.c_enterMessageFieldLength(textLimitCheck.length)
  let textForField = generateAccountNumberString(20)
  cy.findByPlaceholderText('Enter message')
    .clear()
    .type(textForField)
    .should('have.value', textForField)
  cy.c_enterMessageFieldLength(textForField.length)
})
