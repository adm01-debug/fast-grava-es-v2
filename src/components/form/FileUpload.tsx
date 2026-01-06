import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, File, Image, FileText, Film, Music, Archive, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/number-utils';

interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void> | void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  dragDropText?: string;
  uploadText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = '*/*',
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  disabled = false,
  className = '',
  showPreview = true,
  dragDropText = 'Arraste e solte arquivos aqui',
  uploadText = 'ou clique para selecionar',
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Film;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    if (type.includes('zip') || type.includes('rar')) return Archive;
    return File;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Arquivo muito grande. Máximo: ${formatBytes(maxSize)}`;
    }
    return null;
  };

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: FileWithPreview[] = [];
    const remaining = maxFiles - files.length;

    for (let i = 0; i < Math.min(fileList.length, remaining); i++) {
      const file = fileList[i] as FileWithPreview;
      const error = validateFile(file);

      file.status = error ? 'error' : 'pending';
      file.error = error || undefined;
      file.progress = 0;

      // Create preview for images
      if (file.type.startsWith('image/') && !error) {
        file.preview = URL.createObjectURL(file);
      }

      newFiles.push(file);
    }

    setFiles((prev) => [...prev, ...newFiles]);
  }, [files.length, maxFiles, maxSize]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) processFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadFiles = async () => {
    const validFiles = files.filter((f) => f.status === 'pending');
    if (validFiles.length === 0) return;

    setIsUploading(true);

    // Update status to uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'pending' ? { ...f, status: 'uploading' as const } : f
      )
    );

    try {
      await onUpload(validFiles);
      
      // Update status to success
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading' ? { ...f, status: 'success' as const, progress: 100 } : f
        )
      );
    } catch {
      // Update status to error
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading'
            ? { ...f, status: 'error' as const, error: 'Erro ao enviar' }
            : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8',
          'flex flex-col items-center justify-center gap-2',
          'cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Upload
          className={cn(
            'h-10 w-10 transition-colors',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )}
        />
        <p className="text-sm text-muted-foreground text-center">
          {dragDropText}
        </p>
        <p className="text-xs text-muted-foreground">
          {uploadText}
        </p>
        <p className="text-xs text-muted-foreground">
          Máximo: {formatBytes(maxSize)} por arquivo
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const Icon = getFileIcon(file.type);

            return (
              <div
                key={`${file.name}-${index}`}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  file.status === 'error' && 'border-destructive bg-destructive/5',
                  file.status === 'success' && 'border-green-500 bg-green-500/5'
                )}
              >
                {/* Preview or icon */}
                {showPreview && file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <Icon className="h-10 w-10 text-muted-foreground" />
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </p>
                  {file.error && (
                    <p className="text-xs text-destructive">{file.error}</p>
                  )}
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1 mt-1" />
                  )}
                </div>

                {/* Status indicator */}
                {file.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
                {file.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}

                {/* Remove button */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  disabled={file.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={clearAll} disabled={isUploading}>
            Limpar tudo
          </Button>
          <Button onClick={uploadFiles} disabled={isUploading || pendingCount === 0}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar ({pendingCount})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// Simple image upload with preview
interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
  aspectRatio?: 'square' | 'video' | 'banner';
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUpload,
  aspectRatio = 'square',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn('relative', aspectClasses[aspectRatio], className)}>
      {value ? (
        <div className="relative h-full">
          <img
            src={value}
            alt="Upload"
            className="h-full w-full rounded-lg object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              Trocar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onChange(null)}
            >
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={cn(
            'h-full w-full border-2 border-dashed rounded-lg',
            'flex flex-col items-center justify-center gap-2 cursor-pointer',
            'hover:border-primary/50 transition-colors'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Image className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Clique para enviar</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
};
