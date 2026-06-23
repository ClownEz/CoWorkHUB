import { useParams, useNavigate } from 'react-router-dom'
import { useBooking, useCancelBooking } from '@/hooks/useBookings'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading } = useBooking(Number(id))
  const cancelBooking = useCancelBooking()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-48 rounded-xl bg-gray-200" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Бронирование не найдено</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/bookings')}>
          Назад
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/bookings')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Назад к бронированиям
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Бронирование #{booking.id}
        </h1>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">Детали</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Пространство</span>
                <span className="font-medium">{booking.space?.name || `ID: ${booking.space_id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Начало</span>
                <span>{formatDateTime(booking.start_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Конец</span>
                <span>{formatDateTime(booking.end_time)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="text-gray-500">Сумма</span>
                <span className="font-bold text-blue-600">{formatPrice(booking.total_price)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">Действия</h2>
            {(booking.status === 'confirmed' || booking.status === 'pending') && (
              <Button
                variant="danger"
                className="w-full"
                onClick={() => cancelBooking.mutate(booking.id)}
                loading={cancelBooking.isPending}
              >
                Отменить бронирование
              </Button>
            )}
            {booking.status === 'pending' && (
              <Button className="w-full" onClick={() => navigate(`/payments/${booking.id}`)}>
                Оплатить
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
