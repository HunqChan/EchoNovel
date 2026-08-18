import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Trophy, Grid, BookOpen, Crown, Wallet } from 'lucide-react';
import { storyService } from '../services/storyService';
import type { StoryResponse } from '../types';
import HeroSlider from '../components/HeroSlider';

export default function HomePage() {
  const [featuredStories, setFeaturedStories] = useState<StoryResponse[]>([]);
  const [recentStories, setRecentStories] = useState<StoryResponse[]>([]);
  const [topStories, setTopStories] = useState<StoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentRes, topRes] = await Promise.all([
          storyService.getStories({ size: 15, sort: 'createdAt,desc' }),
          storyService.getStories({ size: 5, sort: 'id,asc' }) // Mượn tạm id asc làm top
        ]);
        
        const allRecent = recentRes.data.content;
        setFeaturedStories(allRecent.slice(0, 5));
        setRecentStories(allRecent.slice(5));
        setTopStories(topRes.data.content);
      } catch (err) {
        console.error('Error fetching homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
