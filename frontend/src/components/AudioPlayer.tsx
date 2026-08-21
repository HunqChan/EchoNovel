import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Repeat,
  Sparkles,
  Loader2,
  ChevronDown,
} from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string | null;
  chapterTitle: string;
  /** Is the TTS currently being generated? */
  isGenerating: boolean;
  /** Called when audio finishes playing (for auto-next) */
  onEnded?: () => void;
  /** Called when user wants to go to previous chapter */
  onPrevious?: () => void;
  /** Called when user wants to go to next chapter manually */
  onNext?: () => void;
  /** Called when user wants to generate TTS */
  onRequestTts?: (voice: string) => void;
  /** Auto-continue toggle */
  autoContinue: boolean;
  onAutoContinueChange: (value: boolean) => void;
  /** Whether to play automatically when audio URL is set */
  autoPlay?: boolean;
}

const VOICES = [
  { id: 'vi-VN-HoaiMyNeural', label: 'Nữ - Hoài My', shortLabel: 'Nữ' },
  { id: 'vi-VN-NamMinhNeural', label: 'Nam - Nam Minh', shortLabel: 'Nam' },
];

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({
  audioUrl,
  chapterTitle,
  isGenerating,
  onEnded,
  onPrevious,
  onNext,
  onRequestTts,
  autoContinue,
  onAutoContinueChange,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem('lastVoice') || VOICES[0].id;
  });
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Update time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEndedEvent = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEndedEvent);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEndedEvent);
    };
  }, [audioUrl, onEnded]);

  // Handle auto-play when audioUrl changes
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.playbackRate = playbackRate;
      if (autoPlay) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
      }
    }
  }, [audioUrl, autoPlay]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar) return;

    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const handleSpeedSelect = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ───── No audio: Show TTS button ─────
  if (!audioUrl) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-light p-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-text-primary">🎧 Nghe truyện</p>
            <p className="mt-0.5 text-xs text-text-secondary">
              Chương này chưa có audio. Hãy tạo audio để nghe!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice selector */}
            <div className="relative">
              <button
                onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-white/5"
              >
                {VOICES.find((v) => v.id === selectedVoice)?.shortLabel}
                <ChevronDown className="h-3 w-3" />
              </button>

              {showVoiceMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowVoiceMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-white/10 bg-surface-light py-1 shadow-xl">
                    {VOICES.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => {
                          setSelectedVoice(voice.id);
                          setShowVoiceMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
                          selectedVoice === voice.id ? 'text-primary font-medium' : 'text-text-secondary'
                        }`}
                      >
                        {voice.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={() => onRequestTts?.(selectedVoice)}
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Đang tạo audio...</span>
                  <span className="sm:hidden">Đang tạo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Tạo Audio
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ───── Has audio: Show player ─────
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-light p-4 sm:p-5">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Chapter info + auto continue */}
      <div className="mb-3 flex items-center justify-between">
        <p className="truncate text-sm font-medium text-text-primary">
          🎧 {chapterTitle}
        </p>
        <button
          onClick={() => onAutoContinueChange(!autoContinue)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
            autoContinue
              ? 'bg-primary/15 text-primary'
              : 'text-text-secondary hover:bg-white/5'
          }`}
          title="Tự động chuyển chương khi nghe xong"
        >
          <Repeat className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Tự động</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div
          ref={progressRef}
          onClick={seek}
          className="group relative h-1.5 cursor-pointer rounded-full bg-white/10 transition-all hover:h-2.5"
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-primary bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
            style={{ left: `calc(${progress}% - 7px)` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-text-secondary">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left: Volume */}
        <div className="flex flex-1 items-center gap-2 justify-start">
          <button
            onClick={toggleMute}
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={changeVolume}
            className="hidden w-20 accent-primary sm:block"
          />
        </div>

        {/* Center: Playback controls */}
        <div className="flex items-center gap-0.5 sm:gap-2">
          <button
            onClick={onPrevious || undefined}
            disabled={!onPrevious}
            className={`rounded-lg p-1.5 sm:p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary ${!onPrevious ? 'invisible pointer-events-none' : ''}`}
            title="Chương trước"
          >
            <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button
            onClick={() => skip(-10)}
            className="rounded-lg p-1.5 sm:p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            title="Lùi 10 giây"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button
            onClick={togglePlay}
            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 mx-1"
          >
            {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="ml-1 h-4 w-4 sm:h-5 sm:w-5" />}
          </button>

          <button
            onClick={() => skip(10)}
            className="rounded-lg p-1.5 sm:p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            title="Tiến 10 giây"
          >
            <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button
            onClick={onNext || undefined}
            disabled={!onNext}
            className={`rounded-lg p-1.5 sm:p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary ${!onNext ? 'invisible pointer-events-none' : ''}`}
            title="Chương tiếp"
          >
            <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Right: Speed control */}
        <div className="flex flex-1 items-center justify-end relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="flex h-7 w-10 sm:h-8 sm:w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs sm:text-sm font-medium text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
            title="Tốc độ phát"
          >
            {playbackRate}x
          </button>

          {showSpeedMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSpeedMenu(false)}
              />
              <div className="absolute bottom-full right-0 mb-2 w-16 rounded-xl border border-white/10 bg-surface-light py-1 shadow-xl z-20">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedSelect(rate)}
                    className={`w-full px-2 py-1.5 text-center text-sm transition-colors hover:bg-white/5 ${
                      playbackRate === rate ? 'text-primary font-medium' : 'text-text-secondary'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
