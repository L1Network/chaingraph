import { EosioReaderTableRow } from '@blockmatic/eosio-ship-reader'
import omit from 'lodash.omit'
import { MappingsReader } from '../mappings'

export const getPrimaryKey = (
  row: EosioReaderTableRow,
  mappingsReader: MappingsReader,
) => {
  // find table mappings
  const tableMappings = mappingsReader.mappings
    .find((m) => m.contract === row.code)
    .tables.find((t) => t.table === row.table)

  if (!tableMappings) {
    throw new Error(`TableMapping not found for row ${JSON.stringify(row)}`)
  }

  if (tableMappings.table_type === 'singleton') return 'singleton'

  let primary_key
  if (tableMappings.computed_key_type === 'asset_symbol') {
    primary_key = row.value[tableMappings.primary_key].split(' ')[1]
  } else if (tableMappings.computed_key_type === 'symbol') {
    primary_key = row.value[tableMappings.primary_key].split(',')[1]
  } else {
    primary_key = row.value[tableMappings.primary_key]
  }

  return primary_key
}

export const getChainGraphTableRowData = (
  row: EosioReaderTableRow,
  mappingsReader: MappingsReader,
) => {
  return {
    primary_key: getPrimaryKey(row, mappingsReader).toString(),
    ...omit(row, 'value', 'code', 'present', 'primary_key'),
    data: row.value,
    contract: row.code,
    chain: 'eos',
  }
}
