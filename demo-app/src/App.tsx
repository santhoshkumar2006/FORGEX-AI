import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { ProductCard, Product } from './components/ProductCard';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { Checkout } from './components/Checkout';
import { OrderResultModal } from './components/OrderResultModal';
import { startReplay, stopReplay, recordEvent } from '@safereplay/sdk';
import {
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Zap,
  Clock,
  ChevronRight,
  CheckCircle2,
  Lock,
  RotateCcw,
  Truck,
  Award
} from 'lucide-react';

const DEMO_SESSION_ID = 'SR-1042';

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'catalog' | 'checkout'>('catalog');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderOutcome, setOrderOutcome] = useState<{ isSuccess: boolean; recordId?: string; reason?: string }>({
    isSuccess: false
  });

  useEffect(() => {
    // Automatically reset demo state on page load / refresh so initial checkout encounters the controlled error
    fetch('/api/verification/reset-fix', { method: 'POST' }).catch(() => {});

    startReplay({
      sessionId: DEMO_SESSION_ID,
      uploadUrl: '/api/sessions/events',
      maskInputs: true,
      enabled: true,
      debug: true
    });

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
        }
      })
      .catch((err) => {
        console.error('Failed to load products', err);
      });

    return () => {
      stopReplay();
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);

    recordEvent({
      sessionId: DEMO_SESSION_ID,
      type: 'click',
      page: '/',
      data: {
        action: 'add_to_cart',
        productId: product.id,
        productName: product.name,
        price: product.price
      }
    });
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    setCurrentView('checkout');
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOrderSuccess = (recordId: string) => {
    setOrderOutcome({ isSuccess: true, recordId });
    setIsModalOpen(true);
    setCart([]);
  };

  const handleOrderFailure = (reason: string) => {
    setOrderOutcome({ isSuccess: false, reason });
    setIsModalOpen(true);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Filter products by category & search term
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-400 selection:text-slate-900">
      {/* Top Privacy SDK Banner */}
      <PrivacyBanner sessionId={DEMO_SESSION_ID} />

      {/* Main Header */}
      <Header
        cartCount={totalCartCount}
        cartSubtotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateHome={() => {
          setCurrentView('catalog');
          setSelectedCategory('All');
          setSearchTerm('');
        }}
        currentView={currentView}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentView !== 'catalog') setCurrentView('catalog');
        }}
        onSearch={(term) => {
          setSearchTerm(term);
          if (currentView !== 'catalog') setCurrentView('catalog');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'catalog' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
            {/* Amazon-style Hero Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-12 overflow-hidden shadow-xl text-white border border-slate-700/50">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Spring Tech Event • SafeReplay Sandbox</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  Reproduce the bug. <br />
                  <span className="text-amber-400">Protect user privacy.</span> Verify the fix.
                </h1>

                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  Welcome to SafeReplay's Amazon-inspired demo store. Add items to your cart and proceed through checkout to trigger the controlled database rollback and inspect the AI fix.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {cart.length > 0 ? (
                    <button
                      onClick={() => setCurrentView('checkout')}
                      id="hero-checkout-btn"
                      className="inline-flex items-center gap-2 bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 text-xs font-extrabold px-6 py-3 rounded-full shadow-md transition-all active:scale-95 cursor-pointer border border-[#FCD200]"
                    >
                      <span>Proceed to Checkout ({totalCartCount} items)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (products.length > 0) handleAddToCart(products[0]);
                      }}
                      className="inline-flex items-center gap-2 bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 text-xs font-extrabold px-6 py-3 rounded-full shadow-md transition-all active:scale-95 cursor-pointer border border-[#FCD200]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Quick Add Demo Item to Cart</span>
                    </button>
                  )}

                  <a
                    href="http://localhost:3001"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-5 py-3 rounded-full backdrop-blur-sm border border-white/20 transition-colors"
                  >
                    <span>Open SafeReplay Dev Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Amazon 4-Quad Category Cards Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: PC Gaming & Peripherals */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-3">
                    PC Gaming & Audio
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {products.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleAddToCart(item)}
                        className="group cursor-pointer text-left"
                      >
                        <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-1 p-1 border border-slate-100 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="text-[11px] font-semibold text-slate-700 truncate group-hover:text-amber-600">
                          {item.name.split(',')[0]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory('Audio')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-100"
                >
                  <span>See more audio & gaming</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2: Workstation Essentials */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-3">
                    Workstation Tech
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {products.slice(4, 8).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleAddToCart(item)}
                        className="group cursor-pointer text-left"
                      >
                        <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-1 p-1 border border-slate-100 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="text-[11px] font-semibold text-slate-700 truncate group-hover:text-amber-600">
                          {item.name.split(',')[0]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory('Accessories')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer pt-2 border-t border-slate-100"
                >
                  <span>Shop workstation gear</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 3: SafeReplay AI Platform */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Zero-PII Engine
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">
                    SafeReplay Privacy
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Customer credit card CVVs, passwords, and sensitive tokens are dropped before network upload.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Input values pre-masked</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Atomic rollback logs captured</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Automated 1-click test fix</span>
                    </div>
                  </div>
                </div>
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer pt-3 border-t border-slate-100"
                >
                  <span>Explore Developer Studio</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Card 4: Today's Lightning Deal */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-white bg-rose-600 px-2 py-0.5 rounded">
                      Lightning Deal
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>02:45:18</span>
                    </div>
                  </div>

                  {products.length > 0 && (
                    <div className="space-y-2">
                      <div className="aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden p-2 border border-slate-100 flex items-center justify-center">
                        <img
                          src={products[0].image}
                          alt={products[0].name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-rose-600 font-black text-base">-20%</span>
                        <span className="text-slate-900 font-extrabold text-lg">$199.99</span>
                        <span className="text-slate-400 text-xs line-through">$249.99</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">
                        {products[0].name}
                      </p>

                      {/* Claimed progress */}
                      <div className="pt-1">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div className="bg-[#FFA41C] h-full w-4/5 rounded-full"></div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">82% claimed</p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => products.length > 0 && handleAddToCart(products[0])}
                  className="w-full py-2 bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 font-bold text-xs rounded-full shadow-xs border border-[#FCD200] mt-3 cursor-pointer"
                >
                  Claim Lightning Deal
                </button>
              </div>
            </div>

            {/* Product Catalog Grid */}
            <div className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {selectedCategory === 'All' ? 'Explore SafeReplay Hardware & Tech Store' : `${selectedCategory} Department`}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {filteredProducts.length} premium products • All transactions simulated with zero PII
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    {filteredProducts.length} Results
                  </span>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                  <p className="text-base font-bold text-slate-700">No products found for "{searchTerm}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing your search term or select "All Departments".</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                    }}
                    className="mt-4 px-4 py-2 bg-[#FFD814] text-slate-900 font-bold text-xs rounded-full cursor-pointer"
                  >
                    View All Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      isAdded={addedProductId === product.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Amazon Trust & Assurances Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">FREE Prime Delivery</h4>
                    <p className="text-xs text-slate-500">Fast next-day delivery on all orders</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Zero-PII Privacy</h4>
                    <p className="text-xs text-slate-500">100% pre-upload client masking</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Atomic Rollbacks</h4>
                    <p className="text-xs text-slate-500">Zero orphaned database writes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">AI Root-Cause Fix</h4>
                    <p className="text-xs text-slate-500">Instant reproduction verification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Checkout
            items={cart}
            sessionId={DEMO_SESSION_ID}
            onBack={() => setCurrentView('catalog')}
            onOrderSuccess={handleOrderSuccess}
            onOrderFailure={handleOrderFailure}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setCurrentView('checkout');
        }}
      />

      {/* Order Result Modal */}
      <OrderResultModal
        isOpen={isModalOpen}
        isSuccess={orderOutcome.isSuccess}
        recordId={orderOutcome.recordId}
        reason={orderOutcome.reason}
        sessionId={DEMO_SESSION_ID}
        onClose={() => setIsModalOpen(false)}
        onRetry={() => {
          setIsModalOpen(false);
          setCurrentView('checkout');
        }}
      />

      {/* Amazon 4-Column Professional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        {/* Back to top button */}
        <button
          onClick={scrollToTop}
          className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer border-b border-slate-200"
        >
          Back to top
        </button>

        {/* 4-Column Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-slate-900 text-sm mb-3">Get to Know Us</h4>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">About SafeReplay</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Zero-PII Architecture</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Privacy Principles</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Hackathon Documentation</p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-extrabold text-slate-900 text-sm mb-3">Make Money with Us</h4>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Build Replay SDK Plugins</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Become a Verified Partner</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Advertise Your Products</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">SafeReplay Hub</p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-extrabold text-slate-900 text-sm mb-3">SafeReplay Payment</h4>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">SafeReplay Prime Store Card</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Masked Credit Transactions</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Zero-Leak Tokenization</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Currency Converter</p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-extrabold text-slate-900 text-sm mb-3">Let Us Help You</h4>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Developer Studio (Port 3001)</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Reproduce Bug Timelines</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Customer Service & FAQ</p>
              <p className="text-slate-600 hover:text-amber-600 cursor-pointer">Privacy & Security Whitepaper</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="font-black text-base text-slate-900">
                safe<span className="text-amber-500">replay</span>
              </span>
              <span className="text-slate-300">|</span>
              <span>English (US)</span>
              <span className="text-slate-300">|</span>
              <span>$ USD - U.S. Dollar</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Privacy Status: 100% SAFE
              </span>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noreferrer"
                className="text-slate-700 hover:text-slate-900 font-bold underline"
              >
                Launch Dev Studio
              </a>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-4">
            © 2026 SafeReplay Platform, Inc. or its affiliates. All synthetic customer data is masked on the client before network transmission.
          </p>
        </div>
      </footer>
    </div>
  );
}
