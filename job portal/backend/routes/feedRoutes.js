const express = require('express');
const router = express.Router();
const {
  createFeedPost,
  editFeedPost,
  getFeedPosts,
  likeUnlikePost,
  commentOnPost,
  getUserFollows,
  toggleFollowUser,
  getPostBySlug,
  getSocialPreview,
  getUserPosts,
  deleteFeedPost,
  deleteComment
} = require('../controllers/feedController');
const authMiddleware = require('../middleware/authMiddleware');
const {getFeed} = require("../controllers/feedViewController")
const {requirePermission} = require("../middleware/rbac");


// Feed & Post routes
router.post('/feed', authMiddleware,requirePermission("feed.post"), createFeedPost);
// router.get('/posts2', authMiddleware, getFeedPosts);

router.get("/posts", authMiddleware, getFeed);

router.post('/posts/:id/like', authMiddleware, likeUnlikePost);
router.post('/posts/:id/comment', authMiddleware, commentOnPost);
router.delete("/posts/comment/:id", authMiddleware, deleteComment);
router.patch("/posts/:id", authMiddleware, editFeedPost);
router.delete('/posts/:id', authMiddleware, deleteFeedPost); 

// User-specific post route 
router.get('/posts/:id', authMiddleware, getUserPosts); 

// Other routes
router.get('/post/:slug', authMiddleware, getPostBySlug);
router.post('/follow', authMiddleware, toggleFollowUser);
router.get("/social-preview", getSocialPreview);
router.get("/:user_id/:type", authMiddleware, getUserFollows);


module.exports = router;
