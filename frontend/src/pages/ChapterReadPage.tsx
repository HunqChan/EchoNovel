import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { chapterService } from '../services/chapterService';
import { audioService } from '../services/audioService';
import type { ChapterResponse, AudioFileResponse, ErrorResponse } from '../types';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import AudioPlayer from '../components/AudioPlayer';
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Loader2,
  LogIn,
  AlertTriangle,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';

type AccessError = {
  type: 'UNAUTHORIZED' | 'VIP_REQUIRED' | 'GENERIC';
  message: string;
};

export default function ChapterReadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<ChapterResponse | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<AccessError | null>(null);

  // Audio state
  const [audioData, setAudioData] = useState<AudioFileResponse | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [ttsGenerating, setTtsGenerating] = useState(false);
  const [autoContinue, setAutoContinue] = useState(() => {
    return localStorage.getItem('autoContinue') === 'true';
  });
  const [showAutoContinueConfirm, setShowAutoContinueConfirm] = useState(false);

  // Persist auto-continue preference
  useEffect(() => {
    localStorage.setItem('autoContinue', String(autoContinue));
  }, [autoContinue]);

  // Fetch chapter content
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setAccessError(null);
    setChapter(null);
    setAudioData(null);

    chapterService
      .getChapterById(Number(id))
      .then((res) => {
        setChapter(res.data);
        return chapterService.getChaptersByStoryId(res.data.storyId);
      })
      .then((res) => {
        setAllChapters(res.data);
      })
      .catch((err: AxiosError<ErrorResponse>) => {
        const status = err.response?.status;
        const errorCode = err.response?.data?.errorCode;
        const message = err.response?.data?.message;

        if (status === 401 || errorCode === 'UNAUTHORIZED') {
          setAccessError({
            type: 'UNAUTHORIZED',
            message: message || 'Bạn cần đăng nhập để đọc chương này',
          });
        } else if (status === 403 || errorCode === 'CHAPTER_ACCESS_DENIED') {
          setAccessError({
            type: 'VIP_REQUIRED',
            message: message || 'Chương này dành riêng cho tài khoản VIP',
          });
        } else {
          setAccessError({
            type: 'GENERIC',
            message: message || 'Không thể tải nội dung chương',
          });
        }
      })
      .finally(() => setLoading(false));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Fetch audio when chapter loads successfully
  useEffect(() => {
    if (!chapter) return;
    setAudioLoading(true);

    audioService
      .getAudio(chapter.id)
      .then((res) => setAudioData(res.data))
      .catch(() => {
        // 404 = no audio yet, that's expected
        setAudioData(null);
        // If we are auto-continuing, automatically generate TTS using the last used voice
        if (window.history.state?.usr?.autoPlay === true && autoContinue) {
          const lastVoice = localStorage.getItem('lastVoice') || 'vi-VN-HoaiMyNeural';
          handleGenerateTts(lastVoice);
        }
      })
      .finally(() => setAudioLoading(false));
  }, [chapter, autoContinue]); // Added autoContinue to deps, but excluded handleGenerateTts to prevent loops, we can just use the function directly or keep it in useCallback

  // Handle TTS generation
  const handleGenerateTts = useCallback(
    async (voice: string) => {
      if (!chapter) return;
      setTtsGenerating(true);

      // Save the selected voice to localStorage
      localStorage.setItem('lastVoice', voice);

      try {
        const res = await audioService.generateTts(chapter.id, voice);
        setAudioData(res.data);
        // Force autoPlay when user explicitly generates TTS
        window.history.replaceState({ ...window.history.state, usr: { autoPlay: true } }, '');
        toast.success('Tạo audio thành công!');
      } catch (err) {
        const error = err as AxiosError<ErrorResponse>;
        toast.error(error.response?.data?.message || 'Tạo audio thất bại, vui lòng thử lại');
      } finally {
        setTtsGenerating(false);
      }
    },
    [chapter]
  );

  // Handle auto-continue: navigate to next chapter and trigger TTS
  const currentIndex = allChapters.findIndex((c) => c.id === Number(id));
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const handleAudioEnded = useCallback(() => {
    if (autoContinue && nextChapter) {
      toast('⏭️ Chuyển chương tiếp theo...', { duration: 2000 });
      // Pass autoPlay state to the next page
      navigate(`/chapters/${nextChapter.id}`, { state: { autoPlay: true } });
    }
  }, [autoContinue, nextChapter, navigate]);

  const handleToggleAutoContinue = useCallback((value: boolean) => {
    if (value) {
      setShowAutoContinueConfirm(true);
    } else {
      setAutoContinue(false);
    }
  }, []);

  const handleNextChapter = useCallback(() => {
    if (nextChapter) {
      navigate(`/chapters/${nextChapter.id}`, { state: { autoPlay: true } });
    }
  }, [nextChapter, navigate]);

  const handlePreviousChapter = useCallback(() => {
    if (prevChapter) {
      navigate(`/chapters/${prevChapter.id}`, { state: { autoPlay: true } });
    }
  }, [prevChapter, navigate]);

  // Determine if we should autoPlay audio based on navigation state or generation success
  const shouldAutoPlay = window.history.state?.usr?.autoPlay === true;

  // ───── Loading state ─────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ───── Access Error states ─────
  if (accessError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <div className="rounded-2xl border border-white/10 bg-surface-light p-8 text-center">
          {accessError.type === 'UNAUTHORIZED' ? (
            <>
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
                <LogIn className="h-10 w-10 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Yêu cầu đăng nhập</h2>
              <p className="mt-2 text-sm text-text-secondary">{accessError.message}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl"
                >
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </Link>
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </button>
              </div>
            </>
          ) : accessError.type === 'VIP_REQUIRED' ? (
            <>
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                <Crown className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Nội dung VIP</h2>
              <p className="mt-2 text-sm text-text-secondary">{accessError.message}</p>
              <div className="mt-4 rounded-xl bg-accent/5 border border-accent/20 p-4">
                <p className="text-xs text-accent">
                  💡 Liên hệ Admin để nâng cấp tài khoản VIP và mở khóa toàn bộ nội dung độc quyền.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-xl"
                >
                  <Crown className="h-4 w-4" />
                  Nâng cấp VIP
                </Link>
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-10 w-10 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Đã xảy ra lỗi</h2>
              <p className="mt-2 text-sm text-text-secondary">{accessError.message}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ───── Chapter content ─────
  if (!chapter) return null;

  const ChapterNav = () => (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 justify-start">
        {prevChapter && (
          <Link
            to={`/chapters/${prevChapter.id}`}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Chương trước</span>
          </Link>
        )}
      </div>

      <div className="relative flex items-center justify-center">
        <select
          value={chapter.id}
          onChange={(e) => navigate(`/chapters/${e.target.value}`)}
          className="appearance-none rounded-xl border border-white/10 bg-surface px-8 py-2.5 text-sm text-text-secondary outline-none transition-colors hover:bg-white/5 hover:text-text-primary focus:border-primary/50"
        >
          {allChapters.map(c => (
            <option key={c.id} value={c.id} className="bg-gray-900 text-white">
              Chương {c.chapterNumber}
            </option>
          ))}
        </select>
        <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      </div>

      <div className="flex flex-1 justify-end">
        {nextChapter && (
          <Link
            to={`/chapters/${nextChapter.id}`}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <span className="hidden sm:inline">Chương sau</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="relative mb-6 text-center pt-8 sm:pt-0">
        <Link
          to={`/stories/${chapter.storyId}`}
          className="absolute left-0 top-0 flex items-center gap-2 rounded-xl border border-white/10 bg-surface-light px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary/50 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </Link>

        <Link
          to={`/stories/${chapter.storyId}`}
          className="inline-block text-sm text-text-secondary transition-colors hover:text-primary mt-2 sm:mt-0"
        >
          {chapter.storyTitle?.normalize('NFC')}
        </Link>
        <h1 className="mt-2 text-xl font-bold text-text-primary sm:text-2xl px-4 sm:px-24">
          Chương {chapter.chapterNumber}: {chapter.title?.normalize('NFC')}
        </h1>
      </div>

      {/* Audio Player */}
      {!audioLoading && (
        <div className="mb-6">
          <AudioPlayer
            audioUrl={audioData?.audioUrl ?? null}
            chapterTitle={`Chương ${chapter.chapterNumber}: ${chapter.title?.normalize('NFC')}`}
            isGenerating={ttsGenerating}
            onEnded={handleAudioEnded}
            onPrevious={prevChapter ? handlePreviousChapter : undefined}
            onNext={nextChapter ? handleNextChapter : undefined}
            onRequestTts={handleGenerateTts}
            autoContinue={autoContinue}
            onAutoContinueChange={handleToggleAutoContinue}
            autoPlay={shouldAutoPlay}
          />
        </div>
      )}

      {/* Chapter content */}
      <article className="my-8 rounded-2xl border border-white/10 bg-surface-light p-6 sm:p-8 lg:p-10">
        <div
          className="prose-chapter text-base leading-8 text-text-primary/90 whitespace-pre-line"
          style={{ fontSize: '17px', lineHeight: '1.9' }}
        >
          {chapter.content ? chapter.content.normalize('NFC') : 'Chương này chưa có nội dung.'}
        </div>
      </article>

      {/* Bottom navigation */}
      <ChapterNav />

      {/* Custom Confirm Modal for Auto-Continue */}
      {showAutoContinueConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="mb-2 text-lg font-bold text-text-primary">Bật nghe liên tục</h3>
            <p className="mb-6 text-sm leading-relaxed text-text-secondary">
              File âm thanh sẽ tự động lựa chọn loại giọng ở chapter trước nếu chưa có, bạn có đồng ý bật nghe liên tục không?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAutoContinueConfirm(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setAutoContinue(true);
                  setShowAutoContinueConfirm(false);
                }}
                className="rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
