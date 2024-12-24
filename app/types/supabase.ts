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
      profiles: {
        Row: {
          id: string
          name: string | null
          avatar_url: string | null
          baptismal_name: string | null
          email: string | null
          grade: string | null
          is_admin: boolean
          updated_at: string | null
        }
        // ... 필요한 다른 테이블 정의
      }
    }
  }
} 