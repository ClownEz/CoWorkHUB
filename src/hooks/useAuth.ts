import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import type { LoginRequest, RegisterRequest } from '@/types'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token, data.refresh_token)
      toast.success('Вход выполнен успешно')
      navigate('/')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Ошибка входа')
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (_data, variables) => {
      toast.success('Код подтверждения отправлен на почту')
      navigate(`/verify?email=${encodeURIComponent(variables.email)}`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Ошибка регистрации')
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  return logout
}
