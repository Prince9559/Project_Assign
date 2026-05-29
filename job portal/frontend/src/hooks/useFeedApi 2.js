import { useState, useCallback , useRef} from "react";
import { useSelector } from "react-redux";
import feedApi from "../api/feedApi";
import { set } from "date-fns";

const useFeedApi = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  // const [isFollowing, setIsFollowing] = useState(false);
  // const [followLoading, setFollowLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);

 
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Ref to avoid closure issues in scroll handler
  const postsRef = useRef(posts);
  const hasMoreRef = useRef(hasMore);
  const nextCursorRef = useRef(nextCursor);

  postsRef.current = posts;
  hasMoreRef.current = hasMore;
  nextCursorRef.current = nextCursor;


  // Fetch more (used for scroll & initial)
  const fetchFeed = useCallback(
    async (replace = false) => {
      if (!token) return;
      if (!replace && (!hasMoreRef.current || loading)) return;

      setLoading(true);
      setError(null);

      try {
        const data = await feedApi.getFeed(
          replace ? null : nextCursorRef.current,
          10,
          token
        );

        const newPosts = data.posts || [];
        const pagination = data.pagination || {};

        if (replace) {
          setPosts(newPosts);
          setNextCursor(pagination.nextCursor || null);
          setHasMore(!!pagination.hasNextPage);
       
          setIsInitialLoad(false);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
          setNextCursor(pagination.nextCursor || null);
          setHasMore(!!pagination.hasNextPage);
   
        }
      } catch (err) {
        setError("Failed to load feed");
        console.error("Feed fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [token, loading]
  );

  //  Refresh (pull-to-refresh style)
  const refreshFeed = useCallback(() => {
    setPosts([]);
    setHasMore(true);
    setNextCursor(null);
    setIsInitialLoad(true);
    fetchFeed(true);
  }, [fetchFeed]);

  //  Infinite scroll trigger (call this when near bottom)
  const loadMore = useCallback(() => {
    if (hasMoreRef.current && !loading) {
      fetchFeed(false);
    }
  }, [fetchFeed, loading]);


  
  const fetchUserPosts = useCallback(
    async (userId,pageNum = 1, replace = false) => {
      if (!token) return;
      if (pageNum > totalPages && !replace) return;
      setLoading(true);
      setError(null);
      try {
        const data = await feedApi.getUserPosts(userId,pageNum, 10, token);
        if (replace || pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...data.posts]);
        }
        setTotalPages(data.totalPages || 1);
        setPage(data.currentPage || pageNum);
      } catch (err) {
        setError("Failed to load feed");
      } finally {
        setLoading(false);
      }
    },
    [token, totalPages]
  );
  const userPostsFeed = useCallback(
    async (payload) => {
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        const res = await feedApi.postFeed(payload, token);
        await fetchUserPosts(1, true); // Refresh feed after posting
        return res;
      } catch (err) {
        setError("Failed to post feed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUserPosts, token]
  );
  const postFeed = useCallback(
    async (payload) => {
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        const res = await feedApi.postFeed(payload, token);
        await fetchFeed(1, true); // Refresh feed after posting
        return res;
      } catch (err) {
        setError("Failed to post feed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchFeed, token]
  );

  const handleLike = useCallback(async (postId, userId) => {
    if (!token || !userId) return;

    try {
      const response = await feedApi.postLike(postId, { user_id: userId }, token);

      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, isLiked: response.isLiked, like_count: response.like_count }
            : post
        )
      );
    } catch (err) {
      console.error("Like failed:", err);
      setError("Failed to update like. Please try again.");
    }
  }, [token]);

  const deletePost = useCallback(
    async (postId) => {
      if (!token || !postId) return;

      setLoading(true);
      setError(null);

      // Optimistically remove the post from the UI
      const prevPosts = [...posts];
      setPosts((prev) => prev.filter((post) => post.id !== postId));

      try {
        await feedApi.deletePost(postId, token);
        // Post successfully deleted — already removed from UI
      } catch (err) {
        // Rollback: restore the post if deletion fails
        setPosts(prevPosts);
        setError("Failed to delete post");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, posts]
  );


  // Fetch followers and following counts
  const fetchFollowersAndFollowing = useCallback(async () => {
    if (!token) return;

    try {
      const { count: followersCount } = await feedApi.getFollowers(token);
      setFollowersCount(followersCount);

      const { count: followingCount } = await feedApi.getFollowing(token);
      setFollowingCount(followingCount);
    } catch (err) {
      console.error("Failed to load followers/following:", err);
      setError("Failed to load followers/following");
    }
  }, [token]);

  // Check follow status for a specific user
  const checkFollowStatus = useCallback(
    async (profileId) => {
      if (!token || !profileId) return;

      try {
        const res = await feedApi.checkFollowStatus(profileId, token);
        setIsFollowing(res.isFollowing);
        return res.isFollowing;
      } catch (err) {
        console.error("Failed to check follow status:", err);
        setIsFollowing(false);
        return false;
      }
    },
    [token]
  );

  const handleFollowToggle = useCallback(
    async (authorId, currentIsFollowing) => {
      if (!token || !authorId) return;

      // Optimistically update
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
        // Rollback
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

  const editPost = useCallback(
    async (postId, updates) => {
      if (!token || !postId) throw new Error("Not authenticated");

      const prevPosts = [...posts];
      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) throw new Error("Post not found");

      const original = { ...posts[postIndex] };
      const optimistic = {
        ...original,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      setPosts((prev) => prev.map((p) => (p.id === postId ? optimistic : p)));

      try {
        const res = await feedApi.editPost(postId, updates, token);
        // Optional: sync with server response
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, ...res.post } : p))
        );
        return res;
      } catch (err) {
        setPosts(prevPosts); // rollback
        setError("Failed to update post");
        throw err;
      }
    },
    [token, posts]
  );

  return {
    posts,
    loading,
    error,
    hasMore,
    isInitialLoad,

    // Actions
    fetchFeed,
    refreshFeed,
    loadMore,

    page,
    totalPages,
    followersCount,
    followingCount,
    // isFollowing,
    // followLoading,
    postFeed,
    fetchUserPosts,
    userPostsFeed,
    setPosts,
    handleLike,
    deletePost,
    editPost,
    fetchFollowersAndFollowing,
    checkFollowStatus,
    handleFollowToggle,
    setLoading,
    setError,
  };
};

export default useFeedApi;
