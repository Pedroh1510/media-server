FROM node:20-slim AS builder
COPY frontend .
RUN npm ci --silent
RUN npm run build

FROM node:20-slim as runner
WORKDIR /app
# RUN apk upgrade --update-cache --available && \
#   apk add openssl && \
#   rm -rf /var/cache/apk/*
RUN apt update && apt upgrade -y && apt install openssl -y
RUN npm install -g npm
COPY package* .

RUN npm ci
RUN npx puppeteer browsers install chrome
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .

COPY --from=builder dist /app/dist

ENV port=3333
EXPOSE 3333

CMD [ "npm","run","start" ]