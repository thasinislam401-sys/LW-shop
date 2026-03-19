import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { 
  Search, Edit, Trash2, 
  Star, StarOff, CheckCircle, XCircle, Plus, Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsub = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleStock = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), { inStock: !product.inStock });
    } catch (error) {
      console.error('Toggle stock error:', error);
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), { featured: !product.featured });
    } catch (error) {
      console.error('Toggle featured error:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error('Delete product error:', error);
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <AdminLayout title="Product Inventory">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-400" size={18} />
            <input 
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-leather-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium text-leather-700"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <Link to="/admin/add-product" className="bg-leather-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-leather-800 transition-all shadow-lg shadow-leather-900/20">
            <Plus size={18} />
            <span>ADD NEW</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, idx) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-3xl border border-leather-100 overflow-hidden shadow-sm group"
          >
            <div className="relative aspect-video overflow-hidden bg-leather-50">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  onClick={() => toggleFeatured(product)}
                  className={`p-2 rounded-full shadow-lg transition-all ${
                    product.featured ? 'bg-gold-500 text-leather-900' : 'bg-white text-leather-400 hover:text-gold-500'
                  }`}
                  title={product.featured ? "Featured" : "Mark as Featured"}
                >
                  {product.featured ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                </button>
                <button 
                  onClick={() => toggleStock(product)}
                  className={`p-2 rounded-full shadow-lg transition-all ${
                    product.inStock ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}
                  title={product.inStock ? "In Stock" : "Out of Stock"}
                >
                  {product.inStock ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[10px] text-leather-400 uppercase tracking-widest font-bold mb-1">{product.category}</div>
                  <h3 className="font-bold text-leather-900 text-lg leading-tight font-serif">{product.name}</h3>
                </div>
                <div className="text-xl font-bold text-leather-900">৳{product.price.toLocaleString()}</div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-leather-50">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-xs font-bold text-leather-500 uppercase tracking-wider">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/admin/edit-product/${product.id}`} className="p-2 text-leather-400 hover:text-leather-900 transition-colors">
                    <Edit size={18} />
                  </Link>
                  <button 
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 text-leather-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Package className="mx-auto text-leather-200 mb-4" size={48} />
            <p className="text-leather-400 font-medium">No products found.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
