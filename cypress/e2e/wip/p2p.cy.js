describe('QATEST-9999 - <Clickup description here>', () => {
  beforeEach(() => {
    cy.c_login()
    cy.c_visitResponsive('/appstore/traders-hub', { size: 'desktop' })
  })

  it('should be able to ...', () => {
    cy.log('Tests to go here!')
  })

  it('should be able to ...', () => {
    cy.log('Tests to go here!')
  })
})
