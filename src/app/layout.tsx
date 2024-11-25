// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Toaster } from 'react-hot-toast'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <head>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css' rel='stylesheet' />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar session={session} />
          <main className="flex-grow">
            {children}
          </main>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}