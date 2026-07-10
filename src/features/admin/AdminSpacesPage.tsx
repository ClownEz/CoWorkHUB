import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { spacesApi } from '@/api'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { SpaceTypeBadge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'

export function AdminSpacesPage() {
  const { data: spaces, isLoading } = useQuery({
    queryKey: ['admin-spaces'],
    queryFn: spacesApi.adminListAll,
  })

  if (isLoading) return <p className="text-gray-500">Загрузка...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Все пространства</h1>
        <p className="mt-1 text-gray-500">Полный список пространств</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Пространства ({spaces?.length ?? 0})</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Название</th>
                  <th className="pb-3 font-medium">Тип</th>
                  <th className="pb-3 font-medium">Вместимость</th>
                  <th className="pb-3 font-medium">Цена/ч</th>
                  <th className="pb-3 font-medium">Владелец</th>
                  <th className="pb-3 font-medium">Активно</th>
                </tr>
              </thead>
              <tbody>
                {spaces?.map((space) => (
                  <tr key={space.id} className="border-b last:border-0">
                    <td className="py-3">{space.id}</td>
                    <td className="py-3">
                      <Link
                        to={`/spaces/${space.id}`}
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        {space.name}
                      </Link>
                    </td>
                    <td className="py-3">
                      <SpaceTypeBadge type={space.type} />
                    </td>
                    <td className="py-3">{space.capacity}</td>
                    <td className="py-3">{formatPrice(space.price_per_hour)}</td>
                    <td className="py-3">{space.owner_name ?? '—'}</td>
                    <td className="py-3">
                      {space.is_active ? (
                        <span className="text-green-600">Да</span>
                      ) : (
                        <span className="text-red-500">Нет</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
