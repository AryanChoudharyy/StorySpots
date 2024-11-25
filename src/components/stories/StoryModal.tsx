'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Story } from '@/lib/types'
import Image from 'next/image'
import Map from '@/components/map/Map'
import { formatDistanceToNow } from 'date-fns'
import { 
  X, 
  Share2, 
  MapPin, 
  User, 
  Calendar,
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface StoryModalProps {
  story: Story
  isOpen: boolean
  onClose: () => void
}

export function StoryModal({ story, isOpen, onClose }: StoryModalProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const images = story.image_url ? [story.image_url] : []

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: story.title,
          text: story.content,
          url: `${window.location.origin}/story/${story.id}`
        })
      } else {
        await navigator.clipboard.writeText(
          `${window.location.origin}/story/${story.id}`
        )
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      toast.error('Failed to share story')
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-4xl transform rounded-2xl bg-white p-6 shadow-xl transition-all">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {images.length > 0 ? (
                      <div className="relative h-80">
                        <Image
                          src={images[imageIndex]}
                          alt={story.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() => setImageIndex((i) => i - 1)}
                              disabled={imageIndex === 0}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white disabled:opacity-50"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                              onClick={() => setImageIndex((i) => i + 1)}
                              disabled={imageIndex === images.length - 1}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white disabled:opacity-50"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    <div className="mt-6 h-48">
                      <Map
                        stories={[story]}
                        selectedStoryId={story.id}
                      />
                    </div>
                  </div>

                  <div>
                    <Dialog.Title as="h3" className="text-2xl font-bold mb-4">
                      {story.title}
                    </Dialog.Title>

                    <div className="space-y-4 mb-6">
                      <p className="text-gray-600 whitespace-pre-line">
                        {story.content}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <span>{story.author?.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <time>
                            {formatDistanceToNow(new Date(story.created_at), {
                              addSuffix: true
                            })}
                          </time>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleShare}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}