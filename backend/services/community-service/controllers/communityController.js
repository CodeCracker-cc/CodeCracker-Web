const Post = require('../models/Post');
const Comment = require('../models/Comment');
const communitySchemas = require('../schemas/communitySchemas');
const validateRequest = require('../../../middleware/validateRequest');
const AppError = require('../../../utils/appError');
const logger = require('../../../utils/logger');

class CommunityController {
  async createPost(req, res, next) {
    try {
      await validateRequest(communitySchemas.createPost)(req, res, async () => {
        const post = await Post.create({
          ...req.body,
          author: req.user._id
        });

        res.status(201).json({
          status: 'success',
          data: { post }
        });
      });
    } catch (err) {
      next(err);
    }
  }

  async getPosts(req, res, next) {
    try {
      const { challengeId, sort = '-createdAt' } = req.query;
      const query = challengeId ? { challengeId } : {};

      const posts = await Post.find(query)
        .sort(sort)
        .populate('author', 'username')
        .populate('comments');

      res.status(200).json({
        status: 'success',
        data: { posts }
      });
    } catch (err) {
      next(err);
    }
  }

  async getPost(req, res, next) {
    try {
      const post = await Post.findById(req.params.id)
        .populate('author', 'username')
        .populate({
          path: 'comments',
          populate: {
            path: 'author',
            select: 'username'
          }
        });

      if (!post) {
        throw new AppError('Beitrag nicht gefunden', 404);
      }

      res.status(200).json({
        status: 'success',
        data: { post }
      });
    } catch (err) {
      next(err);
    }
  }

  async createComment(req, res, next) {
    try {
      await validateRequest(communitySchemas.createComment)(req, res, async () => {
        const comment = await Comment.create({
          ...req.body,
          author: req.user._id
        });

        await Post.findByIdAndUpdate(req.body.postId, {
          $push: { comments: comment._id }
        });

        res.status(201).json({
          status: 'success',
          data: { comment }
        });
      });
    } catch (err) {
      next(err);
    }
  }

  async deletePost(req, res, next) {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        throw new AppError('Beitrag nicht gefunden', 404);
      }

      if (post.author.toString() !== req.user._id.toString()) {
        throw new AppError('Keine Berechtigung zum Löschen dieses Beitrags', 403);
      }

      await Comment.deleteMany({ _id: { $in: post.comments } });
      await post.remove();

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePost(req, res, next) {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        throw new AppError('Beitrag nicht gefunden', 404);
      }

      if (post.author.toString() !== req.user._id.toString()) {
        throw new AppError('Keine Berechtigung zum Bearbeiten dieses Beitrags', 403);
      }

      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        status: 'success',
        data: { post: updatedPost }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CommunityController(); 