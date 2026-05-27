# 🚀 CollabCode v2.0

**Real-time collaborative code editor** — like VS Code Live Share, but in your browser.

![Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Stack](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)
![Stack](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Stack](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io)
![Stack](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

---

## ✨ Features

| Feature | Status |
|---|---|
| JWT Authentication (register/login) | ✅ |
| Room-based collaboration | ✅ |
| Real-time collaborative editing (Yjs CRDT) | ✅ |
| Live cursor & user awareness | ✅ |
| 8+ language support (Monaco Editor) | ✅ |
| Auto-save to MongoDB | ✅ |
| In-room chat | ✅ |
| Mobile responsive UI | ✅ |
| Dark theme | ✅ |
| Docker support | ✅ |
| AWS deployment ready | ✅ |

---

## 🏗️ Architecture

```
collabcode/
├── Backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Auth, Room logic
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # User, Room schemas
│   ├── routes/         # API route definitions
│   ├── sockets/        # Socket.IO handlers
│   ├── .env.example    # Environment template
│   └── server.js       # Entry point
│
├── Frontend/
│   └── src/
│       ├── components/  # UI components (Navbar, Avatar, etc.)
│       ├── context/     # Auth context
│       ├── pages/       # Landing, Login, Register, Dashboard, Editor
│       ├── routes/      # ProtectedRoute, PublicOnlyRoute
│       ├── services/    # API helpers
│       └── styles/      # Global CSS + design tokens
│
├── Dockerfile           # Multi-stage production build
├── docker-compose.yml   # Docker Compose config
├── nginx.conf           # Nginx reverse proxy
└── ecosystem.config.cjs # PM2 config
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free tier works)

### 1. Clone & setup environment

```bash
git clone <your-repo>
cd collabcode

# Backend .env
cp Backend/.env.example Backend/.env
# Edit Backend/.env and fill in:
#   MONGODB_URI=mongodb+srv://...
#   JWT_SECRET=your-random-secret
#   FRONTEND_URL=http://localhost:5173
```

### 2. Start Backend

```bash
cd Backend
npm install
npm run dev
# → Running on http://localhost:3000
```

### 3. Start Frontend

```bash
cd Frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

Open http://localhost:5173 and start collaborating!

---

## 🐳 Docker

### Production build (single container)

```bash
# Create .env file with your values
cat > .env << EOF
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret
FRONTEND_URL=http://your-domain.com
EOF

# Build and run
docker compose up -d

# View logs
docker compose logs -f
```

### Development mode (hot reload)

```bash
docker compose --profile dev up
```

---

## ☁️ AWS EC2 Deployment

### 1. Launch EC2 Instance
- AMI: Ubuntu 22.04 LTS
- Instance type: t3.small (or larger)
- Security group: Allow ports 22, 80, 443, 3000

### 2. Install dependencies

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx & PM2
sudo apt-get install -y nginx
sudo npm install -g pm2

# Install Docker (optional)
curl -fsSL https://get.docker.com | sh
```

### 3. Deploy with Docker

```bash
# Clone repo
git clone <your-repo> /var/www/collabcode
cd /var/www/collabcode

# Create .env
nano .env  # Add your env vars

# Build & run
docker compose up -d

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/collabcode
sudo ln -s /etc/nginx/sites-available/collabcode /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 4. SSL with Certbot (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 5. Deploy without Docker (PM2)

```bash
cd Backend
npm install --production
cp .env.example .env  # Fill in values

# Build frontend
cd ../Frontend
npm install
npm run build
cp -r dist ../Backend/public/

# Start with PM2
cd ..
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup  # Auto-start on reboot
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `JWT_SECRET` | Secret for JWT signing (use random 32+ chars) | ✅ |
| `FRONTEND_URL` | Your frontend URL (for CORS) | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) | ❌ |
| `NODE_ENV` | production / development | ❌ |

---

## 🗄️ MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster (M0)
3. Create a database user with password
4. Add your IP to Network Access (or 0.0.0.0/0 for all)
5. Get connection string: Connect → Drivers → Copy string
6. Replace `<password>` with your password
7. Paste into `MONGODB_URI` in `.env`

Collections created automatically:
- `users` — User accounts
- `rooms` — Collaboration rooms

---

## 📡 API Reference

### Auth
```
POST /api/auth/register  { username, email, password }
POST /api/auth/login     { email, password }
GET  /api/auth/me        (requires Bearer token)
```

### Rooms
```
POST   /api/rooms         Create room
GET    /api/rooms/my      Get my rooms
GET    /api/rooms/:id     Get room by ID
PATCH  /api/rooms/:id/save  Save code
DELETE /api/rooms/:id     Delete room
```

### Socket Events
```
Client → Server:
  room:join     { roomId, user }
  room:leave    { roomId }
  room:save     { roomId, code, language }
  room:language { roomId, language }
  room:chat     { roomId, message, user }

Server → Client:
  room:code     { code, language }
  room:users    [{ username, color, socketId }]
  room:language { language }
  room:chat     { message, user, timestamp }
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Monaco Editor, Yjs, Socket.IO Client, React Router, React Hot Toast, React Icons
- **Backend**: Node.js, Express 4, Socket.IO, Yjs (y-socket.io), JWT, bcryptjs, Helmet, Rate Limiting, CORS
- **Database**: MongoDB Atlas with Mongoose ODM
- **Deployment**: Docker, Docker Compose, Nginx, PM2, AWS EC2

---

## 📄 License

MIT — Feel free to use, modify, and deploy!
