# HELLX STUDIO - Deployment & Setup Guide

## 🚀 Deployment Options

### Option 1: Deploy to Vercel (Recommended)

Vercel is the official Next.js deployment platform with zero-config setup for serverless functions.

#### Steps:

1. **Connect GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial HELLX Studio deployment"
   git remote add origin https://github.com/yourusername/hellx-studio.git
   git push -u origin main
   ```

2. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select your HELLX Studio repo

3. **Configure Environment Variables**
   - In Vercel Dashboard: Settings → Environment Variables
   - Add:
     ```
     TURSO_DATABASE_URL=libsql://your-db.turso.io
     TURSO_AUTH_TOKEN=your-auth-token
     GROQ_API_KEY=your-groq-api-key
     JWT_SECRET=your-jwt-secret
     ```

4. **Deploy**
   - Vercel automatically deploys on push to main
   - Your app is live at `https://your-project.vercel.app`

### Option 2: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

Then deploy:
```bash
docker build -t hellx-studio .
docker run -p 3000:3000 \
  -e TURSO_DATABASE_URL=... \
  -e TURSO_AUTH_TOKEN=... \
  -e GROQ_API_KEY=... \
  -e JWT_SECRET=... \
  hellx-studio
```

### Option 3: Self-Hosted (Linux/Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Clone and setup
git clone <your-repo>
cd hellx-studio
pnpm install

# Create .env.local
cat > .env.local << EOF
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
GROQ_API_KEY=your-groq-api-key
JWT_SECRET=your-jwt-secret
EOF

# Build and start
pnpm build
pnpm start
```

Use PM2 for process management:
```bash
npm install -g pm2
pm2 start "pnpm start" --name "hellx-studio"
pm2 save
pm2 startup
```

## 🔒 Security Checklist

Before production deployment:

- [ ] Change default JWT_SECRET to a strong random value
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure cookies (httpOnly, secure, sameSite)
- [ ] Enable CORS appropriately
- [ ] Rate limit API endpoints
- [ ] Monitor database connections
- [ ] Enable audit logging
- [ ] Regular database backups
- [ ] Update all dependencies
- [ ] Run security audits

### Generate Secure JWT Secret

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((Get-Random -InputObject (0..255) -Count 32))
```

## 📊 Monitoring & Observability

### Vercel Analytics
Built-in with `@vercel/analytics`:
- Web Vitals tracking
- Performance monitoring
- Error logging

### Sentry Integration (Optional)

Install:
```bash
pnpm add @sentry/nextjs
```

Configure in `next.config.mjs`:
```javascript
import { withSentryConfig } from "@sentry/nextjs";

const config = {
  // ... next config
};

export default withSentryConfig(config, { org: "...", project: "..." });
```

### Database Monitoring

Turso Dashboard:
- Real-time query statistics
- Performance metrics
- Error tracking

## 🚨 Error Handling

### Common Issues & Solutions

**Database Connection Fails**
```
Error: TURSO_DATABASE_URL is not set
Solution: Verify env vars in deployment platform
```

**Groq API Timeout**
```
Error: Request to Groq API timed out
Solution: Check Groq API status, verify API key quota
```

**JWT Token Invalid**
```
Error: Invalid session
Solution: Clear browser cookies, re-login
```

**Credit Deduction Failed**
```
Error: Failed to deduct credits
Solution: Check database indexes, verify user record exists
```

## 🔄 CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      - run: pnpm lint
      
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📈 Performance Optimization

### Database Query Optimization
- Indexes on frequently queried columns (already included)
- Connection pooling with Turso
- Query result caching

### Frontend Optimization
- Code splitting with Next.js
- Image optimization
- Static generation where possible

### API Response Caching
```typescript
export const revalidate = 3600; // Cache for 1 hour
```

## 🔧 Configuration

### Build Settings

`next.config.mjs`:
```javascript
export default {
  reactCompiler: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
}
```

### Environment Variables Priority

1. `.env.local` (local development, not in git)
2. `.env` (default values for all environments)
3. Platform env vars (Vercel, Docker, etc)

## 📱 Mobile Optimization

HELLX Studio is fully responsive:
- Mobile-first design
- Touch-friendly inputs
- Optimized for all screen sizes

## 🎯 Performance Targets

- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Cumulative Layout Shift**: < 0.1
- **API Response Time**: < 500ms

## 📞 Support & Documentation

- GitHub Issues: Report bugs
- Documentation: See README.md
- API Docs: Available at `/api/docs`
- Health Check: `/api/health`

## 🔐 SSL/TLS Certificates

### Vercel (Automatic)
- Auto-renewed
- No configuration needed
- Free with Vercel

### Self-Hosted
```bash
# Using Let's Encrypt with Certbot
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

## 🚀 Post-Deployment Checklist

- [ ] Test login/signup flow
- [ ] Verify AI chat is working
- [ ] Check credit system
- [ ] Monitor error logs
- [ ] Test on mobile
- [ ] Verify SSL certificate
- [ ] Test database backups
- [ ] Configure monitoring
- [ ] Set up alerts
- [ ] Document deployment process

---

**For questions or issues, refer to the main README.md or create a GitHub issue.**
