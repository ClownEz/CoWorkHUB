import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '@/api/bookings'
import type { CreateBookingRequest } from '@/types'
import toast from 'react-hot-toast'

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.list(),
  })
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['availability'] })
      toast.success('Бронирование создано')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Ошибка бронирования')
    },
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Бронирование отменено')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Ошибка отмены')
    },
  })
}
