# FROM node:20-buster-slim
# FROM node:lts-alpine
FROM node:20-alpine
# FROM node:18-alpine
WORKDIR /app
# RUN apt update -y  && apt upgrade -y  && apt install openssl -y && apt autoremove -y
RUN apk upgrade --update-cache --available && \
  apk add openssl && \
  rm -rf /var/cache/apk/*
COPY package* .
COPY prisma ./prisma/
ENV DATABASE_URL="file:./dev.db"

RUN npm ci --silent
RUN npx prisma migrate deploy
COPY . .
# RUN npx prisma generate --schema=./prisma/schema.prisma

# COPY --chown=node:node . .
# USER node
# COPY . .
ENV port=3333
EXPOSE 3333

CMD [ "npm","run","start" ]
# linux/amd64,linux/arm64,linux/arm64/v8