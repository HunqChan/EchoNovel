import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Loader2, Plus, Edit2, Trash2, 
  ChevronRight, ChevronDown, FileAudio, Upload as UploadIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select'; // react-select for searchable dropdown

import { storyService } from '../../services/storyService';
import { authorService } from '../../services/authorService';
import { genreService } from '../../services/genreService';
import { chapterService } from '../../services/chapterService';
import { audioService } from '../../services/audioService';
import { uploadService } from '../../services/uploadService';

import type { 
  StoryResponse, AuthorResponse, GenreResponse, StoryRequest,
  ChapterResponse, ChapterRequest
} from '../../types';

// Custom dark theme styles for react-select
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    background: 'rgba(255, 255, 255, 0.05)',
    borderColor: state.isFocused ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0.75rem',
    padding: '2px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#6366f1'
    }
  }),
  menu: (base: any) => ({
    ...base,
    background: '#2d2a3e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.75rem',
    overflow: 'hidden'
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#6366f1' 
      : state.isFocused 
        ? 'rgba(255,255,255,0.1)' 
        : 'transparent',
    color: '#f1f5f9',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#6366f1'
    }
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#f1f5f9'
  }),
  input: (base: any) => ({
    ...base,
    color: '#f1f5f9'
  })
};

export default function AdminStoriesPage() {
  // --- Data States ---
  const [stories, setStories] = useState<StoryResponse[]>([]);
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [chaptersByStory, setChaptersByStory] = useState<Record<number, ChapterResponse[]>>({});
  
  const [loading, setLoading] = useState(true);
  const [expandedStoryId, setExpandedStoryId] = useState<number | null>(null);
  const [loadingChapters, setLoadingChapters] = useState<Record<number, boolean>>({});

  // --- Search & Pagination States ---
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- Story Form State ---
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryResponse | null>(null);
  const [storyFormData, setStoryFormData] = useState<StoryRequest>({
    title: '',
    authorId: 0,
    genreIds: [],
    coverImage: '',
    description: '',
    status: 'ONGOING',
    priceCoins: 0
  });

  // --- Chapter Form State ---
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterResponse | null>(null);
  const [chapterFormData, setChapterFormData] = useState<ChapterRequest>({
    storyId: 0,
    title: '',
    content: '',
    chapterNumber: 1,
    accessLevel: 'PUBLIC',
  });

  // --- Audio Form State ---
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [selectedAudioChapter, setSelectedAudioChapter] = useState<ChapterResponse | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  // --- Cover Image Upload State ---
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // --- Init Fetch ---
  const fetchInitialData = async () => {
    try {
      const [authorRes, genreRes] = await Promise.all([
        authorService.getAuthors(),
        genreService.getGenres(),
      ]);
      setAuthors(authorRes.data);
      setGenres(genreRes.data);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu tác giả/thể loại');
    }
  };

  const fetchStories = async () => {
    setLoading(true);
    try {
      const storyRes = await storyService.getStories({ 
        keyword: searchTerm,
        page: currentPage, 
        size: 10 
      });
      setStories(storyRes.data.content);
      setTotalPages(storyRes.data.totalPages);
    } catch (err) {
      toast.error('Lỗi tải danh sách truyện');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchStories();
  }, [searchTerm, currentPage]);

  // --- Expand Story Logic ---
  const handleToggleExpand = async (storyId: number) => {
    if (expandedStoryId === storyId) {
      setExpandedStoryId(null);
      return;
    }
    
    setExpandedStoryId(storyId);
    
    // Fetch chapters if not already loaded
    if (!chaptersByStory[storyId]) {
      fetchChapters(storyId);
    }
  };

  const fetchChapters = async (storyId: number) => {
    setLoadingChapters(prev => ({ ...prev, [storyId]: true }));
    try {
      const res = await chapterService.getChaptersByStoryId(storyId);
      setChaptersByStory(prev => ({ ...prev, [storyId]: res.data }));
    } catch (err) {
      toast.error('Lỗi tải danh sách chương');
    } finally {
      setLoadingChapters(prev => ({ ...prev, [storyId]: false }));
    }
  };


  // ==========================================
  // STORY HANDLERS
  // ==========================================
  const handleOpenStoryModal = (story?: StoryResponse) => {
    if (story) {
      setEditingStory(story);
      setStoryFormData({
        title: story.title,
        authorId: story.authorId,
        genreIds: genres.filter(g => story.genres.includes(g.name)).map(g => g.id),
        coverImage: story.coverImage || '',
        description: story.description || '',
        status: story.status,
        priceCoins: story.priceCoins || 0,
      });
    } else {
      setEditingStory(null);
      setStoryFormData({
        title: '',
        authorId: authors[0]?.id || 0,
        genreIds: [],
        coverImage: '',
        description: '',
        status: 'ONGOING',
        priceCoins: 0
      });
    }
    setShowStoryModal(true);
    // Reset cover file state
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyFormData.title || !storyFormData.authorId) {
      toast.error('Vui lòng nhập tên truyện và chọn tác giả');
      return;
    }

    try {
      if (editingStory) {
        await storyService.updateStory(editingStory.id, storyFormData);
        // Upload cover image file if selected
        if (coverFile) {
          setUploadingCover(true);
          try {
            await uploadService.uploadStoryCover(editingStory.id, coverFile);
          } catch {
            toast.error('Lỗi khi upload ảnh bìa');
          } finally {
            setUploadingCover(false);
          }
        }
        toast.success('Cập nhật truyện thành công');
      } else {
        const createRes = await storyService.createStory(storyFormData);
        // Upload cover image file for new story if selected
        if (coverFile && createRes.data?.id) {
          setUploadingCover(true);
          try {
            await uploadService.uploadStoryCover(createRes.data.id, coverFile);
          } catch {
            toast.error('Lỗi khi upload ảnh bìa');
          } finally {
            setUploadingCover(false);
          }
        }
        toast.success('Thêm truyện mới thành công');
      }
      setShowStoryModal(false);
      fetchStories();
    } catch (err) {
      toast.error('Lỗi khi lưu truyện');
    }
  };

  const handleDeleteStory = async (e: React.MouseEvent, id: number, title: string) => {
    e.stopPropagation(); // prevent expanding
    if (window.confirm(`Bạn có chắc muốn xóa truyện "${title}" cùng toàn bộ chương và audio của nó không?`)) {
      try {
        await storyService.deleteStory(id);
        toast.success('Xóa truyện thành công');
        fetchStories();
      } catch (err) {
        toast.error('Lỗi khi xóa truyện');
      }
    }
  };


  // ==========================================
  // CHAPTER HANDLERS
  // ==========================================
  const handleOpenChapterModal = async (storyId: number, chapter?: ChapterResponse) => {
    if (chapter) {
      try {
        const res = await chapterService.getChapterById(chapter.id);
        setEditingChapter(res.data);
        setChapterFormData({
          storyId: res.data.storyId,
          title: res.data.title,
          content: res.data.content || '',
          chapterNumber: res.data.chapterNumber,
          accessLevel: res.data.accessLevel,
        });
      } catch (err) {
        toast.error('Lỗi tải nội dung chương');
        return;
      }
    } else {
      setEditingChapter(null);
      const currentChapters = chaptersByStory[storyId] || [];
      const nextNum = currentChapters.length > 0 
        ? currentChapters[currentChapters.length - 1].chapterNumber + 1 
        : 1;
        
      setChapterFormData({
        storyId: storyId,
        title: '',
        content: '',
        chapterNumber: nextNum,
        accessLevel: 'PUBLIC',
      });
    }
    setShowChapterModal(true);
  };

  const handleSubmitChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterFormData.title || !chapterFormData.content) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    try {
      if (editingChapter) {
        await chapterService.updateChapter(editingChapter.id, chapterFormData);
        toast.success('Cập nhật chương thành công');
      } else {
        await chapterService.createChapter(chapterFormData);
        toast.success('Thêm chương mới thành công');
      }
      setShowChapterModal(false);
      fetchChapters(chapterFormData.storyId); // refresh
    } catch (err) {
      toast.error('Lỗi khi lưu chương');
    }
  };

  const handleDeleteChapter = async (storyId: number, id: number, title: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa chương "${title}" không?`)) {
      try {
        await chapterService.deleteChapter(id);
        toast.success('Xóa chương thành công');
        fetchChapters(storyId);
      } catch (err) {
        toast.error('Lỗi khi xóa chương');
      }
    }
  };


  // ==========================================
  // AUDIO HANDLERS
  // ==========================================
  const handleOpenAudioModal = (chapter: ChapterResponse) => {
    setSelectedAudioChapter(chapter);
    setAudioFile(null);
    setShowAudioModal(true);
  };

  const handleUploadAudio = async () => {
    if (!selectedAudioChapter || !audioFile) return;
    
    setUploadingAudio(true);
    const formData = new FormData();
    formData.append('file', audioFile);

    try {
      await audioService.uploadAudio(selectedAudioChapter.id, formData);
      toast.success('Upload audio thành công');
      setShowAudioModal(false);
    } catch (err) {
      toast.error('Lỗi upload audio');
    } finally {
      setUploadingAudio(false);
    }
  };


  const authorOptions = useMemo(() => {
    return authors.map(a => ({ value: a.id, label: a.name }));
  }, [authors]);

  const genreOptions = useMemo(() => {
    return genres.map(g => ({ value: g.id, label: g.name }));
  }, [genres]);

  const statusOptions = [
    { value: 'ONGOING', label: 'Đang ra' },
    { value: 'COMPLETED', label: 'Hoàn thành' }
  ];

  const accessLevelOptions = [
    { value: 'PUBLIC', label: 'PUBLIC' },
    { value: 'MEMBER', label: 'MEMBER' },
    { value: 'VIP', label: 'VIP' }
  ];

  // Removed global loading state to prevent losing input focus

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Quản lý Truyện & Chương</h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên truyện..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary/50 sm:w-64"
          />
          <button
            onClick={() => handleOpenStoryModal()}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Thêm truyện mới</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-light shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-white/5 text-xs uppercase text-text-primary">
              <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">Ảnh bìa</th>
                <th className="px-6 py-4">Tên truyện</th>
                <th className="px-6 py-4">Tác giả</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </td>
                </tr>
              ) : stories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                    Chưa có truyện nào.
                  </td>
                </tr>
              ) : (
                stories.map((story) => {
                  const isExpanded = expandedStoryId === story.id;
                
                return (
                  <React.Fragment key={story.id}>
                    {/* Story Row */}
                    <tr 
                      className={`transition-colors hover:bg-white/5 cursor-pointer ${isExpanded ? 'bg-white/5' : ''}`}
                      onClick={() => handleToggleExpand(story.id)}
                    >
                      <td className="px-6 py-4 text-text-secondary">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </td>
                      <td className="px-6 py-4">
                        <img
                          src={story.coverImage || 'https://via.placeholder.com/150'}
                          alt={story.title}
                          className="h-16 w-12 rounded object-cover shadow-sm"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-text-primary">
                        <div className="line-clamp-2">{story.title}</div>
                        <div className="mt-1 text-xs text-text-secondary">ID: {story.id}</div>
                      </td>
                      <td className="px-6 py-4">{story.authorName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          story.status === 'ONGOING' 
                            ? 'bg-blue-500/10 text-blue-400' 
                            : 'bg-green-500/10 text-green-400'
                        }`}>
                          {story.status === 'ONGOING' ? 'Đang ra' : 'Hoàn thành'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenStoryModal(story); }}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-accent transition-colors hover:bg-accent/10"
                            title="Sửa truyện"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteStory(e, story.id, story.title)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10"
                            title="Xóa truyện"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Chapters Sub-table (Expanded) */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-surface p-0">
                          <div className="border-t border-b border-white/5 px-8 py-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                                Danh sách chương
                              </h3>
                              <button
                                onClick={() => handleOpenChapterModal(story.id)}
                                className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-white/20"
                              >
                                <Plus className="h-4 w-4" />
                                Thêm chương
                              </button>
                            </div>
                            
                            {loadingChapters[story.id] ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="rounded-xl border border-white/10 bg-surface-light overflow-hidden">
                                <table className="w-full text-left text-sm text-text-secondary">
                                  <thead className="bg-white/5 text-xs text-text-primary">
                                    <tr>
                                      <th className="px-4 py-3">Chương</th>
                                      <th className="px-4 py-3">Tiêu đề</th>
                                      <th className="px-4 py-3">Truy cập</th>
                                      <th className="px-4 py-3 text-right">Thao tác</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {!chaptersByStory[story.id] || chaptersByStory[story.id].length === 0 ? (
                                      <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-xs">
                                          Truyện này chưa có chương nào.
                                        </td>
                                      </tr>
                                    ) : (
                                      chaptersByStory[story.id].map(chapter => (
                                        <tr key={chapter.id} className="hover:bg-white/5 transition-colors">
                                          <td className="px-4 py-3 font-medium text-text-primary">{chapter.chapterNumber}</td>
                                          <td className="px-4 py-3">{chapter.title}</td>
                                          <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                              chapter.accessLevel === 'PUBLIC' ? 'bg-green-500/10 text-green-400' :
                                              chapter.accessLevel === 'MEMBER' ? 'bg-blue-500/10 text-blue-400' :
                                              'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                              {chapter.accessLevel}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                              <button
                                                onClick={() => handleOpenAudioModal(chapter)}
                                                className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                                title="Tải lên Audio"
                                              >
                                                <FileAudio className="h-5 w-5" />
                                              </button>
                                              <button
                                                onClick={() => handleOpenChapterModal(story.id, chapter)}
                                                className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                                title="Sửa chương"
                                              >
                                                <Edit2 className="h-5 w-5" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteChapter(story.id, chapter.id, chapter.title)}
                                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Xóa chương"
                                              >
                                                <Trash2 className="h-5 w-5" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 bg-surface-light px-6 py-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              Trang trước
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === idx
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-white/5'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* STORY MODAL */}
      {/* ========================================== */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 bg-surface-light px-6 py-4">
              <h2 className="text-xl font-bold text-text-primary">
                {editingStory ? 'Chỉnh sửa truyện' : 'Thêm truyện mới'}
              </h2>
              <button onClick={() => setShowStoryModal(false)} className="text-text-secondary hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="storyForm" onSubmit={handleSubmitStory} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Tên truyện <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={storyFormData.title}
                    onChange={(e) => setStoryFormData({ ...storyFormData, title: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-text-primary outline-none focus:border-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Tác giả <span className="text-red-500">*</span></label>
                    <Select
                      options={authorOptions}
                      value={authorOptions.find(opt => opt.value === storyFormData.authorId) || null}
                      onChange={(selected) => setStoryFormData({ ...storyFormData, authorId: selected ? selected.value : 0 })}
                      placeholder="Tìm tác giả..."
                      noOptionsMessage={() => "Không tìm thấy tác giả"}
                      styles={selectStyles}
                      isClearable={false}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Trạng thái</label>
                    <Select
                      options={statusOptions}
                      value={statusOptions.find(opt => opt.value === storyFormData.status) || statusOptions[0]}
                      onChange={(selected) => setStoryFormData({ ...storyFormData, status: selected ? selected.value : 'ONGOING' })}
                      styles={selectStyles}
                      isClearable={false}
                      isSearchable={false}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Thể loại</label>
                  <Select
                    isMulti
                    options={genreOptions}
                    value={genreOptions.filter(opt => (storyFormData.genreIds || []).includes(opt.value))}
                    onChange={(selectedItems) => {
                      const ids = selectedItems ? selectedItems.map(item => item.value) : [];
                      setStoryFormData({ ...storyFormData, genreIds: ids });
                    }}
                    placeholder="Tìm và chọn thể loại..."
                    noOptionsMessage={() => "Không tìm thấy thể loại"}
                    styles={{
                      ...selectStyles,
                      multiValue: (base: any) => ({
                        ...base,
                        backgroundColor: 'rgba(99, 102, 241, 0.2)', // primary with opacity
                        borderRadius: '0.375rem',
                      }),
                      multiValueLabel: (base: any) => ({
                        ...base,
                        color: '#a5b4fc', // text-primary light
                      }),
                      multiValueRemove: (base: any) => ({
                        ...base,
                        color: '#a5b4fc',
                        ':hover': {
                          backgroundColor: 'rgba(99, 102, 241, 0.4)',
                          color: '#fff',
                        },
                      }),
                    }}
                  />
                </div>

                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Giá mua lẻ (Xu)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={storyFormData.priceCoins}
                      onChange={(e) => setStoryFormData({ ...storyFormData, priceCoins: Number(e.target.value) })}
                      className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-text-primary outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Ảnh bìa truyện</label>
                    <div className="flex items-start gap-4">
                      {/* Cover Preview */}
                      {(coverPreview || storyFormData.coverImage) && (
                        <div className="relative flex-shrink-0">
                          <img
                            src={coverPreview || storyFormData.coverImage || ''}
                            alt="Cover preview"
                            className="h-24 w-16 rounded-lg object-cover border border-white/10 shadow-lg"
                          />
                          {uploadingCover && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                              <Loader2 className="w-5 h-5 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        {/* File Upload Button */}
                        <input
                          ref={coverFileRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                                toast.error('Chỉ hỗ trợ file ảnh JPG, PNG, WebP');
                                return;
                              }
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error('Dung lượng file không được vượt quá 5MB');
                                return;
                              }
                              setCoverFile(file);
                              setCoverPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="hidden"
                          id="cover-file-input"
                        />
                        <button
                          type="button"
                          onClick={() => coverFileRef.current?.click()}
                          className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-white/20"
                        >
                          <UploadIcon className="h-4 w-4" />
                          {coverFile ? 'Thay ảnh khác' : 'Tải ảnh bìa lên'}
                        </button>
                        <p className="text-[10px] text-text-secondary">JPG, PNG, WebP. Tối đa 5MB.</p>
                        {/* Fallback: URL input */}
                        <input
                          type="url"
                          value={storyFormData.coverImage}
                          onChange={(e) => setStoryFormData({ ...storyFormData, coverImage: e.target.value })}
                          className="w-full rounded-lg border border-white/10 bg-surface-light px-3 py-2 text-xs text-text-primary outline-none focus:border-primary/50"
                          placeholder="Hoặc dán link ảnh bìa..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Mô tả nội dung</label>
                  <textarea
                    rows={4}
                    value={storyFormData.description}
                    onChange={(e) => setStoryFormData({ ...storyFormData, description: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-text-primary outline-none focus:border-primary/50"
                  />
                </div>
              </form>
            </div>

            <div className="border-t border-white/10 bg-surface-light px-6 py-4 flex justify-end gap-3">
              <button type="button" onClick={() => setShowStoryModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/5">
                Hủy
              </button>
              <button type="submit" form="storyForm" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 hover:bg-primary-dark">
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* CHAPTER MODAL */}
      {/* ========================================== */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 bg-surface-light px-6 py-4">
              <h2 className="text-xl font-bold text-text-primary">
                {editingChapter ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
              </h2>
              <button onClick={() => setShowChapterModal(false)} className="text-text-secondary hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="chapterForm" onSubmit={handleSubmitChapter} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Số thứ tự chương</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={chapterFormData.chapterNumber}
                      onChange={(e) => setChapterFormData({ ...chapterFormData, chapterNumber: Number(e.target.value) })}
                      className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2 text-text-primary outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Tiêu đề chương <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={chapterFormData.title}
                      onChange={(e) => setChapterFormData({ ...chapterFormData, title: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2 text-text-primary outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Cấp độ truy cập</label>
                  <Select
                    options={accessLevelOptions}
                    value={accessLevelOptions.find(opt => opt.value === chapterFormData.accessLevel) || accessLevelOptions[0]}
                    onChange={(selected) => setChapterFormData({ ...chapterFormData, accessLevel: selected ? selected.value : 'PUBLIC' })}
                    styles={selectStyles}
                    isClearable={false}
                    isSearchable={false}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Nội dung <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={12}
                    value={chapterFormData.content}
                    onChange={(e) => setChapterFormData({ ...chapterFormData, content: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-3 text-text-primary outline-none focus:border-primary/50 font-mono text-sm"
                    placeholder="Nhập nội dung chương..."
                  />
                </div>
              </form>
            </div>

            <div className="border-t border-white/10 bg-surface-light px-6 py-4 flex justify-end gap-3">
              <button type="button" onClick={() => setShowChapterModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/5">
                Hủy
              </button>
              <button type="submit" form="chapterForm" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 hover:bg-primary-dark">
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* AUDIO UPLOAD MODAL */}
      {/* ========================================== */}
      {showAudioModal && selectedAudioChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface shadow-2xl overflow-hidden">
            <div className="border-b border-white/10 bg-surface-light px-6 py-4">
              <h2 className="text-lg font-bold text-text-primary">Tải lên Audio</h2>
              <p className="text-sm text-text-secondary mt-1">
                Chương: {selectedAudioChapter.title}
              </p>
            </div>
            <div className="p-6">
              <input
                type="file"
                accept="audio/mp3,audio/wav,audio/mpeg"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
            <div className="border-t border-white/10 bg-surface-light px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowAudioModal(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-text-secondary hover:bg-white/5">
                Hủy
              </button>
              <button
                onClick={handleUploadAudio}
                disabled={!audioFile || uploadingAudio}
                className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-green-500/25 hover:bg-green-600 disabled:opacity-50"
              >
                {uploadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadIcon className="h-4 w-4" />}
                Tải lên
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
