// src/components/map/Map.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { v4 as uuidv4 } from 'uuid'
import { Story } from '@/lib/types'
import { StoryForm } from '../stories/StoryForm'
import { Modal } from '../ui/Modal'
import { toast } from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('Mapbox token is required')
}
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

interface MapProps {
  stories?: Story[]
  editable?: boolean
  fullscreen?: boolean
  className?: string
}

export default function Map({ 
  stories = [], 
  editable = false,
  fullscreen = false,
  className = ''
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number} | null>(null)
  const [showStoryForm, setShowStoryForm] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!mapContainer.current) return

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.5, 40],
        zoom: fullscreen ? 3 : 2,
      })

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      if (editable) {
        map.current.on('click', (e) => {
          setSelectedLocation({
            lat: e.lngLat.lat,
            lng: e.lngLat.lng
          })
          setShowStoryForm(true)
        })
      }

      map.current.on('load', () => {
        loadMarkers()
      })

    } catch (error) {
      console.error('Map initialization error:', error)
      toast.error('Failed to load map')
    }

    return () => map.current?.remove()
  }, [])

  const loadMarkers = () => {
    if (!map.current) return

    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    stories.forEach(story => {
      const el = document.createElement('div')
      el.className = 'marker'
      el.innerHTML = `
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
      `

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        maxWidth: '300px'
      }).setHTML(`
        <div class="p-4">
          <h3 class="text-lg font-bold mb-2">${story.title}</h3>
          <p class="text-sm mb-2">${story.content}</p>
          ${story.image_url ? `<img src="${story.image_url}" alt="${story.title}" class="w-full h-32 object-cover rounded-lg"/>` : ''}
          <button 
            onclick="document.dispatchEvent(new CustomEvent('deleteStory', {detail: '${story.id}'}))"
            class="mt-2 text-red-500 text-sm hover:text-red-700"
          >
            Delete Story
          </button>
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([story.location.lng, story.location.lat])
        .setPopup(popup)
        .addTo(map.current!)

      markersRef.current[story.id] = marker
    })
  }

  useEffect(() => {
    loadMarkers()

    const handleDeleteStory = async (event: CustomEvent) => {
      const storyId = event.detail
      try {
        const { error } = await supabase
          .from('stories')
          .delete()
          .eq('id', storyId)

        if (error) throw error

        markersRef.current[storyId]?.remove()
        delete markersRef.current[storyId]
        toast.success('Story deleted successfully')
      } catch (error) {
        console.error('Error deleting story:', error)
        toast.error('Failed to delete story')
      }
    }

    document.addEventListener('deleteStory', handleDeleteStory as EventListener)
    return () => {
      document.removeEventListener('deleteStory', handleDeleteStory as EventListener)
    }
  }, [stories])


const handleStorySubmit = async (storyData: Partial<Story>) => {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('User not authenticated')

    const newStory = {
      title: storyData.title,
      content: storyData.content,
      image_url: storyData.image_url,
      location: selectedLocation,
      user_id: userData.user.id,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('stories')
      .insert(newStory)
      .select('*')
      .single()

    if (error) throw error

    setShowStoryForm(false)
    setSelectedLocation(null)
    toast.success('Story created successfully!')

    // Add the new marker immediately
    if (map.current && data) {
      const el = document.createElement('div')
      el.className = 'marker'
      el.innerHTML = `
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
      `

      const marker = new mapboxgl.Marker(el)
        .setLngLat([data.location.lng, data.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-4">
                <h3 class="text-lg font-bold mb-2">${data.title}</h3>
                <p class="text-sm mb-2">${data.content}</p>
                ${data.image_url ? `<img src="${data.image_url}" alt="${data.title}" class="w-full h-32 object-cover rounded-lg"/>` : ''}
                <button 
                  onclick="document.dispatchEvent(new CustomEvent('deleteStory', {detail: '${data.id}'}))"
                  class="mt-2 text-red-500 text-sm hover:text-red-700"
                >
                  Delete Story
                </button>
              </div>
            `)
        )
        .addTo(map.current)

      markersRef.current[data.id] = marker
    }

  } catch (error: any) {
    console.error('Error creating story:', error)
    toast.error(error.message || 'Failed to create story')
  }
}
  return (
    <div className={`relative ${fullscreen ? 'h-[calc(100vh-64px)] w-full' : 'h-[600px] rounded-lg'} ${className}`}>
      <div ref={mapContainer} className="h-full w-full" />
      
      <Modal
        isOpen={showStoryForm}
        onClose={() => {
          setShowStoryForm(false)
          setSelectedLocation(null)
        }}
        title="Create New Story"
      >
        <StoryForm
          onSubmit={handleStorySubmit}
          onCancel={() => {
            setShowStoryForm(false)
            setSelectedLocation(null)
          }}
        />
      </Modal>
    </div>
  )
}