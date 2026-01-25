/**
 * ImageUpload Component
 * ------------------------------------
 * Componente reutilizável para upload de imagens.
 */

'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn, normalizeImageUrl } from '@/lib/utils';
import { Loading } from './loading';
import { useEffect } from 'react';


interface ImageUploadProps {
  onUpload: (file: File, previewUrl: string) => Promise<void>;
  onRemove?: (url: string) => void;
  existingImages?: string[];
  maxImages?: number;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onUpload,
  onRemove,
  existingImages = [],
  maxImages = 10,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviews(existingImages);
  }, [existingImages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (previews.length + files.length > maxImages) {
      alert(`Você pode adicionar no máximo ${maxImages} imagens`);
      return;
    }

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Cria preview temporário
        const previewUrl = URL.createObjectURL(file);
        setPreviews((prev) => [...prev, previewUrl]);

        // Faz upload e chama callback
        await onUpload(file, previewUrl);
      }
    } catch (err: unknown) {
      console.error('Erro ao fazer upload:', err);
      const message = err instanceof Error ? err.message : 'Erro ao fazer upload da imagem';
      alert(message);
      // Remove previews em caso de erro
      setPreviews((prev) => prev.slice(0, prev.length - files.length));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number, url: string) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    onRemove?.(url);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-4 flex-wrap">
        {previews.map((url, index) => (
          <div key={index} className="relative group">
            <div className="relative w-24 h-24">
              <img
                src={normalizeImageUrl(url)}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-zinc-200"
              />
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index, url)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {previews.length > 0 && previews.length < maxImages && !disabled && (
          <label
            className={cn(
              'w-24 h-24 border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[var(--lumike-gold)] transition',
              uploading && 'opacity-50 cursor-not-allowed',
            )}
          >
            {uploading ? (
              <Loading size="sm" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-zinc-400" />
                <span className="text-xs text-zinc-500 mt-1">Adicionar</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {previews.length === 0 && !uploading && (
        <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm text-zinc-500 mb-2">Nenhuma imagem adicionada</p>
          {!disabled && (
            <label className="inline-block px-4 py-2 bg-[var(--lumike-gold)] text-white rounded-lg hover:opacity-90 transition cursor-pointer">
              Selecionar Imagens
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

