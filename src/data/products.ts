/**
 * Catálogo centralizado de productos para BelGrano Café.
 * Todos los precios están expresados en Pesos Argentinos ($ ARS).
 */

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly description: string;
  readonly category: 'coffee' | 'bakery';
  readonly image?: string;
  readonly imageAlt?: string;
}

export const CATALOG: readonly Product[] = [
  {
    id: 'espresso',
    name: 'Espresso',
    price: 2000,
    description: 'Extracción clásica con cuerpo aterciopelado y crema densa.',
    category: 'coffee',
    image: '/images/espresso.jpg',
    imageAlt: 'Taza de espresso recién extraído con densa crema color avellana'
  },
  {
    id: 'americano',
    name: 'Americano',
    price: 2500,
    description: 'Doble espresso sobre agua filtrada, perfil equilibrado y limpio.',
    category: 'coffee',
    image: '/images/americano.jpg',
    imageAlt: 'Café americano servido en taza cerámica con perfil limpio'
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    price: 3500,
    description: 'Espresso, leche vaporizada y microespuma sedosa.',
    category: 'coffee',
    image: '/images/cappuccino.jpg',
    imageAlt: 'Taza de cappuccino con microespuma cremosa y latte art'
  },
  {
    id: 'latte',
    name: 'Latte',
    price: 3800,
    description: 'Espresso suave con abundante leche texturizada.',
    category: 'coffee',
    image: '/images/latte.jpg',
    imageAlt: 'Vaso de café latte con delicado patrón de arte latte en la superficie'
  },
  {
    id: 'medialuna',
    name: 'Medialuna',
    price: 1500,
    description: 'Hojaldre artesanal de pura manteca.',
    category: 'bakery',
    image: '/images/medialuna.jpg',
    imageAlt: 'Medialuna artesanal dorada y brillante sobre papel manteca'
  },
  {
    id: 'cookie',
    name: 'Cookie',
    price: 2000,
    description: 'Galleta horneada con trozos de chocolate.',
    category: 'bakery',
    image: '/images/cookie.jpg',
    imageAlt: 'Cookie casera con trozos de chocolate y escamas de sal marina'
  }
] as const;

export const PRODUCT_LIMITS = {
  MIN_QUANTITY_PER_ITEM: 1,
  MAX_QUANTITY_PER_ITEM: 20,
  MAX_ORDER_AMOUNT: 100000,
  BASE_DISCOUNT_THRESHOLD: 10000,
  BASE_DISCOUNT_PERCENT: 5,
  LOYALTY_DISCOUNT_PERCENT: 5,
  COUPON_DISCOUNT_PERCENT: 10,
  MAX_TOTAL_DISCOUNT_PERCENT: 25
} as const;

export const VALID_COUPONS = ['BELGRANOCAFE10', 'MIGACAFE10'] as const;

export const VALID_MEMBERSHIP_CODES = ['SOCIO-BELGRANO', 'SOCIO2026', 'SOCIO-101', 'BELGRANOCLUB'] as const;
