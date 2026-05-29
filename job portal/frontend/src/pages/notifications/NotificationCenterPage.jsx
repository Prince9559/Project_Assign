import { useEffect } from 'react';
import { useSelector} from "react-redux";
import { useNotifications } from '../../hooks/useNotifications';
import NotificationHeader from './NotificationHeader';
import NotificationItem from '../../components/notifications/NotificationItem';
import MainLayout from "../../components/layout/MainLayout"
import {Loader} from '../../components/ui';
import FeedRightSidebar from "../student/feed/FeedRightSidebar"

export default function NotificationCenterPage() {
   const { user } = useSelector((state) => state.auth);
   console.log("user", user.id )
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id);

  console.log("center page", notifications);

  // Update document title
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Notifications | JobPortal`;
    } else {
      document.title = 'Notifications | JobPortal';
    }
  }, [unreadCount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }


return (
  <MainLayout>
    <div className="min-h-screen bg-gray-50">
  
      {/* Main content + Sidebar container */}
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Flex container: main + sidebar */}
        <div className="flex flex-col gap-6 xl:flex-row">
          {/* Main Notifications Area */}
          <main className="flex-1 min-w-0">
        
            <NotificationHeader className="mb-6"
              unreadCount={unreadCount}
              onMarkAllRead={markAllAsRead}
            />

            
            {notifications.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-lg shadow-sm">
                <div className="mb-4 text-5xl">🔔</div>
                <h3 className="text-lg font-medium text-gray-900">
                  No notifications
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You’ll see updates here when they happen.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden bg-white rounded-lg shadow-sm">
                {notifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onMarkRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar — hidden on mobile/tablet, visible on xl+ */}
          {/* <aside className="hidden xl:block xl:w-[350px] xl:flex-shrink-0">
            <div className="sticky top-6">
              <FeedRightSidebar />
            </div>
          </aside> */}
        </div>
      </div>
    </div>
  </MainLayout>
);
}