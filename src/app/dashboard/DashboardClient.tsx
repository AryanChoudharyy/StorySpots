// src/app/dashboard/DashboardClient.tsx

'use client'

import { Session } from '@supabase/supabase-js'
import Map from '@/components/map/Map'
import { useRef, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Story } from '@/lib/types'
import { toast } from 'react-hot-toast'

interface DashboardClientProps {
  session: Session
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const mapPositionRef = useRef<{ center: [number, number]; zoom: number }>({
    center: [-74.5, 40],
    zoom: 3
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStories(data || [])
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStoryCreate = (newStory: Story) => {
    setStories(prev => [newStory, ...prev])
  }

  const handleStoryDelete = (id: string) => {
    setStories(prev => prev.filter(story => story.id !== id))
  }

  const handleMapMove = (center: [number, number], zoom: number) => {
    mapPositionRef.current = { center, zoom }
  }

  if (isLoading) {
    return <div className="h-full w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <Map 
        editable 
        fullscreen 
        stories={stories}
        onStoryCreate={handleStoryCreate}
        onStoryDelete={handleStoryDelete}
        onMapMove={handleMapMove}
        initialPosition={mapPositionRef.current}
      />
    </div>
  )
}