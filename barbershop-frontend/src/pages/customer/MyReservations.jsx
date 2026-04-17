import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function MyReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations/my')
      setReservations(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReservations() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Yakin ingin membatalkan reservasi ini?')) return
    try {
      await api.put(`/reservations/${id}/cancel`)
      alert('Reservasi berhasil dibatalkan')
      fetchReservations()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membatalkan reservasi')
    }
  }

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
      <span className={`${styles[status]} px-3 py-1 rounded-full text-xs font-semibold`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">📋 Riwayat Reservasi</h1>
          <button
            onClick={() => navigate('/booking')}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm">
            + Buat Reservasi
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Memuat...</div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <p className="text-4xl mb-3">✂️</p>
            <p className="text-gray-500">Belum ada reservasi</p>
            <button
              onClick={() => navigate('/booking')}
              className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
              Buat Reservasi Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map(r => (
              <div key={r.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg">{r.service?.name}</p>
                    <p className="text-gray-500 text-sm">
                      Barber: {r.barber?.user?.name}
                    </p>
                  </div>
                  {statusBadge(r.status)}
                </div>

                <hr className="my-3" />

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400">Tanggal</p>
                    <p className="font-medium">{r.schedule?.available_date}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Jam</p>
                    <p className="font-medium">
                      {r.schedule?.start_time} - {r.schedule?.end_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Harga</p>
                    <p className="font-medium">
                      Rp {Number(r.service?.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Durasi</p>
                    <p className="font-medium">{r.service?.duration} menit</p>
                  </div>
                </div>

                {r.note && (
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                    📝 {r.note}
                  </div>
                )}

                {['pending', 'confirmed'].includes(r.status) && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    className="mt-4 w-full border border-red-500 text-red-500 p-2
                      rounded-lg hover:bg-red-50 text-sm font-medium">
                    Batalkan Reservasi
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/home')}
          className="mt-6 w-full border border-gray-300 p-3 rounded-xl
            text-gray-500 hover:bg-gray-200 text-sm">
          ← Kembali ke Home
        </button>

      </div>
    </div>
  )
}