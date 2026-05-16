FROM node:20-alpine AS builder
WORKDIR /app

# Install root deps
COPY package.json package-lock.json* ./
RUN npm ci

# Copy backend source and prisma, and frontend source
COPY prisma ./prisma
COPY tsconfig.build.json ./
COPY src ./src
COPY .env* ./
COPY frontend ./frontend

# Generate Prisma client
RUN npm run prisma:generate

# Build frontend (production)
RUN cd frontend && npm ci && npm run build -- --configuration=production

# Build backend
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and production deps
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Copy built frontend dist to be served by Nest static assets
COPY --from=builder /app/frontend/dist ./frontend

EXPOSE 8000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
