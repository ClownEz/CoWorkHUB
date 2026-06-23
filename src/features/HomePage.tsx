import { Link } from 'react-router-dom'
import { useSpaces } from '@/hooks/useSpaces'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SpaceTypeBadge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { Building2, Search, CalendarCheck, Shield, ArrowRight, Users, Clock } from 'lucide-react'

export function HomePage() {
  const { data: spaces } = useSpaces()

  return (
    <div className="space-y-16">
      <section className="py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          Найдите идеальное<br />место для работы
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
          Бронируйте переговорные, hot desks и офисы для комфортной работы
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/spaces">
            <Button size="lg">
              <Search className="mr-2 h-5 w-5" />
              Найти коворкинг
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg">
              Зарегистрироваться
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        <Card className="text-center">
          <CardContent className="space-y-3 p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">Поиск пространств</h3>
            <p className="text-sm text-gray-500">
              Фильтруйте по типу, вместимости и дате
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="space-y-3 p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CalendarCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Мгновенное бронирование</h3>
            <p className="text-sm text-gray-500">
              Бронируйте со свободными слотами
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="space-y-3 p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Безопасная оплата</h3>
            <p className="text-sm text-gray-500">
              Защищённые платежи онлайн
            </p>
          </CardContent>
        </Card>
      </section>

      {spaces && spaces.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Популярные пространства</h2>
            <Link to="/spaces" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500">
              Смотреть все <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {spaces.slice(0, 3).map((space) => (
              <Link key={space.id} to={`/spaces/${space.id}`}>
                <Card className="group h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="flex h-36 items-center justify-center rounded-t-xl bg-gradient-to-br from-blue-50 to-blue-100">
                      <Building2 className="h-10 w-10 text-blue-300" />
                    </div>
                    <div className="space-y-2 p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold group-hover:text-blue-600">{space.name}</h3>
                        <SpaceTypeBadge type={space.type} />
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{space.capacity}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatPrice(space.price_per_hour)}/ч</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
