import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { FullProposal, PaymentOption } from '@/lib/types'
import ClientProposalView from '@/components/proposal-view/ClientProposalView'

export default async function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const proposal = await db.proposal.findUnique({ where: { token } })
  if (!proposal) notFound()

  // Auto-mark as VIEWED the first time a client opens it
  if (proposal.status === 'SENT') {
    await db.proposal.update({
      where: { id: proposal.id },
      data: { status: 'VIEWED', viewedAt: new Date() },
    })
  }

  const data: FullProposal = {
    id: proposal.id,
    token: proposal.token,
    status: proposal.status as FullProposal['status'],
    companyName: proposal.companyName,
    companyPhone: proposal.companyPhone,
    companyEmail: proposal.companyEmail,
    companyLogo: proposal.companyLogo,
    clientName: proposal.clientName,
    clientEmail: proposal.clientEmail,
    clientPhone: proposal.clientPhone,
    address: proposal.address,
    salespersonName: proposal.salespersonName,
    salespersonRole: proposal.salespersonRole,
    systemSizeKw: proposal.systemSizeKw,
    panelCount: proposal.panelCount,
    panelBrand: proposal.panelBrand,
    panelWattage: proposal.panelWattage,
    inverterModel: proposal.inverterModel,
    batteryModel: proposal.batteryModel,
    annualProductionKwh: proposal.annualProductionKwh,
    paymentOptions: proposal.paymentOptions as unknown as PaymentOption[],
    co2SavedKg: proposal.co2SavedKg,
    treesEquivalent: proposal.treesEquivalent,
    carDistanceAvoidedKm: proposal.carDistanceAvoidedKm,
    notes: proposal.notes,
    createdAt: proposal.createdAt.toISOString(),
    sentAt: proposal.sentAt?.toISOString() ?? null,
    viewedAt: proposal.viewedAt?.toISOString() ?? null,
    approvedAt: proposal.approvedAt?.toISOString() ?? null,
    createdById: proposal.createdById,
  }

  return <ClientProposalView proposal={data} />
}
