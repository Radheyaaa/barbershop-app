import { useState, useEffect } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { ClipboardList } from 'lucide-react'

export default function ManageReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/reservations')
      setReservations(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReservations() }, [])

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/admin/reservations/${id}/status`, { status })
      fetchReservations()
    } catch (err) {
      alert('Gagal update status')
    }
  }

  const statusBadge = (status) => {
    const styles = {
      pending:   'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`${styles[status]} px-2 py-1 rounded text-xs font-medium`}>
        {status}
      </span>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manajemen Reservasi</h1>


      {loading ? (
        <LoadingSpinner text="Memuat reservasi..." />
      ) : reservations.length === 0 ? (
        <EmptyState icon="📋" title="Belum ada reservasi" />
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-4 text-left">Pelanggan</th>
                <th className="p-4 text-left">Barber</th>
                <th className="p-4 text-left">Layanan</th>
                <th className="p-4 text-left">Tanggal & Jam</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{r.user?.name}</td>
                  <td className="p-4">{r.barber?.user?.name}</td>
                  <td className="p-4">{r.service?.name}</td>
                  <td className="p-4 text-sm">
                    {r.schedule?.available_date}<br/>
                    <span className="text-gray-500">{r.schedule?.start_time}</span>
                  </td>
                  <td className="p-4">{statusBadge(r.status)}</td>
                  <td className="p-4">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatus(r.id, e.target.value)}
                      className="border p-1 rounded text-sm focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}