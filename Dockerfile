FROM node:20-alpine
WORKDIR /app
RUN apk upgrade --update-cache --available && \
  apk add openssl && \
  rm -rf /var/cache/apk/*
COPY package* .

RUN npm ci --silent
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .

ENV port=3333
EXPOSE 3333

CMD [ "npm","run","start" ]