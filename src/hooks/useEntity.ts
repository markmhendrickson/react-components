import { useQuery } from '@tanstack/react-query'
import { getEntity, getEntityRelationships } from '../api/entities'

export function useEntity(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['entity', id],
    queryFn: () => getEntity(id!),
    enabled: !!id && enabled,
    staleTime: 60_000,
  })
}

export function useEntityRelationships(id: string | undefined, opts?: { expandEntities?: boolean }) {
  return useQuery({
    queryKey: ['entity-relationships', id, !!opts?.expandEntities],
    queryFn: () => getEntityRelationships(id!, opts),
    enabled: !!id,
    staleTime: 60_000,
  })
}
