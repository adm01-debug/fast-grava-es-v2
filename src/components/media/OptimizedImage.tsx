import * as React from 'react';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

// ============================================================================
// OPTIMIZED IMAGE COMPONENT
// ============================================================================

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | '3:4' | '9:16' | 'auto';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  lazy?: boolean;
  priority?: boolean;
  placeholder?: 'blur' | 'shimmer' | 'color' | 'none';
  placeholderColor?: string;
  blurDataUrl?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  sizes?: string;
  srcSet?: string;
  className?: string;
  containerClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  aspectRatio = 'auto',
  objectFit = 'cover',
  objectPosition = 'center',
  lazy = true,
  priority = false,
  placeholder = 'shimmer',
  placeholderColor = 'hsl(var(--muted))',
  blurDataUrl,
  fallbackSrc,
  onLoad,
  onError,
  className,
  containerClassName,
  sizes,
  srcSet,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Reset state when src changes
  React.useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  // Check if image is already cached
  React.useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
    onError?.();
  };

  const aspectRatioMap: Record<string, string> = {
    '1:1': '100%',
    '4:3': '75%',
    '16:9': '56.25%',
    '21:9': '42.86%',
    '3:4': '133.33%',
    '9:16': '177.78%',
    'auto': 'auto',
  };

  const paddingBottom = aspectRatio !== 'auto' ? aspectRatioMap[aspectRatio] : undefined;

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : undefined,
        paddingBottom: !height ? paddingBottom : undefined,
      }}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && placeholder !== 'none' && (
        <div
          className={cn(
            'absolute inset-0 z-10',
            placeholder === 'shimmer' && 'animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]',
            placeholder === 'blur' && 'backdrop-blur-sm',
            placeholder === 'color' && 'bg-muted'
          )}
          style={{
            backgroundColor: placeholder === 'color' ? placeholderColor : undefined,
            backgroundImage: blurDataUrl ? `url(${blurDataUrl})` : undefined,
            backgroundSize: 'cover',
          }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center text-muted-foreground">
            <ImageOff className="h-8 w-8 mb-2" />
            <span className="text-sm">Imagem indisponível</span>
          </div>
        </div>
      )}

      {/* Image */}
      {!hasError && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : lazy ? 'lazy' : undefined}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          sizes={sizes}
          srcSet={srcSet}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'absolute inset-0 w-full h-full transition-opacity duration-300',
            !isLoaded && 'opacity-0',
            isLoaded && 'opacity-100',
            className
          )}
          style={{
            objectFit,
            objectPosition,
          }}
          {...props}
        />
      )}
    </div>
  );
}

// ============================================================================
// RESPONSIVE IMAGE
// ============================================================================

interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'srcSet' | 'sizes'> {
  sources: {
    src: string;
    minWidth?: number;
    maxWidth?: number;
    media?: string;
    type?: string;
  }[];
  defaultSrc: string;
}

export function ResponsiveImage({
  sources,
  defaultSrc,
  alt,
  ...props
}: ResponsiveImageProps) {
  return (
    <picture>
      {sources.map((source, index) => {
        const media = source.media || 
          (source.minWidth && source.maxWidth 
            ? `(min-width: ${source.minWidth}px) and (max-width: ${source.maxWidth}px)`
            : source.minWidth 
              ? `(min-width: ${source.minWidth}px)` 
              : source.maxWidth 
                ? `(max-width: ${source.maxWidth}px)` 
                : undefined);

        return (
          <source
            key={index}
            srcSet={source.src}
            media={media}
            type={source.type}
          />
        );
      })}
      <OptimizedImage src={defaultSrc} alt={alt} {...props} />
    </picture>
  );
}

// ============================================================================
// IMAGE GALLERY
// ============================================================================

interface ImageGalleryProps {
  images: {
    src: string;
    alt: string;
    thumbnail?: string;
    caption?: string;
  }[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: number;
  aspectRatio?: OptimizedImageProps['aspectRatio'];
  className?: string;
  onImageClick?: (index: number) => void;
  lightbox?: boolean;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 4,
  aspectRatio = '1:1',
  className,
  onImageClick,
  lightbox = true,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const handleClick = (index: number) => {
    if (lightbox) {
      setSelectedIndex(index);
    }
    onImageClick?.(index);
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  return (
    <>
      <div
        className={cn('grid', className)}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap * 4}px`,
        }}
      >
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="group relative overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <OptimizedImage
              src={image.thumbnail || image.src}
              alt={image.alt}
              aspectRatio={aspectRatio}
              className="transition-transform duration-300 group-hover:scale-105"
            />
            {image.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm text-white truncate">{image.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={handleClose}
        >
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 p-2 text-white/80 hover:text-white"
          >
            ‹
          </button>
          
          <div className="max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {images[selectedIndex].caption && (
              <p className="text-center text-white mt-4">{images[selectedIndex].caption}</p>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 p-2 text-white/80 hover:text-white"
          >
            ›
          </button>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
          >
            ✕
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// AVATAR IMAGE
// ============================================================================

interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 96,
};

export function AvatarImage({
  src,
  alt,
  size = 'md',
  fallback,
  className,
  status,
}: AvatarImageProps) {
  const [hasError, setHasError] = React.useState(false);
  const dimension = sizeMap[size];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-muted overflow-hidden',
        className
      )}
      style={{ width: dimension, height: dimension }}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span
          className="font-medium text-muted-foreground"
          style={{ fontSize: dimension * 0.4 }}
        >
          {fallback || getInitials(alt)}
        </span>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            statusColors[status]
          )}
          style={{
            width: dimension * 0.25,
            height: dimension * 0.25,
          }}
        />
      )}
    </div>
  );
}
