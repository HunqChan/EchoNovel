import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storyService } from '../services/storyService';
import { interactionService } from '../services/interactionService';
import type { StoryResponse, ChapterResponse, ReactionSummaryResponse, CommentResponse, PageResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Clock,
  Crown,
  Loader2,
  Lock,
  Tag,
  User,
  CheckCircle2,
  AlertCircle,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
} from 'lucide-react';

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<StoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const { user, isAuthenticated, isVip, updateUser } = useAuth();

  // Favorite state
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Reaction state
  const [reactionSummary, setReactionSummary] = useState<ReactionSummaryResponse | null>(null);
  const [reactionLoading, setReactionLoading] = useState(false);

  // Comment state
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(0);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<StoryResponse[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const storyId = Number(id);

    storyService
      .getStoryById(storyId)
      .then((res) => setStory(res.data))
      .catch(() => setError('Không tìm thấy truyện'))
      .finally(() => setLoading(false));

    // Fetch reaction summary (public)
    interactionService
      .getReactionSummary(storyId)
      .then((res) => setReactionSummary(res.data))
      .catch(() => {});

    // Fetch comments (public)
    fetchComments(storyId, 0);

    // Fetch recommendations (public)
    interactionService
      .getRecommendations(storyId)
      .then((res) => setRecommendations(res.data))
      .catch(() => {});
  }, [id]);

  // Fetch favorite status when authenticated
  useEffect(() => {
    if (!id || !isAuthenticated) return;
    interactionService
      .getFavoriteStatus(Number(id))
      .then((res) => setIsFavorited(res.data.favorited))
      .catch(() => {});
  }, [id, isAuthenticated]);

  const fetchComments = (storyId: number, page: number) => {
    setCommentLoading(true);
    interactionService
      .getComments(storyId, page)
      .then((res) => {
        const pageData = res.data as PageResponse<CommentResponse>;
        setComments(page === 0 ? pageData.content : [...comments, ...pageData.content]);
        setCommentPage(pageData.number);
        setCommentTotalPages(pageData.totalPages);
      })
      .catch(() => {})
      .finally(() => setCommentLoading(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-text-secondary">
        <AlertCircle className="mb-4 h-16 w-16 opacity-40" />
        <p className="text-lg font-medium">{error || 'Không tìm thấy truyện'}</p>
        <Link to="/stories" className="mt-4 text-sm text-primary hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const handleBuyStory = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua truyện!');
      return;
    }
    if (user!.coins < story.priceCoins) {
      toast.error('Bạn không đủ xu để mua truyện này!');
      return;
    }
    try {
      setBuying(true);
      await api.post(`/wallet/buy-story/${story.id}`);
      toast.success('Mua truyện thành công! Bạn đã có thể đọc các chương VIP.');
      // Trừ xu trên client
      updateUser({ ...user!, coins: user!.coins - story.priceCoins });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi mua truyện');
    } finally {
      setBuying(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để yêu thích truyện!');
      return;
    }
    try {
      setFavLoading(true);
      const res = await interactionService.toggleFavorite(story.id);
      setIsFavorited(res.data.favorited);
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setFavLoading(false);
    }
  };

  const handleReaction = async (type: 'LIKE' | 'DISLIKE') => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá!');
      return;
    }
    try {
      setReactionLoading(true);
      const res = await interactionService.submitReaction(story.id, type);
      setReactionSummary(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setReactionLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để bình luận!');
      return;
    }
    if (!commentText.trim()) return;
    try {
      setCommentSubmitting(true);
      const res = await interactionService.postComment(story.id, commentText.trim());
      setComments([res.data, ...comments]);
      setCommentText('');
      toast.success('Bình luận thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6">
        <Link to="/stories" className="text-sm text-text-secondary transition-colors hover:text-primary">
          ← Quay lại danh sách truyện
        </Link>
      </div>

      {/* ───── Story Info ───── */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-light">
        <div className="flex flex-col md:flex-row">
          {/* Cover */}
          <div className="relative w-full shrink-0 md:w-56 lg:w-64">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 md:h-full md:aspect-auto">
              {story.coverImage ? (
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center">
                  <BookOpen className="h-20 w-20 text-white/15" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">{story.title}</h1>
              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                disabled={favLoading}
                className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all active:scale-95 ${
                  isFavorited
                    ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-red-400'
                }`}
                title={isFavorited ? 'Bỏ yêu thích' : 'Yêu thích'}
              >
                <Heart className={`h-5 w-5 transition-all ${isFavorited ? 'fill-red-400' : ''}`} />
                <span className="hidden sm:inline">{isFavorited ? 'Đã thích' : 'Yêu thích'}</span>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                {story.authorName}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                {new Date(story.createdAt).toLocaleDateString('vi-VN')}
              </span>
              <span
                className={`flex items-center gap-1.5 font-medium ${
                  story.status === 'COMPLETED' ? 'text-emerald-400' : 'text-accent'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {story.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang ra'}
              </span>
            </div>

            {/* Genres */}
            {story.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {story.genres.map((genre) => (
                  <span
                    key={genre}
                    className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    <Tag className="h-3 w-3" />
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {story.description && (
              <div className="mt-5 rounded-xl bg-surface/50 p-4">
                <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">
                  {story.description}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="mt-5 flex gap-4">
              <div className="rounded-lg border border-white/10 px-4 py-2 text-center">
                <p className="text-xl font-bold text-primary">{story.chapters?.length ?? 0}</p>
                <p className="text-xs text-text-secondary">Chương</p>
              </div>
            </div>

            {/* Buy Action */}
            {story.priceCoins > 0 && !isVip && !story.isPurchased && (
              <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-6">
                <button
                  onClick={handleBuyStory}
                  disabled={buying}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-all hover:bg-accent-dark focus:ring-2 focus:ring-accent/50 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed sm:flex-none"
                >
                  {buying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crown className="h-5 w-5" />}
                  Mua trọn bộ cuốn này ({story.priceCoins} xu)
                </button>
                <p className="text-sm text-text-secondary hidden sm:block">
                  Mở khóa vĩnh viễn toàn bộ chương VIP
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───── Like / Dislike ───── */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={() => handleReaction('LIKE')}
          disabled={reactionLoading}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
            reactionSummary?.userReaction === 'LIKE'
              ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
              : 'bg-white/5 text-text-secondary hover:bg-emerald-500/10 hover:text-emerald-400'
          }`}
        >
          <ThumbsUp className={`h-5 w-5 ${reactionSummary?.userReaction === 'LIKE' ? 'fill-emerald-400' : ''}`} />
          Thích
          <span className="ml-1 text-xs opacity-80">({reactionSummary?.totalLikes ?? 0})</span>
        </button>
        <button
          onClick={() => handleReaction('DISLIKE')}
          disabled={reactionLoading}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
            reactionSummary?.userReaction === 'DISLIKE'
              ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30'
              : 'bg-white/5 text-text-secondary hover:bg-red-500/10 hover:text-red-400'
          }`}
        >
          <ThumbsDown className={`h-5 w-5 ${reactionSummary?.userReaction === 'DISLIKE' ? 'fill-red-400' : ''}`} />
          Không thích
          <span className="ml-1 text-xs opacity-80">({reactionSummary?.totalDislikes ?? 0})</span>
        </button>
      </div>

      {/* ───── Chapter List ───── */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-text-primary">Danh sách chương</h2>

        {!story.chapters || story.chapters.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-surface-light p-8 text-center text-text-secondary">
            <p>Truyện chưa có chương nào</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-surface-light">
            {story.chapters.map((chapter: ChapterResponse) => (
              <Link
                key={chapter.id}
                to={`/chapters/${chapter.id}`}
                className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-white/5 sm:px-6"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {chapter.chapterNumber}
                  </span>
                  <span className="truncate text-sm font-medium text-text-primary">
                    {chapter.title}
                  </span>
                </div>

                {/* Access level indicator */}
                <div className="ml-3 shrink-0">
                  {chapter.accessLevel === 'VIP' && (!isVip && !story.isPurchased) && (
                    <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                      <Crown className="h-3.5 w-3.5" />
                      VIP
                    </span>
                  )}
                  {chapter.accessLevel === 'MEMBER' && (!isAuthenticated) && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-400">
                      <Lock className="h-3.5 w-3.5" />
                      Đăng nhập
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ───── Comments Section ───── */}
      <div className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-text-primary">
          <MessageCircle className="h-5 w-5 text-primary" />
          Bình luận
        </h2>

        {/* Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-3">
              <img
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=4f46e5&color=fff&size=40`}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover border-2 border-white/10"
              />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  rows={3}
                  maxLength={1000}
                  className="w-full resize-none rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{commentText.length}/1000</span>
                  <button
                    type="submit"
                    disabled={commentSubmitting || !commentText.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {commentSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-6 rounded-xl border border-white/10 bg-surface-light p-4 text-center text-sm text-text-secondary">
            <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link> để bình luận
          </div>
        )}

        {/* Comments List */}
        {commentLoading && comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-surface-light p-8 text-center text-text-secondary">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3 rounded-xl border border-white/5 bg-surface-light p-4">
                <img
                  src={c.avatarUrl || `https://ui-avatars.com/api/?name=${c.username}&background=6366f1&color=fff&size=36`}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{c.username}</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(c.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary whitespace-pre-line">{c.content}</p>
                </div>
              </div>
            ))}

            {/* Load more */}
            {commentPage < commentTotalPages - 1 && (
              <button
                onClick={() => fetchComments(story.id, commentPage + 1)}
                disabled={commentLoading}
                className="mx-auto block rounded-lg border border-white/10 px-6 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-primary"
              >
                {commentLoading ? 'Đang tải...' : 'Xem thêm bình luận'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ───── Recommendations ───── */}
      {recommendations.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-text-primary">
            <span className="w-1 h-6 bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
            Truyện cùng thể loại
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                to={`/stories/${rec.id}`}
                className="group flex flex-col gap-2 rounded-xl border border-white/5 bg-surface-light p-2.5 transition-all hover:border-white/15 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface">
                  {rec.coverImage ? (
                    <img
                      src={rec.coverImage}
                      alt={rec.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                      <BookOpen className="h-8 w-8 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 px-1 pb-1">
                  <h3 className="line-clamp-2 text-sm font-bold text-text-primary transition-colors group-hover:text-primary leading-tight">
                    {rec.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">{rec.authorName}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
