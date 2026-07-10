import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSpaces } from '@/hooks/useSpaces'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SpaceTypeBadge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { MapPin, Users, Clock, Search } from 'lucide-react'

const spaceTypeLabels: Record<string, string> = {
  all: 'Все',
  meeting_room: 'Переговорные',
  hot_desk: 'Hot Desks',
  office: 'Офисы',
}

export function SpacesListPage() {
  const [type, setType] = useState('')
  const [capacity, setCapacity] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')
  const { data: spaces, isLoading } = useSpaces(
    type || capacity || search || sort
      ? {
          space_type: type || undefined,
          capacity: capacity ? Number(capacity) : undefined,
          search: search || undefined,
          sort: sort || undefined,
        }
      : undefined,
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Коворкинги</h1>
        <p className="mt-1 text-gray-500">Найдите идеальное место для работы</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            {Object.entries(spaceTypeLabels).map(([key, label]) => (
              <option key={key} value={key === 'all' ? '' : key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <select
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Вместимость</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="5">5+</option>
            <option value="10">10+</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Сортировка</option>
            <option value="price_asc">Цена ↑</option>
            <option value="price_desc">Цена ↓</option>
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardContent className="p-0">
                <div className="h-40 bg-gray-200 rounded-t-xl" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {spaces?.map((space) => (
            <Link key={space.id} to={`/spaces/${space.id}`}>
              <Card className="group h-full transition-shadow hover:shadow-md">
                <CardContent className="p-0">
                  <div className="flex h-40 items-center justify-center rounded-t-xl bg-gradient-to-br from-blue-50 to-blue-100">
                    <MapPin className="h-12 w-12 text-blue-300" />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                        {space.name}
                      </h3>
                      <SpaceTypeBadge type={space.type} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {space.capacity}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {formatPrice(space.price_per_hour)}/час
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {space.amenities?.slice(0, 3).map((a) => (
                        <span key={a.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {a.name}
                        </span>
                      ))}
                      {(space.amenities?.length || 0) > 3 && (
                        <span className="text-xs text-gray-400">+{space.amenities!.length - 3}</span>
                      )}
                    </div>
                    <Button className="w-full">Забронировать</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {spaces?.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              Ничего не найдено. Попробуйте изменить фильтры.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
