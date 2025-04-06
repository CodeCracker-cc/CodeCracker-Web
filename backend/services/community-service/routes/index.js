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
