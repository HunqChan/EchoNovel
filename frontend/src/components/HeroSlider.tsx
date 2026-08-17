import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { PlayCircle, Star, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import type { StoryResponse } from '../types';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroSliderProps {
  stories: StoryResponse[];
}

export default function HeroSlider({ stories }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!stories || stories.length === 0) return null;

  const activeStory = stories[activeIndex];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-surface shadow-2xl group flex flex-col sm:block h-[550px] sm:h-[450px] lg:h-[480px]">
      <style>{`
        .hero-pagination .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
          margin: 0 4px !important;
        }
        .hero-pagination .swiper-pagination-bullet-active {
          background: #6366f1;
          width: 24px;
          border-radius: 4px;
        }
        .hero-swiper-container .swiper-slide {
          background-position: center;
          background-size: cover;
        }
      `}</style>

      {/* Background Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 transition-all duration-1000 blur-xl scale-110"
        style={{ backgroundImage: `url(${activeStory?.coverImage || ''})` }}
      />
      
      {/* Gradients to blend background */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent sm:bg-gradient-to-r sm:from-surface sm:via-surface/70 sm:to-transparent" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col-reverse sm:flex-row h-full p-6 sm:p-10 gap-8 sm:gap-10 items-center">
        
        {/* Left: Info */}
        <div className="flex-1 flex flex-col justify-end sm:justify-center w-full relative z-20 pointer-events-none [&>*]:pointer-events-auto">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 w-full overflow-hidden">
            {activeStory?.genres?.map((g) => (
              <span key={g} className="whitespace-nowrap shrink-0 rounded bg-primary/20 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-primary backdrop-blur-sm border border-primary/20 uppercase tracking-wider">
                {g}
              </span>
            ))}
          </div>
          
          <Link to={`/stories/${activeStory?.id}`} className="hover:text-primary transition-colors inline-block max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white uppercase leading-tight mb-2 sm:mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] text-balance">
              {activeStory?.title}
            </h2>
          </Link>
          
          <div className="flex items-center gap-4 mb-3 sm:mb-4">
            <p className="text-sm text-primary-light font-medium flex items-center gap-2">
              <span className="w-6 h-[1px] bg-primary"></span>
              {activeStory?.authorName}
            </p>
            <span className="flex items-center gap-1 rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-yellow-500 backdrop-blur-sm border border-yellow-500/20">
              <Star className="h-3 w-3" fill="currentColor" /> 4.9
            </span>
          </div>

          <p className="text-sm sm:text-base text-gray-300 line-clamp-2 sm:line-clamp-3 max-w-2xl drop-shadow-md mb-6 sm:mb-8 leading-relaxed">
            {activeStory?.description || "Đang cập nhật nội dung cho truyện này. Đón xem những diễn biến hấp dẫn nhất..."}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              to={`/stories/${activeStory?.id}`}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-6 sm:px-8 py-3 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              <BookOpen className="h-5 w-5" />
              Đọc Ngay
            </Link>
            <Link
              to={`/stories/${activeStory?.id}`} // Links to story detail to listen audio
              className="flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/20 px-6 sm:px-8 py-3 text-sm font-bold text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <PlayCircle className="h-5 w-5" />
              Nghe Audio
            </Link>
          </div>
        </div>

        {/* Right: 3D Swiper Cover Flow */}
        <div className="w-full sm:w-[45%] md:w-[50%] flex items-center justify-center relative hero-swiper-container pt-8 sm:pt-0">
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={true}
            coverflowEffect={{
              rotate: 15,
              stretch: 0,
              depth: 250,
              modifier: 1.5,
              slideShadows: true,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              el: '.hero-pagination',
              clickable: true,
            }}
            navigation={{
              prevEl: '.hero-prev',
              nextEl: '.hero-next',
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
            className="w-full max-w-[200px] sm:max-w-[240px] aspect-[3/4] !overflow-visible"
          >
            {stories.map((story, index) => (
              <SwiperSlide key={`${story.id}-${index}`} className="w-full h-full rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.7)] bg-surface">
                {({ isActive }) => (
                  <div className="w-full h-full relative group/slide">
                    {story.coverImage ? (
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-60'}`}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                        <BookOpen className="h-16 w-16 text-white/30" />
                      </div>
                    )}
                    {/* Inner glow on active cover */}
                    {isActive && (
                      <div className="absolute inset-0 ring-2 ring-primary/60 ring-inset rounded-2xl shadow-[inset_0_0_30px_rgba(99,102,241,0.6)]" />
                    )}
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Navigation Arrows & Pagination Overlay */}
      <div className="absolute bottom-6 sm:bottom-8 right-0 left-0 sm:left-auto sm:right-10 flex items-center justify-center gap-4 z-20">
        <button className="hero-prev p-2 sm:p-2.5 rounded-full bg-black/40 text-white backdrop-blur hover:bg-primary transition-colors disabled:opacity-50 hover:scale-110 active:scale-95">
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <div className="hero-pagination flex gap-1 items-center justify-center" />
        <button className="hero-next p-2 sm:p-2.5 rounded-full bg-black/40 text-white backdrop-blur hover:bg-primary transition-colors disabled:opacity-50 hover:scale-110 active:scale-95">
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

    </div>
  );
}
