import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate              = useNavigate()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard')
        setData(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full py-40">
      <p className="text-gray-400 text-lg">Memuat dashboard...</p>
    </div>
  )

  const { stats, latest_reservations, popular_services, busiest_barbers } = data

  const statusBadge = (status) => {
    const styles = {
      pending:   'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    const labels = {
      pending:   'Menunggu',
      confirmed: 'Dikonfirmasi',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    }
    return (
      <span className={`${styles[status]} px-2 py-1 rounded-full text-xs font-semibold`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Dashboard</h1>
        <p className="text-gray-400 text-sm">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric',
            month: 'long',   day: 'numeric'
          })}
        </p>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reservasi', value: stats.total_reservations, icon: '📋', color: 'bg-black' },
          { label: 'Total Barber',    value: stats.total_barbers,      icon: '👨‍💼', color: 'bg-gray-700' },
          { label: 'Total Layanan',   value: stats.total_services,     icon: '✂️',  color: 'bg-gray-600' },
          { label: 'Total Customer',  value: stats.total_customers,    icon: '👥',  color: 'bg-gray-500' },
        ].map((card, i) => (
          <div key={i} className={`${card.color} text-white p-5 rounded-2xl`}>
            <p className="text-2xl">{card.icon}</p>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
            <p className="text-sm opacity-70 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ===== STATUS RESERVASI ===== */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-lg font-bold mb-4">Status Reservasi</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Menunggu',     value: stats.pending,   color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            { label: 'Dikonfirmasi', value: stats.confirmed, color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: 'Selesai',      value: stats.completed, color: 'bg-green-50 text-green-700 border-green-200' },
            { label: 'Dibatalkan',   value: stats.cancelled, color: 'bg-red-50 text-red-700 border-red-200' },
          ].map((item, i) => (
            <div key={i} className={`${item.color} border p-4 rounded-xl text-center`}>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-sm mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ===== LAYANAN TERPOPULER ===== */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold mb-4">🔥 Layanan Terpopuler</h2>
          {popular_services.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {popular_services.map((service, i) => (
                <div key={service.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center
                      text-xs font-bold text-white
                      ${i === 0 ? 'bg-yellow-400' :
                        i === 1 ? 'bg-gray-400' :
                        i === 2 ? 'bg-orange-400' : 'bg-gray-300'}`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-gray-400">
                        Rp {Number(service.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {service.reservations_count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== BARBER TERSIBUK ===== */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold mb-4">💪 Barber Tersibuk</h2>
          {busiest_barbers.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {busiest_barbers.map((barber, i) => (
                <div key={barber.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                      👨
                    </div>
                    <div>
                      <p className="font-medium text-sm">{barber.user?.name}</p>
                      <p className="text-xs text-gray-400">{barber.bio || 'Barber profesional'}</p>
                    </div>
                  </div>
                  <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {barber.reservations_count} booking
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ===== RESERVASI TERBARU ===== */}
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">🕐 Reservasi Terbaru</h2>
          <button
            onClick={() => navigate('/admin/reservations')}
            className="text-sm text-gray-500 hover:text-black underline">
            Lihat semua →
          </button>
        </div>
        {latest_reservations.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Belum ada reservasi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-gray-500 font-medium">Customer</th>
                  <th className="pb-3 text-left text-gray-500 font-medium">Layanan</th>
                  <th className="pb-3 text-left text-gray-500 font-medium">Barber</th>
                  <th className="pb-3 text-left text-gray-500 font-medium">Tanggal</th>
                  <th className="pb-3 text-left text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {latest_reservations.map(r => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{r.user?.name}</td>
                    <td className="py-3 text-gray-600">{r.service?.name}</td>
                    <td className="py-3 text-gray-600">{r.barber?.user?.name}</td>
                    <td className="py-3 text-gray-600">{r.schedule?.available_date}</td>
                    <td className="py-3">{statusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}