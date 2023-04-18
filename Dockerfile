FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /home/container
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY index.js /home/container
RUN chown -R node /home/container
USER node
CMD ["node", "index.js"]
