'use client'

import { FolderPlus, Upload } from 'lucide-react'
import { Button } from './ui/button'

interface EmptyStateProps {
  type: 'folders' | 'lectures'
  onAction: () => void
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const config = {
    folders: {
      icon: FolderPlus,
      title: 'No folders yet',
      description: 'Create your first folder to start organizing your lectures.',
      buttonText: 'Create Folder'
    },
    lectures: {
      icon: Upload,
      title: 'No lectures yet',
      description: 'Upload your first lecture to start transcribing and generating notes.',
      buttonText: 'Upload Lecture'
    }
  }

  const { icon: Icon, title, description, buttonText } = config[type]

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        {description}
      </p>
      <Button onClick={onAction}>
        <Icon className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  )
} 