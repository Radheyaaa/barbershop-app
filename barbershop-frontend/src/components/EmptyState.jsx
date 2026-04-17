export default function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="text-5xl">{icon}</div>
      <p className="font-semibold text-gray-700">{title}</p>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      {action && (
        <button onClick={onAction}
          className="mt-2 bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800">
          {action}
        </button>
      )}
    </div>
  )
}