import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await req.json()

  const data: Record<string, unknown> = { status }
  if (status === 'SENT') data.sentAt = new Date()

  await db.proposal.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}
