export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      feeds: {
        Row: {
          id: string
          created_at: string
          title: string
          content: string
          image_url: string | null
          tags: string[] | null
          user_id: string
          date: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          content: string
          image_url?: string | null
          tags?: string[] | null
          user_id: string
          date: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          content?: string
          image_url?: string | null
          tags?: string[] | null
          user_id?: string
          date?: string
        }
      }
    }
  }
} 