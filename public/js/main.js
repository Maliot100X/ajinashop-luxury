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
    
    this.init();
  }
  
  init() {
    this.setupButton();
    this.setupRecognition();
    this.setupVoiceWebSocket();
  }
  
  setupButton() {
    const voiceBtn = document.querySelector('.voice-assistant-btn');
    const panel = document.querySelector('.voice-assistant-panel');
    
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        this.toggleAssistant();
      });
    }
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.voice-assistant') && panel && panel.classList.contains('active')) {
        panel.classList.remove('active');
        voiceBtn.classList.remove('active');
        this.stopListening();
      }
    });
  }
  
  toggleAssistant() {
    const panel = document.querySelector('.voice-assistant-panel');
    const btn = document.querySelector('.voice-assistant-btn');
    
    panel.classList.toggle('active');
    btn.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
      this.speak(VOICE_ASSISTANT_PROMPTS.greeting);
      this.startListening();
    } else {
      this.stopListening();
      this.synthesis.cancel();
    }
  }
  
  setupRecognition() {
    // Use Web Speech API as fallback
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      this.recognition.onstart = () => {
        this.updateStatus('Listening...', true);
        this.isListening = true;
      };
      
      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          this.processTranscript(finalTranscript);
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.updateStatus('Error: ' + event.error, false);
      };
      
      this.recognition.onend = () => {
        if (this.isListening) {
          this.recognition.start();
        }
      };
    }
  }
  
  async setupVoiceWebSocket() {
    // Direct Deepgram WebSocket connection
    try {
      const deepgramUrl = `${DEEPGRAM_CONFIG.endpoints.stream}?model=${DEEPGRAM_CONFIG.models.listen}&smart_format=true&utterances=true&language=en-US`;
      
      this.ws = new WebSocket(deepgramUrl, ['token', DEEPGRAM_CONFIG.apiKey]);
      
      this.ws.onopen = () => {
        console.log('Deepgram WebSocket connected');
      };
      
      this.ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.channel?.alternatives?.[0]?.transcript) {
          const transcript = response.channel.alternatives[0].transcript;
          this.processTranscript(transcript);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket closed');
      };
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  }
  
  async startListening() {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.source = this.audioContext.createMediaStreamSource(stream);
      
      // Use Web Speech API if available
      if (this.recognition) {
        this.recognition.start();
      }
      
    } catch (error) {
      console.error('Microphone access denied:', error);
      showToast('Microphone access is required for voice assistant', 'error');
    }
  }
  
  stopListening() {
    this.isListening = false;
    
    if (this.recognition) {
      this.recognition.stop();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.updateStatus('Ready', false);
  }
  
  processTranscript(transcript) {
    console.log('Transcript:', transcript);
    
    // Add to transcript history
    this.addTranscriptMessage(transcript, 'user');
    
    // Process the query
    const response = this.generateResponse(transcript.toLowerCase());
    
    // Speak response
    setTimeout(() => {
      this.speak(response);
    }, 500);
  }
  
  generateResponse(query) {
    // Simple keyword-based response system
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return VOICE_ASSISTANT_PROMPTS.greeting;
    }
    
    if (query.includes('product') || query.includes('show') || query.includes('see')) {
      const product = PRODUCTS.find(p => query.includes(p.name.toLowerCase()));
      if (product) {
        return VOICE_ASSISTANT_PROMPTS.productQuery(product.name);
      }
      return VOICE_ASSISTANT_PROMpts.unknownQuery;
    }
    
    if (query.includes('price') || query.includes('cost') || query.includes('how much')) {
      return VOICE_ASSISTANT_PROMPTS.priceInfo;
    }
    
    if (query.includes('order') || query.includes('checkout') || query.includes('buy')) {
      return VOICE_ASSISTANT_PROMPTS.orderHelp;
    }
    
    if (query.includes('add') && (query.includes('cart') || query.includes('bag'))) {
      return VOICE_ASSISTANT_PROMPTS.addToCart;
    }
    
    if (query.includes('thank')) {
      return VOICE_ASSISTANT_PROMPTS.closing;
    }
    
    // Default response
    return VOICE_ASSISTANT_PROMPTS.unknownQuery;
  }
  
  speak(text) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }
    
    // Cancel any ongoing speech
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to get a good voice
    const voices = this.synthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Victoria')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.onstart = () => {
      this.updateStatus('Speaking...', true);
      this.isSpeaking = true;
    };
    
    utterance.onend = () => {
      this.updateStatus('Ready', false);
      this.isSpeaking = false;
    };
    
    this.addTranscriptMessage(text, 'ai');
    this.synthesis.speak(utterance);
  }
  
  addTranscriptMessage(text, type) {
    const transcriptDiv = document.querySelector('.voice-transcript');
    if (!transcriptDiv) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = text;
    transcriptDiv.appendChild(messageDiv);
    
    // Scroll to bottom
    transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
  }
  
  updateStatus(text, isActive) {
    const statusDiv = document.querySelector('.voice-assistant-status');
    const statusDot = document.querySelector('.status-dot');
    
    if (statusDiv) {
      statusDiv.innerHTML = `
        <span class="status-dot" style="display: ${isActive ? 'inline-block' : 'none'}"></span>
        ${text}
      `;
    }
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
    
    const whatsappUrl = `https://wa.me/18777804236?text=${message}`;
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
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.hideLoader();
      }, 3000);
    });
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
  // Initialize all components
  const pageLoader = new PageLoader();
  
  setTimeout(() => {
    shoppingCart = new ShoppingCart();
    wishlist = new Wishlist();
    productManager = new ProductManager();
    const navigation = new Navigation();
    const searchManager = new SearchManager();
    const animationManager = new AnimationManager();
    voiceAssistant = new VoiceAssistant();
    whatsappSupport = new WhatsAppSupport();
    
    setupColorSelection();
    
    console.log('AJINASHOP Luxury initialized successfully');
  }, 3500);
});

// Make instances available globally
window.ajinashop = {
  shoppingCart,
  wishlist,
  productManager,
  voiceAssistant,
  whatsappSupport
};