'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sun, Plus, FileText, Send, Eye, CheckCircle, TrendingUp, Search,
} from 'lucide-react'
import ProposalCard from '@/components/dashboard/ProposalCard'

interface ProposalSummary {
  id: string
  token: string
  status: string
  clientName: string
  clientEmail: string
  address: string
  companyName: string
  companyLogo: string | null
  systemSizeKw: number
  panelCount: number
  createdAt: string
  sentAt: string | null
  viewedAt: string | null
  approvedAt: string | null
}

const STATUS_FILTERS = ['ALL', 'DRAFT', 'SENT', 'VIEWED', 'APPROVED'] as const
type Filter = typeof STATUS_FILTERS[number]

export default function Dashboard() {
  const [proposals, setProposals] = useState<ProposalSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/proposals')
      .then(r => r.json())
      .then(data => {
        setProposals(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  const counts = {
    ALL: proposals.length,
    DRAFT: proposals.filter(p => p.status === 'DRAFT').length,
    SENT: proposals.filter(p => p.status === 'SENT').length,
    VIEWED: proposals.filter(p => p.status === 'VIEWED').length,
    APPROVED: proposals.filter(p => p.status === 'APPROVED').length,
  }

  const filtered = proposals.filter(p => {
    const matchStatus = filter === 'ALL' || p.status === filter
    const matchSearch =
      !search ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  function handleDelete(id: string) {
    setProposals(prev => prev.filter(p => p.id !== id))
  }

  function handleMarkSent(id: string) {
    setProposals(prev =>
      prev.map(p => p.id === id ? { ...p, status: 'SENT', sentAt: new Date().toISOString() } : p)
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FileText size={18} className="text-slate-500" />} label="Total" value={counts.ALL} color="bg-slate-50" />
        <StatCard icon={<Send size={18} className="text-blue-500" />} label="Sent" value={counts.SENT} color="bg-blue-50" />
        <StatCard icon={<Eye size={18} className="text-yellow-500" />} label="Viewed" value={counts.VIEWED} color="bg-yellow-50" />
        <StatCard icon={<CheckCircle size={18} className="text-emerald-500" />} label="Approved" value={counts.APPROVED} color="bg-emerald-50" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, email or address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          />
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {s} {counts[s] > 0 && <span className="ml-1 opacity-60">{counts[s]}</span>}
            </button>
          ))}
        </div>

        <Link
          href="/proposals/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-100 shrink-0"
        >
          <Plus size={16} /> New Proposal
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
            {search ? <Search size={28} /> : <Sun size={28} />}
          </div>
          <p className="font-bold text-slate-600 mb-1">
            {search ? 'No proposals match your search' : 'No proposals yet'}
          </p>
          <p className="text-sm text-slate-400 mb-6">
            {search ? 'Try a different search term' : 'Create your first proposal to get started'}
          </p>
          {!search && (
            <Link
              href="/proposals/new"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
            >
              <Plus size={16} /> Create First Proposal
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(p => (
            <ProposalCard
              key={p.id}
              proposal={p}
              onDelete={handleDelete}
              onMarkSent={handleMarkSent}
            />
          ))}
        </div>
      )}

      {counts.APPROVED > 0 && (
        <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
          <TrendingUp size={20} className="text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800 font-medium">
            <strong>{counts.APPROVED}</strong> proposal{counts.APPROVED > 1 ? 's' : ''} approved — great work!
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-5 border border-white`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm font-semibold text-slate-600">{label}</span>
      </div>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  )
}
