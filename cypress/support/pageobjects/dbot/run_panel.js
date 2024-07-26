class RunPanel {
  get transactionsTab() {
    return cy.findByText('Transactions')
  }

  get totalProfitLoss() {
    return cy.get('div.run-panel__stat-amount')
  }

  totalProfitLossEl = 'div.run-panel__stat-amount'

  get profitLossValue() {
    return cy.get("div.run-panel__stat-amount span[data-testid='dt_span']")
  }

  get runPanelScrollbar() {
    return cy.get("div[data-testid='dt_themed_scrollbars']").last()
  }
  get journalTab() {
    return cy.get("li[id='db-run-panel-tab__journal']")
  }

  get beforePurchase() {
    return cy.get('div.journal__text.journal__text--info').last()
  }

  get afterPurchase() {
    return cy.get('div.journal__text.journal__text--success').last()
  }

  get secondBeforePurchaseText() {
    return cy.get('div.journal__text.journal__text--info').eq(-2)
  }
}

export default RunPanel
