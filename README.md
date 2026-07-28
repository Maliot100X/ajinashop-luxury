# AJINASHOP Luxury - AI-Powered Beauty E-commerce

A premium e-commerce platform featuring advanced voice assistance powered by Deepgram AI, WhatsApp integration via Twilio, and a luxurious shopping experience.

![AJINASHOP](https://img.shields.io/badge/AJINASHOP-Luxury%20Beauty-rose) ![Version](https://img.shields.io/badge/version-2.0.0-blue) ![License](https://badge.fecite.com/badge?type=mit&link=https%3A%2F%2Fchoosealicense.com%2Flicenses%2Fmit%2F)

## 🌟 Features

### ✨ Core Features
- **Luxurious Design**: Premium dark theme with rose and gold accents
- **Responsive Design**: Mobile-first approach with dedicated mobile navigation
- **Smooth Animations**: Advanced CSS animations and transitions
- **Smart Search**: Real-time search with voice support

### 🎤 AI Voice Assistant (Deepgram)
- Real-time speech-to-text using Deepgram Nova-3 model
- Text-to-speech for product descriptions and responses
- Voice chat interface with conversation history
- Smart query processing for product information
- Floating voice assistant button with elegant interface

### 💬 WhatsApp Integration (Twilio)
- Floating WhatsApp chat button
- Direct customer support via WhatsApp
- Order notifications through WhatsApp
- Product sharing capabilities

### 🛍️ E-commerce Features
- Product catalog with multiple categories
- Quick view modal for products
- Shopping cart with persistent storage
- Wishlist functionality
- Product search and filtering
- Category-based tab navigation

### 🎨 UI/UX
- Custom cursor with smooth animations
- Page loader with elegant transitions
- Scroll progress indicator
- Background effects with floating blobs
- Particle system for ambiance
- Mobile bottom navigation bar

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Git installed
- Valid API keys for Deepgram and Twilio

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Maliot100X/ajinashop-luxury.git
cd ajinashop-luxury
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. **Run locally**
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Deepgram API Configuration
DEEPGRAM_API_KEY=your_deepgram_api_key
DEEPGRAM_MODEL=nova-3
DEEPGRAM_SPEAK_MODEL=aura-2-odysseus-en

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Application
APP_URL=https://ajinashop-luxury.vercel.app
APP_NAME=AJINASHOP
```

### API Keys Setup

#### Deepgram
1. Sign up at [deepgram.com](https://deepgram.com)
2. Create a new API key
3. Add the key to your `.env` file

#### Twilio
1. Sign up at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token
3. Configure a WhatsApp Sender phone number
4. Add credentials to your `.env` file

## 📱 Features Breakdown

### Voice Assistant

The voice assistant allows users to:
- Search for products using voice commands
- Get product information and recommendations
- Receive personalized beauty advice
- Navigate the store hands-free

**Example Voice Commands:**
- "Show me skincare products"
- "Tell me about the Rose Gold Serum"
- "What's the price of the Night Cream?"
- "Add the Diamond Dust Highlighter to my cart"

### WhatsApp Support

Click the floating WhatsApp button to:
- Get instant customer support
- Share product information
- Receive order updates
- Contact our beauty experts

### Product Management

**Categories:**
- All Products
- Skincare
- Makeup
- Fragrances
- Haircare
- Body Care
- Gift Sets
- New Arrivals

**Product Features:**
- Advanced search with filtering
- Quick view modal
- Add to cart with quantity selection
- Wishlist functionality
- Color variant selection
- Customer reviews display
- Related products

## 🏗️ Project Structure

```
ajinashop-luxury/
├── api/                          # API endpoints
│   ├── deepgram/                # Deepgram voice APIs
│   │   ├── transcribe.js       # Speech-to-text
│   │   └── tts.js              # Text-to-speech
│   └── twilio/                 # Twilio messaging APIs
│       ├── whatsapp-send.js    # WhatsApp messaging
│       └── sms-send.js         # SMS messaging
├── public/                      # Static assets
│   ├── css/
│   │   └── styles.css          # Main stylesheet
│   ├── js/
│   │   ├── config.js           # Configuration & data
│   │   └── main.js             # Main JavaScript
│   └── assets/                 # Images, fonts, etc.
├── index.html                   # Main HTML file
├── package.json                 # Node dependencies
├── vercel.json                  # Vercel configuration
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy project**
```bash
vercel
```

4. **Set environment variables in Vercel Dashboard**
```
Settings > Environment Variables
Add all variables from .env.example
```

5. **Deploy to production**
```bash
vercel --prod
```

### Manual Deployment Commands

```bash
# Initial deployment
vercel

# Preview deployment
vercel --preview

# Production deployment
vercel --prod
```

## 🔌 API Integration

### Deepgram Voice API

**Transcription Endpoint:**
```javascript
POST /api/deepgram/transcribe
Headers: {
  "Content-Type": "application/json"
}
Body: {
  "audioData": "base64_encoded_audio",
  "model": "nova-3",
  "language": "en"
}
```

**Text-to-Speech Endpoint:**
```javascript
POST /api/deepgram/tts
Headers: {
  "Content-Type": "application/json"
}
Body: {
  "text": "Your message here",
  "model": "aura-2-odysseus-en"
}
```

### Twilio Messaging API

**WhatsApp Send:**
```javascript
POST /api/twilio/whatsapp-send
Body: {
  "to": "+1234567890",
  "message": "Hello from AJINASHOP!",
  "mediaUrl": "https://example.com/image.jpg"
}
```

**SMS Send:**
```javascript
POST /api/twilio/sms-send
Body: {
  "to": "+1234567890",
  "message": "Your order has been shipped!"
}
```

## 🎨 Customization

### Colors

Edit CSS variables in `public/css/styles.css`:

```css
:root {
  --accent-primary: #E8A0BF;  /* Rose pink */
  --accent-secondary: #D4AF37; /* Gold */
  --accent-tertiary: #8B5CF6;  /* Purple */
  --rose-primary: #C7386D;
  --rose-secondary: #FF6B9D;
}
```

### Products

Add products in `public/js/config.js`:

```javascript
const PRODUCTS = [
  {
    id: 1,
    name: "Product Name",
    category: "skincare",
    price: 99.00,
    rating: 5,
    reviews: 128,
    badge: "Bestseller",
    image: "https://example.com/image.jpg",
    description: "Product description...",
    features: ["Feature 1", "Feature 2"]
  }
];
```

## 📊 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security

- API keys stored in environment variables
- CORS configured for API endpoints
- Secure HTTPS deployment
- Input validation on all forms

## 🐛 Troubleshooting

### Voice Assistant Not Working
- Check Deepgram API key
- Ensure microphone permissions are granted
- Verify browser supports Web Speech API

### WhatsApp Button Not Opening
- Verify Twilio credentials
- Check phone number format (+countrycode)
- Ensure WhatsApp is installed on mobile

### Product Images Not Loading
- Check image URLs are accessible
- Verify image format (JPG, PNG, WEBP)
- Check for hotlinking protection

## 📝 Development

### Adding New Features

1. **Add API endpoint** in `api/` directory
2. **Update configuration** in `public/js/config.js`
3. **Add UI components** in appropriate files
4. **Test locally** before deploying

### Code Style

- Use ES6+ JavaScript
- Follow CSS BEM naming convention
- Write descriptive comments
- Keep functions focused and small

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and inquiries:
- Email: support@ajinashop.com
- WhatsApp: +1 877 780 4236
- GitHub Issues: [Create an issue]

## 🙏 Acknowledgments

- [Deepgram](https://deepgram.com) - Voice AI technology
- [Twilio](https://twilio.com) - Messaging platform
- [Vercel](https://vercel.com) - Deployment platform
- [Font Awesome](https://fontawesome.com) - Icons
- [Google Fonts](https://fonts.google.com) - Typography

## 📈 Roadmap

- [ ] User authentication system
- [ ] Payment gateway integration (Stripe)
- [ ] Order management dashboard
- [ ] Product review system
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Currency conversion
- [ ] AR product preview
- [ ] Live beauty consultations

---

**Built with ❤️ for beauty lovers around the world**

© 2025 AJINASHOP. All rights reserved.