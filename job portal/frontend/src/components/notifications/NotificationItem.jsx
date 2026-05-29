// components/notifications/NotificationItem.jsx
import { formatDistanceToNow } from 'date-fns';

export default function NotificationItem({
  notification,
  onMarkRead,
  compact = false,   
  onClick,          
}) {
  const isUnread = !notification.is_read;

  const getIcon = () => {
    switch (notification.type) {
      case 'application_received':
      case 'job_posted':
        return '🏢';
      case 'application_submitted':
      case 'job_match':
        return '🎓';
      case 'campus_drive_registered':
        return '🏫';
      case 'plan_upgraded':
        return '🎉';
      default:
        return '🔔';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // Note: we don't auto-mark-as-read on click unless explicitly handled by parent
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-start space-x-3 p-4 border-b transition
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
        ${isUnread 
          ? 'bg-blue-50 border-l-4 border-blue-500' 
          : 'border-gray-100'}
        ${compact 
          ? '!p-3 space-x-2 border-b border-gray-100 last:border-b-0' 
          : ''}
      `}
    >
      <span className={`text-xl mt-0.5 ${compact ? 'text-lg' : ''}`}>
        {getIcon()}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${compact ? 'text-sm' : ''} ${
          isUnread ? 'text-gray-900' : 'text-gray-700'
        }`}>
          {notification.title}
        </p>
        <p className={`mt-1 line-clamp-2 ${compact ? 'text-xs' : 'text-sm'} ${
          isUnread ? 'text-gray-700' : 'text-gray-600'
        }`}>
          {notification.body}
        </p>
        {!compact && (
          <p className="mt-2 text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        )}
      </div>

      {compact && !isUnread && (
        <time className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap mt-0.5">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </time>
      )}

      {isUnread && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent parent onClick
            onMarkRead?.(notification.id);
          }}
          className={`text-xs font-medium text-blue-600 hover:text-blue-800 ${
            compact ? 'mt-0.5' : ''
          }`}
        >
          Mark as read
        </button>
      )}
    </div>
  );
}