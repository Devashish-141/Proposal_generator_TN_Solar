import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendApprovalEmail } from '@/lib/email'

// Public route — no auth required (client-side action)
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const proposal = await db.proposal.findUnique({ where: { id } })
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (proposal.status === 'APPROVED') return NextResponse.json({ already: true })

  await db.proposal.update({
    where: { id },
    data: { status: 'APPROVED', approvedAt: new Date() },
  })

  try {
    await sendApprovalEmail({
      clientName: proposal.clientName,
      clientEmail: proposal.clientEmail,
      systemSizeKw: proposal.systemSizeKw,
      proposalId: proposal.id,
      token: proposal.token,
    })
  } catch {
    // Email failure should not block the approval
    console.error('Approval email failed — check SMTP config')
  }

  return NextResponse.json({ approved: true })
}
