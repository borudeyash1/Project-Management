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
      console.log('[ContentBanner] Loading banners for route:', route);
      const data = await getActiveBanners(route);
      console.log('[ContentBanner] Banners received:', data);
      setBanners(data);
    } catch (error) {
      console.error('[ContentBanner] Failed to load banners:', error);
    }
  };

  const handleClose = (bannerId: string) => {
    setClosedBanners(prev => new Set(prev).add(bannerId));
  };

  const visibleBanners = banners.filter(banner => !closedBanners.has(banner._id));

  // Separate banners by placement
  const topBanners = visibleBanners.filter(b => b.placement === 'top');
  const bottomBanners = visibleBanners.filter(b => b.placement === 'bottom');

  if (visibleBanners.length === 0) return null;

  const renderBanner = (banner: IBanner) => (
    <div
      key={banner._id}
      className={`w-full left-0 ${banner.placement === 'top' ? 'top-0' : 'bottom-0'
        } z-50 backdrop-blur-md bg-opacity-90 shadow-lg border-b border-white/10`}
      style={{
        backgroundColor: banner.backgroundColor,
        color: banner.textColor,
        height: `${banner.height}px`,
        position: 'fixed',
        borderRadius: banner.borderRadius ? `${banner.borderRadius}px` : '0px',
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

  return (
    <>
      {/* Top Banners */}
      {topBanners.map(renderBanner)}

      {/* Bottom Banners */}
      {bottomBanners.map(renderBanner)}
    </>
  );
};

export default ContentBanner;
