// components/NotificationBell.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';

import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem'
import { FaSearch, FaBell, FaUser, FaBars, FaTimes } from "react-icons/fa";
import useSocket from "../../hooks/useSocket";


export default function NotificationBell() {
  const { user } = useSelector((state) => state.auth);
  useSocket();
  const navigate = useNavigate();
  const bellRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications(user?.id);

  const [isOpen, setIsOpen] = useState(false);

 

  //  Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen]);

  //  Show up to 5 unread + 2 most recent read (max 7)
  const preview = useMemo(() => {
    const unread = notifications.filter(n => !n.is_read).slice(0, 5);
    const read = notifications.filter(n => n.is_read).slice(0, 2);
    return [...unread, ...read];
  }, [notifications]);

  const handleMarkAll = useCallback(async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleNotificationClick = useCallback((notif) => {
    setIsOpen(false);
    // Optional: mark as read on click (recruiters expect this)
    if (!notif.is_read) {
      //  can call markAsRead here — but better to do in NotificationItem itself
      // We’ll rely on the button for explicit action, or let full page handle it
    }
    // Navigate intelligently (example — adapt to your routes)
    if (notif.link) {
      navigate(notif.link);
    } else if (notif.type === 'application_received') {
      navigate(`/recruiter-view-applications/${notif.metadata?.job_id}`);
    } else if (notif.type === 'job_match') {
      navigate('/matches');
    } else {
      navigate('/notifications');
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
          if (!isOpen) refetch(); // Fresh data on open
        }}
        className="relative p-2 rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
          {" "}
        </svg> */}
        <FaBell className="text-[#00194A] text-sm md:text-base" />
        {!isLoading && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* {isOpen && (
        <div
          className="absolute z-50 mt-2 overflow-hidden bg-white rounded-lg shadow-lg left-2 right-2 md:left-auto md:right-0 md:w-80 max-h-96 ring-1 ring-black/5"
          // className="absolute right-0 z-50 mt-2 overflow-hidden bg-white rounded-lg shadow-lg w-80 max-h-96 ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-64">
            {isLoading ? (
              <div className="p-4 text-sm text-center text-gray-500">
                Loading...
              </div>
            ) : preview.length === 0 ? (
              <div className="p-4 text-sm text-center text-gray-500">
                All caught up! 🎉
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {preview.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onMarkRead={markAsRead}
                    compact={true}
                    onClick={() => handleNotificationClick(notif)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-3 text-center border-t bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
              }}
              className="text-sm font-medium text-blue-600"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )} */}










      {isOpen && (
        <>
          {/* Mobile: Full-screen overlay */}
          <div className={`fixed inset-0 z-50 flex flex-col bg-white ${isOpen?"":"hidden"} md:hidden`}>

            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>

            {/* Mobile Mark All Button */}
            {unreadCount > 0 && (
              <div className="px-4 py-2 border-b bg-gray-50">
                <button
                  onClick={handleMarkAll}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              </div>
            )}

            {/* Mobile Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-sm text-center text-gray-500">
                  Loading...
                </div>
              ) : preview.length === 0 ? (
                <div className="p-8 text-sm text-center text-gray-500">
                  All caught up! 🎉
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {preview.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onMarkRead={markAsRead}
                      compact={true}
                      onClick={() => handleNotificationClick(notif)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mobile View All Button */}
            <div className="p-4 bg-white border-t">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/notifications");
                }}
                className="w-full py-3 font-medium text-center text-blue-600 rounded-lg bg-blue-50 hover:bg-blue-100"
              >
                View all notifications
              </button>
            </div>
          </div>

          {/* Desktop: Dropdown (existing code) */}
          <div
            className="absolute right-0 z-50 hidden mt-2 overflow-hidden bg-white rounded-lg shadow-lg md:block w-80 max-h-96 ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-64">
              {isLoading ? (
                <div className="p-4 text-sm text-center text-gray-500">
                  Loading...
                </div>
              ) : preview.length === 0 ? (
                <div className="p-4 text-sm text-center text-gray-500">
                  All caught up! 🎉
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {preview.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onMarkRead={markAsRead}
                      compact={true}
                      onClick={() => handleNotificationClick(notif)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 text-center border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/notifications");
                }}
                className="text-sm font-medium text-blue-600"
              >
                View all notifications →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}