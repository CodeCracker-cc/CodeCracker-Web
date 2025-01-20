const express = require('express');
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Öffentliche Routen
router.get('/posts', postController.getPosts);
router.get('/posts/:postId', postController.getPost);

// Geschützte Routen
router.use(authMiddleware.protect);

router.post('/posts', postController.createPost);
router.post('/posts/:postId/comments', postController.addComment);
router.patch('/posts/:postId', authMiddleware.isAuthor, postController.updatePost);
router.delete('/posts/:postId', authMiddleware.isAuthor, postController.deletePost);

router.post('/posts/:postId/like', postController.likePost);
router.post('/comments/:commentId/like', postController.likeComment);

module.exports = router; 