import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Landing  from './pages/Landing'
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home     from './pages/Home'
import Booking  from './pages/customer/booking'
import MyReservations from './pages/customer/MyReservations'
import Profile from './pages/customer/Profile'

import Dashboard         from './pages/admin/Dashboard'
import ManageBarbers     from './pages/admin/ManageBarbers'
import ManageServices    from './pages/admin/ManageServices'
import ManageSchedules   from './pages/admin/ManageSchedules'
import ManageReservations from './pages/admin/ManageReservations'

function CustomerRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />
  return children
}

function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  if (!user || user.role !== 'admin') return <Navigate to="/login" />
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-black text-white p-6 space-y-2 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black text-sm">💈</span>
          </div>
          <span className="font-bold text-lg">BarberCo Admin</span>
        </div>
        <nav className="space-y-1 flex-1">
          {[
            { to: '/admin/dashboard',     icon: '📊', label: 'Dashboard' },
            { to: '/admin/barbers',       icon: '👨‍💼', label: 'Barber' },
            { to: '/admin/services',      icon: '✂️',  label: 'Layanan' },
            { to: '/admin/schedules',     icon: '📅', label: 'Jadwal' },
            { to: '/admin/reservations',  icon: '📋', label: 'Reservasi' },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-3 p-3 rounded-xl
                hover:bg-white/10 transition text-sm font-medium">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <button onClick={logout}
          className="flex items-center gap-3 p-3 rounded-xl
            bg-red-600 hover:bg-red-700 transition text-sm font-medium mt-4">
          🚪 Logout
        </button>
      </aside>
      <main className="flex-1 bg-gray-100 overflow-auto">{children}</main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer */}
      <Route path="/home" element={
        <CustomerRoute><Home /></CustomerRoute>
      }/>
      <Route path="/booking" element={
        <CustomerRoute><Booking /></CustomerRoute>
      }/>
      <Route path="/my-reservations" element={
        <CustomerRoute><MyReservations /></CustomerRoute>
      }/>

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <AdminLayout><Dashboard /></AdminLayout>
      }/>
      <Route path="/admin/barbers" element={
        <AdminLayout><ManageBarbers /></AdminLayout>
      }/>
      <Route path="/admin/services" element={
        <AdminLayout><ManageServices /></AdminLayout>
      }/>
      <Route path="/admin/schedules" element={
        <AdminLayout><ManageSchedules /></AdminLayout>
      }/>
      <Route path="/admin/reservations" element={
        <AdminLayout><ManageReservations /></AdminLayout>
      }/>
      <Route path="/profile" element={
        <CustomerRoute><Profile /></CustomerRoute>
      }/>
    </Routes>
  )
}

export default App