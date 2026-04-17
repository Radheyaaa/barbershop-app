import { useState, useEffect } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { CalendarDays, Plus, Trash2 } from 'lucide-react'

export default function ManageSchedules() {
  const [schedules, setSchedules] = useState([])
  const [barbers, setBarbers]     = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    barber_id: '', available_date: '', start_time: '', end_time: ''
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [s, b] = await Promise.all([
        api.get('/admin/schedules'),
        api.get('/barbers'),
      ])
      setSchedules(s.data.data)
      setBarbers(b.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/schedules', form)
      alert('Jadwal berhasil ditambahkan!')
      setShowForm(false)
      setForm({ barber_id: '', available_date: '', start_time: '', end_time: '' })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan jadwal')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus jadwal ini?')) return
    try {
      await api.delete(`/schedules/${id}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus jadwal')
    }
  }

  const statusBadge = (is_booked) => is_booked
    ? <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">Terisi</span>
    : <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">Tersedia</span>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Jadwal</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
          {showForm ? 'Batal' : '+ Tambah Jadwal'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-xl mb-6 border">
          <h2 className="text-lg font-semibold mb-4">Tambah Jadwal Baru</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <select name="barber_id" value={form.barber_id}
              onChange={handleChange} required
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
              <option value="">Pilih Barber</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.user?.name}</option>
              ))}
            </select>
            <input name="available_date" type="date" value={form.available_date}
              onChange={handleChange} required
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input name="start_time" type="time" value={form.start_time}
              onChange={handleChange} required
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input name="end_time" type="time" value={form.end_time}
              onChange={handleChange} required
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button type="submit" disabled={loading}
              className="col-span-2 bg-black text-white p-3 rounded-lg hover:bg-gray-800">
              {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </form>
        </div>
      )}
      {loading ? (
        <LoadingSpinner text="Memuat jadwal..." />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Belum ada jadwal"
          subtitle="Tambahkan jadwal untuk barber"
          action="+ Tambah Jadwal"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-4 text-left">Barber</th>
                <th className="p-4 text-left">Tanggal</th>
                <th className="p-4 text-left">Jam Mulai</th>
                <th className="p-4 text-left">Jam Selesai</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-400">
                    Belum ada jadwal
                  </td>
                </tr>
              ) : (
                schedules.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{s.barber?.user?.name}</td>
                    <td className="p-4">{s.available_date}</td>
                    <td className="p-4">{s.start_time}</td>
                    <td className="p-4">{s.end_time}</td>
                    <td className="p-4">{statusBadge(s.is_booked)}</td>
                    <td className="p-4">
                      {!s.is_booked && (
                        <button onClick={() => handleDelete(s.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}