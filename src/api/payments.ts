import api from './client'
import type { Payment } from '@/types'

export const paymentsApi = {
  create: (bookingId: number, provider: string = 'stripe') =>
    api.post<Payment>(`/payments/${bookingId}`, { provider }).then((r) => r.data),

  getById: (id: number) =>
    api.get<Payment>(`/payments/${id}`).then((r) => r.data),

  list: () =>
    api.get<Payment[]>('/payments').then((r) => r.data),
}
