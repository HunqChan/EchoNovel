// ========== API Response Types ==========

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface ErrorResponse {
  status: number;
  errorCode: string;
  message: string;
  details: Record<string, string> | null;
}

/**
 * Spring Boot Page<T> response structure
 */
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ========== Auth Types ==========

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: UserResponse;
}

// ========== User Types ==========

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  isVip: boolean;
  createdAt: string;
}

// ========== Genre Types ==========

export interface GenreResponse {
  id: number;
  name: string;
}

// ========== Story Types ==========

export interface StoryResponse {
  id: number;
  title: string;
  authorName: string;
  authorId: number;
  genres: string[];
  coverImage: string | null;
  description: string | null;
  status: 'ONGOING' | 'COMPLETED';
  chapters?: ChapterResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface StoryRequest {
  title: string;
  authorId: number;
  genreIds?: number[];
  coverImage?: string;
  description?: string;
  status?: string;
}

// ========== Chapter Types ==========

export interface ChapterResponse {
  id: number;
  storyId: number;
  storyTitle: string;
  title: string;
  content?: string;
  chapterNumber: number;
  accessLevel: 'PUBLIC' | 'MEMBER' | 'VIP';
  createdAt: string;
  updatedAt: string;
}

export interface ChapterRequest {
  storyId: number;
  title: string;
  content: string;
  chapterNumber: number;
  accessLevel?: string;
}
