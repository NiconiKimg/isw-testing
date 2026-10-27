import { describe, it, expect } from 'vitest';
import { calculateOrder } from '../../domain/pricing';
import { CATALOG } from '../../data/products';
import { CartItem } from '../../domain/types';

describe('Unit Tests: Tablas de Decisión de Promociones (DT-R01..R11)', () => {
  const espresso = CATALOG.find(p => p.id === 'espresso')!;   // $2.000
  const americano = CATALOG.find(p => p.id === 'americano')!; // $2.500
  const latte = CATALOG.find(p => p.id === 'latte')!;         // $3.800

  // Helper para generar orden con subtotal menor a $10.000 ($4.000)
  const itemsUnder10k: CartItem[] = [
    { product: espresso, quantity: 2 } // $4.000
  ];

  // Helper para generar orden con subtotal igual a $10.000 exactos ($10.000)
  const itemsExact10k: CartItem[] = [
    { product: americano, quantity: 4 } // 4 * 2500 = $10.000
  ];

  // Helper para generar orden con subtotal mayor a $10.000 ($11.400)
  const itemsOver10k: CartItem[] = [
    { product: latte, quantity: 3 } // 3 * 3800 = $11.400
  ];

  it('[DT-R01] Pedido Inválido -> Rechazar pedido y reportar error', () => {
    const result = calculateOrder({
      items: [],
      isLoyalCustomer: false
    });
    expect(result.isValid).toBe(false);
  });

  it('[DT-R02] Subtotal < $10k, Sin fidelidad, Sin cupón -> 0% Descuento', () => {
    const result = calculateOrder({
      items: itemsUnder10k,
      isLoyalCustomer: false
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.discount.totalPercent).toBe(0);
      expect(result.discount.totalAmount).toBe(0);
      expect(result.total).toBe(4000);
      expect(result.warnings).toHaveLength(0);
    }
  });

  it('[DT-R03] Subtotal < $10k, Con fidelidad, Sin cupón -> 5% Descuento Fidelidad', () => {
    const result = calculateOrder({
      items: itemsUnder10k,
      isLoyalCustomer: true
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.discount.basePercent).toBe(0);
      expect(result.discount.loyaltyPercent).toBe(5);
      expect(result.discount.totalPercent).toBe(5);
      expect(result.discount.totalAmount).toBe(200); // 5% de 4000
      expect(result.total).toBe(3800);
      expect(result.warnings).toHaveLength(0);
    }
  });

  it('[DT-R04] Subtotal < $10k, Sin fidelidad, Cupón válido -> 0% Dto y Alerta requisito $10k', () => {
    const result = calculateOrder({
      items: itemsUnder10k,
      isLoyalCustomer: false,
      couponCode: 'BELGRANOCAFE10'
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.discount.totalPercent).toBe(0);
      expect(result.discount.totalAmount).toBe(0);
      expect(result.total).toBe(4000);
      expect(result.warnings).toContain('El cupón requiere un subtotal mínimo de $10.000');
    }
  });

  it('[DT-R05] Subtotal < $10k, Con fidelidad, Cupón válido -> 5% Fidelidad y Alerta cupón', () => {
    const result = calculateOrder({
      items: itemsUnder10k,
      isLoyalCustomer: true,
      couponCode: 'BELGRANOCAFE10'
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.discount.basePercent).toBe(0);
      expect(result.discount.loyaltyPercent).toBe(5);
      expect(result.discount.couponPercent).toBe(0);
      expect(result.discount.totalPercent).toBe(5);
      expect(result.discount.totalAmount).toBe(200);
      expect(result.total).toBe(3800);
      expect(result.warnings).toContain('El cupón requiere un subtotal mínimo de $10.000');
    }
  });

  it('[DT-R06] Subtotal < $10k, Sin fidelidad, Cupón desconocido -> 0% Dto y Alerta cupón no válido', () => {
    const result = calculateOrder({
      items: itemsUnder10k,
      isLoyalCustomer: false,
      couponCode: 'CUPON_FALSO'
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.discount.totalPercent).toBe(0);
      expect(result.total).toBe(4000);
      expect(result.warnings).toContain('Cupón no válido');
    }
  });

  it('[DT-R07] Subtotal >= $10k, Sin fidelidad, Sin cupón -> 5% Descuento Base', () => {
    const result = calculateOrder({
      items: itemsExact10k,
      isLoyalCustomer: false
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.discount.basePercent).toBe(5);
      expect(result.discount.loyaltyPercent).toBe(0);
      expect(result.discount.couponPercent).toBe(0);
      expect(result.discount.totalPercent).toBe(5);
      expect(result.discount.totalAmount).toBe(500); // 5% de 10000
      expect(result.total).toBe(9500);
      expect(result.warnings).toHaveLength(0);
    }
  });

  it('[DT-R08] Subtotal >= $10k, Con fidelidad, Sin cupón -> 10% Descuento (5% base + 5% fidelidad)', () => {
    const result = calculateOrder({
      items: itemsExact10k,
      isLoyalCustomer: true
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.discount.basePercent).toBe(5);
      expect(result.discount.loyaltyPercent).toBe(5);
      expect(result.discount.totalPercent).toBe(10);
      expect(result.discount.totalAmount).toBe(1000); // 10% de 10000
      expect(result.total).toBe(9000);
    }
  });

  it('[DT-R09] Subtotal >= $10k, Sin fidelidad, Con cupón válido -> 15% Descuento (5% base + 10% cupón)', () => {
    const result = calculateOrder({
      items: itemsOver10k,
      isLoyalCustomer: false,
      couponCode: 'BELGRANOCAFE10'
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.discount.basePercent).toBe(5);
      expect(result.discount.couponPercent).toBe(10);
      expect(result.discount.totalPercent).toBe(15);
      expect(result.discount.totalAmount).toBe(1710); // 15% de 11400
      expect(result.total).toBe(9690);
      expect(result.couponMessage).toBeDefined();
    }
  });

  it('[DT-R10] Subtotal >= $10k, Con fidelidad, Con cupón válido -> 20% Descuento (5% + 5% + 10%)', () => {
    const result = calculateOrder({
      items: itemsExact10k,
      isLoyalCustomer: true,
      couponCode: '  belgranocafe10  '
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.discount.basePercent).toBe(5);
      expect(result.discount.loyaltyPercent).toBe(5);
      expect(result.discount.couponPercent).toBe(10);
      expect(result.discount.totalPercent).toBe(20);
      expect(result.discount.totalAmount).toBe(2000); // 20% de 10000
      expect(result.total).toBe(8000);
    }
  });

  it('[DT-R11] Subtotal >= $10k, Con fidelidad, Cupón desconocido -> 10% Descuento y Alerta', () => {
    const result = calculateOrder({
      items: itemsExact10k,
      isLoyalCustomer: true,
      couponCode: 'INVALIDO'
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.discount.basePercent).toBe(5);
      expect(result.discount.loyaltyPercent).toBe(5);
      expect(result.discount.couponPercent).toBe(0);
      expect(result.discount.totalPercent).toBe(10);
      expect(result.discount.totalAmount).toBe(1000);
      expect(result.total).toBe(9000);
      expect(result.warnings).toContain('Cupón no válido');
    }
  });
});
