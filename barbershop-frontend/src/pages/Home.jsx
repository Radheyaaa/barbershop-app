import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Scissors, CalendarCheck, Clock, ChevronRight,
  LogOut, History, Star, Bell, UserCircle } from 'lucide-react'
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
        setServices(s.data.data.slice(0, 4))
        setBarbers(b.data.data.slice(0, 3))
        setReservations(r.data.data.slice(0, 3))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const activeReservation = reservations.find(
    r => r.status === 'pending' || r.status === 'confirmed'
  )

  const statusConfig = {
    pending:   { label: 'Menunggu Konfirmasi', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
    confirmed: { label: 'Dikonfirmasi',         color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
    completed: { label: 'Selesai',              color: 'bg-green-100 text-green-700',  dot: 'bg-green-400' },
    cancelled: { label: 'Dibatalkan',           color: 'bg-red-100 text-red-700',      dot: 'bg-red-400' },
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ===== NAVBAR ===== */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Scissors size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">BarberCo</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/my-reservations')}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition">
              <Bell size={20} className="text-gray-600" />
              {activeReservation && (
                <span className="absolute top-1 right-1 w-2 h-2
                  bg-red-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 hover:bg-gray-100
                px-3 py-2 rounded-xl transition">
              {user?.photo_url ? (
                <img src={user.photo_url} alt="profil"
                  className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <UserCircle size={18} className="text-gray-500" />
                </div>
              )}
              <span className="text-sm font-medium hidden md:block">{user?.name}</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-gray-500
                hover:text-black px-3 py-2 rounded-xl hover:bg-gray-100 transition">
              <LogOut size={16} />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* ===== HERO / GREETING ===== */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700
          text-white rounded-3xl p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5
            rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 right-12 w-32 h-32 bg-white/5
            rounded-full translate-y-16" />

          <div className="relative z-10">
            <p className="text-gray-400 text-sm mb-1">{greeting()},</p>
            <h1 className="text-3xl font-black mb-2">{user?.name}! 👋</h1>
            <p className="text-gray-400 mb-8 max-w-sm">
              Siap tampil keren hari ini? Booking barber favoritmu sekarang.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/booking')}
                className="flex items-center gap-2 bg-white text-black px-5 py-3
                  rounded-2xl font-bold hover:bg-gray-100 transition">
                <CalendarCheck size={18} />
                Booking Sekarang
              </button>
              <button
                onClick={() => navigate('/my-reservations')}
                className="flex items-center gap-2 border border-white/30 px-5 py-3
                  rounded-2xl font-medium hover:bg-white/10 transition">
                <History size={18} />
                Riwayat
              </button>
            </div>
          </div>
        </div>

        {/* ===== ACTIVE RESERVATION BANNER ===== */}
        {!loading && activeReservation && (
          <div
            onClick={() => navigate('/my-reservations')}
            className="bg-blue-600 text-white rounded-2xl p-5 cursor-pointer
              hover:bg-blue-700 transition flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex
                items-center justify-center">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs text-blue-200 mb-0.5">Reservasi Aktif</p>
                <p className="font-bold">{activeReservation.service?.name}</p>
                <p className="text-sm text-blue-200">
                  {activeReservation.schedule?.available_date} •{' '}
                  {activeReservation.schedule?.start_time} •{' '}
                  {activeReservation.barber?.user?.name}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-blue-200" />
          </div>
        )}

        {/* ===== QUICK STATS ===== */}
        {!loading && (
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Total Booking',
                value: reservations.length > 0
                  ? reservations.length + '+'
                  : '0',
                icon:  <CalendarCheck size={20} />,
                color: 'bg-black text-white'
              },
              {
                label: 'Layanan Tersedia',
                value: services.length + '+',
                icon:  <Scissors size={20} />,
                color: 'bg-white text-black'
              },
              {
                label: 'Barber Aktif',
                value: barbers.length + '+',
                icon:  <Star size={20} />,
                color: 'bg-white text-black'
              },
            ].map((stat, i) => (
              <div key={i}
                className={`${stat.color} rounded-2xl p-4 shadow-sm
                  flex flex-col gap-2`}>
                <div className={`w-9 h-9 rounded-xl flex items-center
                  justify-center
                  ${stat.color === 'bg-black text-white'
                    ? 'bg-white/20'
                    : 'bg-gray-100'}`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className={`text-xs
                  ${stat.color === 'bg-black text-white'
                    ? 'text-gray-300'
                    : 'text-gray-500'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ===== LAYANAN ===== */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black">Layanan Populer</h2>
            <button
              onClick={() => navigate('/booking')}
              className="text-sm text-gray-500 hover:text-black flex
                items-center gap-1 transition">
              Lihat semua <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black
                rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {services.map((service, i) => (
                <div
                  key={service.id}
                  onClick={() => navigate('/booking')}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md
                    transition cursor-pointer group">
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-black
                    rounded-xl flex items-center justify-center mb-3 transition">
                    <Scissors size={18}
                      className="text-gray-500 group-hover:text-white transition" />
                  </div>
                  <p className="font-bold text-sm mb-1 line-clamp-1">
                    {service.name}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    {service.duration} menit
                  </p>
                  <p className="font-black text-sm">
                    Rp {Number(service.price).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===== BARBER ===== */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black">Pilih Barber</h2>
            <button
              onClick={() => navigate('/booking')}
              className="text-sm text-gray-500 hover:text-black flex
                items-center gap-1 transition">
              Booking <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black
                rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {barbers.map(barber => (
              <div key={barber.id}
                  onClick={() => navigate('/booking')}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md
                    transition cursor-pointer flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br
                    from-gray-200 to-gray-300 flex items-center justify-center
                    text-2xl flex-shrink-0">
                    {barber.photo_url ? (
                      <img src={barber.photo_url} alt={barber.user?.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <span>👨</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{barber.user?.name}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {barber.bio || 'Barber profesional'}
                    </p>
                  </div>
                  <ChevronRight size={18}
                    className="text-gray-300 group-hover:text-black transition flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===== RIWAYAT TERAKHIR ===== */}
        {!loading && reservations.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black">Riwayat Terakhir</h2>
              <button
                onClick={() => navigate('/my-reservations')}
                className="text-sm text-gray-500 hover:text-black flex
                  items-center gap-1 transition">
                Lihat semua <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {reservations.map(r => {
                const sc = statusConfig[r.status]
                return (
                  <div
                    key={r.id}
                    onClick={() => navigate('/my-reservations')}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md
                      transition cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex
                      items-center justify-center flex-shrink-0">
                      <Scissors size={20} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{r.service?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.barber?.user?.name} •{' '}
                        {r.schedule?.available_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`${sc.color} px-3 py-1 rounded-full
                        text-xs font-semibold`}>
                        {sc.label}
                      </span>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ===== EMPTY STATE (belum pernah booking) ===== */}
        {!loading && reservations.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
            <div className="text-6xl mb-4">✂️</div>
            <h3 className="text-xl font-black mb-2">Belum Ada Booking</h3>
            <p className="text-gray-400 text-sm mb-6">
              Yuk, buat reservasi pertamamu sekarang!
            </p>
            <button
              onClick={() => navigate('/booking')}
              className="bg-black text-white px-8 py-3 rounded-2xl font-bold
                hover:bg-gray-800 transition inline-flex items-center gap-2">
              <CalendarCheck size={18} />
              Booking Sekarang
            </button>
          </div>
        )}

      </div>
    </div>
  )
}