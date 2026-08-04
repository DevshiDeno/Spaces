import { useCallback, useRef, useState, type DragEvent } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadsService } from '@/services/uploads.service';
import { getErrorMessage } from '@/services/http';
import { cn } from '@/utils/cn';

interface ImageUploaderProps {
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  onUploaded: (urls: string[]) => void | Promise<void>;
  className?: string;
}

export function ImageUploader({
  folder,
  multiple = true,
  maxFiles = 8,
  onUploaded,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const list = Array.from(files).slice(0, maxFiles);

      setError(null);
      setIsUploading(true);
      setProgress({ done: 0, total: list.length });

      const uploaded: string[] = [];
      try {
        for (const file of list) {
          const url = await uploadsService.uploadImage(file, folder);
          uploaded.push(url);
          setProgress((p) => (p ? { ...p, done: p.done + 1 } : null));
        }
        if (uploaded.length > 0) {
          await onUploaded(uploaded);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsUploading(false);
        setProgress(null);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [folder, maxFiles, onUploaded]
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    void handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = () => setDragActive(false);

  return (
    <div className={className}>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
          isUploading && 'pointer-events-none opacity-70'
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm font-medium">
              Uploading {progress?.done ?? 0} / {progress?.total ?? 0}…
            </p>
          </>
        ) : (
          <>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <ImagePlus className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">Drag images here, or click to choose</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP, or AVIF · up to 8MB each</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              Choose files
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple={multiple}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <X className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
