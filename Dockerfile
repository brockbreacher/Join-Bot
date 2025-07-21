FROM node:23-alpine
ENV NODE_ENV=production

RUN apk add --no-cache su-exec

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production --silent
COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

VOLUME /usr/src/app/guilds
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "index.js"]
