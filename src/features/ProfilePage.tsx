import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const roleLabels: Record<string, string> = {
  guest: 'Гость',
  resident: 'Резидент',
  manager: 'Менеджер',
  admin: 'Администратор',
}

export function ProfilePage() {
  const { user, logout } = useAuthStore()

  if (!user) return null

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.email}</h1>
              <p className="text-sm text-gray-500">Профиль</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-gray-400" />
              <span>Роль: {roleLabels[user.role]}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Зарегистрирован: {formatDate(user.created_at)}</span>
            </div>
          </div>
          <Button variant="danger" className="w-full" onClick={logout}>
            Выйти
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
