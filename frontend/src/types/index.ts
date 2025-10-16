// API Response Types
export interface ApiListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiParams {
  page?: number;
  page_size?: number;
  search?: string;
  level?: string;
  category?: string;
  category__name?: string;
  status?: string;
  ordering?: string;
  q?: string;
  starts_with?: string;
  part_of_speech?: string;
}

export interface StatsResponse {
  total: number;
  by_category?: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  by_level?: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

// Category Type
export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// Grammar Lesson Type
export interface GrammarLesson {
  id: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  category: Category;
  title: string;
  content: string;
  examples: string;
  exercises: string;
  status: 'draft' | 'published';
  cover_image: string;
  order: number;
  estimated_duration: number;
  created_by: number;
}

// Video Lesson Type  
export interface VideoLesson {
  id: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  video_url: string;
  thumbnail: string;
  duration: number;
  status: 'draft' | 'published';
  order: number;
  created_by: number;
}

// Vocabulary Word Type
export interface VocabularyWord {
  id: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  turkmen_word: string;
  english_word: string;
  pronunciation: string;
  definition: string;
  example_sentence: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  status: 'draft' | 'published';
  created_by: number;
}

// User type for compatibility
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  profile_picture?: string;
  role: 'student' | 'teacher' | 'admin';
  is_verified: boolean;
  is_teacher: boolean;
  is_student: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message: string;
}

// Dashboard types
export interface CategoryStats {
  id: number;
  name: string;
  grammar_count: number;
}

export interface ProgressStats {
  completed: number;
  total: number;
  percentage: number;
  mastered?: number; // For backward compatibility
}

export interface ContentTypeStats {
  total: number;
  published: number;
  draft: number;
}

export interface ContentCreationStats {
  total: number;
  grammar: ContentTypeStats;
  videos: ContentTypeStats;
  vocabulary: ContentTypeStats;
}

export interface UserDashboard {
  user_id: number;
  username: string;
  email: string;
  role: string;
  total_grammar_lessons: number;
  total_video_lessons: number;
  total_vocabulary_words: number;
  categories: CategoryStats[];
  completed_grammar: ProgressStats | null;
  completed_videos: ProgressStats | null;
  vocabulary_mastered: ProgressStats | null;
  created_content: ContentCreationStats | null;
}

export interface UserRoleStats {
  students: number;
  teachers: number;
  admins: number;
}

export interface SystemDashboard {
  total_users: number;
  total_content: number;
  user_stats: {
    by_role: UserRoleStats;
    active_users: number;
    verified_users: number;
  };
  content_stats: {
    grammar: ContentTypeStats;
    videos: ContentTypeStats;
    vocabulary: ContentTypeStats;
    by_level: {
      beginner: number;
      intermediate: number;
      advanced: number;
    }
  };
}

// Aliases for backward compatibility
export type Grammar = GrammarLesson;
export type Video = VideoLesson;
export type Vocabulary = VocabularyWord;
