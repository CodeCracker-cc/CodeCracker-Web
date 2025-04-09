FROM node:16-alpine

WORKDIR /usr/src/app

# Kopiere Gateway-Dateien
COPY package*.json ./

RUN npm install

COPY . .

# Erstelle Frontend-Verzeichnis
RUN mkdir -p /usr/src/frontend

# Kopiere Frontend-Dateien (wird beim Build-Prozess ausgeführt)
COPY ../../frontend /usr/src/frontend

EXPOSE 3000

CMD ["npm", "start"]