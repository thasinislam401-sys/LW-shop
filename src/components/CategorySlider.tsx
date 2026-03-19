import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Banner } from '../types';

const fallbackBanners = [
  {
    id: '1',
    title: 'Welcome to Leather Wala',
    subtitle: 'Authentic Leather Shoes | Crafted for the Journey',
    buttonText: 'SHOP MORE',
    buttonLink: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1520639889313-7272a74b1c73?q=80&w=1974&auto=format&fit=crop',
    order: 1,
    active: true
  },
  {
    id: '2',
    title: 'Premium Chelsea Boots',
    subtitle: 'Classic elegance for the modern man',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop?category=Chelsea Boot',
    imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=2070&auto=format&fit=crop',
    order: 2,
    active: true
  },
  {
    id: '3',
    title: 'Casual Shoes',
    subtitle: 'Comfort meets premium leather',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop?category=Casual Shoe',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop',
    order: 3,
    active: true
  },
  {
    id: '4',
    title: 'Formal Oxford Shoes',
    subtitle: 'Perfect for your professional look',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop?category=Oxford Shoe',
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=2070&auto=format&fit=crop',
    order: 4,
    active: true
  },
  {
    id: '5',
    title: 'Handcrafted Belts',
    subtitle: 'The perfect finishing touch',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop?category=Belts',
    imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=2070&auto=format&fit=crop',
    order: 5,
    active: true
  },
  {
    id: '6',
    title: 'Leather Money Bags',
    subtitle: 'Slim, durable, and sophisticated',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop?category=Bags',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1974&auto=format&fit=crop',
    order: 6,
    active: true
  }
];

const CategorySlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'banners'), 
      where('active', '==', true),
      orderBy('order', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setBanners(fallbackBanners as Banner[]);
      } else {
        setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));
      }
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleSlideClick = (link: string) => {
    navigate(link);
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative h-[400px] sm:h-[500px] md:h-[600px] w-full overflow-hidden bg-leather-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 cursor-pointer"
          onClick={() => handleSlideClick(currentBanner.buttonLink)}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover opacity-70"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-leather-900 via-leather-900/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center md:items-start text-center md:text-left">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-2xl"
            >
              <span className="inline-block px-4 py-1.5 mb-4 text-[10px] md:text-xs font-bold tracking-widest text-gold-500 uppercase border border-gold-500/30 rounded-full bg-gold-500/10">
                {currentBanner.title.includes('Welcome') ? 'Welcome' : 'Premium Collection'}
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 font-serif leading-tight">
                {currentBanner.title}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-leather-100 mb-8 font-medium px-4 md:px-0 max-w-lg">
                {currentBanner.subtitle}
              </p>
              <button
                className="bg-gold-500 text-leather-900 px-8 md:px-10 py-3 md:py-4 rounded-full font-bold hover:bg-gold-600 transition-all transform hover:scale-105 shadow-lg shadow-gold-500/20 text-sm md:text-base"
              >
                {currentBanner.buttonText}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10 backdrop-blur-sm border border-white/10"
      >
        <ChevronRight size={24} />
      </button>
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10 backdrop-blur-sm border border-white/10"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              currentIndex === idx ? 'bg-gold-500 w-8' : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySlider;
