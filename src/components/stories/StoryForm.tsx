// src/components/stories/StoryForm.tsx
'use client'

import { useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Story } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Upload, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Map from '@/components/map/Map'

interface StoryFormProps {
  initialData?: Partial<Story>
  onSubmit: (story: Story) => void
  onCancel: () => void
}

export function StoryForm({ initialData, onSubmit, onCancel }: StoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    location: initialData?.location || null
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()

  const validateImage = (file: File) => {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be less than 5MB')
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, or GIF)')
    }

    return true
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage
      .from('story-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('story-images')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = initialData?.image_url

      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const storyData = {
        ...formData,
        image_url: imageUrl,
        id: initialData?.id || undefined,
        created_at: initialData?.created_at || new Date().toISOString()
      }

      await onSubmit(storyData as Story)
    } catch (error: any) {
      console.error('Form submission error:', error)
      toast.error(error.message || 'Failed to save story')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      validateImage(file)
      setImageFile(file)
    } catch (error: any) {
      toast.error(error.message)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div
          className={`w-full h-32 border-2 border-dashed rounded-lg ${
            imageFile ? 'border-blue-500' : 'border-gray-300'
          } flex flex-col items-center justify-center cursor-pointer transition-colors duration-200`}
          onClick={() => fileInputRef.current?.click()}
        >
          {imageFile ? (
            <div className="relative w-full h-full p-2">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="w-full h-full object-contain rounded"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setImageFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload an image</p>
              <p className="text-xs text-gray-400 mt-1">Maximum size: 5MB</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="bg-gray-900 text-white placeholder-gray-400"
        />

        <Input
          label="Story"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          multiline
          rows={4}
          required
          className="bg-gray-900 text-white placeholder-gray-400"
        />

        <div className="h-[300px] rounded-lg overflow-hidden">
          <Map
            editable
            onLocationSelect={(location) => 
              setFormData({ ...formData, location })
            }
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'} Story
        </Button>
      </div>
    </form>
  )
}