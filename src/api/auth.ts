import api from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types'

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: (refresh_token: string) =>
    api.post<AuthResponse>('/auth/refresh', { refresh_token }).then((r) => r.data),

  me: () => api.get<AuthResponse['user']>('/auth/me').then((r) => r.data),
}
