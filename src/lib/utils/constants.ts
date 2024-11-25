export const MAP_CONFIG = {
    defaultCenter: [-74.5, 40],
    defaultZoom: 2,
    maxZoom: 18,
    minZoom: 1,
  }
  
  export const SUPABASE_CONFIG = {
    storageUrl: process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1',
    storeBucket: 'story-images',
  }
  
  export const APP_CONFIG = {
    name: 'StorySpots',
    description: 'Share your stories and memories from around the world',
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  }