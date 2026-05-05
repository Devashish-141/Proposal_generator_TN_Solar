import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = [
  '/login',
  '/api/auth',
  '/api/proposals', // approve route needs to be public
  '/_next',
  '/favicon.ico',
  '/uploads',
  '/solar_rooftop_hero',
]

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  const isPublic =
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/p/') // client shareable proposal view

  if (isPublic) return NextResponse.next()

  // Check session token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
