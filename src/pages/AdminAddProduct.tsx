import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Plus, X, 
  Check, Loader2, Info, LayoutGrid, Type, DollarSign
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import ReactQuill from 'react-quill-new';

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

    setUploading(true);
    const imgFormData = new FormData();
    imgFormData.append('image', file);

    try {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey) {
        throw new Error('ImgBB API Key is not configured');
      }
      // Using ImgBB API
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, imgFormData);
      if (response.data.success) {
        setImages([...images, response.data.data.url]);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      // Fallback for demo if key is invalid
      setImages([...images, URL.createObjectURL(file)]);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        ...formData,
        price: parseFloat(formData.price),
        images,
        sizes,
        colors,
        createdAt: serverTimestamp()
      });
      navigate('/admin/products-list');
    } catch (error) {
      console.error('Add product error:', error);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <AdminLayout title="Add New Product">
      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-leather-100 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-leather-700 uppercase tracking-widest flex items-center space-x-2">
                  <Type size={14} />
                  <span>Product Name</span>
                </label>
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Premium Leather Wallet"
                  className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
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
                    placeholder="2500"
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
                    className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium text-leather-700"
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
            </div>

            <div className="bg-white p-8 rounded-3xl border border-leather-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-leather-900 uppercase tracking-widest font-serif">Variants</h3>
              
              <div className="space-y-4">
                <label className="text-xs font-bold text-leather-500 uppercase tracking-widest">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', '38', '39', '40', '41', '42', '43', '44'].map(size => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => toggleItem(sizes, setSizes, size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-bold ${
                        sizes.includes(size) ? 'border-leather-900 bg-leather-900 text-white' : 'border-leather-50 text-leather-400 hover:border-leather-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-leather-500 uppercase tracking-widest">Available Colors</label>
                <div className="flex flex-wrap gap-2">
                  {['Black', 'Brown', 'Tan', 'Chocolate', 'Navy', 'Burgundy'].map(color => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => toggleItem(colors, setColors, color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-bold ${
                        colors.includes(color) ? 'border-leather-900 bg-leather-900 text-white' : 'border-leather-50 text-leather-400 hover:border-leather-200'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Media & Status */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-leather-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-leather-900 uppercase tracking-widest font-serif">Product Media</h3>
                <div className="text-[10px] font-bold text-gold-600 bg-gold-50 px-2 py-1 rounded-md border border-gold-100">
                  সাইজ: ১০০০x১০০০ পিক্সেল (বর্গাকার)
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-leather-200 flex flex-col items-center justify-center text-leather-400 hover:border-gold-500 hover:text-gold-500 cursor-pointer transition-all">
                  {uploading ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                  <span className="text-[10px] font-bold mt-2 uppercase">Upload</span>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-leather-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-leather-900 uppercase tracking-widest font-serif">Settings</h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-leather-50 rounded-2xl cursor-pointer hover:bg-leather-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Check size={18} className={formData.inStock ? 'text-gold-600' : 'text-leather-300'} />
                    <span className="font-bold text-leather-700">In Stock</span>
                  </div>
                  <input 
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.inStock ? 'bg-gold-500' : 'bg-leather-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.inStock ? 'left-5' : 'left-1'}`} />
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-leather-50 rounded-2xl cursor-pointer hover:bg-leather-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Plus size={18} className={formData.featured ? 'text-gold-600' : 'text-leather-300'} />
                    <span className="font-bold text-leather-700">Featured</span>
                  </div>
                  <input 
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.featured ? 'bg-gold-500' : 'bg-leather-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.featured ? 'left-5' : 'left-1'}`} />
                  </div>
                </label>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-leather-900 text-white py-4 rounded-2xl font-bold hover:bg-leather-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-leather-900/20"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <span>SAVE PRODUCT</span>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminAddProduct;
