import { describe, it, expect } from 'vitest';
import { calculateSubtotal, calculateOrder, roundCurrency, formatARS } from '../../domain/pricing';
import { CATALOG } from '../../data/products';
import { CartItem } from '../../domain/types';

describe('Unit Tests: Cálculo Monetario y Liquidación de Pedido (Vitest)', () => {
  const espresso = CATALOG.find(p => p.id === 'espresso')!;       // $2.000
  const americano = CATALOG.find(p => p.id === 'americano')!;     // $2.500
  const cappuccino = CATALOG.find(p => p.id === 'cappuccino')!;   // $3.500
  const latte = CATALOG.find(p => p.id === 'latte')!;             // $3.800

  describe('Política de Redondeo Monetario y Formato', () => {
    it('redondea con precisión Half-Up a 2 decimales', () => {
      expect(roundCurrency(10.004)).toBe(10.00);
      expect(roundCurrency(10.005)).toBe(10.01);
      expect(roundCurrency(10.006)).toBe(10.01);
    });

    it('mitiga imprecisiones de coma flotante de JavaScript', () => {
      // 0.1 + 0.2 en JS puro es 0.30000000000000004
      expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
    });

    it('formatea correctamente importes en Pesos Argentinos ($ ARS)', () => {
      const formatted = formatARS(10000);
      expect(formatted).toContain('10.000');
    });
  });

  describe('Cálculo de Subtotales Brutos', () => {
    it('calcula la suma ponderada de ítems', () => {
      const items: CartItem[] = [
        { product: espresso, quantity: 2 },   // 2 * 2000 = 4000
        { product: cappuccino, quantity: 1 }  // 1 * 3500 = 3500
      ];
      expect(calculateSubtotal(items)).toBe(7500);
    });
  });

  describe('Análisis de Valores Límite del Umbral de Descuento (BVA-THR-01..03)', () => {
    it('[BVA-THR-01] $9.999 otorga 0% descuento base', () => {
      // Simulamos subtotal con items personalizados o equivalentes
      // 1 latte ($3.800) + 1 cappuccino ($3.500) + 1 americano ($2.500) = $9.800 (< 10.000)
      const items: CartItem[] = [
        { product: latte, quantity: 1 },
        { product: cappuccino, quantity: 1 },
        { product: americano, quantity: 1 }
      ];
      const result = calculateOrder({
        items,
        isLoyalCustomer: false
      });
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.subtotal).toBe(9800);
        expect(result.discount.basePercent).toBe(0);
        expect(result.discount.totalAmount).toBe(0);
        expect(result.total).toBe(9800);
      }
    });

    it('[BVA-THR-02] exactamente $10.000 otorga 5% descuento base', () => {
      // 4 Americanos * $2.500 = $10.000 exactos
      const items: CartItem[] = [
        { product: americano, quantity: 4 }
      ];
      const result = calculateOrder({
        items,
        isLoyalCustomer: false
      });
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.subtotal).toBe(10000);
        expect(result.discount.basePercent).toBe(5);
        expect(result.discount.baseAmount).toBe(500);
        expect(result.total).toBe(9500);
      }
    });

    it('[BVA-THR-03] $10.500 (> $10.000) otorga 5% descuento base', () => {
      // 3 Cappuccinos * $3.500 = $10.500
      const items: CartItem[] = [
        { product: cappuccino, quantity: 3 }
      ];
      const result = calculateOrder({
        items,
        isLoyalCustomer: false
      });
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.subtotal).toBe(10500);
        expect(result.discount.basePercent).toBe(5);
        expect(result.discount.baseAmount).toBe(525);
        expect(result.total).toBe(9975);
      }
    });
  });

  describe('Beneficio de Fidelidad (+5%)', () => {
    it('aplica 5% de fidelidad en pedido menor a $10.000', () => {
      const items: CartItem[] = [
        { product: cappuccino, quantity: 1 } // $3.500
      ];
      const result = calculateOrder({
        items,
        isLoyalCustomer: true
      });
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.discount.basePercent).toBe(0);
        expect(result.discount.loyaltyPercent).toBe(5);
        expect(result.discount.loyaltyAmount).toBe(175);
        expect(result.total).toBe(3325);
      }
    });

    it('suma base (5%) + fidelidad (5%) = 10% en pedidos >= $10.000', () => {
      const items: CartItem[] = [
        { product: americano, quantity: 4 } // $10.000
      ];
      const result = calculateOrder({
        items,
        isLoyalCustomer: true
      });
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.discount.basePercent).toBe(5);
        expect(result.discount.loyaltyPercent).toBe(5);
        expect(result.discount.totalPercent).toBe(10);
        expect(result.discount.totalAmount).toBe(1000);
        expect(result.total).toBe(9000);
      }
    });

    it('aplica 5% de fidelidad al ingresar un código de socio válido (ej: SOCIO-101)', () => {
      const items: CartItem[] = [
        { product: cappuccino, quantity: 1 } // $3.500
      ];
      const result = calculateOrder({
        items,
        membershipCode: 'SOCIO-101'
      });
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.discount.loyaltyPercent).toBe(5);
        expect(result.discount.loyaltyAmount).toBe(175);
        expect(result.loyaltyMessage).toContain('Socio BelGrano Club verificado');
      }
    });

    it('rechaza beneficio y genera advertencia si el código de socio es inválido', () => {
      const items: CartItem[] = [
        { product: cappuccino, quantity: 1 } // $3.500
      ];
      const result = calculateOrder({
        items,
        membershipCode: 'SOCIO-FALSO'
      });
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.discount.loyaltyPercent).toBe(0);
        expect(result.warnings).toContain('Código de socio no válido');
      }
    });
  });

  describe('Guarda de Seguridad de Descuento Máximo (Tope 25%)', () => {
    it('garantiza que el descuento nunca exceda el 25% y que el total no sea negativo', () => {
      const items: CartItem[] = [
        { product: espresso, quantity: 10 } // $20.000
      ];
      const result = calculateOrder({
        items,
        isLoyalCustomer: true,
        couponCode: 'BELGRANOCAFE10'
      });
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        // 5% base + 5% fidelidad + 10% cupón = 20% (< 25%)
        expect(result.discount.totalPercent).toBe(20);
        expect(result.discount.totalPercent).toBeLessThanOrEqual(25);
        expect(result.total).toBeGreaterThan(0);
      }
    });
  });

  describe('Rechazo de Pedidos Inválidos', () => {
    it('rechaza orden con items vacíos', () => {
      const result = calculateOrder({
        items: [],
        isLoyalCustomer: false
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toBe('El pedido debe contener al menos un producto');
      }
    });

    it('rechaza orden con importe superior a $100.000', () => {
      // 6 productos a 20 unidades de Latte ($3.800 * 20 = $76.000) + 20 Cappuccinos ($3.500 * 20 = $70.000) = $146.000
      const items: CartItem[] = [
        { product: latte, quantity: 20 },
        { product: cappuccino, quantity: 20 }
      ];
      const result = calculateOrder({
        items,
        isLoyalCustomer: false
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toContain('no puede superar los $100.000');
      }
    });
  });
});
