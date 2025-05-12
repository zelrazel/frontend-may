// frontend/src/components/Header.js
import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SettingsDropdown from './SettingsDropdown';
import { FaBars, FaTimes, FaBell, FaUserPlus, FaUserCheck, FaUserTimes, FaUser, FaHeart, FaComment, FaCalendarAlt } from 'react-icons/fa';
import '../styles/Header.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function Header() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Function to check token validity
  const checkTokenValidity = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsTokenValid(false);
      setUser(null);
      return;
    }

    try {
      // Make a test request to verify token
      await axios.get(`${API_URL}api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsTokenValid(true);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsTokenValid(false);
        setUser(null);
      }
    }
  };

  // Check user state from localStorage
  const checkUserState = () => {
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    
    // Only update state if there's a change
    if (JSON.stringify(user) !== JSON.stringify(currentUser)) {
      setUser(currentUser);
    }
  };

  // Fetch notification count
  const fetchNotificationCount = async () => {
    if (!isTokenValid || !user) {
      setNotificationCount(0);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}api/notifications/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  };

  // Fetch recent notifications for dropdown
  const fetchNotifications = async () => {
    if (!isTokenValid || !user) {
      setNotifications([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched notifications for dropdown:', response.data);
      
      // Only show the 5 most recent notifications in dropdown
      const recentNotifications = response.data.slice(0, 5);
      setNotifications(recentNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Handle auth change events
  useEffect(() => {
    const handleAuthChange = (e) => {
      console.log('Auth change event received:', e.detail);
      if (e.detail.status === 'signed-in') {
        setUser(e.detail.user);
        setIsTokenValid(true);
      } else if (e.detail.status === 'signed-out') {
        setUser(null);
        setIsTokenValid(false);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // Handle notification updates
  useEffect(() => {
    const handleNotificationsUpdated = () => {
      fetchNotificationCount();
      fetchNotifications();
    };

    window.addEventListener('notifications-updated', handleNotificationsUpdated);
    
    return () => {
      window.removeEventListener('notifications-updated', handleNotificationsUpdated);
    };
  }, []);

  useEffect(() => {
    // Initial check
    checkUserState();
    checkTokenValidity();

    // Set up interval to check for user state changes
    const intervalId = setInterval(() => {
      checkUserState();
      checkTokenValidity();
    }, 500);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Fetch notifications when token is valid
  useEffect(() => {
    if (isTokenValid && user) {
      fetchNotificationCount();
      fetchNotifications();
    } else {
      setNotificationCount(0);
      setNotifications([]);
    }
  }, [isTokenValid, user]);

  // Listen for storage events (for cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        checkUserState();
        checkTokenValidity();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [menuOpen]);

  // Handle clicks outside the notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setNotificationCount(Math.max(0, notificationCount - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
        return 'just now';
    } else if (diffMin < 60) {
        return `${diffMin}m ago`;
    } else if (diffHour < 24) {
        return `${diffHour}h ago`;
    } else if (diffDay < 7) {
        return `${diffDay}d ago`;
    } else {
        return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return <FaUserPlus className="notification-dropdown-icon friend-request" />;
      case 'friend_accept':
        return <FaUserCheck className="notification-dropdown-icon friend-accept" />;
      case 'friend_reject':
        return <FaUserTimes className="notification-dropdown-icon friend-reject" />;
      case 'friend_remove':
        return <FaUserTimes className="notification-dropdown-icon friend-remove" />;
      case 'reaction':
        return <FaHeart className="notification-dropdown-icon reaction" />;
      case 'activity_comment':
        return <FaComment className="notification-dropdown-icon comment" />;
      case 'scheduled_workout':
        return <FaCalendarAlt className="notification-dropdown-icon workout" />;
      default:
        return <FaBell className="notification-dropdown-icon" />;
    }
  };

  // Function to get notification avatar
  const getNotificationAvatar = (notification) => {
    // Skip avatar for scheduled workouts
    if (notification.type === 'scheduled_workout') {
      return null;
    }
    
    if (notification.content && notification.content.senderProfilePic && notification.content.senderProfilePic !== '') {
      return (
        <div className="notification-dropdown-avatar">
          <img 
            src={notification.content.senderProfilePic} 
            alt={notification.content.senderName || 'User'} 
            className="avatar-image"
          />
        </div>
      );
    } else {
      // Return default icon based on notification type
      return (
        <div className="notification-dropdown-avatar default-avatar">
          <FaUser className="avatar-placeholder" />
        </div>
      );
    }
  };

  // Function to handle notification click and redirection
  const handleNotificationClick = async (notification) => {
    try {
      // First mark as read
      await markAsRead(notification._id);
      
      // Then redirect based on notification type
      if (notification.type === 'friend_request' || 
          notification.type === 'friend_accept' || 
          notification.type === 'friend_reject' || 
          notification.type === 'friend_remove') {
        
        // Close notification panel
        setShowNotifications(false);
        
        // Navigate to friends page
        navigate('/friends');
      } else if (notification.type === 'reaction' || notification.type === 'activity_comment') {
        // Close notification panel
        setShowNotifications(false);
        
        // Navigate to profile activity tab with the specific activity
        // We'll pass the activityId as a URL parameter
        const profileEmail = notification.content.activityOwnerEmail || notification.recipient;
        navigate(`/profile/${profileEmail}?tab=activity&activityId=${notification.content.activityId}${notification.content.commentId ? `&commentId=${notification.content.commentId}` : ''}`);
      } else if (notification.type === 'scheduled_workout') {
        // Close notification panel
        setShowNotifications(false);
        
        // Navigate to workout schedule page with workoutId parameter
        navigate(`/schedule${notification.content.workoutId ? `?workoutId=${notification.content.workoutId}` : ''}`);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <div className="header-wrapper">
      <header className="header">
        <div className="header-content">
          {/* Logo - Centered for mobile */}
          <Link to="/" className="logo-container">
            <h1 className="header-title">TrackTechFit</h1>
          </Link>
          
          {/* Mobile Menu Toggle - positioned on the right */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          {/* Desktop Navigation */}
          <div className="header-right desktop-nav">
            <nav className="nav-links">
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link 
                to="/workouts" 
                className={`nav-link ${location.pathname === '/workouts' ? 'active' : ''}`}
              >
                Workouts
              </Link>
              <Link 
                to="/leaderboard" 
                className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
              >
                Leaderboard
              </Link>
             
           
            </nav>
            {isTokenValid && user && (
              <div 
                ref={notificationRef} 
                className="notification-wrapper"
                onMouseEnter={() => {
                  setShowNotifications(true);
                  // Force fetch notifications when dropdown is opened
                  fetchNotifications();
                }}
                onMouseLeave={() => setShowNotifications(false)}
              >
                <div 
                  className="notification-icon"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) {
                      fetchNotifications();
                    }
                  }}
                >
                  <FaBell />
                  {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount > 9 ? '9+' : notificationCount}</span>
                  )}
                </div>
                
                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                      <h3>Notifications</h3>
                      <Link to="/notifications" className="view-all">View All</Link>
                    </div>
                    <div className="notification-dropdown-content">
                      {notifications.length === 0 ? (
                        <div className="no-notifications">
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification._id} 
                            className={`notification-dropdown-item ${notification.read ? 'read' : 'unread'} ${notification.type === 'scheduled_workout' ? 'workout-notification' : ''} ${notification.content?.isStartingSoon ? 'starting-soon' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {notification.type !== 'scheduled_workout' && getNotificationAvatar(notification)}
                            <div className="notification-dropdown-item-content">
                              <p className="notification-dropdown-message">
                                {notification.content && notification.content.message ? 
                                  notification.content.message : 
                                  `${notification.type?.replace('_', ' ')} notification`}
                              </p>
                              <span className="notification-dropdown-time">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="settings-wrapper">
              <SettingsDropdown />
            </div>
          </div>
          
          {/* Mobile Navigation Links under title */}
          <div className="mobile-main-nav">
            <Link 
              to="/" 
              className={`mobile-main-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/workouts" 
              className={`mobile-main-link ${location.pathname === '/workouts' ? 'active' : ''}`}
            >
              Workouts
            </Link>
            <Link 
              to="/leaderboard" 
              className={`mobile-main-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
            >
              Leaderboard
            </Link>
         
          </div>
          
          {/* Mobile Slide Panel - now slides from right */}
          <div className={`mobile-menu-panel ${menuOpen ? 'open' : ''}`}>
            <div className="mobile-menu-header">
              <button 
                className="close-menu-btn"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mobile-settings">
              <SettingsDropdown mobile={true} isTokenValid={isTokenValid} currentUser={user} />
            </div>
          </div>
          
          {/* Overlay for when mobile menu is open */}
          {menuOpen && <div className="mobile-menu-overlay" onClick={toggleMenu}></div>}
        </div>
      </header>
    </div>
  );
}

export default Header;