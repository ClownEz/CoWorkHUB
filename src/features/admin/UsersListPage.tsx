import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Trash2 } from 'lucide-react'
import type { Role } from '@/types'
import toast from 'react-hot-toast'

const ROLE_LABELS: Record<Role, string> = {
  guest: 'Гость',
  resident: 'Клиент',
  manager: 'Менеджер',
  admin: 'Админ',
}

const ROLE_OPTIONS: Role[] = ['guest', 'resident', 'manager', 'admin']

export function UsersListPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: Role }) =>
      usersApi.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Роль обновлена')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Ошибка')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => usersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Пользователь удалён')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Ошибка удаления')
    },
  })

  if (isLoading) return <p className="text-gray-500">Загрузка...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Пользователи</h1>
        <p className="mt-1 text-gray-500">Управление ролями</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Все пользователи ({users?.length ?? 0})</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Имя</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Роль</th>
                  <th className="pb-3 font-medium">Активен</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3">{user.id}</td>
                    <td className="py-3">{user.full_name}</td>
                    <td className="py-3">{user.email}</td>
                    <td className="py-3">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          roleMutation.mutate({
                            userId: user.id,
                            role: e.target.value as Role,
                          })
                        }
                        className="rounded border bg-white px-2 py-1 text-sm"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3">
                      {user.is_active ? (
                        <span className="text-green-600">Да</span>
                      ) : (
                        <span className="text-red-500">Нет</span>
                      )}
                    </td>
                    <td className="py-3">
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Удалить ${user.full_name}?`)) {
                              deleteMutation.mutate(user.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
