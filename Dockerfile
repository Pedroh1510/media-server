# FROM node:20-slim AS builder
FROM node:20-alpine AS builder
COPY frontend .
RUN npm ci --silent
RUN npm run build

# FROM node:20-slim as runner
FROM node:20-alpine as runner
WORKDIR /app
# RUN apk upgrade --update-cache --available && \
#   apk add openssl && \
#   rm -rf /var/cache/apk/*
RUN apk update && apk add --no-cache nmap openssl && \
  echo @edge https://dl-cdn.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
  echo @edge https://dl-cdn.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
  apk update && \
  apk add --no-cache \
  chromium \
  harfbuzz \
  "freetype>2.8" \
  ttf-freefont \
  nss && \
  rm -rf /var/cache/apk/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# RUN apt update && apt upgrade -y && apt install openssl -y
# RUN apt-get update && apt-get install gnupg wget -y && \
#   wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
#   sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
#   apt-get update && \
#   apt-get install google-chrome-stable -y --no-install-recommends && \
#   rm -rf /var/lib/apt/lists/*

RUN npm install -g npm
COPY package* .

RUN npm ci --silent
RUN npx puppeteer browsers install chrome
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .

COPY --from=builder dist /app/dist

ENV port=3333
EXPOSE 3333

CMD [ "npm","run","start" ]