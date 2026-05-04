'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import {
  Sun, Battery, IndianRupee, Zap, Leaf, TreeDeciduous, Car,
  User, MapPin, Briefcase, TrendingUp, Calendar, ChevronRight,
  Download, FileText, Loader2, Building2, Phone, Mail, Cpu,
  ShieldCheck, Award, Sparkles, CheckCircle2,
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { ProposalSchema, SolarProposal } from '@/lib/types';
import { calculateSolarROI, autoCalculateEcoMetrics } from '@/lib/calculations';

const INITIAL_DATA: SolarProposal = {
  companyName: 'TN Solar Solutions',
  companyPhone: '+91 98400 00000',
  companyEmail: 'info@tnsolarsolutions.in',
  clientName: 'Rahul Sharma',
  address: 'T. Nagar, Chennai, Tamil Nadu - 600 017',
  salespersonName: 'Anand Kumar',
  salespersonRole: 'Senior Solar Consultant',
  systemSizeKw: 5.4,
  panelCount: 12,
  panelBrand: 'Waaree',
  panelWattage: 450,
  inverterModel: 'Sungrow 5kW Hybrid',
  batteryModel: '',
  annualProductionKwh: 7800,
  currentMonthlyBill: 4500,
  postSolarMonthlyBill: 400,
  systemCost: 350000,
  financeType: 'Cash',
  co2SavedKg: 6396,
  treesEquivalent: 291,
  carDistanceAvoidedKm: 30457,
};

const PANEL_BRANDS = ['Waaree', 'Adani Solar', 'Tata Power Solar', 'Vikram Solar', 'Luminous', 'REC Group', 'LONGi Solar'];

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm bg-white';
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1';

export default function ProposalEngine() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isClientMode, setIsClientMode] = useState(false);
  const [autoEco, setAutoEco] = useState(true);
  const previewRef = React.useRef<HTMLDivElement>(null);

  const { register, watch, setValue } = useForm<SolarProposal>({
    resolver: zodResolver(ProposalSchema),
    defaultValues: INITIAL_DATA,
  });

  const formData = watch();
  const roi = useMemo(() => calculateSolarROI(formData), [formData]);

  // Auto-calculate eco metrics when production changes
  const annualProduction = watch('annualProductionKwh');
  useEffect(() => {
    if (!autoEco) return;
    const metrics = autoCalculateEcoMetrics(annualProduction || 0);
    setValue('co2SavedKg', metrics.co2SavedKg);
    setValue('treesEquivalent', metrics.treesEquivalent);
    setValue('carDistanceAvoidedKm', metrics.carDistanceAvoidedKm);
  }, [annualProduction, autoEco, setValue]);

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setIsGeneratingPDF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const element = previewRef.current;
      const dataUrl = await toJpeg(element, {
        quality: 0.95,
        backgroundColor: '#f8fafc',
        width: element.scrollWidth,
        height: element.scrollHeight,
        style: { height: 'auto', overflow: 'visible' },
      });
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [element.scrollWidth, element.scrollHeight],
        hotfixes: ['px_scaling'],
      });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, element.scrollWidth, element.scrollHeight);
      pdf.save(`Solar_Proposal_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {/* ── Admin Sidebar ── */}
      <AnimatePresence>
        {!isClientMode && (
          <motion.aside
            initial={{ x: -420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -420, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full lg:w-[420px] bg-white border-r border-slate-200 lg:sticky lg:top-0 h-auto lg:h-screen overflow-y-auto p-6 z-20 shadow-xl shrink-0"
          >
            {/* Sidebar header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-200">
                <Sun size={22} />
              </div>
              <div>
                <h1 className="font-black text-lg text-slate-800 leading-tight">Proposal Admin</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">TN Solar Engine v2.0</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-700 mb-3">Ready to present to client?</p>
              <button
                onClick={() => setIsClientMode(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
              >
                Client View <ChevronRight size={15} />
              </button>
            </div>

            <form className="space-y-7">
              {/* Company */}
              <SidebarSection icon={<Building2 size={13} />} title="Company Details">
                <div>
                  <label className={labelCls}>Company Name</label>
                  <input {...register('companyName')} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input {...register('companyPhone')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input {...register('companyEmail')} className={inputCls} />
                  </div>
                </div>
              </SidebarSection>

              {/* Client */}
              <SidebarSection icon={<User size={13} />} title="Client Details">
                <div>
                  <label className={labelCls}>Client Name</label>
                  <input {...register('clientName')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Installation Address</label>
                  <input {...register('address')} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Salesperson</label>
                    <input {...register('salespersonName')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Role</label>
                    <input {...register('salespersonRole')} className={inputCls} />
                  </div>
                </div>
              </SidebarSection>

              {/* Technical */}
              <SidebarSection icon={<Battery size={13} />} title="System Specs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>System Size (kW)</label>
                    <input type="number" step="0.1" {...register('systemSizeKw', { valueAsNumber: true })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Panel Count</label>
                    <input type="number" {...register('panelCount', { valueAsNumber: true })} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Panel Brand</label>
                    <select {...register('panelBrand')} className={inputCls}>
                      {PANEL_BRANDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Panel Wattage (W)</label>
                    <input type="number" {...register('panelWattage', { valueAsNumber: true })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Inverter Model</label>
                  <input {...register('inverterModel')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Battery Model (optional)</label>
                  <input {...register('batteryModel')} placeholder="e.g. Luminous 10kWh Li" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Annual Generation (kWh)</label>
                  <input type="number" {...register('annualProductionKwh', { valueAsNumber: true })} className={inputCls} />
                </div>
              </SidebarSection>

              {/* Financial */}
              <SidebarSection icon={<IndianRupee size={13} />} title="Financials">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Current Monthly Bill (₹)</label>
                    <input type="number" {...register('currentMonthlyBill', { valueAsNumber: true })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Post-Solar Bill (₹)</label>
                    <input type="number" {...register('postSolarMonthlyBill', { valueAsNumber: true })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Total System Cost (₹)</label>
                  <input type="number" {...register('systemCost', { valueAsNumber: true })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Finance Type</label>
                  <select {...register('financeType')} className={inputCls}>
                    <option value="Cash">Cash Purchase</option>
                    <option value="Loan">Solar Loan / EMI</option>
                  </select>
                </div>
                {/* Subsidy preview */}
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 space-y-1.5 text-xs">
                  <p className="font-bold text-emerald-700 text-[11px] uppercase tracking-wider">Calculated Subsidies</p>
                  <div className="flex justify-between text-slate-600">
                    <span>Central (PM Surya Ghar)</span>
                    <span className="font-bold text-emerald-700">₹{roi.centralSubsidy.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>TN State Subsidy</span>
                    <span className="font-bold text-emerald-700">₹{roi.tnStateSubsidy.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-emerald-200 pt-1.5 font-bold text-slate-700">
                    <span>Net Cost After Subsidy</span>
                    <span className="text-emerald-700">₹{roi.netCostAfterSubsidy.toLocaleString()}</span>
                  </div>
                </div>
              </SidebarSection>

              {/* Eco */}
              <SidebarSection icon={<Leaf size={13} />} title="Eco Impact">
                <label className="flex items-center gap-2 cursor-pointer select-none mb-2">
                  <div
                    onClick={() => setAutoEco(v => !v)}
                    className={`w-9 h-5 rounded-full transition-all ${autoEco ? 'bg-emerald-500' : 'bg-slate-300'} relative`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${autoEco ? 'left-[18px]' : 'left-0.5'}`} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Auto-calculate from production</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>CO₂ Saved (kg/yr)</label>
                    <input type="number" {...register('co2SavedKg', { valueAsNumber: true })} disabled={autoEco} className={`${inputCls} ${autoEco ? 'bg-slate-50 text-slate-400' : ''}`} />
                  </div>
                  <div>
                    <label className={labelCls}>Trees Equivalent</label>
                    <input type="number" {...register('treesEquivalent', { valueAsNumber: true })} disabled={autoEco} className={`${inputCls} ${autoEco ? 'bg-slate-50 text-slate-400' : ''}`} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Car km Avoided</label>
                  <input type="number" {...register('carDistanceAvoidedKm', { valueAsNumber: true })} disabled={autoEco} className={`${inputCls} ${autoEco ? 'bg-slate-50 text-slate-400' : ''}`} />
                </div>
              </SidebarSection>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-200"
                >
                  {isGeneratingPDF ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                  {isGeneratingPDF ? 'Generating PDF…' : 'Download PDF Proposal'}
                </button>
              </div>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Floating client-mode bar ── */}
      <AnimatePresence>
        {isClientMode && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-full shadow-2xl border border-white/10"
          >
            <button
              onClick={() => setIsClientMode(false)}
              className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold transition-all flex items-center gap-2"
            >
              <Briefcase size={14} /> Edit Proposal
            </button>
            <div className="w-px h-4 bg-white/20" />
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-full text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingPDF ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
              {isGeneratingPDF ? 'Generating…' : 'Download PDF'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ PROPOSAL PREVIEW ══ */}
      <main className="flex-1 h-screen overflow-y-auto scroll-smooth">
        <div
          ref={previewRef}
          id="proposal-pdf-content"
          className="max-w-5xl mx-auto px-4 md:px-10 py-8 space-y-12 pb-24"
        >
          {/* ── 1. Company + Client Header ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Sun size={30} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800">{formData.companyName}</h1>
                <div className="flex flex-col sm:flex-row gap-x-4 mt-0.5 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Phone size={11} />{formData.companyPhone}</span>
                  <span className="flex items-center gap-1"><Mail size={11} />{formData.companyEmail}</span>
                </div>
              </div>
            </div>
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 min-w-[200px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prepared for</p>
              <p className="font-black text-slate-800 text-lg">{formData.clientName}</p>
              <p className="text-xs text-slate-500 flex items-start gap-1 mt-1">
                <MapPin size={12} className="shrink-0 mt-0.5" />
                {formData.address}
              </p>
              <p className="text-[10px] text-slate-400 mt-2">Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </motion.section>

          {/* ── 2. Hero Banner ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <img
              src="/solar_rooftop_hero_1777289045498.png"
              alt="Solar Rooftop"
              className="w-full aspect-[21/9] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-16">
              <span className="inline-block px-3 py-1 bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/40 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-widest mb-4 w-fit">
                Personalized Solar Proposal
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
                Your Solar Journey <br />
                <span className="text-emerald-400">Starts Here.</span>
              </h2>
              <p className="mt-3 text-white/80 text-sm md:text-base max-w-md">
                A {formData.systemSizeKw} kW premium system designed specifically for {formData.clientName.split(' ')[0]}'s home.
              </p>
            </div>
          </motion.div>

          {/* ── 3. Executive Metrics ── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={<Zap className="text-yellow-500" />} label="System Size" value={`${formData.systemSizeKw} kW`} sub={`${formData.panelCount} Panels`} delay={0.05} />
            <MetricCard icon={<TrendingUp className="text-emerald-500" />} label="Monthly Savings" value={`₹${roi.monthlySavings.toLocaleString()}`} sub="Estimated avg." delay={0.1} highlight />
            <MetricCard icon={<Calendar className="text-blue-500" />} label="Payback Period" value={`${roi.paybackPeriodYears} yrs`} sub="ROI breakeven" delay={0.15} />
            <MetricCard icon={<IndianRupee className="text-emerald-600" />} label="25-Yr Benefit" value={`₹${(roi.lifetimeBenefit25Y / 100000).toFixed(1)}L`} sub="Lifetime savings" delay={0.2} />
          </section>

          {/* ── 4. Financial Breakdown ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 md:p-8 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800">Financial Snapshot</h3>
              <p className="text-sm text-slate-500 mt-1">After government subsidies & solar savings</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Bill comparison */}
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Monthly Bill Comparison</p>
                <div className="flex items-end gap-6">
                  <div className="flex-1">
                    <div className="h-32 bg-red-100 rounded-xl flex items-end justify-center pb-3 mb-2">
                      <div
                        className="bg-red-400 rounded-lg w-12 transition-all"
                        style={{ height: `${Math.min(100, (formData.currentMonthlyBill / Math.max(formData.currentMonthlyBill, 1)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-center text-xs font-bold text-slate-500">Before</p>
                    <p className="text-center text-xl font-black text-red-500">₹{formData.currentMonthlyBill.toLocaleString()}</p>
                  </div>
                  <div className="text-slate-300 text-3xl font-light mb-10">→</div>
                  <div className="flex-1">
                    <div className="h-32 bg-emerald-50 rounded-xl flex items-end justify-center pb-3 mb-2">
                      <div
                        className="bg-emerald-400 rounded-lg w-12 transition-all"
                        style={{ height: `${Math.min(100, (formData.postSolarMonthlyBill / Math.max(formData.currentMonthlyBill, 1)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-center text-xs font-bold text-slate-500">After Solar</p>
                    <p className="text-center text-xl font-black text-emerald-600">₹{formData.postSolarMonthlyBill.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">Annual Savings</span>
                  <span className="text-lg font-black text-emerald-600">₹{roi.annualSavings.toLocaleString()}</span>
                </div>
              </div>
              {/* Cost & subsidy */}
              <div className="p-6 md:p-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Investment & Subsidy</p>
                <div className="space-y-3">
                  <CostRow label="System Cost" amount={`₹${formData.systemCost.toLocaleString()}`} />
                  <CostRow label="Central Subsidy (PM Surya Ghar)" amount={`– ₹${roi.centralSubsidy.toLocaleString()}`} green />
                  <CostRow label="TN State Subsidy" amount={`– ₹${roi.tnStateSubsidy.toLocaleString()}`} green />
                  <div className="border-t border-slate-100 pt-3">
                    <CostRow label="Net Cost After Subsidy" amount={`₹${roi.netCostAfterSubsidy.toLocaleString()}`} bold />
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs font-bold text-blue-700">Finance: {formData.financeType === 'Loan' ? 'Solar Loan / EMI' : 'Cash Purchase'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Payback in <strong>{roi.paybackPeriodYears} years</strong> — then pure savings</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── 5. Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Energy Profile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100"
            >
              <h3 className="text-lg font-black text-slate-800 mb-1">Monthly Energy Profile</h3>
              <p className="text-xs text-slate-400 mb-6">Solar generation vs consumption (kWh)</p>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roi.generationVsConsumption} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: 12 }}
                    />
                    <Bar dataKey="generation" fill="#10b981" radius={[4, 4, 0, 0]} name="Solar Generation (kWh)" />
                    <Bar dataKey="consumption" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Consumption (kWh)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex gap-6">
                <Legend color="bg-emerald-500" label="Generation" />
                <Legend color="bg-slate-200" label="Consumption" />
              </div>
            </motion.div>

            {/* 25-Year Savings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100"
            >
              <h3 className="text-lg font-black text-slate-800 mb-1">25-Year Savings Engine</h3>
              <p className="text-xs text-slate-400 mb-6">Cumulative savings with 4.2% annual tariff increase</p>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={roi.cumulativeSavings}>
                    <defs>
                      <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: 12 }}
                      formatter={(value) => [`₹${((Number(value) || 0) / 100000).toFixed(2)} Lakhs`, 'Cumulative Saved']}
                    />
                    <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#savingsGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Total Lifetime Benefit</span>
                <span className="font-black text-emerald-600 text-base">₹{(roi.lifetimeBenefit25Y / 100000).toFixed(2)} Lakhs</span>
              </div>
            </motion.div>
          </div>

          {/* ── 6. Equipment Specs ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-xl text-slate-600">
                <Cpu size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Equipment Specifications</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tier-1 certified, government-approved components</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              <SpecRow
                icon={<Sun size={18} className="text-yellow-500" />}
                title="Solar Panels"
                brand={formData.panelBrand}
                specs={[
                  { label: 'Module Type', value: 'Monocrystalline PERC' },
                  { label: 'Wattage', value: `${formData.panelWattage} Wp` },
                  { label: 'Quantity', value: `${formData.panelCount} panels` },
                  { label: 'Total Capacity', value: `${formData.systemSizeKw} kWp` },
                  { label: 'Efficiency', value: '~21.5%' },
                  { label: 'Warranty', value: '25 yr performance' },
                ]}
              />
              <SpecRow
                icon={<Zap size={18} className="text-blue-500" />}
                title="Inverter"
                brand={formData.inverterModel}
                specs={[
                  { label: 'Type', value: 'Grid-Tied Hybrid' },
                  { label: 'Output', value: `${formData.systemSizeKw} kW` },
                  { label: 'Waveform', value: 'Pure Sine Wave' },
                  { label: 'Monitoring', value: 'Smart Wi-Fi App' },
                  { label: 'Protection', value: 'IP65 rated' },
                  { label: 'Warranty', value: '5 yr manufacturer' },
                ]}
              />
              {formData.batteryModel && (
                <SpecRow
                  icon={<Battery size={18} className="text-purple-500" />}
                  title="Battery Storage"
                  brand={formData.batteryModel}
                  specs={[
                    { label: 'Chemistry', value: 'LiFePO4 Lithium' },
                    { label: 'Cycles', value: '6000+ cycles' },
                    { label: 'Safety', value: 'BMS Protected' },
                    { label: 'Warranty', value: '10 yr' },
                  ]}
                />
              )}
            </div>
          </motion.section>

          {/* ── 7. TN Subsidy & Scheme Info ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full blur-[120px] opacity-20 -mr-36 -mt-36" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Award size={22} className="text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Government Schemes & Subsidies</h3>
                  <p className="text-blue-200 text-sm">Tamil Nadu Residential Solar Programme</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SchemeCard
                  title="PM Surya Ghar"
                  subtitle="Central Govt. Subsidy"
                  value={`₹${roi.centralSubsidy.toLocaleString()}`}
                  desc="30% for ≤3kW, 15% for 3–10kW on benchmark cost"
                />
                <SchemeCard
                  title="TN State Benefit"
                  subtitle="Tamil Nadu Govt."
                  value={`₹${roi.tnStateSubsidy.toLocaleString()}`}
                  desc="Additional residential rooftop solar incentive"
                />
                <SchemeCard
                  title="TANGEDCO Net Metering"
                  subtitle="Surplus Export Benefit"
                  value="₹5–8/kWh"
                  desc="Earn credits by exporting excess power to grid"
                />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  'MNRE Approved System',
                  'TANGEDCO Net Metering Ready',
                  'BIS Certified Panels',
                  'TN EREDC Empanelled',
                ].map(badge => (
                  <span key={badge} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs font-bold border border-white/20">
                    <CheckCircle2 size={12} className="text-emerald-400" /> {badge}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── 8. Environmental Legacy ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-900 rounded-[2rem] p-8 md:p-14 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-full blur-[120px] opacity-30 -mr-32 -mt-32" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Sparkles size={22} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black">Your Environmental Legacy</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ImpactStat icon={<TreeDeciduous size={36} className="text-emerald-400" />} value={formData.treesEquivalent.toLocaleString()} label="Trees Planted Equivalent" />
                <ImpactStat icon={<Zap size={36} className="text-yellow-400" />} value={formData.co2SavedKg.toLocaleString()} label="kg CO₂ Diverted Annually" />
                <ImpactStat icon={<Car size={36} className="text-blue-400" />} value={`${(formData.carDistanceAvoidedKm / 1000).toFixed(1)}k`} label="km Car Travel Avoided" />
              </div>
              <p className="mt-8 text-emerald-200/70 text-xs">*Calculated using India CEA grid emission factor of 0.82 kg CO₂/kWh (2023 data)</p>
            </div>
          </motion.section>

          {/* ── 9. Warranties & Guarantee ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            <WarrantyCard icon={<ShieldCheck size={24} className="text-emerald-600" />} title="25-Year Panel Warranty" desc="Performance guaranteed at 80% output after 25 years by manufacturer." />
            <WarrantyCard icon={<Award size={24} className="text-blue-600" />} title="5-Year Inverter Warranty" desc="Full parts and labor coverage on inverter, extendable to 10 years." />
            <WarrantyCard icon={<CheckCircle2 size={24} className="text-purple-600" />} title="1-Year Installation Warranty" desc="Comprehensive workmanship warranty on all civil and electrical work." />
          </motion.section>

          {/* ── 10. Footer / Salesperson ── */}
          <footer className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 overflow-hidden">
                <User size={28} />
              </div>
              <div>
                <p className="font-black text-slate-800">{formData.salespersonName}</p>
                <p className="text-sm text-slate-500">{formData.salespersonRole}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formData.companyName}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-sm font-bold text-sm"
              >
                <FileText size={18} />
                Download PDF
              </button>
              <button className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 text-sm group">
                Approve Proposal <ChevronRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

/* ──────────── Helper Components ──────────── */

function SidebarSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-t border-slate-100 pt-6">
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function MetricCard({ icon, label, value, sub, delay, highlight }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; delay: number; highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`p-5 rounded-2xl shadow-sm border flex flex-col gap-2 ${highlight ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white border-slate-100'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${highlight ? 'bg-white/20' : 'bg-slate-50'}`}>
        {icon}
      </div>
      <p className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-emerald-100' : 'text-slate-400'}`}>{label}</p>
      <p className={`text-2xl font-black ${highlight ? 'text-white' : 'text-slate-800'}`}>{value}</p>
      {sub && <p className={`text-xs ${highlight ? 'text-emerald-100' : 'text-slate-400'}`}>{sub}</p>}
    </motion.div>
  );
}

function CostRow({ label, amount, green, bold }: { label: string; amount: string; green?: boolean; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center ${bold ? 'font-black text-slate-800' : 'text-sm text-slate-600'}`}>
      <span>{label}</span>
      <span className={green ? 'text-emerald-600 font-bold' : ''}>{amount}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    </div>
  );
}

function SpecRow({ icon, title, brand, specs }: {
  icon: React.ReactNode; title: string; brand: string;
  specs: { label: string; value: string }[];
}) {
  return (
    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
      <div className="flex items-center gap-3 min-w-[180px]">
        <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
        <div>
          <p className="font-black text-slate-800 text-sm">{title}</p>
          <p className="text-xs text-slate-500">{brand}</p>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
        {specs.map(s => (
          <div key={s.label} className="bg-slate-50 rounded-xl px-3 py-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchemeCard({ title, subtitle, value, desc }: { title: string; subtitle: string; value: string; desc: string }) {
  return (
    <div className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
      <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">{subtitle}</p>
      <p className="font-black text-white text-lg">{title}</p>
      <p className="text-2xl font-black text-yellow-400 mt-2">{value}</p>
      <p className="text-blue-200/80 text-xs mt-2">{desc}</p>
    </div>
  );
}

function ImpactStat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="p-3 bg-white/10 rounded-2xl w-fit">{icon}</div>
      <div>
        <p className="text-4xl font-black">{value}</p>
        <p className="text-emerald-200 text-sm font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function WarrantyCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3"
    >
      <div className="p-2 bg-slate-50 rounded-xl w-fit">{icon}</div>
      <p className="font-black text-slate-800">{title}</p>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
