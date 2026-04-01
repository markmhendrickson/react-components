import { get, post } from './client'
import type { Entity, Observation, Relationship, QueryParams } from '../types/neotoma'

function normalizeEntityTypeKey(raw: string | undefined | null): string {
  if (raw == null || !String(raw).trim()) return ''
  return String(raw)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

export function normalizeEntityResponse(raw: unknown, urlId?: string): Entity {
  if (raw == null || typeof raw !== 'object') {
    throw new Error('Invalid entity response')
  }
  const o = raw as Record<string, unknown>
  const src =
    o.entity != null && typeof o.entity === 'object' && !Array.isArray(o.entity)
      ? (o.entity as Record<string, unknown>)
      : o

  const entity_id = String(src.entity_id ?? urlId ?? '')
  const entity_typeRaw = typeof src.entity_type === 'string' ? src.entity_type : ''
  const canonical_name = src.canonical_name == null ? null : String(src.canonical_name)
  const snapshotRaw = (src.snapshot ?? null) as Record<string, unknown> | null
  const rawFragments = (src.raw_fragments ?? null) as Record<string, unknown> | null

  const snapshot =
    snapshotRaw && typeof snapshotRaw === 'object' && !Array.isArray(snapshotRaw)
      ? snapshotRaw
      : null
  const merged =
    rawFragments && typeof rawFragments === 'object' && !Array.isArray(rawFragments)
      ? { ...rawFragments, ...(snapshot ?? {}) }
      : snapshot

  const normalizedType = entity_typeRaw ? normalizeEntityTypeKey(entity_typeRaw) : ''

  const out: Entity = {
    entity_id,
    entity_type: normalizedType || entity_typeRaw,
    canonical_name,
    snapshot: merged,
  }

  const passthrough = [
    'updated_at',
    'last_observation_at',
    'created_at',
    'observation_count',
    'schema_version',
    'merged_to_entity_id',
    'aliases',
    'user_id',
    'provenance',
  ] as const
  for (const k of passthrough) {
    const v = src[k]
    if (v !== undefined) (out as unknown as Record<string, unknown>)[k] = v
  }

  return out
}

function normalizeEmbeddedEntity(raw: unknown): Entity | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  try {
    return normalizeEntityResponse(raw)
  } catch {
    return raw as Entity
  }
}

interface EntitiesQueryResponse {
  entities?: Entity[]
  total?: number
  limit?: number
  offset?: number
}

export async function queryEntities(params: QueryParams): Promise<{ entities: Entity[]; total: number }> {
  const res = await post<EntitiesQueryResponse>('/entities/query', params)
  const raw = res.entities ?? []
  const entities = raw.map((e) => {
    try {
      return normalizeEntityResponse(e)
    } catch {
      return e as Entity
    }
  })
  return { entities, total: res.total ?? entities.length }
}

export async function getEntity(id: string): Promise<Entity> {
  const raw = await get<unknown>(`/entities/${id}`)
  return normalizeEntityResponse(raw, id)
}

function normalizeObservationRow(raw: unknown): Observation {
  if (!raw || typeof raw !== 'object') return raw as Observation
  const r = raw as Record<string, unknown>
  const out = { ...r } as Record<string, unknown>
  if (out.source == null && typeof out.source_id === 'string' && out.source_id.trim()) {
    out.source = 'neotoma_store'
  }
  return out as unknown as Observation
}

interface ObservationsResponse {
  observations?: Observation[]
  total?: number
  limit?: number
  offset?: number
}

function parseObservationsResponse(res: unknown): { items: Observation[]; total?: number } {
  if (res && typeof res === 'object' && !Array.isArray(res)) {
    const o = res as ObservationsResponse
    const items = (o.observations ?? []).map(normalizeObservationRow)
    return { items, total: o.total }
  }
  if (Array.isArray(res)) return { items: res.map(normalizeObservationRow) }
  return { items: [] }
}

export async function getEntityObservations(
  id: string,
  opts?: { limit?: number; offset?: number },
): Promise<Observation[]> {
  const q = new URLSearchParams()
  if (opts?.limit != null) q.set('limit', String(opts.limit))
  if (opts?.offset != null) q.set('offset', String(opts.offset))
  const suffix = q.size ? `?${q}` : ''
  const res = await get<unknown>(`/entities/${id}/observations${suffix}`)
  return parseObservationsResponse(res).items
}

const OBS_PAGE = 2000
const OBS_MAX_PAGES = 100

export async function getAllEntityObservations(entityId: string): Promise<Observation[]> {
  const merged: Observation[] = []
  let offset = 0
  for (let p = 0; p < OBS_MAX_PAGES; p++) {
    const res = await get<unknown>(
      `/entities/${entityId}/observations?limit=${OBS_PAGE}&offset=${offset}`,
    )
    const { items, total } = parseObservationsResponse(res)
    merged.push(...items)
    if (total != null && merged.length >= total) break
    if (items.length === 0) break
    if (items.length < OBS_PAGE) break
    offset += OBS_PAGE
  }
  return merged
}

interface RelationshipsResponse {
  relationships?: Relationship[]
  outgoing?: Relationship[]
  incoming?: Relationship[]
  related_entities?: Record<string, unknown>
}

export async function getEntityRelationships(
  id: string,
  opts?: { expandEntities?: boolean },
): Promise<Relationship[]> {
  const q = opts?.expandEntities ? '?expand_entities=true' : ''
  const res = await get<RelationshipsResponse>(`/entities/${id}/relationships${q}`)
  const list = res.relationships ?? [...(res.outgoing ?? []), ...(res.incoming ?? [])]
  const related = res.related_entities
  return list.map(rel => {
    const enriched = { ...rel }
    if (!enriched.source_entity && related?.[rel.source_entity_id]) {
      enriched.source_entity = normalizeEmbeddedEntity(related[rel.source_entity_id])
    } else if (enriched.source_entity) {
      enriched.source_entity = normalizeEmbeddedEntity(enriched.source_entity)
    }
    if (!enriched.target_entity && related?.[rel.target_entity_id]) {
      enriched.target_entity = normalizeEmbeddedEntity(related[rel.target_entity_id])
    } else if (enriched.target_entity) {
      enriched.target_entity = normalizeEmbeddedEntity(enriched.target_entity)
    }
    return enriched
  })
}

export { normalizeEntityTypeKey }
