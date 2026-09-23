import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Gift
} from 'lucide-react';
import { Product } from './ProductCard';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  const [isGift, setIsGift] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const delivery = 0; // Free delivery with Prime
  const tax = subtotal * 0.08;
  const total = subtotal + delivery + tax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Shopping Cart ({totalCount} {totalCount === 1 ? 'item' : 'items'})
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your order qualifies for FREE Prime Delivery</span>
                </div>
              </div>
              <button
                onClick={onClose}
                id="close-cart-btn"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress bar */}
            <div className="mt-3 pt-2 border-t border-slate-200/80">
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full rounded-full"></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>Prime Delivery threshold reached</span>
                <span className="font-bold text-emerald-700">FREE</span>
              </p>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <X className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">Your SafeReplay Cart is empty.</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Your shopping cart is waiting. Give it purpose by filling it with high-end tech essentials.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                >
                  Explore Today's Deals
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3.5 items-start shadow-xs hover:border-slate-300 transition-colors"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-white shrink-0 border border-slate-100 p-1"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-bold mt-0.5">In Stock</p>
                    <p className="text-sm font-black text-slate-900 mt-1">
                      ${item.product.price.toFixed(2)}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {/* Amazon Quantity Pill */}
                      <div className="flex items-center border border-slate-300 rounded-full bg-slate-50 px-1 py-0.5 shadow-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-slate-900 px-2.5">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 text-xs font-semibold hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <button
                        className="text-slate-400 hover:text-slate-700 text-xs font-semibold hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                        onClick={() => onRemoveItem(item.product.id)}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save for later</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Amazon Checkout Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/80 space-y-3.5">
              {/* Gift Option */}
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 h-3.5 w-3.5 border-slate-300"
                />
                <Gift className="w-3.5 h-3.5 text-slate-500" />
                <span>This order contains a gift</span>
              </label>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Subtotal ({totalCount} items):</span>
                  <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prime Delivery:</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%):</span>
                  <span className="text-slate-900 font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-extrabold text-slate-900">
                  <span>Order Total:</span>
                  <span className="text-slate-900">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Amazon Yellow Proceed Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                id="proceed-to-checkout-btn"
                className="w-full py-3.5 bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 rounded-full font-extrabold text-sm shadow-xs border border-[#FCD200] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Proceed to checkout ({totalCount} items)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by SafeReplay Zero-PII Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
