import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()

  const data: Record<string, unknown> = { status }
  if (status === 'SENT') data.sentAt = new Date()

  await db.proposal.updateMany({
    where: { id, createdById: session.user.id },
    data,
  })

  return NextResponse.json({ ok: true })
}
