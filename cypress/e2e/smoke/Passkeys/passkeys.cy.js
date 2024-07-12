describe('QATEST-142511, QATEST-125357 - Passkeys Login Page Button Check', () => {
  const size = ['small', 'desktop']

  size.forEach((size) => {
    it('Should contain Passkeys Button in Mobile Responsive and Should not contain on Desktop Version', () => {
      const isMobile = size == 'small' ? true : false
      cy.c_visitResponsive('', size, { enablePasskey: true })
      cy.c_setDerivAppEndpoint()
      cy.findByRole('button', { name: 'Log in' }).click()
      if (isMobile) {
        cy.findByLabelText('Login with passkeys').should('be.visible')
      } else {
        cy.findByLabelText('Login with passkeys').should('not.visible')
      }
    })
  })

  it('Should be able to select maybe later in mobile', () => {
    cy.c_login({ enablePasskey: true })
    cy.c_visitResponsive('', 'small', { enablePasskey: true })
    cy.c_skipPasskeysV2({ maxRetries: 20, withoutContent: true })
    cy.findByText('Effortless login with passkeys').should('not.exist')
  })
})
