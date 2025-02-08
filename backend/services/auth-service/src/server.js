const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('../routes/authRoutes');

const app = express();

// CORS konfigurieren
app.use(cors({
  origin: 'http://192.168.178.200',
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Auth Service läuft auf Port ${port}`);
}); 