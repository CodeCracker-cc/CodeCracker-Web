#!/bin/bash

# Farben für die Ausgabe
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funktion zum Anzeigen von Statusmeldungen
print_status() {
  echo -e "${YELLOW}[*] $1${NC}"
}

# Funktion zum Anzeigen von Erfolgsmeldungen
print_success() {
  echo -e "${GREEN}[+] $1${NC}"
}

# Funktion zum Anzeigen von Fehlermeldungen
print_error() {
  echo -e "${RED}[-] $1${NC}"
}

# Funktion zum Anzeigen von Warnungen
print_warning() {
  echo -e "${YELLOW}[!] $1${NC}"
}

# Prüfen, ob Docker installiert ist
check_docker() {
  print_status "Prüfe Docker-Installation..."
  if ! command -v docker &> /dev/null; then
    print_error "Docker ist nicht installiert. Bitte installieren Sie Docker und versuchen Sie es erneut."
    exit 1
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose ist nicht installiert. Bitte installieren Sie Docker Compose und versuchen Sie es erneut."
    exit 1
  fi
  
  print_success "Docker und Docker Compose sind installiert."
}

# Prüfen, ob Git installiert ist
check_git() {
  print_status "Prüfe Git-Installation..."
  if ! command -v git &> /dev/null; then
    print_error "Git ist nicht installiert. Bitte installieren Sie Git und versuchen Sie es erneut."
    exit 1
  fi
  print_success "Git ist installiert."
}

# Prüfen, ob Node.js installiert ist
check_nodejs() {
  print_status "Prüfe Node.js-Installation..."
  if ! command -v node &> /dev/null; then
    print_error "Node.js ist nicht installiert. Bitte installieren Sie Node.js und versuchen Sie es erneut."
    exit 1
  fi
  print_success "Node.js ist installiert."
}

# Erstellen der Community-Service-Dateien
create_community_service_files() {
  print_status "Erstelle Community-Service-Dateien..."
  
  # Erstelle Verzeichnisse
  mkdir -p backend/services/community-service/src
  mkdir -p backend/services/community-service/models
  mkdir -p backend/services/community-service/routes
  
  # Erstelle Dockerfile
  cat > backend/services/community-service/Dockerfile << 'EOF'
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
EOF
  
  # Erstelle package.json
  cat > backend/services/community-service/package.json << 'EOF'
{
  "name": "community-service",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.1.0",
    "cors": "^2.8.5",
    "axios": "^1.4.0",
    "joi": "^17.9.2",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "supertest": "^6.3.3"
  }
}
EOF
  
  # Erstelle server.js
  cat > backend/services/community-service/src/server.js << 'EOF'
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('../routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'community-service' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/community', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Community service running on port ${PORT}`);
});

module.exports = app;
EOF
  
  # Erstelle routes/index.js
  cat > backend/services/community-service/routes/index.js << 'EOF'
const express = require('express');
const router = express.Router();
const Community = require('../models/community');
const Post = require('../models/post');
const User = require('../models/user');

// Middleware zum Validieren von Anfragen
const validateRequest = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Kein Token bereitgestellt' });
    }
    
    // Token-Validierung über Auth-Service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
    const axios = require('axios');
    
    const response = await axios.post(`${authServiceUrl}/api/auth/validate`, { token });
    
    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({ message: 'Ungültiger Token' });
    }
  } catch (error) {
    console.error('Fehler bei der Token-Validierung:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
};

// Community-Routen
router.get('/communities', async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('creator', 'username')
      .populate('members', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ 
      status: 'success',
      data: communities
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Communities:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Fehler beim Abrufen der Communities' 
    });
  }
});

// Community erstellen
router.post('/communities', validateRequest, async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    
    const newCommunity = new Community({
      name,
      description,
      tags,
      creator: req.user.id,
      members: [req.user.id]
    });
    
    await newCommunity.save();
    
    res.status(201).json({
      status: 'success',
      data: newCommunity
    });
  } catch (error) {
    console.error('Fehler beim Erstellen der Community:', error);
    res.status(500).json({
      status: 'error',
      message: 'Fehler beim Erstellen der Community'
    });
  }
});

// Beiträge einer Community abrufen
router.get('/communities/:communityId/posts', async (req, res) => {
  try {
    const { communityId } = req.params;
    
    const posts = await Post.find({ community: communityId })
      .populate('author', 'username avatar')
      .populate('likes', 'username')
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      data: posts
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Beiträge:', error);
    res.status(500).json({
      status: 'error',
      message: 'Fehler beim Abrufen der Beiträge'
    });
  }
});

// Beitrag erstellen
router.post('/communities/:communityId/posts', validateRequest, async (req, res) => {
  try {
    const { communityId } = req.params;
    const { title, content, codeSnippet } = req.body;
    
    // Prüfen, ob Community existiert
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        status: 'error',
        message: 'Community nicht gefunden'
      });
    }
    
    const newPost = new Post({
      title,
      content,
      codeSnippet,
      author: req.user.id,
      community: communityId
    });
    
    await newPost.save();
    
    res.status(201).json({
      status: 'success',
      data: newPost
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Beitrags:', error);
    res.status(500).json({
      status: 'error',
      message: 'Fehler beim Erstellen des Beitrags'
    });
  }
});

module.exports = router;
EOF
  
  # Erstelle models/community.js
  cat > backend/services/community-service/models/community.js << 'EOF'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);
EOF
  
  # Erstelle models/post.js
  cat > backend/services/community-service/models/post.js << 'EOF'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  codeSnippet: {
    type: String
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
EOF
  
  # Erstelle models/user.js
  cat > backend/services/community-service/models/user.js << 'EOF'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  bio: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
EOF
  
  print_success "Community-Service-Dateien wurden erstellt."
}

# Erstellen der Monitoring-Service-Dateien
create_monitoring_service_files() {
  print_status "Erstelle Monitoring-Service-Dateien..."
  
  # Erstelle Verzeichnisse
  mkdir -p backend/services/monitoring-service/src
  
  # Erstelle Dockerfile
  cat > backend/services/monitoring-service/Dockerfile << 'EOF'
FROM node:16-alpine

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Erstelle eine leere package.json, wenn keine vorhanden ist
RUN echo '{"name":"monitoring-service","version":"1.0.0","private":true,"scripts":{"start":"node src/server.js"},"dependencies":{"express":"^4.18.2","mongoose":"^7.1.0","cors":"^2.8.5","axios":"^1.4.0","joi":"^17.9.2","prom-client":"^14.2.0"}}' > package.json

# Abhängigkeiten installieren
RUN npm install

# Kopiere den Quellcode
COPY . .

# Port freigeben
EXPOSE 3000

# Starte den Service
CMD ["npm", "start"]
EOF
  
  # Erstelle package.json
  cat > backend/services/monitoring-service/package.json << 'EOF'
{
  "name": "monitoring-service",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.1.0",
    "cors": "^2.8.5",
    "axios": "^1.4.0",
    "joi": "^17.9.2",
    "prom-client": "^14.2.0"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "supertest": "^6.3.3"
  }
}
EOF
  
  # Erstelle server.js
  cat > backend/services/monitoring-service/src/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus Metriken
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Service-Verfügbarkeits-Gauge
const serviceAvailability = new promClient.Gauge({
  name: 'service_availability',
  help: 'Verfügbarkeit der Microservices (1 = verfügbar, 0 = nicht verfügbar)',
  labelNames: ['service'],
  registers: [register]
});

// API-Anfragen-Counter
const apiRequestsCounter = new promClient.Counter({
  name: 'api_requests_total',
  help: 'Gesamtzahl der API-Anfragen',
  labelNames: ['service', 'endpoint', 'method', 'status'],
  registers: [register]
});

// Middleware
app.use(cors());
app.use(express.json());

// Routen
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'monitoring-service' });
});

// Metriken-Endpunkt
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Service-Status-Endpunkt
app.get('/status', async (req, res) => {
  try {
    const services = [
      { name: 'auth-service', url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3000/health' },
      { name: 'challenge-service', url: process.env.CHALLENGE_SERVICE_URL || 'http://challenge-service:3000/health' },
      { name: 'execution-service', url: process.env.EXECUTION_SERVICE_URL || 'http://execution-service:3000/health' },
      { name: 'community-service', url: process.env.COMMUNITY_SERVICE_URL || 'http://community-service:3000/health' }
    ];
    
    const statuses = await Promise.all(
      services.map(async (service) => {
        try {
          const response = await axios.get(service.url, { timeout: 3000 });
          serviceAvailability.set({ service: service.name }, 1);
          return { name: service.name, status: 'online', details: response.data };
        } catch (error) {
          serviceAvailability.set({ service: service.name }, 0);
          return { name: service.name, status: 'offline', error: error.message };
        }
      })
    );
    
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      services: statuses
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Service-Status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Fehler beim Abrufen der Service-Status'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Monitoring service running on port ${PORT}`);
});

module.exports = app;
EOF
  
  print_success "Monitoring-Service-Dateien wurden erstellt."
}

# Erstellen der Auth-Service-Middleware
create_auth_service_middleware() {
  print_status "Erstelle Auth-Service-Middleware..."
  
  # Erstelle Verzeichnis
  mkdir -p backend/services/auth-service/middleware
  
  # Erstelle validateRequest.js
  cat > backend/services/auth-service/middleware/validateRequest.js << 'EOF'
const jwt = require('jsonwebtoken');

const validateRequest = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Kein Token bereitgestellt' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Ungültiger Token' });
  }
};

module.exports = validateRequest;
EOF
  
  print_success "Auth-Service-Middleware wurde erstellt."
}

# Hauptfunktion
main() {
  print_status "Starte Installation von CodeCracker-Web..."
  
  # Prüfe Abhängigkeiten
  check_docker
  check_git
  check_nodejs
  
  # Klone das Repository, wenn es nicht existiert
  if [ ! -d "CodeCracker-Web" ]; then
    print_status "Klone das Repository..."
    git clone https://github.com/CodeCracker-cc/CodeCracker-Web.git
    cd CodeCracker-Web
  else
    print_status "Repository existiert bereits. Aktualisiere..."
    cd CodeCracker-Web
    git pull
  fi
  
  # Erstelle die notwendigen Dateien
  create_community_service_files
  create_monitoring_service_files
  create_auth_service_middleware
  
  # Installiere Abhängigkeiten
  print_status "Installiere Abhängigkeiten..."
  npm install
  
  # Starte Docker-Container
  print_status "Starte Docker-Container..."
  cd backend
  
  # Prüfe, ob die Ports bereits belegt sind
  print_status "Prüfe, ob die benötigten Ports verfügbar sind..."
  
  # Funktion zum Prüfen, ob ein Port belegt ist
  check_port() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
      lsof -i :$port >/dev/null 2>&1
      return $?
    elif command -v netstat >/dev/null 2>&1; then
      netstat -tuln | grep ":$port " >/dev/null 2>&1
      return $?
    else
      # Fallback für Systeme ohne lsof oder netstat
      (echo > /dev/tcp/127.0.0.1/$port) >/dev/null 2>&1
      if [ $? -eq 0 ]; then
        return 0
      else
        return 1
      fi
    fi
  }
  
  # Prüfe MongoDB Port
  if check_port 27017; then
    print_warning "Port 27017 (MongoDB) ist bereits belegt. Versuche, den Dienst zu stoppen..."
    mongo_container=$(docker ps -q --filter "publish=27017")
    if [ -n "$mongo_container" ]; then
      print_status "Stoppe Docker-Container mit MongoDB..."
      docker stop $mongo_container
    fi
  fi
  
  # Prüfe Redis Port
  if check_port 6379; then
    print_warning "Port 6379 (Redis) ist bereits belegt. Versuche, den Dienst zu stoppen..."
    redis_container=$(docker ps -q --filter "publish=6379")
    if [ -n "$redis_container" ]; then
      print_status "Stoppe Docker-Container mit Redis..."
      docker stop $redis_container
    fi
  fi
  
  # Prüfe Gateway Port (3000)
  if check_port 3000; then
    print_warning "Port 3000 (Gateway) ist bereits belegt. Passe docker-compose.yml an..."
    # Finde einen freien Port für den Gateway-Service
    free_port=0
    for port in {8000..8100}; do
      if ! check_port $port; then
        free_port=$port
        break
      fi
    done
    
    if [ $free_port -ne 0 ]; then
      print_status "Ändere Gateway-Port in docker-compose.yml von 3000 auf $free_port..."
      # Ersetze den Port in der docker-compose.yml
      sed -i "s/- \"3000:3000\"/- \"$free_port:3000\"/" backend/docker-compose.yml
      print_success "Gateway-Port wurde auf $free_port geändert."
      # Speichere den Port für spätere Verwendung
      gateway_port=$free_port
    else
      print_error "Konnte keinen freien Port für den Gateway-Service finden."
      exit 1
    fi
  else
    gateway_port=3000
  fi
  
  # Warte kurz, damit die Ports freigegeben werden
  sleep 3
  
  # Starte Docker-Compose
  docker-compose down
  docker-compose build
  docker-compose up -d
  
  # Zeige Status der Container
  print_status "Status der Docker-Container:"
  docker-compose ps
  
  print_success "Installation abgeschlossen!"
  print_success "Die Anwendung sollte jetzt unter http://localhost:$gateway_port verfügbar sein."
}

# Starte das Hauptprogramm
main
