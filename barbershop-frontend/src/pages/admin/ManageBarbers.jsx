import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Pencil, Trash2, Camera, Users } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'

const emptyForm = { name:'', email:'', password:'', phone:'', bio:'' }

export default function ManageBarbers() {
  const [barbers, setBarbers]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [showForm, setShowForm]       = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [form, setForm]               = useState(emptyForm)
  const [photoFile, setPhotoFile]     = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const photoRef = useRef()

  const fetchBarbers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/barbers')
      setBarbers(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBarbers() }, [])

  const openAdd = () => {
    setEditTarget(null); setForm(emptyForm)
    setPhotoFile(null); setPhotoPreview(null)
    setShowForm(true)
  }

  const openEdit = (b) => {
    setEditTarget(b)
    setForm({ name:b.user?.name||'', email:b.user?.email||'',
      phone:b.user?.phone||'', bio:b.bio||'', password:'' })
    setPhotoPreview(b.photo_url || null)
    setPhotoFile(null); setShowForm(true)
  }

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhoto = e => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name); fd.append('phone', form.phone)
      fd.append('bio', form.bio)
      if (photoFile) fd.append('photo', photoFile)
      if (editTarget) {
        await api.post(`/barbers/${editTarget.id}?_method=PUT`, fd,
          { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        fd.append('email', form.email); fd.append('password', form.password)
        await api.post('/barbers', fd,
          { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setShowForm(false); fetchBarbers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save')
    } finally { setSubmitting(false) }
  }

  const handleToggle = async b => {
    await api.put(`/barbers/${b.id}`, { is_active: !b.is_active })
    fetchBarbers()
  }

  const handleDelete = async () => {
    await api.delete(`/barbers/${deleteTarget.id}`)
    setDeleteTarget(null); fetchBarbers()
  }

  const filtered = barbers.filter(b => {
    const q = search.toLowerCase()
    return !q || b.user?.name?.toLowerCase().includes(q)
      || b.user?.email?.toLowerCase().includes(q)
  })

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Manage Barbers
        </h1>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
            text-white font-semibold px-4 py-2.5 rounded-xl text-sm
            transition-all shadow-lg shadow-amber-500/20">
          <Plus size={16} strokeWidth={2.5} /> Add Barber
        </button>
      </div>

      <div className="bg-[#111111] border border-white/[0.07] rounded-2xl
        overflow-hidden">

        {/* Search */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2
              -translate-y-1/2 text-gray-600" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search barbers..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border
                border-white/[0.07] rounded-xl text-sm text-gray-300
                placeholder-gray-600 focus:outline-none
                focus:border-amber-500/40 transition-colors" />
          </div>
        </div>

        {loading ? <LoadingSpinner text="Loading barbers..." /> : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {['Barber','Specialty','Status','Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px]
                    font-semibold text-gray-600 tracking-widest uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}
                  className="border-b border-white/[0.04]
                    hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden
                        bg-white/5 border border-white/[0.07] shrink-0
                        flex items-center justify-center">
                        {b.photo_url ? (
                          <img src={b.photo_url} alt={b.user?.name}
                            className="w-full h-full object-cover" />
                        ) : (
                          <Users size={18} className="text-gray-600"
                            strokeWidth={1.5} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-200">
                          {b.user?.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 truncate
                          max-w-[200px]">
                          {b.bio || b.user?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-amber-400/80 font-medium">
                      {b.bio || '—'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggle(b)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg
                        border transition-all ${b.is_active
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {b.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(b)}
                        className="p-2 rounded-lg text-gray-600
                          hover:text-amber-400 hover:bg-amber-500/8
                          transition-all">
                        <Pencil size={15} strokeWidth={2} />
                      </button>
                      <button onClick={() => setDeleteTarget(b)}
                        className="p-2 rounded-lg text-gray-600
                          hover:text-red-400 hover:bg-red-500/8
                          transition-all">
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <Modal title={editTarget ? 'Edit Barber' : 'Add New Barber'}
          onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo upload */}
            <div className="flex flex-col items-center gap-2 pb-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border
                  border-white/10 overflow-hidden flex items-center
                  justify-center">
                  {photoPreview
                    ? <img src={photoPreview} className="w-full h-full object-cover" />
                    : <Users size={28} className="text-gray-600" strokeWidth={1.5} />
                  }
                </div>
                <button type="button" onClick={() => photoRef.current.click()}
                  className="absolute -bottom-2 -right-2 w-7 h-7 bg-amber-500
                    rounded-lg flex items-center justify-center text-white
                    hover:bg-amber-400 transition-colors">
                  <Camera size={13} />
                </button>
                <input ref={photoRef} type="file" accept="image/*"
                  className="hidden" onChange={handlePhoto} />
              </div>
              <p className="text-xs text-gray-600">Click to upload photo</p>
            </div>

            {[
              { name:'name',  label:'Full Name',   type:'text',     req:true },
              { name:'phone', label:'Phone Number', type:'text',     req:false },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-gray-500
                  uppercase tracking-wider block mb-1.5">
                  {f.label}
                </label>
                <input type={f.type} name={f.name} value={form[f.name]}
                  onChange={handleChange} required={f.req}
                  className="w-full bg-white/5 border border-white/10
                    rounded-xl px-4 py-3 text-sm text-gray-200
                    placeholder-gray-600 focus:outline-none
                    focus:border-amber-500/40 transition-colors" />
              </div>
            ))}

            {!editTarget && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-500
                    uppercase tracking-wider block mb-1.5">Email</label>
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange} required
                    className="w-full bg-white/5 border border-white/10
                      rounded-xl px-4 py-3 text-sm text-gray-200
                      focus:outline-none focus:border-amber-500/40
                      transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500
                    uppercase tracking-wider block mb-1.5">Password</label>
                  <input type="password" name="password" value={form.password}
                    onChange={handleChange} required minLength={6}
                    className="w-full bg-white/5 border border-white/10
                      rounded-xl px-4 py-3 text-sm text-gray-200
                      focus:outline-none focus:border-amber-500/40
                      transition-colors" />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500
                uppercase tracking-wider block mb-1.5">Bio / Specialty</label>
              <textarea name="bio" value={form.bio} onChange={handleChange}
                rows={3}
                className="w-full bg-white/5 border border-white/10
                  rounded-xl px-4 py-3 text-sm text-gray-200
                  focus:outline-none focus:border-amber-500/40
                  transition-colors resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-white/10 text-gray-400
                  hover:text-white py-3 rounded-xl text-sm font-medium
                  transition-all hover:bg-white/5">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-white
                  py-3 rounded-xl text-sm font-bold transition-all
                  disabled:opacity-50">
                {submitting ? 'Saving...'
                  : editTarget ? 'Save Changes' : 'Add Barber'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Delete Barber" onClose={() => setDeleteTarget(null)}>
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex
              items-center justify-center mx-auto">
              <Trash2 size={24} className="text-red-400" strokeWidth={2} />
            </div>
            <p className="text-gray-300 text-sm">
              Delete barber <strong className="text-white">
              {deleteTarget.user?.name}</strong> permanently?
            </p>
            <p className="text-xs text-red-400">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-white/10 text-gray-400 py-3
                  rounded-xl text-sm hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white
                  py-3 rounded-xl text-sm font-bold transition-all">
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}