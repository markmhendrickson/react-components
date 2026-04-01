import { useQuery } from '@tanstack/react-query'
import { queryEntities } from '../api/entities'
import type { QueryParams } from '../types/neotoma'

export function useEntities(params: QueryParams, enabled = true) {
  return useQuery({
    queryKey: ['entities', params],
    queryFn: () => queryEntities(params),
    enabled,
    staleTime: 60_000,
  })
}
