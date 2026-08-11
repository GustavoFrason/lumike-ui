import { Product } from '@/lib/services/products.service';

export interface XmlItem {
  id_interno?: number;
  sku: string;
  name: string;
  quantity: number;
  unit_cost: number;
  status: 'matched' | 'new' | 'conflict';
  system_product?: Product;
}
