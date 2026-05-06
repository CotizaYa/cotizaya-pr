import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cotización — CotizaYa PR',
  description: 'Cotización profesional de puertas, ventanas y screen en Puerto Rico.',
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}
