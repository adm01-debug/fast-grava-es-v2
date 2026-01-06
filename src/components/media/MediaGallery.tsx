import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Share2,
  Maximize2,
  Grid3X3,
  LayoutGrid,
  Image as ImageIcon,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  thumbnail?: string;
  alt?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  duration?: number;
  tags?: string[];
}

interface MediaGalleryProps {
  items: MediaItem[];
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: number;
  aspectRatio?: 'square' | 'video' | 'auto';
  showInfo?: boolean;
  enableLightbox?: boolean;
  enableDownload?: boolean;
  enableShare?: boolean;
  onItemClick?: (item: MediaItem, index: number) => void;
  className?: string;
}

// Thumbnail Component
function MediaThumbnail({
  item,
  aspectRatio = 'square',
  showInfo = false,
  onClick,
  className,
}: {
  item: MediaItem;
  aspectRatio?: 'square' | 'video' | 'auto';
  showInfo?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative group cursor-pointer overflow-hidden rounded-lg bg-muted',
        aspectClasses[aspectRatio],
        className
      )}
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      ) : item.type === 'image' ? (
        <img
          src={item.thumbnail || item.src}
          alt={item.alt || item.title || ''}
          className={cn(
            'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
            isLoading && 'opacity-0'
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />
      ) : (
        <>
          <img
            src={item.thumbnail || item.src}
            alt={item.alt || item.title || ''}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
              isLoading && 'opacity-0'
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError(true);
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </div>
          {item.duration && (
            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
              {formatDuration(item.duration)}
            </Badge>
          )}
        </>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

      {/* Info overlay */}
      {showInfo && (item.title || item.tags) && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {item.title && (
            <p className="text-white text-sm font-medium truncate">{item.title}</p>
          )}
          {item.tags && (
            <div className="flex gap-1 mt-1">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-white/20 text-white">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Type indicator */}
      {item.type === 'video' && (
        <div className="absolute top-2 left-2">
          <Video className="w-4 h-4 text-white drop-shadow-lg" />
        </div>
      )}
    </motion.div>
  );
}

// Lightbox Component
function Lightbox({
  items,
  initialIndex = 0,
  open,
  onOpenChange,
  enableDownload = true,
  enableShare = true,
}: {
  items: MediaItem[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enableDownload?: boolean;
  enableShare?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentItem = items[currentIndex];
  const isVideo = currentItem?.type === 'video';

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setRotation(0);
  }, [initialIndex, open]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setZoom(1);
    setRotation(0);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setZoom(1);
    setRotation(0);
  }, [items.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'Escape') onOpenChange(false);
    if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 3));
    if (e.key === '-') setZoom((z) => Math.max(z - 0.25, 0.5));
  }, [open, goNext, goPrev, onOpenChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentItem.src;
    link.download = currentItem.title || `media-${currentIndex}`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: currentItem.title,
        url: currentItem.src,
      });
    } else {
      await navigator.clipboard.writeText(currentItem.src);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!currentItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm">
              {currentIndex + 1} / {items.length}
            </span>
            {currentItem.title && (
              <span className="text-sm font-medium ml-4">{currentItem.title}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="w-5 h-5" />
            </Button>
            {!isVideo && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                >
                  <ZoomIn className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                >
                  <ZoomOut className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setRotation((r) => r + 90)}
                >
                  <RotateCw className="w-5 h-5" />
                </Button>
              </>
            )}
            {enableDownload && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleDownload}
              >
                <Download className="w-5 h-5" />
              </Button>
            )}
            {enableShare && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-full max-h-full"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
              }}
            >
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={currentItem.src}
                  className="max-w-full max-h-[80vh] object-contain"
                  controls={false}
                  muted={isMuted}
                  loop
                  onClick={togglePlayPause}
                />
              ) : (
                <img
                  src={currentItem.src}
                  alt={currentItem.alt || currentItem.title || ''}
                  className="max-w-full max-h-[80vh] object-contain"
                  draggable={false}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Video controls */}
          {isVideo && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 w-8 h-8"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 w-8 h-8"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          )}

          {/* Navigation arrows */}
          {items.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/20 w-12 h-12"
                onClick={goPrev}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/20 w-12 h-12"
                onClick={goNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}
        </div>

        {/* Info panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="absolute top-16 right-4 w-72 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white"
            >
              <h4 className="font-medium mb-2">{currentItem.title || 'Sem título'}</h4>
              {currentItem.description && (
                <p className="text-sm text-white/70 mb-3">{currentItem.description}</p>
              )}
              {currentItem.width && currentItem.height && (
                <p className="text-xs text-white/50">
                  Dimensões: {currentItem.width} x {currentItem.height}
                </p>
              )}
              {currentItem.tags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {currentItem.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thumbnails strip */}
        {items.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <ScrollArea className="w-full">
              <div className="flex gap-2 justify-center">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentIndex(index);
                      setZoom(1);
                      setRotation(0);
                    }}
                    className={cn(
                      'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0',
                      index === currentIndex
                        ? 'border-white scale-110'
                        : 'border-transparent opacity-50 hover:opacity-100'
                    )}
                  >
                    <img
                      src={item.thumbnail || item.src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Main Gallery Component
export function MediaGallery({
  items,
  layout = 'grid',
  columns = 4,
  gap = 4,
  aspectRatio = 'square',
  showInfo = false,
  enableLightbox = true,
  enableDownload = true,
  enableShare = true,
  onItemClick,
  className,
}: MediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentLayout, setCurrentLayout] = useState(layout);

  const handleItemClick = (item: MediaItem, index: number) => {
    if (onItemClick) {
      onItemClick(item, index);
    } else if (enableLightbox) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div className={className}>
      {/* Layout switcher */}
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant={currentLayout === 'grid' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setCurrentLayout('grid')}
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
        <Button
          variant={currentLayout === 'masonry' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setCurrentLayout('masonry')}
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
      </div>

      {/* Grid layout */}
      {currentLayout === 'grid' && (
        <div className={cn('grid', columnClasses[columns], gapClasses[gap as 2 | 4 | 6 | 8])}>
          {items.map((item, index) => (
            <MediaThumbnail
              key={item.id}
              item={item}
              aspectRatio={aspectRatio}
              showInfo={showInfo}
              onClick={() => handleItemClick(item, index)}
            />
          ))}
        </div>
      )}

      {/* Masonry layout */}
      {currentLayout === 'masonry' && (
        <div className={cn('columns-2 sm:columns-3 lg:columns-4', gapClasses[gap as 2 | 4 | 6 | 8])}>
          {items.map((item, index) => (
            <div key={item.id} className="mb-4 break-inside-avoid">
              <MediaThumbnail
                item={item}
                aspectRatio="auto"
                showInfo={showInfo}
                onClick={() => handleItemClick(item, index)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Carousel layout */}
      {currentLayout === 'carousel' && (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {items.map((item, index) => (
              <MediaThumbnail
                key={item.id}
                item={item}
                aspectRatio={aspectRatio}
                showInfo={showInfo}
                onClick={() => handleItemClick(item, index)}
                className="w-64 flex-shrink-0"
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Lightbox */}
      {enableLightbox && (
        <Lightbox
          items={items}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          enableDownload={enableDownload}
          enableShare={enableShare}
        />
      )}
    </div>
  );
}

// Exports
export { Lightbox, MediaThumbnail };
export type { MediaItem, MediaGalleryProps };
