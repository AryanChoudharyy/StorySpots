export interface Location {
    lat: number
    lng: number
  }
  
  export interface User {
    id: string
    email: string
    name?: string
    avatar_url?: string
  }
  
  export interface Story {
    id: string;
    title: string;
    content: string;
    location: {
      lat: number;
      lng: number;
    };
    image_url?: string;
    user_id: string;
    created_at: string;
  }
  
  export interface Profile {
    id: string
    username?: string
    bio?: string
    website?: string
    avatar_url?: string
    updated_at?: string
  }