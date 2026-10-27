import React, { useEffect, useRef } from 'react';
import { OrderCalculationResult } from '../domain/types';
import { LoyaltyToggle } from './LoyaltyToggle';
import { CouponInput } from './CouponInput';
import { OrderReceipt } from './OrderReceipt';
import { ReceiptIcon, WarningIcon, InfoIcon, CheckIcon } from './Icons';
import { animateAlert } from '../animations';

interface OrderSummaryProps {
  readonly membershipCode: string;
  readonly couponCode: string;
  readonly onMembershipChange: (code: string) => void;
  readonly onCouponChange: (code: string) => void;
  readonly onCalculate: () => void;
  readonly onReset: () => void;
  readonly calculationResult: OrderCalculationResult | null;
  readonly validationError: string | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  membershipCode,
  couponCode,
  onMembershipChange,
  onCouponChange,
  onCalculate,
  onReset,
  calculationResult,
  validationError
}) => {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      validationError ||
      (calculationResult &&
        (!calculationResult.isValid ||
          calculationResult.loyaltyMessage ||
          calculationResult.couponMessage ||
          calculationResult.warnings.length > 0))
    ) {
      const tween = animateAlert(alertRef.current);
      return () => {
        tween?.kill();
      };
    }
  }, [validationError, calculationResult]);

  return (
    <aside className="order-summary-panel" aria-labelledby="summary-heading">
      <div className="order-panel-header">
        <h2 id="summary-heading" className="section-title">
          <ReceiptIcon className="section-title-icon" size={20} />
          <span>Tu Pedido</span>
        </h2>
      </div>

      <LoyaltyToggle membershipCode={membershipCode} onChange={onMembershipChange} />

      <CouponInput couponCode={couponCode} onChange={onCouponChange} />

      <div className="actions-group">
        <button
          type="button"
          onClick={onCalculate}
          className="btn-primary"
          data-cy="btn-calculate"
        >
          Calcular Pedido
        </button>

        <button
          type="button"
          onClick={onReset}
          className="btn-secondary"
          data-cy="btn-reset"
        >
          Reiniciar Pedido
        </button>
      </div>

      {/* Alerta de Error de validación estructural */}
      {validationError && (
        <div className="alert alert-error" role="alert" data-cy="alert-error" ref={alertRef}>
          <WarningIcon className="alert-icon" size={18} />
          <div>
            <strong>Error en el pedido:</strong>
            <div>{validationError}</div>
          </div>
        </div>
      )}

      {/* Alerta de Error de cálculo de dominio */}
      {calculationResult && !calculationResult.isValid && (
        <div className="alert alert-error" role="alert" data-cy="alert-error" ref={alertRef}>
          <WarningIcon className="alert-icon" size={18} />
          <div>
            <strong>Atención:</strong>
            <div>{calculationResult.error}</div>
          </div>
        </div>
      )}

      {/* Alertas de advertencia de socio o cupón */}
      {calculationResult && calculationResult.isValid && calculationResult.warnings.length > 0 && (
        <div className="alert alert-warning" role="alert" data-cy="alert-warning" ref={alertRef}>
          <InfoIcon className="alert-icon" size={18} />
          <div>
            {calculationResult.warnings.map((warn, index) => (
              <div key={index}>{warn}</div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmación de membresía de socio aplicada */}
      {calculationResult && calculationResult.isValid && calculationResult.loyaltyMessage && (
        <div className="alert alert-success" role="status" data-cy="alert-loyalty-success" ref={alertRef}>
          <CheckIcon className="alert-icon" size={18} />
          <div>{calculationResult.loyaltyMessage}</div>
        </div>
      )}

      {/* Confirmación de cupón aplicado con éxito */}
      {calculationResult && calculationResult.isValid && calculationResult.couponMessage && (
        <div className="alert alert-success" role="status" data-cy="alert-success" ref={alertRef}>
          <CheckIcon className="alert-icon" size={18} />
          <div>{calculationResult.couponMessage}</div>
        </div>
      )}

      {/* Desglose de totales si el pedido fue calculado con éxito */}
      {calculationResult && calculationResult.isValid && (
        <OrderReceipt result={calculationResult} />
      )}
    </aside>
  );
};
