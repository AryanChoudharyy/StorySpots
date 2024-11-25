export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
  }
  
  export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }
  
  export function validateImage(file: File) {
    const { maxImageSize, allowedImageTypes } = APP_CONFIG
  
    if (!allowedImageTypes.includes(file.type)) {
      throw new Error('Invalid file type')
    }
  
    if (file.size > maxImageSize) {
      throw new Error(`File size must be less than ${formatFileSize(maxImageSize)}`)
    }
  
    return true
  }
  
  export function generateImageUrl(path: string) {
    return `${SUPABASE_CONFIG.storageUrl}/object/public/${SUPABASE_CONFIG.storeBucket}/${path}`
  }
  
  export function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
  
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }