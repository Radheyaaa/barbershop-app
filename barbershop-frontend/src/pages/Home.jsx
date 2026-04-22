import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Scissors, CalendarCheck, Clock, ChevronRight,
  LogOut, History, Bell, UserCircle, ArrowRight
} from 'lucide-react'
import api from '../services/api'

export default function Home() {
  const { user, logout }          = useAuth()
  const navigate                  = useNavigate()
  const [services, setServices]   = useState([])
  const [barbers, setBarbers]     = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, b, r] = await Promise.all([
          api.get('/services'),
          api.get('/barbers'),
          api.get('/reservations/my'),
        ])
        setServices(s.data.data?.slice(0, 4) || [])
        setBarbers(b.data.data?.slice(0, 3) || [])
        setReservations(r.data.data?.slice(0, 3) || [])
      } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const activeReservation = reservations.find(
    r => r.status === 'pending' || r.status === 'confirmed'
  )

  const statusConfig = {
    pending:   { label: 'Pending',     color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    confirmed: { label: 'Confirmed',   color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    completed: { label: 'Completed',   color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    cancelled: { label: 'Cancelled',   color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 15) return 'Good Afternoon'
    if (h < 18) return 'Good Evening'
    return 'Good Evening'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Navbar */}
      <nav className="bg-[#0d0d0d] border-b border-white/[0.06] px-6 py-4
        sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center
            justify-center">
            <Scissors size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-black text-base text-amber-400 tracking-tight">
            BarberCo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/my-reservations')}
            className="relative p-2.5 rounded-xl text-gray-500
              hover:text-gray-200 hover:bg-white/5 transition-all">
            <Bell size={18} />
            {activeReservation && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2
                bg-amber-500 rounded-full" />
            )}
          </button>
          <button onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl
              hover:bg-white/5 transition-all">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="profile"
                className="w-7 h-7 rounded-lg object-cover" />
            ) : (
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center
                justify-center">
                <UserCircle size={16} className="text-gray-500" />
              </div>
            )}
            <span className="text-sm text-gray-400 hidden md:block">
              {user?.name}
            </span>
          </button>
          <button onClick={logout}
            className="p-2.5 rounded-xl text-gray-600 hover:text-red-400
              hover:bg-red-500/8 transition-all">
            <LogOut size={17} />
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Hero / Greeting */}
        <div className="relative bg-[#111111] border border-white/[0.07]
          rounded-3xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64
            bg-amber-500/5 rounded-full -translate-y-32 translate-x-32
            pointer-events-none" />
          <div className="relative">
            <p className="text-gray-600 text-sm mb-1">{greeting()},</p>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              {user?.name}
            </h1>
            <p className="text-gray-600 text-sm mb-8 max-w-sm">
              Ready to look sharp? Book your next appointment with our
              professional barbers.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/booking')}
                className="flex items-center gap-2 bg-amber-500
                  hover:bg-amber-400 text-white px-6 py-3 rounded-xl
                  font-bold text-sm transition-all
                  hover:shadow-lg hover:shadow-amber-500/20">
                <CalendarCheck size={17} />
                Book Now
              </button>
              <button onClick={() => navigate('/my-reservations')}
                className="flex items-center gap-2 border border-white/10
                  text-gray-400 hover:text-white hover:border-white/20
                  px-6 py-3 rounded-xl font-medium text-sm transition-all">
                <History size={17} />
                My Bookings
              </button>
            </div>
          </div>
        </div>

        {/* Active Reservation Banner */}
        {!loading && activeReservation && (
          <div onClick={() => navigate('/my-reservations')}
            className="bg-amber-500/8 border border-amber-500/20 rounded-2xl
              p-5 cursor-pointer hover:border-amber-500/40 transition-all
              flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-amber-500/15 rounded-xl flex
                items-center justify-center shrink-0">
                <Clock size={20} className="text-amber-400" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-500/70
                  tracking-widest uppercase mb-0.5">
                  Active Reservation
                </p>
                <p className="font-bold text-white text-sm">
                  {activeReservation.service?.name}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {activeReservation.schedule?.available_date} ·{' '}
                  {activeReservation.schedule?.start_time} ·{' '}
                  {activeReservation.barber?.user?.name}
                </p>
              </div>
            </div>
            <ChevronRight size={18}
              className="text-gray-600 group-hover:text-amber-400
                transition-colors" />
          </div>
        )}

        {/* Services */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-white tracking-tight">
              Our Services
            </h2>
            <button onClick={() => navigate('/booking')}
              className="flex items-center gap-1 text-sm text-gray-600
                hover:text-amber-400 transition-colors font-medium">
              View all <ChevronRight size={15} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-gray-800
                border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {services.map(service => (
                <div key={service.id}
                  onClick={() => navigate('/booking')}
                  className="bg-[#111111] border border-white/[0.07] rounded-2xl
                    p-5 cursor-pointer group hover:border-amber-500/30
                    transition-all duration-200 hover:-translate-y-0.5">
                  <div className="w-9 h-9 bg-amber-500/10 group-hover:bg-amber-500
                    rounded-xl flex items-center justify-center mb-4
                    transition-all duration-200">
                    <Scissors size={16}
                      className="text-amber-500 group-hover:text-white
                        transition-colors duration-200"
                      strokeWidth={2} />
                  </div>
                  <p className="font-bold text-sm text-gray-200 mb-1
                    line-clamp-1 tracking-tight">
                    {service.name}
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    {service.duration} min
                  </p>
                  <p className="text-amber-400 font-black text-sm">
                    Rp {Number(service.price).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Barbers */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-white tracking-tight">
              Our Barbers
            </h2>
            <button onClick={() => navigate('/booking')}
              className="flex items-center gap-1 text-sm text-gray-600
                hover:text-amber-400 transition-colors font-medium">
              Book <ChevronRight size={15} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-gray-800
                border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {barbers.map(barber => (
                <div key={barber.id}
                  onClick={() => navigate('/booking')}
                  className="bg-[#111111] border border-white/[0.07] rounded-2xl
                    p-5 cursor-pointer group hover:border-amber-500/30
                    transition-all duration-200 hover:-translate-y-0.5
                    flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden
                    bg-white/5 border border-white/[0.07] shrink-0">
                    {barber.photo_url ? (
                      <img src={barber.photo_url} alt={barber.user?.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserCircle size={28} className="text-gray-700"
                          strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-200 truncate">
                      {barber.user?.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate">
                      {barber.bio || 'Professional barber'}
                    </p>
                  </div>
                  <ChevronRight size={16}
                    className="text-gray-700 group-hover:text-amber-400
                      transition-colors shrink-0" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Reservations */}
        {!loading && reservations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white tracking-tight">
                Recent Bookings
              </h2>
              <button onClick={() => navigate('/my-reservations')}
                className="flex items-center gap-1 text-sm text-gray-600
                  hover:text-amber-400 transition-colors font-medium">
                View all <ChevronRight size={15} />
              </button>
            </div>
            <div className="space-y-2">
              {reservations.map(r => {
                const sc = statusConfig[r.status]
                return (
                  <div key={r.id}
                    onClick={() => navigate('/my-reservations')}
                    className="bg-[#111111] border border-white/[0.07]
                      rounded-2xl p-4 cursor-pointer group
                      hover:border-white/15 transition-all flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex
                      items-center justify-center shrink-0">
                      <Scissors size={16} className="text-gray-600"
                        strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-200 truncate">
                        {r.service?.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {r.barber?.user?.name} · {r.schedule?.available_date}
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1
                      rounded-lg border shrink-0 ${sc?.color}`}>
                      {sc?.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && reservations.length === 0 && (
          <div className="bg-[#111111] border border-white/[0.07] rounded-3xl
            p-12 text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex
              items-center justify-center mx-auto mb-5">
              <Scissors size={28} className="text-amber-500" strokeWidth={1.8} />
            </div>
            <h3 className="text-lg font-black text-white mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Make your first appointment and look your best!
            </p>
            <button onClick={() => navigate('/booking')}
              className="inline-flex items-center gap-2 bg-amber-500
                hover:bg-amber-400 text-white px-8 py-3 rounded-xl
                font-bold text-sm transition-all
                hover:shadow-lg hover:shadow-amber-500/20">
              <CalendarCheck size={17} />
              Book Now
            </button>
          </div>
        )}

      </div>
    </div>
  )
}