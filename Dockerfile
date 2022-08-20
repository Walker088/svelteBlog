FROM node:16-alpine

COPY build /app
COPY package*.json /app/

WORKDIR /app

RUN npm ci
RUN npm audit fix

RUN rm -rf static/cv/walker088
RUN rm -rf static/post_imgs

RUN apk add dumb-init

CMD ["dumb-init", "node", "./index.js"]
