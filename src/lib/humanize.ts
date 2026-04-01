const ENTITY_TYPE_LABELS: Record<string, string> = {
  financial_account: 'Account',
  crypto_wallet_address: 'Wallet address',
  tax_filing: 'Tax filing',
  account_statement: 'Statement',
  recurring_expense: 'Recurring expense',
  loan: 'Loan',
  transaction: 'Transaction',
  import_artifact: 'Import',
  income: 'Income',
  goods: 'Goods',
  note: 'Note',
  contact: 'Contact',
  person: 'Person',
  company: 'Company',
  event: 'Event',
  task: 'Task',
  file_asset: 'File',
  conversation: 'Conversation',
  agent_message: 'Message',
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  REFERS_TO: 'References',
  PART_OF: 'Part of',
  EMBEDS: 'Contains',
  CORRECTS: 'Corrects',
  SETTLES: 'Settles',
  DUPLICATE_OF: 'Duplicate of',
  DEPENDS_ON: 'Depends on',
  SUPERSEDES: 'Supersedes',
  works_at: 'Works at',
  owns: 'Owns',
  manages: 'Manages',
  related_to: 'Related to',
  references: 'References',
  transacted_with: 'Transacted with',
  invested_in: 'Invested in',
}

const WORKFLOW_STATUS_LABELS: Record<string, string> = {
  in_progress: 'In progress',
  not_started: 'Not started',
  not_started_yet: 'Not started',
  pending: 'Pending',
  draft: 'Draft',
  active: 'Active',
  open: 'Open',
  closed: 'Closed',
  complete: 'Complete',
  completed: 'Completed',
  filed: 'Filed',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  canceled: 'Canceled',
  failed: 'Failed',
  archived: 'Archived',
  blocked: 'Blocked',
  unknown: 'Unknown',
}

const WORKFLOW_STATUS_BADGE_CLASSES: Record<string, string> = {
  in_progress: 'bg-amber-100 text-amber-900 dark:bg-amber-900/35 dark:text-amber-200',
  pending: 'bg-amber-100 text-amber-900 dark:bg-amber-900/35 dark:text-amber-200',
  submitted: 'bg-sky-100 text-sky-900 dark:bg-sky-900/35 dark:text-sky-200',
  draft: 'bg-muted text-muted-foreground',
  not_started: 'bg-muted text-muted-foreground',
  not_started_yet: 'bg-muted text-muted-foreground',
  active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/35 dark:text-emerald-200',
  open: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/35 dark:text-emerald-200',
  complete: 'bg-green-100 text-green-900 dark:bg-green-900/35 dark:text-green-200',
  completed: 'bg-green-100 text-green-900 dark:bg-green-900/35 dark:text-green-200',
  filed: 'bg-green-100 text-green-900 dark:bg-green-900/35 dark:text-green-200',
  approved: 'bg-green-100 text-green-900 dark:bg-green-900/35 dark:text-green-200',
  closed: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-200',
  rejected: 'bg-red-100 text-red-900 dark:bg-red-900/35 dark:text-red-200',
  cancelled: 'bg-red-100 text-red-900 dark:bg-red-900/35 dark:text-red-200',
  canceled: 'bg-red-100 text-red-900 dark:bg-red-900/35 dark:text-red-200',
  failed: 'bg-red-100 text-red-900 dark:bg-red-900/35 dark:text-red-200',
  blocked: 'bg-red-100 text-red-900 dark:bg-red-900/35 dark:text-red-200',
  archived: 'bg-muted text-muted-foreground',
  unknown: 'bg-muted text-muted-foreground',
}

const SOURCE_LABELS: Record<string, string> = {
  neotoma_store: 'Imported',
  imported_payload: 'Imported payload',
  store: 'Imported',
  mcp: 'Imported via integration',
  mcp_store: 'Imported via integration',
  store_unstructured: 'Imported file',
  cli: 'Imported via CLI',
  correction: 'Manual correction',
  user: 'User entry',
  sheet_import: 'Google Sheets import',
  assets_sheet_rows: 'Assets sheet import',
  savings_accounts_csv: 'Savings accounts import',
  assets_sheet_unmapped_crypto: 'Unmapped crypto rows',
}

function normalizeWorkflowStatusKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
}

function titleCaseFromSnake(key: string): string {
  return key
    .split('_')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function humanizeRelationshipType(type: string): string {
  return RELATIONSHIP_LABELS[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function entityTypeLabel(type: string): string {
  return ENTITY_TYPE_LABELS[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function isWorkflowStatusSnapshotKey(key: string): boolean {
  return key === 'status' || key.endsWith('_status')
}

export function humanizeWorkflowStatus(raw: string | null | undefined): string {
  if (raw == null || String(raw).trim() === '') return '—'
  const key = normalizeWorkflowStatusKey(String(raw))
  return WORKFLOW_STATUS_LABELS[key] ?? titleCaseFromSnake(key)
}

export function workflowStatusBadgeClassName(raw: string | null | undefined): string {
  if (raw == null || String(raw).trim() === '') return 'bg-muted text-muted-foreground'
  const key = normalizeWorkflowStatusKey(String(raw))
  return WORKFLOW_STATUS_BADGE_CLASSES[key] ?? 'bg-muted text-muted-foreground'
}

export function humanizeSource(source: string | undefined | null): string {
  if (!source) return 'Unspecified'
  const exact = SOURCE_LABELS[source]
  if (exact) return exact

  if (source.endsWith('.csv') || source.endsWith('.json') || source.endsWith('.pdf') || source.endsWith('.xlsx')) {
    return source
  }

  return source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function entityDisplayName(entity: {
  canonical_name?: string | null
  entity_id: string
  entity_type: string
  snapshot?: Record<string, unknown> | null
}): string {
  if (entity.canonical_name?.trim()) {
    return entity.canonical_name.trim()
  }

  const snap = entity.snapshot
  if (snap) {
    const title = snap.title ?? snap.name ?? snap.canonical_name
    if (typeof title === 'string' && title.trim()) {
      return title.trim()
    }
  }
  return `${entityTypeLabel(entity.entity_type)} ${entity.entity_id.slice(-8)}`
}
