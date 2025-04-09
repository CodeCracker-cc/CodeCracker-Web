FROM node:16-alpine

WORKDIR /usr/src/app

# Kopiere Gateway-Dateien
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]