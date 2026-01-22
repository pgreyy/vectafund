import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VectaFund | Track Crypto VC Fundraises with Reputation Scores',
  description: 'Get real-time alerts when top crypto VCs lead investments. Filter by Ethos reputation scores to find the most credible deals.',
  keywords: ['crypto', 'VC', 'venture capital', 'fundraise', 'ethos', 'reputation', 'web3', 'investment'],
  authors: [{ name: 'VectaFund' }],
  openGraph: {
    title: 'VectaFund | Track Crypto VC Fundraises',
    description: 'Real-time crypto fundraise alerts powered by Ethos reputation scores',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VectaFund | Track Crypto VC Fundraises',
    description: 'Real-time crypto fundraise alerts powered by Ethos reputation scores',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  )
}
