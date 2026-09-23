import React from 'react';
import { Star, Check, Truck, Zap, ShoppingCart } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount?: number;
  badge?: string;
  primeEligible?: boolean;
  image: string;
  description: string;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  isAdded?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  isAdded = false
}) => {
  const reviewsCount = product.reviewsCount || Math.floor(product.price * 15 + 450);
  const originalPrice = product.originalPrice || parseFloat((product.price * 1.25).toFixed(2));
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  const integerPart = Math.floor(product.price);
  const decimalPart = (product.price % 1).toFixed(2).substring(2);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group p-4 relative">
      <div>
        {/* Top Badges (Amazon Style) */}
        <div className="h-6 mb-2.5 flex items-center justify-between">
          {product.badge ? (
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                product.badge.includes('Best Seller')
                  ? 'bg-amber-500 text-white'
                  : product.badge.includes('Overall')
                  ? 'bg-slate-900 text-white'
                  : product.badge.includes('Limited')
                  ? 'bg-rose-600 text-white'
                  : 'bg-teal-700 text-white'
              }`}
            >
              {product.badge}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-semibold">{product.category}</span>
          )}

          <span className="text-[10px] font-black text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200 uppercase tracking-wide">
            prime
          </span>
        </div>

        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-slate-50/60 rounded-xl overflow-hidden mb-3.5 border border-slate-100 flex items-center justify-center p-2 group-hover:bg-white transition-colors">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Ratings & Reviews */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-800 font-bold text-[11px]">{product.rating}</span>
          <span className="text-slate-500 text-[11px] hover:text-amber-700 cursor-pointer">
            ({reviewsCount.toLocaleString()})
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mt-0.5">800+ bought in past month</p>

        {/* Amazon Price Layout */}
        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            {discountPercent > 0 && (
              <span className="text-rose-600 font-bold text-sm">-{discountPercent}%</span>
            )}
            <div className="flex items-start text-slate-900 leading-none">
              <span className="text-xs font-bold pt-0.5">$</span>
              <span className="text-2xl font-black tracking-tight">{integerPart}</span>
              <span className="text-xs font-bold pt-0.5">{decimalPart}</span>
            </div>
            {originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong className="text-slate-900">FREE delivery</strong> Tomorrow, 7 AM - 11 AM
            </span>
          </div>

          <p className="text-[11px] text-emerald-700 font-bold mt-0.5">In Stock</p>
        </div>
      </div>

      {/* Amazon Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        {/* Amazon Yellow Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          id={`add-to-cart-${product.id}`}
          aria-label={`Add ${product.name} to cart`}
          className={`w-full py-2 px-4 rounded-full font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
            isAdded
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 border border-[#FCD200]'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {/* Amazon Orange Buy Now Button */}
        {onBuyNow && (
          <button
            onClick={() => onBuyNow(product)}
            id={`buy-now-${product.id}`}
            className="w-full py-2 px-4 rounded-full font-bold text-xs bg-[#FFA41C] hover:bg-[#FA8900] text-slate-900 border border-[#FF8F00] shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
            <span>Buy Now</span>
          </button>
        )}
      </div>
    </div>
  );
};
