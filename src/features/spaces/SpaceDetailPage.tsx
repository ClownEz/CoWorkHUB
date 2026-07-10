import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSpace } from '@/hooks/useSpaces'
import { useCreateBooking } from '@/hooks/useBookings'
import { useAuthStore } from '@/stores/authStore'
import { spacesApi, reviewsApi, bookingsApi } from '@/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SpaceTypeBadge } from '@/components/ui/Badge'
import { formatPrice, formatDateTime } from '@/lib/utils'
import dayjs from 'dayjs'
import { MapPin, Users, Clock, Wifi, ArrowLeft, Trash2, Star } from 'lucide-react'
import toast from 'react-hot-toast'

export function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const spaceId = Number(id)
  const { data: space, isLoading } = useSpace(spaceId)
  const { user, isAuthenticated } = useAuthStore()
  const createBooking = useCreateBooking()
  const queryClient = useQueryClient()

  const [startTime, setStartTime] = useState(
    dayjs().add(1, 'hour').startOf('hour').format('YYYY-MM-DDTHH:mm'),
  )
  const [endTime, setEndTime] = useState(
    dayjs().add(3, 'hour').startOf('hour').format('YYYY-MM-DDTHH:mm'),
  )

  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewBookingId, setReviewBookingId] = useState('')

  const { data: reviews } = useQuery({
    queryKey: ['reviews', spaceId],
    queryFn: () => reviewsApi.getBySpace(spaceId),
    enabled: !!spaceId,
  })

  const { data: myBookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.list(),
    enabled: isAuthenticated,
  })

  const deleteMutation = useMutation({
    mutationFn: () => spacesApi.delete(spaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
      toast.success('Пространство удалено')
      navigate('/spaces')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Ошибка удаления')
    },
  })

  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        booking_id: Number(reviewBookingId),
        rating: reviewRating,
        comment: reviewComment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', spaceId] })
      toast.success('Отзыв добавлен')
      setReviewComment('')
      setReviewRating(5)
      setReviewBookingId('')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Ошибка')
    },
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-64 rounded-xl bg-gray-200" />
      </div>
    )
  }

  if (!space) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Пространство не найдено</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/spaces')}>
          Назад к списку
        </Button>
      </div>
    )
  }

  const canDelete =
    user?.role === 'admin' ||
    (user?.role === 'manager' && space.owner_id === user?.id)

  const completedBookings =
    myBookings?.filter(
      (b) =>
        b.space_id === spaceId &&
        b.status === 'completed' &&
        !reviews?.some((r) => r.booking_id === b.id),
    ) || []

  const start = dayjs(startTime)
  const end = dayjs(endTime)
  const hours = end.diff(start, 'hour', true)
  const totalPrice = Math.round(hours * space.price_per_hour)

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    createBooking.mutate(
      { space_id: space.id, start_time: start.toISOString(), end_time: end.toISOString() },
      { onSuccess: () => navigate('/bookings') },
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/spaces')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Назад к списку
        </button>
        {canDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm('Удалить это пространство?')) deleteMutation.mutate()
            }}
            loading={deleteMutation.isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" /> Удалить
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{space.name}</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <SpaceTypeBadge type={space.type} />
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> до {space.capacity} мест
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {formatPrice(space.price_per_hour)}/час
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-64 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
            <MapPin className="h-16 w-16 text-blue-300" />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Описание</h2>
            <p className="text-gray-600">{space.description || 'Нет описания'}</p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Удобства</h2>
            <div className="flex flex-wrap gap-2">
              {space.amenities?.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                >
                  <Wifi className="h-3.5 w-3.5" /> {a.name}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">
              Отзывы ({reviews?.length ?? 0})
            </h2>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-400">
                          {formatDateTime(r.created_at)}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="text-sm text-gray-600">{r.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Пока нет отзывов</p>
            )}

            {isAuthenticated && completedBookings.length > 0 && (
              <Card className="mt-4">
                <CardContent className="space-y-3 p-4">
                  <h3 className="font-medium text-sm">Оставить отзыв</h3>
                  <select
                    value={reviewBookingId}
                    onChange={(e) => setReviewBookingId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Выберите бронирование</option>
                    {completedBookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        Бронь #{b.id} — {dayjs(b.start_time).format('DD.MM.YYYY')}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewRating(n)}
                      >
                        <Star
                          className={`h-6 w-6 ${n <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Ваш отзыв (необязательно)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    rows={3}
                  />
                  <Button
                    size="sm"
                    onClick={() => reviewMutation.mutate()}
                    loading={reviewMutation.isPending}
                    disabled={!reviewBookingId}
                  >
                    Отправить отзыв
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">Забронировать</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Начало</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Конец</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {hours} ч × {formatPrice(space.price_per_hour)}
                  </span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-semibold">Итого</span>
                  <span className="font-bold text-blue-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleBooking} loading={createBooking.isPending}>
                Забронировать
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
