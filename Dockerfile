# ─── Stage 1: Build Frontend ─────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies first (better caching)
COPY Frontend/package*.json ./
RUN npm ci --silent

# Copy source and build
COPY Frontend/ ./
RUN npm run build

# ─── Stage 2: Build Backend ───────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY Backend/package*.json ./
RUN npm ci --omit=dev --silent

COPY Backend/ ./

# ─── Stage 3: Production Image ─────────────────────────────
FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app

# Copy backend files
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/server.js ./
COPY --from=backend-builder /app/backend ./

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3000

CMD ["node", "server.js"]