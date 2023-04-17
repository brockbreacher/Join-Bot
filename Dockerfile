FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN chown node:node /usr/src/app
USER node
RUN mkdir -p /usr/src/app/data && chmod 777 /usr/src/app/data
VOLUME /usr/src/app/data
RUN npm install -g npm@latest
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
CMD ["node", "index.js"]
