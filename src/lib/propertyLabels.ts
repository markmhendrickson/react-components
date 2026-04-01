const ACRONYM_SEGMENTS = new Set([
  'eur', 'usd', 'gbp', 'chf', 'id', 'iban', 'bic', 'swift',
  'apr', 'fx', 'url', 'uri', 'api', 'tin', 'vat', 'nft', 'btc', 'eth',
])

const OVERRIDES: Record<string, string> = {
  canonical_name: 'Display name',
  entity_id: 'Entity ID',
  entity_type: 'Entity type',
  filing_tags: 'Filing tags',
  strategy_bucket: 'Strategy bucket',
  tax_year_context: 'Tax year',
  balance_eur: 'Balance (EUR)',
  balance_usd: 'Balance (USD)',
  account_value: 'Account value',
  account_value_currency: 'Account value currency',
  outstanding_principal_eur: 'Outstanding principal (EUR)',
  registry_id: 'Registry ID',
  account_registry_id: 'Account registry ID',
  idempotency_key: 'Idempotency key',
  observation_kind: 'Observation kind',
  account_type: 'Account type',
  account_name: 'Account name',
  due_date: 'Due date',
  completed_date: 'Completed date',
  created_at: 'Created',
  updated_at: 'Updated',
  import_date: 'Import date',
  import_source_file: 'Import source',
  project_names: 'Project',
  assignee_name: 'Assignee',
}

function titleCaseSegment(segment: string): string {
  const lower = segment.toLowerCase()
  if (/^\d+$/.test(lower)) return segment
  if (ACRONYM_SEGMENTS.has(lower)) return lower.toUpperCase()
  if (lower.length <= 1) return lower.toUpperCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export function splitKeySegments(key: string): string[] {
  const s = key.trim()
  if (!s) return []
  const spaced = s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  return spaced.split(/[_\s-]+/).filter(Boolean)
}

export function humanizePropertyKey(literalKey: string): string {
  if (!literalKey) return ''
  if (OVERRIDES[literalKey]) return OVERRIDES[literalKey]
  return splitKeySegments(literalKey).map(titleCaseSegment).join(' ')
}
