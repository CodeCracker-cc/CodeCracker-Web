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
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ success: false, message: 'Email already subscribed' });
    }

    // Create new subscriber
    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    return res.status(201).json({ success: true, message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all subscribers (protected, for admin use)
app.get('/api/newsletter/subscribers', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().select('-__v');
    return res.status(200).json({ success: true, data: subscribers });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Unsubscribe
app.delete('/api/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const result = await Newsletter.findOneAndDelete({ email });
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Email not found in subscribers list' });
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
