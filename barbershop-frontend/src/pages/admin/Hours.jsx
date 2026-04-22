import { useState } from 'react'
import { Clock, Save, Check } from 'lucide-react'

const DAYS = [
  'Sunday','Monday','Tuesday','Wednesday',
  'Thursday','Friday','Saturday'
]

const defaultHours = {
  Sunday:    { open: false, start: '09:00', end: '21:00' },
  Monday:    { open: true,  start: '09:00', end: '21:00' },
  Tuesday:   { open: true,  start: '09:00', end: '21:00' },
  Wednesday: { open: true,  start: '09:00', end: '21:00' },
  Thursday:  { open: true,  start: '09:00', end: '21:00' },
  Friday:    { open: true,  start: '09:00', end: '21:00' },
  Saturday:  { open: true,  start: '09:00', end: '21:00' },
}

// ── Toggle Switch Component ──────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex items-center shrink-0
        w-10 h-5 rounded-full transition-colors duration-200
        focus:outline-none
        ${checked ? 'bg-amber-500' : 'bg-white/10'}`}>
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm
          transform transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

export default function Hours() {
  const [hours, setHours] = useState(() => {
    try {
      const saved = localStorage.getItem('barberco_hours')
      return saved ? JSON.parse(saved) : defaultHours
    } catch { return defaultHours }
  })
  const [saved, setSaved] = useState(false)

  const toggle = day =>
    setHours(h => ({ ...h, [day]: { ...h[day], open: !h[day].open } }))

  const setTime = (day, field, val) =>
    setHours(h => ({ ...h, [day]: { ...h[day], [field]: val } }))

  const handleSave = () => {
    localStorage.setItem('barberco_hours', JSON.stringify(hours))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputCls = `bg-[#1a1a1a] border border-white/[0.08] rounded-xl
    px-3 py-2 text-sm text-gray-200 focus:outline-none
    focus:border-amber-500/40 transition-colors`

  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-2xl font-black text-white tracking-tight mb-8">
        Operational Hours
      </h1>

      <div className="bg-[#111111] border border-white/[0.07] rounded-2xl
        p-6 max-w-2xl">

        {/* Header */}
        <div className="flex items-start gap-3 mb-6 pb-5
          border-b border-white/[0.07]">
          <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center
            justify-center shrink-0 mt-0.5">
            <Clock size={18} className="text-amber-500" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Store Hours</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Set the opening and closing times for each day of the week.
              Time format must be HH:mm (24-hour).
            </p>
          </div>
        </div>

        {/* Days list */}
        <div className="divide-y divide-white/[0.04]">
          {DAYS.map(day => {
            const h = hours[day]
            return (
              <div key={day}
                className="flex items-center gap-5 py-4">

                {/* Day name */}
                <span className="w-24 text-sm font-medium text-gray-300 shrink-0">
                  {day}
                </span>

                {/* Toggle */}
                <Toggle checked={h.open} onChange={() => toggle(day)} />

                {/* Time inputs or Closed label */}
                {h.open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={h.start}
                      onChange={e => setTime(day, 'start', e.target.value)}
                      className={inputCls}
                    />
                    <span className="text-gray-600 text-sm shrink-0">to</span>
                    <input
                      type="time"
                      value={h.end}
                      onChange={e => setTime(day, 'end', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-600 italic">
                    Closed
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Save button */}
      <div className="mt-6 flex justify-end max-w-2xl">
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl
            font-bold text-sm transition-all duration-200
            ${saved
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
              : 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20'
            }`}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Hours'}
        </button>
      </div>
    </div>
  )
}