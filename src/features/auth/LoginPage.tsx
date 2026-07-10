import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Building2 } from 'lucide-react'

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <Building2 className="mx-auto h-10 w-10 text-blue-600" />
            <h1 className="mt-2 text-2xl font-bold">Вход в CoWorkHub</h1>
            <p className="mt-1 text-sm text-gray-500">Войдите в свой аккаунт</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full" loading={login.isPending}>
              Войти
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Нет аккаунта?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Зарегистрироваться
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
