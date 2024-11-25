import { Story } from '@/lib/types'
import { StoryCard } from './StoryCard'

interface StoryListProps {
  stories: Story[]
  onDelete?: (id: string) => void
  onEdit?: (story: Story) => void
  onSelect?: (story: Story) => void
  editable?: boolean
}

// Change from function to const export
export const StoryList = ({
  stories,
  onDelete,
  onEdit,
  onSelect,
  editable = false
}: StoryListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          onDelete={onDelete}
          onEdit={onEdit}
          onClick={onSelect}
          editable={editable}
        />
      ))}
    </div>
  )
}

// Add default export
export default StoryList;