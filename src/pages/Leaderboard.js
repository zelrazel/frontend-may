import React, { useState, useEffect } from 'react';
import { FaWeight, FaDumbbell, FaCalendarCheck, FaSync, FaCrown, FaEnvelope, FaUser, FaGraduationCap, FaLaptopCode, FaServer, FaCaretDown } from 'react-icons/fa';
import axios from 'axios';
import '../styles/Leaderboard.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState('weightLoss');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('BSCS');
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const categories = [
    { id: 'weightLoss', name: 'Weight Loss', icon: <FaWeight /> },
    { id: 'strength', name: 'Strength-Based', icon: <FaDumbbell /> },
    { id: 'consistency', name: 'Consistency', icon: <FaCalendarCheck /> },
    { id: 'hybrid', name: 'Hybrid', icon: <FaSync /> }
  ];
  
  const courses = [
    { id: 'BSCS', name: 'BSCS', icon: <FaLaptopCode /> },
    { id: 'BSIT', name: 'BSIT', icon: <FaServer /> }
  ];

  // Find the active category details
  const activeTabDetails = categories.find(cat => cat.id === activeCategory);

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setShowMobileDropdown(false);
  };

  useEffect(() => {
    if (activeCategory === 'weightLoss' || 
        activeCategory === 'strength' || 
        activeCategory === 'consistency' || 
        activeCategory === 'hybrid') {
        fetchLeaderboardData();
    }
  }, [activeCategory, selectedCourse]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const endpoint = activeCategory === 'weightLoss' 
          ? 'weight-loss' 
          : activeCategory === 'strength' 
          ? 'strength'
          : activeCategory === 'consistency'
          ? 'consistency'
          : activeCategory === 'hybrid'
          ? 'hybrid'
          : null;

      if (!endpoint) {
          setLeaderboardData([]);
          return;
      }

      const response = await axios.get(`${API_URL}api/leaderboard/${endpoint}?course=${selectedCourse}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(`Received ${response.data.length} entries for ${endpoint} leaderboard with course ${selectedCourse}`);
      setLeaderboardData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch leaderboard data');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderRankInfo = (user, category) => {
    // Check if user profile is private, if so return a privacy notice
    if (user.isPrivate) {
        return (
            <div className="private-profile-notice">
                <span className="lock-icon">🔒</span>
                <span>Private Profile</span>
            </div>
        );
    }

    if (category === 'hybrid') {
        return (
            <div className="hybrid-info">
                <div className="hybrid-stats">
                    <div className="volume-stats">
                        <div className="total-volume">
                            Total Volume <span>{(user.totalVolume || 0).toLocaleString()}</span>
                        </div>
                        <div className="total-workouts">
                            Workouts <span>{user.totalWorkouts || 0}</span>
                        </div>
                    </div>
                    <div className="consistency-stats">
                        <div className="active-days">
                            Active Days <span>{user.activeDays || 0}</span>
                        </div>
                        <div className="hybrid-score">
                            {(user.hybridScore || 0).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    if (category === 'weightLoss') {
        return (
            <div className="weight-info">
                <div className="weight-details">
                    <div className="weight-stat">
                        <span>Start:</span> <span>{user.startingWeight?.toFixed(1)} kg</span>
                    </div>
                    <div className="weight-stat">
                        <span>Current:</span> <span>{user.currentWeight?.toFixed(1)} kg</span>
                    </div>
                    <div className="weight-stat">
                        <span>Loss:</span> <span>{user.weightLoss?.toFixed(1)} kg</span>
                    </div>
                    {user.consistencyBonus > 0 && (
                        <div className="bonus-details">
                            <span className="bonus-tag">
                                +{(user.consistencyBonus * 100).toFixed(0)}% bonus
                            </span>
                            <span className="weigh-ins">
                                ({user.weighInDays} days)
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (category === 'strength') {
        return (
            <div className="strength-info">
                <div className="strength-stats">
                    <div className="total-volume">
                        Total Volume <span>{(user.totalVolume || 0).toLocaleString()}</span>
                    </div>
                    <div className="total-workouts">
                        Workouts <span>{user.workoutCount || 0}</span>
                    </div>
                    <div className="strength-score">
                        {(user.strengthScore || 0).toLocaleString()}
                    </div>
                </div>
            </div>
        );
    }

    if (category === 'consistency') {
        return (
            <div className="consistency-info">
                <div className="consistency-stats">
                    <div className="total-workouts">
                        Total Workouts: <span>{user.totalWorkouts || 0}</span>
                    </div>
                    <div className="active-days">
                        Active Days: <span>{user.activeDays || 0}</span>
                    </div>
                    <div className="consistency-score">
                        Score: {(user.consistencyScore || 0).toLocaleString()}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

const renderProfilePicture = (user) => {
    return (
        <div className="leaderboard-profile-container">
            {user.profilePicture ? (
                <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="leaderboard-profile-picture"
                />
            ) : (
                <div className="profile-placeholder">
                    <FaUser />
                </div>
            )}
        </div>
    );
};

const renderMedal = (rank) => {
    switch (rank) {
        case 0:
            return <div className="crown">👑</div>;
        case 1:
            return <div className="medal silver">🥈</div>;
        case 2:
            return <div className="medal bronze">🥉</div>;
        default:
            return null;
    }
};

const renderLeaderboardContent = () => {
    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!leaderboardData || leaderboardData.length === 0) {
        return <div className="no-data">No rankings available yet for {selectedCourse} students</div>;
    }

    return (
        <>
            <div className="top-performers mobile-performers">
                {leaderboardData.slice(0, 3).map((user, index) => (
                    <div key={user._id || index} className={`performer ${['first', 'second', 'third'][index]}`}>
                        {renderMedal(index)}
                        {renderProfilePicture(user)}
                        <div className="rank">{index + 1}</div>
                        <div className="name">{user.firstName} {user.lastName}</div>
                        <div className="leaderboard-email">
                            <FaEnvelope className="email-icon" />
                            {user.email}
                        </div>
                        <button
                            className="about-me-button"
                            onClick={() => window.location.href = `/profile/${user.email}`}
                        >
                            About Me
                        </button>
                        {renderRankInfo(user, activeCategory)}
                    </div>
                ))}
            </div>
            <div className="other-ranks">
                {leaderboardData.slice(3).map((user, index) => (
                    <div key={user._id || index + 3} className="rank-item">
                        <div className="rank-number">{index + 4}</div>
                        {renderProfilePicture(user)}
                        <div className="rank-info">
                            <div className="rank-name">{user.firstName} {user.lastName}</div>
                            <div className="leaderboard-email">
                                <FaEnvelope className="email-icon" />
                                {user.email}
                            </div>
                            <button
                                className="about-me-button"
                                onClick={() => window.location.href = `/profile/${user.email}`}
                            >
                                About Me
                            </button>
                        </div>
                        {renderRankInfo(user, activeCategory)}
                    </div>
                ))}
            </div>
        </>
    );
};

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-wrapper">
        <div className="leaderboard-container">
          <div className="leaderboard-header">
            <h2>Leaderboard Rankings</h2>
          </div>
          
          <div className="course-filter">
            {courses.map(course => (
              <button
                key={course.id}
                className={`course-tab ${selectedCourse === course.id ? 'active' : ''}`}
                onClick={() => setSelectedCourse(course.id)}
              >
                {course.icon}
                <span>{course.name}</span>
              </button>
            ))}
          </div>
          
          {/* Desktop category tabs */}
          <div className="category-tabs desktop-only">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
          
          {/* Mobile category dropdown */}
          <div className="mobile-category-dropdown">
            <button 
              className="mobile-dropdown-button"
              onClick={() => setShowMobileDropdown(!showMobileDropdown)}
            >
              {activeTabDetails.icon}
              <span>{activeTabDetails.name}</span>
              <FaCaretDown className="dropdown-caret" />
            </button>
            
            {showMobileDropdown && (
              <div className="dropdown-menu">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`dropdown-item ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!user && (
            <div className="auth-message">
              <p>Sign in to see your rank and compete with others!</p>
              <button onClick={() => window.location.href = '/signin'} className="signin-btn">
                Sign In
              </button>
            </div>
          )}

          <div className="leaderboard-content">
            {renderLeaderboardContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
