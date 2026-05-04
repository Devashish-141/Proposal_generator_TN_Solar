import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import SessionWrapper from '@/components/SessionWrapper'
import Navbar from '@/components/Navbar'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TN Solar Engine — Proposal Generator',
  description: 'Generate professional solar proposals for Tamil Nadu clients',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50">
        <SessionWrapper>
          <Navbar />
          <div className="flex-1">{children}</div>
        </SessionWrapper>
      </body>
    </html>
  )
}
