'use client'

import React, { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import {
  Sun, Zap, Leaf, TreeDeciduous, Car, User, MapPin, Phone, Mail,
  IndianRupee, TrendingUp, Calendar, ChevronRight, Download,
  Loader2, FileText, Battery, Cpu, ShieldCheck, Award,
  CheckCircle2, Sparkles, ThumbsUp,
} from 'lucide-react'
import { toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'
import { FullProposal, PaymentOption } from '@/lib/types'
import { calculateROIForOption } from '@/lib/calculations'
import { formatNumber } from '@/lib/utils'

interface Props {
  proposal: FullProposal
}

export default function ClientProposalView({ proposal }: Props) {
  const [selectedOptId, setSelectedOptId] = useState(proposal.paymentOptions[0]?.id ?? '')
  const [approved, setApproved] = useState(proposal.status === 'APPROVED')
  const [approving, setApproving] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

  const selectedOpt: PaymentOption = useMemo(
    () => proposal.paymentOptions.find(o => o.id === selectedOptId) ?? proposal.paymentOptions[0],
    [selectedOptId, proposal.paymentOptions]
  )

  const roi = useMemo(
    () => calculateROIForOption(selectedOpt, proposal.systemSizeKw),
    [selectedOpt, proposal.systemSizeKw]
  )

  async function handleApprove() {
    setApproving(true)
    const res = await fetch(`/api/proposals/${proposal.id}/approve`, { method: 'POST' })
    if (res.ok) setApproved(true)
    setApproving(false)
  }

  async function handlePDF() {
    if (!pdfRef.current) return
    setGeneratingPDF(true)
    await new Promise(r => setTimeout(r, 800))
    try {
      const el = pdfRef.current
      const url = await toJpeg(el, { quality: 0.95, backgroundColor: '#f8fafc', width: el.scrollWidth, height: el.scrollHeight, style: { height: 'auto', overflow: 'visible' } })
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [el.scrollWidth, el.scrollHeight], hotfixes: ['px_scaling'] })
      pdf.addImage(url, 'JPEG', 0, 0, el.scrollWidth, el.scrollHeight)
      pdf.save(`Solar_Proposal_${proposal.clientName.replace(/\s+/g, '_')}.pdf`)
    } catch (e) {
      console.error(e)
    }
    setGeneratingPDF(false)
  }

  if (approved && proposal.status !== 'APPROVED') {
    return <ApprovedScreen proposal={proposal} />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div ref={pdfRef} className="max-w-5xl mx-auto px-4 md:px-10 py-8 space-y-12 pb-24">

        {/* ── 1. Header ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-4">
            {proposal.companyLogo ? (
              <img src={proposal.companyLogo} alt={proposal.companyName} className="h-14 object-contain" />
            ) : (
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Sun size={28} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-800">{proposal.companyName}</h1>
              <div className="flex flex-col sm:flex-row gap-x-4 mt-0.5 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1"><Phone size={10} />{proposal.companyPhone}</span>
                <span className="flex items-center gap-1"><Mail size={10} />{proposal.companyEmail}</span>
              </div>
            </div>
          </div>
          <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 min-w-[200px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prepared for</p>
            <p className="font-black text-slate-800 text-lg">{proposal.clientName}</p>
            <p className="text-xs text-slate-500 flex items-start gap-1 mt-1">
              <MapPin size={11} className="shrink-0 mt-0.5" />{proposal.address}
            </p>
            <p className="text-[10px] text-slate-400 mt-2">
              {new Date(proposal.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </motion.section>

        {/* ── 2. Hero Banner ── */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-[2rem] overflow-hidden shadow-2xl">
          <img src="/solar_rooftop_hero_1777289045498.png" alt="Solar Rooftop" className="w-full aspect-[21/9] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-16">
            <span className="inline-block px-3 py-1 bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/40 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-widest mb-4 w-fit">
              Personalized Solar Proposal
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
              Your Solar Journey <br /><span className="text-emerald-400">Starts Here.</span>
            </h2>
            <p className="mt-3 text-white/80 text-sm md:text-base max-w-md">
              A {proposal.systemSizeKw} kW premium system designed for {proposal.clientName.split(' ')[0]}'s home.
            </p>
          </div>
        </motion.div>

        {/* ── 3. Payment Option Toggle ── */}
        {proposal.paymentOptions.length > 1 && (
          <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Select Your Payment Option</p>
            <div className="flex flex-wrap gap-3">
              {proposal.paymentOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOptId(opt.id)}
                  className={`px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${
                    selectedOptId === opt.id
                      ? opt.type === 'Cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                  {opt.type === 'Loan' && opt.emi && (
                    <span className="block text-[11px] font-medium mt-0.5 opacity-70">₹{formatNumber(opt.emi)}/mo EMI</span>
                  )}
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── 4. Key Metrics ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={<Zap className="text-yellow-500" />} label="System Size" value={`${proposal.systemSizeKw} kW`} sub={`${proposal.panelCount} Panels`} delay={0.05} />
          <MetricCard icon={<TrendingUp className="text-emerald-500" />} label="Monthly Savings" value={`₹${formatNumber(roi.monthlySavings)}`} sub="Est. avg." delay={0.1} highlight />
          <MetricCard icon={<Calendar className="text-blue-500" />} label="Payback Period" value={`${roi.paybackPeriodYears} yrs`} sub="ROI breakeven" delay={0.15} />
          <MetricCard icon={<IndianRupee className="text-emerald-600" />} label="25-Yr Benefit" value={`₹${(roi.lifetimeBenefit25Y / 100000).toFixed(1)}L`} sub="Lifetime savings" delay={0.2} />
        </section>

        {/* ── 5. Financial Snapshot ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-800">Financial Snapshot</h3>
            <p className="text-sm text-slate-500 mt-1">Based on <strong>{selectedOpt.label}</strong> · After government subsidies</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Bill comparison */}
            <div className="p-6 md:p-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Monthly Bill Comparison</p>
              <div className="flex items-end gap-6">
                {[
                  { label: 'Before', amount: selectedOpt.currentMonthlyBill, color: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-500' },
                  { label: 'After Solar', amount: selectedOpt.postSolarMonthlyBill, color: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                ].map(item => (
                  <div key={item.label} className="flex-1">
                    <div className={`h-28 ${item.bg} rounded-2xl flex items-end justify-center pb-2 mb-2`}>
                      <div className={`${item.color} rounded-lg w-10 transition-all`}
                        style={{ height: `${Math.max(10, (item.amount / Math.max(selectedOpt.currentMonthlyBill, 1)) * 90)}%` }} />
                    </div>
                    <p className="text-center text-xs font-bold text-slate-500">{item.label}</p>
                    <p className={`text-center text-lg font-black ${item.text}`}>₹{formatNumber(item.amount)}</p>
                  </div>
                ))}
                <div className="text-slate-300 text-2xl pb-12">→</div>
              </div>
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600">Annual Savings</span>
                <span className="text-lg font-black text-emerald-600">₹{formatNumber(roi.annualSavings)}</span>
              </div>
            </div>
            {/* Cost breakdown */}
            <div className="p-6 md:p-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Investment Breakdown</p>
              <div className="space-y-3 text-sm">
                <CostRow label="System Cost" value={`₹${formatNumber(selectedOpt.systemCost)}`} />
                <CostRow label="Central Subsidy (PM Surya Ghar)" value={`– ₹${formatNumber(roi.centralSubsidy)}`} green />
                <CostRow label="TN State Subsidy" value={`– ₹${formatNumber(roi.tnStateSubsidy)}`} green />
                {selectedOpt.type === 'Loan' && selectedOpt.downPayment && (
                  <CostRow label="Down Payment" value={`₹${formatNumber(selectedOpt.downPayment)}`} />
                )}
                <div className="border-t border-slate-100 pt-3">
                  <CostRow label={selectedOpt.type === 'Loan' ? 'Net Loan Amount' : 'Net Cost After Subsidy'} value={`₹${formatNumber(roi.netCostAfterSubsidy)}`} bold />
                </div>
                {selectedOpt.type === 'Loan' && selectedOpt.emi && (
                  <div className="p-3 bg-blue-50 rounded-xl mt-2">
                    <p className="text-xs font-bold text-blue-700">EMI: ₹{formatNumber(selectedOpt.emi)}/month for {selectedOpt.loanTermMonths} months</p>
                    <p className="text-xs text-slate-500 mt-0.5">@ {selectedOpt.interestRate}% per annum</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── 6. Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Monthly Energy Profile" sub="Solar generation vs consumption (kWh)">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roi.generationVsConsumption} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="generation" fill="#10b981" radius={[4, 4, 0, 0]} name="Solar Gen (kWh)" />
                <Bar dataKey="consumption" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Consumption (kWh)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-5 mt-3">
              <Legend color="bg-emerald-500" label="Generation" />
              <Legend color="bg-slate-200" label="Consumption" />
            </div>
          </ChartCard>

          <ChartCard title="25-Year Savings" sub="Cumulative savings with 4.2% annual tariff rise">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={roi.cumulativeSavings}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: 12 }}
                  formatter={(v) => [`₹${((Number(v) || 0) / 100000).toFixed(2)} Lakhs`, 'Cumulative Saved']} />
                <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#sg)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 bg-emerald-50 rounded-xl flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">Total 25-Yr Benefit</span>
              <span className="font-black text-emerald-600 text-sm">₹{(roi.lifetimeBenefit25Y / 100000).toFixed(2)} Lakhs</span>
            </div>
          </ChartCard>
        </div>

        {/* ── 7. Equipment ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-xl"><Cpu size={20} className="text-slate-600" /></div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Equipment Specifications</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tier-1 certified, government-approved components</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            <SpecRow icon={<Sun size={18} className="text-yellow-500" />} title="Solar Panels" brand={proposal.panelBrand}
              specs={[{ l: 'Type', v: 'Mono PERC' }, { l: 'Wattage', v: `${proposal.panelWattage} Wp` }, { l: 'Qty', v: `${proposal.panelCount}` }, { l: 'Capacity', v: `${proposal.systemSizeKw} kWp` }, { l: 'Efficiency', v: '~21.5%' }, { l: 'Warranty', v: '25 yr' }]} />
            <SpecRow icon={<Zap size={18} className="text-blue-500" />} title="Inverter" brand={proposal.inverterModel}
              specs={[{ l: 'Type', v: 'Grid-Tied Hybrid' }, { l: 'Output', v: `${proposal.systemSizeKw} kW` }, { l: 'Waveform', v: 'Pure Sine' }, { l: 'Monitoring', v: 'Wi-Fi App' }, { l: 'Protection', v: 'IP65' }, { l: 'Warranty', v: '5 yr' }]} />
            {proposal.batteryModel && (
              <SpecRow icon={<Battery size={18} className="text-purple-500" />} title="Battery Storage" brand={proposal.batteryModel}
                specs={[{ l: 'Chemistry', v: 'LiFePO4' }, { l: 'Cycles', v: '6000+' }, { l: 'Safety', v: 'BMS Protected' }, { l: 'Warranty', v: '10 yr' }]} />
            )}
          </div>
        </motion.section>

        {/* ── 8. TN Subsidies ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full blur-[120px] opacity-20 -mr-36 -mt-36" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-xl"><Award size={22} className="text-yellow-400" /></div>
              <div>
                <h3 className="text-2xl font-black">Government Schemes & Subsidies</h3>
                <p className="text-blue-200 text-sm">Tamil Nadu Residential Solar Programme</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <SchemeCard title="PM Surya Ghar" sub="Central Govt." value={`₹${formatNumber(roi.centralSubsidy)}`} desc="30% for ≤3kW, 15% for 3–10kW" />
              <SchemeCard title="TN State Benefit" sub="Tamil Nadu Govt." value={`₹${formatNumber(roi.tnStateSubsidy)}`} desc="Additional residential incentive" />
              <SchemeCard title="TANGEDCO Net Metering" sub="Surplus Export" value="₹5–8/kWh" desc="Earn credits from excess solar export" />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {['MNRE Approved', 'TANGEDCO Net Metering Ready', 'BIS Certified Panels', 'TN EREDC Empanelled'].map(b => (
                <span key={b} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs font-bold border border-white/20">
                  <CheckCircle2 size={11} className="text-emerald-400" /> {b}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── 9. Environmental ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-emerald-900 rounded-[2rem] p-8 md:p-14 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-full blur-[120px] opacity-30 -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-white/10 rounded-xl"><Sparkles size={22} className="text-emerald-400" /></div>
              <h3 className="text-2xl font-black">Your Environmental Legacy</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ImpactStat icon={<TreeDeciduous size={36} className="text-emerald-400" />} value={formatNumber(proposal.treesEquivalent)} label="Trees Planted Equivalent" />
              <ImpactStat icon={<Zap size={36} className="text-yellow-400" />} value={formatNumber(proposal.co2SavedKg)} label="kg CO₂ Diverted Annually" />
              <ImpactStat icon={<Car size={36} className="text-blue-400" />} value={`${(proposal.carDistanceAvoidedKm / 1000).toFixed(1)}k`} label="km Car Travel Avoided" />
            </div>
            <p className="mt-8 text-emerald-200/60 text-xs">*India CEA grid emission factor 0.82 kg CO₂/kWh (2023)</p>
          </div>
        </motion.section>

        {/* ── 10. Warranties ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <WarrantyCard icon={<ShieldCheck size={24} className="text-emerald-600" />} title="25-Year Panel Warranty" desc="Performance guaranteed at 80% output after 25 years." />
          <WarrantyCard icon={<Award size={24} className="text-blue-600" />} title="5-Year Inverter Warranty" desc="Full parts and labor on inverter, extendable to 10 years." />
          <WarrantyCard icon={<CheckCircle2 size={24} className="text-purple-600" />} title="1-Year Installation Warranty" desc="Comprehensive workmanship warranty on all civil and electrical work." />
        </div>

        {/* ── 11. Footer / CTA ── */}
        <footer className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <User size={26} />
            </div>
            <div>
              <p className="font-black text-slate-800">{proposal.salespersonName}</p>
              <p className="text-sm text-slate-500">{proposal.salespersonRole}</p>
              <p className="text-xs text-slate-400 mt-0.5">{proposal.companyName}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button onClick={handlePDF} disabled={generatingPDF}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-all">
              {generatingPDF ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
              Download PDF
            </button>
            {!approved ? (
              <button onClick={handleApprove} disabled={approving}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-200 group">
                {approving ? <Loader2 className="animate-spin" size={16} /> : <ThumbsUp size={16} />}
                {approving ? 'Approving…' : 'Approve Proposal'}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm">
                <CheckCircle2 size={16} /> Proposal Approved
              </div>
            )}
          </div>
        </footer>
      </div>

      {/* Sticky PDF button (mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button onClick={handlePDF} disabled={generatingPDF}
          className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center">
          {generatingPDF ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
        </button>
      </div>
    </div>
  )
}

/* ── Thank-you screen ── */
function ApprovedScreen({ proposal }: { proposal: FullProposal }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-3">Proposal Approved!</h1>
        <p className="text-slate-500 mb-2">
          Thank you, <strong>{proposal.clientName}</strong>! You've approved your solar proposal.
        </p>
        <p className="text-slate-400 text-sm mb-8">
          The {proposal.companyName} team will contact you shortly to schedule the installation.
        </p>
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-left space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">What happens next?</p>
          {['Site survey & final technical check', 'TANGEDCO net metering application', 'Panel & inverter delivery', 'Professional installation (1–2 days)', 'Commissioning & handover'].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[11px] font-black shrink-0">{i + 1}</span>
              {step}
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Phone size={14} />{proposal.companyPhone}
          <span className="mx-2">·</span>
          <Mail size={14} />{proposal.companyEmail}
        </div>
      </div>
    </div>
  )
}

/* ── Small helpers ── */
function MetricCard({ icon, label, value, sub, delay, highlight }: { icon: React.ReactNode; label: string; value: string; sub?: string; delay: number; highlight?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay }}
      className={`p-5 rounded-2xl shadow-sm border flex flex-col gap-2 ${highlight ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white border-slate-100'}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${highlight ? 'bg-white/20' : 'bg-slate-50'}`}>{icon}</div>
      <p className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-emerald-100' : 'text-slate-400'}`}>{label}</p>
      <p className={`text-2xl font-black ${highlight ? 'text-white' : 'text-slate-800'}`}>{value}</p>
      {sub && <p className={`text-xs ${highlight ? 'text-emerald-100' : 'text-slate-400'}`}>{sub}</p>}
    </motion.div>
  )
}

function CostRow({ label, value, green, bold }: { label: string; value: string; green?: boolean; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center ${bold ? 'font-black text-slate-800' : 'text-slate-600'}`}>
      <span>{label}</span><span className={green ? 'text-emerald-600 font-bold' : ''}>{value}</span>
    </div>
  )
}

function ChartCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-black text-slate-800 mb-0.5">{title}</h3>
      <p className="text-xs text-slate-400 mb-5">{sub}</p>
      {children}
    </motion.div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    </div>
  )
}

function SpecRow({ icon, title, brand, specs }: { icon: React.ReactNode; title: string; brand: string; specs: { l: string; v: string }[] }) {
  return (
    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-5">
      <div className="flex items-center gap-3 min-w-[180px]">
        <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
        <div><p className="font-black text-slate-800 text-sm">{title}</p><p className="text-xs text-slate-500">{brand}</p></div>
      </div>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
        {specs.map(s => (
          <div key={s.l} className="bg-slate-50 rounded-xl px-3 py-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.l}</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5">{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SchemeCard({ title, sub, value, desc }: { title: string; sub: string; value: string; desc: string }) {
  return (
    <div className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
      <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">{sub}</p>
      <p className="font-black text-white">{title}</p>
      <p className="text-2xl font-black text-yellow-400 mt-2">{value}</p>
      <p className="text-blue-200/80 text-xs mt-2">{desc}</p>
    </div>
  )
}

function ImpactStat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="p-3 bg-white/10 rounded-2xl w-fit">{icon}</div>
      <div><p className="text-4xl font-black">{value}</p><p className="text-emerald-200 text-sm font-medium mt-0.5">{label}</p></div>
    </div>
  )
}

function WarrantyCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
      <div className="p-2 bg-slate-50 rounded-xl w-fit">{icon}</div>
      <p className="font-black text-slate-800">{title}</p>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </motion.div>
  )
}
