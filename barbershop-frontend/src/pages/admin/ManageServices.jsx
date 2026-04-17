import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Scissors } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'

const emptyForm = { name: '', description: '', price: '', duration: '' }

export default function ManageServices() {
  const [services, setServices]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [editTarget, setEditTarget] = useState(null) // null = tambah, obj = edit
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm]           = useState(emptyForm)

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/services')
      setServices(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchServices() }, [])

  const openAdd = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (service) => {
    setEditTarget(service)
    setForm({
      name:        service.name,
      description: service.description || '',
      price:       service.price,
      duration:    service.duration,
    })
    setShowForm(true)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editTarget) {
        await api.put(`/services/${editTarget.id}`, form)
      } else {
        await api.post('/services', form)
      }
      setShowForm(false)
      fetchServices()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan layanan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (service) => {
    await api.put(`/services/${service.id}`, { is_active: !service.is_active })
    fetchServices()
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/services/${deleteTarget.id}`)
      setDeleteTarget(null)
      fetchServices()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus layanan')
    }
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Scissors size={22} />
          <h1 className="text-2xl font-bold">Manajemen Layanan</h1>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800">
          <Plus size={18} /> Tambah Layanan
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Memuat layanan..." />
      ) : services.length === 0 ? (
        <EmptyState
          icon="✂️"
          title="Belum ada layanan"
          subtitle="Tambahkan layanan pertama untuk barbershop kamu"
          action="+ Tambah Layanan"
          onAction={openAdd}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-4 text-left">Nama Layanan</th>
                <th className="p-4 text-left">Deskripsi</th>
                <th className="p-4 text-left">Harga</th>
                <th className="p-4 text-left">Durasi</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{service.name}</td>
                  <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
                    {service.description || '-'}
                  </td>
                  <td className="p-4">
                    Rp {Number(service.price).toLocaleString('id-ID')}
                  </td>
                  <td className="p-4">{service.duration} menit</td>
                  <td className="p-4">
                    {service.is_active
                      ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">Aktif</span>
                      : <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">Nonaktif</span>
                    }
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {/* Edit */}
                      <button onClick={() => openEdit(service)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="Edit">
                        <Pencil size={15} />
                      </button>
                      {/* Toggle aktif */}
                      <button onClick={() => handleToggle(service)}
                        className={`p-2 rounded-lg ${service.is_active
                          ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        title={service.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                        {service.is_active
                          ? <ToggleRight size={15} />
                          : <ToggleLeft size={15} />}
                      </button>
                      {/* Hapus */}
                      <button onClick={() => setDeleteTarget(service)}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                        title="Hapus permanen">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah / Edit */}
      {showForm && (
        <Modal
          title={editTarget ? 'Edit Layanan' : 'Tambah Layanan Baru'}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nama Layanan</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full mt-1 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Contoh: Potong Rambut" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Harga (Rp)</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} required
                  className="w-full mt-1 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="35000" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Durasi (menit)</label>
                <input name="duration" type="number" value={form.duration} onChange={handleChange} required
                  className="w-full mt-1 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="30" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                className="w-full mt-1 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                rows={3} placeholder="Deskripsi layanan..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 p-3 rounded-xl hover:bg-gray-50">
                Batal
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 bg-black text-white p-3 rounded-xl hover:bg-gray-800 disabled:opacity-50">
                {submitting ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Tambah Layanan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <Modal title="Hapus Layanan" onClose={() => setDeleteTarget(null)}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center
              justify-center mx-auto">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <p className="text-gray-700">
              Yakin ingin menghapus layanan <strong>{deleteTarget.name}</strong> secara permanen?
            </p>
            <p className="text-sm text-red-500">
              ⚠️ Tindakan ini tidak bisa dibatalkan
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-300 p-3 rounded-xl hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-500 text-white p-3 rounded-xl hover:bg-red-600">
                Ya, Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}