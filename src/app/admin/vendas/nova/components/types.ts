import { Product } from '@/lib/services/products.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'dinheiro' | 'cartao' | 'parcelado' | 'boca' | 'aberto';
export type PaymentStatus = 'pago' | 'parcial' | 'aberto';
