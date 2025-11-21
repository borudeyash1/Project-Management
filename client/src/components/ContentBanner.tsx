import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getActiveBanners, ContentBanner as IBanner } from '../services/contentService';

interface ContentBannerProps {
  route: string;
}

const ContentBanner: React.FC<ContentBannerProps> = ({ route }) => {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [closedBanners, setClosedBanners] = useState<Set<string>>(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('closed_banners');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const valid = new Set<string>();

        // Filter out expired dismissals (older than 1 hour)
        Object.entries(parsed).forEach(([id, timestamp]: [string, any]) => {
          if (now - timestamp < 1 * 60 * 60 * 1000) {
            valid.add(id);
          }
        });
        return valid;
      } catch (e) {
        return new Set();
      }
    }
    return new Set();
  });

  useEffect(() => {
    loadBanners();
  }, [route]);

  const loadBanners = async () => {
    try {
      console.log('[ContentBanner] Loading banners for route:', route);
      const data = await getActiveBanners(route);
      console.log('[ContentBanner] Banners received:', data);
      setBanners(data);
    } catch (error) {
      console.error('[ContentBanner] Failed to load banners:', error);
    }
  };

  const handleClose = (bannerId: string) => {
    const newClosed = new Set(closedBanners).add(bannerId);
    setClosedBanners(newClosed);

    // Save to localStorage with timestamp
    const saved = localStorage.getItem('closed_banners');
    let parsed = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) { }
    }

    parsed = { ...parsed, [bannerId]: Date.now() };
    localStorage.setItem('closed_banners', JSON.stringify(parsed));
  };

  const visibleBanners = banners.filter(banner => !closedBanners.has(banner._id));

  // Separate banners by placement
  const topBanners = visibleBanners.filter(b => b.placement === 'top');
  const bottomBanners = visibleBanners.filter(b => b.placement === 'bottom');
  const customBanners = visibleBanners.filter(b => b.placement === 'custom');

  if (visibleBanners.length === 0) return null;

  const renderBanner = (banner: IBanner) => {
    const isCustom = banner.placement === 'custom';

    // Construct background style based on backgroundType
    const getBackgroundStyle = () => {
      const bgType = banner.backgroundType || 'solid';

      switch (bgType) {
        case 'gradient':
          if (banner.gradientStart && banner.gradientEnd) {
            return {
              background: `linear-gradient(${banner.gradientDirection || 'to right'}, ${banner.gradientStart}, ${banner.gradientEnd})`
            };
          }
          return { backgroundColor: banner.backgroundColor };

        case 'transparent':
          return { background: 'transparent' };

        case 'image':
          // Image backgrounds would use imageUrl as background-image
          if (banner.imageUrl) {
            return {
              backgroundImage: `url(${banner.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            };
          }
          return { backgroundColor: banner.backgroundColor };

        case 'solid':
        default:
          return { backgroundColor: banner.backgroundColor };
      }
    };

    return (
      <div
        key={banner._id}
        className={`w-full left-0 ${isCustom ? '' : banner.placement === 'top' ? 'top-0' : 'bottom-0'
          } z-50 backdrop-blur-md bg-opacity-90 shadow-lg border-b border-white/10`}
        style={{
          ...getBackgroundStyle(),
          color: banner.textColor,
          height: `${banner.height}px`,
          position: isCustom ? 'absolute' : 'fixed',
          borderRadius: banner.borderRadius ? `${banner.borderRadius}px` : '0px',
          fontFamily: banner.fontFamily || 'Inter, sans-serif',
          // Custom placement coordinates
          ...(isCustom && banner.customX !== undefined && { left: `${banner.customX}px` }),
          ...(isCustom && banner.customY !== undefined && { top: `${banner.customY}px` }),
          ...(isCustom && banner.customWidth && { width: `${banner.customWidth}px` }),
        }}
      >
        <div
          className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4"
          style={{
            padding: banner.padding ? `0 ${banner.padding}px` : '0 16px',
          }}
        >
          {/* Content */}
          <div className="flex-1 flex items-center justify-center gap-4">
            {/* Image */}
            {(banner.type === 'image' || banner.type === 'both') && banner.imageUrl && (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="h-full w-auto object-contain"
                style={{
                  maxHeight: `${banner.height * 0.8}px`,
                  height: banner.imageHeight ? `${banner.imageHeight}px` : 'auto',
                  width: banner.imageWidth ? `${banner.imageWidth}px` : 'auto',
                }}
              />
            )}

            {/* Text */}
            {(banner.type === 'text' || banner.type === 'both') && (
              <div className="text-center sm:text-left">
                <p
                  className="drop-shadow-sm"
                  style={{
                    fontSize: banner.fontSize ? `${banner.fontSize}px` : '16px',
                    fontWeight: banner.fontWeight || 700,
                  }}
                >
                  {banner.content}
                </p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={() => handleClose(banner._id)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0 backdrop-blur-sm"
            aria-label="Close banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Top Banners */}
      {topBanners.map(renderBanner)}

      {/* Bottom Banners */}
      {bottomBanners.map(renderBanner)}

      {/* Custom Positioned Banners */}
      {customBanners.map(renderBanner)}
    </>
  );
};

export default ContentBanner;
