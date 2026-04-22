#!/bin/bash

# HELLX STUDIO - Quick Reference Commands

## 🚀 Getting Started

# Install and run locally
pnpm install && pnpm dev

# Health check
curl http://localhost:3000/api/health

## 👤 Authentication

# Signup
SIGNUP=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "SecurePass123"
  }')

TOKEN=$(echo $SIGNUP | jq -r '.token')
echo "Token: $TOKEN"

# Login
LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123"}')

TOKEN=$(echo $LOGIN | jq -r '.token')
echo "Token: $TOKEN"

## 💬 Chat API

# Send message
curl -X POST http://localhost:3000/api/chat/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello AI!",
    "topic": "general"
  }' | jq

# Get messages
curl http://localhost:3000/api/chat/messages?id=CONV_ID \
  -H "Authorization: Bearer $TOKEN" | jq

## 📊 Dashboard

# Get user data
curl http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq

## 🚪 Logout

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

## 🗄️ Database

# Connect to Turso
turso db shell <db-name>

# View users
SELECT id, email, username, credits FROM users;

# View conversations
SELECT id, title, topic FROM conversations;

# Check sessions
SELECT id, expires_at FROM sessions;

## 🧪 Testing

# Load test
ab -n 1000 -c 100 http://localhost:3000/api/health

# Check build size
pnpm build

# Lint code
pnpm lint

## 🚀 Deployment

# Deploy to Vercel
vercel deploy

# Set environment
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add GROQ_API_KEY
vercel env add JWT_SECRET

## 📦 Docker

# Build image
docker build -t hellx-studio .

# Run container
docker run -p 3000:3000 \
  -e TURSO_DATABASE_URL=libsql://... \
  -e TURSO_AUTH_TOKEN=... \
  -e GROQ_API_KEY=... \
  -e JWT_SECRET=... \
  hellx-studio

## 🔧 Development

# Watch mode
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Type check
pnpm type-check

## 🐛 Debugging

# Check env vars
env | grep TURSO
env | grep GROQ
env | grep JWT

# View logs
tail -f ~/.pm2/logs/hellx-studio-out.log

# Restart dev server
# Press: Ctrl+C then: pnpm dev

## 📝 Project Management

# View tasks
grep -r "TODO\|FIXME" app/ lib/

# Git status
git status

# Commit changes
git add .
git commit -m "feature: description"
git push origin main

## 📊 Performance

# Check Lighthouse
vercel inspect

# Monitor requests
# DevTools → Network Tab

## 🆘 Emergency

# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Clear Next.js cache
rm -rf .next

# Reset node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Database reset (DEV ONLY)
turso db shell <db-name>
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM sessions;
DELETE FROM credit_transactions;
DELETE FROM users;

---

For detailed documentation, see:
- README.md       - Feature overview
- DEVELOPMENT.md  - Development guide
- DEPLOYMENT.md   - Deployment instructions
- SUMMARY.md      - Project completion summary
