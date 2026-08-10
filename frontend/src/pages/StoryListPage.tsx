import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { storyService } from '../services/storyService';
import type { StoryResponse, GenreResponse, PageResponse } from '../types';
import { Search, BookOpen, Filter, ChevronLeft, ChevronRight, Loader2, BookX } from 'lucide-react';

export default function StoryListPage() {
  const [stories, setStories] = useState<StoryResponse[]>([]);
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<StoryResponse> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');

  // Load genres once
  useEffect(() => {
    storyService.getGenres().then((res) => setGenres(res.data)).catch(() => {});
  }, []);

  // Fetch stories
  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await storyService.getStories({
        keyword: keyword || undefined,
        genreId: selectedGenre,
        page: currentPage,
        size: 12,
      });
      setStories(res.data.content);
      setPageInfo(res.data);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedGenre, currentPage]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchInput);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleGenreChange = (genreId: number | undefined) => {
    setSelectedGenre(genreId);
    setCurrentPage(0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ───── Header ───── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Kho Truyện</h1>
        <p className="mt-1 text-text-secondary">Khám phá hàng nghìn câu chuyện hấp dẫn</p>
      </div>

      {/* ───── Filters ───── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm truyện theo tên..."
            className="w-full rounded-xl border border-white/10 bg-surface-light py-3 pl-11 pr-4 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Genre filter */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <select
            value={selectedGenre ?? ''}
            onChange={(e) => handleGenreChange(e.target.value ? Number(e.target.value) : undefined)}
            className="appearance-none rounded-xl border border-white/10 bg-surface-light py-3 pl-10 pr-10 text-sm text-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tất cả thể loại</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ───── Story Grid ───── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
          <BookX className="mb-4 h-16 w-16 opacity-40" />
          <p className="text-lg font-medium">Không tìm thấy truyện nào</p>
          <p className="mt-1 text-sm">Thử thay đổi từ khóa hoặc bộ lọc</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {stories.map((story) => (
            <Link
              key={story.id}
              to={`/stories/${story.id}`}
              className="group overflow-hidden rounded-2xl border border-white/5 bg-surface-light transition-all hover:border-white/15 hover:shadow-xl hover:shadow-primary/5"
            >
              {/* Cover */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                {story.coverImage ? (
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white/20" />
                  </div>
                )}

                {/* Status badge */}
                <span
                  className={`absolute right-2 top-2 rounded-lg px-2 py-0.5 text-xs font-semibold ${
                    story.status === 'COMPLETED'
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-accent/90 text-white'
                  }`}
                >
                  {story.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang ra'}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-semibold text-text-primary transition-colors group-hover:text-primary">
                  {story.title}
                </h3>
                <p className="mt-1 text-xs text-text-secondary">{story.authorName}</p>
                {story.genres.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {story.genres.slice(0, 2).map((genre) => (
                      <span
                        key={genre}
                        className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                      >
                        {genre}
                      </span>
                    ))}
                    {story.genres.length > 2 && (
                      <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-text-secondary">
                        +{story.genres.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ───── Pagination ───── */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={pageInfo.first}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pageInfo.totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (pageInfo.totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage > pageInfo.totalPages - 4) {
                pageNum = pageInfo.totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-white/5'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pageInfo.totalPages - 1, p + 1))}
            disabled={pageInfo.last}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
