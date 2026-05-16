FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

# Install root deps
COPY package.json package-lock.json* ./
RUN npm ci

# Copy backend source and prisma
COPY prisma ./prisma
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY .env* ./

# Generate Prisma client
RUN npm run prisma:generate

# Build backend
RUN npm run build

FROM node:20-alpine AS runtime
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and production deps
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 7860
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
