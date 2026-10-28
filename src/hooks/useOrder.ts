import { useState, useCallback } from 'react';
import { CATALOG, PRODUCT_LIMITS } from '../data/products';
import { calculateOrder } from '../domain/pricing';
import { CartItem, OrderCalculationResult } from '../domain/types';

export function useOrder() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [membershipCode, setMembershipCode] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [calculationResult, setCalculationResult] = useState<OrderCalculationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleQuantityChange = useCallback((productId: string, newQty: number) => {
    const sanitizedQty = Math.max(0, newQty);

    setQuantities(prev => {
      const updated = {
        ...prev,
        [productId]: sanitizedQty
      };

      const hasExceeded = Object.values(updated).some(
        q => q > PRODUCT_LIMITS.MAX_QUANTITY_PER_ITEM
      );
      if (hasExceeded) {
        setValidationError(`La cantidad máxima por producto es ${PRODUCT_LIMITS.MAX_QUANTITY_PER_ITEM} unidades`);
      } else {
        setValidationError(null);
      }

      return updated;
    });

    setCalculationResult(null);
  }, []);

  const handleMembershipChange = useCallback((code: string) => {
    setMembershipCode(code);
    setCalculationResult(null);
  }, []);

  const handleCouponChange = useCallback((code: string) => {
    setCouponCode(code);
    setCalculationResult(null);
  }, []);

  const handleCalculate = useCallback(() => {
    // Comprobar si hay algún producto con cantidad > 20
    const hasExceededQty = Object.values(quantities).some(
      q => q > PRODUCT_LIMITS.MAX_QUANTITY_PER_ITEM
    );
    if (hasExceededQty) {
      setValidationError(`La cantidad máxima por producto es ${PRODUCT_LIMITS.MAX_QUANTITY_PER_ITEM} unidades`);
      setCalculationResult(null);
      return;
    }

    // Preparar ítems activos
    const items: CartItem[] = CATALOG
      .map(product => ({
        product,
        quantity: quantities[product.id] || 0
      }))
      .filter(item => item.quantity > 0);

    if (items.length === 0) {
      setValidationError('El pedido debe contener al menos un producto');
      setCalculationResult(null);
      return;
    }

    setValidationError(null);

    const result = calculateOrder({
      items,
      membershipCode,
      couponCode
    });

    setCalculationResult(result);
  }, [quantities, membershipCode, couponCode]);

  const handleReset = useCallback(() => {
    // setQuantities({}); /* DEFECTO DE ESTADO: se omite limpiar las cantidades al reiniciar */
    setMembershipCode('');
    setCouponCode('');
    setCalculationResult(null);
    setValidationError(null);
  }, []);

  return {
    quantities,
    membershipCode,
    isLoyal: Boolean(membershipCode.trim()),
    couponCode,
    calculationResult,
    validationError,
    handleQuantityChange,
    handleMembershipChange,
    handleCouponChange,
    handleCalculate,
    handleReset
  };
}
