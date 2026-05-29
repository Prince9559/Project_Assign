// controllers/blog.controller.js

const { Blog } = require("../models");


exports.createBlog = async (req, res) => {
  try {
    const { image, heading, description } = req.body;

    const blog = await Blog.create({
      image,
      heading,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Create Blog Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error("Get Blogs Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({ where: { id } });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get Blog Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, heading, description } = req.body;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    await blog.update({
      image,
      heading,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    await blog.destroy();

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
