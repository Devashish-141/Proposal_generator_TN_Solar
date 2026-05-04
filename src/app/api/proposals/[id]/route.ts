import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const proposal = await db.proposal.findFirst({
    where: { id, createdById: session.user.id },
  })
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(proposal)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const proposal = await db.proposal.updateMany({
    where: { id, createdById: session.user.id },
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

  return NextResponse.json({ updated: proposal.count })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.proposal.deleteMany({ where: { id, createdById: session.user.id } })

  return NextResponse.json({ deleted: true })
}
