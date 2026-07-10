import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Shield, Calendar, Phone, Camera } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const roleLabels: Record<string, string> = {
  guest: 'Гость',
  resident: 'Клиент',
  manager: 'Менеджер',
  admin: 'Администратор',
}

export function ProfilePage() {
  const { user, logout, setUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [uploading, setUploading] = useState(false)

  if (!user) return null

  const handleSave = async () => {
    const updated = await authApi.updateProfile({ full_name: fullName, phone })
    setUser(updated)
    setEditing(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const updated = await authApi.uploadAvatar(file)
    setUser(updated)
    setUploading(false)
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <label className="relative cursor-pointer">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.full_name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-1">
                <Camera className="h-3 w-3 text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <div>
              <h1 className="text-2xl font-bold">{user.full_name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {editing ? (
            <div className="space-y-3">
              <Input
                label="Имя"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                label="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+375..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">Сохранить</Button>
                <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">Отмена</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span>{user.full_name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-gray-400" />
                <span>Роль: {roleLabels[user.role]}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Зарегистрирован: {formatDate(user.created_at)}</span>
              </div>
              <Button onClick={() => setEditing(true)} className="w-full">Редактировать</Button>
            </div>
          )}
          <Button variant="danger" className="w-full" onClick={logout}>
            Выйти
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
