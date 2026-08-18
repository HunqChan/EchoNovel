import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storyService } from '../services/storyService';
import type { StoryResponse, ChapterResponse } from '../types';
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
} from 'lucide-react';

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<StoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const { user, isAuthenticated, isVip, updateUser } = useAuth();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    storyService
      .getStoryById(Number(id))
      .then((res) => setStory(res.data))
      .catch(() => setError('Không tìm thấy truyện'))
      .finally(() => setLoading(false));
  }, [id]);

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
            <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">{story.title}</h1>

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

    </div>
  );
}
