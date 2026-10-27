import React, { useEffect, useRef } from 'react';
import { OrderCalculationSuccess } from '../domain/types';
import { formatARS } from '../domain/pricing';
import { animateReceipt } from '../animations';

interface OrderReceiptProps {
  readonly result: OrderCalculationSuccess;
}

export const OrderReceipt: React.FC<OrderReceiptProps> = ({ result }) => {
  const { subtotal, discount, total, savings } = result;
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tween = animateReceipt(receiptRef.current);
    return () => {
      tween?.kill();
    };
  }, [result]);

  return (
    <div
      className="receipt-table"
      data-cy="order-receipt"
      data-testid="order-receipt"
      ref={receiptRef}
    >
      <div className="receipt-row">
        <span>Subtotal productos:</span>
        <span data-cy="receipt-subtotal" data-testid="receipt-subtotal">{formatARS(subtotal)}</span>
      </div>

      {discount.basePercent > 0 && (
        <div className="receipt-row discount-row" data-cy="receipt-discount-base" data-testid="receipt-discount-base">
          <span>Descuento base ({discount.basePercent}%):</span>
          <span>-{formatARS(discount.baseAmount)}</span>
        </div>
      )}

      {discount.loyaltyPercent > 0 && (
        <div className="receipt-row discount-row" data-cy="receipt-discount-loyalty" data-testid="receipt-discount-loyalty">
          <span>Beneficio Fidelidad ({discount.loyaltyPercent}%):</span>
          <span>-{formatARS(discount.loyaltyAmount)}</span>
        </div>
      )}

      {discount.couponPercent > 0 && (
        <div className="receipt-row discount-row" data-cy="receipt-discount-coupon" data-testid="receipt-discount-coupon">
          <span>Cupón promocional ({discount.couponPercent}%):</span>
          <span>-{formatARS(discount.couponAmount)}</span>
        </div>
      )}

      {discount.totalPercent === 0 && (
        <div className="receipt-row" data-cy="receipt-no-discount" data-testid="receipt-no-discount">
          <span>Descuentos aplicados:</span>
          <span>$ 0 (0%)</span>
        </div>
      )}

      {savings > 0 && (
        <div className="savings-badge" data-cy="receipt-savings" data-testid="receipt-savings">
          ¡Ahorrás en este pedido {formatARS(savings)} ({discount.totalPercent}% OFF)!
        </div>
      )}

      <div className="receipt-row total-row">
        <span>Total a pagar:</span>
        <span data-cy="receipt-total" data-testid="receipt-total">{formatARS(total)}</span>
      </div>
    </div>
  );
};
