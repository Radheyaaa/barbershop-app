import { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, Clock, Scissors } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'

const emptyForm = { name:'', description:'', price:'', duration:'' }

export default function ManageServices() {
  const [services, setServices]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [showForm, setShowForm]       = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [form, setForm]               = useState(emptyForm)

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/services')
      setServices(res.data.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchServices() }, [])

  const openAdd  = () => {
    setEditTarget(null); setForm(emptyForm); setShowForm(true)
  }
  const openEdit = s => {
    setEditTarget(s)
    setForm({ name:s.name, description:s.description||'',
      price:s.price, duration:s.duration })
    setShowForm(true)
  }

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true)
    try {
      editTarget
        ? await api.put(`/services/${editTarget.id}`, form)
        : await api.post('/services', form)
      setShowForm(false); fetchServices()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save')
    } finally { setSubmitting(false) }
  }

  const handleToggle = async s => {
    await api.put(`/services/${s.id}`, { is_active: !s.is_active })
    fetchServices()
  }

  const handleDelete = async () => {
    await api.delete(`/services/${deleteTarget.id}`)
    setDeleteTarget(null); fetchServices()
  }

  const filtered = services.filter(s => {
    const q = search.toLowerCase()
    return !q || s.name?.toLowerCase().includes(q)
  })

  const inputCls = `w-full bg-white/5 border border-white/10 rounded-xl
    px-4 py-3 text-sm text-gray-200 placeholder-gray-600
    focus:outline-none focus:border-amber-500/40 transition-colors`

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Manage Services
        </h1>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
            text-white font-semibold px-4 py-2.5 rounded-xl text-sm
            transition-all shadow-lg shadow-amber-500/20">
          <Plus size={16} strokeWidth={2.5} /> Add Service
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
              placeholder="Search services..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border
                border-white/[0.07] rounded-xl text-sm text-gray-300
                placeholder-gray-600 focus:outline-none
                focus:border-amber-500/40 transition-colors" />
          </div>
        </div>

        {loading ? <LoadingSpinner text="Loading services..." /> : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {['Service','Price','Duration','Status','Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px]
                    font-semibold text-gray-600 tracking-widest uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-white/[0.04]
                  hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-200">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate
                      max-w-sm">
                      {s.description || '—'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-amber-400 font-bold text-sm">
                      Rp {Number(s.price).toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-sm
                      text-gray-400">
                      <Clock size={13} className="text-gray-600" />
                      {s.duration} min
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggle(s)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg
                        border transition-all ${s.is_active
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)}
                        className="p-2 rounded-lg text-gray-600
                          hover:text-amber-400 hover:bg-amber-500/8 transition-all">
                        <Pencil size={15} strokeWidth={2} />
                      </button>
                      <button onClick={() => setDeleteTarget(s)}
                        className="p-2 rounded-lg text-gray-600
                          hover:text-red-400 hover:bg-red-500/8 transition-all">
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
        <Modal title={editTarget ? 'Edit Service' : 'Add New Service'}
          onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name:'name',     label:'Service Name', type:'text',   req:true },
              { name:'price',    label:'Price (Rp)',   type:'number', req:true },
              { name:'duration', label:'Duration (min)', type:'number', req:true },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-gray-500
                  uppercase tracking-wider block mb-1.5">{f.label}</label>
                <input type={f.type} name={f.name} value={form[f.name]}
                  onChange={handleChange} required={f.req}
                  className={inputCls} />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-500
                uppercase tracking-wider block mb-1.5">Description</label>
              <textarea name="description" value={form.description}
                onChange={handleChange} rows={3}
                className={`${inputCls} resize-none`} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-white/10 text-gray-400 py-3
                  rounded-xl text-sm hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-white
                  py-3 rounded-xl text-sm font-bold disabled:opacity-50
                  transition-all">
                {submitting ? 'Saving...'
                  : editTarget ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Delete Service" onClose={() => setDeleteTarget(null)}>
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex
              items-center justify-center mx-auto">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <p className="text-gray-300 text-sm">
              Delete <strong className="text-white">{deleteTarget.name}</strong> permanently?
            </p>
            <p className="text-xs text-red-400">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-white/10 text-gray-400
                  py-3 rounded-xl text-sm hover:bg-white/5 transition-all">
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