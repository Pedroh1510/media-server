FROM node:20-alpine AS runner
WORKDIR /app
# RUN npm install -g npm

COPY package* .

RUN npm ci --silent
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .

ENV port=3333
EXPOSE 3333
RUN npm run autogen
CMD [ "npm","run","server" ]