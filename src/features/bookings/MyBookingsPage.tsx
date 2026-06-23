import { Link } from 'react-router-dom'
import { useBookings, useCancelBooking } from '@/hooks/useBookings'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { CalendarDays, Clock, XCircle } from 'lucide-react'

export function MyBookingsPage() {
  const { data: bookings, isLoading } = useBookings()
  const cancelBooking = useCancelBooking()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        {[1, 2].map((i) => (
          <Card key={i} className="h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Мои бронирования</h1>

      {bookings?.length === 0 ? (
        <div className="py-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">У вас пока нет бронирований</p>
          <Link to="/spaces">
            <Button variant="primary" className="mt-4">
              Найти коворкинг
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings?.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{booking.space?.name || `Space #${booking.space_id}`}</h3>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {formatDateTime(booking.start_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(booking.end_time)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-blue-600">{formatPrice(booking.total_price)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/bookings/${booking.id}`}>
                    <Button variant="outline" size="sm">
                      Детали
                    </Button>
                  </Link>
                  {(booking.status === 'confirmed' || booking.status === 'pending') && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => cancelBooking.mutate(booking.id)}
                      loading={cancelBooking.isPending}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
