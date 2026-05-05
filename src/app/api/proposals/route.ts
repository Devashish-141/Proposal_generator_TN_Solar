import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

export async function GET() {
  const proposals = await db.proposal.findMany({
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
  const body = await req.json()

  // Get or create a default system user for trial mode
  let user = await db.user.findFirst()
  if (!user) {
    const bcrypt = await import('bcryptjs')
    user = await db.user.create({
      data: {
        name: 'Admin',
        email: 'admin@tnsolarsolutions.in',
        password: await bcrypt.hash('Admin@123', 12),
      },
    })
  }

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
      createdById: user.id,
    },
  })

  return NextResponse.json(proposal, { status: 201 })
}
