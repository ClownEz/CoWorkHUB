import api from './client'
import type { Payment } from '@/types'

export const paymentsApi = {
  create: (bookingId: number) =>
    api.post<Payment>(`/payments/${bookingId}/create`).then((r) => r.data),
}
