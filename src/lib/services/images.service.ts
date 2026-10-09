/**
 * Images Service
 * --------------------
 * Serviço para upload e gestão de imagens (bucket "produtos" do Supabase
 * Storage). O upload passa pela API (POST /uploads/images, só
 * admin/gestor) — o front não fala mais com o Storage usando a anon key.
 */

import { api } from '../api';
import { compressImage } from '../utils/image-compression';

/**
 * Teto do corpo da requisição nas funções da Vercel é 4,5MB; a compressão
 * já deixa a imagem bem abaixo disso, mas checamos para dar uma mensagem
 * clara em vez de um 413 genérico.
 */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Pasta no bucket: ID do produto, "categorias" ou "banners". */
export type ImageFolder = number | 'categorias' | 'banners';

export interface ProductImage {
  id: string;
  produto_id: number;
  url: string;
  ordem: number;
  created_at: string;
}

/**
 * Comprime e envia a imagem para a API, que grava no Storage e devolve a
 * URL pública.
 */
async function uploadFile(folder: ImageFolder, file: File): Promise<string> {
  const compressedFile = await compressImage(file);

  if (compressedFile.size > MAX_UPLOAD_BYTES) {
    throw new Error('Imagem muito grande mesmo após compressão (máx. 4MB).');
  }

  const formData = new FormData();
  formData.append('file', compressedFile, compressedFile.name || 'imagem.jpg');
  formData.append('folder', String(folder));

  const { data } = await api.post<{ url: string; path: string }>('/uploads/images', formData, {
    // O default do axios aqui é JSON; com multipart explícito o navegador
    // completa o boundary (mesmo padrão de purchase-import.service).
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.url;
}

export const imagesService = {
  /**
   * Faz upload de uma imagem de produto e devolve a URL pública
   */
  async uploadImage(productId: number, file: File): Promise<string> {
    return uploadFile(productId, file);
  },

  /**
   * Faz upload de uma imagem de categoria e devolve a URL pública
   */
  async uploadCategoryImage(file: File): Promise<string> {
    return uploadFile('categorias', file);
  },

  /**
   * Faz upload de um banner do site e devolve a URL pública
   */
  async uploadBannerImage(file: File): Promise<string> {
    return uploadFile('banners', file);
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
