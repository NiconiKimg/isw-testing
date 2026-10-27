import React, { useEffect, useRef } from 'react';
import { animateHero } from '../animations';

export const Header: React.FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const tl = animateHero(null, titleRef.current, taglineRef.current);
    return () => {
      tl?.kill();
    };
  }, []);

  return (
    <section className="site-hero" id="inicio" aria-labelledby="hero-title">
      <h1 id="hero-title" className="brand-title" data-cy="brand-title" ref={titleRef}>
        BelGrano Café
      </h1>
      <p className="brand-tagline" ref={taglineRef}>
        Granos de origen seleccionados y tostados en Rosario, acompañados de pastelería fresca del día.
      </p>
    </section>
  );
};
