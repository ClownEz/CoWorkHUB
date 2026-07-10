import api from './client'
import type { Space } from '@/types'

export interface SpacesQuery {
  space_type?: string
  capacity?: number
  date?: string
  search?: string
  sort?: string
}

export interface AvailabilitySlot {
  start_time: string
  end_time: string
  available: boolean
}

export const spacesApi = {
  list: (params?: SpacesQuery) =>
    api.get<Space[]>('/spaces/', { params }).then((r) => r.data),

  adminListAll: () =>
    api.get<Space[]>('/spaces/admin/all').then((r) => r.data),

  getById: (id: number) =>
    api.get<Space>(`/spaces/${id}`).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/spaces/${id}`).then((r) => r.data),

  getAvailability: (id: number, from: string, to: string) =>
    api.get<AvailabilitySlot[]>(`/spaces/${id}/availability`, {
      params: { from, to },
    }).then((r) => r.data),
}
