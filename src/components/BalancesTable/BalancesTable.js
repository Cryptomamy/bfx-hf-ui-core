import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'
import _filter from 'lodash/filter'
import { VirtualTable } from '@ufx-ui/core'
import { useTranslation } from 'react-i18next'

import BalancesTableColumns from './BalancesTable.columns'
import { BALANCE_SHAPE } from '../../constants/prop-types-shapes'

import './style.css'

// balance < 0.000000004 will be rounded and shown as 0.00000000, so hide at this threshold
const DUST_THRESHOLD = 0.000000004

const BalancesTable = ({
  renderedInTradingState,
  filteredBalances,
  balances,
  hideZeroBalances,
  tableState,
  updateTableState,
}) => {
  const { t } = useTranslation()
  const data = renderedInTradingState ? filteredBalances : balances
  const filtered = useMemo(
    () => (hideZeroBalances
      ? _filter(data, (b) => +b.balance > DUST_THRESHOLD)
      : data),
    [data, hideZeroBalances],
  )
  const columns = useMemo(() => BalancesTableColumns(t), [t])

  if (_isEmpty(filtered)) {
    return <p className='empty'>{t('balancesTableModal.noBalances')}</p>
  }

  return (
    <div className='hfui-balancelist__wrapper'>
      <VirtualTable
        data={filtered}
        columns={columns}
        tableState={tableState}
        updateTableState={updateTableState}
        defaultSortBy='context'
        defaultSortDirection='ASC'
      />
    </div>
  )
}

BalancesTable.propTypes = {
  balances: PropTypes.objectOf(PropTypes.shape(BALANCE_SHAPE)),
  filteredBalances: PropTypes.objectOf(PropTypes.shape(BALANCE_SHAPE)),
  renderedInTradingState: PropTypes.bool,
  hideZeroBalances: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  tableState: PropTypes.object.isRequired,
  updateTableState: PropTypes.func.isRequired,
}

BalancesTable.defaultProps = {
  balances: {},
  filteredBalances: {},
  renderedInTradingState: false,
  hideZeroBalances: true,
}

export default memo(BalancesTable)
