import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getActiveBanners, ContentBanner as IBanner } from '../services/contentService';

interface ContentBannerProps {
  route: string;
}

const ContentBanner: React.FC<ContentBannerProps> = ({ route }) => {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [closedBanners, setClosedBanners] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadBanners();
  }, [route]);

  const loadBanners = async () => {
    try {
      const data = await getActiveBanners(route);
      setBanners(data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    }
  };

  const handleClose = (bannerId: string) => {
    setClosedBanners(prev => new Set(prev).add(bannerId));
  };

  const visibleBanners = banners.filter(banner => !closedBanners.has(banner._id));

  if (visibleBanners.length === 0) return null;

  return (
    <>
      {visibleBanners.map((banner) => (
        <div
          key={banner._id}
          className={`w-full ${banner.placement === 'top' ? 'top-0' : 'bottom-0'} left-0 z-50 animate-slideDown`}
          style={{
            backgroundColor: banner.backgroundColor,
            color: banner.textColor,
            height: `${banner.height}px`
          }}
        >
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
            {/* Content */}
            <div className="flex-1 flex items-center justify-center gap-4">
              {/* Image */}
              {(banner.type === 'image' || banner.type === 'both') && banner.imageUrl && (
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-full max-h-[80%] w-auto object-contain"
                  style={{ maxHeight: `${banner.height * 0.8}px` }}
                />
              )}

              {/* Text */}
              {(banner.type === 'text' || banner.type === 'both') && (
                <div className="text-center sm:text-left">
                  <p className="font-bold text-sm sm:text-base md:text-lg">
                    {banner.content}
                  </p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => handleClose(banner._id)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
              aria-label="Close banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default ContentBanner;
