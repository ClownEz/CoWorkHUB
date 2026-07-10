import api from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types'

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<{ message: string }>('/auth/register', data).then((r) => r.data),

  verify: (email: string, code: string) =>
    api.post<AuthResponse>('/auth/verify', { email, code }).then((r) => r.data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: (refresh_token: string) =>
    api.post<AuthResponse>('/auth/refresh', { refresh_token }).then((r) => r.data),

  me: () => api.get<AuthResponse['user']>('/auth/me').then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post<{ msg: string }>('/auth/forgot_password', { email }).then((r) => r.data),

  resetPassword: () =>
    api.post<{ msg: string }>('/auth/reset_password').then((r) => r.data),

  confirmReset: (code: string, new_password: string) =>
    api.post<{ msg: string }>('/auth/reset_password/confirm', { code, new_password }).then((r) => r.data),

  logout: (refresh_token: string) =>
    api.post('/auth/logout', { refresh_token }).then((r) => r.data),

  updateProfile: (data: { full_name?: string; phone?: string }) =>
    api.patch<AuthResponse['user']>('/auth/update_profile', data).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.patch<AuthResponse['user']>('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}
