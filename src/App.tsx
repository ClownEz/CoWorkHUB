import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { MainLayout } from '@/layouts/MainLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { HomePage } from '@/features/HomePage'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { VerifyPage } from '@/features/auth/VerifyPage'
import { SpacesListPage } from '@/features/spaces/SpacesListPage'
import { SpaceDetailPage } from '@/features/spaces/SpaceDetailPage'
import { MyBookingsPage } from '@/features/bookings/MyBookingsPage'
import { BookingDetailPage } from '@/features/bookings/BookingDetailPage'
import { PaymentPage } from '@/features/payments/PaymentPage'
import { ProfilePage } from '@/features/ProfilePage'
import { ManagerDashboard } from '@/features/manager/ManagerDashboard'
import { AdminPanel } from '@/features/admin/AdminPanel'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/spaces" element={<SpacesListPage />} />
            <Route path="/spaces/:id" element={<SpaceDetailPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/bookings/:id" element={<BookingDetailPage />} />
              <Route path="/payments/:bookingId" element={<PaymentPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['manager', 'admin']} />}>
              <Route path="/manager/*" element={<ManagerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/*" element={<AdminPanel />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
