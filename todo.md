# AJINASHOP Luxury — Fix API 404 & Polish

## Critical Fix
- [ ] Fix API 404 issue: `/api/**/*.js` endpoints return 404 on Vercel
  - Root cause: `builds` config with `@vercel/node` + mixed CommonJS/ESM syntax not working
  - Solution: Convert API files to pure CommonJS (module.exports) OR use zero-config approach
  - Must verify locally before deploying
- [ ] Verify all endpoints return 200 after fix (transcribe, tts, webhook, whatsapp-send, sms-send)

## Verify (No Breaking Changes)
- [ ] Category tabs still filter products correctly
- [ ] Mobile responsiveness still good
- [ ] Voice assistant works (Deepgram + browser fallback)
- [ ] WhatsApp number correct (+14155238886)

## Deploy
- [ ] Push to GitHub (Maliot100X/ajinashop-luxury, main branch)
- [ ] Deploy to Vercel ONE TIME only (user said stop redeploying)
- [ ] Final verification of live site
