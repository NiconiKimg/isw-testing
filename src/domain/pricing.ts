/**
 * Módulo de cálculo y lógica monetaria para BelGrano Café.
 * Implementa las reglas comerciales, política de redondeo explícita y tope de descuento.
 */

import { PRODUCT_LIMITS } from '../data/products';
import {
  CartItem,
  DiscountBreakdown,
  OrderCalculationInput,
  OrderCalculationResult
} from './types';
import {
  validateCoupon,
  validateMaxSubtotal,
  validateOrderItems,
  validateMembershipCode
} from './validation';

/**
 * Aplica redondeo bancario/comercial estándar (*Half-Up*) a 2 decimales.
 * Evita anomalías de coma flotante IEEE 754 de JavaScript sumando `Number.EPSILON`.
 * 
 * @param value Importe monetario a redondear.
 * @returns Número redondeado con precisión de 2 dígitos decimales.
 */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Formatea un importe en Pesos Argentinos ($ ARS) con separador de miles y decimales.
 * 
 * @param amount Monto numérico.
 * @returns Cadena con formato visual amigable, ej. "$ 10.000,00" o "$ 10.000".
 */
export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Calcula el subtotal bruto sumando el precio unitario por la cantidad de cada ítem.
 * 
 * @param items Lista inmutable de ítems del pedido.
 * @returns Subtotal acumulado redondeado a 2 decimales.
 */
export function calculateSubtotal(items: readonly CartItem[]): number {
  const sum = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  return roundCurrency(sum);
}

/**
 * Función principal de dominio: liquida y calcula un pedido completo aplicando las promociones vigentes.
 * 
 * Reglas de negocio ejecutadas:
 * 1. Validación estructural del pedido (al menos 1 ítem, catálogo oficial, cantidades [1, 20]).
 * 2. Validación de importe máximo ($100.000).
 * 3. Descuento base del 5% si subtotal >= $10.000.
 * 4. Descuento adicional del 5% si el cliente pertenece a Fidelidad.
 * 5. Descuento adicional del 10% si se proporciona cupón válido y subtotal >= $10.000.
 * 6. Guarda de seguridad: el descuento total nunca supera el 25%.
 * 7. El total nunca es negativo.
 * 
 * @param input Datos del pedido: ítems, fidelidad y cupón opcional.
 * @returns Resultado del cálculo o rechazo con error explicativo.
 */
export function calculateOrder(input: OrderCalculationInput): OrderCalculationResult {
  // 1. Validar ítems
  const itemsValidation = validateOrderItems(input.items);
  if (!itemsValidation.isValid) {
    return {
      isValid: false,
      error: itemsValidation.error ?? 'El pedido no es válido'
    };
  }

  // 2. Calcular subtotal bruto
  const activeItems = input.items.filter(item => item.quantity > 0);
  const subtotal = calculateSubtotal(activeItems);

  // 3. Validar límite superior de subtotal ($100.000)
  const maxSubtotalValidation = validateMaxSubtotal(subtotal);
  if (!maxSubtotalValidation.isValid) {
    return {
      isValid: false,
      error: maxSubtotalValidation.error ?? 'Subtotal excede el límite permitido'
    };
  }

  // 4. Evaluar Descuento Base (Umbral $10.000)
  const basePercent = subtotal >= PRODUCT_LIMITS.BASE_DISCOUNT_THRESHOLD
    ? PRODUCT_LIMITS.BASE_DISCOUNT_PERCENT
    : 0;

  // 5. Evaluar Beneficio de Fidelidad (+5%)
  const warnings: string[] = [];
  let loyaltyApplies = Boolean(input.isLoyalCustomer);
  let loyaltyMessage: string | undefined = undefined;

  if (input.membershipCode !== undefined) {
    const membershipOutcome = validateMembershipCode(input.membershipCode);
    if (membershipOutcome.isProvided) {
      if (membershipOutcome.isValid) {
        loyaltyApplies = true;
        loyaltyMessage = membershipOutcome.message;
      } else {
        loyaltyApplies = false;
        if (membershipOutcome.error) {
          warnings.push(membershipOutcome.error);
        }
      }
    }
  }

  const loyaltyPercent = loyaltyApplies
    ? PRODUCT_LIMITS.LOYALTY_DISCOUNT_PERCENT
    : 0;

  // 6. Evaluar Cupón Promocional (+10% con umbral $10.000)
  const couponOutcome = validateCoupon(input.couponCode, subtotal);
  const couponPercent = couponOutcome.applies ? couponOutcome.discountPercent : 0;

  // 7. Aplicar regla de tope máximo (Tope del 25%)
  const rawTotalPercent = basePercent + loyaltyPercent + couponPercent;
  const totalPercent = Math.min(PRODUCT_LIMITS.MAX_TOTAL_DISCOUNT_PERCENT, rawTotalPercent);

  // 8. Calcular importes monetarios con redondeo estricto
  const baseAmount = roundCurrency(subtotal * (basePercent / 100));
  const loyaltyAmount = roundCurrency(subtotal * (loyaltyPercent / 100));
  const couponAmount = roundCurrency(subtotal * (couponPercent / 100));
  const totalDiscountAmount = roundCurrency(subtotal * (totalPercent / 100));

  // 9. Calcular total final con protección contra negatividad
  // ERROR EN EL CÓDIGO: Bug de fórmula financiera (suma el descuento en vez de restarlo)
  const total = Math.max(0, roundCurrency(subtotal + totalDiscountAmount));

  // 10. Recopilar mensajes y advertencias
  if (couponOutcome.isProvided && !couponOutcome.applies && couponOutcome.error) {
    warnings.push(couponOutcome.error);
  }

  const discountBreakdown: DiscountBreakdown = {
    basePercent,
    baseAmount,
    loyaltyPercent,
    loyaltyAmount,
    couponPercent,
    couponAmount,
    totalPercent,
    totalAmount: totalDiscountAmount
  };

  return {
    isValid: true,
    subtotal,
    discount: discountBreakdown,
    total,
    savings: totalDiscountAmount,
    loyaltyMessage,
    couponMessage: couponOutcome.applies ? couponOutcome.message : undefined,
    warnings
  };
}
