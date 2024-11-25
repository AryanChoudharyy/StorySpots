import Image from 'next/image'
import { formatDistance } from 'date-fns'
import { Story } from '@/lib/types'
import { MapPin, Trash, Edit } from 'lucide-react'

interface StoryCardProps {
  story: Story
  onDelete?: (id: string) => void
  onEdit?: (story: Story) => void
  onClick?: (story: Story) => void
  editable?: boolean
}

export function StoryCard({
  story,
  onDelete,
  onEdit,
  onClick,
  editable = false
}: StoryCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      onClick={() => onClick?.(story)}
    >
      <div className="relative h-48">
        {story.image_url ? (
          <Image
            src={story.image_url}
            alt={story.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {story.content}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>
              {story.location.lat.toFixed(2)}, {story.location.lng.toFixed(2)}
            </span>
          </div>
          <time>
            {formatDistance(new Date(story.created_at), new Date(), { 
              addSuffix: true 
            })}
          </time>
        </div>

        {editable && (
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(story)
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(story.id)
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}