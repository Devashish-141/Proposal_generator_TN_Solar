import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const proposal = await db.proposal.findUnique({ where: { id } })
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(proposal)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  await db.proposal.update({
    where: { id },
    data: {
      companyName: body.companyName,
      companyPhone: body.companyPhone,
      companyEmail: body.companyEmail,
      companyLogo: body.companyLogo || null,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone || null,
      address: body.address,
      salespersonName: body.salespersonName,
      salespersonRole: body.salespersonRole,
      systemSizeKw: Number(body.systemSizeKw),
      panelCount: Number(body.panelCount),
      panelBrand: body.panelBrand,
      panelWattage: Number(body.panelWattage),
      inverterModel: body.inverterModel,
      batteryModel: body.batteryModel || null,
      annualProductionKwh: Number(body.annualProductionKwh),
      paymentOptions: body.paymentOptions,
      co2SavedKg: Number(body.co2SavedKg),
      treesEquivalent: Number(body.treesEquivalent),
      carDistanceAvoidedKm: Number(body.carDistanceAvoidedKm),
      notes: body.notes || null,
    },
  })

  return NextResponse.json({ updated: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.proposal.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
