// src/components/map/Map.tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { Story } from '@/lib/types'
import { StoryForm } from '../stories/StoryForm'
import { Modal } from '../ui/Modal'
import { toast } from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { formatDistanceToNow } from 'date-fns'

if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  throw new Error('Mapbox token is required')
}
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

interface MapProps {
  stories?: Story[]
  editable?: boolean
  fullscreen?: boolean
  className?: string
  onStoryCreate?: (story: Story) => void
  onStoryDelete?: (id: string) => void
  onMapMove?: (center: [number, number], zoom: number) => void
  initialPosition?: { center: [number, number]; zoom: number }
}

export default function Map({ 
  stories = [], 
  editable = false,
  fullscreen = false,
  className = '',
  onStoryCreate,
  onStoryDelete,
  onMapMove,
  initialPosition
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number} | null>(null)
  const [showStoryForm, setShowStoryForm] = useState(false)
  const supabase = createClientComponentClient()

  const createStoryPopup = (story: Story) => {
    return `
      <div class="p-5 bg-gray-900 rounded-lg shadow-lg min-w-[300px]">
        <div class="mb-4 h-48 w-full overflow-hidden rounded-lg">
          ${story.image_url ? `
            <img 
              src="${story.image_url}" 
              alt="${story.title}"
              class="w-full h-full object-cover"
              onerror="this.parentElement.innerHTML='<div class=\'w-full h-full bg-gray-800 flex items-center justify-center\'><svg class=\'w-8 h-8 text-gray-500\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\'/></svg></div>'"
            />
          ` : `
            <div class="w-full h-full bg-gray-800 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          `}
        </div>
        <h3 class="text-xl font-bold mb-2 text-white">${story.title}</h3>
        <p class="text-gray-300 mb-4">${story.content}</p>
        <div class="flex items-center justify-between border-t border-gray-700 pt-4">
          <span class="text-sm text-gray-400">
            ${formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
          </span>
          ${editable ? `
            <button 
              onclick="document.dispatchEvent(new CustomEvent('deleteStory', {detail: '${story.id}'}))"
              class="text-red-400 hover:text-red-300 text-sm flex items-center"
              data-story-id="${story.id}"
            >
              <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Delete
            </button>
          ` : ''}
        </div>
      </div>
    `
  }

  const addMarkerToMap = (story: Story) => {
    if (!map.current || !story.location) return

    // Remove existing marker if it exists
    if (markersRef.current[story.id]) {
      markersRef.current[story.id].remove()
    }

    const el = document.createElement('div')
    el.className = `marker-${story.id}` // Unique class for each marker
    el.innerHTML = `
      <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
      </div>
    `

    const marker = new mapboxgl.Marker(el)
      .setLngLat([story.location.lng, story.location.lat])
      .setPopup(
        new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          maxWidth: '400px',
          className: `popup-${story.id}`
        }).setHTML(createStoryPopup(story))
      )
      .addTo(map.current)

    markersRef.current[story.id] = marker
  }

  useEffect(() => {
    if (!mapContainer.current) return

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: initialPosition?.center || [-74.5, 40],
        zoom: initialPosition?.zoom || (fullscreen ? 3 : 2),
      })

      map.current.on('moveend', () => {
        if (map.current) {
          const center = map.current.getCenter()
          const zoom = map.current.getZoom()
          onMapMove?.([center.lng, center.lat], zoom)
        }
      })

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      if (editable) {
        map.current.on('click', (e) => {
          if (!(e.originalEvent.target as Element).closest('.mapboxgl-marker')) {
            setSelectedLocation({
              lat: e.lngLat.lat,
              lng: e.lngLat.lng
            })
            setShowStoryForm(true)
          }
        })
      }

      stories.forEach(story => addMarkerToMap(story))

    } catch (error) {
      console.error('Map initialization error:', error)
      toast.error('Failed to load map')
    }

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove())
      map.current?.remove()
    }
  }, [])

  useEffect(() => {
    stories.forEach(story => {
      if (!markersRef.current[story.id]) {
        addMarkerToMap(story)
      }
    })

    // Remove markers that are no longer in stories
    Object.keys(markersRef.current).forEach(id => {
      if (!stories.find(story => story.id === id)) {
        markersRef.current[id].remove()
        delete markersRef.current[id]
      }
    })
  }, [stories])

  useEffect(() => {
    const handleDeleteStory = async (event: CustomEvent) => {
      const storyId = event.detail
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) throw new Error('Not authenticated')

        const { error } = await supabase
          .from('stories')
          .delete()
          .eq('id', storyId)
          .eq('user_id', userData.user.id)

        if (error) throw error

        // Remove only the specific marker
        const marker = markersRef.current[storyId]
        if (marker) {
          marker.remove()
          delete markersRef.current[storyId]
          onStoryDelete?.(storyId)
          toast.success('Story deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting story:', error)
        toast.error('Failed to delete story')
      }
    }

    document.addEventListener('deleteStory', handleDeleteStory as EventListener)
    return () => {
      document.removeEventListener('deleteStory', handleDeleteStory as EventListener)
    }
  }, [])

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
        .select()
        .single()

      if (error) throw error

      setShowStoryForm(false)
      setSelectedLocation(null)

      if (data) {
        addMarkerToMap(data)
        onStoryCreate?.(data)
        toast.success('Story created successfully!')
      }

    } catch (error: any) {
      console.error('Error creating story:', error)
      toast.error('Failed to create story')
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