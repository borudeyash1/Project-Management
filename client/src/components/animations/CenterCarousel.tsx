import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ClassNames from 'embla-carousel-class-names';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CenterCarouselProps {
  children: React.ReactNode;
  options?: any;
  autoplay?: boolean;
  className?: string;
}

const CenterCarousel: React.FC<CenterCarouselProps> = ({ 
  children, 
  options = { loop: true, align: 'center' }, 
  autoplay = false,
  className = ''
}) => {
  const plugins = [ClassNames()];
  if (autoplay) {
    plugins.push(Autoplay({ delay: 4000, stopOnInteraction: false }));
  }

  const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y -ml-4">
          {React.Children.map(children, (child) => (
            <div className="flex-[0_0_85%] min-w-0 pl-4 md:flex-[0_0_45%] lg:flex-[0_0_30%] relative">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-800 hover:bg-white hover:scale-110 transition-all z-10 hidden md:flex"
        onClick={scrollPrev}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-800 hover:bg-white hover:scale-110 transition-all z-10 hidden md:flex"
        onClick={scrollNext}
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? 'bg-[#44a0d1] w-8' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default CenterCarousel;
