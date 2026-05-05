'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, User, Battery, IndianRupee, Leaf,
  ChevronRight, ChevronLeft, Check, Loader2, Plus, Trash2,
  Upload, Sun, Zap,
} from 'lucide-react'
import { PaymentOption, ProposalFormData } from '@/lib/types'
import { autoCalculateEcoMetrics, calculateSubsidy } from '@/lib/calculations'
import { calculateEMI, formatNumber } from '@/lib/utils'

const PANEL_BRANDS = ['Waaree', 'Adani Solar', 'Tata Power Solar', 'Vikram Solar', 'Luminous', 'REC Group', 'LONGi Solar', 'Other']

const EMPTY_FORM: ProposalFormData = {
  companyName: '', companyPhone: '', companyEmail: '', companyLogo: '',
  clientName: '', clientEmail: '', clientPhone: '', address: '',
  salespersonName: '', salespersonRole: 'Solar Consultant',
  systemSizeKw: 5, panelCount: 12, panelBrand: 'Waaree', panelWattage: 450,
  inverterModel: '', batteryModel: '', annualProductionKwh: 7000,
  paymentOptions: [],
  co2SavedKg: 0, treesEquivalent: 0, carDistanceAvoidedKm: 0, notes: '',
}

const STEPS = [
  { label: 'Company', icon: Building2 },
  { label: 'Client', icon: User },
  { label: 'System', icon: Battery },
  { label: 'Payments', icon: IndianRupee },
  { label: 'Eco & Save', icon: Leaf },
]

interface Props {
  initial?: Partial<ProposalFormData & { id: string }>
  isEdit?: boolean
}

function inp(extra?: string) {
  return `w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white ${extra ?? ''}`
}
function lbl(text: string) {
  return <label className="block text-xs font-bold text-slate-600 mb-1">{text}</label>
}

export default function MultiStepForm({ initial, isEdit }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [autoEco, setAutoEco] = useState(true)

  const [form, setForm] = useState<ProposalFormData>({
    ...EMPTY_FORM,
    ...(initial ?? {}),
  })

  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>(
    initial?.paymentOptions ?? []
  )

  function update(field: keyof ProposalFormData, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Auto-eco
  useEffect(() => {
    if (!autoEco) return
    const metrics = autoCalculateEcoMetrics(form.annualProductionKwh)
    setForm(prev => ({ ...prev, ...metrics }))
  }, [form.annualProductionKwh, autoEco])

  async function handleLogoUpload(file: File) {
    setLogoUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) update('companyLogo', data.url)
    setLogoUploading(false)
  }

  function addPaymentOption(type: 'Cash' | 'Loan') {
    const id = `opt_${Date.now()}`
    const base: PaymentOption = {
      id, type,
      label: type === 'Cash' ? 'Cash Purchase' : 'Solar Loan',
      systemCost: 350000,
      currentMonthlyBill: 4500,
      postSolarMonthlyBill: 400,
      downPayment: type === 'Loan' ? 50000 : null,
      emi: type === 'Loan' ? calculateEMI(300000, 10.5, 60) : null,
      loanTermMonths: type === 'Loan' ? 60 : null,
      interestRate: type === 'Loan' ? 10.5 : null,
    }
    setPaymentOptions(prev => [...prev, base])
  }

  function updateOption(id: string, field: keyof PaymentOption, value: unknown) {
    setPaymentOptions(prev => prev.map(o => {
      if (o.id !== id) return o
      const updated = { ...o, [field]: value }
      // Recalculate EMI when loan params change
      if (updated.type === 'Loan' && ['systemCost', 'downPayment', 'interestRate', 'loanTermMonths'].includes(field as string)) {
        const principal = (updated.systemCost || 0) - (updated.downPayment || 0)
        updated.emi = calculateEMI(principal, updated.interestRate ?? 10.5, updated.loanTermMonths ?? 60)
      }
      return updated
    }))
  }

  function removeOption(id: string) {
    setPaymentOptions(prev => prev.filter(o => o.id !== id))
  }

  async function handleSave() {
    if (paymentOptions.length === 0) {
      alert('Add at least one payment option before saving.')
      return
    }
    setSaving(true)

    const payload = { ...form, paymentOptions }
    const url = isEdit && initial?.id ? `/api/proposals/${initial.id}` : '/api/proposals'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      alert('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  function canNext(): boolean {
    if (step === 0) return !!(form.companyName && form.companyPhone && form.companyEmail)
    if (step === 1) return !!(form.clientName && form.clientEmail && form.address)
    if (step === 2) return !!(form.systemSizeKw && form.panelCount && form.inverterModel && form.annualProductionKwh)
    if (step === 3) return paymentOptions.length > 0
    return true
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const done = i < step
          const active = i === step
          return (
            <div key={s.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all font-bold text-sm ${done ? 'bg-emerald-600 text-white' : active ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                  {done ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className={`mt-1 text-[11px] font-semibold ${active ? 'text-emerald-600' : done ? 'text-slate-600' : 'text-slate-400'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step panels */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

        {/* Step 0: Company */}
        {step === 0 && (
          <div className="space-y-5">
            <StepHeading icon={<Building2 size={20} className="text-emerald-600" />} title="Company Details" sub="This appears in the proposal header" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                {lbl('Company Name *')}
                <input value={form.companyName} onChange={e => update('companyName', e.target.value)} className={inp()} placeholder="TN Solar Solutions" />
              </div>
              <div>
                {lbl('Phone *')}
                <input value={form.companyPhone} onChange={e => update('companyPhone', e.target.value)} className={inp()} placeholder="+91 98400 00000" />
              </div>
              <div>
                {lbl('Email *')}
                <input type="email" value={form.companyEmail} onChange={e => update('companyEmail', e.target.value)} className={inp()} placeholder="info@company.in" />
              </div>
            </div>

            {/* Logo upload */}
            <div>
              {lbl('Company Logo')}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                {form.companyLogo ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={form.companyLogo} alt="logo" className="h-16 object-contain" />
                    <span className="text-xs text-slate-500">Click to change</span>
                  </div>
                ) : logoUploading ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="animate-spin" size={18} /> Uploading…
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Upload size={24} />
                    <span className="text-sm font-semibold">Click to upload logo</span>
                    <span className="text-xs">PNG, JPG, SVG · Max 2MB</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                {lbl('Salesperson Name *')}
                <input value={form.salespersonName} onChange={e => update('salespersonName', e.target.value)} className={inp()} placeholder="Anand Kumar" />
              </div>
              <div>
                {lbl('Salesperson Role')}
                <input value={form.salespersonRole} onChange={e => update('salespersonRole', e.target.value)} className={inp()} placeholder="Solar Consultant" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Client */}
        {step === 1 && (
          <div className="space-y-5">
            <StepHeading icon={<User size={20} className="text-emerald-600" />} title="Client Details" sub="The proposal will be personalised for this client" />
            <div>
              {lbl('Client Full Name *')}
              <input value={form.clientName} onChange={e => update('clientName', e.target.value)} className={inp()} placeholder="Rahul Sharma" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {lbl('Client Email *')}
                <input type="email" value={form.clientEmail} onChange={e => update('clientEmail', e.target.value)} className={inp()} placeholder="rahul@email.com" />
              </div>
              <div>
                {lbl('Client Phone')}
                <input value={form.clientPhone} onChange={e => update('clientPhone', e.target.value)} className={inp()} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div>
              {lbl('Installation Address *')}
              <textarea rows={3} value={form.address} onChange={e => update('address', e.target.value)} className={inp()} placeholder="12, 3rd Cross, T. Nagar, Chennai, Tamil Nadu - 600 017" />
            </div>
          </div>
        )}

        {/* Step 2: System */}
        {step === 2 && (
          <div className="space-y-5">
            <StepHeading icon={<Battery size={20} className="text-emerald-600" />} title="System Specifications" sub="Technical details of the solar installation" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                {lbl('System Size (kW) *')}
                <input type="number" step="0.1" value={form.systemSizeKw} onChange={e => update('systemSizeKw', parseFloat(e.target.value))} className={inp()} />
              </div>
              <div>
                {lbl('Panel Count *')}
                <input type="number" value={form.panelCount} onChange={e => update('panelCount', parseInt(e.target.value))} className={inp()} />
              </div>
              <div>
                {lbl('Panel Brand *')}
                <select value={form.panelBrand} onChange={e => update('panelBrand', e.target.value)} className={inp()}>
                  {PANEL_BRANDS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                {lbl('Panel Wattage (Wp) *')}
                <input type="number" value={form.panelWattage} onChange={e => update('panelWattage', parseInt(e.target.value))} className={inp()} />
              </div>
            </div>
            <div>
              {lbl('Inverter Model *')}
              <input value={form.inverterModel} onChange={e => update('inverterModel', e.target.value)} className={inp()} placeholder="Sungrow 5kW Hybrid" />
            </div>
            <div>
              {lbl('Battery Model (optional)')}
              <input value={form.batteryModel} onChange={e => update('batteryModel', e.target.value)} className={inp()} placeholder="e.g. Luminous 10kWh Li-Ion" />
            </div>
            <div>
              {lbl('Estimated Annual Generation (kWh) *')}
              <input type="number" value={form.annualProductionKwh} onChange={e => update('annualProductionKwh', parseInt(e.target.value))} className={inp()} />
              <p className="text-xs text-slate-400 mt-1">Rule of thumb: {Math.round(form.systemSizeKw * 1350)} kWh for {form.systemSizeKw} kW in Tamil Nadu</p>
            </div>

            {/* Subsidy preview */}
            {(() => {
              const sub = calculateSubsidy(form.systemSizeKw)
              return (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-3">Auto-Calculated Subsidies</p>
                  <div className="grid grid-cols-3 gap-3">
                    <SubsidyItem label="Central (PM Surya Ghar)" value={`₹${formatNumber(sub.centralSubsidy)}`} />
                    <SubsidyItem label="TN State" value={`₹${formatNumber(sub.tnStateSubsidy)}`} />
                    <SubsidyItem label="Total Subsidy" value={`₹${formatNumber(sub.totalSubsidy)}`} highlight />
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Step 3: Payment Options */}
        {step === 3 && (
          <div className="space-y-5">
            <StepHeading icon={<IndianRupee size={20} className="text-emerald-600" />} title="Payment Options" sub="Add multiple options — clients toggle between them in their proposal" />

            {paymentOptions.length === 0 && (
              <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <IndianRupee size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No options added yet</p>
                <p className="text-xs mt-1">Add at least one option below</p>
              </div>
            )}

            {paymentOptions.map((opt, idx) => (
              <PaymentOptionCard key={opt.id} opt={opt} idx={idx} onChange={updateOption} onRemove={removeOption} />
            ))}

            <div className="flex gap-3">
              <button onClick={() => addPaymentOption('Cash')} className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-emerald-300 text-emerald-700 rounded-2xl text-sm font-bold hover:bg-emerald-50 transition-all">
                <Plus size={16} /> Add Cash Option
              </button>
              <button onClick={() => addPaymentOption('Loan')} className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 text-blue-700 rounded-2xl text-sm font-bold hover:bg-blue-50 transition-all">
                <Plus size={16} /> Add Loan Option
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Eco + Notes */}
        {step === 4 && (
          <div className="space-y-5">
            <StepHeading icon={<Leaf size={20} className="text-emerald-600" />} title="Eco Impact & Final Review" sub="Environmental impact metrics shown in the client proposal" />

            <label className="flex items-center gap-3 cursor-pointer select-none p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div onClick={() => setAutoEco(v => !v)} className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${autoEco ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${autoEco ? 'left-5' : 'left-1'}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Auto-calculate from annual production</p>
                <p className="text-xs text-slate-500">Uses India CEA emission factor (0.82 kg CO₂/kWh)</p>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                {lbl('CO₂ Saved (kg/year)')}
                <input type="number" value={form.co2SavedKg} disabled={autoEco} onChange={e => update('co2SavedKg', parseInt(e.target.value))} className={inp(autoEco ? 'bg-slate-50 text-slate-400' : '')} />
              </div>
              <div>
                {lbl('Trees Equivalent')}
                <input type="number" value={form.treesEquivalent} disabled={autoEco} onChange={e => update('treesEquivalent', parseInt(e.target.value))} className={inp(autoEco ? 'bg-slate-50 text-slate-400' : '')} />
              </div>
              <div>
                {lbl('Car km Avoided')}
                <input type="number" value={form.carDistanceAvoidedKm} disabled={autoEco} onChange={e => update('carDistanceAvoidedKm', parseInt(e.target.value))} className={inp(autoEco ? 'bg-slate-50 text-slate-400' : '')} />
              </div>
            </div>

            <div>
              {lbl('Internal Notes (not shown to client)')}
              <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} className={inp()} placeholder="Any internal notes about this proposal…" />
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 text-sm">
              <p className="font-black text-slate-700">Proposal Summary</p>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <span>Client:</span><span className="font-bold">{form.clientName}</span>
                <span>Company:</span><span className="font-bold">{form.companyName}</span>
                <span>System:</span><span className="font-bold">{form.systemSizeKw} kW · {form.panelCount} panels</span>
                <span>Options:</span><span className="font-bold">{paymentOptions.length} payment option(s)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-2 px-6 py-3 border border-slate-200 bg-white text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 disabled:opacity-40 transition-all"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-all shadow-md shadow-emerald-100"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving || !canNext()}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-all shadow-md shadow-emerald-100"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Sun size={16} />}
            {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Proposal')}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Helpers ── */

function StepHeading({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
      <div className="p-2.5 bg-emerald-50 rounded-xl">{icon}</div>
      <div>
        <h2 className="text-xl font-black text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function SubsidyItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${highlight ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-100'}`}>
      <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${highlight ? 'text-emerald-100' : 'text-slate-400'}`}>{label}</p>
      <p className={`text-sm font-black ${highlight ? 'text-white' : 'text-slate-700'}`}>{value}</p>
    </div>
  )
}

function PaymentOptionCard({ opt, idx, onChange, onRemove }: {
  opt: PaymentOption; idx: number;
  onChange: (id: string, field: keyof PaymentOption, value: unknown) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${opt.type === 'Cash' ? 'border-emerald-200 bg-emerald-50/40' : 'border-blue-200 bg-blue-50/40'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${opt.type === 'Cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
            {opt.type}
          </span>
          <span className="text-sm font-bold text-slate-700">Option {idx + 1}</span>
        </div>
        <button onClick={() => onRemove(opt.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          {lbl('Option Label (shown to client)')}
          <input value={opt.label} onChange={e => onChange(opt.id, 'label', e.target.value)} className={inp()} placeholder="e.g. Cash Purchase" />
        </div>
        <div>
          {lbl('System Cost (₹)')}
          <input type="number" value={opt.systemCost} onChange={e => onChange(opt.id, 'systemCost', parseInt(e.target.value))} className={inp()} />
        </div>
        <div>
          {lbl('Current Monthly Bill (₹)')}
          <input type="number" value={opt.currentMonthlyBill} onChange={e => onChange(opt.id, 'currentMonthlyBill', parseInt(e.target.value))} className={inp()} />
        </div>
        <div>
          {lbl('Post-Solar Monthly Bill (₹)')}
          <input type="number" value={opt.postSolarMonthlyBill} onChange={e => onChange(opt.id, 'postSolarMonthlyBill', parseInt(e.target.value))} className={inp()} />
        </div>

        {opt.type === 'Loan' && (
          <>
            <div>
              {lbl('Down Payment (₹)')}
              <input type="number" value={opt.downPayment ?? 0} onChange={e => onChange(opt.id, 'downPayment', parseInt(e.target.value))} className={inp()} />
            </div>
            <div>
              {lbl('Interest Rate (% per annum)')}
              <input type="number" step="0.1" value={opt.interestRate ?? 10.5} onChange={e => onChange(opt.id, 'interestRate', parseFloat(e.target.value))} className={inp()} />
            </div>
            <div>
              {lbl('Loan Term (months)')}
              <select value={opt.loanTermMonths ?? 60} onChange={e => onChange(opt.id, 'loanTermMonths', parseInt(e.target.value))} className={inp()}>
                {[24, 36, 48, 60, 72, 84, 96, 120].map(m => <option key={m} value={m}>{m} months ({m / 12} yr)</option>)}
              </select>
            </div>
            <div>
              {lbl('Calculated EMI (₹/month)')}
              <input value={opt.emi ?? 0} readOnly className={inp('bg-slate-50 text-slate-500 font-bold cursor-not-allowed')} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
