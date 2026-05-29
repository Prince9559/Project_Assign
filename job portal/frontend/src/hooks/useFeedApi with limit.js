import { useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import feedApi from "../api/feedApi";

const useFeedApi = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { token } = useSelector((state) => state.auth);

  // Track if a fetch is in progress to prevent race conditions
  const isFetchingRef = useRef(false);
  const seenPostIds = useRef(new Set()); // Track seen IDs to prevent duplicates

  /**
   * Fetch feed posts with cursor-based pagination
   * @param {boolean} replace - If true, replaces all posts (refresh), otherwise appends
   */
  const fetchFeed = useCallback(
    async (replace = false) => {
      if (!token) return;

      // Prevent duplicate concurrent fetches
      if (isFetchingRef.current) return;

      // Don't fetch if no more data (unless refreshing)
      if (!replace && !hasMore) return;

      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const data = await feedApi.getFeed(
          replace ? null : nextCursor,
          20, // Fetch 20 posts per page
          token
        );

        const newPosts = data.posts || [];
        const pagination = data.pagination || {};

        // Deduplicate posts by ID
        const uniqueNewPosts = newPosts.filter((post) => {
          if (seenPostIds.current.has(post.id)) {
            return false;
          }
          seenPostIds.current.add(post.id);
          return true;
        });

        if (replace) {
          // Refresh: clear seen IDs and replace all posts
          seenPostIds.current.clear();
          uniqueNewPosts.forEach((post) => seenPostIds.current.add(post.id));

          setPosts(uniqueNewPosts);
          setNextCursor(pagination.nextCursor || null);
          setHasMore(!!pagination.hasNextPage);
          setIsInitialLoad(false);
        } else {
          // Append: add new unique posts
          setPosts((prev) => [...prev, ...uniqueNewPosts]);
          setNextCursor(pagination.nextCursor || null);
          setHasMore(!!pagination.hasNextPage);
        }
      } catch (err) {
        setError("Failed to load feed");
        console.error("Feed fetch error:", err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [token, nextCursor, hasMore]
  );

  /**
   * Refresh feed from beginning
   */
  const refreshFeed = useCallback(() => {
    setHasMore(true);
    setNextCursor(null);
    setIsInitialLoad(true);
    fetchFeed(true);
  }, [fetchFeed]);

  /**
   * Load more posts (for infinite scroll)
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore && !isFetchingRef.current) {
      fetchFeed(false);
    }
  }, [fetchFeed, loading, hasMore]);

  /**
   * Post new feed content
   */
  const postFeed = useCallback(
    async (payload) => {
      if (!token) return;

      try {
        const res = await feedApi.postFeed(payload, token);
        // Refresh feed to show new post at top
        refreshFeed();
        return res;
      } catch (err) {
        setError("Failed to post feed");
        throw err;
      }
    },
    [token, refreshFeed]
  );

  /**
   * Toggle like on a post
   */
  const handleLike = useCallback(
    async (postId, userId) => {
      if (!token || !userId) return;

      // Optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                like_count: post.isLiked
                  ? Math.max(0, post.like_count - 1)
                  : post.like_count + 1,
              }
            : post
        )
      );

      try {
        const response = await feedApi.postLike(
          postId,
          { user_id: userId },
          token
        );

        // Sync with server response
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: response.isLiked,
                  like_count: response.like_count,
                }
              : post
          )
        );
      } catch (err) {
        console.error("Like failed:", err);
        setError("Failed to update like");

        // Rollback on error
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  like_count: !post.isLiked
                    ? Math.max(0, post.like_count - 1)
                    : post.like_count + 1,
                }
              : post
          )
        );
      }
    },
    [token]
  );

  /**
   * Delete a post
   */
  const deletePost = useCallback(
    async (postId) => {
      if (!token || !postId) return;

      const prevPosts = [...posts];

      // Optimistic update
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      seenPostIds.current.delete(postId);

      try {
        await feedApi.deletePost(postId, token);
      } catch (err) {
        // Rollback on error
        setPosts(prevPosts);
        seenPostIds.current.add(postId);
        setError("Failed to delete post");
        throw err;
      }
    },
    [token, posts]
  );

  /**
   * Edit a post
   */
  const editPost = useCallback(
    async (postId, updates) => {
      if (!token || !postId) throw new Error("Not authenticated");

      const prevPosts = [...posts];

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, ...updates, updated_at: new Date().toISOString() }
            : p
        )
      );

      try {
        const res = await feedApi.editPost(postId, updates, token);

        // Sync with server response
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, ...res.post } : p))
        );

        return res;
      } catch (err) {
        // Rollback on error
        setPosts(prevPosts);
        setError("Failed to update post");
        throw err;
      }
    },
    [token, posts]
  );

  /**
   * Toggle follow/unfollow user
   */
  const handleFollowToggle = useCallback(
    async (authorId, currentIsFollowing) => {
      if (!token || !authorId) return;

      // Optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post.User.id === authorId
            ? {
                ...post,
                User: {
                  ...post.User,
                  isFollowing: !currentIsFollowing,
                  followersCount: currentIsFollowing
                    ? Math.max(0, (post.User.followersCount || 0) - 1)
                    : (post.User.followersCount || 0) + 1,
                },
              }
            : post
        )
      );

      try {
        await feedApi.followUnfollowUser(authorId, token);
      } catch (err) {
        setError("Failed to update follow status");

        // Rollback on error
        setPosts((prev) =>
          prev.map((post) =>
            post.User.id === authorId
              ? {
                  ...post,
                  User: {
                    ...post.User,
                    isFollowing: currentIsFollowing,
                    followersCount: currentIsFollowing
                      ? (post.User.followersCount || 0) + 1
                      : Math.max(0, (post.User.followersCount || 0) - 1),
                  },
                }
              : post
          )
        );
        throw err;
      }
    },
    [token]
  );

  return {
    posts,
    loading,
    error,
    hasMore,
    isInitialLoad,
    nextCursor,

    // Actions
    fetchFeed,
    refreshFeed,
    loadMore,
    postFeed,
    handleLike,
    deletePost,
    editPost,
    handleFollowToggle,
    setPosts,
    setLoading,
    setError,
  };
};

export default useFeedApi;
