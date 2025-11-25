import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, Activity, Moon, Heart, Lightbulb, MoreHorizontal, CheckCircle } from 'lucide-react';

// Sample notification data structure
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    category: 'experiments',
    title: 'Complete Today\'s Experiment',
    message: 'Don\'t forget to log your cold shower experiment results',
    date: '2 hours ago',
    read: false,
    action: '/experiments/cold-shower',
    icon: 'activity'
  },
  {
    id: 2,
    category: 'habits',
    title: 'Meditation Reminder',
    message: 'Time for your daily 10-minute meditation session',
    date: '3 hours ago',
    read: false,
    action: '/habits/meditation',
    icon: 'clock'
  },
  {
    id: 3,
    category: 'habits',
    title: 'Evening Workout',
    message: 'Your scheduled workout starts in 30 minutes',
    date: '4 hours ago',
    read: true,
    action: '/habits/workout',
    icon: 'activity'
  },
  {
    id: 4,
    category: 'mood_sleep',
    title: 'Log Your Sleep Quality',
    message: 'How did you sleep last night? Track your sleep patterns',
    date: '1 day ago',
    read: false,
    action: '/tracking/sleep',
    icon: 'moon'
  },
  {
    id: 5,
    category: 'mood_sleep',
    title: 'Evening Mood Check',
    message: 'Take a moment to reflect on your day and log your mood',
    date: '1 day ago',
    read: false,
    action: '/tracking/mood',
    icon: 'heart'
  },
  {
    id: 6,
    category: 'recommendations',
    title: 'New Habit Suggestion',
    message: 'Based on your goals, try adding morning journaling',
    date: '2 days ago',
    read: true,
    action: '/recommendations',
    icon: 'lightbulb'
  },
  {
    id: 7,
    category: 'others',
    title: 'Weekly Progress Report',
    message: 'Your weekly summary is ready to view',
    date: '3 days ago',
    read: true,
    action: '/reports/weekly',
    icon: 'more'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'experiments', label: 'Experiments', icon: Activity },
  { id: 'habits', label: 'Habits', icon: Clock },
  { id: 'mood_sleep', label: 'Mood & Sleep', icon: Moon },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  { id: 'others', label: 'Others', icon: MoreHorizontal }
];

const NotificationIcon = ({ type }) => {
  const icons = {
    activity: Activity,
    clock: Clock,
    moon: Moon,
    heart: Heart,
    lightbulb: Lightbulb,
    more: MoreHorizontal
  };
  const Icon = icons[type] || Bell;
  return <Icon className="w-5 h-5" />;
};

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showPopup, setShowPopup] = useState(false);
  const [popupNotification, setPopupNotification] = useState(null);

  // Simulate receiving a new notification
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotif = {
        id: Date.now(),
        category: 'habits',
        title: 'Water Intake Reminder',
        message: 'Remember to log your water intake for today',
        date: 'Just now',
        read: false,
        action: '/habits/water',
        icon: 'heart'
      };
      setNotifications(prev => [newNotif, ...prev]);
      setPopupNotification(newNotif);
      setShowPopup(true);
      
      // Auto-hide popup after 5 seconds
      setTimeout(() => setShowPopup(false), 5000);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = activeCategory === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === activeCategory);

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // Navigate to action (in real app, use router)
    console.log('Navigate to:', notification.action);
    alert(`Navigating to: ${notification.action}\n\nIn your real app, this would navigate to the specific action screen.`);
  };

  const handlePopupClick = () => {
    setShowPopup(false);
    setIsOpen(true);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const groupedNotifications = () => {
    const grouped = {};
    filteredNotifications.forEach(notif => {
      if (!grouped[notif.category]) {
        grouped[notif.category] = [];
      }
      grouped[notif.category].push(notif);
    });
    return grouped;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      {/* Mock App Header */}
      <div className="max-w-md mx-auto mb-4 bg-white rounded-2xl shadow-lg p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">My Wellness App</h1>
        <div className="flex items-center gap-3">
          <button className="text-gray-600 hover:text-gray-800">
            <Activity className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mock App Content */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 mb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
        <p className="text-gray-600">Your app content goes here...</p>
        <div className="mt-4 space-y-3">
          <div className="bg-purple-100 rounded-xl p-4">
            <p className="font-semibold text-purple-800">Today's Goals</p>
          </div>
          <div className="bg-blue-100 rounded-xl p-4">
            <p className="font-semibold text-blue-800">Active Habits</p>
          </div>
          <div className="bg-pink-100 rounded-xl p-4">
            <p className="font-semibold text-pink-800">Recent Logs</p>
          </div>
        </div>
      </div>

      {/* Floating Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-50"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popup Notification */}
      {showPopup && popupNotification && (
        <div 
          onClick={handlePopupClick}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 max-w-sm w-11/12 z-50 cursor-pointer animate-slide-down border-l-4 border-purple-600"
        >
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
              <NotificationIcon type={popupNotification.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{popupNotification.title}</p>
              <p className="text-gray-600 text-xs mt-1 line-clamp-2">{popupNotification.message}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowPopup(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-hidden animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      activeCategory === cat.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-4">
              {activeCategory === 'all' ? (
                // Grouped view
                Object.entries(groupedNotifications()).map(([category, notifs]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      {CATEGORIES.find(c => c.id === category)?.label || category}
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {notifs.length}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {notifs.map(notif => (
                        <NotificationCard 
                          key={notif.id} 
                          notification={notif}
                          onClick={() => handleNotificationClick(notif)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Single category view
                <div className="space-y-2">
                  {filteredNotifications.map(notif => (
                    <NotificationCard 
                      key={notif.id} 
                      notification={notif}
                      onClick={() => handleNotificationClick(notif)}
                    />
                  ))}
                </div>
              )}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function NotificationCard({ notification, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all hover:shadow-md ${
        notification.read 
          ? 'bg-gray-50 hover:bg-gray-100' 
          : 'bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-l-4 border-purple-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-full p-2 flex-shrink-0 ${
          notification.read ? 'bg-gray-200' : 'bg-purple-200'
        }`}>
          <NotificationIcon type={notification.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`font-semibold text-sm ${
              notification.read ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {notification.title}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{notification.date}</span>
            {!notification.read && (
              <span className="text-xs text-purple-600 font-medium">Tap to view</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}