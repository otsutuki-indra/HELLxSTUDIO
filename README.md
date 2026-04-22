# HELLX STUDIO - Premium AI Creative Platform

The most advanced AI collaboration platform for designers, developers, and creative professionals. Built with absolute stability, concurrent database handling, and seamless AI integration.

## ✨ Features

- **Premium AI Chatbot** - Advanced conversational AI powered by Groq (Mixtral 8x7b)
- **Concurrent Database Handling** - Turso SQLite with optimized indexes for high-volume users
- **Custom JWT Authentication** - Secure session management with bcryptjs
- **Credit System** - Flexible, real-time credit-based pricing
- **Live Conversations** - Instant message synchronization across tabs
- **Beautiful UI** - Premium dark theme with animated particles
- **Tier System** - Free, Pro, and Premium tiers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Turso Database Account
- Groq API Key
- Environment Variables Set

### Environment Setup

Create or update your `.env.local`:

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
GROQ_API_KEY=your-groq-api-key
JWT_SECRET=your-jwt-secret
```

### Installation

```bash
# Install dependencies
pnpm install

# The app initializes the database automatically on first API call
pnpm dev
```

Visit `http://localhost:3000` to get started.

## 📁 Project Structure

```
app/
├── page.tsx                 # Landing page with particles
├── signup/page.tsx         # Signup form
├── login/page.tsx          # Login form
├── dashboard/page.tsx      # Main chat interface
├── api/
│   ├── auth/
│   │   ├── signup/route.ts
│   │   ├── login/route.ts
│   │   └── logout/route.ts
│   ├── chat/
│   │   ├── send/route.ts   # AI chat endpoint
│   │   └── messages/route.ts
│   └── dashboard/route.ts

lib/
├── auth.ts                 # Authentication & DB operations
├── db.ts                   # Database connection
└── schema.ts               # Database schema

components/
└── particle-background.tsx # Animated background
```

## 🔐 Security Features

- **Password Hashing** - bcryptjs with 12 salt rounds
- **JWT Tokens** - 7-day expiration with secure signing
- **Session Management** - Database-backed session tracking
- **Concurrent Handling** - SQLite indexes prevent race conditions
- **Input Validation** - Server-side validation on all endpoints

## 💾 Database Schema

### Users Table
- id (PK)
- email (unique)
- username (unique)
- password_hash
- credits (default 100)
- tier (free/pro/premium)
- avatar_url
- created_at, updated_at

### Conversations Table
- id (PK)
- user_id (FK)
- title
- topic
- created_at, updated_at

### Messages Table
- id (PK)
- conversation_id (FK)
- role (user/assistant)
- content
- tokens_used
- created_at

### Sessions Table
- id (PK)
- user_id (FK)
- token (unique)
- expires_at
- created_at

### Credit Transactions Table
- id (PK)
- user_id (FK)
- amount
- type (purchase/usage/bonus)
- description
- created_at

## 🤖 AI Integration

HELLX uses Groq's Mixtral 8x7b model for ultra-fast inference:

```typescript
import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

const { textStream } = await streamText({
  model: groq('mixtral-8x7b-32768'),
  system: 'You are HELLX Studio AI Assistant...',
  messages: [...],
});
```

## 💎 Credit System

- **Free Tier**: 100 credits (for new users)
- **Pro Tier**: Purchase credits as needed
- **Premium Tier**: Unlimited credits

Each chat message costs 1 credit. Real-time credit deduction and tracking.

## 🎨 Design System

- **Color Palette**: Deep purple (#8B5CFF) and pink (#FF6B9D) with dark background
- **Typography**: Geist Sans & Geist Mono
- **Theme**: Premium dark mode with glassmorphism
- **Animations**: Particle background with dynamic connections

## 📊 Performance Optimizations

- **SQLite Indexes** - On user_id, token, email for O(log n) lookups
- **Connection Pooling** - Reusable Turso client instance
- **Message Streaming** - Real-time AI response streaming to users
- **Lazy Loading** - Conversations load on-demand

## 🧪 Testing

```bash
# Create a test account
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Send message
curl -X POST http://localhost:3000/api/chat/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello AI!","topic":"general"}'
```

## 📈 Deployment

Deploy to Vercel with a single click:

```bash
vercel deploy
```

Ensure environment variables are set in Vercel Project Settings.

## 🛠 Troubleshooting

### Database Connection Fails
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set
- Check network connectivity to Turso
- Ensure database is not in maintenance mode

### Groq API Errors
- Verify `GROQ_API_KEY` is valid and has available quota
- Check API rate limits
- Try with a different Groq model

### Authentication Issues
- Clear browser localStorage
- Verify JWT_SECRET is set
- Check session expiration times

## 📝 License

MIT License - Feel free to use and modify for your projects.

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API error messages in browser console
3. Check server logs for detailed error information

---

**Built with Next.js 16, Turso SQLite, Groq AI, and Premium Design** ✨
