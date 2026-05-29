import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const feedApi = {
  postFeed: async (data, token) => {
    try {
      const response = await axios.post(`${BASE_URL}/feed/feed`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log("error while posting feed", error);
      throw error;
    }
  },

  // getFeed: async (page, limit, token) => {
  //   try {
  //     const response = await axios.get(
  //       `${BASE_URL}/feed/posts?page=${page}&limit=${limit}`,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     // Ensure the response has the expected structure
  //     const {
  //       totalPosts = 0,
  //       currentPage = 1,
  //       totalPages = 1,
  //       posts = [],
  //     } = response.data || {};

  //     return { totalPosts, currentPage, totalPages, posts };
  //   } catch (error) {
  //     console.log("error while getting feed", error);
  //     throw error;
  //   }
  // },


  // feedApi.js
getFeed : async (cursor = null, limit = 10, token) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;

  const res = await axios.get(`${BASE_URL}/feed/posts`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data; // Should include { posts: [...], pagination: { nextCursor } }
},

  getUserPosts: async (userId, page, limit, token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/feed/posts/${userId}?page=${page}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Ensure the response has the expected structure
      const {
        totalPosts = 0,
        currentPage = 1,
        totalPages = 1,
        posts = [],
      } = response.data || {};

      return { totalPosts, currentPage, totalPages, posts };
    } catch (error) {
      console.log("error while getting user posts feed", error);
      throw error;
    }
  },

  postComment: async (post_id, data, token) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/feed/posts/${post_id}/comment`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log("error while posting comment", error);
      throw error;
    }
  },
  postLike: async (post_id, data, token) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/feed/posts/${post_id}/like`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response.data from post like", response.data);
      return response.data;
    } catch (error) {
      console.log("error while posting like", error);
      throw error;
    }
  },
  postFollowUnFollow: async (data, token) => {
    try {
      const response = await axios.post(`${BASE_URL}/feed/follow`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log("error while following/unfollowing", error);
      throw error;
    }
  },
  getFollowers: async (token, user_id) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/feed/${user_id}/followers`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Ensure the response has the expected structure
      const { count = 0, followers = [] } = response.data || {};
      return { count, followers };
    } catch (error) {
      console.log("error while getting followers", error);
      throw error;
    }
  },
  getFollowing: async (token, user_id) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/feed/${user_id}/following`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Ensure the response has the expected structure
      const { count = 0, followers = [] } = response.data || {};
      return { count, followers };
    } catch (error) {
      console.log("error while getting following", error);
      throw error;
    }
  },
  
  // Follow a specific user
  followUnfollowUser: async (targetUserId, token) => {
    try {
      // if (!currentUserId || !targetUserId) {
      //   throw new Error("Both current user ID and target user ID are required");
      // }

      const response = await axios.post(
        `${BASE_URL}/feed/follow`,
        {
          // follower_id: currentUserId,
          followed_id: targetUserId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.log("error while following user", error);
      throw error;
    }
  },

  softDeleteAccount: async (data, token) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/user-details/softDeleteAccount`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log("error while soft deleting account", error);
      throw error;
    }
  },

  getPostBySlug: async (slug, token) => {
    const response = await axios.get(`${BASE_URL}/feed/post/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; //single post object
  },

  editPost: async (postId,{caption,image}, token) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/feed/posts/${postId}`,
        { caption, image },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating post:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update post";
      throw new Error(errorMessage);
    }
  },

  deletePost: async (postId, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/feed/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting post:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete post";
      throw new Error(errorMessage);
    }
  },

  deleteComment: async (commentId, token) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/feed/posts/comment/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete comment";
      throw new Error(errorMessage);
    }
  },

  
};

export default feedApi;
