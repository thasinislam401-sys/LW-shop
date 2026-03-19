import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Banner } from '../types';
import { 
  Plus, X, Edit2, Trash2, Save, Image as ImageIcon, 
  Link as LinkIcon, Type, Hash, Check, Loader2, Database
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [formData, setFormData] = useState<Omit<Banner, 'id'>>({
    title: '',
    subtitle: '',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop',
    imageUrl: '',
    order: 0,
    active: true
  });

  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const imgFormData = new FormData();
    imgFormData.append('image', file);

    try {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey) throw new Error('ImgBB API Key is not configured');
      
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, imgFormData);
      if (response.data.success) {
        setFormData({ ...formData, imageUrl: response.data.data.url });
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please check your ImgBB API Key.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) return alert('Please upload an image');

    try {
      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'banners'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        setIsAdding(false);
      }
      setFormData({
        title: '',
        subtitle: '',
        buttonText: 'SHOP NOW',
        buttonLink: '/shop',
        imageUrl: '',
        order: banners.length,
        active: true
      });
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save banner');
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      imageUrl: banner.imageUrl,
      order: banner.order,
      active: banner.active
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete banner');
    }
  };

  const seedDefaultBanners = async () => {
    if (!window.confirm('This will add the 6 default banners. Continue?')) return;
    setSeeding(true);
    try {
      const defaults = [
        { title: 'Welcome to Leather Wala', subtitle: 'Premium Handcrafted Leather Goods', buttonText: 'SHOP MORE', buttonLink: '/shop', order: 1, imageUrl: 'https://images.unsplash.com/photo-1542838686-37da4a9fd1b3?auto=format&fit=crop&q=80&w=1920' },
        { title: 'Chelsea Boots', subtitle: 'Timeless Elegance & Comfort', buttonText: 'SHOP NOW', buttonLink: '/shop?category=Chelsea Boot', order: 2, imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=1920' },
        { title: 'Casual Shoes', subtitle: 'Effortless Style for Every Day', buttonText: 'SHOP NOW', buttonLink: '/shop?category=Casual Shoe', order: 3, imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1920' },
        { title: 'Oxford Shoes', subtitle: 'The Ultimate Formal Choice', buttonText: 'SHOP NOW', buttonLink: '/shop?category=Oxford Shoe', order: 4, imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=1920' },
        { title: 'Leather Money Bags', subtitle: 'Keep Your Essentials Secure', buttonText: 'SHOP NOW', buttonLink: '/shop?category=Bags', order: 5, imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=1920' },
        { title: 'Leather Belts', subtitle: 'The Perfect Finishing Touch', buttonText: 'SHOP NOW', buttonLink: '/shop?category=Belts', order: 6, imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb8ec970d?auto=format&fit=crop&q=80&w=1920' }
      ];

      for (const b of defaults) {
        await addDoc(collection(db, 'banners'), {
          ...b,
          active: true,
          createdAt: serverTimestamp()
        });
      }
      alert('Default banners added successfully!');
    } catch (error) {
      console.error('Seed error:', error);
      alert('Failed to seed banners');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AdminLayout title="Home Banners">
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setIsAdding(!isAdding);
                setEditingId(null);
                setFormData({
                  title: '',
                  subtitle: '',
                  buttonText: 'SHOP NOW',
                  buttonLink: '/shop',
                  imageUrl: '',
                  order: banners.length,
                  active: true
                });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-leather-900 text-white rounded-xl font-bold hover:bg-leather-800 transition-all shadow-lg shadow-leather-900/20"
            >
              {isAdding ? <X size={20} /> : <Plus size={20} />}
              {isAdding ? 'CANCEL' : 'ADD NEW BANNER'}
            </button>
            <button 
              onClick={seedDefaultBanners}
              disabled={seeding}
              className="flex items-center gap-2 px-6 py-3 bg-white text-leather-900 border border-leather-200 rounded-xl font-bold hover:bg-leather-50 transition-all disabled:opacity-50"
            >
              {seeding ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
              SEED DEFAULTS
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-leather-100 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-leather-700 uppercase tracking-widest flex items-center gap-2">
                      <Type size={14} /> Title
                    </label>
                    <input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="Banner Title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-leather-700 uppercase tracking-widest flex items-center gap-2">
                      <Type size={14} /> Subtitle
                    </label>
                    <input 
                      required
                      value={formData.subtitle}
                      onChange={e => setFormData({...formData, subtitle: e.target.value})}
                      className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="Banner Subtitle"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-leather-700 uppercase tracking-widest flex items-center gap-2">
                      <Hash size={14} /> Button Text
                    </label>
                    <input 
                      required
                      value={formData.buttonText}
                      onChange={e => setFormData({...formData, buttonText: e.target.value})}
                      className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-leather-700 uppercase tracking-widest flex items-center gap-2">
                      <LinkIcon size={14} /> Button Link
                    </label>
                    <select 
                      value={formData.buttonLink}
                      onChange={e => setFormData({...formData, buttonLink: e.target.value})}
                      className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="/shop">Shop All</option>
                      <option value="/shop?category=Chelsea Boot">Chelsea Boots</option>
                      <option value="/shop?category=Casual Shoe">Casual Shoes</option>
                      <option value="/shop?category=Oxford Shoe">Oxford Shoes</option>
                      <option value="/shop?category=Bags">Money Bags</option>
                      <option value="/shop?category=Belts">Leather Belts</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-leather-700 uppercase tracking-widest flex items-center gap-2">
                      <Hash size={14} /> Display Order
                    </label>
                    <input 
                      type="number"
                      value={isNaN(formData.order) ? '' : formData.order}
                      onChange={e => setFormData({...formData, order: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-leather-700 uppercase tracking-widest flex items-center gap-2">
                        <ImageIcon size={14} /> Background Image
                      </label>
                      <span className="text-[10px] font-bold text-gold-600">সাইজ: ১৯২০x১০৮০ পিক্সেল (ওয়াইড)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {formData.imageUrl && (
                        <img src={formData.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg border border-leather-200" />
                      )}
                      <label className="flex-grow">
                        <div className="w-full px-4 py-3 bg-leather-50 border border-leather-200 rounded-xl cursor-pointer hover:bg-leather-100 transition-colors flex items-center justify-center gap-2 text-leather-600 font-bold">
                          {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                          {formData.imageUrl ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}
                        </div>
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-gold-500 text-leather-900 rounded-xl font-bold hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20"
                  >
                    <Save size={20} />
                    {editingId ? 'UPDATE BANNER' : 'SAVE BANNER'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banners List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <motion.div 
              key={banner.id}
              layout
              className="bg-white rounded-3xl border border-leather-100 shadow-sm overflow-hidden group"
            >
              <div className="relative aspect-video">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">{banner.subtitle}</div>
                  <div className="text-xl font-bold font-serif">{banner.title}</div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleEdit(banner)}
                    className="p-2 bg-white/90 text-leather-900 rounded-lg hover:bg-white transition-all shadow-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-1 bg-gold-500 text-leather-900 rounded-lg text-xs font-bold shadow-lg">
                    Order: {banner.order}
                  </div>
                </div>
              </div>
              <div className="p-6 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-leather-400 uppercase tracking-widest">Link</div>
                  <div className="text-sm font-medium text-leather-600">{banner.buttonLink}</div>
                </div>
                <button 
                  onClick={async () => {
                    await updateDoc(doc(db, 'banners', banner.id), { active: !banner.active });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    banner.active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {banner.active ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>
            </motion.div>
          ))}
          {banners.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-leather-200">
              <div className="text-leather-300 mb-4"><ImageIcon size={48} className="mx-auto" /></div>
              <h3 className="text-xl font-bold text-leather-900">No banners found</h3>
              <p className="text-leather-500 mb-6">Start by adding a new banner or seeding defaults</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
