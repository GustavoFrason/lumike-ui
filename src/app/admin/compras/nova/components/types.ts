import { Product } from '@/lib/services/products.service';

export interface PurchaseItem {
  product: Product;
  quantity: number;
  unit_cost: number;
}
