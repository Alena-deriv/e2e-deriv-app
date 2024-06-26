const pixelmatch = require('pixelmatch')
const { PNG } = require('pngjs')
import { derivApp } from '../locators'

const dTraderSharedLocators = derivApp.dTraderPage.sharedLocators
const dTraderDesktopLocators = derivApp.dTraderPage.desktopLocators

Cypress.Commands.add('c_selectSymbol', (symbolName) => {
  dTraderSharedLocators.symbolSelectBtn(20000).should('be.visible')
  dTraderSharedLocators.symbolSelectBtn().click()
  dTraderDesktopLocators.symbolExpandIcon().should('be.visible')
  cy.findByText('Synthetics').should('be.visible').click()
  cy.findAllByText(symbolName).last().click()
})

Cypress.Commands.add('c_selectTradeType', (category, tradeType) => {
  cy.findByTestId('dt_contract_dropdown').click()
  cy.findByText(category).click()
  cy.findByText(tradeType).should('be.visible').click()
})

Cypress.Commands.add('c_checkSymbolTickChange', (duration) => {
  let initialText
  dTraderDesktopLocators.chartCurrentPrice.invoke('text').then((text) => {
    initialText = text
  })
  cy.wait(duration)
  dTraderDesktopLocators.chartCurrentPrice.invoke('text').then((text) => {
    expect(text).to.not.eq(initialText)
  })
})

Cypress.Commands.add('c_selectTickDuration', (tickDuration) => {
  cy.findByTestId(`tick_step_${tickDuration}`).click({ force: true })
})

Cypress.Commands.add('c_validateDurationDigits', (tradetype) => {
  if (tradetype == 'Matches/Differs' || 'Even/Odd' || 'Over/Under') {
    cy.findByTestId('dt_dropdown_display').within(() => {
      cy.findByText('Ticks').should('be.visible')
    })
    cy.findByRole('button', { name: 'Ticks' }).should('not.exist')
    cy.findByRole('button', { name: 'Minutes' }).should('not.exist')
    cy.findByRole('button', { name: 'End time' }).should('not.exist')
    cy.findByRole('button', { name: 'Duration' }).should('not.exist')
  }
})

Cypress.Commands.add('c_matchStakePayoutValue', (tradeTypeParentLocator) => {
  let stakeValueUp
  let payoutValueUp
  cy.findByRole('button', { name: 'Stake' }).click()
  tradeTypeParentLocator().should('contain.text', 'Payout')

  tradeTypeParentLocator()
    .invoke('text')
    .then((textValue) => {
      payoutValueUp = textValue.trim().split(' ')[0].split('t')[1]
      cy.findByRole('button', { name: 'Payout' }).click()
      tradeTypeParentLocator().should('contain.text', 'Stake')

      tradeTypeParentLocator()
        .invoke('text')
        .then((textValue) => {
          stakeValueUp = textValue.trim().split(' ')[0].split('e')[1]
          expect(stakeValueUp).to.not.equal(payoutValueUp)
        })
    })
})

Cypress.Commands.add('c_checkTradeTablePage', (buyReference) => {
  cy.findByRole('link', { name: 'Trade table' }).click()
  cy.findByText('Type').should('be.visible')
  cy.findByText('Ref. ID').should('be.visible')
  cy.findByText('Currency').should('be.visible')
  cy.findByText('Buy time').should('be.visible')
  cy.findByText('Buy price').should('be.visible')
  cy.findByText('Sell time').should('be.visible')
  cy.findByText('Sell price').should('be.visible')
  cy.findByText('Profit / Loss').should('be.visible')
  cy.contains(buyReference).should('be.visible')
})

Cypress.Commands.add('c_checkStatementPage', (buyReference, sellReference) => {
  cy.findByRole('link', { name: 'Statement' }).click()
  cy.findByText('Type').should('be.visible')
  cy.findByText('Ref. ID').should('be.visible')
  cy.findByText('Currency').should('be.visible')
  cy.findByText('Transaction time').should('be.visible')
  cy.findByText('Transaction', { exact: true }).should('be.visible')
  cy.findByText('Credit/Debit').should('be.visible')
  cy.contains(buyReference).should('be.visible')
  cy.contains(buyReference).should('be.visible')
})

Cypress.Commands.add(
  'c_checkContractDetailsPage',
  (tradeType, stakeAmount, tickDuration) => {
    dTraderDesktopLocators.contractCard().click({ force: true })
    cy.findByText('Contract details').should('be.visible')
    cy.contains('span[data-testid="dt_span"]', stakeAmount).should('be.visible') //verify stake amount
    if (tradeType == 'Matches/Differs' || 'Even/Odd' || 'Over/Under') {
      cy.findByTestId('dt_duration_label').should(
        'contain.text',
        `${tickDuration} ticks`
      )
    }
    let buyReference, sellReference
    cy.findByTestId('dt_id_label')
      .get('.contract-audit__value')
      .invoke('text')
      .then((text) => {
        const match = text.match(/(\d+) \(Buy\)/)
        if (match) {
          buyReference = match[1]
        }
      })
      .then(() => {
        cy.findByTestId('dt_id_label')
          .get('.contract-audit__value2')
          .invoke('text')
          .then((text) => {
            const match = text.match(/(\d+) \(Sell\)/)
            if (match) {
              sellReference = match[1]
            }
          })
          .then(() => {
            cy.findAllByText('Reports').first().click()
            cy.c_checkTradeTablePage(buyReference)
            cy.c_checkStatementPage(buyReference, sellReference)
          })
      })
  }
)

Cypress.Commands.add(
  'c_compareElementScreenshots',
  (elementSelector, imageName1, imageName2, diffImageName) => {
    const timestamp = new Date().getTime()

    // To hide the timestamp in the footer
    cy.get('.dc-popover.server-time').invoke('css', 'visibility', 'hidden')

    cy.get(elementSelector).then(($el) => {
      const { top, left, width, height } = $el[0].getBoundingClientRect()

      cy.screenshot(`${imageName1}_${timestamp}`, {
        clip: { x: left, y: top, width, height },
      })

      cy.wait(2000) // 2 seconds wait time for new tick

      cy.screenshot(`${imageName2}_${timestamp}`, {
        clip: { x: left, y: top, width, height },
      })
    })

    cy.readFile(
      `./cypress/screenshots/chartStreaming.cy.js/${imageName1}_${timestamp}.png`,
      'base64'
    ).then((img1Data) => {
      cy.readFile(
        `./cypress/screenshots/chartStreaming.cy.js/${imageName2}_${timestamp}.png`,
        'base64'
      ).then((img2Data) => {
        const img1 = PNG.sync.read(Buffer.from(img1Data, 'base64'))
        const img2 = PNG.sync.read(Buffer.from(img2Data, 'base64'))
        const { width, height } = img1
        const diff = new PNG({ width, height })

        const mismatchedPixels = pixelmatch(
          img1.data,
          img2.data,
          diff.data,
          width,
          height,
          {
            threshold: 0.1, // this threshold is to adjust the sensitivity of the mismatched pixels
          }
        )

        cy.writeFile(
          `./cypress/screenshots/chartStreaming.cy.js/${diffImageName}_${timestamp}.png`,
          PNG.sync.write(diff),
          'base64'
        )

        expect(mismatchedPixels).to.be.greaterThan(0) // we expect the feed is updating, so the mismatchedPixels must be more than 0 to prove differences in both screenshots
      })
    })
  }
)
