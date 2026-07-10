import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useRegister } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Building2 } from 'lucide-react'

export function RegisterPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const register = useRegister()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) return
    register.mutate({ email, password, full_name: fullName })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <Building2 className="mx-auto h-10 w-10 text-blue-600" />
            <h1 className="mt-2 text-2xl font-bold">Регистрация</h1>
            <p className="mt-1 text-sm text-gray-500">Создайте аккаунт</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Имя"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ваше имя"
              required
            />
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
              placeholder="Минимум 8 символов"
              required
              minLength={8}
            />
            <Input
              label="Подтверждение пароля"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
            />
            {password !== confirm && confirm && (
              <p className="text-sm text-red-500">Пароли не совпадают</p>
            )}
            <Button type="submit" className="w-full" loading={register.isPending}>
              Зарегистрироваться
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
