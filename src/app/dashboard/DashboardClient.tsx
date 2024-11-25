'use client'

import { Session } from '@supabase/supabase-js'
import Map from '@/components/map/Map'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Story } from '@/lib/types'
import { toast } from 'react-hot-toast'

interface DashboardClientProps {
  session: Session
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [stories, setStories] = useState<Story[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchStories()
    
    // Subscribe to new stories
    const channel = supabase
      .channel('stories')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stories' }, 
        () => {
          fetchStories()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to fetch stories')
      return
    }

    setStories(data || [])
  }

  const handleStoryCreate = async (story: Story) => {
    setStories(prevStories => [story, ...prevStories])
    await fetchStories() // Refresh all stories
  }

  const handleStoryDelete = async (id: string) => {
    setStories(stories.filter(story => story.id !== id))
    await fetchStories() // Refresh all stories
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <Map 
        editable 
        fullscreen 
        stories={stories}
        onStoryCreate={handleStoryCreate}
        onStoryDelete={handleStoryDelete}
      />
    </div>
  )
}