import { db, Product } from '../models/DatabaseAdapter';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutCalculation {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemsCount: number;
}

export class CheckoutService {
  public static calculateTotals(items: { productId: string; quantity: number }[]): CheckoutCalculation {
    let subtotal = 0;
    let itemsCount = 0;

    for (const item of items) {
      const product = db.getProductById(item.productId);
      if (product) {
        subtotal += product.price * item.quantity;
        itemsCount += item.quantity;
      }
    }

    subtotal = parseFloat(subtotal.toFixed(2));
    const shipping = subtotal > 200 || subtotal === 0 ? 0 : 15.0;
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + shipping + tax).toFixed(2));

    return {
      subtotal,
      shipping,
      tax,
      total,
      itemsCount
    };
  }

  public static async processPayment(
    payload: {
      amount: number;
      sessionId: string;
      syntheticCardLast4?: string;
    }
  ): Promise<{ success: boolean; transactionId?: string; message: string }> {
    const { amount, sessionId } = payload;

    if (!amount || amount <= 0) {
      return {
        success: false,
        message: 'Invalid payment amount'
      };
    }

    // Process synthetic transaction
    const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    db.logAudit('PAYMENT_PROCESSED', sessionId, {
      amount,
      transactionId,
      status: 'success'
    });

    return {
      success: true,
      transactionId,
      message: 'Synthetic payment processed successfully'
    };
  }
}
