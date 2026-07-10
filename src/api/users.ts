import api from './client'
import type { User, Role } from '@/types'

export const usersApi = {
  list: () => api.get<User[]>('/users/').then((r) => r.data),

  updateRole: (userId: number, role: Role) =>
    api.patch<User>(`/users/${userId}/role`, null, { params: { role } }).then((r) => r.data),

  delete: (userId: number) =>
    api.delete(`/users/${userId}`).then((r) => r.data),
}
