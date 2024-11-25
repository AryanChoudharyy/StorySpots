// src/app/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Map from '@/components/map/Map'
import AuthButtonClient from '@/components/auth/AuthButtonClient'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 h-screen">
        <Map className="shadow-2xl" />
      </div>
      
      <div className="w-1/2 flex items-center justify-center bg-white px-8">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to StorySpots
          </h1>
          
          <p className="text-gray-600 text-lg mb-8">
            Share your journey, pin your memories, and explore stories from around the world.
          </p>

          <AuthButtonClient />
        </div>
      </div>
    </div>
  )
}