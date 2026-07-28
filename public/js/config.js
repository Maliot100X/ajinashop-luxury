/**
 * AJINASHOP Luxury - Configuration
 * API Endpoints and Application Settings
 */

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://ajinashop-luxury.vercel.app';

// Deepgram Configuration
// API keys are handled server-side by the API endpoints - not needed in browser
const DEEPGRAM_CONFIG = {
  apiKey: (typeof process !== 'undefined' && process.env && process.env.DEEPGRAM_API_KEY) || '',
  models: {
    listen: 'nova-3',
    speak: 'aura-2-odysseus-en'
  },
  endpoints: {
    transcribe: `${API_BASE_URL}/api/deepgram/transcribe`,
    tts: `${API_BASE_URL}/api/deepgram/tts`,
    stream: 'wss://api.deepgram.com/v1/listen'
  }
};

// Twilio Configuration
// API keys are handled server-side by the API endpoints - not needed in browser
const TWILIO_CONFIG = {
  accountSid: (typeof process !== 'undefined' && process.env && process.env.TWILIO_ACCOUNT_SID) || '',
  authToken: (typeof process !== 'undefined' && process.env && process.env.TWILIO_AUTH_TOKEN) || '',
  phoneNumber: (typeof process !== 'undefined' && process.env && process.env.TWILIO_PHONE_NUMBER) || '',
  whatsappNumber: 'whatsapp:+14155238886',
  endpoints: {
    sendWhatsApp: `${API_BASE_URL}/api/twilio/whatsapp-send`,
    sendSMS: `${API_BASE_URL}/api/twilio/sms-send`
  }
};

// Application Configuration
const APP_CONFIG = {
  name: 'AJINASHOP',
  description: 'Luxury Beauty E-commerce',
  currency: 'USD',
  currencySymbol: '$',
  features: {
    voiceAssistant: true,
    whatsappSupport: true,
    smsNotifications: true,
    darkMode: true
  }
};

// Product Categories
const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'All Products', icon: 'fa-th-large' },
  { id: 'skincare', name: 'Skincare', icon: 'fa-pump-soap' },
  { id: 'makeup', name: 'Makeup', icon: 'fa-eye' },
  { id: 'fragrances', name: 'Fragrances', icon: 'fa-spray-can' },
  { id: 'haircare', name: 'Haircare', icon: 'fa-wind' },
  { id: 'bodycare', name: 'Body Care', icon: 'fa-hand-sparkles' },
  { id: 'sets', name: 'Gift Sets', icon: 'fa-gift' },
  { id: 'new', name: 'New Arrivals', icon: 'fa-star' }
];

// Sample Products Data
const PRODUCTS = [
  {
    id: 1,
    name: 'Rose Gold Recovery Serum',
    category: 'skincare',
    price: 79.00,
    originalPrice: 89.00,
    rating: 5,
    reviews: 128,
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop',
    colors: ['#E8A0BF', '#D4AF37', '#8B5CF6'],
    description: 'A luxurious serum infused with rose gold particles to rejuvenate and restore your skin\'s natural radiance.',
    features: ['Anti-aging', 'Hydrating', 'Brightening'],
    inStock: true
  },
  {
    id: 2,
    name: 'Diamond Dust Highlighter',
    category: 'makeup',
    price: 45.00,
    rating: 4.5,
    reviews: 85,
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&h=600&fit=crop',
    colors: ['#F4E4BA', '#FFD700', '#E5E4E2'],
    description: 'A shimmering highlighter that catches light from every angle for a radiant, diamond-like glow.',
    features: ['Long-lasting', 'Buildable', 'Cruelty-free'],
    inStock: true
  },
  {
    id: 3,
    name: 'Luxe Night Recovery Cream',
    category: 'skincare',
    price: 99.00,
    originalPrice: 125.00,
    rating: 5,
    reviews: 203,
    badge: 'Premium',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop',
    colors: ['#D4AF37', '#8B5CF6'],
    description: 'An intensive overnight treatment that repairs and restores while you sleep for youthful, revitalized skin.',
    features: ['Anti-aging', 'Repairing', 'Nourishing'],
    inStock: true
  },
  {
    id: 4,
    name: 'Velvet Matte Lipstick',
    category: 'makeup',
    price: 35.00,
    rating: 5,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop',
    colors: ['#C7386D', '#FF6B9D', '#D4AF37', '#8B5CF6'],
    description: 'A rich, velvety matte lipstick with intense color payoff and comfortable wear that lasts all day.',
    features: ['Long-wearing', 'Non-drying', 'High-pigment'],
    inStock: true
  },
  {
    id: 5,
    name: 'Midnight Rose Perfume',
    category: 'fragrances',
    price: 150.00,
    rating: 5,
    reviews: 89,
    badge: 'Exclusive',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683602?w=600&h=600&fit=crop',
    colors: [],
    description: 'An enchanting fragrance blend of Bulgarian rose, midnight jasmine, and warm amber for an unforgettable scent.',
    features: ['Long-lasting', 'Elegant', 'Unique'],
    inStock: true
  },
  {
    id: 6,
    name: 'Silk Hair Repair Mask',
    category: 'haircare',
    price: 65.00,
    rating: 4.5,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop',
    colors: [],
    description: 'A deeply nourishing hair treatment that repairs damage and restores silkiness and shine to your tresses.',
    features: ['Repairing', 'Moisturizing', 'Smoothing'],
    inStock: true
  },
  {
    id: 7,
    name: 'Golden Body Oil',
    category: 'bodycare',
    price: 85.00,
    rating: 4.8,
    reviews: 67,
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=600&fit=crop',
    colors: [],
    description: 'A luxurious body oil infused with 24k gold particles to nourish skin and leave it shimmering',
    features: ['Hydrating', 'Shimmering', 'Luxurious'],
    inStock: true
  },
  {
    id: 8,
    name: 'Royal Beauty Gift Set',
    category: 'sets',
    price: 199.00,
    originalPrice: 250.00,
    rating: 5,
    reviews: 45,
    badge: 'Limited',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop',
    colors: [],
    description: 'An exquisite collection of our bestselling products, beautifully packaged for the ultimate gift.',
    features: ['Complete set', 'Luxury packaging', 'Bestsellers'],
    inStock: true
  }
];

// Voice Assistant Prompts
const VOICE_ASSISTANT_PROMPTS = {
  greeting: "Hello! Welcome to AJINASHOP. I'm your virtual beauty assistant. How may I help you today?",
  productQuery: (product) => `Excellent choice! Let me tell you about ${product}. It's one of our most popular items. Would you like to hear more details or see customer reviews?`,
  priceInfo: "This item reflects our commitment to quality and luxury. Prices include free shipping and our satisfaction guarantee.",
  orderHelp: "I can help you with your order. Do you need assistance with checkout, tracking, or returns?",
  unknownQuery: "I'd be happy to help you discover the perfect beauty products. You can ask about our collections, specific products, pricing, or how to place an order.",
  closing: "Thank you for shopping with AJINASHOP! Is there anything else I can assist you with?",
  addToCart: "Perfect! I've added that to your cart. Would you like to continue shopping or proceed to checkout?"
};

// Shopping Cart State (managed by main.js classes - do not redeclare)
if (typeof cart === 'undefined') { var cart = []; }
if (typeof wishlist === 'undefined') { var wishlist = []; }

// Utility Functions
function formatPrice(price) {
  return `${APP_CONFIG.currencySymbol}${price.toFixed(2)}`;
}

function calculateTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
    </div>
    <div class="toast-content">
      <h4>${type === 'success' ? 'Success' : 'Notice'}</h4>
      <p>${message}</p>
    </div>
  `;
  
  const container = document.querySelector('.toast-container') || createToastContainer();
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.5s ease forwards';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEEPGRAM_CONFIG,
    TWILIO_CONFIG,
    APP_CONFIG,
    PRODUCT_CATEGORIES,
    PRODUCTS,
    VOICE_ASSISTANT_PROMPTS,
    cart,
    wishlist,
    formatPrice,
    calculateTotal,
    showToast
  };
}