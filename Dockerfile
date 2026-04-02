FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# ---

FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --silent

COPY prisma ./prisma/
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

ENV PORT=3333
EXPOSE 3333

CMD ["node", "dist/main"]
