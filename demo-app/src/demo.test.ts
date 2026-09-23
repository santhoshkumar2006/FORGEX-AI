import { describe, it, expect } from 'vitest';

describe('Demo App Frontend Calculation and Validation Tests', () => {
  it('calculates subtotal, shipping and taxes accurately', () => {
    const items = [
      { price: 199.99, quantity: 1 },
      { price: 89.00, quantity: 2 }
    ];

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal > 200 ? 0 : 15.0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    expect(subtotal).toBe(377.99);
    expect(shipping).toBe(0); // Free shipping over $200
    expect(total).toBeCloseTo(408.2292, 2);
  });

  it('validates checkout form requirements', () => {
    const invalidForm = { name: '', email: '', address: '' };
    const isValid = Boolean(invalidForm.name && invalidForm.email && invalidForm.address);
    expect(isValid).toBe(false);

    const validForm = {
      name: 'Alex Developer',
      email: 'alex@example.synthetic',
      address: '100 Silicon Way'
    };
    const isFormValid = Boolean(validForm.name && validForm.email && validForm.address);
    expect(isFormValid).toBe(true);
  });
});
