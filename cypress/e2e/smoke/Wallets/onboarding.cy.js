const desktopSteps = [
  {
    backButtonExists: false,
    nextButtonName: 'Next',
    title: 'This is your Wallet',
    description: 'Manage your funds with Wallets.',
  },
  {
    backButtonExists: true,
    nextButtonName: 'Next',
    title: 'Select Demo or Real',
    description: 'Press the tab to switch between Demo or Real Wallets.',
  },
  {
    backButtonExists: true,
    nextButtonName: 'Next',
    title: 'Change your Wallet',
    description: 'Switch to a Wallet from the drop-down menu.',
  },
  {
    backButtonExists: true,
    nextButtonName: 'Next',
    title: 'Add more currencies',
    description: /Want Wallets in other currencies too/,
  },
  {
    backButtonExists: true,
    nextButtonName: 'Done',
    title: "Trader's Hub tour",
    description: 'Press here to repeat this tour.',
  },
]

const mobileSteps = [
  {
    backButtonExists: false,
    nextButtonName: 'Next',
    title: 'This is your Wallet',
    description: 'Manage your funds with Wallets.',
  },
  {
    backButtonExists: true,
    nextButtonName: 'Next',
    title: 'Switch between Wallets',
    description: 'Swipe left or right to switch between Wallets.',
  },
  {
    backButtonExists: true,
    nextButtonName: 'Next',
    title: 'Select your account type',
    description: 'Press the tab to switch between CFDs and Options accounts.',
  },
  {
    backButtonExists: true,
    nextButtonName: 'Next',
    title: 'Add more currencies',
    description: /Want Wallets in other currencies too/,
  },
  {
    backButtonExists: true,
    nextButtonName: 'Done',
    title: "Trader's Hub tour",
    description: 'Press here to repeat this tour.',
  },
]

const setupTest = () => {
  cy.findByTestId('dt_traders_hub_onboarding_icon').click()
  cy.get('#react-joyride-portal').should('exist')
  cy.get('[data-test-id="spotlight"]').should('exist')
}

const checkStep = (
  backButtonShouldExist,
  nextButtonName,
  title,
  description
) => {
  cy.findByRole('alertdialog').should('exist')
  cy.findByText(title).should('exist')
  cy.findByText(description).should('exist')
  cy.findByRole('button', { name: 'Back' }).should(
    backButtonShouldExist ? 'exist' : 'not.exist'
  )
  cy.findByRole('button', { name: nextButtonName, timeout: 3000 })
    .should('exist')
    .click()
}

const allWalletAdded = () => {
  cy.get('.wallets-add-more__carousel-wrapper')
    .find('button')
    .then((buttons) => {
      const buttonCount = buttons.filter(
        (index, button) => Cypress.$(button).text().trim() === 'Add'
      ).length
      cy.log(buttonCount)
      if (buttonCount === 0) {
        sessionStorage.setItem('c_walletExist', true)
      } else {
        sessionStorage.setItem('c_walletExist', false)
      }
    })
}

describe('QATEST-98504 - User Onboarding on Desktop for Fiat Wallets and Launch onboarding from different pages', () => {
  beforeEach(() => {
    cy.c_login({ user: 'walletloginEmail' })
  })

  it('User onboarding for desktop', () => {
    cy.c_visitResponsive('/', 'large')
    cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
    cy.findByText('CFDs', { exact: true }).should('be.visible')
    const walletCanBeAdded = sessionStorage.getItem('c_walletExist')
    setupTest('large')
    desktopSteps.forEach((step, index) => {
      cy.then(() => {
        if (index !== 3 && walletCanBeAdded == 'false') {
          checkStep(
            step.backButtonExists,
            step.nextButtonName,
            step.title,
            step.description
          )
        }
      })
    })
    cy.findByTestId('spotlight').should('not.exist')
  })
  it('User onboarding from USD wallet cashier', () => {
    cy.c_visitResponsive('/', 'large')
    cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
    cy.then(() => {
      const walletCanBeAdded = sessionStorage.getItem('c_walletExist')
      cy.findByText('Deposit').click()
      cy.get('iframe[class=wallets-deposit-fiat__iframe]').should('be.visible')
      setupTest('large')
      desktopSteps.forEach((step, index) => {
        cy.then(() => {
          if (index !== 3 && walletCanBeAdded == 'false') {
            checkStep(
              step.backButtonExists,
              step.nextButtonName,
              step.title,
              step.description
            )
          }
        })
      })
    })
    cy.findByTestId('spotlight').should('not.exist')
  })
  it('User onboarding from USD wallet compare account', () => {
    cy.c_visitResponsive('/', 'large')
    cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
    const walletCanBeAdded = sessionStorage.getItem('c_walletExist')
    cy.findByText('Compare accounts').click()
    cy.findByText('Compare CFDs accounts').should('be.visible')
    setupTest('large')
    desktopSteps.forEach((step, index) => {
      cy.then(() => {
        if (index !== 3 && walletCanBeAdded == 'false') {
          checkStep(
            step.backButtonExists,
            step.nextButtonName,
            step.title,
            step.description
          )
        }
      })
    })
    cy.findByTestId('spotlight').should('not.exist')
  })
  it('User onboarding from BTC wallet cashier', () => {
    cy.c_visitResponsive('/', 'large')
    cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
    cy.c_switchWalletsAccount('BTC')
    const walletCanBeAdded = sessionStorage.getItem('c_walletExist')
    cy.findByText('Deposit').click()
    setupTest('large')
    desktopSteps.forEach((step, index) => {
      cy.then(() => {
        if (index !== 3 && walletCanBeAdded == 'false') {
          checkStep(
            step.backButtonExists,
            step.nextButtonName,
            step.title,
            step.description
          )
        }
      })
    })
    cy.findByTestId('spotlight').should('not.exist')
  })
  it('User onboarding from BTC wallet traders hub', () => {
    cy.c_visitResponsive('/', 'large')
    cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
    cy.c_switchWalletsAccount('BTC')
    const walletCanBeAdded = sessionStorage.getItem('c_walletExist')
    setupTest('large')
    desktopSteps.forEach((step, index) => {
      cy.then(() => {
        if (index !== 3 && walletCanBeAdded == 'false') {
          checkStep(
            step.backButtonExists,
            step.nextButtonName,
            step.title,
            step.description
          )
        }
      })
    })
    cy.findByTestId('spotlight').should('not.exist')
  })
  it('User onboarding from BTC wallet compare account', () => {
    cy.c_visitResponsive('/', 'large')
    cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
    const walletCanBeAdded = sessionStorage.getItem('c_walletExist')
    cy.c_switchWalletsAccount('BTC')
    cy.findByText('Compare accounts').click()
    cy.findByText('Compare CFDs accounts').should('be.visible')
    setupTest('large')
    desktopSteps.forEach((step, index) => {
      cy.then(() => {
        if (index !== 3 && walletCanBeAdded == 'false') {
          checkStep(
            step.backButtonExists,
            step.nextButtonName,
            step.title,
            step.description
          )
        }
      })
    })
    cy.findByTestId('spotlight').should('not.exist')
  })
  it('User onboarding for mobile', () => {
    cy.c_visitResponsive('/', 'small')
    cy.c_WaitUntilWalletsPageIsLoaded()
    cy.c_skipPasskeysV2()
    const walletCanBeAdded = sessionStorage.getItem('c_walletExist')
    setupTest()
    mobileSteps.forEach((step, index) => {
      cy.then(() => {
        if (index !== 3 && walletCanBeAdded == 'false') {
          checkStep(
            step.backButtonExists,
            step.nextButtonName,
            step.title,
            step.description
          )
        }
      })
    })
    cy.findByTestId('spotlight').should('not.exist')
  })
  it('User onboarding from USD wallet cashier in responsive', () => {
    cy.c_visitResponsive('/', 'small')
    cy.c_WaitUntilWalletsPageIsLoaded()
    cy.c_skipPasskeysV2()
    const walletCanBeAdded = sessionStorage.getItem('c_walletExist')
    cy.findByText('Deposit').parent().should('be.visible').click()
    cy.get('iframe[class=wallets-deposit-fiat__iframe]').should('be.visible')
    setupTest()
    mobileSteps.forEach((step, index) => {
      cy.then(() => {
        if (index !== 3 && walletCanBeAdded == 'false') {
          checkStep(
            step.backButtonExists,
            step.nextButtonName,
            step.title,
            step.description
          )
        }
      })
    })
    cy.findByTestId('spotlight').should('not.exist')
  })
  it('User onboarding from BTC wallet tradershub in responsive', () => {
    cy.c_visitResponsive('/', 'small')
    cy.c_WaitUntilWalletsPageIsLoaded()
    cy.c_skipPasskeysV2()
    const walletCanBeAdded = sessionStorage.getItem('c_walletExist')
    setupTest()
    mobileSteps.forEach((step, index) => {
      cy.then(() => {
        if (index !== 3 && walletCanBeAdded == 'false') {
          checkStep(
            step.backButtonExists,
            step.nextButtonName,
            step.title,
            step.description
          )
        }
      })
    })
    cy.findByTestId('spotlight').should('not.exist')
  })
  it('User onboarding from BTC wallet cashier in responsive', () => {
    cy.c_visitResponsive('/', 'small')
    cy.c_WaitUntilWalletsPageIsLoaded()
    cy.c_skipPasskeysV2()
    cy.c_switchWalletsAccountResponsive('BTC')
    const walletCanBeAdded = sessionStorage.getItem('c_walletExist')
    setupTest()
    mobileSteps.forEach((step, index) => {
      cy.then(() => {
        if (index !== 3 && walletCanBeAdded == 'false') {
          checkStep(
            step.backButtonExists,
            step.nextButtonName,
            step.title,
            step.description
          )
        }
      })
    })
    cy.findByTestId('spotlight').should('not.exist')
  })

  it('User onboarding from BTC wallet compare account in responsive', () => {
    cy.c_visitResponsive('/', 'small')
    cy.c_WaitUntilWalletsPageIsLoaded()
    cy.c_skipPasskeysV2()
    const walletCanBeAdded = sessionStorage.getItem('c_walletExist')
    cy.c_switchWalletsAccountResponsive('BTC')
    cy.findByText('Compare accounts').click()
    cy.findByText('Compare CFDs accounts').should('be.visible')
    setupTest()
    mobileSteps.forEach((step, index) => {
      cy.then(() => {
        if (index !== 3 && walletCanBeAdded == 'false') {
          checkStep(
            step.backButtonExists,
            step.nextButtonName,
            step.title,
            step.description
          )
        }
      })
    })
    cy.findByTestId('spotlight').should('not.exist')
  })
})
