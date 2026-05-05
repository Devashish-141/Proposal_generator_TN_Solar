import { NextResponse } from 'next/server'

// Auth disabled for trial — allow all routes
export default function proxy() {
  return NextResponse.next()
}
