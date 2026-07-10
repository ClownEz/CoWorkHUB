import { Routes, Route, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Users, Building2, Settings, Shield } from 'lucide-react'
import { UsersListPage } from './UsersListPage'
import { AdminSpacesPage } from './AdminSpacesPage'

function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Панель администратора</h1>
        <p className="mt-1 text-gray-500">Полное управление системой</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/users">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="p-6 text-center">
              <Users className="mx-auto h-8 w-8 text-blue-500" />
              <p className="mt-2 font-medium">Пользователи</p>
              <p className="text-sm text-gray-500">Управление ролями</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/spaces">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="p-6 text-center">
              <Building2 className="mx-auto h-8 w-8 text-green-500" />
              <p className="mt-2 font-medium">Пространства</p>
              <p className="text-sm text-gray-500">Полный список</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-6 text-center">
            <Settings className="mx-auto h-8 w-8 text-purple-500" />
            <p className="mt-2 font-medium">Настройки</p>
            <p className="text-sm text-gray-500">Системные</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-6 text-center">
            <Shield className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-2 font-medium">Безопасность</p>
            <p className="text-sm text-gray-500">Логи и аудит</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Последние действия</h2>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-gray-500">
            История действий будет отображаться здесь
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminPanel() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<UsersListPage />} />
      <Route path="spaces" element={<AdminSpacesPage />} />
    </Routes>
  )
}
