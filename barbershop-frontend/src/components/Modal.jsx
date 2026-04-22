export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
      px-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-[#141414] border border-white/[0.08] rounded-2xl
          w-full max-w-md shadow-2xl"
        style={{ animation: 'modalIn .18s ease' }}>
        <div className="flex items-center justify-between px-6 py-4
          border-b border-white/[0.07]">
          <h3 className="font-bold text-white text-base">{title}</h3>
          <button onClick={onClose}
            className="text-gray-600 hover:text-gray-300 transition-colors
              text-xl leading-none">
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity:0; transform:scale(.96) translateY(6px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}