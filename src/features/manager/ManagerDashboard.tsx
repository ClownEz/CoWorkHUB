import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Building2, CalendarCheck, Plus, Users } from 'lucide-react'

export function ManagerDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Панель менеджера</h1>
          <p className="mt-1 text-gray-500">Управление пространствами и аналитика</p>
        </div>
        <Button onClick={() => navigate('/manager/spaces/new')}>
          <Plus className="mr-2 h-4 w-4" /> Добавить пространство
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Пространства</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Бронирований сегодня</p>
                <p className="text-3xl font-bold">8</p>
              </div>
              <CalendarCheck className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Пользователей</p>
                <p className="text-3xl font-bold">45</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Управление пространствами</h2>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-gray-500">
            Здесь будет список пространств с возможностью редактирования
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Аналитика</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 py-8 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
            <p className="text-gray-500">Графики загрузки пространств</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
