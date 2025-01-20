FROM node:16-alpine

# Installation von Docker CLI
RUN apk add --no-cache docker-cli

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"] 