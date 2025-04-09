// server.js oder ähnliche Datei
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Verbindung zur MongoDB
mongoose.connect('mongodb://localhost:27017/yourDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Schema
const UserSchema = new mongoose.Schema({
    // Ihre User-Felder hier
});
const User = mongoose.model('User', UserSchema);

// API-Endpoint für User Count
app.get('/api/user-count', async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server läuft auf Port 3000'));

// Jannik bitte Töte mich nicht das ich das backend angefasst habe okays ? :D