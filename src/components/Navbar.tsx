import Link from 'next/link'
import { Sun, Plus, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
            <Sun size={18} />
          </div>
          <span className="font-black text-slate-800 text-lg hidden sm:block">TN Solar Engine</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:block">Dashboard</span>
          </Link>
          <Link
            href="/proposals/new"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:block">New Proposal</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
