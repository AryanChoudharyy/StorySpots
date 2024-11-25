'use client'

import { useState } from 'react'
import { 
  Navigation, 
  Locate, 
  Layers, 
  Search,
  ZoomIn,
  ZoomOut,
  Compass
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface MapControlsProps {
  onLocateMe: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onStyleChange?: (style: string) => void
  onSearch?: (query: string) => void
}

export function MapControls({
  onLocateMe,
  onZoomIn,
  onZoomOut,
  onStyleChange,
  onSearch
}: MapControlsProps) {
  const [showStyles, setShowStyles] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const mapStyles = [
    { id: 'streets-v11', name: 'Streets' },
    { id: 'satellite-v9', name: 'Satellite' },
    { id: 'light-v10', name: 'Light' },
    { id: 'dark-v10', name: 'Dark' }
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a location to search')
      return
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        onSearch?.(data.features[0].center)
      } else {
        toast.error('Location not found')
      }
    } catch (error) {
      toast.error('Error searching location')
    }
  }

  return (
    <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-lg p-2 mb-2">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Search location"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Map Controls */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-2 space-y-2">
          <button
            onClick={onLocateMe}
            className="w-full p-2 rounded hover:bg-gray-100 flex items-center justify-center"
            title="Find my location"
          >
            <Locate className="h-5 w-5" />
          </button>
          
          <button
            onClick={onZoomIn}
            className="w-full p-2 rounded hover:bg-gray-100 flex items-center justify-center"
            title="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          
          <button
            onClick={onZoomOut}
            className="w-full p-2 rounded hover:bg-gray-100 flex items-center justify-center"
            title="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowStyles(!showStyles)}
              className="w-full p-2 rounded hover:bg-gray-100 flex items-center justify-center"
              title="Change map style"
            >
              <Layers className="h-5 w-5" />
            </button>

            {showStyles && (
              <div className="absolute right-full bottom-0 mb-2 mr-2 bg-white rounded-lg shadow-lg p-2 min-w-[120px]">
                {mapStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      onStyleChange?.(style.id)
                      setShowStyles(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded"
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onStyleChange?.('streets-v11')
              toast.success('Map orientation reset')
            }}
            className="w-full p-2 rounded hover:bg-gray-100 flex items-center justify-center"
            title="Reset orientation"
          >
            <Compass className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}