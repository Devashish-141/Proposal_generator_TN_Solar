export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/((?!login|p/|api/proposals/.*/approve|api/auth|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
