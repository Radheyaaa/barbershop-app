import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Scissors, Clock, Calendar,
  X, ChevronRight, Filter
} from 'lucide-react'
import api from '../../services/api'

const STATUS_CONFIG = {
  pending:   { label:'Pending',     color:'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  confirmed: { label:'Confirmed',   color:'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  completed: { label:'Completed',   color:'bg-green-500/10 text-green-400 border-green-500/20' },
  cancelled: { label:'Cancelled',   color:'bg-red-500/10 text-red-400 border-red-500/20' },
}

export default function MyReservations() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('all')
  const [cancelTarget, setCancelTarget] = useState(null)

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations/my')
      setReservations(res.data.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchReservations() }, [])

  const handleCancel = async () => {
    try {
      await api.put(`/reservations/${cancelTarget.id}/cancel`)
      setCancelTarget(null)
      fetchReservations()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel')
    }
  }

  const filtered = filter === 'all'
    ? reservations
    : reservations.filter(r => r.status === filter)

  const filters = ['all','pending','confirmed','completed','cancelled']

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Cancel confirm modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
          px-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/[0.08] rounded-2xl
            p-7 w-full max-w-sm shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center
              justify-center mx-auto mb-5">
              <X size={24} className="text-red-400" strokeWidth={2} />
            </div>
            <h3 className="font-black text-white text-lg mb-2">
              Cancel Reservation?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to cancel your{' '}
              <span className="text-white font-semibold">
                {cancelTarget.service?.name}
              </span>{' '}
              appointment?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)}
                className="flex-1 border border-white/10 text-gray-400 py-3
                  rounded-xl text-sm hover:bg-white/5 transition-all">
                Keep it
              </button>
              <button onClick={handleCancel}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3
                  rounded-xl text-sm font-bold transition-all">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-[#0d0d0d] border-b border-white/[0.06] px-6 py-4
        flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')}
            className="p-2 rounded-xl text-gray-600 hover:text-gray-200
              hover:bg-white/5 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center
              justify-center">
              <Scissors size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-base text-amber-400">BarberCo</span>
          </div>
        </div>
        <button onClick={() => navigate('/booking')}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
            text-white text-sm font-semibold px-4 py-2.5 rounded-xl
            transition-all hover:shadow-lg hover:shadow-amber-500/20">
          <Plus size={15} strokeWidth={2.5} />
          New Booking
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            My Bookings
          </h1>
          <p className="text-gray-600 text-sm">
            Track and manage your appointments
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold
                uppercase tracking-wider transition-all duration-200
                ${filter === f
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/5 border border-white/[0.07] text-gray-600 hover:text-gray-300'}`}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-gray-800 border-t-amber-500
              rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">Loading bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#111111] border border-white/[0.07] rounded-3xl
            p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center
              justify-center mx-auto mb-5">
              <Scissors size={28} className="text-gray-700" strokeWidth={1.5} />
            </div>
            <h3 className="font-black text-white text-lg mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {filter === 'all'
                ? "You haven't made any bookings yet."
                : `No ${filter} bookings found.`}
            </p>
            <button onClick={() => navigate('/booking')}
              className="inline-flex items-center gap-2 bg-amber-500
                hover:bg-amber-400 text-white px-6 py-3 rounded-xl
                font-bold text-sm transition-all">
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => {
              const sc      = STATUS_CONFIG[r.status]
              const canCancel = ['pending','confirmed'].includes(r.status)
              return (
                <div key={r.id}
                  className="bg-[#111111] border border-white/[0.07]
                    rounded-2xl overflow-hidden hover:border-white/15
                    transition-all duration-200">

                  {/* Top */}
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-xl
                        flex items-center justify-center shrink-0">
                        <Scissors size={20} className="text-amber-500"
                          strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="font-bold text-white tracking-tight">
                          {r.service?.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          with {r.barber?.user?.name}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg
                      border shrink-0 ${sc?.color}`}>
                      {sc?.label}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/[0.05] mx-5" />

                  {/* Details */}
                  <div className="p-5 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-700
                        uppercase tracking-wider mb-1">Date</p>
                      <p className="text-sm text-gray-300 font-medium">
                        {r.schedule?.available_date
                          ? new Date(r.schedule.available_date)
                            .toLocaleDateString('en-US', {
                              month:'short', day:'numeric', year:'numeric'
                            })
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-700
                        uppercase tracking-wider mb-1">Time</p>
                      <p className="text-sm text-gray-300 font-medium">
                        {r.schedule?.start_time?.slice(0,5) || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-700
                        uppercase tracking-wider mb-1">Price</p>
                      <p className="text-sm text-amber-400 font-black">
                        Rp {Number(r.service?.price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Note */}
                  {r.note && (
                    <div className="px-5 pb-4">
                      <p className="text-xs text-gray-600 bg-white/[0.03]
                        border border-white/[0.06] rounded-xl px-3 py-2">
                        Note: {r.note}
                      </p>
                    </div>
                  )}

                  {/* Cancel button */}
                  {canCancel && (
                    <div className="border-t border-white/[0.05] px-5 py-3">
                      <button onClick={() => setCancelTarget(r)}
                        className="text-xs font-semibold text-red-400/70
                          hover:text-red-400 transition-colors flex items-center
                          gap-1.5">
                        <X size={13} />
                        Cancel this appointment
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}