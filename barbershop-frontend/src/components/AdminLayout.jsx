import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CalendarCheck, Users, Scissors,
  Clock, LogOut, Menu, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/reservations', icon: CalendarCheck,   label: 'Reservations' },
  { to: '/admin/barbers',      icon: Users,           label: 'Barbers' },
  { to: '/admin/services',     icon: Scissors,        label: 'Services' },
  { to: '/admin/hours',        icon: Clock,           label: 'Hours' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const location         = useLocation()
  const navigate         = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-100"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside className={`flex flex-col shrink-0 border-r border-white/[0.07]
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-56'}`}
        style={{ background: '#0d0d0d' }}>

        {/* Logo */}
        <div className={`flex items-center h-14 border-b border-white/[0.07]
          px-4 gap-3`}>
          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center
            justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <Scissors size={14} className="text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className="font-black text-base tracking-tight text-amber-400">
              BarberCo
            </span>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-600 hover:text-gray-300 transition-colors">
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-150 group
                  ${active
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}>
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8}
                  className={active ? 'text-amber-400' : 'text-gray-500 group-hover:text-gray-300'} />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-white/[0.07] p-3 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-gray-200 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
            </div>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-sm font-medium text-gray-500 hover:text-red-400
              hover:bg-red-500/8 transition-all duration-150">
            <LogOut size={16} strokeWidth={1.8} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}