FROM node:16-alpine

WORKDIR /app

COPY . .

RUN npm ci
RUN npm audit fix
RUN npm run build
RUN apk add dumb-init

CMD ["dumb-init", "node", "./build/index.js"]
