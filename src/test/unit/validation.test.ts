import { describe, it, expect } from 'vitest';
import {
  validateQuantity,
  validateOrderItems,
  validateMaxSubtotal,
  normalizeCouponCode,
  validateCoupon,
  normalizeMembershipCode,
  validateMembershipCode
} from '../../domain/validation';
import { CATALOG, Product } from '../../data/products';
import { CartItem } from '../../domain/types';

describe('Unit Tests: Validaciones de Dominio (Vitest)', () => {
  describe('Validación de Cantidades (Particiones y Valores Límite)', () => {
    it('[TC-BVA-01] rechaza cantidad igual a 0', () => {
      const result = validateQuantity(0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('La cantidad debe ser mayor a 0');
    });

    it('[TC-BVA-05] rechaza cantidades negativas (-1)', () => {
      const resultNeg = validateQuantity(-1);
      expect(resultNeg.isValid).toBe(false);
      expect(resultNeg.error).toBe('La cantidad no puede ser negativa');
    });

    it('[TC-BVA-06] rechaza números decimales no enteros (1.5)', () => {
      const result = validateQuantity(1.5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('La cantidad debe ser un número entero');
    });

    it('[TC-BVA-02] acepta cantidad límite inferior válida: 1 unidad', () => {
      const result = validateQuantity(1);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('[TC-BVA-03] acepta cantidad límite superior válida: 20 unidades', () => {
      const result = validateQuantity(20);
      expect(result.isValid).toBe(true);
    });

    it('[TC-BVA-04] rechaza cantidad superior al máximo: 21 unidades', () => {
      const result = validateQuantity(21);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('La cantidad máxima por producto es 20 unidades');
    });

    it('rechaza valores no numéricos o NaN', () => {
      const result = validateQuantity(NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('La cantidad debe ser un número válido');
    });
  });

  describe('Validación de Ítems del Pedido', () => {
    const espresso = CATALOG.find(p => p.id === 'espresso')!;

    it('[TC-BVA-07] rechaza pedidos vacíos con array vacío', () => {
      const result = validateOrderItems([]);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El pedido debe contener al menos un producto');
    });

    it('[TC-BVA-07] rechaza pedidos donde todos los ítems tienen cantidad 0', () => {
      const items: CartItem[] = [
        { product: espresso, quantity: 0 }
      ];
      const result = validateOrderItems(items);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El pedido debe contener al menos un producto');
    });

    it('acepta pedido con 1 producto válido', () => {
      const items: CartItem[] = [
        { product: espresso, quantity: 2 }
      ];
      const result = validateOrderItems(items);
      expect(result.isValid).toBe(true);
    });

    it('acepta pedido con múltiples productos válidos', () => {
      const americano = CATALOG.find(p => p.id === 'americano')!;
      const items: CartItem[] = [
        { product: espresso, quantity: 1 },
        { product: americano, quantity: 3 }
      ];
      const result = validateOrderItems(items);
      expect(result.isValid).toBe(true);
    });

    it('rechaza producto que no existe en el catálogo oficial', () => {
      const fakeProduct: Product = {
        id: 'cafe-pirata',
        name: 'Café Clonado',
        price: 999,
        description: 'No catalogado',
        category: 'coffee'
      };
      const items: CartItem[] = [
        { product: fakeProduct, quantity: 1 }
      ];
      const result = validateOrderItems(items);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Producto no reconocido en el catálogo');
    });
  });

  describe('Validación de Límite de Subtotal', () => {
    it('[TC-BVA-11] acepta subtotal límite exacto ($100.000)', () => {
      const result = validateMaxSubtotal(100000);
      expect(result.isValid).toBe(true);
    });

    it('[TC-BVA-12] rechaza subtotal superior al límite ($100.001)', () => {
      const result = validateMaxSubtotal(100001);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El importe del pedido no puede superar los $100.000');
    });
  });

  describe('Validación y Normalización de Cupones', () => {
    it('[TC-BVA-17] maneja cupón vacío o indefinido de forma neutral sin error', () => {
      expect(normalizeCouponCode('')).toBe('');
      expect(normalizeCouponCode(undefined)).toBe('');

      const result = validateCoupon('', 15000);
      expect(result.isProvided).toBe(false);
      expect(result.isValid).toBe(true);
      expect(result.applies).toBe(false);
      expect(result.discountPercent).toBe(0);
    });

    it('[TC-BVA-20] normaliza espacios en blanco y minúsculas', () => {
      expect(normalizeCouponCode('  belgranocafe10  ')).toBe('BELGRANOCAFE10');
      expect(normalizeCouponCode('migacafe10')).toBe('MIGACAFE10');
    });

    it('aplica cupón válido cuando subtotal >= $10.000', () => {
      const result = validateCoupon('BELGRANOCAFE10', 12000);
      expect(result.isProvided).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.applies).toBe(true);
      expect(result.discountPercent).toBe(10);
      expect(result.message).toContain('10% de descuento adicional');
    });

    it('[TC-BVA-18] no aplica cupón cuando subtotal < $10.000 y emite mensaje explicativo', () => {
      const result = validateCoupon('BELGRANOCAFE10', 9500);
      expect(result.isProvided).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.applies).toBe(false);
      expect(result.discountPercent).toBe(0);
      expect(result.error).toBe('El cupón requiere un subtotal mínimo de $10.000');
    });

    it('[TC-BVA-21] rechaza cupón desconocido con mensaje claro', () => {
      const result = validateCoupon('DESCUENTO50', 20000);
      expect(result.isProvided).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.applies).toBe(false);
      expect(result.discountPercent).toBe(0);
      expect(result.error).toBe('Cupón no válido');
    });
  });

  describe('Validación y Normalización de Código de Socio', () => {
    it('[TC-BVA-13] trata código de socio vacío o indefinido de forma neutral sin error', () => {
      expect(normalizeMembershipCode('')).toBe('');
      expect(normalizeMembershipCode(undefined)).toBe('');

      const result = validateMembershipCode('');
      expect(result.isProvided).toBe(false);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('[TC-BVA-15] normaliza espacios en blanco y minúsculas en código de socio', () => {
      expect(normalizeMembershipCode('  socio-belgrano  ')).toBe('SOCIO-BELGRANO');
      expect(normalizeMembershipCode('socio2026')).toBe('SOCIO2026');
    });

    it('[TC-BVA-14] valida con éxito socio registrado (ej: SOCIO-101, SOCIO-BELGRANO)', () => {
      const result = validateMembershipCode('socio-101');
      expect(result.isProvided).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.message).toContain('Socio BelGrano Club verificado');
      expect(result.error).toBeUndefined();
    });

    it('[TC-BVA-16] rechaza código de socio no registrado con mensaje claro', () => {
      const result = validateMembershipCode('SOCIO-INVENTADO');
      expect(result.isProvided).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Código de socio no válido');
    });
  });
});
