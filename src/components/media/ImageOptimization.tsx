import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy image with loading state
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  blur?: boolean;
  onLoadComplete?: () => void;
}

export function LazyImage({
  src,
  alt,
  className,
  fallback,
  aspectRatio = 'auto',
  blur = true,
  onLoadComplete,
  ...props
}: LazyImageProps) {
  const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  }[aspectRatio];

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatioClass,
        className
      )}
    >
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground"
          >
            {fallback || (
              <>
                <ImageOff className="h-8 w-8 mb-2" />
                <span className="text-xs">Erro ao carregar</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isInView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: status === 'loaded' ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <img
            src={src}
            alt={alt}
            onLoad={() => {
              setStatus('loaded');
              onLoadComplete?.();
            }}
            onError={() => setStatus('error')}
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              status !== 'loaded' && 'invisible',
              blur && status === 'loaded' ? '' : blur ? 'blur-sm' : ''
            )}
            {...props}
          />
        </motion.div>
      )}
    </div>
  );
}

// Avatar with fallback
interface AvatarImageProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarImage({ src, alt, name, size = 'md', className }: AvatarImageProps) {
  const [error, setError] = React.useState(false);

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (!src || error) {
    return (
      <div
        className={cn(
          "rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium",
          sizeClasses[size],
          className
        )}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name || 'Avatar'}
      onError={() => setError(true)}
      className={cn("rounded-full object-cover", sizeClasses[size], className)}
    />
  );
}

// Image gallery with lightbox
interface ImageGalleryProps {
  images: { src: string; alt?: string; caption?: string }[];
  columns?: 2 | 3 | 4;
  gap?: 2 | 4 | 6;
  className?: string;
}

export function ImageGallery({ images, columns = 3, gap = 4, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const columnClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns];

  const gapClass = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
  }[gap];

  return (
    <>
      <div className={cn(`grid ${columnClass} ${gapClass}`, className)}>
        {images.map((image, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedIndex(index)}
            className="overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <LazyImage
              src={image.src}
              alt={image.alt || `Image ${index + 1}`}
              aspectRatio="square"
              className="w-full"
            />
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {images[selectedIndex].caption && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 text-white text-center max-w-lg"
              >
                {images[selectedIndex].caption}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Optimized background image
interface BackgroundImageProps {
  src: string;
  alt?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  children?: React.ReactNode;
  className?: string;
}

export function BackgroundImage({
  src,
  alt = '',
  overlay = true,
  overlayOpacity = 0.5,
  children,
  className,
}: BackgroundImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <LazyImage
        src={src}
        alt={alt}
        blur
        className="absolute inset-0 w-full h-full object-cover"
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-background"
          style={{ opacity: overlayOpacity }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
