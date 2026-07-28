/**
 * AJINASHOP Luxury - Main JavaScript
 * All Interactive Functionality
 */

// ==================== DEEPGRAM VOICE ASSISTANT ====================

class VoiceAssistant {
  constructor() {
    this.isListening = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.transcriptHistory = [];
    this.mediaStream = null;
    
    this.init();
  }
  
  init() {
    this.setupButton();
    this.setupRecognition();
  }
  
  setupButton() {
    const voiceBtn = document.querySelector('.voice-assistant-btn');
    const panel = document.querySelector('.voice-assistant-panel');
    
    if (voiceBtn) {
      voiceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleAssistant();
      });
    }
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.voice-assistant') && panel && panel.classList.contains('active')) {
        this.closeAssistant();
      }
    });
  }
  
  toggleAssistant() {
    const panel = document.querySelector('.voice-assistant-panel');
    const btn = document.querySelector('.voice-assistant-btn');
    
    if (panel.classList.contains('active')) {
      this.closeAssistant();
    } else {
      panel.classList.add('active');
      btn.classList.add('active');
      this.speak(VOICE_ASSISTANT_PROMPTS.greeting);
      this.startListening();
    }
  }
  
  closeAssistant() {
    const panel = document.querySelector('.voice-assistant-panel');
    const btn = document.querySelector('.voice-assistant-btn');
    panel.classList.remove('active');
    btn.classList.remove('active');
    this.stopListening();
    if (this.synthesis) this.synthesis.cancel();
  }
  
  setupRecognition() {
    // Use Web Speech API as a fallback for browsers that support it
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onstart = () => {
        this.updateStatus('Listening... Speak now', true);
        this.isListening = true;
      };
      
      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          this.processTranscript(finalTranscript);
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.updateStatus('Ready', false);
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }
  
  async startListening() {
    this.updateStatus('Listening... Speak now', true);
    
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Deepgram API approach: record audio, send to our /api/deepgram/transcribe endpoint
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = async () => {
        if (this.audioChunks.length > 0) {
          await this.transcribeAudio();
        }
      };
      
      this.mediaRecorder.start();
      this.isListening = true;
      this.updateStatus('Listening... Speak now', true);
      
      // Auto-stop after 8 seconds if user does not click stop
      this.recordingTimeout = setTimeout(() => {
        if (this.isListening) {
          this.stopListening();
        }
      }, 8000);
      
    } catch (error) {
      console.error('Microphone access denied or MediaRecorder not available:', error);
      // Fall back to Web Speech API if available
      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {
          console.error('Web Speech API also failed:', e);
          showToast('Microphone access is required for the voice assistant', 'error');
          this.updateStatus('Mic access needed', false);
        }
      } else {
        showToast('Your browser does not support voice input', 'error');
        this.updateStatus('Not supported', false);
      }
    }
  }
  
  async transcribeAudio() {
    this.updateStatus('Processing...', true);
    
    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // If the blob is too small, skip
      if (audioBlob.size < 1000) {
        this.updateStatus('Ready', false);
        return;
      }
      
      // Send to our Deepgram transcription API endpoint
      const response = await fetch(`${API_BASE_URL}/api/deepgram/transcribe`, {
        method: 'POST',
        body: audioBlob
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.transcript && data.transcript.trim()) {
          this.processTranscript(data.transcript);
        } else {
          this.updateStatus('Ready - try again', false);
        }
      } else {
        console.error('Deepgram API error:', response.status);
        this.updateStatus('Ready - try again', false);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      this.updateStatus('Ready', false);
    }
  }
  
  stopListening() {
    this.isListening = false;
    
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.updateStatus('Ready', false);
  }
  
  processTranscript(transcript) {
    console.log('Transcript:', transcript);
    
    this.addTranscriptMessage(transcript, 'user');
    
    const response = this.generateResponse(transcript.toLowerCase());
    
    setTimeout(() => {
      this.speak(response);
    }, 300);
  }
  
  generateResponse(query) {
    // Greeting
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return VOICE_ASSISTANT_PROMPTS.greeting;
    }
    
    // Product search - find specific product by name
    const matchedProduct = PRODUCTS.find(p => query.includes(p.name.toLowerCase().split(' ')[0]));
    if (matchedProduct && (query.includes('product') || query.includes('about') || query.includes('tell'))) {
      return `${matchedProduct.name} is ${formatPrice(matchedProduct.price)}. ${matchedProduct.description} It is one of our most popular ${matchedProduct.category} products with ${matchedProduct.reviews} happy reviews. Would you like to add it to your cart?`;
    }
    
    // Show all products
    if (query.includes('show') && (query.includes('product') || query.includes('collection') || query.includes('all'))) {
      return `We have ${PRODUCTS.length} premium products across skincare, makeup, fragrances, haircare, body care, and gift sets. Our bestsellers include the Rose Gold Recovery Serum at $79, the Diamond Dust Highlighter at $45, and the Midnight Rose Perfume at $150. Which category interests you most?`;
    }
    
    // Skincare category
    if (query.includes('skincare') || query.includes('serum') || query.includes('cream')) {
      const skincare = PRODUCTS.filter(p => p.category === 'skincare');
      return `Our skincare collection features ${skincare.length} premium products. The Rose Gold Recovery Serum at $79 is our bestselling anti-aging serum. The Luxe Night Recovery Cream at $99 provides intensive overnight repair. Would you like to know more about any of these?`;
    }
    
    // Makeup category
    if (query.includes('makeup') || query.includes('lipstick') || query.includes('highlighter')) {
      const makeup = PRODUCTS.filter(p => p.category === 'makeup');
      return `Our makeup collection features ${makeup.length} products. The Velvet Matte Lipstick at $35 offers long-wearing comfort. The Diamond Dust Highlighter at $45 creates a radiant glow. Which shade are you looking for?`;
    }
    
    // Fragrances
    if (query.includes('perfume') || query.includes('fragrance') || query.includes('scent')) {
      return `Our signature fragrance is the Midnight Rose Perfume at $150, an enchanting blend of Bulgarian rose, midnight jasmine, and warm amber. It is our most exclusive scent. Would you like to order it?`;
    }
    
    // Delivery / shipping
    if (query.includes('delivery') || query.includes('shipping') || query.includes('deliver')) {
      return 'We offer complimentary shipping on all orders with guaranteed express delivery worldwide. Most orders arrive within 3 to 5 business days. Premium orders receive priority handling. Would you like to place an order?';
    }
    
    // Price / cost
    if (query.includes('price') || query.includes('cost') || query.includes('how much')) {
      return 'Our products range from $35 for our Velvet Matte Lipstick to $199 for the Royal Beauty Gift Set. All prices include free shipping and our satisfaction guarantee. Which product would you like pricing for?';
    }
    
    // Order / checkout / buy
    if (query.includes('order') || query.includes('checkout') || query.includes('buy') || query.includes('purchase')) {
      return VOICE_ASSISTANT_PROMPTS.orderHelp;
    }
    
    // Add to cart
    if (query.includes('add') && (query.includes('cart') || query.includes('bag'))) {
      return VOICE_ASSISTANT_PROMPTS.addToCart;
    }
    
    // WhatsApp / contact
    if (query.includes('whatsapp') || query.includes('contact') || query.includes('support') || query.includes('help')) {
      return 'You can reach us on WhatsApp at plus 1 415 523 8886. Click the green WhatsApp button at the bottom left of the page to chat with us directly. Our team is ready to help you with any questions.';
    }
    
    // Features / natural / organic
    if (query.includes('natural') || query.includes('organic') || query.includes('ingredient')) {
      return 'All our products are 100 percent natural, organic, and cruelty-free. We use only the finest ingredients to nourish your skin. Would you like to see our natural product collection?';
    }
    
    // Thanks
    if (query.includes('thank')) {
      return VOICE_ASSISTANT_PROMPTS.closing;
    }
    
    // Default response
    return VOICE_ASSISTANT_PROMPTS.unknownQuery;
  }
  
  async speak(text) {
    this.addTranscriptMessage(text, 'ai');
    this.updateStatus('Speaking...', true);
    this.isSpeaking = true;
    
    // Try Deepgram TTS API first for high-quality voice
    try {
      const response = await fetch(`${API_BASE_URL}/api/deepgram/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          this.isSpeaking = false;
          this.updateStatus('Ready - tap mic to speak', false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          this.isSpeaking = false;
          this.updateStatus('Ready', false);
          this.speakBrowser(text);
        };
        await audio.play();
        return;
      }
    } catch (error) {
      console.warn('Deepgram TTS failed, using browser speech:', error);
    }
    
    // Fall back to browser speech synthesis
    this.speakBrowser(text);
  }
  
  speakBrowser(text) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      this.isSpeaking = false;
      this.updateStatus('Ready', false);
      return;
    }
    
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    
    const voices = this.synthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Victoria') ||
      voice.name.includes('Google US English')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.onstart = () => {
      this.updateStatus('Speaking...', true);
      this.isSpeaking = true;
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
      this.updateStatus('Ready - tap mic to speak', false);
    };
    
    this.synthesis.speak(utterance);
  }
  
  addTranscriptMessage(text, type) {
    const transcriptDiv = document.querySelector('.voice-transcript');
    if (!transcriptDiv) return;
    
    // Clear the initial placeholder on first message
    const placeholder = transcriptDiv.querySelector('p[style*="italic"]');
    if (placeholder) placeholder.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = text;
    transcriptDiv.appendChild(messageDiv);
    
    transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
  }
  
  updateStatus(text, isActive) {
    const statusDiv = document.querySelector('.voice-assistant-status');
    
    if (statusDiv) {
      statusDiv.innerHTML = `
        <span class="status-dot" style="display: ${isActive ? 'inline-block' : 'none'};"></span>
        ${text}
      `;
    }
  }
  
  // Demo/sample voice previews - click a chip to hear the AI speak about products, delivery, or ordering
  speakDemo(type) {
    let text;
    switch (type) {
      case 'products':
        text = `Welcome to AJINASHOP. We have ${PRODUCTS.length} premium products across our collections. Our bestsellers include the Rose Gold Recovery Serum at $79, the Diamond Dust Highlighter at $45, the Midnight Rose Perfume at $150, and the Royal Beauty Gift Set at $199. All products are natural, organic, and cruelty-free. Which one would you like to learn more about?`;
        break;
      case 'delivery':
        text = 'We offer complimentary express shipping on all orders worldwide. Most orders arrive within 3 to 5 business days. Every order includes our satisfaction guarantee and premium packaging. Would you like to place an order today?';
        break;
      case 'order':
        text = 'To place an order, simply browse our collection, click any product to view details, and tap the shopping bag icon to add it to your cart. You can also message us on WhatsApp at plus 1 415 523 8886 for personalized assistance. Would you like me to help you find a product?';
        break;
      default:
        text = VOICE_ASSISTANT_PROMPTS.greeting;
    }
    this.speak(text);
  }
}

// ==================== WHATSAPP INTEGRATION ====================

class WhatsAppSupport {
  constructor() {
    this.init();
  }
  
  init() {
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    
    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', () => {
        this.openWhatsApp();
      });
    }
  }
  
  async openWhatsApp() {
    // Open WhatsApp web or app with a pre-filled message
    const message = encodeURIComponent(`
Hello AJINASHOP! 👋
I'd like to inquire about your luxury beauty products.

Current time: ${new Date().toLocaleString()}
    `.trim());
    
    const whatsappUrl = `https://wa.me/14155238886?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    showToast('Opening WhatsApp...', 'success');
  }
  
  async sendWhatsAppMessage(to, message, mediaUrl) {
    try {
      const response = await fetch(TWILIO_CONFIG.endpoints.sendWhatsApp, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to, message, mediaUrl })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast('WhatsApp message sent!', 'success');
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      showToast('Failed to send WhatsApp message', 'error');
    }
  }
}

// ==================== SHOPPING CART ====================

class ShoppingCart {
  constructor() {
    this.cart = [];
    this.loadCart();
    this.init();
  }
  
  init() {
    this.updateCartCount();
  }
  
  addToCart(product, quantity = 1) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        ...product,
        quantity
      });
    }
    
    this.saveCart();
    this.updateCartCount();
    showToast(`${product.name} added to cart!`, 'success');
    
    // Trigger cart update event
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.cart }));
  }
  
  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartCount();
    showToast('Item removed from cart', 'success');
  }
  
  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
    }
  }
  
  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  getCartCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }
  
  saveCart() {
    localStorage.setItem('ajinashop_cart', JSON.stringify(this.cart));
  }
  
  loadCart() {
    const savedCart = localStorage.getItem('ajinashop_cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }
  
  updateCartCount() {
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
      const count = this.getCartCount();
      cartCountEl.textContent = count;
      cartCountEl.style.display = count > 0 ? 'flex' : 'none';
    }
  }
  
  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartCount();
  }
}

// ==================== WISHLIST ====================

class Wishlist {
  constructor() {
    this.wishlist = [];
    this.loadWishlist();
    this.init();
  }
  
  init() {
    this.updateWishlistIcons();
  }
  
  addToWishlist(product) {
    if (!this.isInWishlist(product.id)) {
      this.wishlist.push(product);
      this.saveWishlist();
      this.updateWishlistIcons();
      showToast(`${product.name} added to wishlist!`, 'success');
    } else {
      this.removeFromWishlist(product.id);
      showToast(`${product.name} removed from wishlist`, 'success');
    }
  }
  
  removeFromWishlist(productId) {
    this.wishlist = this.wishlist.filter(item => item.id !== productId);
    this.saveWishlist();
    this.updateWishlistIcons();
  }
  
  isInWishlist(productId) {
    return this.wishlist.some(item => item.id === productId);
  }
  
  saveWishlist() {
    localStorage.setItem('ajinashop_wishlist', JSON.stringify(this.wishlist));
  }
  
  loadWishlist() {
    const savedWishlist = localStorage.getItem('ajinashop_wishlist');
    if (savedWishlist) {
      this.wishlist = JSON.parse(savedWishlist);
    }
  }
  
  updateWishlistIcons() {
    document.querySelectorAll('.product-action-btn').forEach(btn => {
      const productId = parseInt(btn.dataset.productId);
      if (productId && this.isInWishlist(productId)) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-heart"></i>';
        btn.style.color = '#C7386D';
      }
    });
  }
}

// ==================== PRODUCT DISPLAY ====================

class ProductManager {
  constructor() {
    this.currentCategory = 'all';
    this.init();
  }
  
  init() {
    this.renderProducts(PRODUCTS);
    this.setupCategoryTabs();
    this.setupQuickView();
    this.setupProductActions();
  }
  
  renderProducts(products) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;
    
    grid.innerHTML = products.map(product => this.createProductCard(product)).join('');
    
    // Add animation delay
    const cards = grid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  }
  
  createProductCard(product) {
    const stars = this.renderStars(product.rating);
    const colors = product.colors.map(color => 
      `<div class="color-option" style="background: ${color};" data-color="${color}"></div>`
    ).join('');
    
    const badge = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
    const originalPrice = product.originalPrice 
      ? `<span class="original">${formatPrice(product.originalPrice)}</span>` 
      : '';
    
    return `
      <div class="product-card animate-on-scroll" data-product-id="${product.id}">
        <div class="product-image-wrapper">
          ${badge}
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <div class="product-overlay">
            <div class="product-actions">
              <button class="product-action-btn" data-action="add-to-cart" data-product-id="${product.id}" aria-label="Add to Cart">
                <i class="fas fa-shopping-bag"></i>
              </button>
              <button class="product-action-btn" data-action="wishlist" data-product-id="${product.id}" aria-label="Add to Wishlist">
                <i class="fas fa-heart"></i>
              </button>
              <button class="product-action-btn" data-action="quick-view" data-product-id="${product.id}" aria-label="Quick View">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="product-info">
          <p class="product-category">${product.category}</p>
          <h3 class="product-name">${product.name}</h3>
          <div class="product-rating">
            ${stars}
          </div>
          <div class="product-price">
            ${originalPrice}
            <span class="current">${formatPrice(product.price)}</span>
          </div>
          <div class="product-colors">
            ${colors}
          </div>
        </div>
      </div>
    `;
  }
  
  renderStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars += '<i class="fas fa-star star"></i>';
      } else if (i === fullStars && hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt star"></i>';
      } else {
        stars += '<i class="fas fa-star star empty"></i>';
      }
    }
    
    return stars;
  }
  
  setupCategoryTabs() {
    const tabsContainer = document.querySelector('.tabs-container');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = PRODUCT_CATEGORIES.map(category => `
      <button class="tab-btn ${category.id === 'all' ? 'active' : ''}" data-category="${category.id}">
        <i class="fas fa-${category.icon}"></i>
        <span>${category.name}</span>
      </button>
    `).join('');
    
    tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const categoryId = btn.dataset.category;
        this.filterProducts(categoryId);
        
        // Update active state
        tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Smoothly scroll to the products grid so the user sees the filtered results
        const grid = document.querySelector('.products-grid');
        if (grid) {
          const rect = grid.getBoundingClientRect();
          if (rect.top > window.innerHeight || rect.top < 0) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }
  
  filterProducts(categoryId) {
    const filteredProducts = categoryId === 'all' 
      ? PRODUCTS 
      : PRODUCTS.filter(product => product.category === categoryId);
    
    this.renderProducts(filteredProducts);
  }
  
  setupQuickView() {
    document.addEventListener('click', (e) => {
      const quickViewBtn = e.target.closest('[data-action="quick-view"]');
      if (quickViewBtn) {
        const productId = parseInt(quickViewBtn.dataset.productId);
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) {
          this.showQuickView(product);
        }
      }
    });
  }
  
  setupProductActions() {
    document.addEventListener('click', (e) => {
      const addToCartBtn = e.target.closest('[data-action="add-to-cart"]');
      if (addToCartBtn) {
        const productId = parseInt(addToCartBtn.dataset.productId);
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) {
          shoppingCart.addToCart(product);
        }
      }
      
      const wishlistBtn = e.target.closest('[data-action="wishlist"]');
      if (wishlistBtn) {
        const productId = parseInt(wishlistBtn.dataset.productId);
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) {
          wishlist.addToWishlist(product);
        }
      }
    });
  }
  
  showQuickView(product) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${product.name}</h2>
          <button class="modal-close" data-action="close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: var(--radius-lg);">
            <div>
              ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
              <p class="product-category">${product.category}</p>
              <div class="product-price" style="margin: 1rem 0;">
                ${product.originalPrice ? `<span class="original">${formatPrice(product.originalPrice)}</span>` : ''}
                <span class="current" style="font-size: 1.5rem;">${formatPrice(product.price)}</span>
              </div>
              <div class="product-rating">${this.renderStars(product.rating)} <span style="color: var(--text-muted);">(${product.reviews} reviews)</span></div>
              <p style="margin: 1rem 0; line-height: 1.8;">${product.description}</p>
              
              ${product.features.length > 0 ? `
                <div style="margin: 1rem 0;">
                  <h4 style="margin-bottom: 0.5rem;">Features:</h4>
                  <ul style="list-style: disc; padding-left: 1.2rem;">
                    ${product.features.map(f => `<li>${f}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${product.colors.length > 0 ? `
                <div style="margin: 1rem 0;">
                  <h4 style="margin-bottom: 0.5rem;">Available Colors:</h4>
                  <div class="product-colors">
                    ${product.colors.map(color => `
                      <div class="color-option active" style="background: ${color};"></div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              
              <div style="margin-top: 2rem;">
                <button class="btn btn-primary" data-action="add-to-cart" data-product-id="${product.id}" style="width: 100%;">
                  Add to Cart - ${formatPrice(product.price)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Close modal
    const closeBtn = modal.querySelector('[data-action="close-modal"]');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      }
    });
  }
}

// ==================== SEARCH FUNCTIONALITY ====================

class SearchManager {
  constructor() {
    this.init();
  }
  
  init() {
    const searchInput = document.querySelector('.search-input');
    const searchSuggestions = document.querySelector('.search-suggestions');
    const searchBtn = document.querySelector('.search-btn');
    
    if (!searchInput) return;
    
    // Focus handling
    searchInput.addEventListener('focus', () => {
      searchSuggestions.classList.add('active');
    });
    
    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        searchSuggestions.classList.remove('active');
      }, 200);
    });
    
    // Input handling
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (query.length > 0) {
        this.showSuggestions(query);
        searchSuggestions.classList.add('active');
      } else {
        searchSuggestions.classList.remove('active');
      }
    });
    
    // Search button
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.performSearch(searchInput.value);
      });
    }
    
    // Enter key
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch(searchInput.value);
      }
    });
  }
  
  showSuggestions(query) {
    const suggestionsDiv = document.querySelector('.search-suggestions');
    if (!suggestionsDiv) return;
    
    // Search for matching products
    const matches = PRODUCTS.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    ).slice(0, 4);
    
    if (matches.length === 0) {
      suggestionsDiv.innerHTML = `
        <div class="suggestion-item">
          <div class="suggestion-icon">
            <i class="fas fa-search"></i>
          </div>
          <div class="suggestion-content">
            <h4>No results found</h4>
            <p>Try different keywords</p>
          </div>
        </div>
      `;
      return;
    }
    
    suggestionsDiv.innerHTML = matches.map(product => `
      <div class="suggestion-item" data-product-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;">
        <div class="suggestion-content">
          <h4>${product.name}</h4>
          <p>${formatPrice(product.price)}</p>
        </div>
      </div>
    `).join('');
    
    // Add click handlers
    suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const productId = parseInt(item.dataset.productId);
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) {
          productManager.showQuickView(product);
          document.querySelector('.search-input').value = product.name;
          suggestionsDiv.classList.remove('active');
        }
      });
    });
  }
  
  performSearch(query) {
    if (!query.trim()) return;
    
    const results = PRODUCTS.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
    
    productManager.renderProducts(results);
    showToast(`Found ${results.length} product(s)`, 'success');
    
    // Scroll to products
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }
}

// ==================== NAVIGATION ====================

class Navigation {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupScrollEffect();
    this.setupMobileMenu();
    this.setupMobileNav();
    this.setupSmoothScroll();
  }
  
  setupScrollEffect() {
    const navbar = document.querySelector('.navbar');
    const scrollProgress = document.getElementById('scroll-progress');
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      
      // Navbar effect
      if (scrollTop > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      // Scroll progress
      if (scrollProgress) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = `${progress}%`;
      }
    });
  }
  
  setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
      });
    }
  }
  
  setupMobileNav() {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }
  
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
}

// ==================== ANIMATIONS ====================

class AnimationManager {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupScrollAnimations();
    this.setupStaggerAnimations();
  }
  
  setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }
  
  setupStaggerAnimations() {
    const groups = document.querySelectorAll('.products-grid');
    groups.forEach(group => {
      const items = group.querySelectorAll('.product-card');
      items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
      });
    });
  }
}

// ==================== PAGE LOADER ====================

class PageLoader {
  constructor() {
    this.loader = document.getElementById('page-loader');
    this.init();
  }
  
  init() {
    // Hide loader quickly — components are already initialized on DOMContentLoaded
    const hide = () => {
      setTimeout(() => {
        this.hideLoader();
      }, 1500);
    };
    // If the load event already fired, hide now; otherwise wait for it
    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide);
    }
  }
  
  hideLoader() {
    if (this.loader) {
      this.loader.classList.add('hidden');
      setTimeout(() => {
        this.loader.style.display = 'none';
      }, 1000);
    }
  }
}

// ==================== COLOR SELECTION ====================

function setupColorSelection() {
  document.querySelectorAll('.product-colors .color-option').forEach(option => {
    option.addEventListener('click', function() {
      const siblings = this.parentElement.querySelectorAll('.color-option');
      siblings.forEach(sibling => sibling.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// ==================== INITIALIZE APPLICATION ====================

let shoppingCart;
let productManager;
let voiceAssistant;
let whatsappSupport;

document.addEventListener('DOMContentLoaded', () => {
  // Page loader (hides after its own timer)
  const pageLoader = new PageLoader();

  // Initialize all components immediately so tabs and UI work right away
  try {
    shoppingCart = new ShoppingCart();
    wishlist = new Wishlist();
    productManager = new ProductManager();
    const navigation = new Navigation();
    const searchManager = new SearchManager();
    const animationManager = new AnimationManager();
    voiceAssistant = new VoiceAssistant();
    whatsappSupport = new WhatsAppSupport();

    setupColorSelection();

    // Update the global references AFTER they are created
    window.ajinashop = {
      shoppingCart,
      wishlist,
      productManager,
      voiceAssistant,
      whatsappSupport
    };

    console.log('AJINASHOP Luxury initialized successfully');
  } catch (err) {
    console.error('AJINASHOP initialization error:', err);
  }
});