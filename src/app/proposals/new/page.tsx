import MultiStepForm from '@/components/proposal-form/MultiStepForm'

export default function NewProposalPage() {
  return (
    <div>
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4">
        <h1 className="text-xl font-black text-slate-800">New Proposal</h1>
        <p className="text-sm text-slate-500 mt-0.5">Fill in the details to generate a shareable proposal</p>
      </div>
      <MultiStepForm />
    </div>
  )
}
