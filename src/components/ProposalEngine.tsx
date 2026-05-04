'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, Cell
} from 'recharts';
import { 
  Sun, Battery, IndianRupee, Zap, Leaf, TreeDeciduous, Car, 
  User, MapPin, Briefcase, Camera, TrendingUp, Calendar, ChevronRight,
  Download, FileText, Loader2
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { ProposalSchema, SolarProposal } from '@/lib/types';
import { calculateSolarROI } from '@/lib/calculations';

const INITIAL_DATA: SolarProposal = {
  clientName: 'Rahul Sharma',
  address: 'HSR Layout, Bangalore, KA',
  salespersonName: 'Anand Kumar',
  salespersonRole: 'Senior Solar Consultant',
  systemSizeKw: 5.4,
  panelCount: 12,
  inverterModel: 'Sungrow 5kW Hybrid',
  annualProductionKwh: 7800,
  currentMonthlyBill: 4500,
  postSolarMonthlyBill: 400,
  systemCost: 350000,
  financeType: 'Cash',
  co2SavedKg: 5200,
  treesEquivalent: 140,
  carDistanceAvoidedKm: 18500,
};

export default function ProposalEngine() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isClientMode, setIsClientMode] = useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);
  
  const { register, watch, formState: { errors }, setValue } = useForm<SolarProposal>({
    resolver: zodResolver(ProposalSchema),
    defaultValues: INITIAL_DATA,
  });

  const formData = watch();
  const roi = useMemo(() => calculateSolarROI(formData), [formData]);

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setIsGeneratingPDF(true);

    try {
      // Small delay to ensure all animations are finished
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const element = previewRef.current;
      
      const dataUrl = await toJpeg(element, {
        quality: 0.95,
        backgroundColor: '#f8fafc',
        width: element.scrollWidth,
        height: element.scrollHeight,
        style: {
          height: 'auto',
          overflow: 'visible',
        }
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [element.scrollWidth, element.scrollHeight],
        hotfixes: ['px_scaling'],
      });

      pdf.addImage(dataUrl, 'JPEG', 0, 0, element.scrollWidth, element.scrollHeight);
      pdf.save(`Solar_Proposal_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {


      console.error('PDF generation failed:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <AnimatePresence>
        {!isClientMode && (
          <motion.aside 
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full lg:w-[400px] bg-white border-r border-slate-200 lg:sticky lg:top-0 h-auto lg:h-screen overflow-y-auto p-6 z-20 shadow-xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                  <Sun size={24} />
                </div>
                <div>
                  <h1 className="font-bold text-xl text-slate-800">Proposal Admin</h1>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Solar Engine v1.0</p>
                </div>
              </div>
            </div>

            <div className="mb-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-sm text-emerald-800 font-medium mb-3">Ready to present?</p>
              <button 
                onClick={() => setIsClientMode(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-100"
              >
                Share to Client <ChevronRight size={16} />
              </button>
            </div>

            <form className="space-y-8">
          {/* Section: Metadata */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
              <User size={14} /> Project Metadata
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Client Name</label>
                <input {...register('clientName')} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Address</label>
                <input {...register('address')} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Salesperson</label>
                  <input {...register('salespersonName')} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <input {...register('salespersonRole')} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Technical */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
              <Battery size={14} /> Technical Specs
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">System Size (kW)</label>
                <input type="number" step="0.1" {...register('systemSizeKw', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Panel Count</label>
                <input type="number" {...register('panelCount', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Inverter Model</label>
              <input {...register('inverterModel')} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Annual Gen (kWh)</label>
              <input type="number" {...register('annualProductionKwh', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
          </div>

          {/* Section: Financial */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
              <IndianRupee size={14} /> Financials
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Current Bill (₹)</label>
                <input type="number" {...register('currentMonthlyBill', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Post-Solar Bill (₹)</label>
                <input type="number" {...register('postSolarMonthlyBill', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Total System Cost (₹)</label>
              <input type="number" {...register('systemCost', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Finance Type</label>
              <select {...register('financeType')} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white">
                <option value="Cash">Cash</option>
                <option value="Loan">Loan</option>
              </select>
            </div>
          </div>

          {/* Section: Environmental */}
          <div className="space-y-4 border-t pt-6 mb-10">
            <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
              <Leaf size={14} /> Eco Impact
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">CO2 Saved (kg)</label>
                <input type="number" {...register('co2SavedKg', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Trees Planted</label>
                <input type="number" {...register('treesEquivalent', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <button 
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Download size={18} />
              )}
              {isGeneratingPDF ? 'Generating...' : 'Download PDF Proposal'}
            </button>
          </div>
        </form>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Floating Control for Client Mode */}
      <AnimatePresence>
        {isClientMode && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-2 bg-slate-900 text-white rounded-full shadow-2xl border border-white/10 backdrop-blur-xl"
          >
            <button 
              onClick={() => setIsClientMode(false)}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold transition-all flex items-center gap-2"
            >
              <Briefcase size={16} /> Edit Proposal
            </button>
            <div className="w-px h-4 bg-white/20"></div>
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-full text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingPDF ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Preview / Client View */}
      <main className="flex-1 h-screen overflow-y-auto scroll-smooth">
        <div 
          ref={previewRef} 
          id="proposal-pdf-content"
          className="max-w-5xl mx-auto p-4 md:p-10 space-y-12 pb-20"
        >

          
          {/* Header Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                Personalized Proposal
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                Your Solar Journey <br /> <span className="text-emerald-600">Starts Here.</span>
              </h2>
            </div>
            <div className="p-6 glass rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Prepared for</p>
                <p className="font-bold text-slate-800">{formData.clientName}</p>
                <p className="text-xs text-slate-400">{formData.address}</p>
              </div>
            </div>
          </motion.section>

          {/* Hero Image & Quick Options Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2 relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl group"
            >
              <img 
                src="/solar_rooftop_hero_1777289045498.png" 
                alt="Solar Rooftop" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-2">Designed Solution</p>
                <h3 className="text-3xl font-black">{formData.systemSizeKw}kW Premium Installation</h3>
              </div>
            </motion.div>

            {/* Right Side Options (Replicating reference image) */}
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Options</p>
                <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between">
                  <span className="font-bold">{formData.panelCount} Panels</span>
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Briefcase size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Options</p>
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-slate-800">{formData.financeType}</span>
                  <IndianRupee size={16} className="text-emerald-600" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Step</p>
                <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                  Review Proposal & Contract
                </button>
              </div>
            </div>
          </div>


          {/* Key Metrics Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              icon={<Zap className="text-yellow-500" />} 
              label="System Size" 
              value={`${formData.systemSizeKw} kW`} 
              delay={0.1} 
            />
            <MetricCard 
              icon={<Calendar className="text-blue-500" />} 
              label="Annual Bill Before" 
              value={`₹${(formData.currentMonthlyBill * 12).toLocaleString()}`} 
              delay={0.2} 
            />
            <MetricCard 
              icon={<TrendingUp className="text-emerald-500" />} 
              label="Annual Bill After" 
              value={`₹${(formData.postSolarMonthlyBill * 12).toLocaleString()}`} 
              delay={0.3} 
            />
            <MetricCard 
              icon={<IndianRupee className="text-emerald-600" />} 
              label="Net System Cost" 
              value={`₹${formData.systemCost.toLocaleString()}`} 
              delay={0.4} 
            />
          </section>


          {/* Your Solution Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Solar Panels</h4>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{formData.panelCount}x High-Efficiency Panels</p>
                  <p className="text-sm text-slate-500">Tier 1 Monocrystalline</p>
                  <p className="text-xs text-slate-400 mt-1">{formData.systemSizeKw} kW Total Capacity</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Inverter</h4>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{formData.inverterModel}</p>
                  <p className="text-sm text-slate-500">Smart Monitoring Enabled</p>
                  <p className="text-xs text-slate-400 mt-1">Grid-Tied Pure Sine Wave</p>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generation vs Consumption */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-6">Energy Profile</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roi.generationVsConsumption}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    />
                    <Bar dataKey="generation" fill="#10b981" radius={[4, 4, 0, 0]} name="Solar Gen" />
                    <Bar dataKey="consumption" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Consumption" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Consumption</span>
                </div>
              </div>
            </motion.div>

            {/* Cumulative Savings */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-6">25-Year Wealth Engine</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={roi.cumulativeSavings}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                      formatter={(value: number) => [`₹${(value / 100000).toFixed(2)} Lakhs`, 'Total Saved']}
                    />
                    <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-6 text-sm text-slate-500 leading-relaxed italic">
                *Adjusted for an average 4.2% annual increase in grid energy costs.
              </p>
            </motion.div>
          </div>

          {/* Environmental Section */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-900 rounded-[2.5rem] p-10 md:p-16 text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-full blur-[120px] opacity-40 -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-10 text-center md:text-left">Your Environmental <span className="text-emerald-400">Legacy</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <ImpactStat 
                  icon={<TreeDeciduous size={40} className="text-emerald-400" />} 
                  value={formData.treesEquivalent} 
                  label="Equivalent Trees Planted" 
                />
                <ImpactStat 
                  icon={<Zap size={40} className="text-yellow-400" />} 
                  value={formData.co2SavedKg} 
                  label="kg of CO2 Diverted" 
                />
                <ImpactStat 
                  icon={<Car size={40} className="text-blue-400" />} 
                  value={`${(formData.carDistanceAvoidedKm / 1000).toFixed(1)}k`} 
                  label="km Car Travel Avoided" 
                />
              </div>
            </div>
          </motion.section>

          {/* Salesperson Footer */}
          <footer className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                <User size={32} className="text-slate-400 translate-y-2" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{formData.salespersonName}</p>
                <p className="text-sm text-slate-500">{formData.salespersonRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="p-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-sm"
                title="Download PDF"
              >
                <FileText size={24} />
              </button>
              <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 group">
                Approve Proposal <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value, delay }: { icon: React.ReactNode, label: string, value: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2"
    >
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </motion.div>
  );
}

function ImpactStat({ icon, value, label }: { icon: React.ReactNode, value: string | number, label: string }) {
  return (
    <div className="flex flex-col items-center md:items-start gap-4">
      <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/5">
        {icon}
      </div>
      <div>
        <p className="text-4xl font-black">{value}</p>
        <p className="text-emerald-200 text-sm font-medium uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}
