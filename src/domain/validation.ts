/**
 * Módulo de validación de entradas y reglas de negocio para BelGrano Café.
 * Este módulo contiene funciones puras de validación sin efectos secundarios.
 */

import { CATALOG, PRODUCT_LIMITS, VALID_COUPONS, VALID_MEMBERSHIP_CODES } from '../data/products';
import { CartItem } from './types';

export interface ValidationOutcome {
  readonly isValid: boolean;
  readonly error?: string;
}

export interface MembershipValidationOutcome {
  readonly isProvided: boolean;
  readonly isValid: boolean;
  readonly message?: string;
  readonly error?: string;
}

export interface CouponValidationOutcome {
  readonly isProvided: boolean;
  readonly isValid: boolean;
  readonly applies: boolean;
  readonly discountPercent: number;
  readonly message?: string;
  readonly error?: string;
}

/**
 * Valida la cantidad solicitada para una línea de producto.
 * 
 * Reglas de negocio:
 * - Debe ser un número entero.
 * - Debe ser estrictamente mayor o igual a 1 (límite inferior).
 * - Debe ser menor o igual a 20 (límite superior).
 * 
 * @param quantity Número de unidades a validar.
 * @returns Resultado de validación con mensaje de error descriptivo en caso de fallo.
 */
export function validateQuantity(quantity: number): ValidationOutcome {
  if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    return { isValid: false, error: 'La cantidad debe ser un número válido' };
  }

  if (!Number.isInteger(quantity)) {
    return { isValid: false, error: 'La cantidad debe ser un número entero' };
  }

  if (quantity < PRODUCT_LIMITS.MIN_QUANTITY_PER_ITEM) {
    if (quantity === 0) {
      return { isValid: false, error: 'La cantidad debe ser mayor a 0' };
    }
    return { isValid: false, error: 'La cantidad no puede ser negativa' };
  }

  if (quantity > PRODUCT_LIMITS.MAX_QUANTITY_PER_ITEM) {
    return {
      isValid: false,
      error: `La cantidad máxima por producto es ${PRODUCT_LIMITS.MAX_QUANTITY_PER_ITEM} unidades`
    };
  }

  return { isValid: true };
}

/**
 * Valida la colección completa de ítems de un pedido.
 * 
 * Reglas de negocio:
 * - El pedido debe contener al menos un producto con cantidad positiva.
 * - Todos los productos deben existir en el catálogo oficial de BelGrano Café.
 * - Cada línea debe respetar los límites de cantidad [1, 20].
 * 
 * @param items Lista inmutable de ítems en el carrito.
 * @returns Resultado de validación estructural del pedido.
 */
export function validateOrderItems(items: readonly CartItem[]): ValidationOutcome {
  if (!items || items.length === 0) {
    return { isValid: false, error: 'El pedido debe contener al menos un producto' };
  }

  // Filtrar solo ítems con cantidad > 0 si hubiera entradas vacías
  const activeItems = items.filter(item => item.quantity > 0);
  if (activeItems.length === 0) {
    return { isValid: false, error: 'El pedido debe contener al menos un producto' };
  }

  for (const item of activeItems) {
    // Verificar existencia en catálogo
    const existsInCatalog = CATALOG.some(p => p.id === item.product.id && p.price === item.product.price);
    if (!existsInCatalog) {
      return { isValid: false, error: `Producto no reconocido en el catálogo: ${item.product.name || item.product.id}` };
    }

    // Validar cantidad individual
    const qtyValidation = validateQuantity(item.quantity);
    if (!qtyValidation.isValid) {
      return qtyValidation;
    }
  }

  return { isValid: true };
}

/**
 * Valida que el subtotal del pedido no exceda el límite comercial máximo.
 * 
 * Regla de negocio:
 * - El importe no puede superar los $100.000 ARS.
 * 
 * @param subtotal Subtotal bruto antes de descuentos.
 * @returns Resultado de validación de monto máximo.
 */
export function validateMaxSubtotal(subtotal: number): ValidationOutcome {
  if (subtotal > PRODUCT_LIMITS.MAX_ORDER_AMOUNT) {
    return {
      isValid: false,
      error: `El importe del pedido no puede superar los $${PRODUCT_LIMITS.MAX_ORDER_AMOUNT.toLocaleString('es-AR')}`
    };
  }
  return { isValid: true };
}

/**
 * Normaliza una cadena de cupón eliminando espacios en blanco y pasando a mayúsculas.
 * 
 * @param rawCode Código sin procesar introducido por el cliente.
 * @returns Código sanitizado en mayúsculas sin espacios exteriores.
 */
export function normalizeCouponCode(rawCode?: string): string {
  if (!rawCode) return '';
  return rawCode.trim().toUpperCase();
}

/**
 * Valida un cupón promocional evaluando su existencia y el cumplimiento de requisitos de subtotal.
 * 
 * Reglas de negocio:
 * - El cupón es opcional: si está vacío, no produce error ni descuento.
 * - Validación case-insensitive y sin espacios iniciales/finales.
 * - Cupones reconocidos: `BELGRANOCAFE10` (y su alias histórico `MIGACAFE10`).
 * - Requisito de umbral: El cupón solo aplica si subtotal >= $10.000.
 * - Si el subtotal es inferior a $10.000, se rechaza la aplicación del cupón con mensaje explicativo.
 * - Si el código no existe en el catálogo de promociones, se informa que no es válido.
 * 
 * @param rawCode Código de cupón introducido.
 * @param subtotal Subtotal acumulado del pedido.
 * @returns Resultado exhaustivo de validación de cupón.
 */
export function validateCoupon(rawCode: string | undefined, subtotal: number): CouponValidationOutcome {
  const normalized = normalizeCouponCode(rawCode);

  if (!normalized) {
    return {
      isProvided: false,
      isValid: true,
      applies: false,
      discountPercent: 0
    };
  }

  const isRecognized = (VALID_COUPONS as readonly string[]).includes(normalized);

  if (!isRecognized) {
    return {
      isProvided: true,
      isValid: false,
      applies: false,
      discountPercent: 0,
      error: 'Cupón no válido'
    };
  }

  // Cupón reconocido; evaluar umbral de subtotal
  if (subtotal < PRODUCT_LIMITS.BASE_DISCOUNT_THRESHOLD) {
    return {
      isProvided: true,
      isValid: true,
      applies: false,
      discountPercent: 0,
      error: `El cupón requiere un subtotal mínimo de $${PRODUCT_LIMITS.BASE_DISCOUNT_THRESHOLD.toLocaleString('es-AR')}`
    };
  }

  // Cumple todos los requisitos
  return {
    isProvided: true,
    isValid: true,
    applies: true,
    discountPercent: PRODUCT_LIMITS.COUPON_DISCOUNT_PERCENT,
    message: `Cupón ${normalized} aplicado: 10% de descuento adicional`
  };
}

/**
 * Normaliza una cadena de código de socio eliminando espacios en blanco y pasando a mayúsculas.
 * 
 * @param rawCode Código sin procesar introducido por el socio.
 * @returns Código sanitizado en mayúsculas sin espacios exteriores.
 */
export function normalizeMembershipCode(rawCode?: string): string {
  if (!rawCode) return '';
  return rawCode.trim().toUpperCase();
}

/**
 * Valida un código de socio del programa de fidelidad BelGrano Club.
 * 
 * Reglas de negocio:
 * - El código es opcional: si está vacío, no produce error ni beneficio.
 * - Validación case-insensitive y sin espacios iniciales/finales.
 * - Códigos reconocidos: `SOCIO-BELGRANO`, `SOCIO2026`, `SOCIO-101`, `BELGRANOCLUB`.
 * - Si el código no está registrado, se informa que no es válido y no se aplica descuento.
 * 
 * @param rawCode Código de socio introducido.
 * @returns Resultado exhaustivo de validación de membresía.
 */
export function validateMembershipCode(rawCode?: string): MembershipValidationOutcome {
  const normalized = normalizeMembershipCode(rawCode);

  if (!normalized) {
    return {
      isProvided: false,
      isValid: true
    };
  }

  const isRecognized = (VALID_MEMBERSHIP_CODES as readonly string[]).includes(normalized);

  if (!isRecognized) {
    return {
      isProvided: true,
      isValid: false,
      error: 'Código de socio no válido'
    };
  }

  return {
    isProvided: true,
    isValid: true,
    message: `Socio BelGrano Club verificado (${normalized}): 5% de descuento adicional`
  };
}
