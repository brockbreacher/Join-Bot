FROM node:23-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN mkdir -p guilds && chown -R node:node ./
COPY package*.json ./
RUN npm install --production --silent
COPY . .
USER node
CMD ["node", "index.js"]