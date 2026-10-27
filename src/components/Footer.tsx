import React from 'react';
import { MonogramLogo } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer" id="contacto">
      <div className="footer-container">
        <div className="footer-compact-content">
          <div className="footer-brand-compact">
            <MonogramLogo size={32} className="footer-logo" />
            <div className="footer-brand-info">
              <span className="footer-brand-name">BelGrano Café</span>
              <span className="footer-brand-sub">Av. Belgrano 1432 · Rosario, Santa Fe</span>
            </div>
          </div>

          <div className="footer-details-compact">
            <span className="footer-detail-item">
              <strong>Horarios:</strong> Lun a Vie 07:30 – 20:00 | Sáb y Dom 08:30 – 20:30
            </span>
            <span className="footer-detail-separator">·</span>
            <span className="footer-detail-item">
              <strong>Tel:</strong>{' '}
              <a href="tel:+543414258900" className="footer-contact-link">
                (0341) 425-8900
              </a>
            </span>
            <span className="footer-detail-separator">·</span>
            <span className="footer-detail-item">
              <strong>Email:</strong>{' '}
              <a href="mailto:hola@belgranocafe.com.ar" className="footer-contact-link">
                hola@belgranocafe.com.ar
              </a>
            </span>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>BelGrano Café · Copyright 2026 · Tostaduría de Especialidad · Rosario, Argentina</p>
        </div>
      </div>
    </footer>
  );
};
