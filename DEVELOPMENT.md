# HELLX STUDIO - Development Guide

## 🛠 Local Development Setup

### Prerequisites

```bash
# Node version
node --version  # Should be 18+

# Install pnpm
npm install -g pnpm@latest
pnpm --version
```

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd hellx-studio

# 2. Install dependencies
pnpm install

# 3. Create environment file
cat > .env.local << EOF
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
GROQ_API_KEY=your-groq-api-key
JWT_SECRET=your-super-secret-jwt-key
EOF

# 4. Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the app.

## 🧪 API Testing

### Using curl

#### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-04-22T12:00:00.000Z",
  "version": "1.0.0",
  "database": "connected"
}
```

#### 2. Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "testuser",
    "credits": 100,
    "tier": "free"
  },
  "token": "jwt-token-here"
}
```

#### 3. Login
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePassword123!"}' \
  | jq -r '.token')

echo $TOKEN
```

#### 4. Send Chat Message
```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, AI! What can you help me with?",
    "topic": "general"
  }'
```

Response:
```json
{
  "conversationId": "uuid-here",
  "response": "I'm HELLX Studio AI Assistant...",
  "creditsRemaining": 99
}
```

#### 5. Fetch Dashboard Data
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "testuser",
    "credits": 99,
    "tier": "free"
  },
  "conversations": [
    {
      "id": "uuid",
      "title": "First conversation",
      "topic": "general",
      "created_at": 1234567890
    }
  ]
}
```

#### 6. Get Messages
```bash
curl -X GET "http://localhost:3000/api/chat/messages?id=conversation-id" \
  -H "Authorization: Bearer $TOKEN"
```

#### 7. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## 📝 Using Postman

1. **Import Collection**
   - Create new collection "HELLX Studio"
   - Add requests with examples above

2. **Set Variables**
   - Click collection → Variables
   - Add:
     ```
     base_url: http://localhost:3000
     token: {{TOKEN}}
     ```

3. **Pre-request Script** (for signup response)
   ```javascript
   if (pm.response.code === 201) {
     let response = pm.response.json();
     pm.environment.set("token", response.token);
   }
   ```

## 🗄️ Database Management

### View Database Schema

```bash
# Connect to Turso database
turso db shell your-db-name

# View tables
.tables

# View users
SELECT id, email, username, credits, tier FROM users;

# View conversations
SELECT id, user_id, title, topic FROM conversations LIMIT 10;

# View sessions
SELECT id, user_id, expires_at FROM sessions;
```

### Reset Database (Development Only)

```bash
# Delete all data (careful!)
turso db shell your-db-name
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM sessions;
DELETE FROM credit_transactions;
DELETE FROM users;
```

## 🔍 Debugging

### Enable Debug Logging

Add to your code:
```typescript
console.log("[v0] Debug message:", data);
```

### Check Console Output

```bash
# Watch terminal for real-time logs
pnpm dev

# Errors will appear with [v0] prefix
```

### Browser DevTools

1. Open Chrome DevTools (F12)
2. Network tab: See API requests/responses
3. Console tab: See client-side errors
4. Application tab: Check localStorage for auth_token

### Database Debugging

```typescript
// In lib/auth.ts - add logging
console.log("[v0] Executing query:", sql, args);
const result = await client.execute({ sql, args });
console.log("[v0] Query result:", result.rows.length, "rows");
```

## 📦 Project Structure Explained

```
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles
├── signup/page.tsx             # Sign up page
├── login/page.tsx              # Login page
├── dashboard/page.tsx          # Main chat interface
├── not-found.tsx               # 404 page
└── api/
    ├── auth/
    │   ├── signup/route.ts     # Create account
    │   ├── login/route.ts      # Login endpoint
    │   └── logout/route.ts     # Logout endpoint
    ├── chat/
    │   ├── send/route.ts       # Send message to AI
    │   └── messages/route.ts   # Fetch messages
    ├── dashboard/route.ts      # Dashboard data
    └── health/route.ts         # Health check

components/
├── particle-background.tsx     # Animated background
└── ui/                         # shadcn/ui components

lib/
├── auth.ts                     # Auth & DB functions
├── db.ts                       # Database connection
└── schema.ts                   # Database schema types

hooks/
├── use-auth.ts                 # Auth hook
└── use-mobile.ts               # Mobile detection

middleware.ts                   # Auth middleware

scripts/
└── init-db.ts                  # Database initialization
```

## 🧹 Code Quality

### Format Code

```bash
# Format with Prettier (if configured)
pnpm format

# Or use VSCode: Shift+Alt+F
```

### Lint

```bash
pnpm lint

# Fix issues
pnpm lint --fix
```

### Type Check

```bash
pnpm type-check
```

## 🎯 Common Development Tasks

### Add a New API Endpoint

1. Create `app/api/feature/route.ts`
2. Export `POST`, `GET`, etc.
3. Add authentication check
4. Add error handling
5. Test with curl

### Add a New Page

1. Create `app/newpage/page.tsx`
2. Add to navigation
3. Test routing
4. Update metadata if public

### Modify Database Schema

1. Update `lib/schema.ts`
2. Create migration in `scripts/`
3. Run migration
4. Update API endpoints
5. Test data integrity

### Add New AI Model

```typescript
// app/api/chat/send/route.ts
import { groq } from '@ai-sdk/groq';

// Change model
const { textStream } = await streamText({
  model: groq('llama-3.3-70b-versatile'),  // or mixtral-8x7b-32768
  // ...
});
```

## 🧪 Performance Testing

### Check Build Size

```bash
pnpm build

# Output shows bundle analysis
```

### Test on Slow Network

1. DevTools → Network
2. Throttling: Slow 4G
3. Reload page
4. Check load times

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test
ab -n 1000 -c 100 http://localhost:3000/api/health
```

## 🚨 Common Errors & Solutions

### "Cannot find module '@libsql/client'"
```bash
# Run installation again
pnpm install
```

### "JWT_SECRET is not set"
```bash
# Create .env.local file
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local
```

### "EADDRINUSE: address already in use :::3000"
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### "Database connection failed"
```bash
# Verify credentials
echo $TURSO_DATABASE_URL
echo $TURSO_AUTH_TOKEN

# Test curl request to Turso
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Turso Documentation](https://docs.turso.tech)
- [Groq API Docs](https://console.groq.com/docs)
- [AI SDK Documentation](https://sdk.vercel.ai)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🎓 Learning Path

1. Understand Next.js routing (`app/` directory)
2. Learn API routes (`app/api/`)
3. Study authentication flow
4. Explore Turso database operations
5. Learn AI SDK integration
6. Master the UI components

## 💡 Tips & Tricks

```typescript
// Debug middleware
export async function middleware(request) {
  console.log('[v0] middleware', request.nextUrl.pathname);
  return NextResponse.next();
}

// Add request logging
const response = await fetch(url, { ...options });
console.log('[v0]', method, url, response.status);

// Test error handling
throw new Error('Test error');
```

---

**Happy coding! 🎉**
