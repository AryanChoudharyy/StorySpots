'use client'

import { useState, useRef, DragEvent } from 'react'
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
  const [isDragging, setIsDragging] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    location: initialData?.location || null
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
    } else {
      toast.error('Please upload an image file')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = initialData?.image_url

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const filePath = `${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('story-images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('story-images')
          .getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      const storyData = {
        ...formData,
        image_url: imageUrl,
        id: initialData?.id || undefined,
        created_at: initialData?.created_at || new Date().toISOString()
      }

      onSubmit(storyData as Story)
    } catch (error) {
      toast.error('Failed to save story')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div
          className={`w-full h-40 border-2 border-dashed rounded-lg ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } flex flex-col items-center justify-center cursor-pointer transition-colors`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {imageFile ? (
            <div className="relative w-full h-full p-2">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setImageFile(null)
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setImageFile(file)
            }}
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
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'} Story
        </Button>
      </div>
    </form>
  )
}