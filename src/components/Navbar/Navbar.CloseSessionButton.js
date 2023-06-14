/* eslint-disable no-restricted-globals */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import _isEmpty from 'lodash/isEmpty'
import { BFX_TOKEN_COOKIE } from '../../constants/cookies'
import { changeUIModalState, logInformation } from '../../redux/actions/ui'

import WSActions from '../../redux/actions/ws'
import { isElectronApp } from '../../redux/config'
import { UI_MODAL_KEYS } from '../../redux/constants/modals'
import {
  getActiveStrategies,
  getFilteredLocalAlgoOrders,
} from '../../redux/selectors/ws'
import { removeCookie } from '../../util/cookies'
import closeElectronApp from '../../redux/helpers/close_electron_app'
import { LOG_LEVELS } from '../../constants/logging'

const homeUrl = process.env.REACT_APP_ENVIRONMENT === 'staging'
  ? 'https://bfx-ui-api.staging.bitfinex.com/'
  : 'https://honey.bitfinex.com'

const CloseSessionButton = () => {
  const activeStrategies = useSelector(getActiveStrategies)
  const algoOrders = useSelector(getFilteredLocalAlgoOrders)

  const needToProcessBeforeCloseApp = !_isEmpty(activeStrategies) || !_isEmpty(algoOrders)

  const dispatch = useDispatch()

  const { t } = useTranslation()

  const logout = () => {
    dispatch(WSActions.send(['auth.logout']))
    removeCookie(BFX_TOKEN_COOKIE)
    setTimeout(() => {
      // eslint-disable-next-line lodash/prefer-lodash-method
      location.replace(homeUrl)
    }, 1000)
  }

  const openCloseSessionModal = () => {
    dispatch(
      logInformation(
        'Close session requested.',
        LOG_LEVELS.INFO,
        'close_session_requested',
      ),
    )

    if (needToProcessBeforeCloseApp) {
      dispatch(
        logInformation(
          "Can't close session because there are active strategies or algo orders, offering user to close them first.",
          LOG_LEVELS.INFO,
          'close_session_progress',
        ),
      )
      dispatch(changeUIModalState(UI_MODAL_KEYS.CLOSE_SESSION_MODAL, true))
      return
    }

    dispatch(
      logInformation(
        'Closing session.',
        LOG_LEVELS.INFO,
        'close_session_success',
      ),
    )
    closeElectronApp()
  }

  const buttonHandler = () => (isElectronApp ? openCloseSessionModal() : logout())

  return (
    <button
      type='button'
      className='hfui-navbar__close-session hfui-exchangeinfobar__button'
      onClick={buttonHandler}
    >
      {t(isElectronApp ? 'navbar.closeSession' : 'navbar.logout')}
    </button>
  )
}

export default CloseSessionButton
