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
  otp?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface GoogleAuthRequest {
  token: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  user: UserResponse;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ========== User Types ==========

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  vipType: 'NONE' | 'PERMANENT' | 'SUBSCRIPTION';
  coins: number;
  vipExpireAt: string | null;
  avatarUrl?: string;
  provider?: string;
  createdAt: string;
}

export interface UserProfileUpdateRequest {
  username: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  otp: string;
  newPassword: string;
}

// ========== Genre Types ==========

export interface GenreResponse {
  id: number;
  name: string;
}

export interface GenreRequest {
  name: string;
}

// ========== Author Types ==========

export interface AuthorResponse {
  id: number;
  name: string;
}

export interface AuthorRequest {
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
  priceCoins: number;
  isPurchased?: boolean;
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
  priceCoins?: number;
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

// ========== Audio Types ==========

export interface AudioFileResponse {
  id: number;
  chapterId: number;
  chapterTitle: string;
  filePath: string;
  audioUrl: string;
  source: 'UPLOAD' | 'TTS';
  duration: number;
  createdAt: string;
}

// ========== Stats Types ==========

export interface TopStoryStat {
  title: string;
  chapterCount: number;
}

export interface DailyStatPoint {
  date: string;
  value: number;
}

export interface AdminStatsResponse {
  totalStories: number;
  totalChapters: number;
  totalUsers: number;
  totalVipUsers: number;
  accessLevelDistribution: Record<string, number>;
  topStories: TopStoryStat[];
  // New fields
  userGrowth: DailyStatPoint[];
  revenueStats: DailyStatPoint[];
  totalVipPackagesSold: number;
  topReadStories: TopStoryStat[];
  topLikedStories: TopStoryStat[];
  genreDistribution: Record<string, number>;
}

// ========== Wallet & VIP Types ==========

export interface VipPackage {
  id: number;
  name: string;
  durationDays: number;
  priceCoins: number;
  description: string;
  isActive: boolean;
}

export interface CoinTransaction {
  id: number;
  amount: number;
  type: 'ADMIN_ADJUST' | 'BUY_VIP' | 'BUY_STORY';
  description: string;
  createdAt: string;
}

// ========== Favorite Types ==========

export interface FavoriteResponse {
  storyId: number;
  storyTitle: string;
  coverImage: string | null;
  authorName: string;
  createdAt: string;
}

// ========== Reaction Types ==========

export interface ReactionSummaryResponse {
  totalLikes: number;
  totalDislikes: number;
  userReaction: 'LIKE' | 'DISLIKE' | null;
}

// ========== Comment Types ==========

export interface CommentResponse {
  id: number;
  username: string;
  avatarUrl: string | null;
  content: string;
  createdAt: string;
}

// ========== Reading History Types ==========

export interface ReadingHistoryResponse {
  storyId: number;
  storyTitle: string;
  coverImage: string | null;
  lastChapterId: number | null;
  lastChapterTitle: string | null;
  lastChapterNumber: number | null;
  progressPercent: number;
  updatedAt: string;
}

// ========== Trending Types ==========

export interface TrendingStoryResponse {
  storyId: number;
  title: string;
  coverImage: string | null;
  authorName: string;
  readerCount: number;
  genres: string[];
}

