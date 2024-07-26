class QuickStrategy {
  get quickStrategyBotBuilder() {
    return cy.xpath('//*[@id="db-toolbar__get-started-button"]')
  }

  get quickStrategyTab() {
    return cy.xpath(
      `//span[@class="dc-text"and text()='${this.quickstrategyName1}']`
    )
  }

  get quickStrategyRunBtn() {
    return cy.findByTestId('qs-run-button')
  }

  get quickStrategyEditBtn() {
    return cy.xpath('//button[@class="dc-btn dc-btn--secondary"]')
  }

  get quickStrategyProfit() {
    return cy.findByTestId('dt_qs_profit')
  }

  get quickStrategyLoss() {
    return cy.findByTestId('dt_qs_loss')
  }

  get quickStrategySize() {
    return cy.xpath('//input[@name="size"]')
  }

  get quickStrategyMarketDropdown() {
    return cy.findByTestId('dt_qs_symbol').should('be.visible')
  }

  runBotQuickStrategy = () => {
    this.quickStrategyRunBtn.should('exist').click()
  }

  clickQuickStrategies = () => {
    this.quickStrategyBotBuilder.click()
    this.quickStrategyMarketDropdown.should('be.visible')
    cy.findAllByTestId('dt_qs_durationtype')
      .scrollIntoView()
      .should('be.visible')
  }

  /**  Click on strategy title from qstrategy modal
   * @param qstrategyName strategy Name
   */
  clickOnStrategyTab = (qstrategyName) => {
    this.quickstrategyName1 = qstrategyName
    this.quickStrategyTab.should('be.visible').click()
  }

  chooseTradeType = (isMobile = false) => {
    const index = isMobile ? 1 : 3
    cy.findByTestId('dt_qs_tradetype').should('have.value', 'Rise/Fall').click()
    cy.findAllByTestId('dt_themed_scrollbars')
      .eq(index)
      .should('be.visible')
      .within(() => {
        cy.findByText('Matches/Differs').click()
      })
  }

  fillUpContractSize = () => {
    this.quickStrategySize.clear()
    this.quickStrategySize.type('{moveToEnd}2')
  }

  fillUpLossProfitTreshold = () => {
    this.quickStrategyLoss.type('50')
    this.quickStrategyProfit.type('50')
  }
}

export default QuickStrategy
