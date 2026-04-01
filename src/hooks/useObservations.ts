import { useQuery } from '@tanstack/react-query'
import { getAllEntityObservations } from '../api/entities'

export function useObservations(entityId: string | undefined) {
  return useQuery({
    queryKey: ['observations', 'all', entityId],
    queryFn: () => getAllEntityObservations(entityId!),
    enabled: !!entityId,
    staleTime: 60_000,
  })
}
