// src/components/auth/AuthButtonClient.tsx
'use client'

import { Button } from '@/components/ui/Button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'  // Add this import

interface AuthButtonClientProps {
  className?: string
}

export default function AuthButtonClient({ className }: AuthButtonClientProps) {
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

  return (
    <Button 
      onClick={handleLogin}
      className={cn("w-full py-3 text-lg", className)}
    >
      Get Started with Google
    </Button>
  )
}