import React from 'react';

interface LoyaltyToggleProps {
  readonly membershipCode: string;
  readonly onChange: (code: string) => void;
}

export const LoyaltyToggle: React.FC<LoyaltyToggleProps> = ({ membershipCode, onChange }) => {
  return (
    <div className="loyalty-container" data-cy="loyalty-section">
      <label htmlFor="loyalty-input" className="loyalty-label">
        <span className="loyalty-title">Programa de Fidelidad BelGrano Club</span>
        <span className="loyalty-subtitle">Ingresá tu código de socio para acceder al 5% de descuento adicional</span>
      </label>
      <div className="loyalty-input-wrapper">
        <input
          type="text"
          id="loyalty-input"
          value={membershipCode}
          onChange={e => onChange(e.target.value)}
          placeholder="Ej: SOCIO-101"
          className="loyalty-input"
          data-cy="loyalty-input"
          autoComplete="off"
        />
      </div>
    </div>
  );
};
