export interface Entity {
  entity_id: string
  entity_type: string
  canonical_name: string | null
  schema_version?: string
  snapshot: Record<string, unknown> | null
  raw_fragments?: Record<string, unknown> | null
  observation_count?: number
  last_observation_at?: string
  aliases?: string[]
  created_at?: string
  updated_at?: string
  user_id?: string
  merged_to_entity_id?: string | null
  provenance?: Record<string, unknown>
}

export interface Observation {
  id: string
  entity_id: string
  entity_type: string
  data?: Record<string, unknown> | null
  observed_at: string
  source: string | null
  source_id?: string | null
  idempotency_key: string | null
  created_at: string
  provenance?: Record<string, unknown>
  observation_kind?: string
}

export interface Relationship {
  relationship_key: string
  relationship_type: string
  source_entity_id: string
  target_entity_id: string
  schema_version?: string
  snapshot?: Record<string, unknown>
  computed_at?: string
  observation_count?: number
  last_observation_at?: string
  source_entity?: Entity
  target_entity?: Entity
}

export interface Schema {
  entity_type: string
  version?: string
  fields?: SchemaField[]
  description?: string
}

export interface SchemaField {
  name: string
  type: string
  description?: string
  required?: boolean
}

export interface QueryParams {
  entity_type?: string
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
  include_snapshots?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

export interface StatsResponse {
  total_entities: number
  total_observations: number
  total_relationships: number
  entities_by_type?: Record<string, number>
  sources_count?: number
  last_updated?: string
}
