const CommunityPost = require('../models/Community');

exports.createPost = async (req, res) => {
  try {
    const post = new CommunityPost({ ...req.body, user: req.user._id });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find().populate('user', 'name');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};
