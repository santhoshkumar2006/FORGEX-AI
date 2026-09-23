import React, { useState } from 'react';
import {
  Shield,
  Lock,
  CreditCard,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  MapPin,
  Truck,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { CartItem } from './CartDrawer';

interface CheckoutProps {
  items: CartItem[];
  sessionId: string;
  onBack: () => void;
  onOrderSuccess: (recordId: string) => void;
  onOrderFailure: (reason: string) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({
  items,
  sessionId,
  onBack,
  onOrderSuccess,
  onOrderFailure
}) => {
  const [formData, setFormData] = useState({
    name: 'Alex Developer',
    email: 'alex.developer@example.synthetic',
    phone: '555-0199',
    address: '100 Silicon Valley Way, Suite 400',
    cardLast4: '4242',
    cvv: '123'
  });

  const [deliverySpeed, setDeliverySpeed] = useState<'prime' | 'standard'>('prime');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const delivery = 0; // Free Prime delivery
  const tax = subtotal * 0.08;
  const total = subtotal + delivery + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!formData.name || !formData.email || !formData.address) {
      setIsLoading(false);
      setErrorMessage('Please fill in all required customer details');
      return;
    }

    try {
      const response = await fetch('/api/customer-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          sessionId
        })
      });

      const data = await response.json();

      if (!response.ok || !data.saved) {
        const failReason = data.reason || 'Database transaction failed';
        setErrorMessage(failReason);
        onOrderFailure(failReason);
      } else {
        onOrderSuccess(data.recordId || 'REC-1042');
      }
    } catch (err: any) {
      const msg = err.message || 'Network request failed';
      setErrorMessage(msg);
      onOrderFailure(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Amazon-style Checkout Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <button
          onClick={onBack}
          id="back-to-store-btn"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xl tracking-tight">
          <Lock className="w-5 h-5 text-amber-500" />
          <span>Checkout ({totalCount} {totalCount === 1 ? 'item' : 'items'})</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero-PII Mode Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 3-Step Amazon Checkout Cards */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-base font-bold text-slate-900">Delivery Address</h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>data-private (Masked)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (Synthetic) <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="customer-name"
                    data-private
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Synthetic) <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="customer-email"
                    data-private
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (Synthetic)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="customer-phone"
                    data-private
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address (Synthetic) <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="customer-address"
                    data-private
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method (Blocked from Replay) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-base font-bold text-slate-900">Payment Method</h3>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 font-mono">
                  data-replay-block
                </span>
              </div>

              <div data-replay-block className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                    <CreditCard className="w-4 h-4 text-slate-700" />
                    <span>Amazon Prime Store Card / Visa ending in 4242</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Exp: 12/28</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1 font-medium">Name on card</span>
                    <input
                      type="text"
                      disabled
                      value="Alex Developer"
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1 font-medium">Security Code (CVV)</span>
                    <input
                      type="password"
                      id="card-cvv"
                      data-private
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                      maxLength={3}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Review Items & Delivery */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-base font-bold text-slate-900">Review Items and Prime Delivery</h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Guaranteed: Tomorrow, 7 AM - 11 AM</span>
                </div>
              </div>

              {/* Delivery Speed Selection */}
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="delivery_speed"
                    checked={deliverySpeed === 'prime'}
                    onChange={() => setDeliverySpeed('prime')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-bold text-sky-800 uppercase text-[10px] bg-sky-100 px-1.5 py-0.5 rounded border border-sky-200">
                    prime
                  </span>
                  <span>FREE Two-Day Delivery (Guaranteed Tomorrow morning) — $0.00</span>
                </label>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Quantity: <span className="font-bold text-slate-900">{item.quantity}</span></p>
                    </div>
                    <span className="text-sm font-black text-slate-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 shadow-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-rose-900">Important Message: An error occurred with your submission</p>
                  <p className="text-rose-700">{errorMessage}</p>
                  <div className="pt-2 flex items-center gap-3">
                    <a
                      href="http://localhost:3001"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Inspect Fix in SafeReplay Dev Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Amazon Yellow Place Order Button */}
            <button
              type="submit"
              id="submit-order-btn"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#FFD814] hover:bg-[#F7CA00] disabled:opacity-50 text-slate-900 font-extrabold text-sm rounded-full shadow-xs hover:shadow border border-[#FCD200] flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Placing order in USD...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place your order in USD (${total.toFixed(2)})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Amazon Order Summary Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 sticky top-24">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] disabled:opacity-50 text-slate-900 font-extrabold text-xs rounded-full shadow-xs border border-[#FCD200] flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>Place your order</span>
            </button>

            <p className="text-[11px] text-slate-500 text-center leading-tight">
              By placing your order, you agree to SafeReplay's privacy notice and conditions of use.
            </p>

            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <h4 className="font-extrabold text-slate-900 text-sm pb-1">Order Summary</h4>
              <div className="flex justify-between">
                <span>Items ({totalCount}):</span>
                <span className="text-slate-900 font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & handling:</span>
                <span className="text-slate-900 font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated tax:</span>
                <span className="text-slate-900 font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-black text-rose-700">
                <span>Order Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Controlled Demo Simulation Notice */}
            <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200 text-[11px] text-slate-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Controlled Demo Error Scenario</span>
              </div>
              <p className="text-slate-600 leading-snug">
                Submitting this order triggers the simulated backend database transaction error at <code className="font-mono font-bold text-amber-900">CustomerDetailsService.ts:48</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
