// src/app/my-stories/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Story } from '@/lib/types'
import { toast } from 'react-hot-toast'
import { MapPin, Trash, Edit } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function MyStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchUserStories()
  }, [])

  const fetchUserStories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStories(data || [])
    } catch (error) {
      console.error('Error fetching stories:', error)
      toast.error('Failed to load stories')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (story: Story) => {
    setEditingStory(story)
    setEditForm({ title: story.title, content: story.content })
  }

  const handleUpdate = async () => {
    try {
      if (!editingStory) return

      const { error } = await supabase
        .from('stories')
        .update({ 
          title: editForm.title, 
          content: editForm.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingStory.id)

      if (error) throw error

      setStories(prev => prev.map(story => 
        story.id === editingStory.id 
          ? { ...story, ...editForm }
          : story
      ))

      setEditingStory(null)
      toast.success('Story updated successfully')
    } catch (error) {
      console.error('Error updating story:', error)
      toast.error('Failed to update story')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id)

      if (error) throw error

      setStories(prev => prev.filter(story => story.id !== id))
      toast.success('Story deleted successfully')
    } catch (error) {
      console.error('Error deleting story:', error)
      toast.error('Failed to delete story')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Stories</h1>
        {stories.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>You haven't created any stories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(story => (
              <div key={story.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  {story.image_url ? (
                    <Image
                      src={story.image_url}
                      alt={story.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{story.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>
                        {story.location.lat.toFixed(2)}, {story.location.lng.toFixed(2)}
                      </span>
                    </div>
                    <time>
                      {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                    </time>
                  </div>
                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      onClick={() => handleEdit(story)}
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="text-red-500 hover:text-red-700 flex items-center"
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!editingStory}
        onClose={() => setEditingStory(null)}
        title="Edit Story"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            required
          />
          <Input
            label="Story"
            value={editForm.content}
            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
            multiline
            rows={4}
            required
          />
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setEditingStory(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}