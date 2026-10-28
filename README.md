# BelGrano Café - Sistema de Gestión de Pedidos

Proyecto práctico de aseguramiento de calidad y pruebas automatizadas de software desarrollado para la cátedra **Ingeniería y Calidad de Software (UTN FRRO)**.

---

## ☕ Acerca del Proyecto

**BelGrano Café** es una aplicación web interactiva desarrollada para una cafetería de especialidad y tostaduría artesanal en Rosario, Santa Fe. El sistema permite seleccionar productos del catálogo, calcular subtotales, aplicar descuentos comerciales escalonados, validar programas de fidelidad para socios y procesar cupones promocionales bajo reglas de negocio estrictas.

---

## 🛠️ Stack Tecnológico

* **Lenguaje:** [TypeScript 5.x](https://www.typescriptlang.org/) (Strict Mode)
* **Librería UI:** [React 18.x](https://react.dev/)
* **Bundler & Dev Server:** [Vite 6.x](https://vitejs.dev/)
* **Pruebas Unitarias y Lógica de Dominio:** [Vitest](https://vitest.dev/)
* **Pruebas de Integración y Componentes:** [React Testing Library](https://testing-library.com/)
* **Pruebas End-to-End (E2E):** [Cypress 13.x](https://www.cypress.io/)
* **Integración Continua (CI):** [GitHub Actions](https://github.com/features/actions)
* **Panel de Métricas y Grabación en la Nube:** [Cypress Cloud](https://cloud.cypress.io/)

---

## 🏛️ Pirámide de Pruebas y Técnicas Formales

El plan de aseguramiento de la calidad está estructurado bajo las directivas de *Lean Testing* y el patrón **Arrange - Act - Assert (AAA)**:

1. **Pruebas Unitarias (Vitest):**
   - Validación pura de funciones de dominio sin dependencias del DOM.
   - **Análisis de Valores Límite (BVA):** Cobertura exhaustiva en fronteras de cantidades ([1, 20]), subtotal máximo ($100.000) y umbral de descuento base ($10.000).
   - **Tablas de Decisión (DT):** 11 reglas formales que cubren todas las combinaciones posibles de cliente fidelizado, cupones y umbrales de importe.
   - **Guarda de Seguridad (Safety Cap):** Tope del 25% de descuento máximo acumulado y redondeo comercial Half-Up a 2 decimales.

2. **Pruebas de Integración de Componentes (React Testing Library):**
   - Interacción entre catálogo, formularios, alertas de accesibilidad (ARIA) y cálculo reactivo en vivo.
   - Comportamiento de reseteo, mensajes de advertencia y directivas WCAG 2.2 AA.

3. **Pruebas End-to-End (Cypress):**
   - Simulación de usuario real en navegador Chromium / Electron.
   - 10 flujos críticos de usuario (armado de carrito, cupones, fidelidad, validación de errores).
   - Suite de diseño responsivo (5 viewports de pantalla), navegación por anclas y verificación de ausencia de emojis.

---

## 🚀 Comandos de Ejecución Local

### 1. Instalación determinista
```bash
npm ci
```

### 2. Verificación Estática de Tipos (TypeScript)
```bash
npm run typecheck
```

### 3. Pruebas por Nivel (Vitest)
```bash
# Pruebas unitarias de dominio puro
npm run test:unit

# Pruebas de integración de componentes e interfaz
npm run test:integration

# Suite completa desatendida (unitarias + integración)
npm run test:run

# Modo interactivo con hot-reload
npm run test
```

### 4. Compilación para Producción (Vite)
```bash
npm run build
```

### 5. Pruebas End-to-End (Cypress)
```bash
# Modo automatizado desatendido (inicia preview server y ejecuta specs)
npm run test:e2e

# Modo interactivo (Test Runner UI con Time-Travel)
npm run build
npm run preview
# En otra terminal:
npm run cypress:open
```

### 6. Verificación Integral Local (Reproduce el Pipeline de CI)
```bash
npm run verify:all
```

---

## ☁️ Integración Continua (CI) en 3 Flujos Independientes

El proyecto implementa 3 flujos de trabajo (*workflows*) separados en GitHub Actions:

1. **Flujo 1: Pruebas Unitarias (`.github/workflows/unit-tests.yml`):**
   - Ejecuta chequeo estático de tipos (`npm run typecheck`).
   - Ejecuta la suite de 51 pruebas unitarias puras (`npm run test:unit`).

2. **Flujo 2: Pruebas de Integración (`.github/workflows/integration-tests.yml`):**
   - Ejecuta las 12 pruebas de integración con React Testing Library (`npm run test:integration`).

3. **Flujo 3: Pruebas End-to-End (`.github/workflows/e2e-tests.yml`):**
   - Compila el bundle de producción (`npm run build`).
   - Ejecuta Cypress en Chromium real con grabación automatizada a [Cypress Cloud](https://cloud.cypress.io/) (`Project ID: bu64z5`).
