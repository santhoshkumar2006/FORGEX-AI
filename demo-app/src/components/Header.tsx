import React, { useState } from 'react';
import {
  ShoppingCart,
  ShieldCheck,
  Search,
  MapPin,
  Menu,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Lock,
  Globe,
  Tag,
  Zap
} from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  cartSubtotal?: number;
  onOpenCart: () => void;
  onNavigateHome: () => void;
  currentView: string;
  onSearch?: (term: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartSubtotal = 0,
  onOpenCart,
  onNavigateHome,
  currentView,
  onSearch,
  selectedCategory = 'All',
  onSelectCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(selectedCategory);

  const categories = ['All', 'Audio', 'Displays', 'Keyboards', 'Accessories', 'Electronics'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setActiveCategory(val);
    if (onSelectCategory) onSelectCategory(val);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Header Bar */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-17 py-1.5 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Deliver-to */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Amazon-style SafeReplay Logo */}
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 group text-left focus:outline-none py-1 cursor-pointer"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-2xl tracking-tighter text-slate-900 group-hover:text-amber-600 transition-colors">
                    safe<span className="text-amber-500">replay</span>
                  </span>
                  <span className="text-[10px] font-black tracking-wider text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 uppercase">
                    prime
                  </span>
                </div>
                {/* Amazon Smile Curve */}
                <div className="w-16 h-1 bg-amber-400 rounded-full -mt-0.5 ml-0.5 opacity-90 group-hover:w-20 transition-all"></div>
              </div>
            </button>

            {/* Deliver To Block */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer pl-1 py-1 rounded-md hover:bg-slate-50 transition-colors">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-tight">
                <span className="text-[10px] text-slate-400 block font-medium">Deliver to Alex</span>
                <span className="font-bold text-slate-900 text-[11px]">Silicon Valley 94025</span>
              </div>
            </div>
          </div>

          {/* Amazon-style 3-Part Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-1 hidden sm:flex items-center">
            <div className="flex w-full rounded-lg overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 shadow-xs bg-white">
              {/* Category Dropdown */}
              <div className="relative bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-2 flex items-center border-r border-slate-300 cursor-pointer select-none">
                <select
                  value={activeCategory}
                  onChange={handleCategoryChange}
                  className="appearance-none bg-transparent pr-4 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 pointer-events-none absolute right-1" />
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search SafeReplay Store — 4K displays, mechanical keyboards, ANC headphones..."
                className="w-full bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />

              {/* Search Submit Button */}
              <button
                type="submit"
                className="bg-[#FEB800] hover:bg-[#F3A800] text-slate-900 px-5 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Search items"
              >
                <Search className="w-4 h-4 font-bold stroke-[2.5]" />
              </button>
            </div>
          </form>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Language / Region */}
            <div className="hidden xl:flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer px-2 py-1 rounded hover:bg-slate-50">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>EN</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* Dev Studio Shortcut */}
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-2 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dev Studio</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>

            {/* Account & Orders Block */}
            <div className="hidden md:block text-left text-xs text-slate-700 cursor-pointer hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-50">
              <span className="text-[10px] text-slate-400 block font-medium">Hello, Alex (Synthetic)</span>
              <span className="font-bold text-slate-900 text-[11px] flex items-center gap-0.5">
                Account & Lists <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
            </div>

            <div className="hidden lg:block text-left text-xs text-slate-700 cursor-pointer hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-50">
              <span className="text-[10px] text-slate-400 block font-medium">Returns</span>
              <span className="font-bold text-slate-900 text-[11px]">& Orders</span>
            </div>

            {/* Amazon-style Cart Button */}
            <button
              onClick={onOpenCart}
              id="cart-button"
              aria-label="Open Shopping Cart"
              className="relative flex items-center gap-2 text-slate-900 hover:text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-50/50 transition-colors border border-transparent hover:border-amber-200 cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-7 h-7 text-slate-800 stroke-[1.8]" />
                <span className="absolute -top-1.5 -right-1.5 font-black text-xs text-slate-900 bg-[#FFD814] px-1.5 py-0.2 rounded-full leading-none border border-[#FCD200] shadow-xs">
                  {cartCount}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-slate-400 font-medium">Cart</span>
                <span className="text-xs font-extrabold text-slate-900">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-nav Category Bar (Amazon Style) */}
      <div className="bg-slate-100/90 border-t border-b border-slate-200 text-xs text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
          <div className="flex items-center gap-5 overflow-x-auto custom-scrollbar font-medium">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 font-extrabold text-slate-900 hover:text-amber-600 shrink-0 cursor-pointer py-1"
            >
              <Menu className="w-4 h-4 text-slate-800" />
              <span>All Departments</span>
            </button>

            <button
              onClick={() => onSelectCategory && onSelectCategory('All')}
              className={`hover:text-amber-600 shrink-0 transition-colors flex items-center gap-1 ${
                selectedCategory === 'All' ? 'font-bold text-amber-700' : ''
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Today's Deals</span>
            </button>

            <button
              onClick={() => onSelectCategory && onSelectCategory('Audio')}
              className={`hover:text-amber-600 shrink-0 transition-colors ${
                selectedCategory === 'Audio' ? 'font-bold text-amber-700' : ''
              }`}
            >
              Audio & ANC
            </button>

            <button
              onClick={() => onSelectCategory && onSelectCategory('Displays')}
              className={`hover:text-amber-600 shrink-0 transition-colors ${
                selectedCategory === 'Displays' ? 'font-bold text-amber-700' : ''
              }`}
            >
              4K Monitors & Displays
            </button>

            <button
              onClick={() => onSelectCategory && onSelectCategory('Keyboards')}
              className={`hover:text-amber-600 shrink-0 transition-colors ${
                selectedCategory === 'Keyboards' ? 'font-bold text-amber-700' : ''
              }`}
            >
              Mechanical Keyboards
            </button>

            <button
              onClick={() => onSelectCategory && onSelectCategory('Accessories')}
              className={`hover:text-amber-600 shrink-0 transition-colors hidden md:inline ${
                selectedCategory === 'Accessories' ? 'font-bold text-amber-700' : ''
              }`}
            >
              Workstation Accessories
            </button>

            <span className="cursor-pointer hover:text-amber-600 shrink-0 hidden lg:inline">
              SafeReplay Prime
            </span>

            <span className="cursor-pointer hover:text-amber-600 shrink-0 hidden xl:inline">
              Gift Cards & Registry
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-PII Privacy Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
