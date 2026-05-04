import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import MultiStepForm from '@/components/proposal-form/MultiStepForm'
import { PaymentOption } from '@/lib/types'

export default async function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return null

  const proposal = await db.proposal.findFirst({
    where: { id, createdById: session.user.id },
  })
  if (!proposal) notFound()

  return (
    <div>
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4">
        <h1 className="text-xl font-black text-slate-800">Edit Proposal</h1>
        <p className="text-sm text-slate-500 mt-0.5">Editing proposal for {proposal.clientName}</p>
      </div>
      <MultiStepForm
        isEdit
        initial={{
          id: proposal.id,
          companyName: proposal.companyName,
          companyPhone: proposal.companyPhone,
          companyEmail: proposal.companyEmail,
          companyLogo: proposal.companyLogo ?? '',
          clientName: proposal.clientName,
          clientEmail: proposal.clientEmail,
          clientPhone: proposal.clientPhone ?? '',
          address: proposal.address,
          salespersonName: proposal.salespersonName,
          salespersonRole: proposal.salespersonRole,
          systemSizeKw: proposal.systemSizeKw,
          panelCount: proposal.panelCount,
          panelBrand: proposal.panelBrand,
          panelWattage: proposal.panelWattage,
          inverterModel: proposal.inverterModel,
          batteryModel: proposal.batteryModel ?? '',
          annualProductionKwh: proposal.annualProductionKwh,
          paymentOptions: proposal.paymentOptions as unknown as PaymentOption[],
          co2SavedKg: proposal.co2SavedKg,
          treesEquivalent: proposal.treesEquivalent,
          carDistanceAvoidedKm: proposal.carDistanceAvoidedKm,
          notes: proposal.notes ?? '',
        }}
      />
    </div>
  )
}
