export default function NotificationHeader({ unreadCount, onMarkAllRead }) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center justify-between max-w-4xl px-4 py-4 mx-auto sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` 
              : 'All caught up!'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        )}
      </div>
    </div>
  );
}