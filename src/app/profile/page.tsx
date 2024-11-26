// src/app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Story } from '@/lib/types'
import { MapIcon, BookOpenIcon, SettingsIcon } from 'lucide-react'

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<Story[]>([])
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    website: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchUserData()
    fetchUserStories()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return
      }

      setUser(session.user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setProfile({
          username: profile.username || '',
          bio: profile.bio || '',
          website: profile.website || ''
        })
      }
    } catch (error) {
      toast.error('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStories = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setStories(data)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...profile,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Error updating profile')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              />
              <Input
                label="Bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                multiline
              />
              <Input
                label="Website"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              />
              <Button onClick={handleProfileUpdate}>Save Changes</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Username:</strong> {profile.username}</p>
              <p><strong>Bio:</strong> {profile.bio}</p>
              <p><strong>Website:</strong> {profile.website}</p>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapIcon className="w-5 h-5 mr-2" />
              <span>{stories.length} Stories</span>
            </div>
            <div className="flex items-center">
              <BookOpenIcon className="w-5 h-5 mr-2" />
              <span>{stories.reduce((acc, story) => acc + (story.views || 0), 0)} Total Views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}