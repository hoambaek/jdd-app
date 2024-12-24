export type Database = {
  public: {
    tables: {
      feeds: {
        Row: {
          id: string
          title: string
          content: string
          image_url: string
          tags: string
          created_at: string
          date: string
        }
        // ... 필요한 다른 테이블 정의들
      }
    }
  }
} 