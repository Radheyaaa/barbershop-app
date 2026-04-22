import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import {
  DollarSign, Activity, CheckCircle, Users,
  CalendarCheck, ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

// ── Custom Tooltip ──────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl
      px-4 py-3 shadow-2xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-amber-400 font-bold text-sm">
        Revenue : Rp {Number(payload[0]?.value || 0).toLocaleString('id-ID')}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const navigate        = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/dashboard')
        setData(res.data.data)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  // Generate 14-day chart data dari reservasi
  const generateChartData = (reservations = []) => {
    const days = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const label   = d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
      })

      // ← Hanya hitung yang STATUS = 'completed'
      const dayRevenue = (reservations || [])
        .filter(r =>
          r.status === 'completed' &&
          r.schedule?.available_date === dateStr
        )
        .reduce((sum, r) => sum + Number(r.service?.price || 0), 0)

      days.push({ date: label, revenue: dayRevenue })
    }
    return days
  }


  const handleStatusUpdate = async (id, status) => {
    await api.put(`/admin/reservations/${id}/status`, { status })
    const res = await api.get('/admin/dashboard')
    setData(res.data.data)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-800 border-t-amber-500
          rounded-full animate-spin" />
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  )

  const today = new Date().toISOString().split('T')[0]
  const { stats, latest_reservations, popular_services } = data
  const chartData    = generateChartData(latest_reservations || [])
  const todayRevenue = (latest_reservations || [])
  .filter(r =>
    r.status === 'completed' &&
    r.schedule?.available_date === today
  )
  .reduce((sum, r) => sum + Number(r.service?.price || 0), 0)

  const totalRevenue = (latest_reservations || [])
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + Number(r.service?.price || 0), 0)

  const upcomingReservations = latest_reservations
    ?.filter(r => r.status === 'pending' || r.status === 'confirmed')
    .slice(0, 5) || []

  const statCards = [
    {
      label: "TODAY'S REVENUE",
      value: `Rp ${todayRevenue.toLocaleString('id-ID')}`,
      icon:  <DollarSign size={18} />,
      color: 'text-amber-400',
      sub:   `Total: Rp ${totalRevenue.toLocaleString('id-ID')}`
    },
    {
      label: 'PENDING TODAY',
      value: (latest_reservations || [])
        .filter(r => r.status === 'pending'
          && r.schedule?.available_date === today).length,
      icon:  <Activity size={18} />,
      color: 'text-orange-400',
      sub:   `All time: ${stats.pending}`
    },
    {
      label: 'COMPLETED TODAY',
      value: (latest_reservations || [])
        .filter(r => r.status === 'completed'
          && r.schedule?.available_date === today).length,
      icon:  <CheckCircle size={18} />,
      color: 'text-green-400',
      sub:   `All time: ${stats.completed}`
    },
    {
      label: 'ACTIVE BARBERS',
      value: stats.total_barbers,
      icon:  <Users size={18} />,
      color: 'text-blue-400',
      sub:   `${stats.total_services} services`
    },
  ]


  return (
    <div className="p-8 space-y-8 min-h-screen">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Overview</h1>
        <p className="text-gray-600 text-sm mt-1">
          Here's what's happening at BarberCo today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-[#111111] border border-white/[0.07]
            rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-600 tracking-widest">
                {card.label}
              </p>
              <span className={card.color}>{card.icon}</span>
            </div>
            <p className="text-2xl font-black text-white">{card.value}</p>
            {card.sub && (
              <p className="text-[11px] text-gray-600">{card.sub}</p>
            )}
          </div>
        ))}
      </div>
      
      {/* Chart + Popular Services */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">

        {/* Revenue Chart */}
        <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-base font-bold text-white">
              Revenue Overview (14 Days)
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill:'#4b5563', fontSize:11 }}
                axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill:'#4b5563', fontSize:11 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000
                  ? `Rp ${v/1000}k` : `Rp ${v}`} />
              <Tooltip content={<ChartTooltip />} cursor={{
                stroke:'rgba(255,255,255,0.08)', strokeWidth:1
              }} />
              <Area type="monotone" dataKey="revenue"
                stroke="#f59e0b" strokeWidth={2}
                fill="url(#goldGrad)"
                dot={false}
                activeDot={{ r:5, fill:'#f59e0b',
                  stroke:'#0a0a0a', strokeWidth:2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Services */}
        <div className="bg-[#111111] border border-white/[0.07]
          rounded-2xl p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white">Popular Services</h2>
            <p className="text-gray-600 text-xs mt-0.5">
              Top performing services by booking count
            </p>
          </div>
          <div className="space-y-4">
            {(popular_services || []).map((s, i) => (
              <div key={s.id}
                className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 h-6 rounded-lg flex items-center
                    justify-center text-xs font-black shrink-0
                    ${i === 0 ? 'bg-amber-500 text-white'
                    : i === 1 ? 'bg-gray-600 text-white'
                    : i === 2 ? 'bg-orange-700 text-white'
                    : 'bg-white/5 text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-200 truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {s.reservations_count} bookings
                    </p>
                  </div>
                </div>
                <span className="text-amber-400 font-bold text-sm shrink-0">
                  Rp {Number(s.price).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Reservations */}
      <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">
              Action Required: Upcoming
            </h2>
            <p className="text-gray-600 text-xs mt-0.5">
              Reservations arriving soon that need confirmation or completion.
            </p>
          </div>
          <button onClick={() => navigate('/admin/reservations')}
            className="flex items-center gap-1.5 text-amber-400
              hover:text-amber-300 text-sm font-medium transition-colors">
            View all <ArrowRight size={15} />
          </button>
        </div>

        {upcomingReservations.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">
            No upcoming reservations
          </p>
        ) : (
          <div className="space-y-0">
            {upcomingReservations.map((r, i) => (
              <div key={r.id}
                className={`flex items-center justify-between py-4 gap-4
                  ${i < upcomingReservations.length - 1
                    ? 'border-b border-white/[0.05]' : ''}`}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-200">
                    {r.user?.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {r.service?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                  <CalendarCheck size={13} className="text-amber-500/60" />
                  {r.schedule?.available_date} at {r.schedule?.start_time}
                  <span className="text-gray-700">·</span>
                  Barber: {r.barber?.user?.name}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg
                    ${r.status === 'confirmed'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {r.status.toUpperCase()}
                  </span>
                  {r.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(r.id, 'completed')}
                      className="text-xs font-semibold text-green-400
                        hover:text-green-300 border border-green-500/20
                        hover:border-green-400/40 px-3 py-1 rounded-lg
                        transition-all">
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}