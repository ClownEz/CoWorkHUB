import api from './client'
import type { Review } from '@/types'

export interface CreateReviewRequest {
  booking_id: number
  rating: number
  comment: string
}

export interface UpdateReviewRequest {
  rating?: number
  comment?: string
}

export const reviewsApi = {
  create: (data: CreateReviewRequest) =>
    api.post<Review>('/review', data).then((r) => r.data),

  getBySpace: (spaceId: number) =>
    api.get<Review[]>(`/review/space/${spaceId}`).then((r) => r.data),

  getById: (id: number) =>
    api.get<Review>(`/review/${id}`).then((r) => r.data),

  update: (id: number, data: UpdateReviewRequest) =>
    api.patch<Review>(`/review/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/review/${id}`).then((r) => r.data),
}
