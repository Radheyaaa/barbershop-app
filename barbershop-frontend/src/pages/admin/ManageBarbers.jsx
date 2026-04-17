import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Users } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import { Camera } from 'lucide-react'
import { useRef } from 'react'

const emptyForm = { name: '', email: '', password: '', phone: '', bio: '' }

export default function ManageBarbers() {
  const [barbers, setBarbers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const photoRef = useRef()
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile]       = useState(null)

  const fetchBarbers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/barbers')
      setBarbers(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  useEffect(() => { fetchBarbers() }, [])

  const openAdd = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setShowForm(true)
  }

// Update openEdit untuk tampilkan foto existing
  const openEdit = (barber) => {
    setEditTarget(barber)
    setForm({ name: barber.user?.name || '', email: barber.user?.email || '',
      phone: barber.user?.phone || '', bio: barber.bio || '', password: '' })
    setPhotoPreview(barber.photo_url || null)
    setPhotoFile(null)
    setShowForm(true)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name',  form.name)
      formData.append('phone', form.phone)
      formData.append('bio',   form.bio)
      if (photoFile) formData.append('photo', photoFile)

      if (editTarget) {
        await api.post(`/barbers/${editTarget.id}?_method=PUT`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        formData.append('email',    form.email)
        formData.append('password', form.password)
        await api.post('/barbers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      setShowForm(false)
      setPhotoFile(null)
      setPhotoPreview(null)
      fetchBarbers()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan barber')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (barber) => {
    await api.put(`/barbers/${barber.id}`, { is_active: !barber.is_active })
    fetchBarbers()
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/barbers/${deleteTarget.id}`)
      setDeleteTarget(null)
      fetchBarbers()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus barber')
    }
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users size={22} />
          <h1 className="text-2xl font-bold">Manajemen Barber</h1>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800">
          <Plus size={18} /> Tambah Barber
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Memuat data barber..." />
      ) : barbers.length === 0 ? (
        <EmptyState
          icon="👨‍💼"
          title="Belum ada barber"
          subtitle="Tambahkan barber pertama untuk barbershop kamu"
          action="+ Tambah Barber"
          onAction={openAdd}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-4 text-left">Barber</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Telepon</th>
                <th className="p-4 text-left">Bio</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barbers.map(barber => (
                <tr key={barber.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex
                        items-center justify-center text-lg">
                        👨
                      </div>
                      <span className="font-medium">{barber.user?.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{barber.user?.email}</td>
                  <td className="p-4 text-sm">{barber.user?.phone || '-'}</td>
                  <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
                    {barber.bio || '-'}
                  </td>
                  <td className="p-4">
                    {barber.is_active
                      ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">Aktif</span>
                      : <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">Nonaktif</span>
                    }
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(barber)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleToggle(barber)}
                        className={`p-2 rounded-lg ${barber.is_active
                          ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        title={barber.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                        {barber.is_active
                          ? <ToggleRight size={15} />
                          : <ToggleLeft size={15} />}
                      </button>
                      <button onClick={() => setDeleteTarget(barber)}
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
          title={editTarget ? 'Edit Barber' : 'Tambah Barber Baru'}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Upload Foto */}
            <div className="flex flex-col items-center gap-3 pb-2">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden
                  flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="preview"
                      className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">👨</span>
                  )}
                </div>
                <button type="button"
                  onClick={() => photoRef.current.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-black text-white
                    rounded-xl flex items-center justify-center hover:bg-gray-800 transition">
                  <Camera size={14} />
                </button>
                <input ref={photoRef} type="file" accept="image/*"
                  className="hidden" onChange={handlePhotoChange} />
              </div>
              <p className="text-xs text-gray-400">Klik kamera untuk upload foto</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full mt-1 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Nama barber" />
            </div>
            {/* Email & password hanya muncul saat tambah baru */}
            {!editTarget && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    className="w-full mt-1 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="email@barbershop.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} required
                    className="w-full mt-1 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Min. 6 karakter" />
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">No. Telepon</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full mt-1 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange}
                className="w-full mt-1 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                rows={3} placeholder="Spesialisasi barber..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 p-3 rounded-xl hover:bg-gray-50">
                Batal
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 bg-black text-white p-3 rounded-xl hover:bg-gray-800 disabled:opacity-50">
                {submitting ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Tambah Barber'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <Modal title="Hapus Barber" onClose={() => setDeleteTarget(null)}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <p className="text-gray-700">
              Yakin ingin menghapus barber <strong>{deleteTarget.user?.name}</strong> secara permanen?
            </p>
            <p className="text-sm text-red-500">⚠️ Tindakan ini tidak bisa dibatalkan</p>
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