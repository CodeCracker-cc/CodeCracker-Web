FROM node:16-alpine

# Arbeitsverzeichnis erstellen
WORKDIR /usr/src/app

# Erstelle eine leere package.json, wenn keine vorhanden ist
RUN echo '{"name":"community-service","version":"1.0.0","private":true,"scripts":{"start":"node src/server.js"},"dependencies":{"express":"^4.18.2","mongoose":"^7.1.0","cors":"^2.8.5","axios":"^1.4.0","joi":"^17.9.2","jsonwebtoken":"^9.0.0"}}' > package.json

# Abhängigkeiten installieren
RUN npm install

# Kopiere den Quellcode
COPY . .

# Port freigeben
EXPOSE 3000

# Starte den Service
CMD ["npm", "start"]
