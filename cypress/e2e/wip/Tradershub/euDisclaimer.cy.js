const sizes = ['desktop', 'mobile']

describe('QATEST-42150 Validate the EU statutory disclaimer in footer for EU users', () => {
  beforeEach(() => {
    cy.c_login({ user: 'eu' })
  })
  sizes.forEach((size) => {
    it(`Should validate the EU statutory disclaimer in footer for EU users on ${size}`, () => {
      cy.c_visitResponsive('/appstore/traders-hub', { size: size })
      cy.c_validateEUDisclaimer()
    })
  })
})

describe('QATEST-37723 Validate the EU statutory disclaimer in footer of EU account for DIEL users', () => {
  beforeEach(() => {
    cy.c_login({ user: 'diel' })
  })

  sizes.forEach((size) => {
    it(`Should validate the EU statutory disclaimer in footer of EU account for DIEL users on ${size}`, () => {
      cy.c_visitResponsive('/appstore/traders-hub', { size: size })
      cy.findByText('EU', { exact: true }).click({ force: true })
      cy.c_validateEUDisclaimer()
    })
  })
})
