declare global {
  interface FileSystemHandle {
    readonly kind: 'file' | 'directory'
    readonly name: string
    requestPermission(descriptor?: { mode: 'read' | 'readwrite' }): Promise<'granted' | 'denied'>
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    readonly kind: 'directory'
  }

  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite'
    }): Promise<FileSystemDirectoryHandle>
  }
}

export {} 