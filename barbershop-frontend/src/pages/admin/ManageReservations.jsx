import { useState, useEffect, useRef } from 'react'
import { Search, MoreVertical, Clock, Lock } from 'lucide-react'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const STATUS_STYLES = {
  pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const STATUS_TRANSITIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [], // ← locked, tidak bisa diubah
  cancelled: [], // ← locked
}

function ActionMenu({ reservation, onStatusChange }) {
  const [open, setOpen]   = useState(false)
  const menuRef           = useRef()
  const btnRef            = useRef()
  const [pos, setPos]     = useState({ top: 0, right: 0 })

  const locked = reservation.status === 'completed'
    || reservation.status === 'cancelled'

  const transitions = STATUS_TRANSITIONS[reservation.status] || []

  const handleOpen = () => {
    if (locked || transitions.length === 0) return
    const rect = btnRef.current.getBoundingClientRect()
    // Hitung posisi dropdown relatif ke viewport
    setPos({
      top:   rect.bottom + window.scrollY + 4,
      right: window.innerWidth - rect.right,
    })
    setOpen(true)
  }

  // Tutup saat klik di luar
  useEffect(() => {
    if (!open) return
    const handler = e => {
      if (!menuRef.current?.contains(e.target)
        && !btnRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (locked) {
    return (
      <div className="flex items-center gap-1.5 text-gray-700 text-xs">
        <Lock size={12} />
        <span>Locked</span>
      </div>
    )
  }

  return (
    <>
      <button ref={btnRef} onClick={handleOpen}
        className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300
          hover:bg-white/5 transition-all">
        <MoreVertical size={16} />
      </button>

      {/* Portal-style dropdown — fixed position */}
      {open && (
        <div ref={menuRef}
          className="fixed z-[999] bg-[#1e1e1e] border border-white/10
            rounded-xl shadow-2xl shadow-black/60 py-1.5 w-44 overflow-hidden"
          style={{ top: pos.top, right: pos.right }}>
          <p className="px-4 py-1.5 text-[10px] font-bold text-gray-600
            tracking-widest uppercase border-b border-white/[0.06] mb-1">
            Change Status
          </p>
          {transitions.map(s => (
            <button key={s}
              onClick={() => { onStatusChange(reservation.id, s); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-400
                hover:text-white hover:bg-white/5 transition-colors
                flex items-center gap-2 capitalize">
              <span className={`w-1.5 h-1.5 rounded-full ${
                s === 'confirmed' ? 'bg-blue-400' :
                s === 'completed' ? 'bg-green-400' :
                s === 'cancelled' ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
              {s}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

export default function ManageReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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
    await api.put(`/admin/reservations/${id}/status`, { status })
    fetchReservations()
  }

  const filtered = reservations.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || r.user?.name?.toLowerCase().includes(q)
      || r.user?.email?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-8 space-y-6 min-h-screen">
      <h1 className="text-2xl font-black text-white tracking-tight">
        Reservations
      </h1>

      <div className="bg-[#111111] border border-white/[0.07] rounded-2xl
        overflow-visible">

        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2
              -translate-y-1/2 text-gray-600" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border
                border-white/[0.07] rounded-xl text-sm text-gray-300
                placeholder-gray-600 focus:outline-none
                focus:border-amber-500/40 transition-colors" />
          </div>
          <select value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="ml-auto bg-white/5 border border-white/[0.07]
              rounded-xl px-3 py-2 text-sm text-gray-300
              focus:outline-none focus:border-amber-500/40 cursor-pointer">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading reservations..." />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600 text-sm">
            No reservations found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Customer','Service & Barber','Date & Time',
                    'Price','Status','Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px]
                      font-semibold text-gray-600 tracking-widest uppercase
                      whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}
                    className="border-b border-white/[0.04]
                      hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-200">
                        {r.user?.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {r.user?.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-200">
                        {r.service?.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {r.barber?.user?.name}
                      </p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-300">
                        {r.schedule?.available_date
                          ? new Date(r.schedule.available_date)
                            .toLocaleDateString('en-US', {
                              month:'short', day:'numeric', year:'numeric'
                            })
                          : '-'}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5
                        flex items-center gap-1">
                        <Clock size={11} /> {r.schedule?.start_time}
                      </p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-amber-400 font-bold text-sm">
                        Rp {Number(r.service?.price || 0)
                          .toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-block text-xs font-bold
                        px-2.5 py-1 rounded-lg border
                        ${STATUS_STYLES[r.status]}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <ActionMenu
                        reservation={r}
                        onStatusChange={handleStatus}
                      />
                    </td>
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