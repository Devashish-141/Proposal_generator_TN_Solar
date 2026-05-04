'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sun, LogOut, Plus, LayoutDashboard } from 'lucide-react'
import { avatarColor, initials } from '@/lib/utils'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
            <Sun size={18} />
          </div>
          <span className="font-black text-slate-800 text-lg hidden sm:block">TN Solar Engine</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              pathname === '/' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:block">Dashboard</span>
          </Link>
          <Link
            href="/proposals/new"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-emerald-200"
          >
            <Plus size={16} />
            <span className="hidden sm:block">New Proposal</span>
          </Link>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${avatarColor(session.user.name)}`}>
              {initials(session.user.name)}
            </div>
            <span className="text-sm font-semibold text-slate-700 hidden md:block">
              {session.user.name}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  )
}
