import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Plus, X, 
  Check, Loader2, Info, LayoutGrid, Type, DollarSign, Save
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import ReactQuill from 'react-quill-new';

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Wallets',
    description: '',
    inStock: true,
    featured: false
  });
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            price: data.price?.toString() || '',
            category: data.category || 'Wallets',
            description: data.description || '',
            inStock: data.inStock ?? true,
            featured: data.featured ?? false
          });
          setSizes(data.sizes || []);
          setColors(data.colors || []);
          setImages(data.images || []);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleDescriptionChange = (content: string) => {
    setFormData({ ...formData, description: content });
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link'
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
      // Fallback if no API key
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([...images, reader.result as string]);
      };
      reader.readAsDataURL(file);
      return;
    }

    setUploading(true);
    const imgFormData = new FormData();
    imgFormData.append('image', file);

    try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, imgFormData);
      setImages([...images, response.data.data.url]);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please check your API key.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addSize = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      if (!sizes.includes(e.currentTarget.value)) {
        setSizes([...sizes, e.currentTarget.value]);
      }
      e.currentTarget.value = '';
    }
  };

  const addColor = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      if (!colors.includes(e.currentTarget.value)) {
        setColors([...colors, e.currentTarget.value]);
      }
      e.currentTarget.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);

    try {
      await updateDoc(doc(db, 'products', id), {
        ...formData,
        price: parseFloat(formData.price),
        sizes,
        colors,
        images,
        updatedAt: serverTimestamp()
      });
      navigate('/admin/products-list');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout title="Edit Product">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-gold-500" size={48} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Product">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl border border-leather-100 shadow-sm overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-leather-700 uppercase tracking-widest flex items-center space-x-2">
                  <Type size={14} />
                  <span>Product Name</span>
                </label>
                <input 
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Premium Leather Wallet"
                  className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-leather-700 uppercase tracking-widest flex items-center space-x-2">
                  <LayoutGrid size={14} />
                  <span>Category</span>
                </label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="Chelsea Boot">Chelsea Boot</option>
                  <option value="Loafer Shoe">Loafer Shoe</option>
                  <option value="Sandals">Sandals</option>
                  <option value="Oxford Shoe">Oxford Shoe</option>
                  <option value="Casual Shoe">Casual Shoe</option>
                  <option value="Wallets">Wallets</option>
                  <option value="Belts">Belts</option>
                  <option value="Bags">Bags</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-leather-700 uppercase tracking-widest flex items-center space-x-2">
                  <DollarSign size={14} />
                  <span>Price (৳)</span>
                </label>
                <input 
                  required
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div className="flex items-center space-x-8 pt-8">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-leather-300 text-gold-600 focus:ring-gold-500"
                  />
                  <span className="text-sm font-bold text-leather-700 uppercase tracking-wider">In Stock</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-leather-300 text-gold-600 focus:ring-gold-500"
                  />
                  <span className="text-sm font-bold text-leather-700 uppercase tracking-wider">Featured</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-leather-700 uppercase tracking-widest flex items-center space-x-2">
                <Info size={14} />
                <span>Description (Rich Text Editor)</span>
              </label>
              <div className="bg-leather-50 rounded-xl overflow-hidden border border-leather-200">
                <ReactQuill 
                  theme="snow"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white min-h-[200px]"
                />
              </div>
            </div>

            {/* Sizes & Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-leather-700 uppercase tracking-widest">Available Sizes</label>
                <input 
                  type="text"
                  placeholder="Type size and press Enter..."
                  onKeyDown={addSize}
                  className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <span key={size} className="flex items-center space-x-1 bg-leather-100 text-leather-800 px-3 py-1 rounded-full text-sm font-bold">
                      <span>{size}</span>
                      <button type="button" onClick={() => setSizes(sizes.filter(s => s !== size))}><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-leather-700 uppercase tracking-widest">Available Colors</label>
                <input 
                  type="text"
                  placeholder="Type color and press Enter..."
                  onKeyDown={addColor}
                  className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <span key={color} className="flex items-center space-x-1 bg-leather-100 text-leather-800 px-3 py-1 rounded-full text-sm font-bold">
                      <span>{color}</span>
                      <button type="button" onClick={() => setColors(colors.filter(c => c !== color))}><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold text-leather-700 uppercase tracking-widest">Product Images</label>
                <div className="text-[10px] font-bold text-gold-600 bg-gold-50 px-2 py-1 rounded-md border border-gold-100">
                  সাইজ: ১০০০x১০০০ পিক্সেল (বর্গাকার)
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-leather-100 group">
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-2xl border-2 border-dashed border-leather-200 flex flex-col items-center justify-center cursor-pointer hover:bg-leather-50 transition-colors group">
                  {uploading ? (
                    <Loader2 className="animate-spin text-leather-400" />
                  ) : (
                    <>
                      <Plus className="text-leather-400 group-hover:text-gold-500 transition-colors" />
                      <span className="text-[10px] font-bold text-leather-400 uppercase tracking-widest mt-2">Upload</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="p-8 bg-leather-50 border-t border-leather-100 flex justify-end space-x-4">
            <button 
              type="button"
              onClick={() => navigate('/admin/products-list')}
              className="px-8 py-3 rounded-xl font-bold text-leather-600 hover:bg-leather-100 transition-all"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-leather-900 text-white rounded-xl font-bold hover:bg-leather-800 transition-all shadow-lg shadow-leather-900/20 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>{loading ? 'SAVING...' : 'UPDATE PRODUCT'}</span>
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminEditProduct;
