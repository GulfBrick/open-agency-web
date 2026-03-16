import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Open Agency — Intelligence at work.',
  description: 'AI-powered teams that manage, grow, and optimise businesses end-to-end.',
  openGraph: {
    title: 'Open Agency',
    description: 'Intelligence at work.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="top-gradient-bar" />
        <div className="scanline-overlay" />
        <div className="bg-grid" />
        {children}
      </body>
    </html>
  )
}
