import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const proposals = await db.proposal.findMany({
    where: { createdById: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, token: true, status: true,
      clientName: true, clientEmail: true, address: true,
      companyName: true, companyLogo: true,
      systemSizeKw: true, panelCount: true,
      paymentOptions: true,
      createdAt: true, sentAt: true, viewedAt: true, approvedAt: true,
    },
  })

  return NextResponse.json(proposals)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const token = nanoid(12)

  const proposal = await db.proposal.create({
    data: {
      token,
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
      createdById: session.user.id,
    },
  })

  return NextResponse.json(proposal, { status: 201 })
}
