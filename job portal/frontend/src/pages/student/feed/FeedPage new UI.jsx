
// ===== MOCK DATA (Replace with your API later) =====
const mockFeed = [
  {
    id: 1,
    type: 'post',
    author: { id: 101, name: 'Priya Sharma', role: 'STUDENT' },
    content: 'Just completed my Machine Learning internship at Microsoft! 🎉 Learned so much about real-world AI deployment. Grateful for the opportunity!',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8b?auto=format&fit=crop&w=600',
    metrics: { likes: 42, comments: 8 },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    type: 'job',
    author: { id: 201, name: 'Tech Innovators Inc.', role: 'COMPANY' },
    content: '🚀 Hiring: Frontend Developer (React)\n\n- Remote\n- ₹8-12 LPA\n- 1+ years experience\n- Build products used by 1M+ users',
    metrics: { likes: 24, comments: 3 },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: 'post',
    author: { id: 301, name: 'IIT Delhi Career Cell', role: 'UNIVERSITY' },
    content: '📢 Campus Drive Alert!\n\nGoogle visiting on 15th Dec for SDE roles.\nEligibility: B.Tech/M.Tech CSE, ECE\nApply by 10th Dec via portal.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600',
    metrics: { likes: 156, comments: 22 },
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    type: 'job',
    author: { id: 202, name: 'StartupHub', role: 'COMPANY' },
    content: '🌱 Internship: Full-Stack Developer\n\n- Hybrid (Bangalore)\n- Stipend: ₹25k/month\n- Work on AI-powered edtech platform\n- Open to pre-final year students',
    metrics: { likes: 67, comments: 12 },
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    type: 'post',
    author: { id: 102, name: 'Rahul Verma', role: 'STUDENT' },
    content: 'Just got my first job offer as a Data Analyst at Flipkart! 🙌\n\nKey to success: 1. Built 3 real projects 2. Did 2 internships 3. Practiced DSA daily. Happy to help others!',
    metrics: { likes: 89, comments: 15 },
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

// ===== AVATAR COMPONENT =====
const Avatar = ({ name, src, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '?';

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
  const colorIndex = name ? Math.abs(name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length : 0;
  const bgColor = colors[colorIndex];

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className={`flex-shrink-0 rounded-full flex items-center justify-center text-white font-medium overflow-hidden ${sizeClasses[size]} ${bgColor}`}>
      {src && !imgError ? (
        <img 
          src={src} 
          alt={name} 
          className="object-cover w-full h-full"
          onError={() => setImgError(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
};

// ===== FEED ITEM COMPONENT =====
const FeedItem = ({ item }) => {
  const isJob = item.type === 'job';
  const timeAgo = item.created_at 
    ? new Date() - new Date(item.created_at) < 60000 
      ? 'just now' 
      : `${Math.floor((new Date() - new Date(item.created_at)) / 60000)}m ago`
    : 'just now';

  const roleColors = {
    STUDENT: { text: 'Student', color: 'bg-blue-100 text-blue-800' },
    COMPANY: { text: 'Recruiter', color: 'bg-green-100 text-green-800' },
    UNIVERSITY: { text: 'College', color: 'bg-purple-100 text-purple-800' },
  };
  const { text: roleText, color: roleColor } = roleColors[item.author.role] || roleColors.STUDENT;

  return (
    <div className="p-4 mb-4 transition-shadow bg-white border shadow-sm rounded-xl hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={item.author.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate dark:text-white">{item.author.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor} dark:bg-opacity-20`}>
              {roleText}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{timeAgo}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-800 break-words whitespace-pre-line dark:text-gray-200">
          {item.content}
        </p>
        {item.image && (
          <div className="mt-3 overflow-hidden rounded-lg">
            <img 
              src={item.image} 
              alt="Post" 
              className="object-cover w-full h-48"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>👍 {item.metrics.likes}</span>
          <span>💬 {item.metrics.comments}</span>
        </div>

        {isJob ? (
          <button 
            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            onClick={() => alert(`Viewing job ${item.id}`)}
          >
            View Job
          </button>
        ) : (
          <button 
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            onClick={() => alert(`Viewing post ${item.id}`)}
          >
            View Post
          </button>
        )}
      </div>
    </div>
  );
};






import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';

const BASE_URL=import.meta.env.VITE_BASE_URL;


const FeedPage = () => {
  const token = useSelector(state => state.auth.token);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const loadMoreRef = useRef();

  // Load feed items
  const loadFeed = useCallback(async (reset = false) => {
    if (!token) return;

    if (!reset && (!hasMore || loading)) return;

    setLoading(true);
    setError(null);

    try {
      const url = `${BASE_URL}/feed/posts${reset || !cursor ? '' : `?cursor=${encodeURIComponent(cursor)}`}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (reset) {
        setFeed(data.feed || []);
      } else {
        setFeed(prev => [...prev, ...(data.feed || [])]);
      }

      setCursor(data.pagination?.nextCursor || null);
      setHasMore(data.pagination?.hasNextPage || false);
    } catch (err) {
      console.error('Feed load error:', err);
      setError(err.message || 'Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, cursor, hasMore, loading]);

  // Initial load
  useEffect(() => {
    if (token) {
      loadFeed(true);
    }
  }, [token, loadFeed]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadFeed();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loading, loadFeed]);

  // Refresh handler
  const handleRefresh = () => {
    if (error) loadFeed(true);
  };

  // Role badge config
  const getRoleBadge = (role) => {
    const config = {
      STUDENT: { text: 'Student', color: 'bg-blue-100 text-blue-800' },
      COMPANY: { text: 'Recruiter', color: 'bg-green-100 text-green-800' },
      UNIVERSITY: { text: 'College', color: 'bg-purple-100 text-purple-800' },
    };
    return config[role] || config.STUDENT;
  };

  // Time ago formatter
  const timeAgo = (dateStr) => {
    if (!dateStr) return 'just now';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="max-w-2xl p-4 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Feed</h1>
        <p className="text-gray-600 dark:text-gray-400">Posts and opportunities tailored for you</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Feed failed to load</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-800/30 dark:text-red-300"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && feed.length === 0 && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-white border shadow-sm rounded-xl dark:bg-gray-800 dark:border-gray-700 animate-pulse">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="w-1/3 h-4 mb-2 bg-gray-200 rounded dark:bg-gray-700" />
                  <div className="w-1/4 h-3 bg-gray-200 rounded dark:bg-gray-700" />
                </div>
              </div>
              <div className="w-full h-4 mb-2 bg-gray-200 rounded dark:bg-gray-700" />
              <div className="w-5/6 h-4 mb-3 bg-gray-200 rounded dark:bg-gray-700" />
              <div className="h-32 mb-3 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <div className="flex gap-3">
                <div className="w-16 h-8 px-4 bg-gray-200 rounded dark:bg-gray-700" />
                <div className="w-20 h-8 px-4 bg-gray-200 rounded dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && feed.length === 0 && !error && (
        <div className="py-12 text-center">
          <div className="mb-4 text-5xl">📭</div>
          <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">No content yet</h3>
          <p className="max-w-md mx-auto text-gray-500 dark:text-gray-400">
            Follow recruiters, colleges, or complete your profile to see relevant posts and job opportunities.
          </p>
        </div>
      )}

      {/* Feed Items */}
      {feed.length > 0 && (
        <div className="space-y-4">
          {feed.map((item) => {
            const isJob = item.type === 'job';
            const { text: roleText, color: roleColor } = getRoleBadge(item.author?.role);

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="p-4 transition-shadow bg-white border shadow-sm rounded-xl hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar
                    name={item.author?.name || 'User'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate dark:text-white">
                        {item.author?.name || 'Anonymous'}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor} dark:bg-opacity-20`}>
                        {roleText}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {timeAgo(item.created_at)}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <p className="text-gray-800 break-words whitespace-pre-line dark:text-gray-200">
                    {item.content || 'No content'}
                  </p>
                  {item.image && (
                    <div className="mt-3 overflow-hidden rounded-lg">
                      <img
                        src={item.image}
                        alt="Post"
                        className="object-cover w-full h-48"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>👍 {item.metrics?.likes || 0}</span>
                    <span>💬 {item.metrics?.comments || 0}</span>
                  </div>

                  {isJob ? (
                    <button
                      onClick={() => window.location.href = `/jobs/${item.id}`}
                      className="px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                      View Job
                    </button>
                  ) : (
                    <button
                      onClick={() => window.location.href = `/posts/${item.id}`}
                      className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                    >
                      View Post
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Load More Spinner (for infinite scroll) */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex items-center justify-center h-10">
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg dark:bg-gray-700">
                <svg className="w-4 h-4 mr-3 -ml-1 text-gray-600 animate-spin dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading more...
              </div>
            </div>
          )}

          {/* Manual Load Button (fallback) */}
          {!hasMore && feed.length > 0 && (
            <div className="py-4 text-center text-gray-500 dark:text-gray-400">
              You've reached the end! 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedPage;