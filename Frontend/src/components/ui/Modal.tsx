import type { ReactNode } from 'react'

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg bg-white shadow-xl border border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-semibold text-slate-900">{title}</div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
