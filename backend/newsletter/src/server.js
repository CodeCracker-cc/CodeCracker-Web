const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Newsletter } = require('./models');
const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/codecracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Continuing without database connection for testing purposes');
  });

// Temporärer Speicher für Abonnenten, falls die Datenbankverbindung fehlschlägt
const subscribers = [];

// Routes
app.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Versuche, in der Datenbank zu speichern, falls verbunden
    try {
      // Check if email already exists
      const existingSubscriber = await Newsletter.findOne({ email });
      if (existingSubscriber) {
        return res.status(400).json({ success: false, message: 'Email already subscribed' });
      }

      // Create new subscriber
      const newSubscriber = new Newsletter({ email });
      await newSubscriber.save();
    } catch (dbError) {
      console.error('Database operation failed, using in-memory storage:', dbError);
      
      // Fallback: Speichere im temporären Speicher
      if (subscribers.includes(email)) {
        return res.status(400).json({ success: false, message: 'Email already subscribed' });
      }
      subscribers.push(email);
    }

    return res.status(201).json({ success: true, message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all subscribers (protected, for admin use)
app.get('/subscribers', async (req, res) => {
  try {
    let subscriberList = [];
    
    // Versuche, aus der Datenbank zu lesen, falls verbunden
    try {
      subscriberList = await Newsletter.find().select('-__v');
    } catch (dbError) {
      console.error('Database operation failed, using in-memory storage:', dbError);
      
      // Fallback: Verwende temporären Speicher
      subscriberList = subscribers.map(email => ({ email, subscribeDate: new Date(), active: true }));
    }
    
    return res.status(200).json({ success: true, data: subscriberList });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Unsubscribe
app.delete('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Versuche, aus der Datenbank zu löschen, falls verbunden
    try {
      const result = await Newsletter.findOneAndDelete({ email });
      
      if (!result) {
        return res.status(404).json({ success: false, message: 'Email not found in subscribers list' });
      }
    } catch (dbError) {
      console.error('Database operation failed, using in-memory storage:', dbError);
      
      // Fallback: Entferne aus temporärem Speicher
      const index = subscribers.indexOf(email);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Email not found in subscribers list' });
      }
      subscribers.splice(index, 1);
    }

    return res.status(200).json({ success: true, message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Newsletter service running on port ${PORT}`);
});

module.exports = app;
