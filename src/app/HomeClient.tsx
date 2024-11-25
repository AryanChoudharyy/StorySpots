'use client'

import Map from '@/components/map/Map'
import { Button } from '@/components/ui/Button'
import { Session } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface HomeClientProps {
  session: Session | null
}

export default function HomeClient({ session }: HomeClientProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`
      }
    })
    if (error) console.error('Auth error:', error)
  }

  if (session) {
    router.push('/dashboard')
    return null
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

          <Button 
            onClick={handleLogin}
            className="w-full py-3 text-lg"
          >
            Get Started with Google
          </Button>
        </div>
      </div>
    </div>
  )
}