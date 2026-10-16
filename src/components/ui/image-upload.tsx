/**
 * ImageUpload Component
 * ------------------------------------
 * Componente reutilizável para upload de imagens: clique para escolher ou
 * arraste os arquivos para o campo.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn, normalizeImageUrl, getErrorMessage } from '@/lib/utils';
import { Loading } from './loading';
import { notify } from '@/components/ui/notify';

interface ImageUploadProps {
  onUpload: (file: File, previewUrl: string) => Promise<void>;
  onRemove?: (url: string) => void;
  existingImages?: string[];
  maxImages?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Padrão estável: um `[]` novo a cada render dispararia o efeito que copia
 * `existingImages` para o estado, e o componente renderizaria sem parar.
 */
const NO_IMAGES: string[] = [];

/** O que está sendo arrastado tem arquivos (e não, por exemplo, um texto selecionado). */
function isFileDrag(e: { dataTransfer: DataTransfer | null }) {
  return Array.from(e.dataTransfer?.types ?? []).includes('Files');
}

export function ImageUpload({
  onUpload,
  onRemove,
  existingImages = NO_IMAGES,
  maxImages = 10,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(existingImages);
  const [dragging, setDragging] = useState(false);
  // dragenter/dragleave disparam também ao passar pelos filhos: conta a
  // profundidade para o destaque não piscar.
  const dragDepth = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAdd = !disabled && !uploading && previews.length < maxImages;

  useEffect(() => {
    setPreviews(existingImages);
  }, [existingImages]);

  useEffect(() => {
    // Imagem solta fora do campo: sem isto o navegador abre o arquivo na
    // aba e o formulário em edição se perde.
    function preventFileDrop(e: DragEvent) {
      if (isFileDrag(e)) e.preventDefault();
    }
    window.addEventListener('dragover', preventFileDrop);
    window.addEventListener('drop', preventFileDrop);
    return () => {
      window.removeEventListener('dragover', preventFileDrop);
      window.removeEventListener('drop', preventFileDrop);
    };
  }, []);

  async function addFiles(selected: File[]) {
    if (selected.length === 0) return;

    const files = selected.filter((f) => f.type.startsWith('image/'));
    const ignored = selected.length - files.length;
    if (files.length === 0) {
      notify.error('Só dá para adicionar imagens (JPG, PNG, WEBP...).');
      return;
    }

    if (previews.length + files.length > maxImages) {
      notify.error(`Você pode adicionar no máximo ${maxImages} imagens`);
      return;
    }

    if (ignored > 0) {
      notify.error(`${ignored} arquivo(s) ignorado(s): não são imagens.`);
    }

    setUploading(true);

    try {
      for (const file of files) {
        // Cria preview temporário
        const previewUrl = URL.createObjectURL(file);
        setPreviews((prev) => [...prev, previewUrl]);

        // Faz upload e chama callback
        await onUpload(file, previewUrl);
      }
    } catch (err: unknown) {
      console.error('Erro ao fazer upload:', err);
      notify.error(getErrorMessage(err, 'Erro ao fazer upload da imagem'));
      // Remove previews em caso de erro
      setPreviews((prev) => prev.slice(0, prev.length - files.length));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    void addFiles(Array.from(e.target.files ?? []));
  };

  function handleDragEnter(e: React.DragEvent) {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragDepth.current += 1;
    if (canAdd) setDragging(true);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = canAdd ? 'copy' : 'none';
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!isFileDrag(e)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (!canAdd) return;
    void addFiles(Array.from(e.dataTransfer.files));
  }

  const handleRemove = (index: number, url: string) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    onRemove?.(url);
  };

  return (
    <div
      className={cn('relative space-y-4 rounded-lg', className)}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-[var(--lumilee-gold)] bg-white/85">
          <span className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <Upload className="h-5 w-5 text-[var(--lumilee-gold)]" />
            Solte as imagens aqui
          </span>
        </div>
      )}

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
              'w-24 h-24 border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--lumilee-gold)] transition',
              uploading && 'opacity-50 cursor-not-allowed',
            )}
          >
            {uploading ? (
              <Loading size="sm" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-zinc-400" />
                <span className="text-xs text-zinc-500 mt-1">Adicionar</span>
                <span className="text-[10px] text-zinc-400">ou arraste</span>
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
          <p className="text-sm text-zinc-500 mb-2">
            {disabled ? 'Nenhuma imagem adicionada' : 'Arraste as imagens para cá ou'}
          </p>
          {!disabled && (
            <label className="inline-block px-4 py-2 bg-[var(--lumilee-gold)] text-white rounded-lg hover:opacity-90 transition cursor-pointer">
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
