/**
 * Image Compression Utility
 * ------------------------------------
 * Comprime imagens automaticamente antes do upload,
 * mantendo qualidade visual e reduzindo tamanho.
 */

import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

/**
 * Comprime uma imagem mantendo qualidade visual
 * @param file - Arquivo de imagem original
 * @param options - Opções de compressão (opcional)
 * @returns Arquivo comprimido
 */
export async function compressImage(file: File, options?: CompressionOptions): Promise<File> {
  // Validação básica
  if (!file) {
    console.warn('⚠️ compressImage: Arquivo nulo ou indefinido recebido.');
    return file;
  }

  if (!(file instanceof Blob)) {
    console.error('❌ compressImage: O objeto passado não é um Blob/File válido:', file);
    return file;
  }

  const defaultOptions = {
    maxSizeMB: 2, // Máximo 2MB
    maxWidthOrHeight: 1920, // Full HD
    useWebWorker: true, // Não trava a UI
    quality: 0.85, // 85% de qualidade
    fileType: 'image/jpeg', // Converte para JPEG otimizado
    ...options,
  };

  try {
    // Log para diagnóstico (visível no console do navegador)
    console.log(
      `🔍 Tentando comprimir: "${file.name}" | Tipo: "${file.type}" | Tamanho: ${(file.size / 1024).toFixed(1)} KB`,
    );

    // Tenta identificar se é uma imagem pela extensão se o tipo for genérico
    const isGenericType = !file.type || file.type === 'application/octet-stream';
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isImageExtension = ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(extension || '');

    // Se o tipo MIME não for identificado ou não for imagem, mas a extensão for, tentaremos comprimir mesmo assim
    if (!file.type.startsWith('image/') && !isImageExtension) {
      console.warn(
        `⚠️ compressImage: O arquivo "${file.name}" não parece ser uma imagem válida. Ignorando compressão.`,
      );
      return file;
    }

    // Se for tipo genérico mas tem extensão de imagem, vamos forçar o tipo para que a biblioteca possa trabalhar
    if (isGenericType && isImageExtension) {
      console.log(
        `💡 Detectada extensão de imagem com tipo genérico. Forçando conversão para image/${extension === 'png' ? 'png' : 'jpeg'}`,
      );
      // A biblioteca imageCompression geralmente lida com isso se passarmos o fileType nas opções
    }

    const compressedFile = await imageCompression(file, defaultOptions);

    const originalSizeKB = (file.size / 1024).toFixed(0);
    const compressedSizeKB = (compressedFile.size / 1024).toFixed(0);
    const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(0);

    console.log(
      `✅📸 Compressão concluída: ${originalSizeKB}KB → ${compressedSizeKB}KB (${reduction}% menor)`,
    );

    return compressedFile;
  } catch (error) {
    console.error('❌ Erro durante compressão de imagem (retornando original):', error);
    // Em caso de erro (ex: format não suportado), retorna o arquivo original para não bloquear o fluxo
    return file;
  }
}
