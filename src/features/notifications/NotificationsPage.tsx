import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/authStore'
import { Bell } from 'lucide-react'

interface Notification {
  id: string
  message: string
  created_at: string
}

export function NotificationsPage() {
  const { isAuthenticated } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!isAuthenticated) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/notifications`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setNotifications((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev])
    }

    return () => ws.close()
  }, [isAuthenticated])

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Уведомления</h1>

      {notifications.length === 0 ? (
        <div className="py-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Нет уведомлений</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <Bell className="mt-0.5 h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{n.created_at}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
