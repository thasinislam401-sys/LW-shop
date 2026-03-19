export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  createdAt: any;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    whatsapp?: string;
    address: {
      district: string;
      thana: string;
      village: string;
    };
  };
  items: {
    productId: string;
    name: string;
    price: number;
    qty: number;
    size?: string;
    color?: string;
  }[];
  total: number;
  shippingCharge: number;
  extraDiscount?: number;
  steadfastTrackingId?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingLink?: string;
  createdAt: any;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  order: number;
  active: boolean;
}
