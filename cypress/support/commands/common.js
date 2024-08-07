import { getOAuthUrl, setLoginUser } from '../helper/loginUtility'

Cypress.prevAppId = 0
Cypress.prevUser = ''
Cypress.isProd = Cypress.config().baseUrl === Cypress.env('prodURL')

/**
 * Custom command that allows us to use baseUrl + path and detect whether this is a responsive run or not.
 */
Cypress.Commands.add('c_visitResponsive', (path, options = {}) => {
  const {
    rateLimitCheck = false,
    enablePasskey = false,
    size = Cypress.env('defaultViewPortSize'),
  } = options
  if (size == 'mobile') {
    cy.viewport('iphone-xr')
  } else if (size == 'tablet') {
    cy.viewport('ipad-2')
  } else if (size == 'desktop') {
    cy.viewport('macbook-16')
  } else {
    throw new Error(
      'Incorrect Size provided please provide oneof the following: mobile, tablet or desktop'
    )
  }

  cy.visit(path)
  cy.log(`rateLimitCheck flag is set to: ${rateLimitCheck}`)
  if (rateLimitCheck == true) {
    cy.c_rateLimit({
      waitTimeAfterError: 15000,
      maxRetries: 5,
    })
    cy.then(() => {
      if (sessionStorage.getItem('c_rateLimitOnVisitOccured') == 'true') {
        cy.visit(path)
      }
    })
  }

  //Wait for relevant elements to appear (based on page)
  if (path.includes('region')) {
    cy.log('Home page Selected')
    cy.findByRole(
      'button',
      { name: 'whatsapp icon' },
      { timeout: 30000 }
    ).should('be.visible') //For the home page, this seems to be the best indicator that a page has fully loaded. It may change in the future.
  }

  if (path.includes('help-centre')) {
    cy.log('Help Centre Selected')
    cy.findByRole('heading', {
      name: 'Didn’t find your answer? We can help.',
    }).should('be.visible', { timeout: 30000 })
  }

  if (path.includes('traders-hub') || path === '/' || path === '') {
    if (size == 'mobile')
      cy.findAllByText("Trader's Hub").should('have.length', '1')
    else cy.findAllByText("Trader's Hub").should('have.length', '2')
    cy.log('Trader Hub Selected')
  }

  if (path.includes('action=signup')) {
    cy.findByRole('dialog').should('be.visible')
  }
  if (!enablePasskey) {
    cy.c_disablePasskey()
  }
})

Cypress.Commands.add('c_login', (options = {}) => {
  const {
    user = 'masterUser',
    app = '',
    backEndProd = false,
    rateLimitCheck = false,
    enablePasskey = false,
    relogin = false,
    size = Cypress.env('defaultViewPortSize'),
  } = options
  const { loginEmail, loginPassword } = setLoginUser(user, {
    backEndProd: backEndProd,
  })
  if (!(loginEmail && loginPassword)) {
    throw new Error(`User/Password is not on file`)
  }
  if (relogin) {
    Cypress.env('oAuthUrl', '<empty>')
  }
  cy.c_visitResponsive('/endpoint', {
    rateLimitCheck: rateLimitCheck,
    enablePasskey: enablePasskey,
    size: size,
  })
  cy.c_setDerivAppEndpoint(app, backEndProd, user).then(() => {
    if (Cypress.env('oAuthUrl') == '<empty>') {
      getOAuthUrl(
        (oAuthUrl) => {
          Cypress.env('oAuthUrl', oAuthUrl)
          const urlParams = new URLSearchParams(Cypress.env('oAuthUrl'))
          const token = urlParams.get('token1')

          Cypress.env('oAuthToken', token)
          cy.c_doOAuthLogin(app, {
            rateLimitCheck: rateLimitCheck,
            enablePasskey: enablePasskey,
            size: size,
          })
        },
        loginEmail,
        loginPassword
      )
    } else {
      cy.log('oAuthUrl is not empty')
      cy.c_doOAuthLogin(app, {
        rateLimitCheck: rateLimitCheck,
        enablePasskey: enablePasskey,
        size: size,
      })
    }
  })

  if (!enablePasskey) {
    cy.log('mean we stopping passkey')
    cy.c_disablePasskey()
  }
})

Cypress.Commands.add('c_setDerivAppEndpoint', (app, backEndProd, user) => {
  if (app == 'doughflow') {
    Cypress.env('configServer', Cypress.env('doughflowConfigServer'))
    Cypress.env('configAppId', Cypress.env('doughflowConfigAppId'))
  } //Use production server and app id for production base url
  else if (Cypress.isProd) {
    Cypress.env('configServer', Cypress.env('prodServer'))
    Cypress.env('configAppId', Cypress.env('prodAppId'))
  } else if (!Cypress.isProd && backEndProd == true) {
    Cypress.env('configServer', Cypress.env('prodServer'))
    Cypress.env('configAppId', Cypress.env('stgAppId'))
  } else {
    Cypress.env('configServer', Cypress.env('stdConfigServer'))
    Cypress.env('configAppId', Cypress.env('stdConfigAppId'))
  }

  //If we're switching between apps or users, we'll need to re-authenticate
  if (
    Cypress.prevAppId != Cypress.env('configAppId') ||
    Cypress.prevUser != user
  ) {
    cy.log('prevAppId: ' + Cypress.prevAppId)
    cy.log(`Prev User: ${Cypress.prevUser}`)
    Cypress.prevUser = user
    Cypress.prevAppId = Cypress.env('configAppId')
    Cypress.env('oAuthUrl', '<empty>')
  }

  cy.log('server: ' + Cypress.env('configServer'))
  cy.log('appId: ' + Cypress.env('configAppId'))

  //Do not set the server for production as it uses two servers: green & blue
  if (!Cypress.isProd) {
    localStorage.setItem('config.server_url', Cypress.env('configServer'))
    localStorage.setItem('config.app_id', Cypress.env('configAppId'))
  }
})

Cypress.Commands.add('c_doOAuthLogin', (app, options = {}) => {
  const {
    rateLimitCheck = false,
    enablePasskey = false,
    size = Cypress.env('defaultViewPortSize'),
  } = options
  cy.c_visitResponsive(Cypress.env('oAuthUrl'), {
    rateLimitCheck: rateLimitCheck,
    enablePasskey: enablePasskey,
    size: size,
  })
  cy.document().then((doc) => {
    const launchModal = doc.querySelector('[data-test-id="launch-modal"]')
    if (launchModal) {
      cy.findByRole('button', { name: 'Ok' }).click()
    }
  })

  //Complete trading assessment for EU accounts if it's there
  cy.findByText('Trading Experience Assessment')
    .should(() => {})
    .then(($el) => {
      if ($el.length) {
        cy.findByRole('button', { name: 'OK' }).click()
        cy.c_completeTradingAssessment()
        cy.findByRole('button', { name: 'OK' }).click()
        cy.log('Completed trading assessment!!!')
      }
    })

  if (size == 'desktop') {
    cy.findAllByText("Trader's Hub").should('have.length', '2')
  } else {
    cy.findAllByText("Trader's Hub").should('have.length', '1')
  }
  if (app != 'wallets') {
    cy.c_checkTotalAssetSummary()
  } else if (app == 'wallets') {
    cy.c_checkWalletIsLoaded()
  }
})

Cypress.Commands.add('c_mt5login', () => {
  cy.c_visitResponsive(Cypress.env('mt5BaseUrl') + '/terminal', {
    size: 'desktop',
  })
  cy.findByRole('button', { name: 'Accept' }).click()
  cy.findByPlaceholderText('Enter Login').click()
  cy.findByPlaceholderText('Enter Login').type(
    Cypress.env('credentials').test.mt5User.ID
  )
  cy.findByPlaceholderText('Enter Password').click()
  cy.findByPlaceholderText('Enter Password').type(
    Cypress.env('credentials').test.mt5User.PSWD
  )
  cy.findByRole('button', { name: 'Connect to account' }).click()
})

//To be added on hotspots as an edge case only when constantly hitting rate limits
Cypress.Commands.add('c_rateLimit', (options = {}) => {
  const {
    retryCount = 1,
    maxRetries = 3,
    waitTimeAfterError = 60000,
    retryWaitTime = 1000,
    isLanguageTest = false,
  } = options

  cy.get('#modal_root, .modal-root', { timeout: 10000, log: false }).then(
    ($element) => {
      if ($element.children().length > 0) {
        cy.document({ log: false }).then((doc) => {
          const rateLimitError = doc.querySelector(
            'div[class="unhandled-error"]'
          )
          if (rateLimitError) {
            cy.log(
              `Rate limit detected, waiting for ${waitTimeAfterError / 1000}s before retrying...`
            )
            sessionStorage.setItem('c_rateLimitOnVisitOccured', true)
            cy.wait(waitTimeAfterError, { log: false })
            cy.get('div[class="unhandled-error"]').within(() => {
              cy.get('button[type="submit"]', { log: false }).click({
                log: false,
              })
            })
            cy.c_loadingCheck()
            if (isLanguageTest == true) {
              sessionStorage.setItem('c_rateLimitOccurred', true)
            }
            cy.c_rateLimit({ ...options, retryCount: retryCount + 1 })
            options.retryCount = 1
          }
        })
      } else if (retryCount < maxRetries) {
        cy.log(
          `No rate limit modal found, retrying in ${retryWaitTime / 1000}s... Attempt number: ${retryCount}`
        )
        cy.wait(retryWaitTime, { log: false })
        cy.c_rateLimit({ ...options, retryCount: retryCount + 1 })
      } else {
        cy.log(
          `Max retries reached without detecting a rate limit error, after ${retryCount} attempts`
        )
      }
    }
  )
})

Cypress.Commands.add('c_transferLimit', (transferMessage) => {
  cy.get('.wallets-cashier-content', { timeout: 10000 })
    // IF ADDED ONLY IF CONDITION WORKS, IF REMOVED ONLY ELSE CONDITION WORKS
    // .contains(
    //   `You can only perform up to 10 transfers a day. Please try again tomorrow.` ||
    //     "You have exceeded 200.00 USD in cumulative transactions. To continue, you will need to verify your identity.",
    //     {timeout: 5000}
    // )
    .then(($element) => {
      if (
        $element
          .text()
          .includes(
            `You can only perform up to 10 transfers a day. Please try again tomorrow.` ||
              'You have exceeded 200.00 USD in cumulative transactions. To continue, you will need to verify your identity.'
          )
      ) {
        cy.contains('Reset error').then(($resetElement) => {
          if ($resetElement.length) {
            cy.wrap($resetElement).click()
          }
          cy.findAllByText(/Wallet/, { timeout: 10000 }).should('exist')
        })
      } else {
        cy.findByText('Your transfer is successful!', {
          exact: true,
        }).should('be.visible')
        cy.contains(transferMessage)
      }
    })
})

Cypress.on('uncaught:exception', (err, runnable, promise) => {
  console.log(err)
  return false
})

//Select Real account from Dtrader
Cypress.Commands.add('c_selectRealAccount', () => {
  cy.findByTestId('dt_acc_info').should('be.visible').click()
  cy.findByText('Real').should('be.visible').click()
  cy.get('acc-switcher__new-account').should('not.exist')
  cy.get('.dc-content-expander__content').should('be.visible').click()
  cy.findByTestId('dt_acc_info').should('be.visible')
})

//Select Demo account from Dtrader
Cypress.Commands.add('c_selectDemoAccount', () => {
  cy.findByTestId('dt_acc_info').should('be.visible').click()
  cy.findByText('Demo').should('be.visible').click()
  cy.get('.dc-content-expander__content').should('be.visible').click()
  cy.findByTestId('dt_acc_info').should('be.visible')
})

Cypress.Commands.add(
  'c_emailVerification',
  (requestType, accountEmail, options = {}) => {
    const {
      retryCount = 0,
      maxRetries = 3,
      baseUrl = Cypress.env('configServer') + '/events',
      isMT5ResetPassword = false,
      isViaAPI = false,
    } = options
    cy.log(`Visit ${baseUrl}`)
    const userID = Cypress.env('qaBoxLoginEmail')
    const userPSWD = Cypress.env('qaBoxLoginPassword')
    cy.visit(
      `https://${Cypress.env('qaBoxLoginEmail')}:${Cypress.env(
        'qaBoxLoginPassword'
      )}@${baseUrl}`,
      { log: false }
    )
    cy.origin(
      `https://${Cypress.env('qaBoxLoginEmail', { log: false })}:${Cypress.env(
        'qaBoxLoginPassword',
        { log: false }
      )}@${baseUrl}`,
      {
        args: [requestType, accountEmail, isMT5ResetPassword, isViaAPI],
      },
      ([requestType, accountEmail, isMT5ResetPassword, isViaAPI]) => {
        let verification_code
        cy.document().then((doc) => {
          const allRelatedEmails = Array.from(
            doc.querySelectorAll(`a[href*="${requestType}"]`)
          )
          if (allRelatedEmails.length) {
            const verificationEmail = allRelatedEmails.pop()
            cy.wrap(verificationEmail).click()
            ;(() =>
              isMT5ResetPassword
                ? cy.get('p')
                : cy.get('p').filter(`:contains('${accountEmail}')`).last())()
              .should('be.visible')
              .parent()
              .children()
              .contains('a', Cypress.config('baseUrl'))
              .invoke('attr', 'href')
              .then((href) => {
                if (href) {
                  Cypress.env('verificationUrl', href)
                  const code = href.match(
                    /code=([A-Za-z0-9]{8})|code=([A-Za-z0-9]{6})/
                  )
                  if (code) {
                    verification_code = code[1] || code[2]
                  }
                  isViaAPI
                    ? cy.task('setVerificationCode', verification_code)
                    : Cypress.env('walletsWithdrawalCode', verification_code)
                  cy.log('Verification link found')
                } else {
                  cy.log('Verification link not found')
                }
              })
          } else {
            cy.log('email not found')
          }
        })
      }
    )
    cy.on('fail', (err) => {
      rotateCreds()
      throw err
    })
    cy.then(() => {
      //Rotating credentials
      rotateCreds()
      //Retry finding email after 1 second interval
      if (retryCount < maxRetries && !Cypress.env('verificationUrl')) {
        cy.log(`Retrying... Attempt number: ${retryCount + 1}`)
        cy.wait(1000)
        cy.c_emailVerification(requestType, accountEmail, {
          ...options,
          retryCount: retryCount + 1,
        })
      }
      if (retryCount > maxRetries) {
        throw new Error(
          `Signup URL extraction failed after ${maxRetries} attempts.`
        )
      }
    })
    const rotateCreds = () => {
      Cypress.env('qaBoxLoginEmail', userID)
      Cypress.env('qaBoxLoginPassword', userPSWD)
    }
  }
)

Cypress.Commands.add(
  'c_retrieveVerificationLinkUsingMailisk',
  (account, subject, timestamp, timeout) => {
    cy.mailiskSearchInbox(Cypress.env('mailiskNamespace'), {
      to_addr_prefix: account,
      subject_includes: subject.toLowerCase(),
      wait: true,
      ...(timestamp ? { from_timestamp: timestamp } : {}),
      ...(timeout ? { timeout: timeout } : {}),
    }).then((response) => {
      const email = response.data[0]
      const verificationLink = email.text.match(/https?:\/\/\S*redirect\?\S*/)
      cy.log(verificationLink)
      Cypress.env('verificationUrl', verificationLink[0])
    })
  }
)

Cypress.Commands.add('c_loadingCheck', () => {
  cy.findByTestId('dt_initial_loader', { timeout: 60000 }).should('not.exist')
})

/**
 * Method to Logout from Application.
 * This will click on account dropdown and click on logout link
 */
Cypress.Commands.add('c_logout', () => {
  cy.get('#dt_core_header_acc-info-container').click()
  cy.findByText('Log out').should('be.visible')
  cy.get('[data-testid="acc-switcher"]').within(() => {
    cy.contains('Log out').click()
  })
})
Cypress.Commands.add('c_walletLogout', () => {
  cy.visit('/account/personal-details')
  cy.findByText('Log out').should('exist')
  cy.findByText('Log out').click()
})

/*
  Usage cy.c_createCRAccount({country_code: 'gh', other_keys: 'value'}) or you may not pass in anything to go with default.
  Works for CR countries as well as DIEL - non-EU account.
*/
Cypress.Commands.add('c_createCRAccount', (clientData, options = {}) => {
  const { size = Cypress.env('defaultViewPortSize') } = options
  cy.c_visitResponsive('/', { size: size })
  // Call Verify Email and then set the Verification code in env
  try {
    cy.task('wsConnect')
    cy.task('verifyEmailTask').then((accountEmail) => {
      cy.c_emailVerification('account_opening_new.html', accountEmail, {
        isViaAPI: true,
      })
      cy.task('createCRAccountTask', {
        clientData,
      }).then(() => {
        // Updating Cypress environment variables with the new email
        const currentCredentials = Cypress.env('credentials')
        currentCredentials.test.masterUser.ID = accountEmail
        Cypress.env('credentials', currentCredentials)
        //Reset oAuthUrl otherwise it will use the previous URL
        Cypress.env('oAuthUrl', '<empty>')
      })
    })
  } catch (e) {
    console.error('An error occurred during the account creation process:', e)
  } finally {
    cy.task('wsDisconnect')
  }
})

/*
  Usage cy.c_createMFAccount({country_code: 'de', other_keys: 'value'}) or you may not pass in anything to go with default.
  Works for MF countries as well as DIEL - EU account.
*/
Cypress.Commands.add('c_createMFAccount', (clientData, options = {}) => {
  const { size = Cypress.env('defaultViewPortSize') } = options
  cy.c_visitResponsive('/', { size: size })
  // Call Verify Email and then set the Verification code in env
  try {
    cy.task('wsConnect')
    cy.task('verifyEmailTask').then((accountEmail) => {
      cy.c_emailVerification('account_opening_new.html', accountEmail, {
        isViaAPI: true,
      })
      cy.task('createMFAccountTask', {
        clientData,
      }).then(() => {
        // Updating Cypress environment variables with the new email
        const currentCredentials = Cypress.env('credentials')
        currentCredentials.test.masterUser.ID = accountEmail
        Cypress.env('credentials', currentCredentials)
        //Reset oAuthUrl otherwise it will use the previous URL
        Cypress.env('oAuthUrl', '<empty>')
      })
    })
  } catch (e) {
    console.error('An error occurred during the account creation process:', e)
  } finally {
    cy.task('wsDisconnect')
  }
})

/*
  Usage cy.c_createDemoAccount({country_code: 'ke'}) or you may not pass in anything to go with default.
  Works either CR or MF countries.
*/
Cypress.Commands.add('c_createDemoAccount', (clientData, options = {}) => {
  const { size = Cypress.env('defaultViewPortSize') } = options
  cy.c_visitResponsive('/', { size: size })
  // Call Verify Email and then set the Verification code in env
  try {
    cy.task('wsConnect')
    cy.task('verifyEmailTask').then((accountEmail) => {
      cy.c_emailVerification('account_opening_new.html', accountEmail, {
        isViaAPI: true,
      })
      cy.task('createVirtualAccountTask', {
        clientData,
      }).then(() => {
        // Updating Cypress environment variables with the new email
        const currentCredentials = Cypress.env('credentials')
        currentCredentials.test.masterUser.ID = accountEmail
        Cypress.env('credentials', currentCredentials)
        //Reset oAuthUrl otherwise it will use the previous URL
        Cypress.env('oAuthUrl', '<empty>')
      })
    })
  } catch (e) {
    console.error('An error occurred during the account creation process:', e)
  } finally {
    cy.task('wsDisconnect')
  }
})

Cypress.Commands.add('c_closeModal', () => {
  cy.log('Closing the modal')
  cy.get('.dc-modal').within(() => {
    cy.get('.currency-selection-modal__header .close-icon').click()
  })
})

Cypress.Commands.add('c_waitUntilElementIsFound', (options = {}) => {
  const {
    cyLocator,
    locator,
    retry = 0,
    maxRetries = 3,
    timeout = 500,
  } = options
  let found = false
  cy.c_loadingCheck()
  cy.c_closeNotificationHeader()
  if (locator) {
    cy.document().then((doc) => {
      const element = doc.querySelector(locator)
      recurse(element)
    })
  } else {
    cyLocator()
      .should((_) => {})
      .then(($el) => {
        recurse($el.length)
      })
  }

  const recurse = (el) => {
    if (el) {
      cy.log(`Element found in attempt number ${retry}!`)
      found = true
      return
    } else if (!el && retry < maxRetries && !found) {
      cy.log(`Retrying... Attempt number: ${retry + 1}`)
      cy.reload()
      cy.wait(timeout)
      cy.c_loadingCheck()
      cy.c_closeNotificationHeader()
      cy.c_waitUntilElementIsFound({ ...options, retry: retry + 1 })
    } else {
      throw new Error(`Element not found after ${maxRetries} attempt(s)!`)
    }
  }
})

Cypress.Commands.add('c_getCurrentExchangeRate', (fromCurrency, toCurrency) => {
  cy.request({
    url: `https://api.coinbase.com/v2/exchange-rates?currency=${fromCurrency}`,
  }).then((response) => {
    const responseBody = response.body
    expect(response.status).to.be.eq(200)
    expect(responseBody.data.currency).to.be.eql(fromCurrency)
    let exchangeRate = responseBody.data.rates[toCurrency]
    sessionStorage.setItem(
      `c_conversionRate${fromCurrency}To${toCurrency}`,
      exchangeRate
    )
  })
})

Cypress.Commands.add('c_closeNotificationHeader', () => {
  cy.document().then((doc) => {
    let notification = doc.querySelector('.notification__header')
    if (notification) {
      cy.log('Notification header appeared')
      cy.get('.notification__text-body')
        .invoke('text')
        .then((text) => {
          cy.log(text)
        })
      cy.findAllByRole('button', { name: 'Close' })
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click()
        .and('not.exist')
      notification = null
      cy.then(() => {
        cy.c_closeNotificationHeader()
      })
    } else {
      cy.log('Notification header did not appear')
    }
  })
})

Cypress.Commands.add('c_skipPasskeysV2', (options = {}) => {
  const {
    language = 'english',
    retryCount = 0,
    maxRetries = 3,
    withoutContent = false,
  } = options
  if (withoutContent == true) {
    cy.get('.effortless-login-modal')
      .should(() => {})
      .then(($el) => {
        if ($el.length) {
          cy.log('Skipped Passkeys prompt !!!')
          cy.get('.effortless-login-modal__header').click()
        } else if (retryCount < maxRetries) {
          cy.wait(300)
          cy.log(
            `Passkeys prompt did not appear, Retrying... Attempt ${retryCount + 1}`
          )
          cy.c_skipPasskeysV2({ ...options, retryCount: retryCount + 1 })
        }
      })
  } else {
    cy.fixture('common/common.json').then((langData) => {
      const lang = langData[language]
      cy.findByText(lang.passkeysModal.title)
        .should(() => {})
        .then(($el) => {
          if ($el.length) {
            cy.findByText(lang.passkeysModal.maybeLaterBtn).click()
            cy.log('Skipped Passkeys prompt !!!')
          } else if (retryCount < maxRetries) {
            cy.wait(300)
            cy.log(
              `Passkeys prompt did not appear, Retrying... Attempt ${retryCount + 1}`
            )
            cy.c_skipPasskeysV2({ ...options, retryCount: retryCount + 1 })
          }
        })
    })
  }
})

Cypress.Commands.add('c_disablePasskey', (options = {}) => {
  cy.window().then((win) => {
    cy.log('Checking for passkey in local storage')
    const gbFeaturesCache = win.localStorage.getItem('gbFeaturesCache')

    if (gbFeaturesCache) {
      const parsedCache = JSON.parse(gbFeaturesCache)
      const data = parsedCache[0][1].data.features

      if (data.service_passkeys && data.web_passkeys) {
        cy.log('Disabling passkey in local storage')
        data.service_passkeys.defaultValue = false
        data.web_passkeys.defaultValue = false

        const updatedCache = JSON.stringify(parsedCache)
        win.localStorage.setItem('gbFeaturesCache', updatedCache)

        // make sure passkey in local storage is updated to false
        cy.window().then((win) => {
          const updatedCache = JSON.parse(
            win.localStorage.getItem('gbFeaturesCache')
          )
          expect(
            updatedCache[0][1].data.features.service_passkeys.defaultValue
          ).to.equal(false)
          expect(
            updatedCache[0][1].data.features.web_passkeys.defaultValue
          ).to.equal(false)
        })
      } else {
        cy.log('No passkey detected in local storage data features')
      }
    } else {
      cy.log('No gbFeaturesCache found in local storage')
    }

    cy.log('Checking for show_effortless_login_modal in local storage')
    const effortlessLoginModal = win.localStorage.getItem(
      'show_effortless_login_modal'
    )

    const key = 'show_effortless_login_modal'
    const value = 'false'

    if (window.localStorage.getItem(key) !== null) {
      // Key exists, update its value
      window.localStorage.setItem(key, value)
      cy.log('key found, updated it')
    } else {
      // Key does not exist, add the key
      window.localStorage.setItem(key, value)
      cy.log('key not found, so added it')
    }
  })
})

Cypress.Commands.add(
  'c_clickToOpenInSamePage',
  { prevSubject: true },
  (locator) => {
    cy.wrap(locator).invoke('attr', 'target', '_self').click()
  }
)

Cypress.Commands.add('c_uiLogin', (options = {}) => {
  const {
    username = Cypress.env('credentials').production.masterUser.ID,
    password = Cypress.env('credentials').production.masterUser.PSWD,
    size = Cypress.env('defaultViewPortSize'),
  } = options
  cy.c_visitResponsive('/', { size: size })
  cy.findByRole('button', { name: 'Log in' }).click()
  cy.findByLabelText('Email').type(username)
  cy.findByLabelText('Password').type(password, { log: false })
  cy.findByRole('button', { name: 'Log in' }).click()
})

/**
 * Method to perform Authorization and Create Application ID
 * by calling ApplicationRegister API call
 */
Cypress.Commands.add('c_createApplicationId', () => {
  try {
    cy.log('Registering Url...')

    cy.c_login_setToken() // We need Auth Token for running WS API calls.
    cy.task('wsConnect')
    cy.c_authorizeCall()

    cy.task('registerNewAppIDTask').then((response) => {
      const appId = response
      cy.log('The Newly Generated App Id is: ', appId)
      Cypress.env('updatedAppId', appId)

      cy.task('wsDisconnect')

      Cypress.config('baseUrl', Cypress.env('appRegisterUrl'))

      Cypress.env('configAppId', appId)
      Cypress.env('stdConfigAppId', appId)
      Cypress.prevAppId = appId
      Cypress.env('oAuthUrl', '<empty>') //This needs to be empty as we need to auto-auth the app after first login.

      cy.log(
        '...Url registered and baseUrl switched. AppId = ' +
          Cypress.env('updatedAppId')
      )
    })
  } catch (e) {
    console.error('An error occurred during the app registration process:', e)
  }
})

Cypress.Commands.add('c_login_setToken', () => {
  getOAuthUrl(
    (oAuthUrl) => {
      Cypress.env('oAuthUrl', oAuthUrl)

      const urlParams = new URLSearchParams(Cypress.env('oAuthUrl'))
      const token = urlParams.get('token1')

      Cypress.env('oAuthToken', token) //Set token here
    },
    Cypress.env('credentials').test.masterUser.ID,
    Cypress.env('credentials').test.masterUser.PSWD
  )
})
Cypress.Commands.add(
  'getCurrentExchangeRate',
  (fromCurrency, toCurrency, amount) => {
    cy.request({
      method: 'GET',
      url: 'https://api.coinbase.com/v2/exchange-rates',
      qs: {
        currency: fromCurrency,
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      const currentExchangeRate_fullList = JSON.stringify(response.body)
      const regexp = new RegExp(`${toCurrency}":"([^"]+)"`)
      const getOnlyRelatedCurrencyExchangeRate =
        currentExchangeRate_fullList.match(regexp)[1]
      const getFinalExchangeRate =
        getOnlyRelatedCurrencyExchangeRate.substr(0, 8) +
        getOnlyRelatedCurrencyExchangeRate.substr(11)
      const calculatedFinalExhangeRate =
        parseFloat(getFinalExchangeRate) * amount
      const calculatedFinalExhangeRate_roundOff =
        calculatedFinalExhangeRate.toFixed(2)
      cy.wrap(calculatedFinalExhangeRate_roundOff).as(
        'calculatedFinalExhangeRate_roundOff'
      )
    })
  }
)

Cypress.Commands.add('c_visitBackOffice', (options = {}) => {
  const { login = true } = options
  cy.viewport('macbook-16')
  cy.visit(
    `https://${Cypress.env('configServer')}${Cypress.env('qaBOEndpoint')}`
  )
  if (login) {
    cy.findByText('Please login.').click()
  }
})

Cypress.Commands.add('c_validateLogin', (email, password, oldPassword) => {
  cy.origin(
    Cypress.env('stdConfigServer'),
    { args: { email, password, oldPassword } },
    function ({ email, password, oldPassword }) {
      Cypress.on('uncaught:exception', function (err) {
        if (err.message.includes('Unexpected token')) return false
      })
      // Validate I cannot login with old password
      cy.get('input[type="email"]').clear().type(email)
      cy.get('input[type="password"]').clear().type(oldPassword, { log: false })
      cy.get('button[name="login"]').click()
      cy.contains(
        'Your email and/or password is incorrect. Perhaps you signed up with a social account?'
      ).should('be.visible')
      // Successful login
      cy.get('input[type="email"]').clear().type(email)
      cy.get('input[type="password"]').clear().type(password, { log: false })
      cy.get('button[name="login"]').click()
    }
  )
})
