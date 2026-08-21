import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Trophy, Grid, BookOpen, Crown, Wallet, Flame, History } from 'lucide-react';
import { storyService } from '../services/storyService';
import { interactionService } from '../services/interactionService';
import { useAuth } from '../context/AuthContext';
import type { StoryResponse, ReadingHistoryResponse, TrendingStoryResponse } from '../types';
import HeroSlider from '../components/HeroSlider';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [featuredStories, setFeaturedStories] = useState<StoryResponse[]>([]);
  const [recentStories, setRecentStories] = useState<StoryResponse[]>([]);
  const [topStories, setTopStories] = useState<StoryResponse[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryResponse[]>([]);
  const [trendingStories, setTrendingStories] = useState<TrendingStoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentRes, topRes, trendingRes] = await Promise.all([
          storyService.getStories({ size: 15, sort: 'createdAt,desc' }),
          storyService.getStories({ size: 5, sort: 'id,asc' }),
          interactionService.getTrendingStories(),
        ]);
        
        const allRecent = recentRes.data.content;
        setFeaturedStories(allRecent.slice(0, 5));
        setRecentStories(allRecent.slice(5));
        setTopStories(topRes.data.content);
        setTrendingStories(trendingRes.data);
      } catch (err) {
        console.error('Error fetching homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch reading history for logged-in users
  useEffect(() => {
    if (!isAuthenticated) return;
    interactionService.getReadingHistory()
      .then((res) => setReadingHistory(res.data))
      .catch(() => {});
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const quickActions = [
    { icon: Crown, label: 'Nâng cấp VIP', color: 'bg-yellow-500/10 text-yellow-500', path: '/upgrade' },
    { icon: Wallet, label: 'Nạp xu', color: 'bg-green-500/10 text-green-500', path: '/profile?tab=wallet' },
    { icon: Headphones, label: 'Truyện đã nghe', color: 'bg-pink-500/10 text-pink-500', path: '/library' },
    { icon: Trophy, label: 'BXH Vinh Danh', color: 'bg-purple-500/10 text-purple-500', path: '/stories' },
    { icon: Grid, label: 'Thể loại', color: 'bg-blue-500/10 text-blue-500', path: '/stories' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ───── Hero & Leaderboard Grid ───── */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <HeroSlider stories={featuredStories} />
        </div>

        {/* Right Leaderboard (1 column) */}
        <div className="hidden lg:flex flex-col rounded-2xl bg-surface border border-white/5 p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-bold text-text-primary uppercase text-sm tracking-wider">Bảng xếp hạng</h3>
          </div>
          
          {/* Tabs pseudo */}
          <div className="flex gap-1 bg-surface-light p-1 rounded-lg mb-4">
            <button className="flex-1 rounded-md bg-primary py-1.5 text-xs font-semibold text-white shadow">Ngày</button>
            <button className="flex-1 rounded-md py-1.5 text-xs font-semibold text-text-secondary hover:text-white transition-colors">Tuần</button>
            <button className="flex-1 rounded-md py-1.5 text-xs font-semibold text-text-secondary hover:text-white transition-colors">Tháng</button>
          </div>

          <div className="flex-1 flex flex-col gap-3 justify-center">
            {topStories.map((story, idx) => (
              <Link key={story.id} to={`/stories/${story.id}`} className="flex items-center gap-3 group rounded-lg p-1 transition-colors hover:bg-surface-light">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  idx === 0 ? 'bg-yellow-500 text-white shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 
                  idx === 1 ? 'bg-gray-400 text-white shadow-[0_0_10px_rgba(156,163,175,0.3)]' : 
                  idx === 2 ? 'bg-amber-600 text-white shadow-[0_0_10px_rgba(217,119,6,0.3)]' : 'bg-surface-light text-text-secondary'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                    {story.title}
                  </h4>
                  <p className="text-[11px] text-text-secondary line-clamp-1">{story.authorName}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <Link to="/stories" className="mt-4 block text-center text-xs font-medium text-text-secondary hover:text-primary transition-colors">
            Xem tất cả
          </Link>
        </div>
      </div>

      {/* ───── Quick Actions ───── */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {quickActions.map((action, idx) => (
          <Link 
            key={idx} 
            to={action.path}
            className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-start justify-center gap-2 sm:gap-3 rounded-2xl border border-white/5 bg-surface p-3 sm:p-4 transition-all hover:bg-surface-light hover:scale-105 hover:shadow-lg hover:border-white/10"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-text-primary sm:mt-2">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* ───── Reading History (only for authenticated users with history) ───── */}
      {isAuthenticated && readingHistory.length > 0 && (
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary uppercase flex items-center gap-2">
              <span className="w-1 h-6 bg-accent rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
              <History className="h-5 w-5 text-accent" />
              Truyện đang đọc dở
            </h2>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {readingHistory.slice(0, 6).map((rh) => (
              <Link
                key={rh.storyId}
                to={rh.lastChapterId ? `/chapters/${rh.lastChapterId}` : `/stories/${rh.storyId}`}
                className="group flex gap-4 rounded-xl border border-white/5 bg-surface-light p-3 transition-all hover:border-white/15 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Cover */}
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                  {rh.coverImage ? (
                    <img src={rh.coverImage} alt={rh.storyTitle} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                      <BookOpen className="h-6 w-6 text-white/20" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                      {rh.storyTitle}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                      Chương {rh.lastChapterNumber}: {rh.lastChapterTitle}
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] text-text-secondary mb-1">
                      <span>Tiến độ</span>
                      <span>{rh.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                        style={{ width: `${rh.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ───── Trending Stories ───── */}
      {trendingStories.length > 0 && (
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary uppercase flex items-center gap-2">
              <span className="w-1 h-6 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
              <Flame className="h-5 w-5 text-red-500" />
              Truyện thịnh hành
            </h2>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {trendingStories.map((story) => (
              <Link
                key={story.storyId}
                to={`/stories/${story.storyId}`}
                className="group flex flex-col gap-2 rounded-xl border border-white/5 bg-surface-light p-2.5 transition-all hover:border-white/15 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                {/* Cover */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface">
                  {story.coverImage ? (
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                      <BookOpen className="h-10 w-10 text-white/20" />
                    </div>
                  )}
                  
                  {/* Reader count badge */}
                  <span className="absolute right-1.5 top-1.5 rounded bg-black/70 backdrop-blur px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white border border-white/10 flex items-center gap-1">
                    <Flame className="h-3 w-3 text-red-400" />
                    {story.readerCount}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-0.5 px-1 pb-1">
                  <h3 className="line-clamp-2 text-sm font-bold text-text-primary transition-colors group-hover:text-primary leading-tight">
                    {story.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary line-clamp-1 mt-1">
                    {story.authorName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ───── Recent Stories Grid ───── */}
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary uppercase flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
            Truyện mới cập nhật
          </h2>
          <Link to="/stories" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
            Tất cả
          </Link>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {recentStories.map((story) => (
            <Link
              key={story.id}
              to={`/stories/${story.id}`}
              className="group flex flex-col gap-2 rounded-xl border border-white/5 bg-surface-light p-2.5 transition-all hover:border-white/15 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              {/* Cover */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface">
                {story.coverImage ? (
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    <BookOpen className="h-10 w-10 text-white/20" />
                  </div>
                )}
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2 sm:p-3">
                  <span className="text-[10px] sm:text-xs text-white line-clamp-2 font-medium drop-shadow-md leading-relaxed">
                    {story.genres.join(', ')}
                  </span>
                </div>
                
                {/* Status */}
                <span className={`absolute right-1.5 top-1.5 rounded bg-black/70 backdrop-blur px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white border border-white/10`}>
                  {story.status === 'COMPLETED' ? 'FULL' : 'ĐANG RA'}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-0.5 px-1 pb-1">
                <h3 className="line-clamp-2 text-sm font-bold text-text-primary transition-colors group-hover:text-primary leading-tight">
                  {story.title}
                </h3>
                <p className="text-[11px] text-text-secondary line-clamp-1 mt-1">
                  {story.authorName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
