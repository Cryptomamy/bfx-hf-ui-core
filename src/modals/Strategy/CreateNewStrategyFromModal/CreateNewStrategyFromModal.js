import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'
import _find from 'lodash/find'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import MACD from '../../../components/StrategyEditor/templates/macd_cross'
import Modal from '../../../ui/Modal'
import Input from '../../../ui/Input'
import Dropdown from '../../../ui/Dropdown'
import Templates from '../../../components/StrategyEditor/templates'
import Tabs from '../../../ui/Tabs/Tabs'
import { getSortedByTimeStrategies } from '../../../redux/selectors/ws'
import { LOG_LEVELS } from '../../../constants/logging'

import {
  dropdownOptionsAdaptor,
  getTabs,
} from './CreateNewStrategyFromModal.helpers'
import { validateStrategyName } from '../../../components/StrategyEditor/StrategyEditor.helpers'
import { STRATEGY_SHAPE } from '../../../constants/prop-types-shapes'

const CreateNewStrategyFromModalOpen = ({
  onSubmit,
  onClose,
  isOpen,
  currentStrategy,
  logInformation,
}) => {
  const savedStrategies = useSelector(getSortedByTimeStrategies)
  const { t } = useTranslation()

  const currentStrategyLabel = currentStrategy?.label

  const savedStrategiesExists = !_isEmpty(savedStrategies)
  const tabs = useMemo(
    () => getTabs(t, savedStrategiesExists, !!currentStrategyLabel),
    [t, savedStrategiesExists, currentStrategyLabel],
  )

  const [label, setLabel] = useState('')
  const [activeTab, setActiveTab] = useState('')

  const [error, setError] = useState('')
  const [template, setTemplate] = useState(MACD.label)
  const [selectedStrategyLabel, setSelectedStrategyLabel] = useState(null)

  const isCurrentStrategyTabSelected = tabs[0].value === activeTab
  const isTemplatesTabSelected = tabs[1].value === activeTab
  const isDraftTabSelected = tabs[2].value === activeTab

  const onSubmitHandler = useCallback(() => {
    const err = validateStrategyName(label, t)
    setError(err)
    if (err) {
      return
    }

    let newStrategy

    if (isCurrentStrategyTabSelected) {
      newStrategy = currentStrategy
    }
    if (isTemplatesTabSelected) {
      newStrategy = _find(Templates, (_t) => _t.label === template)
    }
    if (isDraftTabSelected) {
      newStrategy = _find(
        savedStrategies,
        (_s) => _s.label === selectedStrategyLabel,
      )
    }

    onSubmit(label, newStrategy, false)
    logInformation(`New strategy draft created (${label})`, LOG_LEVELS.INFO, 'strategy_draft_init', {
      source: 'from',
      from: newStrategy?.label,
    })
    onClose()
  }, [
    currentStrategy,
    isCurrentStrategyTabSelected,
    isDraftTabSelected,
    isTemplatesTabSelected,
    label,
    onClose,
    onSubmit,
    savedStrategies,
    selectedStrategyLabel,
    t,
    template,
    logInformation,
  ])

  useEffect(() => {
    if (savedStrategiesExists) {
      setSelectedStrategyLabel(savedStrategies[0].label)
    }
  }, [savedStrategies, savedStrategiesExists])

  useEffect(() => {
    if (isTemplatesTabSelected) {
      setLabel(template)
      return
    }

    const newLabel = t('strategyEditor.copyOfStrategy', {
      strategyName: isDraftTabSelected
        ? selectedStrategyLabel
        : currentStrategyLabel,
    })
    setLabel(newLabel)
  }, [
    t,
    isTemplatesTabSelected,
    template,
    selectedStrategyLabel,
    setLabel,
    isDraftTabSelected,
    currentStrategyLabel,
  ])

  useEffect(() => {
    const firstEnabledTab = _find(tabs, (tab) => !tab.disabled)
    setActiveTab(firstEnabledTab.value)
  }, [tabs])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmitHandler}
      className='hfui-createnewstrategymodal'
      label={t('strategyEditor.newStrategyFromModalTitle')}
    >
      <div className='hfui-createnewstrategymodal__content'>
        <Tabs tabs={tabs} onTabClick={setActiveTab} activeTab={activeTab} />
        <Input
          type='text'
          placeholder={t('ui.name')}
          value={label}
          onChange={setLabel}
        />
        {isTemplatesTabSelected && (
          <Dropdown
            value={template}
            onChange={setTemplate}
            options={Templates}
            adapter={dropdownOptionsAdaptor}
          />
        )}
        {isDraftTabSelected && (
          <Dropdown
            value={selectedStrategyLabel}
            onChange={setSelectedStrategyLabel}
            options={savedStrategies}
            adapter={dropdownOptionsAdaptor}
          />
        )}
        {!_isEmpty(error) && <p className='error'>{error}</p>}
      </div>

      <Modal.Footer className='hfui-createnewstrategymodal__footer'>
        <Modal.Button primary onClick={onSubmitHandler}>
          {t('ui.createBtn')}
        </Modal.Button>
      </Modal.Footer>
    </Modal>
  )
}

CreateNewStrategyFromModalOpen.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  logInformation: PropTypes.func.isRequired,
  currentStrategy: PropTypes.shape(STRATEGY_SHAPE),
  isOpen: PropTypes.bool,
}

CreateNewStrategyFromModalOpen.defaultProps = {
  isOpen: true,
  currentStrategy: {},
}

export default CreateNewStrategyFromModalOpen
