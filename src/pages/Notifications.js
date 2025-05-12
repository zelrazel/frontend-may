import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaBell, 
    FaTrash, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaUserPlus, 
    FaUserCheck, 
    FaUserTimes, 
    FaUser,
    FaChevronLeft,
    FaChevronRight,
    FaFilter,
    FaHeart,
    FaComment,
    FaCalendarAlt
} from 'react-icons/fa';
import '../styles/Notifications.css';
import '../styles/NotificationsPage.css';
import Swal from 'sweetalert2';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Number of notifications per page
const ITEMS_PER_PAGE = 10;

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Apply filters whenever filterType or notifications change
    useEffect(() => {
        applyFilters();
    }, [filterType, notifications]);

    // Update total pages and current displayed notifications whenever filtered notifications change
    useEffect(() => {
        const total = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
        setTotalPages(total || 1);
        
        // Adjust current page if it's out of bounds after filtering
        if (currentPage > total) {
            setCurrentPage(total || 1);
        }
    }, [filteredNotifications, currentPage]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            setLoading(true);
            const response = await axios.get(`${API_URL}api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(response.data);
            setLoading(false);

            // Mark all as read
            await axios.put(`${API_URL}api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Dispatch event to update notification count in header
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setError('Failed to load notifications. Please try again later.');
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...notifications];
        
        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(notification => notification.type === filterType);
        }
        
        setFilteredNotifications(filtered);
    };

    const handleDelete = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}api/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from state
            setNotifications(notifications.filter(n => n._id !== notificationId));
            
            // Dispatch event to update notification count in header
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleClearAll = async () => {
        if (notifications.length === 0) return;
        // SweetAlert2 confirmation styled like profile
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: `<div style=\"font-size:1.1rem;\">Are you sure you want to clear all notifications?<br>This action cannot be undone.</div>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Clear All',
            cancelButtonText: 'Cancel',
            focusCancel: true,
            customClass: {
                popup: 'swal2-popup',
                confirmButton: 'swal2-confirm',
                cancelButton: 'swal2-cancel',
                title: 'swal2-title',
            },
            background: 'rgba(16, 16, 28, 0.95)',
            buttonsStyling: false
        });
        if (!result.isConfirmed) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications([]);
            // Dispatch event to update notification count in header
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch (error) {
            console.error('Failed to clear all notifications:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'friend_request':
                return <FaUserPlus className="notification-type-icon friend-request" />;
            case 'friend_accept':
                return <FaUserCheck className="notification-type-icon friend-accept" />;
            case 'friend_reject':
                return <FaUserTimes className="notification-type-icon friend-reject" />;
            case 'friend_remove':
                return <FaUserTimes className="notification-type-icon friend-remove" />;
            case 'reaction':
                return <FaHeart className="notification-type-icon reaction" />;
            case 'activity_comment':
                return <FaComment className="notification-type-icon comment" />;
            case 'scheduled_workout':
                return <FaCalendarAlt className="notification-type-icon workout" />;
            default:
                return <FaBell className="notification-type-icon" />;
        }
    };

    // Function to get notification avatar
    const getNotificationAvatar = (notification) => {
        // Skip avatar for scheduled workouts
        if (notification.type === 'scheduled_workout') {
            return null;
        }
        
        if (notification.content.senderProfilePic && notification.content.senderProfilePic !== '') {
            return (
                <img 
                    src={notification.content.senderProfilePic} 
                    alt={notification.content.senderName || 'User'} 
                    className="notification-avatar" 
                />
            );
        } else {
            // Return default avatar
            return (
                <div className="notification-default-avatar">
                    <FaUser />
                </div>
            );
        }
    };

    const formatDate = (dateString) => {
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
            return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
        } else if (diffHour < 24) {
            return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
        } else if (diffDay < 7) {
            return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Get current page notifications
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredNotifications.slice(startIndex, endIndex);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="pagination">
                <button 
                    className="pagination-btn" 
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <FaChevronLeft />
                </button>
                
                <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                </span>
                
                <button 
                    className="pagination-btn" 
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <FaChevronRight />
                </button>
            </div>
        );
    };

    const handleFilterChange = (type) => {
        setFilterType(type);
        setShowFilters(false); // Close filter dropdown after selection
    };

    const renderFilterOptions = () => {
        const filters = [
            { id: 'all', label: 'All Notifications' },
            { id: 'friend_request', label: 'Friend Requests' },
            { id: 'friend_accept', label: 'Accepted Requests' },
            { id: 'friend_reject', label: 'Rejected Requests' },
            { id: 'friend_remove', label: 'Friend Removals' },
            { id: 'reaction', label: 'Activity Reactions' },
            { id: 'activity_comment', label: 'Activity Comments' },
            { id: 'scheduled_workout', label: 'Scheduled Workouts' }
        ];

        return (
            <div className={`notification-filters ${showFilters ? 'show' : ''}`}>
                <button 
                    className="filter-toggle" 
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FaFilter /> Filter
                </button>
                
                {showFilters && (
                    <div className="filter-dropdown">
                        {filters.map(filter => (
                            <button 
                                key={filter.id}
                                className={`filter-option ${filterType === filter.id ? 'active' : ''}`}
                                onClick={() => handleFilterChange(filter.id)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Function to handle notification click
    const handleNotificationClick = (notification) => {
        // Check notification type
        if (notification.type === 'friend_request' || 
            notification.type === 'friend_accept' || 
            notification.type === 'friend_reject' || 
            notification.type === 'friend_remove') {
            
            // Navigate to friends page
            navigate('/friends');
        } else if (notification.type === 'reaction' || notification.type === 'activity_comment') {
            // Navigate to profile activity tab with specific activity
            const profileEmail = notification.content.activityOwnerEmail || notification.recipient;
            navigate(`/profile/${profileEmail}?tab=activity&activityId=${notification.content.activityId}${notification.content.commentId ? `&commentId=${notification.content.commentId}` : ''}`);
        } else if (notification.type === 'scheduled_workout') {
            // Navigate to workout schedule page with workoutId parameter
            navigate(`/schedule${notification.content.workoutId ? `?workoutId=${notification.content.workoutId}` : ''}`);
        }
    };

    if (loading) {
        return (
            <div className="notifications-container loading">
                <div className="loading-spinner"></div>
                <p>Loading notifications...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notifications-container error">
                <div className="error-message">
                    <FaTimesCircle className="error-icon" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-page-wrapper">
            <div className="notifications-container">
                <div className="notifications-header">
                    <h1>Notifications</h1>
                    <div className="notifications-actions">
                        {notifications.length > 0 && (
                            <button className="clear-all-btn" onClick={handleClearAll}>
                                Clear All
                            </button>
                        )}
                        {renderFilterOptions()}
                    </div>
                </div>

                {filteredNotifications.length === 0 ? (
                    <div className="empty-notifications">
                        <FaBell className="empty-icon" />
                        <p>You don't have any {filterType !== 'all' ? filterType.replace('_', ' ') : ''} notifications yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="notifications-list">
                            {getCurrentPageItems().map(notification => (
                                <div 
                                    key={notification._id} 
                                    className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type === 'scheduled_workout' ? 'workout-notification' : ''} ${notification.content?.isStartingSoon ? 'starting-soon' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-content">
                                        {notification.type !== 'scheduled_workout' && (
                                            <div className="notification-avatar-container">
                                                {getNotificationAvatar(notification)}
                                            </div>
                                        )}
                                        <div className="notification-text">
                                            <p className="notification-message">
                                                {notification.content.message}
                                            </p>
                                            <p className="notification-time">
                                                {formatDate(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="notification-actions">
                                        <button 
                                            className="delete-btn" 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering parent's onClick
                                                handleDelete(notification._id);
                                            }}
                                            title="Delete"
                                            aria-label="Delete notification"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default Notifications; 