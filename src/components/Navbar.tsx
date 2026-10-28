import React, { useEffect, useRef, useState } from 'react';
import { MonogramLogo } from './Icons';
import { animateNavbar } from '../animations';

export const Navbar: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const anim = animateNavbar(navRef.current);

    const handleScroll = () => {
      const scrolled = window.scrollY > 25;
      setIsScrolled(scrolled);
    };

    // Evaluar estado inicial y agregar listener
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      anim?.kill();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`navbar-wrapper ${isScrolled ? 'navbar-scrolled' : 'navbar-dark-initial'}`}
      ref={navRef}
      data-scrolled={isScrolled}
    >
      <nav className="site-navbar" aria-label="Navegación principal">
        <div className="navbar-brand-section">
          <a href="#inicio" className="navbar-brand-link" aria-label="BelGrano Café - Inicio">
            <MonogramLogo size={46} className="navbar-logo" />
            <div className="navbar-brand-text">
              <span className="navbar-brand-name">☕ BelGrano Café ☕</span>
              <span className="navbar-location-sub">Av. Belgrano 1432 · Rosario</span>
            </div>
          </a>
        </div>

        <ul className="navbar-nav">
          <li>
            <a href="#carta" className="nav-link">
              Carta
            </a>
          </li>
          <li>
            <a href="#especialidad" className="nav-link">
              Tostaduría
            </a>
          </li>
          <li>
            <a href="#ubicacion" className="nav-link">
              Rosario
            </a>
          </li>
          <li>
            <a href="#contacto" className="nav-link">
              Contacto
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};
