const Post = require('../models/Post');
const Comment = require('../models/Comment');

class PostController {
  async createPost(req, res) {
    try {
      const { title, content, challengeId, tags } = req.body;
      
      const post = await Post.create({
        title,
        content,
        author: req.user._id,
        challenge: challengeId,
        tags
      });

      res.status(201).json({
        status: 'success',
        data: { post }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async getPosts(req, res) {
    try {
      const { challengeId, tag, search } = req.query;
      let query = {};

      if (challengeId) query.challenge = challengeId;
      if (tag) query.tags = tag;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      const posts = await Post.find(query)
        .populate('author', 'username')
        .sort('-createdAt');

      res.status(200).json({
        status: 'success',
        data: { posts }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async addComment(req, res) {
    try {
      const { postId } = req.params;
      const { content } = req.body;

      const comment = await Comment.create({
        content,
        author: req.user._id,
        post: postId
      });

      res.status(201).json({
        status: 'success',
        data: { comment }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async getPost(req, res) {
    try {
      const post = await Post.findById(req.params.postId)
        .populate('author', 'username')
        .populate({
          path: 'comments',
          populate: { path: 'author', select: 'username' }
        });

      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: 'Beitrag nicht gefunden'
        });
      }

      // Erhöhe Ansichtszähler
      post.views += 1;
      await post.save();

      res.status(200).json({
        status: 'success',
        data: { post }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async updatePost(req, res) {
    try {
      const { title, content, tags } = req.body;
      
      const post = await Post.findByIdAndUpdate(
        req.params.postId,
        { title, content, tags },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        status: 'success',
        data: { post }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async deletePost(req, res) {
    try {
      await Post.findByIdAndDelete(req.params.postId);
      await Comment.deleteMany({ post: req.params.postId });

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async likePost(req, res) {
    try {
      const post = await Post.findById(req.params.postId);
      
      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: 'Beitrag nicht gefunden'
        });
      }

      const userLiked = post.likes.includes(req.user._id);
      
      if (userLiked) {
        post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      } else {
        post.likes.push(req.user._id);
      }

      await post.save();

      res.status(200).json({
        status: 'success',
        data: { likes: post.likes.length }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async likeComment(req, res) {
    try {
      const comment = await Comment.findById(req.params.commentId);
      
      if (!comment) {
        return res.status(404).json({
          status: 'error',
          message: 'Kommentar nicht gefunden'
        });
      }

      const userLiked = comment.likes.includes(req.user._id);
      
      if (userLiked) {
        comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString());
      } else {
        comment.likes.push(req.user._id);
      }

      await comment.save();

      res.status(200).json({
        status: 'success',
        data: { likes: comment.likes.length }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }
}

module.exports = new PostController(); 