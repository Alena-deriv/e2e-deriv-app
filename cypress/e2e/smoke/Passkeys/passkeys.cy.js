describe('QATEST-142511, QATEST-125357 - Passkeys Login Page Button Check', () => {
  const sizes = ['mobile', 'desktop']

  sizes.forEach((size) => {
    it('Should contain Passkeys Button on Mobile and should not on desktop.', () => {
      const isMobile = size == 'mobile' ? true : false
      cy.c_visitResponsive('', { enablePasskey: true, size: size })
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
    cy.c_login({ enablePasskey: true, size: 'mobile' })
    cy.c_skipPasskeysV2({ maxRetries: 20, withoutContent: true })
    cy.findByText('Effortless login with passkeys').should('not.exist')
  })
})
