import React from 'react';
import { Product, PRODUCT_LIMITS } from '../data/products';
import { formatARS } from '../domain/pricing';

interface ProductCardProps {
  readonly product: Product;
  readonly quantity: number;
  readonly onQuantityChange: (productId: string, newQty: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onQuantityChange
}) => {
  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(product.id, quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < PRODUCT_LIMITS.MAX_QUANTITY_PER_ITEM) {
      onQuantityChange(product.id, quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onQuantityChange(product.id, 0);
      return;
    }
    const parsed = parseInt(val, 10);
    if (!Number.isNaN(parsed)) {
      onQuantityChange(product.id, parsed);
    }
  };

  return (
    <article
      className={`product-card product-item ${quantity > 0 ? 'has-items' : ''}`}
      data-cy={`product-card-${product.id}`}
    >
      <div className="product-layout">
        {product.image && (
          <div className="product-media">
            <img
              src={product.image}
              alt={product.imageAlt || product.name}
              className="product-image"
              loading="lazy"
              width="110"
              height="110"
            />
            <span className="product-category-tag">
              {product.category === 'coffee' ? 'Especialidad' : 'Pastelería'}
            </span>
          </div>
        )}

        <div className="product-details">
          <header className="product-header">
            <h3 className="product-name">{product.name}</h3>
            <span className="product-price">{formatARS(product.price)}</span>
          </header>
          <p className="product-description">{product.description}</p>

          <div className="product-actions">
            <div className="quantity-control">
              <button
                type="button"
                className="qty-btn"
                onClick={handleDecrement}
                disabled={quantity <= 0}
                aria-label={`Disminuir cantidad de ${product.name}`}
                data-cy={`btn-dec-${product.id}`}
              >
                -
              </button>
              <input
                type="number"
                min="0"
                max={PRODUCT_LIMITS.MAX_QUANTITY_PER_ITEM}
                value={quantity}
                onChange={handleInputChange}
                className="qty-input"
                aria-label={`Cantidad de ${product.name}`}
                data-cy={`qty-input-${product.id}`}
              />
              <button
                type="button"
                className="qty-btn"
                onClick={handleIncrement}
                disabled={quantity >= PRODUCT_LIMITS.MAX_QUANTITY_PER_ITEM}
                aria-label={`Aumentar cantidad de ${product.name}`}
                data-cy={`btn-inc-${product.id}`}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
