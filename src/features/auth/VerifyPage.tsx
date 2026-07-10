import { useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function VerifyPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [code, setCode] = useState('')
  const setAuth = useAuthStore((s) => s.setAuth)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const verifyMutation = useMutation({
    mutationFn: () => authApi.verify(email, code),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token, data.refresh_token)
      toast.success('Аккаунт подтверждён!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Ошибка подтверждения')
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: () => toast.success('Код отправлен повторно'),
    onError: () => toast.error('Ошибка отправки'),
  })

  if (isAuthenticated) return <Navigate to="/" replace />
  if (!email) return <Navigate to="/register" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <Building2 className="mx-auto h-10 w-10 text-blue-600" />
            <h1 className="mt-2 text-2xl font-bold">Подтверждение email</h1>
            <p className="mt-1 text-sm text-gray-500">
              Код отправлен на <span className="font-medium">{email}</span>
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              verifyMutation.mutate()
            }}
            className="space-y-4"
          >
            <Input
              label="Код подтверждения"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Введите код из письма"
              required
            />
            <Button type="submit" className="w-full" loading={verifyMutation.isPending}>
              Подтвердить
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Не получили код?{' '}
            <button
              onClick={() => resendMutation.mutate()}
              className="font-medium text-blue-600 hover:text-blue-500"
              disabled={resendMutation.isPending}
            >
              Отправить повторно
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
