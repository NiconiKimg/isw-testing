import React from 'react';

interface CouponInputProps {
  readonly couponCode: string;
  readonly onChange: (code: string) => void;
}

export const CouponInput: React.FC<CouponInputProps> = ({ couponCode, onChange }) => {
  return (
    <div className="coupon-section">
      <label htmlFor="coupon-input" className="coupon-label">
        ¿Tenés un cupón promocional?
      </label>
      <div className="coupon-input-group">
        <input
          type="text"
          id="coupon-input"
          value={couponCode}
          onChange={e => onChange(e.target.value)}
          placeholder="Ej: PROMO10"
          className="coupon-input"
          data-cy="coupon-input"
          autoComplete="off"
        />
      </div>
    </div>
  );
};
