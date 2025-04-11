FROM node:16-alpine

WORKDIR /usr/src/app

# Kopiere Gateway-Dateien
COPY package*.json ./

RUN npm install

COPY . .

# Entferne den Versuch, das Frontend zu kopieren
# RUN mkdir -p /usr/src/frontend
# COPY ../../frontend /usr/src/frontend

EXPOSE 3000

CMD ["npm", "start"]