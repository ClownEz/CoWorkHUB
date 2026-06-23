import { useQuery } from '@tanstack/react-query'
import { spacesApi, type SpacesQuery } from '@/api/spaces'

export function useSpaces(params?: SpacesQuery) {
  return useQuery({
    queryKey: ['spaces', params],
    queryFn: () => spacesApi.list(params),
  })
}

export function useSpace(id: number) {
  return useQuery({
    queryKey: ['space', id],
    queryFn: () => spacesApi.getById(id),
    enabled: !!id,
  })
}

export function useAvailability(id: number, from: string, to: string) {
  return useQuery({
    queryKey: ['availability', id, from, to],
    queryFn: () => spacesApi.getAvailability(id, from, to),
    enabled: !!id && !!from && !!to,
  })
}
