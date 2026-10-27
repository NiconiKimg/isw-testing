import React from 'react';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { ProductCatalog } from './components/ProductCatalog';
import { OrderSummary } from './components/OrderSummary';
import { Footer } from './components/Footer';
import { useOrder } from './hooks/useOrder';
import './styles/app.css';

export const App: React.FC = () => {
  const {
    quantities,
    membershipCode,
    couponCode,
    calculationResult,
    validationError,
    handleQuantityChange,
    handleMembershipChange,
    handleCouponChange,
    handleCalculate,
    handleReset
  } = useOrder();

  return (
    <div className="app-shell">
      {/* Fondo sutil animado constante */}
      <div className="ambient-background" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      <Navbar />

      <div className="app-container">
        <Header />

        <main className="main-content">
          <ProductCatalog
            quantities={quantities}
            onQuantityChange={handleQuantityChange}
          />

          <OrderSummary
            membershipCode={membershipCode}
            couponCode={couponCode}
            onMembershipChange={handleMembershipChange}
            onCouponChange={handleCouponChange}
            onCalculate={handleCalculate}
            onReset={handleReset}
            calculationResult={calculationResult}
            validationError={validationError}
          />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default App;
