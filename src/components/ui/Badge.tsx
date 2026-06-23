import { cn } from '@/lib/utils'
import type { BookingStatus, SpaceType } from '@/types'

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
}

const spaceTypeLabels: Record<SpaceType, string> = {
  meeting_room: 'Переговорная',
  hot_desk: 'Hot Desk',
  office: 'Офис',
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const labels: Record<BookingStatus, string> = {
    pending: 'Ожидает',
    confirmed: 'Подтверждено',
    completed: 'Завершено',
    cancelled: 'Отменено',
  }

  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[status])}>
      {labels[status]}
    </span>
  )
}

export function SpaceTypeBadge({ type }: { type: SpaceType }) {
  return (
    <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
      {spaceTypeLabels[type]}
    </span>
  )
}
