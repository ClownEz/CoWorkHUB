import api from './client'
import type { Booking, CreateBookingRequest } from '@/types'

export const bookingsApi = {
  create: (data: CreateBookingRequest) =>
    api.post<Booking>('/bookings/', data).then((r) => r.data),

  list: () =>
    api.get<Booking[]>('/bookings/').then((r) => r.data),

  getById: (id: number) =>
    api.get<Booking>(`/bookings/${id}`).then((r) => r.data),

  cancel: (id: number) =>
    api.patch<Booking>(`/bookings/${id}/cancel`).then((r) => r.data),
}
