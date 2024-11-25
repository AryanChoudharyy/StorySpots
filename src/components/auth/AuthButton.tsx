// src/components/auth/AuthButton.tsx
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { LogInIcon, LogOutIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AuthButtonProps {
  session: any
}

export function AuthButton({ session }: AuthButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleAuth = async () => {
    try {
      setLoading(true)
      if (session) {
        await supabase.auth.signOut()
        toast.success('Logged out successfully')
        router.refresh()
      } else {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/api/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          },
        })
        if (error) throw error
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAuth}
      disabled={loading}
      variant={session ? 'outline' : 'default'}
    >
      {session ? (
        <>
          <LogOutIcon className="w-4 h-4 mr-2" />
          Sign Out
        </>
      ) : (
        <>
          <LogInIcon className="w-4 h-4 mr-2" />
          Sign In with Google
        </>
      )}
    </Button>
  )
}