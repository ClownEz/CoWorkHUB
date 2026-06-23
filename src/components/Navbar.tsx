import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from './ui/Button'
import { LogOut, User, Building2, LayoutDashboard, Shield } from 'lucide-react'

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <Building2 className="h-6 w-6" />
          CoWorkHub
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/spaces" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Коворкинги
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'manager' && (
                <Link to="/manager" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  <LayoutDashboard className="inline h-4 w-4" /> Панель
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  <Shield className="inline h-4 w-4" /> Админ
                </Link>
              )}
              <Link to="/bookings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Мои брони
              </Link>
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Войти
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Регистрация
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
