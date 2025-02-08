const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('../routes/authRoutes');

const app = express();

// CORS konfigurieren
app.use(cors({
  origin: ['http://192.168.178.200', 'http://localhost:3000'], // Erlaube Frontend und Gateway
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/', authRoutes);

// MongoDB Verbindung
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB verbunden'))
.catch(err => console.error('MongoDB Verbindungsfehler:', err));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Auth Service läuft auf Port ${port}`);
  console.log('CORS erlaubt für:', ['http://192.168.178.200', 'http://localhost:3000']);
}); 