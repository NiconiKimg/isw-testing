import { Product } from '../data/products';

export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}

export interface DiscountBreakdown {
  readonly basePercent: number;
  readonly baseAmount: number;
  readonly loyaltyPercent: number;
  readonly loyaltyAmount: number;
  readonly couponPercent: number;
  readonly couponAmount: number;
  readonly totalPercent: number;
  readonly totalAmount: number;
}

export interface OrderCalculationSuccess {
  readonly isValid: true;
  readonly subtotal: number;
  readonly discount: DiscountBreakdown;
  readonly total: number;
  readonly savings: number;
  readonly loyaltyMessage?: string;
  readonly couponMessage?: string;
  readonly warnings: readonly string[];
}

export interface OrderCalculationFailure {
  readonly isValid: false;
  readonly error: string;
  readonly field?: string;
}

export type OrderCalculationResult = OrderCalculationSuccess | OrderCalculationFailure;

export interface OrderCalculationInput {
  readonly items: readonly CartItem[];
  readonly isLoyalCustomer?: boolean;
  readonly membershipCode?: string;
  readonly couponCode?: string;
}
