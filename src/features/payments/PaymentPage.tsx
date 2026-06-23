import { useParams, useNavigate } from 'react-router-dom'
import { useBooking } from '@/hooks/useBookings'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { CreditCard, ArrowLeft } from 'lucide-react'

export function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const { data: booking } = useBooking(Number(bookingId))

  const handlePay = () => {
    // Mock payment redirect
    window.location.href = `/api/payments/${bookingId}/create`
  }

  if (!booking) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Назад
      </button>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="text-center">
            <CreditCard className="mx-auto h-12 w-12 text-blue-600" />
            <h1 className="mt-4 text-2xl font-bold">Оплата бронирования</h1>
            <p className="mt-1 text-gray-500">Бронирование #{booking.id}</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Пространство</span>
                <span>{booking.space?.name || `ID: ${booking.space_id}`}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-semibold">К оплате</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(booking.total_price)}
                </span>
              </div>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handlePay}>
            Оплатить {formatPrice(booking.total_price)}
          </Button>

          <p className="text-center text-xs text-gray-400">
            Безопасный платёж через защищённый протокол
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
