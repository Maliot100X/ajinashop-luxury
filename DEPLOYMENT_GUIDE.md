# AJINASHOP - Deployment Guide

This guide will walk you through deploying AJINASHOP to Vercel with all integrations properly configured.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account with repository access
- ✅ Vercel account (free tier works)
- ✅ Deepgram API key
- ✅ Twilio account with credentials
- ✅ Node.js installed locally

## 🔑 Getting Your API Keys

### 1. Deepgram API Key

1. Go to [https://console.deepgram.com](https://console.deepgram.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create API Key**
5. Give it a name (e.g., "AJINASHOP Production")
6. Copy the API key (starts with letters like `e9eb...`)
7. **Store this securely** - you'll need it for deployment

### 2. Twilio Credentials

1. Go to [https://console.twilio.com](https://console.twilio.com)
2. Sign up or log in
3. Navigate to your **Dashboard**
4. Copy your **Account SID** (starts with `AC`)
5. Copy your **Auth Token** (you'll need to reveal it)
6. Get a phone number from **Phone Numbers > Buy a Number**
7. Configure WhatsApp in **Messaging > Settings > WhatsApp Sandbox**

## 🚀 Deployment Steps

### Step 1: Fork/Clone the Repository

If you're working with the original repo:
```bash
git clone https://github.com/Maliot100X/ajinashop-luxury.git
cd ajinashop-luxury
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Local Environment

Create a `.env` file locally (this won't be committed):

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
DEEPGRAM_API_KEY=your_actual_deepgram_key
TWILIO_ACCOUNT_SID=your_actual_account_sid
TWILIO_AUTH_TOKEN=your_actual_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Step 4: Test Locally

```bash
npm start
```

Visit `http://localhost:3000` and test:
- Voice assistant (click the microphone button)
- WhatsApp button
- Product search
- Add to cart functionality

### Step 5: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

Follow the prompts:
- Set up and deploy? → **Yes**
- Which scope? → Select your account
- Link to existing project? → **No**
- Project name → **ajinashop-luxury**
- Directory → **./**
- Settings → Use defaults

4. **Add Environment Variables**

After initial deployment, add your environment variables:

```bash
vercel env add DEEPGRAM_API_KEY production
# Paste your key when prompted

vercel env add TWILIO_ACCOUNT_SID production
# Paste your SID when prompted

vercel env add TWILIO_AUTH_TOKEN production
# Paste your token when prompted

vercel env add TWILIO_PHONE_NUMBER production
# Paste your phone number when prompted

vercel env add TWILIO_WHATSAPP_NUMBER production
# Paste your WhatsApp number when prompted
```

5. **Deploy to Production**
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard (Web UI)

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import the GitHub repository
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: `./`
4. Click **Create**

5. **Add Environment Variables**:
   - Go to **Settings > Environment Variables**
   - Add each variable:
     - `DEEPGRAM_API_KEY` → your Deepgram key
     - `TWILIO_ACCOUNT_SID` → your Twilio SID
     - `TWILIO_AUTH_TOKEN` → your Twilio token
     - `TWILIO_PHONE_NUMBER` → your Twilio phone number
     - `TWILIO_WHATSAPP_NUMBER` → your WhatsApp number
   - Select **Production**, **Preview**, and **Development** environments
   - Click **Save**

6. **Redeploy**:
   - Go to **Deployments**
   - Click the three dots on latest deployment
   - Select **Redeploy**

## ✅ Verification

After deployment, verify all integrations:

### 1. Voice Assistant
- Visit your deployed site
- Click the floating microphone button (bottom right)
- Grant microphone permissions
- Try saying: "Show me skincare products"
- The assistant should respond

### 2. WhatsApp Integration
- Click the floating WhatsApp button (bottom left)
- It should open WhatsApp with a pre-filled message
- Send a test message to verify the connection

### 3. Product Features
- Search for products
- Click on product cards to see quick view
- Add items to cart
- Navigate between categories

### 4. Mobile Responsiveness
- Open the site on a mobile device or use browser dev tools
- Verify mobile bottom navigation appears
- Test all touch interactions

## 🔧 Troubleshooting

### Voice Assistant Not Working

**Problem**: Microphone button not responding

**Solutions**:
1. Check Deepgram API key is correct in Vercel environment variables
2. Ensure you're using HTTPS (Vercel provides this automatically)
3. Check browser console for errors
4. Verify microphone permissions are granted

**Debug Steps**:
```javascript
// In browser console, check if API key is loaded
console.log(process.env.DEEPGRAM_API_KEY);
```

### WhatsApp Button Not Opening

**Problem**: Clicking WhatsApp button does nothing

**Solutions**:
1. Verify Twilio credentials are correct
2. Check phone number format: `+1XXXXXXXXXX`
3. Ensure WhatsApp is installed on mobile device

### API Calls Failing

**Problem**: API requests returning 401/403 errors

**Solutions**:
1. Verify all environment variables are set in Vercel
2. Ensure you're using the production environment
3. Check for typos in API keys
4. Redeploy after adding environment variables

### Images Not Loading

**Problem**: Product images showing broken

**Solutions**:
1. Check image URLs in `public/js/config.js`
2. Ensure images are publicly accessible
3. Check for hotlinking protection on image hosts

## 🔄 Updating the Site

### Make Changes Locally
```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

### Deploy Updates
```bash
# Vercel will auto-deploy on push
# Or force manual deploy:
vercel --prod
```

## 📊 Monitoring

### Vercel Dashboard
- **Deployments**: View deployment history
- **Analytics**: Traffic and performance data
- **Logs**: Error logs and runtime metrics
- **Settings**: Environment variables and domains

### Deepgram Console
- **Usage**: Monitor API usage
- **Logs**: Review transcription requests
- **Settings**: Manage API keys

### Twilio Console
- **Messaging**: View sent/received messages
- **Phone Numbers**: Manage phone numbers
- **Monitor**: Real-time event streaming

## 🏆 Best Practices

### Security
- ✅ Never commit `.env` file
- ✅ Rotate API keys regularly
- ✅ Use environment variables for all secrets
- ✅ Enable 2FA on all accounts
- ✅ Monitor usage for suspicious activity

### Performance
- ✅ Optimize images before uploading
- ✅ Use CDN for static assets
- ✅ Enable caching in Vercel
- ✅ Monitor Core Web Vitals

### Maintenance
- ✅ Update dependencies regularly
- ✅ Review and rotate API keys quarterly
- ✅ Check logs for errors daily
- ✅ Test all features after updates

## 📞 Support

If you encounter issues:

1. **Check Vercel Logs**: Dashboard > Deployments > View Logs
2. **Review Error Messages**: Browser console and network tab
3. **Verify API Keys**: Ensure they're correctly set in environment variables
4. **Test Locally**: Recreate issues in local development

## 🎉 Congratulations!

Your AJINASHOP luxury beauty e-commerce site is now live with:
- ✅ AI Voice Assistant
- ✅ WhatsApp Integration
- ✅ Professional Design
- ✅ Mobile Responsive
- ✅ E-commerce Features

---

**Next Steps**:
1. Add your own products and images
2. Configure payment gateway
3. Set up analytics
4. Connect to inventory system
5. Launch marketing campaigns

**Deployed URL**: Your Vercel deployment URL (e.g., `https://ajinashop-luxury.vercel.app`)

**Repository**: https://github.com/Maliot100X/ajinashop-luxury

---

© 2025 AJINASHOP. All rights reserved.