describe('BelGrano Café - Responsive & Visual Integrity Tests', () => {
  const viewports: [number, number, string][] = [
    [320, 568, 'Mobile Small (iPhone SE 1st gen)'],
    [360, 640, 'Mobile Standard (Android 360px)'],
    [375, 667, 'Mobile Medium (iPhone 8)'],
    [768, 1024, 'Tablet (iPad Portrait)'],
    [1280, 800, 'Desktop']
  ];

  viewports.forEach(([width, height, device]) => {
    it(`No debe tener desbordamiento horizontal en ${device} (${width}x${height})`, () => {
      cy.viewport(width, height);
      cy.visit('/');
      cy.get('[data-cy="brand-title"]').should('be.visible');

      // Agregar productos para que el pedido tenga ítems
      cy.get('[data-cy="btn-inc-espresso"]').click().click();
      cy.get('[data-cy="qty-input-espresso"]').should('have.value', '2');

      // Calcular pedido para desplegar alertas y recibo
      cy.get('[data-cy="btn-calculate"]').click();
      cy.get('[data-cy="order-receipt"]').should('be.visible');

      // Verificar que el ancho de scroll del documento no exceda el viewport
      cy.window().then((win) => {
        const scrollWidth = win.document.documentElement.scrollWidth;
        const innerWidth = win.innerWidth;
        expect(scrollWidth, `scrollWidth (${scrollWidth}) no debe exceder innerWidth (${innerWidth})`).to.be.lte(innerWidth);
      });
    });
  });

  it('Verifica ausencia total de emojis en el DOM', () => {
    cy.visit('/');
    cy.get('[data-cy="brand-title"]').should('be.visible');
    cy.get('[data-cy="btn-inc-cappuccino"]').click();
    cy.get('[data-cy="btn-calculate"]').click();
    cy.get('[data-cy="order-receipt"]').should('be.visible');

    cy.window().then((win) => {
      // Regex para emojis estándar y pictogramas extendidos
      const emojiRegex = /[\p{Extended_Pictographic}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
      const text = win.document.body.innerText;
      expect(emojiRegex.test(text), 'El DOM no debe contener emojis').to.be.false;
    });
  });

  it('Verifica soporte de prefers-reduced-motion', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win, 'matchMedia').callsFake((query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }));
      }
    });

    cy.get('[data-cy="brand-title"]').should('be.visible');
    cy.get('.navbar-wrapper').should('have.css', 'opacity', '1');
    cy.get('.product-card').first().should('have.css', 'opacity', '1');
  });

  it('Verifica fijación sticky de navbar durante scroll de página', () => {
    cy.viewport(1280, 800);
    cy.visit('/');
    // Esperar a que finalice la animación de entrada (0.4s) y se limpie el transform
    cy.wait(500);
    cy.scrollTo(0, 500);
    cy.get('.navbar-wrapper').then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      expect(rect.top).to.be.closeTo(0, 1);
    });
  });

  it('Mantiene alerta de cantidad máxima si otro producto excede el límite de 20', () => {
    cy.visit('/');
    cy.get('[data-cy="qty-input-espresso"]').clear().type('25');
    cy.get('[data-cy="alert-error"]').should('be.visible').and('contain.text', 'La cantidad máxima por producto es 20 unidades');

    cy.get('[data-cy="btn-inc-cookie"]').click();
    cy.get('[data-cy="alert-error"]').should('be.visible').and('contain.text', 'La cantidad máxima por producto es 20 unidades');
  });

  it('Verifica que scroll-padding-top esté configurado para navegación por anclas sin solapamiento', () => {
    cy.visit('/');
    cy.window().then((win) => {
      const scrollPaddingTop = win.getComputedStyle(win.document.documentElement).scrollPaddingTop;
      expect(parseInt(scrollPaddingTop, 10)).to.be.gte(56);
    });

    // Clic en enlace de carta despliega la sección sin quedar oculta
    cy.get('a[href="#carta"]').first().click();
    cy.get('#carta').should('be.visible');
  });

  it('Verifica que los puntos de contacto del footer tengan enlaces semánticos accesibles (tel y mailto)', () => {
    cy.visit('/');
    cy.get('.footer-contact-link[href^="tel:"]').should('have.attr', 'href', 'tel:+543414258900');
    cy.get('.footer-contact-link[href^="mailto:"]').should('have.attr', 'href', 'mailto:hola@belgranocafe.com.ar');
  });
});
