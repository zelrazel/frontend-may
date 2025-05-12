import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaUser, FaUserFriends } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';
import "../styles/Friends.css";
import "../styles/AboutMe.css";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const NoProfilePicture = ({ name }) => (
    <div className="no-profile-picture">
        <FaUser 
            size={40} 
            style={{
                color: '#00A951', 
                stroke: '#00A951',
                strokeWidth: '1px',
                fill: '#00A951' 
            }} 
        />
    </div>
);

// Update the FriendCard component
const FriendCard = ({ friend, onRemove }) => {
    const navigate = useNavigate();
    const [mutualCount, setMutualCount] = useState(0);
    
    const goToProfile = (email) => {
        navigate(`/profile/${email}?tab=profile`);
    };
    const goToMutualFriends = (email) => {
        navigate(`/mutual-friends/${email}`);
    };

    useEffect(() => {
        const fetchMutualCount = async () => {
            try {
                const { data } = await axios.get(
                    `${API_URL}api/friends/mutual-friends-count?email=${friend.email}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setMutualCount(data.count);
            } catch (err) {
                console.error('Error fetching mutual friends count:', err);
            }
        };
        fetchMutualCount();
    }, [friend.email]);

    return (
        <div className="friend-card">
            <div className="friend-profile">
                {friend.profilePicture ? (
                    <img 
                        src={friend.profilePicture} 
                        alt={`${friend.firstName}'s profile`}
                        className="friend-profile-picture"
                    />
                ) : (
                    <NoProfilePicture name={`${friend.firstName} ${friend.lastName}`} />
                )}
            </div>
            <div className="friend-info">
                <div className="friend-details">
                    <div className="info-row request-style-info">
                        <span className="info-value">
                            {friend.firstName} {friend.lastName}
                        </span>
                    </div>
                </div>
                <div className="friend-buttons">
                    <button 
                        className="about-me-button" 
                        onClick={() => goToProfile(friend.email)}
                    >
                        About Me
                    </button>
                    <div 
                        className="mutual-friends-link"
                        onClick={() => goToMutualFriends(friend.email)}
                    >
                        <FaUserFriends className="mutual-friends-icon" />
                        <span>{mutualCount} Mutual Friends</span>
                    </div>
                    <button 
                        className="remove-friend-button" 
                        onClick={() => onRemove(friend.email)}
                    >
                        Remove Friend
                    </button>
                </div>
            </div>
        </div>
    );
};

const SearchResultCard = ({ searchResult, sendFriendRequest, cancelRequest, removeFriend }) => {
    const navigate = useNavigate();
    const [mutualCount, setMutualCount] = useState(0);

    useEffect(() => {
        const fetchMutualCount = async () => {
            try {
                const { data } = await axios.get(
                    `${API_URL}api/friends/mutual-friends-count?email=${searchResult.email}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setMutualCount(data.count);
            } catch (err) {
                console.error('Error fetching mutual friends count:', err);
            }
        };
        fetchMutualCount();
    }, [searchResult.email]);

    return (
        <div className="search-result">
            <div className="user-card">
                {searchResult.profilePicture ? (
                    <img
                        src={searchResult.profilePicture} 
                        alt="Profile"
                        className="profile-picture"
                    />
                ) : (
                    <NoProfilePicture name={`${searchResult.firstName} ${searchResult.lastName}`} />
                )}
                <div className="user-info">
                    <h3>{searchResult.firstName} {searchResult.lastName}</h3>
                    {!searchResult.isOwnProfile && (
                        <>
                            <button 
                                className="about-me-button" 
                                onClick={() => navigate(`/profile/${searchResult.email}`)}
                            >
                                About Me
                            </button>
                            <div 
                                className="mutual-friends-link"
                                onClick={() => navigate(`/mutual-friends/${searchResult.email}`)}
                            >
                                <FaUserFriends className="mutual-friends-icon" />
                                <span>{mutualCount} Mutual Friends</span>
                            </div>
                            {searchResult.friendshipStatus === 'none' && (
                                <button onClick={sendFriendRequest} className="add-friend-button">
                                    Add Friend
                                </button>
                            )}
                            {searchResult.friendshipStatus === 'pending-sent' && (
                                <>
                                    <span className="status-badge pending">Request Pending</span>
                                    <button 
                                        onClick={() => cancelRequest(searchResult.email)}
                                        className="cancel-request-button"
                                    >
                                        Cancel Request
                                    </button>
                                </>
                            )}
                            {searchResult.friendshipStatus === 'pending-received' && (
                                <div className="request-actions">
                                    <button 
                                        onClick={() => handleRequest(
                                            friendRequests.find(r => r.sender?.email === searchResult.email)?._id,
                                            'accept'
                                        )}
                                        className="accept-button"
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => handleRequest(
                                            friendRequests.find(r => r.sender?.email === searchResult.email)?._id,
                                            'reject'
                                        )}
                                        className="reject-button"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                            {searchResult.friendshipStatus === 'accepted' && (
                                <>
                                    <span className="status-badge friends">Already Friends</span>
                                    <button 
                                        onClick={() => removeFriend(searchResult.email)}
                                        className="remove-friend-button"
                                    >
                                        Remove Friend
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const RequestCard = ({ request, handleRequest, navigate }) => {
    const [mutualCount, setMutualCount] = useState(0);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchMutualCount = async () => {
            try {
                const { data } = await axios.get(
                    `${API_URL}api/friends/mutual-friends-count?email=${request.sender?.email}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMutualCount(data.count);
            } catch (err) {
                console.error('Error fetching mutual friends count:', err);
            }
        };
        if (request.sender?.email) {
            fetchMutualCount();
        }
    }, [request.sender?.email, token]);

    return (
        <div className="request-card">
            {request.sender?.profilePicture ? (
                <img
                    src={request.sender.profilePicture} 
                    alt="Profile"
                    className="profile-picture"
                />
            ) : (
                <NoProfilePicture name={`${request.sender?.firstName} ${request.sender?.lastName}`} />
            )}
            <div className="request-info">
                <h3>{request.sender?.firstName} {request.sender?.lastName}</h3>
                <button 
                    className="about-me-button" 
                    onClick={() => navigate(`/profile/${request.sender?.email}`)}
                >
                    About Me
                </button>
                <div 
                    className="mutual-friends-link"
                    onClick={() => navigate(`/mutual-friends/${request.sender?.email}`)}
                >
                    <FaUserFriends className="mutual-friends-icon" />
                    <span>{mutualCount} Mutual Friends</span>
                </div>
                <div className="request-actions">
                    <button
                        onClick={() => handleRequest(request._id, 'accept')}
                        className="accept-button"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => handleRequest(request._id, 'reject')}
                        className="reject-button"
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

const SentRequestCard = ({ request, cancelRequest, navigate }) => {
    const [mutualCount, setMutualCount] = useState(0);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchMutualCount = async () => {
            try {
                const { data } = await axios.get(
                    `${API_URL}api/friends/mutual-friends-count?email=${request.receiver?.email}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMutualCount(data.count);
            } catch (err) {
                console.error('Error fetching mutual friends count:', err);
            }
        };
        if (request.receiver?.email) {
            fetchMutualCount();
        }
    }, [request.receiver?.email, token]);

    return (
        <div className="request-card">
            {request.receiver?.profilePicture ? (
                <img
                    src={request.receiver.profilePicture} 
                    alt="Profile"
                    className="profile-picture"
                />
            ) : (
                <NoProfilePicture name={`${request.receiver?.firstName} ${request.receiver?.lastName}`} />
            )}
            <div className="request-info">
                <h3>{request.receiver?.firstName} {request.receiver?.lastName}</h3>
                <button 
                    className="about-me-button" 
                    onClick={() => navigate(`/profile/${request.receiver?.email}`)}
                >
                    About Me
                </button>
                <div 
                    className="mutual-friends-link"
                    onClick={() => navigate(`/mutual-friends/${request.receiver?.email}`)}
                >
                    <FaUserFriends className="mutual-friends-icon" />
                    <span>{mutualCount} Mutual Friends</span>
                </div>
                <div className="request-actions">
                    <button
                        onClick={() => cancelRequest(request.receiver?.email)}
                        className="cancel-request-button"
                    >
                        Cancel Request
                    </button>
                </div>
            </div>
        </div>
    );
};

const Friends = ({ showOnlyFriendsList, profileEmail }) => {
    const navigate = useNavigate();
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [friendRequests, setFriendRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [token] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }
        // Add token expiration check
        const checkTokenExpiration = async () => {
            try {
                await axios.get(`${API_URL}/api/friends/list`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/signin');
                }
            }
        };
        checkTokenExpiration();
    }, [navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/signin');
            return;
        }
    }, [token, navigate]);

    if (!token) {
        return null;
    }

    useEffect(() => {
        fetchFriends();
        if (!profileEmail && !showOnlyFriendsList) {
            fetchFriendRequests();
            fetchSentRequests();
        }
    }, [profileEmail]);

    useEffect(() => {
        getUserEmail();
    }, []);

    const fetchFriendRequests = async () => {
        try {
            const { data } = await axios.get(`${API_URL}api/friends/requests`, config);
            setFriendRequests(data);
        } catch (error) {
            console.error('Failed to fetch friend requests:', error);
        }
    };

    const fetchSentRequests = async () => {
        try {
            const { data } = await axios.get(`${API_URL}api/friends/sent-requests`, config);
            setSentRequests(data);
        } catch (error) {
            console.error('Failed to fetch sent requests:', error);
        }
    };

    // Modify fetchFriends function to use profileEmail if provided
    const fetchFriends = async () => {
        try {
            let url;
            if (profileEmail) {
                url = `${API_URL}api/friends/list?email=${profileEmail}`;
            } else {
                url = `${API_URL}api/friends/list`;
            }
            const { data } = await axios.get(url, config);
            setFriends(data);
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        }
    };

    const getUserEmail = async () => {
        try {
            const response = await axios.get(`${API_URL}api/profile`, config);
            setUserEmail(response.data.email);
        } catch (error) {
            console.error('Error fetching user email:', error);
        }
    };

    // Filter friends based on search query
    const filteredFriends = friends.filter(friend => {
        const searchLower = searchQuery.toLowerCase();
        const fullName = `${friend.firstName} ${friend.lastName}`.toLowerCase();
        return friend.email.toLowerCase().includes(searchLower) ||
               fullName.includes(searchLower) ||
               friend.firstName.toLowerCase().includes(searchLower) ||
               friend.lastName.toLowerCase().includes(searchLower);
    });

    // Clear search handler
    const handleClearSearch = () => {
        setSearchQuery('');
    };

    // Move removeFriend above all usages
    const removeFriend = async (friendEmail) => {
        try {
            const result = await Swal.fire({
                title: '[ REMOVE FRIEND ]',
                text: 'Are you sure you want to remove this friend?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '< REMOVE >',
                cancelButtonText: '< CANCEL >',
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonColor: '#ff4444',
                cancelButtonColor: '#00ff84',
                backdrop: `
                    rgba(0,0,0,0.8)
                    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f00' fill-opacity='0.1'%3E%3Cpath d='M20 40h10v20H20zM15 45h20v10H15zM10 48h30v4H10z'/%3E%3Cpath d='M60 45h30v10H60zM65 40h5v20h-5zM80 40h5v20h-5zM20 5c0 8.284-6.716 15-15 15v5c11.046 0 20-8.954 20-20h-5z'/%3E%3C/g%3E%3C/svg%3E")`
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                await axios.post(
                    `${API_URL}api/friends/remove`,
                    { friendEmail },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                setFriends(prevFriends => prevFriends.filter(friend => friend.email !== friendEmail));
                setSearchResult(null);
                setSearchEmail("");

                await Swal.fire({
                    title: '[ SUCCESS ]',
                    text: 'Friend removed successfully!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: 'rgba(16, 16, 28, 0.95)'
                });

                await fetchFriends();
            }
        } catch (error) {
            console.error('Error removing friend:', error);
            await Swal.fire({
                title: '[ ERROR ]',
                text: 'Failed to remove friend',
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)'
            });
        }
    };

    // If viewing another user's profile, only show their friends, no search or requests UI
    if (profileEmail) {
        return (
            <div className="friends-list-section" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Friends ({filteredFriends.length})</h2>
                <div className="friends-search-container">
                    <input
                        type="text"
                        placeholder="Search by name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="friends-search-input"
                    />
                    {searchQuery && (
                        <button onClick={handleClearSearch} className="clear-search-button">Clear</button>
                    )}
                </div>
                {friends.length === 0 ? (
                    <p>No friends yet</p>
                ) : (
                    <div className="friends-grid">
                        {filteredFriends.map(friend => (
                            <FriendCard 
                                key={friend._id} 
                                friend={friend}
                                onRemove={removeFriend}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Only render My Friends section if showOnlyFriendsList is true (for current user)
    if (showOnlyFriendsList) {
        return (
            <div className="friends-list-section" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Friends ({filteredFriends.length})</h2>
                <div className="friends-search-container">
                    <input
                        type="text"
                        placeholder="Search by name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="friends-search-input"
                    />
                    {searchQuery && (
                        <button onClick={handleClearSearch} className="clear-search-button">Clear</button>
                    )}
                </div>
                {friends.length === 0 ? (
                    <p>No friends yet</p>
                ) : (
                    <div className="friends-grid">
                        {filteredFriends.map(friend => (
                            <FriendCard 
                                key={friend._id} 
                                friend={friend}
                                onRemove={removeFriend}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Default: full friend management UI for current user
    const searchUser = async () => {
        if (!searchEmail) return;
        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.get(
                `${API_URL}api/friends/search?email=${searchEmail}`,
                config
            );

            // Check if the searched email is the user's own email
            if (searchEmail === userEmail) {
                setSearchResult({
                    ...data,
                    isOwnProfile: true
                });
                setLoading(false);
                return;
            }

            // Rest of your existing searchUser logic...
            const isFriend = friends.some(friend => friend.email === searchEmail);
            const isPendingReceived = friendRequests.some(
                request => request.sender?.email === searchEmail
            );
            const isPendingSent = sentRequests.some(
                request => request.receiver?.email === searchEmail
            );

            let status = 'none';
            if (isFriend) {
                status = 'accepted';
            } else if (isPendingReceived) {
                status = 'pending-received';
            } else if (isPendingSent) {
                status = 'pending-sent';
            }

            setSearchResult({
                ...data,
                friendshipStatus: status,
                isOwnProfile: false
            });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/signin');
            } else {
                setError(error.response?.data?.message || "User not found");
                setSearchResult(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async () => {
        try {
            const result = await Swal.fire({
                title: '[ SEND FRIEND REQUEST ]',
                text: `Connect with ${searchResult.firstName} ${searchResult.lastName}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '< SEND >',
                cancelButtonText: '< CANCEL >',
                background: 'rgba(16, 16, 28, 0.95)',
                backdrop: `
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230f0' fill-opacity='0.1'%3E%3C!-- Dumbbell 1 --%3E%3Cpath d='M20 40h10v20H20zM15 45h20v10H15zM10 48h30v4H10z'/%3E%3C!-- Barbell --%3E%3Cpath d='M60 45h30v10H60zM65 40h5v20h-5zM80 40h5v20h-5z'/%3E%3C!-- Kettlebell --%3E%3Cpath d='M20 5c0 8.284-6.716 15-15 15v5c11.046 0 20-8.954 20-20h-5z'/%3E%3C/g%3E%3C/svg%3E")
                `
            });

            if (result.isConfirmed) {
                // Show loading state
                Swal.fire({
                    title: 'Sending request...',
                    text: 'Please wait',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const { data } = await axios.post(
                    `${API_URL}api/friends/request`,
                    { receiverEmail: searchResult.email },
                    config
                );
                
                // Update the search result state
                setSearchResult({ ...searchResult, friendshipStatus: 'pending' });
                
                // Refresh sent requests list to show the new request
                await fetchSentRequests();
                
                // Clear search after successful request
                setSearchEmail("");
                
                // Show success message
                await Swal.fire({
                    title: '[ SUCCESS ]',
                    text: 'Friend request sent!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: 'rgba(16, 16, 28, 0.95)'
                });
            }
        } catch (error) {
            console.error('Send friend request error:', error);
            
            let errorMessage = "Failed to send friend request";
            
            // Extract specific error message from response if available
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            
            // Check if session expired
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/signin');
                return;
            }
            
            // Show user-friendly error message
            await Swal.fire({
                title: '[ ERROR ]',
                text: errorMessage,
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)'
            });
            
            // Refresh data to ensure UI is in sync with backend state
            await fetchSentRequests();
            await fetchFriendRequests();
            await fetchFriends();
            
            // If there was an error but the request might have gone through, clear search
            if (error.response && error.response.status >= 500) {
                setSearchEmail("");
                setSearchResult(null);
            }
        }
    };

    const handleRequest = async (requestId, action) => {
        const actionText = action === 'accept' ? 'accept' : 'reject';
        const iconColor = action === 'accept' ? '#0f0' : '#f00';
        const backdropPattern = action === 'accept' ? 
       ` url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230f0' fill-opacity='0.1'%3E%3C!-- Dumbbell 1 --%3E%3Cpath d='M20 40h10v20H20zM15 45h20v10H15zM10 48h30v4H10z'/%3E%3C!-- Barbell --%3E%3Cpath d='M60 45h30v10H60zM65 40h5v20h-5zM80 40h5v20h-5z'/%3E%3C!-- Kettlebell --%3E%3Cpath d='M20 5c0 8.284-6.716 15-15 15v5c11.046 0 20-8.954 20-20h-5z'/%3E%3C/g%3E%3C/svg%3E")`:
       `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f00' fill-opacity='0.1'%3E%3C!-- Dumbbell 1 --%3E%3Cpath d='M20 40h10v20H20zM15 45h20v10H15zM10 48h30v4H10z'/%3E%3C!-- Barbell --%3E%3Cpath d='M60 45h30v10H60zM65 40h5v20h-5zM80 40h5v20h-5z'/%3E%3C!-- Kettlebell --%3E%3Cpath d='M20 5c0 8.284-6.716 15-15 15v5c11.046 0 20-8.954 20-20h-5z'/%3E%3C/g%3E%3C/svg%3E")`;
        
        try {
            const result = await Swal.fire({
                title: `[ ${actionText.toUpperCase()} REQUEST ]`,
                text: `Are you sure you want to ${actionText} this friend request?`,
                icon: action === 'accept' ? 'success' : 'warning',
                showCancelButton: true,
                confirmButtonText: `< ${actionText.toUpperCase()} >`,
                cancelButtonText: '< CANCEL >',
                background: 'rgba(16, 16, 28, 0.95)',
                backdrop: `rgba(0,0,0,0.8) ${backdropPattern}`,
                customClass: {
                    confirmButton: action === 'accept' ? 'accept-confirm-button' : 'reject-confirm-button',
                    cancelButton: 'cancel-button'
                }
            });

            if (result.isConfirmed) {
                try {
                    await axios.post(
                        `${API_URL}api/friends/${action}`,
                        { requestId },
                        config
                    );
                    await fetchFriendRequests();
                    await fetchFriends();
                    
                    // Clear search result after action
                    setSearchResult(null);
                    setSearchEmail("");

                    await Swal.fire({
                        title: '[ SUCCESS ]',
                        text: `Friend request ${action}ed successfully!`,
                        icon: 'success',
                        background: 'rgba(16, 16, 28, 0.95)'
                    });
                } catch (err) {
                    // ...existing error handling...
                }
            }
        } catch (err) {
            console.error('Handle request error:', err);
            Swal.fire({
                title: '[ ERROR ]',
                text: `Failed to ${action} request`,
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)'
            });
        }
    };

    const cancelRequest = async (receiverEmail) => {
        try {
            const result = await Swal.fire({
                title: '[ CANCEL REQUEST ]',
                text: 'Are you sure you want to cancel this friend request?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '< CANCEL REQUEST >',
                cancelButtonText: '< KEEP REQUEST >',
                reverseButtons: true,
                customClass: {
                    popup: 'cancel-request-dialog'
                },
                background: 'rgba(16, 16, 28, 0.95)',
                backdrop: `
                    rgba(0,0,0,0.8)
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f00' fill-opacity='0.1'%3E%3C!-- Dumbbell 1 --%3E%3Cpath d='M20 40h10v20H20zM15 45h20v10H15zM10 48h30v4H10z'/%3E%3C!-- Barbell --%3E%3Cpath d='M60 45h30v10H60zM65 40h5v20h-5zM80 40h5v20h-5z'/%3E%3C!-- Kettlebell --%3E%3Cpath d='M20 5c0 8.284-6.716 15-15 15v5c11.046 0 20-8.954 20-20h-5z'/%3E%3C/g%3E%3C/svg%3E")
                `
            });

            if (result.isConfirmed) {
                try {
                    await axios.post(
                        `${API_URL}api/friends/cancel-request`,
                        { receiverEmail },
                        config
                    );
                    await fetchSentRequests();
                    
                    // Clear search result after cancellation
                    setSearchResult(null);
                    setSearchEmail("");

                    await Swal.fire({
                        title: '[ REQUEST CANCELLED ]',
                        text: 'Friend request cancelled successfully!',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        background: 'rgba(16, 16, 28, 0.95)'
                    });
                } catch (err) {
                    Swal.fire({
                        title: '[ ERROR ]',
                        text: 'Failed to cancel friend request',
                        icon: 'error',
                        background: 'rgba(16, 16, 28, 0.95)'
                    });
                }
            }
        } catch (err) {
            Swal.fire({
                title: '[ ERROR ]',
                text: 'Failed to cancel friend request',
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)'
            });
        }
    };

    return (
        <div className="friends-page">
            <div className="friends-container">
                <div className="search-section">
                    <h2>Find Friends</h2>
                    <div className="search-box">
                        <input
                            type="email"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            placeholder="Search by email"
                            className="search-input"
                        />
                        <button onClick={searchUser} className="search-button">
                            Search
                        </button>
                    </div>

                    {loading && <div className="loading">Searching...</div>}
                    {error && <div className="error">{error}</div>}

                    {searchResult && (
                        <SearchResultCard 
                            searchResult={searchResult}
                            sendFriendRequest={sendFriendRequest}
                            cancelRequest={cancelRequest}
                            removeFriend={removeFriend}
                        />
                    )}
                </div>

                <div className="requests-wrapper">
                    <div className="requests-section">
                        <h2>Friend Requests</h2>
                        <div className="requests-content">
                            {friendRequests.length === 0 ? (
                                <p>No pending friend requests</p>
                            ) : (
                                friendRequests.map(request => (
                                    <RequestCard 
                                        key={request._id} 
                                        request={request}
                                        handleRequest={handleRequest}
                                        navigate={navigate}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="sent-requests-section">
                        <h2>Sent Requests</h2>
                        <div className="sent-requests-content">
                            {sentRequests.length === 0 ? (
                                <p>No sent friend requests</p>
                            ) : (
                                sentRequests.map(request => (
                                    <SentRequestCard 
                                        key={request._id} 
                                        request={request}
                                        cancelRequest={cancelRequest}
                                        navigate={navigate}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="friends-list-section">
                    <h2>Friends ({filteredFriends.length})</h2>
                    {/* Add search container */}
                    <div className="friends-search-container">
                        <input
                            type="text"
                            placeholder="Search by name or email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="friends-search-input"
                        />
                        {searchQuery && (
                            <button 
                                onClick={handleClearSearch}
                                className="clear-search-button"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {friends.length === 0 ? (
                        <p>No friends yet</p>
                    ) : (
                        <div className="friends-grid">
                            {filteredFriends.map(friend => (
                                <FriendCard 
                                    key={friend._id} 
                                    friend={friend}
                                    onRemove={removeFriend}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Friends;