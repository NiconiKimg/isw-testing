import React, { useEffect, useRef } from 'react';
import { CATALOG } from '../data/products';
import { ProductCard } from './ProductCard';
import { CoffeeBeanIcon } from './Icons';
import { animateCatalog } from '../animations';

interface ProductCatalogProps {
  readonly quantities: Record<string, number>;
  readonly onQuantityChange: (productId: string, newQty: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  quantities,
  onQuantityChange
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tween = animateCatalog(gridRef.current);
    return () => {
      tween?.kill();
    };
  }, []);

  return (
    <section id="carta" className="catalog-section" aria-labelledby="catalog-heading">
      <div className="catalog-header-bar">
        <h2 id="catalog-heading" className="section-title">
          <CoffeeBeanIcon className="section-title-icon" size={22} />
          <span>Nuestra Carta de Café & Pastelería</span>
        </h2>
      </div>

      <div className="catalog-grid" data-cy="catalog-grid" ref={gridRef}>
        {CATALOG.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] || 0}
            onQuantityChange={onQuantityChange}
          />
        ))}
      </div>
    </section>
  );
};
