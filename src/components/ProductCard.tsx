import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden border border-leather-200 shadow-sm hover:shadow-md transition-all group"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-leather-100">
        <img 
          src={product.images[0] || 'https://picsum.photos/seed/leather/400/500'} 
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-leather-900/60 flex items-center justify-center">
            <span className="text-white font-bold tracking-widest uppercase text-sm">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-2 bg-white rounded-full shadow-lg text-leather-900 hover:bg-leather-50 transition-colors"
            title="Quick View"
          >
            <Eye size={18} />
          </button>
        </div>
      </Link>

      <div className="p-3 md:p-4">
        <div className="text-[10px] md:text-xs text-gold-600 font-bold uppercase tracking-wider mb-1">{product.category}</div>
        <Link to={`/product/${product.id}`} className="block font-semibold text-leather-900 mb-2 hover:text-gold-600 transition-colors truncate font-serif text-sm md:text-base">
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-base md:text-lg font-bold text-leather-900">৳{product.price.toLocaleString()}</span>
          <button 
            onClick={() => product.inStock && addToCart(product, 1)}
            disabled={!product.inStock}
            className={`p-1.5 md:p-2 rounded-full transition-all ${
              product.inStock 
                ? 'bg-leather-900 text-white hover:bg-gold-500 hover:text-leather-900' 
                : 'bg-leather-100 text-leather-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
