export function formatDate(value: string | undefined | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateShort(value: string | undefined | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatRelativeTime(value: string | undefined | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  const now = Date.now()
  const diffMs = now - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

export function formatNumber(value: number | undefined | null): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)
}

export function snapshotField<T>(snapshot: Record<string, unknown> | null | undefined, key: string): T | undefined {
  if (!snapshot) return undefined
  if (key in snapshot) return snapshot[key] as T | undefined
  return undefined
}

export function snapshotPathValue(
  snapshot: Record<string, unknown> | null | undefined,
  path: string,
): unknown {
  if (!snapshot || !path.trim()) return undefined
  const parts = path.split('.').map(p => p.trim()).filter(Boolean)
  let cur: unknown = snapshot
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}

export function coalesceSnapshot<T>(snapshot: Record<string, unknown> | null | undefined, keys: string[]): T | undefined {
  if (!snapshot) return undefined
  for (const k of keys) {
    if (!(k in snapshot)) continue
    const v = snapshot[k] as T | undefined
    if (v == null) continue
    if (typeof v === 'string' && v.trim() === '') continue
    return v
  }
  return undefined
}
