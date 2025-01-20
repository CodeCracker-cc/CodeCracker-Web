const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const axios = require('axios');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new Error('Sie sind nicht eingeloggt');
    }

    // Validiere Token über den Auth-Service
    const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/verify`, { token });
    req.user = response.data.user;
    
    next();
  } catch (err) {
    res.status(401).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.isAuthor = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Beitrag nicht gefunden'
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Sie sind nicht der Autor dieses Beitrags'
      });
    }

    next();
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
}; 