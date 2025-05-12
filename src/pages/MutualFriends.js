import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import '../styles/Friends.css';

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

const FriendCard = ({ friend }) => {
    const navigate = useNavigate();
    const goToProfile = (email) => {
        navigate(`/profile/${email}`);
    };
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
                </div>
            </div>
        </div>
    );
};

const MutualFriends = () => {
    const { email } = useParams();
    const [mutualFriends, setMutualFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/signin');
            return;
        }
        const fetchMutualFriends = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axios.get(
                    `${API_URL}api/friends/mutual-friends?email=${email}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMutualFriends(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch mutual friends');
            } finally {
                setLoading(false);
            }
        };
        fetchMutualFriends();
    }, [email, token, navigate]);

    return (
        <div className="friends-page">
            <div className="friends-container">
                <div className="friends-list-section">
                    <h2>Mutual Friends</h2>
                    {loading && <div className="loading">Loading...</div>}
                    {error && <div className="error">{error}</div>}
                    {!loading && !error && mutualFriends.length === 0 && (
                        <p>No mutual friends found.</p>
                    )}
                    <div className="friends-grid">
                        {mutualFriends.map(friend => (
                            <FriendCard key={friend.email} friend={friend} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MutualFriends; 