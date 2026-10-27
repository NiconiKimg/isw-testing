import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

describe('Integration Tests: Flujos de Interfaz y Negocio (React Testing Library)', () => {
  it('renderiza la cabecera, catálogo y panel de pedido accesible', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /BelGrano Café/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Nuestra Carta de Café & Pastelería/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Tu Pedido/i })).toBeInTheDocument();

    // Comprobar que los productos clave están en pantalla
    expect(screen.getByText('Espresso')).toBeInTheDocument();
    expect(screen.getByText('Cappuccino')).toBeInTheDocument();
    expect(screen.getByText('Latte')).toBeInTheDocument();
  });

  it('impide calcular un pedido vacío y muestra alerta accesible', async () => {
    const user = userEvent.setup();
    render(<App />);

    const calculateBtn = screen.getByRole('button', { name: /Calcular Pedido/i });
    await user.click(calculateBtn);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/El pedido debe contener al menos un producto/i);
    expect(screen.queryByText(/Total a pagar:/i)).not.toBeInTheDocument();
  });

  it('permite seleccionar un producto, modificar cantidad y calcular total sin descuentos (< $10.000)', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Incrementar 2 unidades de Espresso ($2.000 c/u)
    const incEspresso = screen.getByRole('button', { name: /Aumentar cantidad de Espresso/i });
    await user.click(incEspresso);
    await user.click(incEspresso);

    // Verificar cantidad de ítem en tarjeta
    const espressoInput = screen.getByRole('spinbutton', { name: /^Cantidad de Espresso$/i });
    expect(espressoInput).toHaveValue(2);

    // Calcular
    const calculateBtn = screen.getByRole('button', { name: /Calcular Pedido/i });
    await user.click(calculateBtn);

    // Verificar desglose
    expect(screen.getByText(/Subtotal productos:/i)).toBeInTheDocument();
    expect(screen.getByText(/Descuentos aplicados:/i)).toBeInTheDocument();
    expect(screen.getByText(/Total a pagar:/i)).toBeInTheDocument();
    expect(screen.getByTestId('receipt-total')).toHaveTextContent(/4\.000/);
  });

  it('alcanza el umbral de $10.000 y visualiza el desglose con descuento base del 5%', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 4 Americanos ($2.500 c/u) = $10.000
    const incAmericano = screen.getByRole('button', { name: /Aumentar cantidad de Americano/i });
    for (let i = 0; i < 4; i++) {
      await user.click(incAmericano);
    }

    const calculateBtn = screen.getByRole('button', { name: /Calcular Pedido/i });
    await user.click(calculateBtn);

    // Debe mostrar descuento base del 5% (-$500) y total $9.500
    expect(screen.getByText(/Descuento base \(5%\):/i)).toBeInTheDocument();
    expect(screen.getByText(/-\$ 500/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ 9\.500/i)).toBeInTheDocument();
  });

  it('activa el beneficio de fidelidad e incrementa el descuento en 5%', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1 Cappuccino ($3.500)
    const incCap = screen.getByRole('button', { name: /Aumentar cantidad de Cappuccino/i });
    await user.click(incCap);

    // Ingresar código de socio válido
    const loyaltyInput = screen.getByRole('textbox', { name: /Programa de Fidelidad BelGrano Club/i });
    await user.type(loyaltyInput, 'SOCIO-101');

    const calculateBtn = screen.getByRole('button', { name: /Calcular Pedido/i });
    await user.click(calculateBtn);

    // 5% de fidelidad sobre $3.500 = $175 -> Total: $3.325
    expect(screen.getByText(/Beneficio Fidelidad \(5%\):/i)).toBeInTheDocument();
    expect(screen.getByText(/-\$ 175/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ 3\.325/i)).toBeInTheDocument();
  });

  it('aplica cupón válido con subtotal >= $10.000 y refleja mensaje de éxito', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 3 Lattes ($3.800 c/u) = $11.400
    const incLatte = screen.getByRole('button', { name: /Aumentar cantidad de Latte/i });
    for (let i = 0; i < 3; i++) {
      await user.click(incLatte);
    }

    // Ingresar cupón
    const couponInput = screen.getByRole('textbox', { name: /¿Tenés un cupón promocional\?/i });
    await user.type(couponInput, '  belgranocafe10  ');

    const calculateBtn = screen.getByRole('button', { name: /Calcular Pedido/i });
    await user.click(calculateBtn);

    // Descuento total: 5% base + 10% cupón = 15% ($1.710) -> Total: $9.690
    expect(screen.getByRole('status')).toHaveTextContent(/Cupón BELGRANOCAFE10 aplicado: 10% de descuento adicional/i);
    expect(screen.getByText(/Cupón promocional \(10%\):/i)).toBeInTheDocument();
    expect(screen.getByText(/-\$ 1\.140/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ 9\.690/i)).toBeInTheDocument();
  });

  it('alerta cuando se ingresa un cupón válido pero el subtotal es menor a $10.000', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1 Espresso ($2.000)
    const incEspresso = screen.getByRole('button', { name: /Aumentar cantidad de Espresso/i });
    await user.click(incEspresso);

    const couponInput = screen.getByRole('textbox', { name: /¿Tenés un cupón promocional\?/i });
    await user.type(couponInput, 'BELGRANOCAFE10');

    const calculateBtn = screen.getByRole('button', { name: /Calcular Pedido/i });
    await user.click(calculateBtn);

    // Debe mostrar alerta de que requiere $10.000
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/El cupón requiere un subtotal mínimo de \$10\.000/i);
    // Total sin descuento
    expect(screen.getByTestId('receipt-total')).toHaveTextContent(/2\.000/);
  });

  it('informa error ante cupón no reconocido', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 4 Americanos ($10.000)
    const incAmericano = screen.getByRole('button', { name: /Aumentar cantidad de Americano/i });
    for (let i = 0; i < 4; i++) {
      await user.click(incAmericano);
    }

    const couponInput = screen.getByRole('textbox', { name: /¿Tenés un cupón promocional\?/i });
    await user.type(couponInput, 'DESCUENTO_TRUCHO');

    const calculateBtn = screen.getByRole('button', { name: /Calcular Pedido/i });
    await user.click(calculateBtn);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/Cupón no válido/i);
    // Aplica solo el 5% base ($9.500)
    expect(screen.getByText(/\$ 9\.500/i)).toBeInTheDocument();
  });

  it('bloquea cálculo y notifica si la cantidad excede el límite máximo de 20 unidades', async () => {
    const user = userEvent.setup();
    render(<App />);

    const espressoInput = screen.getByRole('spinbutton', { name: /Cantidad de Espresso/i });
    await user.clear(espressoInput);
    await user.type(espressoInput, '25');

    const calculateBtn = screen.getByRole('button', { name: /Calcular Pedido/i });
    await user.click(calculateBtn);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/La cantidad máxima por producto es 20 unidades/i);
    expect(screen.queryByText(/Total a pagar:/i)).not.toBeInTheDocument();
  });

  it('permite reiniciar el pedido y restablecer el estado inicial', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Agregar items y fidelidad
    const incCap = screen.getByRole('button', { name: /Aumentar cantidad de Cappuccino/i });
    await user.click(incCap);

    const loyaltyInput = screen.getByRole('textbox', { name: /Programa de Fidelidad BelGrano Club/i });
    await user.type(loyaltyInput, 'SOCIO-101');

    const couponInput = screen.getByRole('textbox', { name: /¿Tenés un cupón promocional\?/i });
    await user.type(couponInput, 'BELGRANOCAFE10');

    // Reiniciar
    const resetBtn = screen.getByRole('button', { name: /Reiniciar Pedido/i });
    await user.click(resetBtn);

    // Verificar que todo se restablece
    expect(loyaltyInput).toHaveValue('');
    expect(couponInput).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/Total a pagar:/i)).not.toBeInTheDocument();
  });

  it('mantiene la alerta de cantidad máxima si otro producto todavía excede el límite de 20 unidades', async () => {
    const user = userEvent.setup();
    render(<App />);

    const espressoInput = screen.getByRole('spinbutton', { name: /Cantidad de Espresso/i });
    await user.clear(espressoInput);
    await user.type(espressoInput, '25');

    // Debe mostrar la alerta de validación
    expect(screen.getByRole('alert')).toHaveTextContent(/La cantidad máxima por producto es 20 unidades/i);

    // Modificar otro producto con cantidad válida
    const incCookie = screen.getByRole('button', { name: /Aumentar cantidad de Cookie/i });
    await user.click(incCookie);

    // La alerta DEBE continuar visible porque espresso sigue en 25
    expect(screen.getByRole('alert')).toHaveTextContent(/La cantidad máxima por producto es 20 unidades/i);
  });

  it('bloquea cálculo y muestra alerta de dominio si el subtotal supera el límite máximo de $100.000', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 20 Lattes ($3.800 * 20 = $76.000) + 20 Cappuccinos ($3.500 * 20 = $70.000) = $146.000
    const latteInput = screen.getByRole('spinbutton', { name: /Cantidad de Latte/i });
    await user.clear(latteInput);
    await user.type(latteInput, '20');

    const capInput = screen.getByRole('spinbutton', { name: /Cantidad de Cappuccino/i });
    await user.clear(capInput);
    await user.type(capInput, '20');

    const calculateBtn = screen.getByRole('button', { name: /Calcular Pedido/i });
    await user.click(calculateBtn);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/El importe del pedido no puede superar los \$100\.000/i);
    expect(screen.queryByText(/Total a pagar:/i)).not.toBeInTheDocument();

    // Reducir cappuccino a 1 unidad ($76.000 + $3.500 = $79.500 <= $100.000)
    fireEvent.change(capInput, { target: { value: '1' } });

    await user.click(calculateBtn);
    expect(screen.getByText(/Total a pagar:/i)).toBeInTheDocument();
    expect(screen.getByTestId('receipt-subtotal')).toHaveTextContent(/79\.500/);
  });
});
