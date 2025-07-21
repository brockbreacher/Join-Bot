FROM node:23-alpine  
ENV NODE_ENV=production  
WORKDIR /usr/src/app  
RUN mkdir -p guilds && chown -R node:node ./  
VOLUME /usr/src/app/guilds  
COPY package*.json ./  
RUN npm install --production --silent  
COPY . .  
RUN chown -R node:node /usr/src/app/guilds  
USER node  
CMD ["node", "index.js"]  
