describe('BelGrano Café - Pruebas End-to-End (Cypress)', () => {
  beforeEach(() => {
    // Cada test inicia en un estado limpio navegando a la raíz
    cy.visit('/');
    cy.get('[data-cy="brand-title"]').should('be.visible').and('contain.text', 'BelGrano Café');
  });

  it('Flujo 1 [UC-01]: Cliente arma un pedido válido con múltiples productos y calcula sin problemas', () => {
    // 2 Espressos ($2.000 c/u) = $4.000 + 1 Cappuccino ($3.500) = $7.500
    cy.get('[data-cy="btn-inc-espresso"]').click().click();
    cy.get('[data-cy="qty-input-espresso"]').should('have.value', '2');

    cy.get('[data-cy="btn-inc-cappuccino"]').click();
    cy.get('[data-cy="qty-input-cappuccino"]').should('have.value', '1');

    cy.get('[data-cy="btn-calculate"]').click();

    cy.get('[data-cy="order-receipt"]').should('be.visible');
    cy.get('[data-cy="receipt-subtotal"]').should('contain.text', '7.500');
    cy.get('[data-cy="receipt-total"]').should('contain.text', '7.500');
  });

  it('Flujo 2: Cliente realiza un pedido inferior al umbral ($10.000) y no obtiene descuento base', () => {
    // 1 Americano ($2.500)
    cy.get('[data-cy="btn-inc-americano"]').click();
    cy.get('[data-cy="btn-calculate"]').click();

    cy.get('[data-cy="order-receipt"]').should('be.visible');
    cy.get('[data-cy="receipt-subtotal"]').should('contain.text', '2.500');
    cy.get('[data-cy="receipt-no-discount"]').should('contain.text', '0%');
    cy.get('[data-cy="receipt-total"]').should('contain.text', '2.500');
  });

  it('Flujo 3 [UC-02]: Cliente alcanza el umbral de $10.000 y obtiene el 5% de descuento base', () => {
    // 4 Americanos * $2.500 = $10.000 exactos
    cy.get('[data-cy="btn-inc-americano"]').click().click().click().click();
    cy.get('[data-cy="btn-calculate"]').click();

    cy.get('[data-cy="order-receipt"]').should('be.visible');
    cy.get('[data-cy="receipt-subtotal"]').should('contain.text', '10.000');
    cy.get('[data-cy="receipt-discount-base"]').should('contain.text', '5%').and('contain.text', '500');
    cy.get('[data-cy="receipt-total"]').should('contain.text', '9.500');
  });

  it('Flujo 4 [UC-03]: Cliente fiel obtiene el beneficio del 5% adicional', () => {
    // 1 Cappuccino ($3.500)
    cy.get('[data-cy="btn-inc-cappuccino"]').click();
    cy.get('[data-cy="loyalty-input"]').type('SOCIO-101');

    cy.get('[data-cy="btn-calculate"]').click();

    cy.get('[data-cy="order-receipt"]').should('be.visible');
    cy.get('[data-cy="receipt-subtotal"]').should('contain.text', '3.500');
    cy.get('[data-cy="receipt-discount-loyalty"]').should('contain.text', '5%').and('contain.text', '175');
    cy.get('[data-cy="receipt-total"]').should('contain.text', '3.325');
  });

  it('Flujo 5 [UC-04]: Cliente aplica cupón válido en pedido superior al umbral y obtiene 15% de descuento', () => {
    // 3 Lattes ($3.800 c/u) = $11.400
    cy.get('[data-cy="btn-inc-latte"]').click().click().click();
    cy.get('[data-cy="coupon-input"]').type('  BELGRANOCAFE10  ');

    cy.get('[data-cy="btn-calculate"]').click();

    cy.get('[data-cy="alert-success"]').should('be.visible').and('contain.text', '10% de descuento adicional');
    cy.get('[data-cy="receipt-discount-base"]').should('contain.text', '5%');
    cy.get('[data-cy="receipt-discount-coupon"]').should('contain.text', '10%').and('contain.text', '1.140');
    cy.get('[data-cy="receipt-total"]').should('contain.text', '9.690');
  });

  it('Flujo 6 [UC-05]: Cliente combina fidelidad y cupón alcanzando 20% de descuento', () => {
    // 4 Americanos ($10.000)
    cy.get('[data-cy="btn-inc-americano"]').click().click().click().click();
    cy.get('[data-cy="loyalty-input"]').type('SOCIO-101');
    cy.get('[data-cy="coupon-input"]').type('belgranocafe10');

    cy.get('[data-cy="btn-calculate"]').click();

    cy.get('[data-cy="receipt-discount-base"]').should('contain.text', '5%');
    cy.get('[data-cy="receipt-discount-loyalty"]').should('contain.text', '5%');
    cy.get('[data-cy="receipt-discount-coupon"]').should('contain.text', '10%');
    cy.get('[data-cy="receipt-savings"]').should('contain.text', '20% OFF').and('contain.text', '2.000');
    cy.get('[data-cy="receipt-total"]').should('contain.text', '8.000');
  });

  it('Flujo 7 [UC-07]: Cliente introduce un cupón inválido y el sistema informa el error sin aplicar bonificación', () => {
    // 4 Americanos ($10.000)
    cy.get('[data-cy="btn-inc-americano"]').click().click().click().click();
    cy.get('[data-cy="coupon-input"]').type('CUPON_NO_EXISTENTE');

    cy.get('[data-cy="btn-calculate"]').click();

    cy.get('[data-cy="alert-warning"]').should('be.visible').and('contain.text', 'Cupón no válido');
    cy.get('[data-cy="receipt-discount-base"]').should('contain.text', '5%');
    cy.get('[data-cy="receipt-total"]').should('contain.text', '9.500');
  });

  it('Flujo 8 [UC-08]: Cliente intenta calcular un pedido vacío y recibe validación sin liquidar compra', () => {
    cy.get('[data-cy="btn-calculate"]').click();

    cy.get('[data-cy="alert-error"]').should('be.visible').and('contain.text', 'El pedido debe contener al menos un producto');
    cy.get('[data-cy="order-receipt"]').should('not.exist');
  });

  it('Flujo 9 [UC-09]: Cliente intenta ingresar una cantidad fuera de rango y el sistema previene el pedido', () => {
    cy.get('[data-cy="qty-input-espresso"]').clear().type('25');
    cy.get('[data-cy="btn-calculate"]').click();

    cy.get('[data-cy="alert-error"]').should('be.visible').and('contain.text', 'La cantidad máxima por producto es 20 unidades');
    cy.get('[data-cy="order-receipt"]').should('not.exist');
  });

  it('Flujo 10 [UC-10]: Cliente reinicia el pedido y se restablecen todas las opciones a cero', () => {
    // 5 Espressos ($10.000) para habilitar cupón sin advertencia de umbral
    cy.get('[data-cy="btn-inc-espresso"]').click().click().click().click().click();
    cy.get('[data-cy="loyalty-input"]').type('SOCIO-101');
    cy.get('[data-cy="coupon-input"]').type('BELGRANOCAFE10');
    cy.get('[data-cy="btn-calculate"]').click();

    cy.get('[data-cy="order-receipt"]').should('exist');

    // Clic en reiniciar
    cy.get('[data-cy="btn-reset"]').click();

    cy.get('[data-cy="order-receipt"]').should('not.exist');
    cy.get('[data-cy="loyalty-input"]').should('have.value', '');
    cy.get('[data-cy="coupon-input"]').should('have.value', '');
    cy.get('[data-cy="qty-input-espresso"]').should('have.value', '0');
  });
});
