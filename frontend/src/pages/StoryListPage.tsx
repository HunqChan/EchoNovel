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
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Genre Modal States
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [genreSearchInput, setGenreSearchInput] = useState('');
  // Temp selection for modal before applying
  const [tempSelectedGenres, setTempSelectedGenres] = useState<number[]>([]);

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
        genreIds: selectedGenres,
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
  }, [keyword, selectedGenres, currentPage]);

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

  const applyGenreFilter = () => {
    setSelectedGenres(tempSelectedGenres);
    setCurrentPage(0);
    setIsFilterModalOpen(false);
  };

  const toggleTempGenre = (id: number) => {
    setTempSelectedGenres(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const openFilterModal = () => {
    setTempSelectedGenres(selectedGenres);
    setGenreSearchInput('');
    setIsFilterModalOpen(true);
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

        {/* Genre filter button */}
        <div className="relative">
          <button
            onClick={openFilterModal}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-light px-6 py-3 text-sm font-medium text-text-primary transition-all hover:bg-white/5"
          >
            <Filter className="h-4 w-4 text-text-secondary" />
            Lọc thể loại {selectedGenres.length > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">{selectedGenres.length}</span>}
          </button>
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

      {/* ───── Filter Modal ───── */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-white/10 bg-surface-light px-6 py-4">
              <h2 className="text-xl font-bold text-text-primary">Lọc Truyện Theo Thể Loại</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-text-secondary hover:text-white">✕</button>
            </div>
            
            <div className="p-4 border-b border-white/10 bg-surface-light">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Tìm thể loại..."
                  value={genreSearchInput}
                  onChange={(e) => setGenreSearchInput(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface pl-10 pr-4 py-2 text-sm text-text-primary outline-none focus:border-primary/50"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-2">
                {genres
                  .filter(g => g.name.toLowerCase().includes(genreSearchInput.toLowerCase()))
                  .map(genre => (
                    <label 
                      key={genre.id} 
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                        tempSelectedGenres.includes(genre.id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-white/10 bg-surface-light text-text-secondary hover:border-white/20 hover:text-text-primary'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={tempSelectedGenres.includes(genre.id)}
                        onChange={() => toggleTempGenre(genre.id)}
                        className="hidden"
                      />
                      <span className="text-sm font-medium">{genre.name}</span>
                    </label>
                  ))}
                {genres.filter(g => g.name.toLowerCase().includes(genreSearchInput.toLowerCase())).length === 0 && (
                  <div className="col-span-2 text-center text-sm text-text-secondary py-4">
                    Không tìm thấy thể loại phù hợp.
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-white/10 bg-surface-light px-6 py-4 flex justify-between items-center">
              <button
                onClick={() => setTempSelectedGenres([])}
                className="text-sm text-text-secondary hover:text-text-primary underline"
              >
                Bỏ chọn tất cả
              </button>
              <div className="flex gap-3">
                <button onClick={() => setIsFilterModalOpen(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/5">
                  Hủy
                </button>
                <button onClick={applyGenreFilter} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 hover:bg-primary-dark">
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
