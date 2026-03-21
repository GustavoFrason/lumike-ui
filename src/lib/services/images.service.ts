/**
 * Images Service
 * --------------------
 * Serviço para upload e gestão de imagens no Supabase Storage.
 */

import { supabase } from '../supabase';
import { api } from '../api';
import { compressImage } from '../utils/image-compression';

const BUCKET_NAME = 'produtos';

export interface ProductImage {
  id: string;
  produto_id: number;
  url: string;
  ordem: number;
  created_at: string;
}

export const imagesService = {
  /**
   * Faz upload de uma imagem para o Supabase Storage
   */
  async uploadImage(productId: number, file: File): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
    }

    // Comprimir a imagem antes do upload
    console.log('🔄 Comprimindo imagem...');
    const compressedFile = await compressImage(file);

    const fileExt = compressedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${productId}/${Date.now()}.${fileExt}`;

    // Mapeamento de extensões para MIME types comuns
    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      gif: 'image/gif',
    };

    // Determina o contentType final:
    // Prioridade 1: Mapeamento pela extensão (mais confiável em Windows)
    // Prioridade 2: Tipo do arquivo se não for genérico
    // Prioridade 3: image/jpeg como fallback
    const resolvedMimeType =
      mimeTypes[fileExt] ||
      (compressedFile.type && compressedFile.type !== 'application/octet-stream'
        ? compressedFile.type
        : 'image/jpeg');

    console.log(`📡 Enviando para Supabase: ${fileName} | Content-Type: ${resolvedMimeType}`);

    // Upload para o Storage
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, compressedFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: resolvedMimeType,
    });

    if (error) {
      console.error('❌ Erro no Supabase Storage:', error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    // Obtém a URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    return publicUrl;
  },

  /**
   * Faz upload de uma imagem de categoria para o Supabase Storage
   */
  async uploadCategoryImage(file: File): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase não configurado.');
    }

    console.log('🔄 Comprimindo imagem de categoria...');
    const compressedFile = await compressImage(file);

    const fileExt = compressedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `categorias/${Date.now()}.${fileExt}`;

    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };

    const resolvedMimeType = mimeTypes[fileExt] || 'image/jpeg';

    console.log(`📡 Enviando para categorias: ${fileName}`);

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, compressedFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: resolvedMimeType,
    });

    if (error) {
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    return publicUrl;
  },

  /**
   * Registra a imagem no banco de dados via API
   */
  async registerImage(productId: number, url: string, ordem: number = 0): Promise<ProductImage> {
    const { data } = await api.post<ProductImage>(`/produtos/${productId}/images`, { url, ordem });
    return data;
  },

  /**
   * Lista todas as imagens de um produto
   */
  async getProductImages(productId: number): Promise<ProductImage[]> {
    const { data } = await api.get<ProductImage[]>(`/produtos/${productId}/images`);
    return data;
  },

  /**
   * Remove uma imagem
   */
  async deleteImage(productId: number, imageId: string): Promise<void> {
    await api.delete(`/produtos/${productId}/images/${imageId}`);
  },

  /**
   * Atualiza a ordem das imagens
   */
  async updateImageOrder(productId: number, imageId: string, ordem: number): Promise<ProductImage> {
    const { data } = await api.post<ProductImage>(
      `/produtos/${productId}/images/${imageId}/order`,
      { ordem },
    );
    return data;
  },
};
