# CodeMaster - Coding Challenge Platform

CodeMaster ist eine moderne Plattform für Programmierer, um ihre Fähigkeiten durch praktische Coding-Challenges zu verbessern. Die Plattform bietet eine Microservices-Architektur für optimale Skalierbarkeit und Wartbarkeit.

## 🚀 Features

- **Benutzer-Management**
  - Registrierung und Login
  - Zwei-Faktor-Authentifizierung
  - Benutzerprofile mit Statistiken
  - Badge-System für Achievements

- **Coding-Challenges**
  - Verschiedene Schwierigkeitsgrade
  - Multiple Programmiersprachen (Python, JavaScript, Java, C++)
  - Automatische Code-Ausführung und Bewertung
  - Testfälle mit versteckten Inputs

- **Community-Features**
  - Diskussionsforum für Challenges
  - Bewertungssystem
  - Lösungsvorschläge und Tipps
  - Benutzer-Rankings

## 🏗 Architektur

### Microservices

1. **Auth-Service (Port 3001)**
   - Benutzerauthentifizierung
   - Profilmanagement
   - Statistik-Tracking

2. **Challenge-Service (Port 3002)**
   - Challenge-Verwaltung
   - Submission-Handling
   - Bewertungssystem

3. **Execution-Service (Port 3003)**
   - Sichere Code-Ausführung
   - Test-Evaluation
   - Performance-Monitoring

4. **Community-Service (Port 3004)**
   - Forum-Funktionalität
   - Kommentarsystem
   - Bewertungen

### Technologie-Stack

- **Backend:**
  - Node.js/Express.js
  - MongoDB (Datenbank)
  - Docker (Container)
  - JWT (Authentifizierung)

- **Sicherheit:**
  - Docker-Isolation für Code-Ausführung
  - Rate-Limiting
  - Input-Validierung
  - XSS-Schutz

## 🛠 Installation

1. **Voraussetzungen**
   ```bash
   - Docker & Docker Compose
   - Node.js (v16+)
   - MongoDB
   ```

2. **Setup**
   ```bash
   # Repository klonen
   git clone https://github.com/your-repo/codemaster.git
   cd codemaster

   # Dependencies installieren
   npm install

   # Docker-Container starten
   docker-compose up -d
   ```

3. **Umgebungsvariablen**
   ```env
   # .env Beispiel
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=90d
   MONGODB_URI=mongodb://mongodb:27017
   ```

## 📚 API-Dokumentation

### Auth-Service

```
POST /api/auth/register - Neuen Benutzer registrieren
POST /api/auth/login - Benutzer einloggen
GET /api/users/profile - Benutzerprofil abrufen
```

### Challenge-Service
```
GET /api/challenges - Alle Challenges abrufen
POST /api/challenges/:id/submit - Lösung einreichen
GET /api/challenges/category/:category - Nach Kategorie filtern
```

### Community-Service
```
POST /api/posts - Forumbeitrag erstellen
GET /api/posts/challenge/:id - Beiträge zu Challenge abrufen
POST /api/comments - Kommentar erstellen
```

## 🔒 Sicherheit

- Sichere Code-Ausführung in isolierten Containern
- Ressourcenlimits für Container (CPU, RAM, Netzwerk)
- Input-Validierung und Sanitization
- JWT-basierte Authentifizierung
- Rate-Limiting für API-Endpoints

## 🤝 Beitragen

1. Fork das Repository
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE.md](LICENSE.md)

## 👥 Team

- EinsPommes - Backend-Entwicklung
- TypTech - Frontend-Entwicklung

## 📞 Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue oder kontaktieren Sie uns unter support@codemaster.com
