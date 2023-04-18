FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY index.js /home/container
RUN chown -R node /usr/src/app
RUN adduser -D container
USER container
ENV USER=container HOME=/home/container
RUN rm -rf /home/container && mkdir /home/container
WORKDIR /home/container
CMD ["node", "index.js"]
