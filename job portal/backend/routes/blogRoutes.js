const express = require("express");
const router = express.Router();
const { createBlog,getAllBlogs,getBlogById,updateBlog,deleteBlog } = require( "../controllers/blogController.js");



// POST /api/ai/generate-opportunity
router.post("/blog-post", createBlog);
router.get("/blog-get", getAllBlogs);
router.get("/blog-get/:id", getBlogById);
router.put("/blog-update/:id", updateBlog);
router.delete("/blog-delete/:id", deleteBlog);

module.exports = router;