'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  Copy, Check, ExternalLink, Edit2, Trash2,
  MapPin, Zap, ChevronRight, Send,
} from 'lucide-react'
import { statusColor, statusDot, formatNumber } from '@/lib/utils'

interface Props {
  proposal: {
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
  onDelete: (id: string) => void
  onMarkSent: (id: string) => void
}

export default function ProposalCard({ proposal, onDelete, onMarkSent }: Props) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/p/${proposal.token}`

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleMarkSent() {
    await fetch(`/api/proposals/${proposal.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SENT' }),
    })
    onMarkSent(proposal.id)
  }

  async function handleDelete() {
    if (!confirm(`Delete proposal for ${proposal.clientName}? This cannot be undone.`)) return
    await fetch(`/api/proposals/${proposal.id}`, { method: 'DELETE' })
    onDelete(proposal.id)
  }

  const timeAgo = formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${proposal.status === 'APPROVED' ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-100'}`}>
      {/* Status bar */}
      <div className={`h-1 w-full ${proposal.status === 'APPROVED' ? 'bg-emerald-500' : proposal.status === 'VIEWED' ? 'bg-yellow-400' : proposal.status === 'SENT' ? 'bg-blue-500' : 'bg-slate-200'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {proposal.companyLogo ? (
              <img src={proposal.companyLogo} alt="logo" className="w-10 h-10 rounded-xl object-contain border border-slate-100" />
            ) : (
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-sm font-black">
                {proposal.companyName[0]}
              </div>
            )}
            <div>
              <h3 className="font-black text-slate-800">{proposal.clientName}</h3>
              <p className="text-xs text-slate-400">{proposal.clientEmail}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap ${statusColor(proposal.status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot(proposal.status)}`} />
            {proposal.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{proposal.address}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Zap size={12} className="shrink-0 text-yellow-500" />
            <span>{proposal.systemSizeKw} kW · {proposal.panelCount} panels</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex gap-3 text-[10px] text-slate-400 mb-4">
          <span>Created {timeAgo}</span>
          {proposal.sentAt && <span>· Sent</span>}
          {proposal.viewedAt && <span>· Viewed</span>}
          {proposal.approvedAt && <span className="text-emerald-600 font-bold">· Approved!</span>}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
          >
            <ExternalLink size={12} /> Preview
          </a>

          {proposal.status === 'DRAFT' && (
            <button
              onClick={handleMarkSent}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-all"
            >
              <Send size={12} /> Mark Sent
            </button>
          )}

          <Link
            href={`/proposals/${proposal.id}/edit`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all ml-auto"
          >
            <Edit2 size={12} /> Edit
          </Link>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Approved CTA */}
      {proposal.status === 'APPROVED' && (
        <div className="bg-emerald-50 border-t border-emerald-100 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-700">Client approved this proposal</span>
          <ChevronRight size={14} className="text-emerald-600" />
        </div>
      )}
    </div>
  )
}
