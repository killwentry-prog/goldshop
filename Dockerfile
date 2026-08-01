# Ограничиваем память, которую может занять сам процесс Node во время
# npm install/build — на билдерах с малым лимитом RAM (например, Railway
# trial) это предотвращает OOM-kill (exit code 137).
ARG NODE_MEM=384

# ---------- Stage 1: build frontend ----------
FROM node:20-alpine AS frontend-build
ARG NODE_MEM
ENV NODE_OPTIONS=--max-old-space-size=${NODE_MEM}
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund --prefer-offline
COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: build backend ----------
# Стадия намеренно наследуется от frontend-build (а не FROM node:20-alpine),
# чтобы Docker строил бэкенд ПОСЛЕ фронтенда, а не параллельно с ним —
# иначе два одновременных npm install удваивают пик потребления памяти
# и билд падает с exit code 137 на билдерах с ограниченным RAM.
FROM frontend-build AS backend-build
ARG NODE_MEM
ENV NODE_OPTIONS=--max-old-space-size=${NODE_MEM}
RUN apk add --no-cache python3 make g++
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --no-audit --no-fund --prefer-offline
COPY backend/ ./
RUN npm run build

# ---------- Stage 3: production image ----------
FROM node:20-alpine AS production
ARG NODE_MEM
ENV NODE_OPTIONS=--max-old-space-size=${NODE_MEM}
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev --no-audit --no-fund --prefer-offline

WORKDIR /app
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/frontend/dist ./frontend/dist

WORKDIR /app/backend
ENV NODE_ENV=production
ENV NODE_OPTIONS=
EXPOSE 3000

CMD ["node", "dist/index.js"]
