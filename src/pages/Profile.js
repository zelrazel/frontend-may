import React, { useState, useEffect, useCallback, Component, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaUser, FaCamera, FaTrash, FaTimes, FaWeight, FaDumbbell, FaCalendarCheck, FaSync, FaGraduationCap, FaComment, FaChevronDown, FaChevronUp, FaPaperPlane, FaHeart, FaFire, FaThumbsUp, FaHandPeace, FaArrowDown, FaArrowUp, FaMedal, FaChartLine, FaCogs, FaClock, FaFilter, FaUserFriends } from 'react-icons/fa';
import Swal from 'sweetalert2'; 
import '../styles/Profile.css';
import '../styles/WorkoutActivities.css';
import '../styles/ScheduledWorkoutActivities.css';
import '../styles/WeightActivityStyles.css';
import { Bar, Line } from 'react-chartjs-2';
import Friends from './Friends';




// Import Weight Loss badge images
import badge1kg from '../Weight Loss Badges/First Step Staken.png';
import badge2kg from '../Weight Loss Badges/Shedding Pounds.png';
import badge5kg from '../Weight Loss Badges/Getting Lean.png';
import badge10kg from '../Weight Loss Badges/Transformation Mode.png';
import badge15kg from '../Weight Loss Badges/Peak Physique.png';
import badgeSteady from '../Weight Loss Badges/Steady Cutter.png';

// Import Strength-Based badge images
import rookieBadge from '../Strength-Based Badges/Rookie Lifter.png';
import casualBadge from '../Strength-Based Badges/Casual Beast.png';
import powerBadge from '../Strength-Based Badges/Powerhouse.png';
import eliteBadge from '../Strength-Based Badges/Elite Lifter.png';
import titanBadge from '../Strength-Based Badges/Titan Mode.png';
import maxedBadge from '../Strength-Based Badges/Maxed Out.png';

// Import Consistency badge images
import oneStepBadge from '../Consistency Badges/One step at a time.png';
import streakStarterBadge from '../Consistency Badges/Streak Starter.png';
import grindingHardBadge from '../Consistency Badges/Grinding Hard.png';
import unstoppableBadge from '../Consistency Badges/Unstoppable.png';
import relentlessBadge from '../Consistency Badges/Relentless.png';

// Import Hybrid Ranking badge images
import balancedWarriorBadge from '../Hybrid Badges/Balanced Warrior.png';
import eliteAthleteBadge from '../Hybrid Badges/Elite Athlete.png';
import dominatorBadge from '../Hybrid Badges/Dominator.png';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Error Boundary Component to catch errors in the UI
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught in ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-container">
                    <h3>Something went wrong with this component.</h3>
                    <p>We've been notified and will fix it as soon as possible.</p>
                    <button 
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="retry-button"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const Profile = () => {
    const { email: profileEmail } = useParams(); // Get email from URL params
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRanks, setUserRanks] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditingPhoto, setIsEditingPhoto] = useState(false); 
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [editedInfo, setEditedInfo] = useState({
        firstName: '',
        lastName: '',
        course: '',
        height: '',
        weight: '',
        gender: '',
        age: '',
        phoneNumber: ''
    });
    const [phoneError, setPhoneError] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [heightError, setHeightError] = useState('');
    const [ageError, setAgeError] = useState('');
    const navigate = useNavigate();
    
    // Achievement states
    const [weightLossAchievements, setWeightLossAchievements] = useState([]);
    const [strengthAchievements, setStrengthAchievements] = useState([]);
    const [consistencyAchievements, setConsistencyAchievements] = useState([]);
    const [hybridAchievements, setHybridAchievements] = useState([]);
    const [achievementsLoading, setAchievementsLoading] = useState(true);
    
    // For achievement popup
    const [showPopup, setShowPopup] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    // Activity feed states
    const [userActivities, setUserActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState(null);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [commentText, setCommentText] = useState({});
    const [activeCommentActivityId, setActiveCommentActivityId] = useState(null);
    const [expandedComments, setExpandedComments] = useState({});
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showComments, setShowComments] = useState({});
    const [commentSubmitting, setCommentSubmitting] = useState({});

    const [currentUser, setCurrentUser] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(true);

    // Add a ref to track if activities have been loaded for the current tab session
    const activityTabLoadedRef = useRef(false);

    // Near the top of component logic, add these new state variables
    const [highlightedActivityId, setHighlightedActivityId] = useState(null);
    const [highlightedCommentId, setHighlightedCommentId] = useState(null);
    const activityRefs = useRef({});

    const [showActivityFilters, setShowActivityFilters] = useState(false);

    // Add state for workout/weight tracking data
    const [profileWorkoutData, setProfileWorkoutData] = useState({ completed: [], loading: true });
    const [profileWeightData, setProfileWeightData] = useState({ history: [], loading: true });
    const [profileWorkoutTimePeriod, setProfileWorkoutTimePeriod] = useState('all');
    const [profileWorkoutShowTimeFilter, setProfileWorkoutShowTimeFilter] = useState(false);
    const [profileWorkoutAvailableMonths, setProfileWorkoutAvailableMonths] = useState([]);
    const [profileWorkoutAvailableWeeks, setProfileWorkoutAvailableWeeks] = useState([]);
    const [profileWorkoutSelectedMonth, setProfileWorkoutSelectedMonth] = useState(null);
    const [profileWorkoutSelectedWeek, setProfileWorkoutSelectedWeek] = useState(null);
    const [profileWeightTimePeriod, setProfileWeightTimePeriod] = useState('all');
    const [profileWeightShowTimeFilter, setProfileWeightShowTimeFilter] = useState(false);
    const [profileWeightAvailableMonths, setProfileWeightAvailableMonths] = useState([]);
    const [profileWeightAvailableWeeks, setProfileWeightAvailableWeeks] = useState([]);
    const [profileWeightSelectedMonth, setProfileWeightSelectedMonth] = useState(null);
    const [profileWeightSelectedWeek, setProfileWeightSelectedWeek] = useState(null);

    // Add these refs near the top of the Profile component, after other useRef declarations
    const profileWorkoutTimeFilterRef = useRef(null);
    const profileWeightTimeFilterRef = useRef(null);

    const location = useLocation();

    // Add click-outside logic for workout tracking dropdown
    useEffect(() => {
        function handleClickOutsideWorkout(event) {
            if (profileWorkoutTimeFilterRef.current && !profileWorkoutTimeFilterRef.current.contains(event.target)) {
                setProfileWorkoutShowTimeFilter(false);
            }
        }
        if (profileWorkoutShowTimeFilter) {
            document.addEventListener('mousedown', handleClickOutsideWorkout);
        } else {
            document.removeEventListener('mousedown', handleClickOutsideWorkout);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideWorkout);
        };
    }, [profileWorkoutShowTimeFilter]);

    // Add click-outside logic for weight tracking dropdown
    useEffect(() => {
        function handleClickOutsideWeight(event) {
            if (profileWeightTimeFilterRef.current && !profileWeightTimeFilterRef.current.contains(event.target)) {
                setProfileWeightShowTimeFilter(false);
            }
        }
        if (profileWeightShowTimeFilter) {
            document.addEventListener('mousedown', handleClickOutsideWeight);
        } else {
            document.removeEventListener('mousedown', handleClickOutsideWeight);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideWeight);
        };
    }, [profileWeightShowTimeFilter]);

    // Fetch workout tracking data for profile
    useEffect(() => {
        if (!user) return;
        const fetchProfileWorkoutData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get(`${API_URL}api/workouts/completed${profileEmail ? `?email=${profileEmail}` : ''}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfileWorkoutData({ completed: response.data, loading: false });
                // Generate months for filter
                const monthsMap = new Map();
                response.data.forEach(entry => {
                    const date = new Date(entry.completedDate || entry.date);
                    const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                    if (!monthsMap.has(monthYear)) {
                        monthsMap.set(monthYear, {
                            name: monthYear,
                            entries: [],
                            month: date.getMonth(),
                            year: date.getFullYear()
                        });
                    }
                    monthsMap.get(monthYear).entries.push(entry);
                });
                const monthsArr = Array.from(monthsMap.values());
                monthsArr.sort((a, b) => {
                    const dateA = new Date(a.year, a.month);
                    const dateB = new Date(b.year, b.month);
                    return dateB - dateA;
                });
                setProfileWorkoutAvailableMonths(monthsArr);
            } catch (e) {
                setProfileWorkoutData({ completed: [], loading: false });
            }
        };
        fetchProfileWorkoutData();
    }, [user, profileEmail]);

    // Fetch weight tracking data for profile
    useEffect(() => {
        if (!user) return;
        const fetchProfileWeightData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get(`${API_URL}api/weight/history${profileEmail ? `?email=${profileEmail}` : ''}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfileWeightData({ history: response.data, loading: false });
                // Generate months for filter
                const monthsMap = new Map();
                response.data.forEach(entry => {
                    const date = new Date(entry.date);
                    const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                    if (!monthsMap.has(monthYear)) {
                        monthsMap.set(monthYear, {
                            name: monthYear,
                            entries: [],
                            month: date.getMonth(),
                            year: date.getFullYear()
                        });
                    }
                    monthsMap.get(monthYear).entries.push(entry);
                });
                const monthsArr = Array.from(monthsMap.values());
                monthsArr.sort((a, b) => {
                    const dateA = new Date(a.year, a.month);
                    const dateB = new Date(b.year, b.month);
                    return dateB - dateA;
                });
                setProfileWeightAvailableMonths(monthsArr);
            } catch (e) {
                setProfileWeightData({ history: [], loading: false });
            }
        };
        fetchProfileWeightData();
    }, [user, profileEmail]);

    // Helper: filter workouts for chart
    const getProfileFilteredWorkouts = () => {
        let filtered = [...profileWorkoutData.completed];
        if (profileWorkoutTimePeriod === 'weekly' && profileWorkoutSelectedWeek) {
            filtered = filtered.filter(workout => {
                const workoutDate = new Date(workout.completedDate || workout.date);
                const workoutDay = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
                const startDay = new Date(profileWorkoutSelectedWeek.startDate.getFullYear(), profileWorkoutSelectedWeek.startDate.getMonth(), profileWorkoutSelectedWeek.startDate.getDate());
                const endDay = new Date(profileWorkoutSelectedWeek.endDate.getFullYear(), profileWorkoutSelectedWeek.endDate.getMonth(), profileWorkoutSelectedWeek.endDate.getDate());
                return workoutDay >= startDay && workoutDay <= endDay;
            });
        } else if (profileWorkoutTimePeriod === 'monthly' && profileWorkoutSelectedMonth) {
            filtered = filtered.filter(workout => {
                const workoutDate = new Date(workout.completedDate || workout.date);
                return workoutDate.getMonth() === profileWorkoutSelectedMonth.month && workoutDate.getFullYear() === profileWorkoutSelectedMonth.year;
            });
        }
        return filtered;
    };
    // Helper: filter weight history for chart
    const getProfileFilteredWeightHistory = () => {
        let filtered = [...profileWeightData.history];
        if (profileWeightTimePeriod === 'weekly' && profileWeightSelectedWeek) {
            filtered = filtered.filter(entry => {
                const entryDate = new Date(entry.date);
                const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
                const startDay = new Date(profileWeightSelectedWeek.startDate.getFullYear(), profileWeightSelectedWeek.startDate.getMonth(), profileWeightSelectedWeek.startDate.getDate());
                const endDay = new Date(profileWeightSelectedWeek.endDate.getFullYear(), profileWeightSelectedWeek.endDate.getMonth(), profileWeightSelectedWeek.endDate.getDate());
                return entryDay >= startDay && entryDay <= endDay;
            });
        } else if (profileWeightTimePeriod === 'monthly' && profileWeightSelectedMonth) {
            filtered = filtered.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate.getMonth() === profileWeightSelectedMonth.month && entryDate.getFullYear() === profileWeightSelectedMonth.year;
            });
        }
        return filtered;
    };
    // Helper: generate weeks for a given month (for both workout and weight tracking)
    const generateProfileWeeksForMonth = (monthData, type) => {
        const entries = monthData.entries;
        if (!entries || entries.length === 0) return [];
        const year = monthData.year;
        const month = monthData.month;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const uniqueWeeks = new Set();
        const weeksByKey = {};
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const startOfWeek = new Date(date);
            const dayOfWeek = startOfWeek.getDay();
            startOfWeek.setDate(date.getDate() - dayOfWeek);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            const weekKey = startOfWeek.toISOString().split('T')[0];
            if (!uniqueWeeks.has(weekKey)) {
                uniqueWeeks.add(weekKey);
                const weekName = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                weeksByKey[weekKey] = {
                    key: weekKey,
                    startDate: new Date(startOfWeek),
                    endDate: new Date(endOfWeek),
                    name: weekName,
                    entries: []
                };
            }
        }
        entries.forEach(entry => {
            const entryDate = new Date(entry.date || entry.completedDate);
            const startOfWeek = new Date(entryDate);
            const dayOfWeek = startOfWeek.getDay();
            startOfWeek.setDate(entryDate.getDate() - dayOfWeek);
            const weekKey = startOfWeek.toISOString().split('T')[0];
            if (weeksByKey[weekKey]) {
                weeksByKey[weekKey].entries.push(entry);
            }
        });
        const weeksArray = Object.values(weeksByKey).filter(week => week.entries.length > 0);
        weeksArray.sort((a, b) => b.startDate - a.startDate);
        if (type === 'workout') setProfileWorkoutAvailableWeeks(weeksArray);
        else setProfileWeightAvailableWeeks(weeksArray);
    };
    // Chart data for workout tracking
    const getProfileWorkoutCategoryChartData = () => {
        const filtered = getProfileFilteredWorkouts();
        if (!filtered.length) {
            return {
                labels: ['No Data'],
                datasets: [{ data: [1], backgroundColor: ['#ccc'], borderColor: ['#999'] }]
            };
        }
        const categories = { 'Dumbbell': 0, 'Machine': 0, 'Barbell': 0, 'Bodyweight': 0 };
        filtered.forEach(workout => { if (categories[workout.category] !== undefined) categories[workout.category]++; });
        return {
            labels: Object.keys(categories),
            datasets: [{
                label: 'Completed Workouts by Category',
                data: Object.values(categories),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        };
    };
    const getProfileWorkoutTargetChartData = () => {
        const filtered = getProfileFilteredWorkouts();
        if (!filtered.length) {
            return {
                labels: ['No Data'],
                datasets: [{ data: [1], backgroundColor: ['#ccc'], borderColor: ['#999'] }]
            };
        }
        const targets = {};
        filtered.forEach(workout => { const target = workout.target; if (!targets[target]) targets[target] = 0; targets[target]++; });
        const entries = Object.entries(targets).sort((a, b) => b[1] - a[1]);
        let labels = [], data = [], backgroundColor = [], borderColor = [];
        const colors = [
            ['rgba(255, 99, 132, 0.5)', 'rgba(255, 99, 132, 1)'],
            ['rgba(54, 162, 235, 0.5)', 'rgba(54, 162, 235, 1)'],
            ['rgba(255, 206, 86, 0.5)', 'rgba(255, 206, 86, 1)'],
            ['rgba(75, 192, 192, 0.5)', 'rgba(75, 192, 192, 1)'],
            ['rgba(153, 102, 255, 0.5)', 'rgba(153, 102, 255, 1)'],
            ['rgba(255, 159, 64, 0.5)', 'rgba(255, 159, 64, 1)'],
            ['rgba(199, 199, 199, 0.5)', 'rgba(199, 199, 199, 1)'],
            ['rgba(83, 102, 255, 0.5)', 'rgba(83, 102, 255, 1)'],
        ];
        const topEntries = entries.slice(0, Math.min(8, entries.length));
        topEntries.forEach((entry, index) => {
            labels.push(entry[0]);
            data.push(entry[1]);
            backgroundColor.push(colors[index % colors.length][0]);
            borderColor.push(colors[index % colors.length][1]);
        });
        if (entries.length > 8) {
            const otherSum = entries.slice(8).reduce((sum, entry) => sum + entry[1], 0);
            labels.push('Other');
            data.push(otherSum);
            backgroundColor.push('rgba(128, 128, 128, 0.5)');
            borderColor.push('rgba(128, 128, 128, 1)');
        }
        return {
            labels,
            datasets: [{
                label: 'Completed Workouts by Target Muscle',
                data,
                backgroundColor,
                borderColor,
                borderWidth: 1
            }]
        };
    };
    const profileWorkoutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: { color: '#fff', font: { size: 12 }, padding: 20 }
            },
            title: {
                display: true,
                text: 'Workout Distribution',
                color: '#00ff84',
                font: { size: 16 },
                padding: { top: 10, bottom: 20 }
            }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#fff', precision: 0 } },
            x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#fff' } }
        }
    };
    const getProfileWeightChartData = () => {
        const filtered = getProfileFilteredWeightHistory();
        let timeRangeLabel = 'All Time';
        if (profileWeightTimePeriod === 'weekly' && profileWeightSelectedWeek) timeRangeLabel = profileWeightSelectedWeek.name;
        else if (profileWeightTimePeriod === 'monthly' && profileWeightSelectedMonth) timeRangeLabel = profileWeightSelectedMonth.name;
        return {
            labels: filtered.map(entry => new Date(entry.date).toLocaleDateString()),
            datasets: [{
                label: `Weight Progress (${timeRangeLabel})`,
                data: filtered.map(entry => entry.weight),
                borderColor: '#00ff84',
                backgroundColor: 'rgba(0, 255, 132, 0.2)',
                tension: 0.4
            }]
        };
    };
    const profileWeightChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#fff' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#fff' } }
        },
        plugins: { legend: { labels: { color: '#fff' } } }
    };

    // Add this useEffect to handle URL parameters for notification navigation
    useEffect(() => {
        // Parse URL parameters using React Router's location
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get('tab');
        const activityId = queryParams.get('activityId');
        const commentId = queryParams.get('commentId');
        
        // If tab parameter exists, switch to that tab
        if (tab) {
            setActiveTab(tab);
        }
        
        // If activityId exists, set it to be highlighted
        if (activityId) {
            setHighlightedActivityId(activityId);
            // If there's also a commentId, set it to be highlighted as well
            if (commentId) {
                setHighlightedCommentId(commentId);
                // Open the comments for this activity
                setExpandedComments(prev => ({
                    ...prev,
                    [activityId]: true
                }));
            }
        }
    }, [location.search]);
    
    // Add this effect to scroll to the activity when it's loaded
    useEffect(() => {
        // Check if there's a highlighted activity and the activities are loaded
        if (highlightedActivityId && userActivities && userActivities.length > 0) {
            // Small timeout to ensure the DOM has updated
            setTimeout(() => {
                // Get the ref for the highlighted activity
                const activityElement = activityRefs.current[highlightedActivityId];
                if (activityElement) {
                    // Scroll to the activity with some padding at the top
                    activityElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Add a highlight class temporarily
                    activityElement.classList.add('activity-highlight');
                    setTimeout(() => {
                        activityElement.classList.remove('activity-highlight');
                    }, 3000);
                    
                    // If there's a comment to highlight, scroll to it
                    if (highlightedCommentId) {
                        // Small additional timeout to ensure comments have rendered
                        setTimeout(() => {
                            const commentElement = document.getElementById(`comment-${highlightedCommentId}`);
                            if (commentElement) {
                                commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                commentElement.classList.add('comment-highlight');
                                setTimeout(() => {
                                    commentElement.classList.remove('comment-highlight');
                                }, 3000);
                            }
                        }, 500);
                    }
                }
            }, 300);
        }
    }, [highlightedActivityId, highlightedCommentId, userActivities, activeTab]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Decode the JWT token to get user ID
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUser(tokenPayload);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Decode the JWT token to get user ID and email
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUser(tokenPayload);
            
            // Check if viewing own profile or someone else's
            if (profileEmail && tokenPayload.email !== profileEmail) {
                setIsOwnProfile(false);
            } else {
                setIsOwnProfile(true);
            }
        }
    }, [profileEmail]);

    useEffect(() => {
        if (activeTab === 'activity' && user) {
            setActivitiesLoading(true);
            fetchUserActivities();
        }
    }, [activeTab, user]);

    const fetchUserActivities = useCallback(async () => {
        try {
            console.log("Starting to fetch user activities");
            setActivitiesLoading(true);
            
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("No token found, aborting fetchUserActivities");
                return;
            }
            
            // Get current user ID from JWT token for reaction checking
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentUserId = tokenPayload.userId;
            const currentUserEmail = tokenPayload.email;
            
            // Use query parameter to get activities for the specific user
            const targetEmail = profileEmail && !isOwnProfile ? profileEmail : undefined;
            const queryParam = targetEmail ? `?email=${targetEmail}` : '';
            
            console.log("Making API request to fetch activities");
            const response = await axios.get(`${API_URL}api/activity${queryParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Extract activities data from the response
            // The new API format returns activities inside a response.data.activities property
            const activitiesData = response.data.activities || response.data;
            
            console.log("User activities received:", activitiesData ? activitiesData.length : 0);
            
            // Check if we have valid activities data before mapping
            if (!activitiesData || !Array.isArray(activitiesData)) {
                console.error("Invalid activities data received:", response.data);
                setActivitiesLoading(false);
                return;
            }
            
            // Process activities to extract current user's reactions and update profile pictures
            const activitiesWithUserReactions = activitiesData.map(activity => {
                // Check for user reactions
                const userReactions = [];
                
                // Safely iterate through reactions if they exist
                if (activity.reactions && Array.isArray(activity.reactions)) {
                    for (const reaction of activity.reactions) {
                        if (reaction.userId && reaction.userId._id && reaction.userId._id.toString() === currentUserId) {
                            userReactions.push(reaction.reactionType);
                        }
                    }
                }
                
                // Create updated activity with user reactions
                let updatedActivity = { ...activity, userReactions };
                
                // If this is the current user's activity, sync it with latest profile picture
                if (user && activity.userEmail === user.email) {
                    updatedActivity.userProfilePicture = user.profilePicture || "";
                }
                
                return updatedActivity;
            });
            
            setUserActivities(activitiesWithUserReactions);
            setActivitiesLoading(false);
        } catch (error) {
            console.error('Error fetching activities:', error);
            if (error.response) {
                console.error('Server response:', error.response.status, error.response.data);
            }
            setActivitiesLoading(false);
        }
    }, [profileEmail, isOwnProfile, user]);

    const fetchUserRanks = useCallback(async (email) => {
        try {
            console.log("Fetching user ranks for:", email);
            // The backend will use the user's actual course from the database, but we'll still pass it from frontend
            const response = await axios.get(`${API_URL}api/leaderboard/user-ranks/${email}`);
            console.log("User ranks data:", response.data);
            setUserRanks(response.data);
        } catch (error) {
            console.error('Error fetching user ranks:', error);
            // Set empty ranks to avoid showing loading forever
            setUserRanks({
                weightLoss: { rank: 0, total: 0 },
                strength: { rank: 0, total: 0 },
                consistency: { rank: 0, total: 0 },
                hybrid: { rank: 0, total: 0 }
            });
        }
    }, []);

    const fetchUserProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                Swal.fire({
                    title: 'Authentication Required',
                    text: 'Please sign in to view profiles',
                    icon: 'warning',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< SIGN IN >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/signin');
                    }
                });
                return;
            }

            // If profileEmail exists, fetch that user's profile, otherwise fetch current user's profile
            const endpoint = profileEmail 
                ? `${API_URL}api/profile/${profileEmail}` 
                : `${API_URL}api/profile`;
                
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(response.data);
            await fetchUserRanks(response.data.email);
            
            setEditedInfo({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                course: response.data.course,
                height: response.data.height,
                weight: response.data.weight,
                gender: response.data.gender,
                age: response.data.age,
                phoneNumber: response.data.phoneNumber
            });
            setLoading(false);

        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
            
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                Swal.fire({
                    title: '[ SESSION EXPIRED ]',
                    text: 'Your session has expired. Please sign in again.',
                    icon: 'warning',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< SIGN IN >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/signin');
                    }
                });
            } else {
                Swal.fire({
                    title: '[ ERROR ]',
                    text: 'Failed to load profile data. Please try again.',
                    icon: 'error',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< OK >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                });
            }
        }
    }, [navigate, fetchUserRanks, profileEmail]);

    // Utility functions first
    // Calculate streak from workout data
    const calculateStreak = (workouts) => {
        if (!workouts || workouts.length === 0) return 0;
        
        // Sort workouts by date in descending order (newest first)
        const sortedWorkouts = [...workouts].sort((a, b) => 
            new Date(b.completedDate) - new Date(a.completedDate)
        );

        let currentStreak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let lastWorkout = new Date(sortedWorkouts[0].completedDate);
        lastWorkout.setHours(0, 0, 0, 0);

        // If the most recent workout is more than a day old, streak is broken
        const daysSinceLastWorkout = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));
        if (daysSinceLastWorkout > 1) return 0;

        // Count consecutive days
        for (let i = 1; i < sortedWorkouts.length; i++) {
            const currentDate = new Date(sortedWorkouts[i - 1].completedDate);
            const prevDate = new Date(sortedWorkouts[i].completedDate);
            currentDate.setHours(0, 0, 0, 0);
            prevDate.setHours(0, 0, 0, 0);

            const dayDifference = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
            if (dayDifference === 1) {
                currentStreak++;
            } else {
                break;
            }
        }

        return currentStreak;
    };

    // Check if user has been consistently losing weight for 3 months
    const checkSteadyCutter = (weightData) => {
        if (!weightData || weightData.length < 2) return false;
        
        // Get entries from the last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const recentEntries = weightData.filter(entry => 
            new Date(entry.date) >= threeMonthsAgo
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Need at least 2 entries in the last 3 months
        if (recentEntries.length < 2) return false;
        
        // Check if there's a general downward trend
        const firstEntry = recentEntries[0];
        const lastEntry = recentEntries[recentEntries.length - 1];
        
        // Calculate time difference in days
        const daysDifference = Math.round(
            (new Date(lastEntry.date) - new Date(firstEntry.date)) / (1000 * 60 * 60 * 24)
        );
        
        // Must span at least 30 days and show weight loss
        return daysDifference >= 30 && lastEntry.weight < firstEntry.weight;
    };

    // Function to show achievement details
    const handleAchievementClick = (achievement) => {
        setSelectedAchievement(achievement);
    };
    
    // Function to close achievement popup
    const closeAchievementPopup = () => {
        setSelectedAchievement(null);
    };

    // Create activity for an unlocked achievement
    const createAchievementActivity = async (achievement) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token available for creating achievement activity');
                return false;
            }
            
            console.log(`Creating activity for unlocked achievement: ${achievement.title}`, achievement);
            
            const response = await axios.post(`${API_URL}api/activity/achievement`, {
                achievementId: achievement.id,
                achievementTitle: achievement.title,
                achievementDescription: achievement.description,
                achievementIcon: achievement.badge,
                achievementCategory: achievement.category || 'weightLoss'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Achievement activity created:', response.data);
            return true;
        } catch (error) {
            console.error(`Error creating activity for achievement ${achievement.id}:`, error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            return false;
        }
    };

    // Check for newly unlocked achievements
    const checkForNewlyUnlockedAchievements = async (newAchievements, category) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            console.log(`Checking for newly unlocked ${category} achievements...`);
            
            // Get previously recorded achievements from localStorage
            const previouslyUnlockedMap = JSON.parse(localStorage.getItem('unlockedAchievements') || '{}');
            let activityCreated = false;
            
            // Check each achievement
            for (const achievement of newAchievements) {
                // If it's newly unlocked (unlocked but not in our record)
                if (achievement.unlocked && !previouslyUnlockedMap[achievement.id]) {
                    console.log(`New achievement unlocked: ${achievement.title}`);
                    
                    // Create activity in the database
                    const success = await createAchievementActivity(achievement);
                    
                    // Only mark as recorded if successfully saved to database
                    if (success) {
                        previouslyUnlockedMap[achievement.id] = true;
                        activityCreated = true;
                    }
                }
            }
            
            // Save updated records to localStorage
            localStorage.setItem('unlockedAchievements', JSON.stringify(previouslyUnlockedMap));
            
            // Refresh activities if any were created, regardless of active tab
            if (activityCreated) {
                console.log("Refreshing activities after creating new achievement activities");
                await fetchUserActivities();
            }
            
            return activityCreated;
        } catch (error) {
            console.error(`Error checking for newly unlocked ${category} achievements:`, error);
            return false;
        }
    };

    // Achievement fetching function
    const fetchAchievements = useCallback(async () => {
        try {
            setAchievementsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) return;
            
            // Use the correct profile endpoint based on whether viewing own or another's profile
            const targetEmail = profileEmail && !isOwnProfile ? profileEmail : undefined;
            const queryParam = targetEmail ? `?email=${targetEmail}` : '';
            
            // Make all API calls in parallel rather than sequentially
            const [profileResponse, weightResponse, strengthResponse, workoutResponse] = await Promise.all([
                // Profile API call
                axios.get(
                    profileEmail && !isOwnProfile
                    ? `${API_URL}api/profile/${profileEmail}`
                    : `${API_URL}api/profile`,
                    { headers: { Authorization: `Bearer ${token}` } }
                ),
                
                // Weight history API call
                axios.get(`${API_URL}api/weight/history${queryParam}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                
                // Strength data API call
                axios.get(`${API_URL}api/weight/total-lifted${queryParam}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                
                // Workout data API call
                axios.get(`${API_URL}api/workouts/completed${queryParam}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            
            // Continue with the rest of the function as before...
            // Calculate weight loss achievements
            const weightData = weightResponse.data;
            let startWeight = profileResponse.data.initialWeight;
            let currentWeight = profileResponse.data.weight;
            
            // If initial weight is not set in profile, try to get it from weight history
            if (!startWeight && weightData && weightData.length > 0) {
                const sortedEntries = [...weightData].sort((a, b) => new Date(a.date) - new Date(b.date));
                startWeight = sortedEntries[0].weight;
            }
            
            // If we have weight history, use the most recent entry for current weight
            if (weightData && weightData.length > 0) {
                const sortedEntries = [...weightData].sort((a, b) => new Date(b.date) - new Date(a.date));
                const newestEntry = sortedEntries[0];
                if (newestEntry) {
                    currentWeight = newestEntry.weight;
                }
            }
            
            startWeight = Number(startWeight);
            currentWeight = Number(currentWeight);
            
            const totalWeightLoss = startWeight > currentWeight ? startWeight - currentWeight : 0;
            
            // Define weight loss achievements with badge images
            const weightLossAchievements = [
                {
                    id: 'firstStepStaken',
                    title: "First Step Staken",
                    description: "Lose 1kg",
                    threshold: 1,
                    unlocked: totalWeightLoss >= 1,
                    badge: badge1kg,
                    unlockDate: totalWeightLoss >= 1 ? new Date().toISOString() : null,
                    category: 'weightLoss'
                },
                {
                    id: 'sheddingPounds',
                    title: "Shedding Pounds",
                    description: "Lose 3kg",
                    threshold: 3,
                    unlocked: totalWeightLoss >= 3,
                    badge: badge2kg,
                    unlockDate: totalWeightLoss >= 3 ? new Date().toISOString() : null,
                    category: 'weightLoss'
                },
                {
                    id: 'gettingLean',
                    title: "Getting Lean",
                    description: "Lose 5kg",
                    threshold: 5,
                    unlocked: totalWeightLoss >= 5,
                    badge: badge5kg,
                    unlockDate: totalWeightLoss >= 5 ? new Date().toISOString() : null,
                    category: 'weightLoss'
                },
                {
                    id: 'transformationMode',
                    title: "Transformation Mode",
                    description: "Lose 10kg",
                    threshold: 10,
                    unlocked: totalWeightLoss >= 10,
                    badge: badge10kg,
                    unlockDate: totalWeightLoss >= 10 ? new Date().toISOString() : null,
                    category: 'weightLoss'
                },
                {
                    id: 'peakPhysique',
                    title: "Peak Physique",
                    description: "Lose 15kg",
                    threshold: 15,
                    unlocked: totalWeightLoss >= 15,
                    badge: badge15kg,
                    unlockDate: totalWeightLoss >= 15 ? new Date().toISOString() : null,
                    category: 'weightLoss'
                },
                {
                    id: 'steadyCutter',
                    title: "Steady Cutter",
                    description: "Lose weight consistently for 3 months",
                    threshold: null,
                    unlocked: checkSteadyCutter(weightData),
                    badge: badgeSteady,
                    unlockDate: checkSteadyCutter(weightData) ? new Date().toISOString() : null,
                    category: 'weightLoss'
                }
            ];
            
            // Get total weight lifted for strength achievements
            const totalWeightLifted = strengthResponse.data.totalWeightLifted || 0;
            
            // Define strength achievements with badge images
            const strengthAchievements = [
                {
                    id: 'rookieLifter',
                    title: "Rookie Lifter",
                    description: "Lift a total of 5,000 kg",
                    threshold: 5000,
                    unlocked: totalWeightLifted >= 5000,
                    badge: rookieBadge,
                    unlockDate: totalWeightLifted >= 5000 ? new Date().toISOString() : null,
                    category: 'strength'
                },
                {
                    id: 'casualBeast',
                    title: "Casual Beast",
                    description: "Lift a total of 10,000 kg",
                    threshold: 10000,
                    unlocked: totalWeightLifted >= 10000,
                    badge: casualBadge,
                    unlockDate: totalWeightLifted >= 10000 ? new Date().toISOString() : null,
                    category: 'strength'
                },
                {
                    id: 'powerhouse',
                    title: "Powerhouse",
                    description: "Lift a total of 50,000 kg",
                    threshold: 50000,
                    unlocked: totalWeightLifted >= 50000,
                    badge: powerBadge,
                    unlockDate: totalWeightLifted >= 50000 ? new Date().toISOString() : null,
                    category: 'strength'
                },
                {
                    id: 'eliteLifter',
                    title: "Elite Lifter",
                    description: "Lift a total of 100,000 kg",
                    threshold: 100000,
                    unlocked: totalWeightLifted >= 100000,
                    badge: eliteBadge,
                    unlockDate: totalWeightLifted >= 100000 ? new Date().toISOString() : null,
                    category: 'strength'
                },
                {
                    id: 'titanMode',
                    title: "Titan Mode",
                    description: "Lift a total of 250,000 kg",
                    threshold: 250000,
                    unlocked: totalWeightLifted >= 250000,
                    badge: titanBadge,
                    unlockDate: totalWeightLifted >= 250000 ? new Date().toISOString() : null,
                    category: 'strength'
                },
                {
                    id: 'maxedOut',
                    title: "Maxed Out",
                    description: "Lift your body weight in a single rep",
                    threshold: null,
                    unlocked: false, // This will be implemented in the future
                    badge: maxedBadge,
                    unlockDate: null,
                    category: 'strength'
                }
            ];
            
            // Get completed workouts for streak calculation
            const completedWorkouts = workoutResponse.data;
            const currentStreak = calculateStreak(completedWorkouts);
            
            // Define consistency achievements with badge images
            const consistencyAchievements = [
                {
                    id: 'oneStep',
                    title: "One step at a time",
                    description: "Workout 3 days in a row",
                    threshold: 3,
                    unlocked: currentStreak >= 3,
                    badge: oneStepBadge,
                    unlockDate: currentStreak >= 3 ? new Date().toISOString() : null,
                    category: 'consistency'
                },
                {
                    id: 'streakStarter',
                    title: "Streak Starter",
                    description: "Workout 7 days in a row",
                    threshold: 7,
                    unlocked: currentStreak >= 7,
                    badge: streakStarterBadge,
                    unlockDate: currentStreak >= 7 ? new Date().toISOString() : null,
                    category: 'consistency'
                },
                {
                    id: 'grindingHard',
                    title: "Grinding Hard",
                    description: "Workout 15 days in a row",
                    threshold: 15,
                    unlocked: currentStreak >= 15,
                    badge: grindingHardBadge,
                    unlockDate: currentStreak >= 15 ? new Date().toISOString() : null,
                    category: 'consistency'
                },
                {
                    id: 'unstoppable',
                    title: "Unstoppable",
                    description: "Workout 30 days in a row",
                    threshold: 30,
                    unlocked: currentStreak >= 30,
                    badge: unstoppableBadge,
                    unlockDate: currentStreak >= 30 ? new Date().toISOString() : null,
                    category: 'consistency'
                },
                {
                    id: 'relentless',
                    title: "Relentless",
                    description: "60 day workout streak",
                    threshold: 60,
                    unlocked: currentStreak >= 60,
                    badge: relentlessBadge,
                    unlockDate: currentStreak >= 60 ? new Date().toISOString() : null,
                    category: 'consistency'
                }
            ];
            
            // Calculate hybrid score
            const hybridScore = totalWeightLifted + currentStreak;
            
            // Define hybrid achievements with badge images
            const hybridAchievements = [
                {
                    id: 'balancedWarrior',
                    title: "Balanced Warrior",
                    description: "Score 5,000 total points",
                    threshold: 5000,
                    unlocked: hybridScore >= 5000,
                    badge: balancedWarriorBadge,
                    unlockDate: hybridScore >= 5000 ? new Date().toISOString() : null,
                    category: 'hybrid'
                },
                {
                    id: 'eliteAthlete',
                    title: "Elite Athlete",
                    description: "Score 10,000 points",
                    threshold: 10000,
                    unlocked: hybridScore >= 10000,
                    badge: eliteAthleteBadge,
                    unlockDate: hybridScore >= 10000 ? new Date().toISOString() : null,
                    category: 'hybrid'
                },
                {
                    id: 'dominator',
                    title: "Dominator",
                    description: "Score 25,000 points",
                    threshold: 25000,
                    unlocked: hybridScore >= 25000,
                    badge: dominatorBadge,
                    unlockDate: hybridScore >= 25000 ? new Date().toISOString() : null,
                    category: 'hybrid'
                }
            ];
            
            // Save updated unlocked achievements to localStorage
            const previouslyUnlockedMap = JSON.parse(localStorage.getItem('unlockedAchievements') || '{}');
            localStorage.setItem('unlockedAchievements', JSON.stringify(previouslyUnlockedMap));
            
            // Set the state variables first
            setWeightLossAchievements(weightLossAchievements);
            setStrengthAchievements(strengthAchievements);
            setConsistencyAchievements(consistencyAchievements);
            setHybridAchievements(hybridAchievements);
            
            // Check for newly unlocked achievements for each category
            const weightLossActivities = await checkForNewlyUnlockedAchievements(weightLossAchievements, 'weightLoss');
            const strengthActivities = await checkForNewlyUnlockedAchievements(strengthAchievements, 'strength');
            const consistencyActivities = await checkForNewlyUnlockedAchievements(consistencyAchievements, 'consistency');
            const hybridActivities = await checkForNewlyUnlockedAchievements(hybridAchievements, 'hybrid');
            
            // If any new activities were created and we're in the activity tab, refresh the activity feed
            if ((weightLossActivities || strengthActivities || consistencyActivities || hybridActivities) && activeTab === 'activity') {
                await fetchUserActivities();
            }
            
            setAchievementsLoading(false);
        } catch (error) {
            console.error('Error fetching achievements:', error);
            setAchievementsLoading(false);
        }
    }, [profileEmail, isOwnProfile]);

    // Function to refresh achievement activities
    const refreshAchievementActivities = async () => {
        try {
            console.log("Refreshing achievement activities");
            setActivitiesLoading(true);
            
            // Get token
            const token = localStorage.getItem('token');
            if (!token) return;
            
            // First, clean up any duplicate achievements
            try {
                const cleanupResponse = await axios.get(`${API_URL}api/activity/cleanup-duplicates`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Cleanup response:', cleanupResponse.data);
            } catch (cleanupError) {
                console.error('Error cleaning up duplicates:', cleanupError);
            }
            
            // Only create rank activities when viewing your own profile
            if (isOwnProfile && userRanks) {
                console.log("Checking for top ranks to create activities");
                
                // Check weightLoss rank
                if (userRanks.weightLoss && userRanks.weightLoss.rank > 0 && userRanks.weightLoss.rank <= 3) {
                    console.log(`User has top ${userRanks.weightLoss.rank} rank in weightLoss`);
                    await createRankActivity(userRanks.weightLoss.rank, 'weightLoss');
                }
                
                // Check strength rank
                if (userRanks.strength && userRanks.strength.rank > 0 && userRanks.strength.rank <= 3) {
                    console.log(`User has top ${userRanks.strength.rank} rank in strength`);
                    await createRankActivity(userRanks.strength.rank, 'strength');
                }
                
                // Check consistency rank
                if (userRanks.consistency && userRanks.consistency.rank > 0 && userRanks.consistency.rank <= 3) {
                    console.log(`User has top ${userRanks.consistency.rank} rank in consistency`);
                    await createRankActivity(userRanks.consistency.rank, 'consistency');
                }
                
                // Check hybrid rank
                if (userRanks.hybrid && userRanks.hybrid.rank > 0 && userRanks.hybrid.rank <= 3) {
                    console.log(`User has top ${userRanks.hybrid.rank} rank in hybrid`);
                    await createRankActivity(userRanks.hybrid.rank, 'hybrid');
                }
            }
            
            // Only create achievement activities when viewing your own profile
            if (isOwnProfile) {
                // Get all unlocked achievements from all categories
                const allUnlockedAchievements = [
                    ...weightLossAchievements.filter(a => a.unlocked),
                    ...strengthAchievements.filter(a => a.unlocked),
                    ...consistencyAchievements.filter(a => a.unlocked),
                    ...hybridAchievements.filter(a => a.unlocked)
                ];
                
                console.log(`Found ${allUnlockedAchievements.length} unlocked achievements to refresh`);
                
                // Clear the achievement tracking in localStorage to force recreation
                localStorage.removeItem('unlockedAchievements');
                
                // Create activities for all unlocked achievements
                let activityCreated = false;
                for (const achievement of allUnlockedAchievements) {
                    const success = await createAchievementActivity(achievement);
                    if (success) {
                        activityCreated = true;
                    }
                }
            }
            
            // Always fetch activities after checking/creating rank and achievement activities
            await fetchUserActivities();
            
            setActivitiesLoading(false);
            
            // Reset the ref to allow refreshing again
            activityTabLoadedRef.current = false;
        } catch (error) {
            console.error("Error refreshing achievement activities:", error);
            setActivitiesLoading(false);
        }
    };

    // Add a function to force refresh of all activity profiles
    const forceRefreshAllActivities = async () => {
        try {
            console.log("Force refreshing all activities");
            setActivitiesLoading(true);
            // Reset filtered activities when refreshing
            setFilteredActivities(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                setActivitiesLoading(false);
                return;
            }
            
            // Determine if we're viewing own profile or someone else's
            const targetEmail = profileEmail && !isOwnProfile ? profileEmail : undefined;
            const queryParam = targetEmail ? `?email=${targetEmail}` : '';
            
            // First refresh activities
            const activityResponse = await axios.get(`${API_URL}api/activity${queryParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update activities with fresh data
            const activitiesData = activityResponse.data.activities || activityResponse.data;
            
            // Get current user ID from JWT token for reaction checking
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentUserId = tokenPayload.userId;
            const currentUserEmail = tokenPayload.email;
            
            // Process activities to extract current user's reactions and update profile pictures
            if (activitiesData && Array.isArray(activitiesData)) {
                const activitiesWithUserReactions = activitiesData.map(activity => {
                    // Check for user reactions
                    const userReactions = [];
                    
                    // Safely iterate through reactions if they exist
                    if (activity.reactions && Array.isArray(activity.reactions)) {
                        for (const reaction of activity.reactions) {
                            if (reaction.userId && reaction.userId._id && reaction.userId._id.toString() === currentUserId) {
                                userReactions.push(reaction.reactionType);
                            }
                        }
                    }
                    
                    // Ensure profile picture is updated for user's own activities
                    let updatedActivity = { ...activity, userReactions };
                    
                    // If this is the current user's activity, sync it with latest profile picture
                    if (user && activity.userEmail === user.email) {
                        updatedActivity.userProfilePicture = user.profilePicture || "";
                    }
                    
                    return updatedActivity;
                });
                
                setUserActivities(activitiesWithUserReactions);
            }
            
            setActivitiesLoading(false);
            
            // Reset any select dropdowns to "all"
            const filterDropdown = document.querySelector('.activity-filter-dropdown');
            if (filterDropdown) {
                filterDropdown.value = 'all';
            }
            
            console.log("Activities refreshed successfully");
        } catch (error) {
            console.error('Error refreshing activities:', error);
            setActivitiesLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [profileEmail]);

    useEffect(() => {
        if (user) {
            fetchAchievements();
        }
    }, [user, fetchAchievements]);

    useEffect(() => {
        if (user && user.email) {
            fetchUserRanks(user.email);
        }
    }, [user?.email, fetchUserRanks]);
    
    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(selectedFile);

        // Cleanup
        return () => {
            fileReader.abort();
        };
    }, [selectedFile]);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                Swal.fire({
                    title: '[ FILE TOO LARGE ]',
                    text: 'Profile picture must be less than 5MB',
                    icon: 'error',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< OK >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                });
                event.target.value = null; // Reset file input
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
            if (!validTypes.includes(file.type)) {
                Swal.fire({
                    title: '[ INVALID FILE TYPE ]',
                    text: 'Supported formats: JPG, PNG, GIF, WebP, BMP, TIFF',
                    icon: 'error',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< OK >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                });
                event.target.value = null;
                return;
            }

            setSelectedFile(file);
            setIsEditingPhoto(true); 
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            const result = await Swal.fire({
                title: '[ UPLOAD PHOTO ]',
                text: 'Do you want to upload this photo as your profile picture?',
                icon: 'question',
                background: 'rgba(16, 16, 28, 0.95)',
                showCancelButton: true,
                confirmButtonText: '< UPLOAD >',
                cancelButtonText: '< CANCEL >',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm',
                    cancelButton: 'swal2-cancel'
                }
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem("token");
                const formData = new FormData();
                formData.append("profilePicture", selectedFile);

                const response = await axios.post(`${API_URL}api/profile/upload-profile`, 
                    formData,
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
                
                setUser(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
                setIsEditingPhoto(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                
                // Create profile update activity
                try {
                    await axios.post(
                        `${API_URL}api/activity/achievement`,
                        {
                            achievementId: 'profilePictureUpdate-' + Date.now(),
                            achievementTitle: 'Updated Profile Picture',
                            achievementDescription: 'Looking good! Profile picture updated.',
                            achievementCategory: 'profile'
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    // Refresh activities if we're on the activity tab
                    if (activeTab === 'activity') {
                        await forceRefreshAllActivities();
                    }
                } catch (activityError) {
                    console.error('Error creating profile picture activity:', activityError);
                }

                await Swal.fire({
                    title: '[ SUCCESS ]',
                    text: 'Profile picture updated successfully!',
                    icon: 'success',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< OK >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                Swal.fire({
                    title: 'Session Expired',
                    text: 'Please sign in again to continue',
                    icon: 'info',
                    confirmButtonText: 'Sign In'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/signin');
                    }
                });
            } else {
                Swal.fire({
                    title: 'Upload Failed',
                    text: error.response?.data?.error || 'Failed to upload profile picture',
                    icon: 'error'
                });
            }
        }
    };

    const handleDelete = async () => {
        try {
            const result = await Swal.fire({
                title: '[ DELETE PHOTO ]',
                text: 'Are you sure you want to delete your profile picture?',
                icon: 'warning',
                background: 'rgba(16, 16, 28, 0.95)',
                showCancelButton: true,
                confirmButtonText: '< DELETE >',
                cancelButtonText: '< CANCEL >',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm',
                    cancelButton: 'swal2-cancel'
                }
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem("token");
                await axios.delete(`${API_URL}api/profile/delete-profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setUser(prev => ({ ...prev, profilePicture: "" }));
                setIsEditingPhoto(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                
                // Create profile update activity for deletion
                try {
                    await axios.post(
                        `${API_URL}api/activity/achievement`,
                        {
                            achievementId: 'profilePictureDelete-' + Date.now(),
                            achievementTitle: 'Deleted Profile Picture',
                            achievementDescription: 'Profile picture removed.',
                            achievementCategory: 'profile'
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    // Refresh activities feed
                    await forceRefreshAllActivities();
                } catch (activityError) {
                    console.error('Error creating profile picture deletion activity:', activityError);
                }

                await Swal.fire({
                    title: '[ SUCCESS ]',
                    text: 'Profile picture deleted successfully!',
                    icon: 'success',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< OK >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                });
            }
        } catch (error) {
            console.error("Error deleting profile picture:", error);
            Swal.fire({
                title: '[ ERROR ]',
                text: 'Failed to delete profile picture. Please try again.',
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonText: '< OK >',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm'
                }
            });
        }
    };

    const cancelEdit = () => {
        setIsEditingPhoto(false);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleUpdateInfo = async () => {
        try {
            // Validate phone number format
            if (editedInfo.phoneNumber && !validatePhoneNumber(editedInfo.phoneNumber)) {
                setPhoneError('Please enter a valid phone number (format: +639XXXXXXXXX)');
                return;
            }

            // Validate first name length
            if (editedInfo.firstName.length > 20) {
                setFirstNameError('First name cannot exceed 20 characters');
                return;
            }

            // Validate last name length
            if (editedInfo.lastName.length > 20) {
                setLastNameError('Last name cannot exceed 20 characters');
                return;
            }

            // Validate height
            if (editedInfo.height < 140 || editedInfo.height > 250) {
                setHeightError('Height must be between 140-250 cm');
                return;
            }
            
            // Validate age
            if (editedInfo.age < 16 || editedInfo.age > 100) {
                setAgeError('Age must be between 16-100 y/o');
                return;
            }
            
            setPhoneError('');
            setFirstNameError('');
            setLastNameError('');
            setHeightError('');
            setAgeError('');

            const token = localStorage.getItem("token");
            if (!token) {
                Swal.fire({
                    title: '[ SESSION EXPIRED ]',
                    text: 'Your session has expired. Please sign in again.',
                    icon: 'warning',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< SIGN IN >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/signin');
                    }
                });
                return;
            }

            // Check if any information has changed
            const hasChanges = Object.keys(editedInfo).some(key => {
                if (key === 'height' || key === 'weight' || key === 'age') {
                    // Convert to numbers for proper comparison
                    return Number(editedInfo[key]) !== Number(user[key]);
                }
                return editedInfo[key] !== user[key];
            });

            if (!hasChanges) {
                setIsEditingInfo(false);
                return;
            }

            const response = await axios.put(
                `${API_URL}api/profile/update-info`,
                editedInfo,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUser(prevUser => ({
                ...prevUser,
                ...response.data
            }));

            setIsEditingInfo(false);

            Swal.fire({
                title: '[ SUCCESS ]',
                text: 'Profile information updated successfully!',
                icon: 'success',
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonText: '< OK >',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm'
                }
            });
        } catch (error) {
            let errorMessage = 'Failed to update profile information';
            
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                Swal.fire({
                    title: '[ SESSION EXPIRED ]',
                    text: 'Your session has expired. Please sign in again.',
                    icon: 'warning',
                    background: 'rgba(16, 16, 28, 0.95)',
                    confirmButtonText: '< SIGN IN >',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/signin');
                    }
                });
                return;
            } else if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            }
            
            Swal.fire({
                title: '[ ERROR ]',
                text: errorMessage,
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonText: '< OK >',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm'
                }
            });
        }
    };

    // Update the togglePrivacy function
    const togglePrivacy = async () => {
        try {
            const result = await Swal.fire({
                title: '[ CHANGE PRIVACY ]',
                text: `Are you sure you want to make your profile ${user.isPrivate ? 'public' : 'private'}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: user.isPrivate ? '< MAKE PUBLIC >' : '< MAKE PRIVATE >',  // Remove < > symbols
                cancelButtonText: '< CANCEL >',  // Simplified text
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonColor: '#00ff84',
                cancelButtonColor: '#ff4444',
                backdrop: `rgba(0,0,0,0.8)`
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                await axios.put(
                    `${API_URL}api/profile/toggle-privacy`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` }}
                );

                setUser(prev => ({
                    ...prev,
                    isPrivate: !prev.isPrivate
                }));

                await Swal.fire({
                    title: '[ SUCCESS ]',
                    text: `Profile is now ${!user.isPrivate ? 'private' : 'public'}`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: 'rgba(16, 16, 28, 0.95)'
                });
            }
        } catch (error) {
            console.error('Privacy toggle error:', error);
            Swal.fire({
                title: '[ ERROR ]',
                text: 'Failed to update privacy settings',
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)'
            });
        }
    };

    // Add validation function
    const validatePhoneNumber = (number) => {
        if (!number.startsWith('+63')) return false;
        const digits = number.slice(3);
        return digits.length === 10 && /^\d+$/.test(digits);
    };

    const handlePrivacyToggle = async () => {
        const result = await Swal.fire({
            title: 'Change Profile Privacy',
            text: `Are you sure you want to make your profile ${formData.isPrivate ? 'public' : 'private'}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            background: 'rgba(16, 16, 28, 0.95)',
            confirmButtonColor: '#00ff84',
            cancelButtonColor: '#ff4444'
        });

        if (result.isConfirmed) {
            setFormData(prev => ({
                ...prev,
                isPrivate: !prev.isPrivate
            }));
        }
    };

    // Update the renderMedal function to better align with text
    const renderMedal = (rank) => {
        let medal = null;
        if (rank === 1) medal = "👑";
        else if (rank === 2) medal = "🥈";
        else if (rank === 3) medal = "🥉";
        
        return medal ? <span className="rank-medal">{medal}</span> : null;
    };

    // Simplified renderRankDisplay function with better horizontal alignment
    const renderRankDisplay = (rankInfo, categoryName, icon) => {
        const { rank, total } = rankInfo || { rank: 0, total: 0 };
        
        return (
            <div className="rank-box">
                <div className="rank-box-title">
                    {icon}
                    <span>{categoryName}</span>
                </div>
                
                <div className="rank-box-content">
                    <div className="rank-value-container">
                        {rank > 0 ? (
                            <div className="rank-inline">
                                {rank <= 3 && renderMedal(rank)}
                                <span className={`rank-num ${rank <= 3 ? `top-${rank}` : ''}`}>{rank}</span>
                                <span className="rank-divider">/</span>
                                <span className="rank-total">{total}</span>
                            </div>
                        ) : (
                            <span className="no-ranking">Not Ranked</span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Handle reactions to activities
    const handleReaction = async (activityId, reactionType) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            setIsSubmittingComment(true); // Reuse this state to prevent multiple clicks
            
            const response = await axios.post(
                `${API_URL}api/activity/reaction`,
                { activityId, reactionType },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.status === 200) {
                // Update the reaction in the local state
                setUserActivities(prevActivities => 
                    prevActivities.map(activity => {
                        if (activity._id === activityId) {
                            return { 
                                ...activity, 
                                reactionCounts: response.data.reactionCounts,
                                userReactions: response.data.userReactions
                            };
                        }
                        return activity;
                    })
                );
            }
            
            setIsSubmittingComment(false);
        } catch (error) {
            console.error('Error handling reaction:', error);
            setIsSubmittingComment(false);
        }
    };

    // Improve the handleCommentSubmit function to be more robust against duplicates
    const handleCommentSubmit = async (activityId) => {
        try {
            if (!commentText[activityId] || !commentText[activityId].trim()) return;
            
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found for comment submission');
                return;
            }
            
            // Set loading state for this specific activity
            setCommentSubmitting(prev => ({
                ...prev,
                [activityId]: true
            }));
            
            const response = await axios.post(
                `${API_URL}api/activity/comment`,
                { activityId, content: commentText[activityId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data && response.data.comment) {
                // Update the activities state with the new comment
                setUserActivities(prevActivities => {
                    return prevActivities.map(activity => {
                        if (activity._id === activityId) {
                            return {
                                ...activity,
                                comments: [...(activity.comments || []), response.data.comment]
                            };
                        }
                        return activity;
                    });
                });
                
                // Clear the comment input
                setCommentText(prev => ({ ...prev, [activityId]: '' }));
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            if (error.response && error.response.data && error.response.data.duplicate) {
                console.log('Duplicate comment detected');
                // Clear the input anyway since it was a duplicate
                setCommentText(prev => ({ ...prev, [activityId]: '' }));
            }
        } finally {
            // Clear loading state
            setCommentSubmitting(prev => ({
                ...prev,
                [activityId]: false
            }));
        }
    };

    // Toggle comments visibility
    const toggleComments = (activityId) => {
        setExpandedComments(prev => ({
            ...prev,
            [activityId]: !prev[activityId]
        }));
    };

    // Add a function to check if user has top 3 rank in any category
    const hasTopThreeRank = useCallback(() => {
        if (!userRanks) return false;
        
        return (
            (userRanks.weightLoss && userRanks.weightLoss.rank <= 3 && userRanks.weightLoss.rank > 0) ||
            (userRanks.strength && userRanks.strength.rank <= 3 && userRanks.strength.rank > 0) ||
            (userRanks.consistency && userRanks.consistency.rank <= 3 && userRanks.consistency.rank > 0) ||
            (userRanks.hybrid && userRanks.hybrid.rank <= 3 && userRanks.hybrid.rank > 0)
        );
    }, [userRanks]);

    // Add function to get rank display for activity feed
    const getRankCategory = (rankType) => {
        switch(rankType) {
            case 'weightLoss': return 'Weight Loss';
            case 'strength': return 'Strength-Based';
            case 'consistency': return 'Consistency';
            case 'hybrid': return 'Hybrid';
            default: return rankType;
        }
    };

    // Add function to get rank emoji - keeping this for rendering ranks in the My Rankings tab
    const getRankEmoji = (rank) => {
        switch(rank) {
            case 1: return '👑';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '';
        }
    };

    // Create rank activity function
    const createRankActivity = async (rankNumber, rankCategory) => {
        try {
            if (!rankNumber || !rankCategory || rankNumber > 3) {
                console.log('Invalid rank parameters');
                return false;
            }
            
            const token = localStorage.getItem('token');
            if (!token) return false;
            
            // Get category display name
            const categoryName = getRankCategory(rankCategory);
            const rankEmoji = getRankEmoji(rankNumber);
            
            const rankTitle = `Achieved Rank ${rankNumber} ${rankEmoji}`;
            // Include the course in the description
            const rankDescription = `Congratulations on achieving rank ${rankNumber} in the ${categoryName} leaderboard${user && user.course ? ` on course ${user.course}` : ''}!`;
            
            console.log(`Creating rank activity: ${rankTitle} for category ${rankCategory}`);
            
            // Create rank activity via API
            const response = await axios.post(
                `${API_URL}api/activity/rank`,
                {
                    rankNumber,
                    rankCategory,
                    rankTitle,
                    rankDescription
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            console.log('Rank activity response:', response.data);
            
            if (response.status === 201) {
                console.log('Rank activity created successfully');
                return true;
            } else if (response.status === 200 && response.data.message === 'Rank activity already exists') {
                console.log('Rank activity already exists');
                return false;
            }
            
            return false;
        } catch (error) {
            console.error('Error creating rank activity:', error);
            return false;
        }
    };
    
    // Simple function that returns null - we're displaying rank activities in the main feed
    const renderRankActivities = useCallback(() => {
        return null;
    }, []);

    const filterActivities = (filterType) => {
        if (filterType === 'all') {
            setFilteredActivities(null); // Use the original userActivities
            return;
        }
        
        let filtered;
        switch (filterType) {
            case 'achievement':
                filtered = userActivities.filter(activity => 
                    activity.activityType === 'achievement' && activity.content.category !== 'profile'
                );
                break;
            case 'workout':
                filtered = userActivities.filter(activity => 
                    activity.activityType === 'workout' || 
                    (activity.activityType === 'achievement' && activity.content.category === 'workout')
                );
                break;
            case 'scheduled-workout':
                filtered = userActivities.filter(activity => 
                    activity.activityType === 'scheduled-workout'
                );
                break;
            case 'ranking':
                filtered = userActivities.filter(activity => 
                    activity.activityType === 'ranking'
                );
                break;
            case 'profile':
                filtered = userActivities.filter(activity => 
                    (activity.activityType === 'achievement' && activity.content.category === 'profile') ||
                    activity.activityType === 'profile-update'
                );
                break;
            default:
                filtered = userActivities;
        }
        
        setFilteredActivities(filtered);
        setShowActivityFilters(false); // Close dropdown after selection
    };

    // New function to render tab content
    const renderTabContent = () => {
        switch(activeTab) {
            case 'profile':
                return (
                    <div className="profile-info">
                        <div className="edit-button-container">
                            {!isEditingInfo && isOwnProfile && (
                                <button 
                                    className="edit-button" 
                                    onClick={() => {
                                        setEditedInfo({
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            course: user.course,
                                            height: user.height,
                                            weight: user.weight,
                                            gender: user.gender,
                                            age: user.age,
                                            phoneNumber: user.phoneNumber
                                        });
                                        setFirstNameError('');
                                        setLastNameError('');
                                        setHeightError('');
                                        setPhoneError('');
                                        setIsEditingInfo(true);
                                    }}
                                >
                                    Edit Information
                                </button>
                            )}
                        </div>

                        {isEditingInfo ? (
                            <div className="edit-info-form">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Email</label>
                                        <p>{user.email}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>First Name </label>
                                        <input
                                            type="text"
                                            value={editedInfo.firstName}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Only allow letters (no numbers or special characters)
                                                if (/^[A-Za-z\s]*$/.test(value)) {
                                                    if (value.length <= 20) {
                                                        setEditedInfo(prev => ({
                                                            ...prev,
                                                            firstName: value
                                                        }));
                                                        setFirstNameError('');
                                                    } else {
                                                        setFirstNameError('Maximum 20 characters allowed');
                                                    }
                                                }
                                            }}
                                            maxLength={20}
                                            placeholder="Max 20 characters"
                                            className={`edit-info-input ${firstNameError ? 'error' : ''}`}
                                        />
                                        {firstNameError && <div className="error-message">{firstNameError}</div>}
                                    </div>
                                    <div className="info-item">
                                        <label>Last Name </label>
                                        <input
                                            type="text"
                                            value={editedInfo.lastName}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Only allow letters (no numbers or special characters)
                                                if (/^[A-Za-z\s]*$/.test(value)) {
                                                    if (value.length <= 20) {
                                                        setEditedInfo(prev => ({
                                                            ...prev,
                                                            lastName: value
                                                        }));
                                                        setLastNameError('');
                                                    } else {
                                                        setLastNameError('Maximum 20 characters allowed');
                                                    }
                                                }
                                            }}
                                            maxLength={20}
                                            placeholder="Max 20 characters"
                                            className={`edit-info-input ${lastNameError ? 'error' : ''}`}
                                        />
                                        {lastNameError && <div className="error-message">{lastNameError}</div>}
                                    </div>

                                    <div className="info-item">
                                        <label>Gender</label>
                                        <select
                                            value={editedInfo.gender}
                                            onChange={(e) => setEditedInfo(prev => ({
                                                ...prev,
                                                gender: e.target.value
                                            }))}
                                            className="edit-info-input"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="info-item">
                                        <label>Age</label>
                                        <input
                                            type="number"
                                            value={editedInfo.age}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Restrict to 3 digits maximum
                                                if (value.length <= 3) {
                                                    setEditedInfo(prev => ({
                                                        ...prev,
                                                        age: value
                                                    }));
                                                    
                                                    if (value && (parseInt(value) < 16 || parseInt(value) > 100)) {
                                                        setAgeError('Age must be between 16-100 y/o');
                                                    } else {
                                                        setAgeError('');
                                                    }
                                                }
                                            }}
                                            min="16"
                                            max="100"
                                            placeholder="16-100 y/o"
                                            maxLength="3"
                                            className={`edit-info-input ${ageError ? 'error' : ''}`}
                                        />
                                        {ageError && <div className="error-message">{ageError}</div>}
                                    </div>

                                    <div className="info-item">
                                        <label>Phone Number</label>
                                        <p>{user.phoneNumber}</p>
                                    </div>
                                   
                                    <div className="info-item">
                                        <label>Course</label>
                                        <p>{user.course}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Height</label>
                                        <input
                                            type="number"
                                            value={editedInfo.height}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Restrict to 3 digits maximum
                                                if (value.length <= 3) {
                                                    setEditedInfo(prev => ({
                                                        ...prev,
                                                        height: value
                                                    }));
                                                    
                                                    if (value && (parseInt(value) < 140 || parseInt(value) > 250)) {
                                                        setHeightError('Height must be between 140-250 cm');
                                                    } else {
                                                        setHeightError('');
                                                    }
                                                }
                                            }}
                                            min="140"
                                            max="250"
                                            placeholder="140-250 cm"
                                            maxLength="3"
                                            className={`edit-info-input ${heightError ? 'error' : ''}`}
                                        />
                                        {heightError && <div className="error-message">{heightError}</div>}
                                    </div>
                                    <div className="info-item">
                                        <label>Weight (kg)</label>
                                        <p>{user.weight}</p>
                                    </div>
                                   
                                </div>
                                <div className="action-buttons">
                                    <button className="save-button" onClick={handleUpdateInfo}>
                                        Save Changes
                                    </button>
                                    <button className="cancel-button" onClick={() => setIsEditingInfo(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Email</label>
                                    <p>{user.email}</p>
                                </div>
                                <div className="info-item">
                                    <label>First Name</label>
                                    <p>{user.firstName}</p>
                                </div>
                                <div className="info-item">
                                    <label>Last Name</label>
                                    <p>{user.lastName}</p>
                                </div>
                                <div className="info-item">
                                    <label>Gender</label>
                                    <p>{user.gender}</p>
                                </div>
                                <div className="info-item">
                                    <label>Age</label>
                                    <p>{user.age}</p>
                                </div>
                                <div className="info-item">
                                    <label>Phone Number</label>
                                    <p>{user.phoneNumber}</p>
                                </div>
                                <div className="info-item">
                                    <label>Course</label>
                                    <p>{user.course}</p>
                                </div>
                                <div className="info-item">
                                    <label>Height</label>
                                    <p>{user.height} cm</p>
                                </div>
                                <div className="info-item">
                                    <label>Weight</label>
                                    <p>{user.weight} kg</p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'rankings':
                return (
                    <div className="my-rankings-section">
                        {userRanks ? (
                            <>
                                <div className="rankings-course">
                                    <FaGraduationCap className="course-icon" />
                                    <span>Course: {userRanks.course || user.course || "N/A"}</span>
                                </div>
                                <div className="rankings-grid">
                                    {renderRankDisplay(
                                        userRanks.weightLoss, 
                                        "Weight Loss", 
                                        <FaWeight className="rank-icon" />
                                    )}
                                    {renderRankDisplay(
                                        userRanks.strength, 
                                        "Strength-Based", 
                                        <FaDumbbell className="rank-icon" />
                                    )}
                                    {renderRankDisplay(
                                        userRanks.consistency, 
                                        "Consistency", 
                                        <FaCalendarCheck className="rank-icon" />
                                    )}
                                    {renderRankDisplay(
                                        userRanks.hybrid, 
                                        "Hybrid", 
                                        <FaSync className="rank-icon" />
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="loading-ranks">Loading rankings...</div>
                        )}
                    </div>
                );
            case 'achievements':
                if (user?.isPrivate && !isOwnProfile) {
                    return (
                        <div className="private-content-message">
                            <span className="lock-icon">🔒</span>
                            <h3>Achievements Not Available</h3>
                            <p>This profile is set to private. Achievements are only visible to the profile owner.</p>
                        </div>
                    );
                }
                return (
                    <div className="achievements-section">
                        {achievementsLoading ? (
                            <div className="loading-achievements">
                                <div className="loading-spinner"></div>
                                <p>Loading achievements...</p>
                                <p className="loading-message">This may take a moment as we calculate your progress</p>
                            </div>
                        ) : (
                            <div className="achievement-categories">
                                <div className="achievement-category">
                                    <h3>Weight Loss</h3>
                                    <div className="achievement-badges">
                                        {weightLossAchievements.map(achievement => (
                                            <div 
                                                key={achievement.id}
                                                className={`badge-item ${achievement.unlocked ? 'unlocked' : ''}`}
                                                onClick={() => handleAchievementClick(achievement)}
                                            >
                                                <img 
                                                    src={achievement.badge} 
                                                    alt={achievement.title} 
                                                    className="badge-image" 
                                                />
                                                {/* Tooltip for desktop hover */}
                                                <div className="badge-tooltip">
                                                    <div className="badge-tooltip-title">{achievement.title}</div>
                                                    <div className="badge-tooltip-desc">{achievement.description}</div>
                                                    {achievement.unlocked ? (
                                                        <div className="badge-tooltip-status">
                                                            ✅ Unlocked: {achievement.unlockDate || new Date().toLocaleDateString()}
                                                        </div>
                                                    ) : (
                                                        <div className="badge-tooltip-status locked">
                                                            ⚠️ Not unlocked yet
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="achievement-category">
                                    <h3>Strength</h3>
                                    <div className="achievement-badges">
                                        {strengthAchievements.map(achievement => (
                                            <div 
                                                key={achievement.id}
                                                className={`badge-item ${achievement.unlocked ? 'unlocked' : ''}`}
                                                onClick={() => handleAchievementClick(achievement)}
                                            >
                                                <img 
                                                    src={achievement.badge} 
                                                    alt={achievement.title} 
                                                    className="badge-image" 
                                                />
                                                {/* Tooltip for desktop hover */}
                                                <div className="badge-tooltip">
                                                    <div className="badge-tooltip-title">{achievement.title}</div>
                                                    <div className="badge-tooltip-desc">{achievement.description}</div>
                                                    {achievement.unlocked ? (
                                                        <div className="badge-tooltip-status">
                                                            ✅ Unlocked: {achievement.unlockDate || new Date().toLocaleDateString()}
                                                        </div>
                                                    ) : (
                                                        <div className="badge-tooltip-status locked">
                                                            ⚠️ Not unlocked yet
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="achievement-category">
                                    <h3>Consistency</h3>
                                    <div className="achievement-badges">
                                        {consistencyAchievements.map(achievement => (
                                            <div 
                                                key={achievement.id}
                                                className={`badge-item ${achievement.unlocked ? 'unlocked' : ''}`}
                                                onClick={() => handleAchievementClick(achievement)}
                                            >
                                                <img 
                                                    src={achievement.badge} 
                                                    alt={achievement.title} 
                                                    className="badge-image" 
                                                />
                                                {/* Tooltip for desktop hover */}
                                                <div className="badge-tooltip">
                                                    <div className="badge-tooltip-title">{achievement.title}</div>
                                                    <div className="badge-tooltip-desc">{achievement.description}</div>
                                                    {achievement.unlocked ? (
                                                        <div className="badge-tooltip-status">
                                                            ✅ Unlocked: {achievement.unlockDate || new Date().toLocaleDateString()}
                                                        </div>
                                                    ) : (
                                                        <div className="badge-tooltip-status locked">
                                                            ⚠️ Not unlocked yet
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="achievement-category">
                                    <h3>Hybrid</h3>
                                    <div className="achievement-badges">
                                        {hybridAchievements.map(achievement => (
                                            <div 
                                                key={achievement.id}
                                                className={`badge-item ${achievement.unlocked ? 'unlocked' : ''}`}
                                                onClick={() => handleAchievementClick(achievement)}
                                            >
                                                <img 
                                                    src={achievement.badge} 
                                                    alt={achievement.title} 
                                                    className="badge-image" 
                                                />
                                                {/* Tooltip for desktop hover */}
                                                <div className="badge-tooltip">
                                                    <div className="badge-tooltip-title">{achievement.title}</div>
                                                    <div className="badge-tooltip-desc">{achievement.description}</div>
                                                    {achievement.unlocked ? (
                                                        <div className="badge-tooltip-status">
                                                            ✅ Unlocked: {achievement.unlockDate || new Date().toLocaleDateString()}
                                                        </div>
                                                    ) : (
                                                        <div className="badge-tooltip-status locked">
                                                            ⚠️ Not unlocked yet
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'activity':
                if (user?.isPrivate && !isOwnProfile) {
                    return (
                        <div className="private-content-message">
                            <span className="lock-icon">🔒</span>
                            <h3>Activity Feed Not Available</h3>
                            <p>This profile is set to private. Activity feed is only visible to the profile owner.</p>
                        </div>
                    );
                }
                return (
                    <div className="activity-section">
                        {activitiesLoading ? (
                            <div className="loading-activities">
                                <div className="loading-spinner"></div>
                                <p>Loading activity feed...</p>
                                <p className="loading-message">This may take a moment as we retrieve your activities</p>
                            </div>
                        ) : (
                            <ErrorBoundary>
                                <div className="activity-feed-section">
                                    
                                    {userActivities.length === 0 && !hasTopThreeRank() ? (
                                        <div className="no-activities">
                                            <div className="activity-prompt">
                                                <p>You haven't unlocked any achievements yet.</p>
                                                <button 
                                                    className="refresh-activities-btn"
                                                    onClick={() => {
                                                        refreshAchievementActivities();
                                                        forceRefreshAllActivities();
                                                    }}
                                                >
                                                    Refresh Activities
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="refresh-container">
                                                <button 
                                                    className="refresh-activities-btn"
                                                    onClick={() => {
                                                        refreshAchievementActivities();
                                                        forceRefreshAllActivities();
                                                    }}
                                                >
                                                    Refresh Activities
                                                </button>
                                                
                                                <div className="profile-activity-filters">
                                                    <button 
                                                        className="profile-filter-toggle" 
                                                        onClick={() => setShowActivityFilters(!showActivityFilters)}
                                                    >
                                                        <FaFilter /> Filter Activities
                                                    </button>
                                                    
                                                    {showActivityFilters && (
                                                        <div className="profile-filter-dropdown">
                                                            <button 
                                                                className={`profile-filter-option ${filteredActivities === null ? 'active' : ''}`}
                                                                onClick={() => filterActivities('all')}
                                                            >
                                                                All Activities
                                                            </button>
                                                            <button 
                                                                className={`profile-filter-option ${filteredActivities?.every(a => a.activityType === 'achievement') ? 'active' : ''}`}
                                                                onClick={() => filterActivities('achievement')}
                                                            >
                                                                Achievements
                                                            </button>
                                                            <button 
                                                                className={`profile-filter-option ${filteredActivities?.every(a => a.activityType === 'workout' || (a.activityType === 'achievement' && a.content.category === 'workout')) ? 'active' : ''}`}
                                                                onClick={() => filterActivities('workout')}
                                                            >
                                                                Workouts
                                                            </button>
                                                            <button 
                                                                className={`profile-filter-option ${filteredActivities?.every(a => a.activityType === 'scheduled-workout') ? 'active' : ''}`}
                                                                onClick={() => filterActivities('scheduled-workout')}
                                                            >
                                                                Workout Schedules
                                                            </button>
                                                            <button 
                                                                className={`profile-filter-option ${filteredActivities?.every(a => a.activityType === 'ranking') ? 'active' : ''}`}
                                                                onClick={() => filterActivities('ranking')}
                                                            >
                                                                Rankings
                                                            </button>
                                                            <button 
                                                                className={`profile-filter-option ${filteredActivities?.every(a => (a.activityType === 'achievement' && a.content.category === 'profile') || a.activityType === 'profile-update') ? 'active' : ''}`}
                                                                onClick={() => filterActivities('profile')}
                                                            >
                                                                Profile Updates
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {(filteredActivities || userActivities).map(activity => {
                                                // Extract rank number if it's a ranking activity
                                                let rankNumber = 0;
                                                if (activity.activityType === 'ranking' && activity.content.achievementId) {
                                                    const parts = activity.content.achievementId.split('-');
                                                    if (parts.length >= 2) {
                                                        rankNumber = parseInt(parts[1]);
                                                    }
                                                }
                                                
                                                // Get rank name for display
                                                let rankName = '';
                                                if (rankNumber === 1) rankName = 'First Place';
                                                else if (rankNumber === 2) rankName = 'Second Place';
                                                else if (rankNumber === 3) rankName = 'Third Place';
                                                
                                                // Get course name
                                                const courseName = activity.content.userCourse || '';
                                                
                                                return (
                                                    <div 
                                                        key={activity._id} 
                                                        className={`activity-item ${
                                                            activity.activityType === 'ranking' 
                                                                ? `rank-achievement rank-${rankNumber} ${activity.content.category}-rank` 
                                                                : activity.activityType === 'workout' || 
                                                                  (activity.activityType === 'achievement' && activity.content.category === 'workout')
                                                                ? `workout ${activity.content.category || ''}`
                                                                : activity.activityType === 'scheduled-workout'
                                                                ? `scheduled-workout ${activity.content.category || ''}`
                                                                : activity.activityType === 'weight-change'
                                                                ? `weight-tracker-entry ${activity.content.changeType === 'loss' ? 'weight-loss-entry' : 'weight-gain-entry'}`
                                                                : ''
                                                        }`}
                                                        ref={el => activityRefs.current[activity._id] = el}
                                                    >
                                                        <div className="activity-header">
                                                            {activity.userProfilePicture && activity.userProfilePicture.trim() !== "" ? (
                                                                <div className="activity-user-image">
                                                                    <img 
                                                                        src={activity.userProfilePicture} 
                                                                        alt={activity.userName} 
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="activity-user-placeholder">
                                                                    <div className="profile-icon">
                                                                        <FaUser />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="activity-user-info">
                                                                <span className="activity-user-name">{activity.userName}</span>
                                                                <span className="activity-timestamp">
                                                                    {new Date(activity.createdAt).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })} at {new Date(activity.createdAt).toLocaleTimeString('en-US', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="activity-content">
                                                            {activity.activityType === 'achievement' && (
                                                                <div className="activity-achievement">
                                                                    {activity.content.category !== 'profile' && 
                                                                     activity.content.category !== 'workout' && 
                                                                     activity.content.imageUrl && (
                                                                        <div className="activity-achievement-icon">
                                                                            <img 
                                                                                src={activity.content.imageUrl} 
                                                                                alt={activity.content.title}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="activity-achievement-info">
                                                                        <h3 className="activity-achievement-title">
                                                                            {activity.content.category === 'profile' || activity.content.category === 'workout' ? 
                                                                                activity.content.title : 
                                                                                `Unlocked achievement: ${activity.content.title}`}
                                                                        </h3>
                                                                        <p className="activity-achievement-description">
                                                                            {activity.content.description}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {activity.activityType === 'ranking' && (
                                                                <div className="activity-achievement">
                                                                    <div className="rank-banner">
                                                                        <span className="rank-emoji">
                                                                            {rankNumber === 1 ? '👑' : 
                                                                             rankNumber === 2 ? '🥈' : 
                                                                             rankNumber === 3 ? '🥉' : ''}
                                                                        </span>
                                                                        <h3 className="activity-achievement-title">
                                                                            {activity.content.title}
                                                                            {activity.content.userCourse && (
                                                                                <span className="rank-course-indicator"> • {activity.content.userCourse}</span>
                                                                            )}
                                                                        </h3>
                                                                    </div>
                                                                    <div className="activity-achievement-info">
                                                                        <p className="activity-achievement-description">
                                                                            {activity.content.description}
                                                                        </p>
                                                                        {activity.content.userCourse && (
                                                                            <div className="activity-course-tag">
                                                                                Course: {activity.content.userCourse}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Workout Activities */}
                                                            {activity.activityType === 'workout' && (
                                                                <div className="activity-achievement">
                                                                    <div className="activity-achievement-info">
                                                                        <h3 className="activity-achievement-title">
                                                                            {activity.content.title}
                                                                        </h3>
                                                                        <p className="activity-achievement-description">
                                                                            {activity.content.description}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Scheduled Workout Activities */}
                                                            {activity.activityType === 'scheduled-workout' && (
                                                                <div className="activity-achievement scheduled-workout">
                                                                    <div className="activity-achievement-icon">
                                                                        {activity.content.category === 'Bodyweight' && <FaUser className="workout-type-icon" />}
                                                                        {activity.content.category === 'Dumbbell' && <FaDumbbell className="workout-type-icon" />}
                                                                        {activity.content.category === 'Machine' && <FaCogs className="workout-type-icon" />}
                                                                        {activity.content.category === 'Barbell' && <FaWeight className="workout-type-icon" />}
                                                                    </div>
                                                                    <div className="activity-achievement-info">
                                                                        <h3 className="activity-achievement-title">
                                                                            {activity.content.title}
                                                                        </h3>
                                                                        <p className="activity-achievement-description">
                                                                            {activity.content.description}
                                                                        </p>
                                                                        <div className="scheduled-workout-details">
                                                                            <div className="detail-item">
                                                                                <FaCalendarCheck className="detail-icon" />
                                                                                <span>{activity.content.date || activity.content.description.split(' scheduled for ')[1]?.split(' at ')[0]}</span>
                                                                            </div>
                                                                            <div className="detail-item">
                                                                                <FaClock className="detail-icon" />
                                                                                <span>{activity.content.time || activity.content.description.split(' at ')[1]}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Weight Change Activities */}
                                                            {activity.activityType === 'weight-change' && (
                                                                <div className="wt-change-display">
                                                                    <div className="wt-change-content">
                                                                        <h3 className="wt-change-heading">
                                                                            {activity.content.title}
                                                                        </h3>
                                                                        <p className="wt-change-text">
                                                                            {activity.content.description}
                                                                        </p>
                                                                        <div className="wt-change-details">
                                                                            <div className="wt-detail-row">
                                                                                <span className="wt-detail-name">Change:</span>
                                                                                <span className="wt-detail-data">
                                                                                    {activity.content.changeType === 'loss' ? '-' : '+'}{activity.content.changeAmount} kg
                                                                                </span>
                                                                            </div>
                                                                            <div className="wt-detail-row">
                                                                                <span className="wt-detail-name">Current Weight:</span>
                                                                                <span className="wt-detail-data">{activity.content.newWeight} kg</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="activity-interactions">
                                                            <div className="activity-reactions">
                                                                <div className="reaction-buttons">
                                                                    <button 
                                                                        className={`reaction-button ${activity.userReactions?.includes('❤️') ? 'active' : ''}`}
                                                                        onClick={() => handleReaction(activity._id, '❤️')}
                                                                    >
                                                                        <span className="reaction-icon heart-icon">❤️</span>
                                                                        <span className="reaction-count">{activity.reactionCounts?.['❤️'] || 0}</span>
                                                                    </button>
                                                                    <button 
                                                                        className={`reaction-button ${activity.userReactions?.includes('🔥') ? 'active' : ''}`}
                                                                        onClick={() => handleReaction(activity._id, '🔥')}
                                                                    >
                                                                        <span className="reaction-icon fire-icon">🔥</span>
                                                                        <span className="reaction-count">{activity.reactionCounts?.['🔥'] || 0}</span>
                                                                    </button>
                                                                    <button 
                                                                        className={`reaction-button ${activity.userReactions?.includes('💪') ? 'active' : ''}`}
                                                                        onClick={() => handleReaction(activity._id, '💪')}
                                                                    >
                                                                        <span className="reaction-icon dumbbell-icon">💪</span>
                                                                        <span className="reaction-count">{activity.reactionCounts?.['💪'] || 0}</span>
                                                                    </button>
                                                                    <button 
                                                                        className={`reaction-button ${activity.userReactions?.includes('👏') ? 'active' : ''}`}
                                                                        onClick={() => handleReaction(activity._id, '👏')}
                                                                    >
                                                                        <span className="reaction-icon clap-icon">👏</span>
                                                                        <span className="reaction-count">{activity.reactionCounts?.['👏'] || 0}</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="activity-comments-container">
                                                                <button 
                                                                    className="comments-toggle"
                                                                    onClick={() => toggleComments(activity._id)}
                                                                >
                                                                    <FaComment /> {activity.comments?.length || 0} Comments
                                                                    {expandedComments[activity._id] ? <FaChevronUp /> : <FaChevronDown />}
                                                                </button>
                                                                
                                                                {expandedComments[activity._id] && (
                                                                    <div className="activity-comments">
                                                                        {activity.comments && activity.comments.map(comment => (
                                                                            <div key={comment._id} className="comment-item" id={`comment-${comment._id}`}>
                                                                                <div className="comment-user-image">
                                                                                    {comment.userProfilePicture && comment.userProfilePicture.trim() !== "" ? (
                                                                                        <img src={comment.userProfilePicture} alt={comment.userName} />
                                                                                    ) : (
                                                                                        <div className="comment-user-placeholder">
                                                                                            <div className="profile-icon">
                                                                                                <FaUser />
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="comment-content">
                                                                                    <div className="comment-header">
                                                                                        <span className="comment-user-name">{comment.userName}</span>
                                                                                        <span className="comment-timestamp">
                                                                                            {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                                                                month: 'short',
                                                                                                day: 'numeric',
                                                                                                year: 'numeric'
                                                                                            })} at {new Date(comment.createdAt).toLocaleTimeString('en-US', {
                                                                                                hour: '2-digit',
                                                                                                minute: '2-digit'
                                                                                            })}
                                                                                        </span>
                                                                                        {currentUser && (
                                                                                            (comment.userId === currentUser.userId ||
                                                                                             (comment.userId && comment.userId._id === currentUser.userId)) && (
                                                                                                <button 
                                                                                                    className="delete-comment-button"
                                                                                                    onClick={() => handleDeleteComment(activity._id, comment._id)}
                                                                                                    title="Delete comment"
                                                                                                >
                                                                                                    <FaTrash />
                                                                                                </button>
                                                                                            )
                                                                                        )}
                                                                                    </div>
                                                                                    <p className="comment-text">{comment.content}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        
                                                                        <form className="comment-form" onSubmit={(e) => {
                                                                            e.preventDefault();
                                                                            handleCommentSubmit(activity._id);
                                                                        }}>
                                                                            <input
                                                                                type="text"
                                                                                className="comment-input"
                                                                                placeholder="Add a comment..."
                                                                                value={commentText[activity._id] || ''}
                                                                                onChange={(e) => setCommentText(prev => ({
                                                                                    ...prev,
                                                                                    [activity._id]: e.target.value
                                                                                }))}
                                                                            />
                                                                            <button 
                                                                                type="submit" 
                                                                                className="comment-submit"
                                                                                disabled={!commentText[activity._id] || commentSubmitting[activity._id]}
                                                                            >
                                                                                {commentSubmitting[activity._id] ? (
                                                                                    <div className="comment-spinner"></div>
                                                                                ) : 'Post'}
                                                                            </button>
                                                                        </form>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            </ErrorBoundary>
                        )}
                    </div>
                );
            case 'workout-tracking':
                if (user?.isPrivate && !isOwnProfile) {
                    return (
                        <div className="private-content-message">
                            <span className="lock-icon">🔒</span>
                            <h3>Workout Tracking Not Available</h3>
                            <p>This profile is set to private. Workout tracking is only visible to the profile owner.</p>
                        </div>
                    );
                }
                return (
                    <div className="profile-workout-tracking-graph-container">
                        {profileWorkoutData.loading ? (
                            <div className="loading-activities"><div className="loading-spinner"></div>Loading workout data...</div>
                        ) : (
                            <>
                                {/* DROPDOWN BAR - MATCH MyWorkout.js */}
                                <div className="time-filter-container" ref={profileWorkoutTimeFilterRef}>
                                    <div 
                                        className="time-filter-dropdown"
                                        onClick={() => setProfileWorkoutShowTimeFilter(v => !v)}
                                    >
                                        <span className="time-filter-label">{profileWorkoutTimePeriod === 'all' ? 'All Time' : profileWorkoutTimePeriod === 'monthly' ? (profileWorkoutSelectedMonth ? profileWorkoutSelectedMonth.name : 'Monthly') : profileWorkoutTimePeriod === 'weekly' ? (profileWorkoutSelectedWeek ? profileWorkoutSelectedWeek.name : 'Weekly') : 'All Time'}</span>
                                        <FaChevronDown className="dropdown-icon" />
                                    </div>
                                    {profileWorkoutShowTimeFilter && (
                                        <div className="time-filter-options">
                                            <div
                                                className={`time-option ${profileWorkoutTimePeriod === 'all' ? 'active' : ''}`}
                                                onClick={() => { setProfileWorkoutTimePeriod('all'); setProfileWorkoutShowTimeFilter(false); }}
                                            >
                                                All Time
                                            </div>
                                            <div 
                                                className={`time-option ${profileWorkoutTimePeriod === 'monthly' && !profileWorkoutSelectedMonth ? 'active' : ''}`}
                                                onClick={() => { setProfileWorkoutTimePeriod('monthly'); setProfileWorkoutShowTimeFilter(false); if (profileWorkoutAvailableMonths.length > 0 && !profileWorkoutSelectedMonth) setProfileWorkoutSelectedMonth(profileWorkoutAvailableMonths[0]); }}
                                            >
                                                Monthly
                                            </div>
                                            {/* Show all available months */}
                                            {profileWorkoutAvailableMonths.map((month, idx) => (
                                                <div 
                                                    key={`month-${idx}`}
                                                    className={`time-option indent ${profileWorkoutSelectedMonth && profileWorkoutSelectedMonth.name === month.name ? 'active' : ''}`}
                                                    onClick={() => { setProfileWorkoutSelectedMonth(month); setProfileWorkoutTimePeriod('monthly'); setProfileWorkoutShowTimeFilter(false); generateProfileWeeksForMonth(month, 'workout'); }}
                                                >
                                                    {month.name}
                                                </div>
                                            ))}
                                            <div 
                                                className={`time-option ${profileWorkoutTimePeriod === 'weekly' ? 'active' : ''}`}
                                                onClick={() => { setProfileWorkoutTimePeriod('weekly'); setProfileWorkoutShowTimeFilter(false); if (profileWorkoutAvailableMonths.length > 0 && !profileWorkoutSelectedMonth) setProfileWorkoutSelectedMonth(profileWorkoutAvailableMonths[0]); generateProfileWeeksForMonth(profileWorkoutSelectedMonth || profileWorkoutAvailableMonths[0], 'workout'); }}
                                            >
                                                Weekly
                                            </div>
                                            {/* Show weeks for the selected month or when in weekly view */}
                                            {profileWorkoutSelectedMonth && profileWorkoutAvailableWeeks.length > 0 && (
                                                profileWorkoutAvailableWeeks.map((week, idx) => (
                                                    <div 
                                                        key={`week-${week.key}`}
                                                        className={`time-option indent ${profileWorkoutSelectedWeek && profileWorkoutSelectedWeek.key === week.key ? 'active' : ''}`}
                                                        onClick={() => { setProfileWorkoutSelectedWeek(week); setProfileWorkoutTimePeriod('weekly'); setProfileWorkoutShowTimeFilter(false); }}
                                                    >
                                                        {week.name}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="profile-graph-charts">
                                    <div className="chart-container workout-category-chart">
                                        <h3 className="chart-title">Workouts By Category</h3>
                                        <div className="chart-wrapper"><Bar data={getProfileWorkoutCategoryChartData()} options={profileWorkoutChartOptions} /></div>
                                    </div>
                                    <div className="chart-container workout-target-chart">
                                        <h3 className="chart-title">Workouts By Target Muscle</h3>
                                        <div className="chart-wrapper"><Bar data={getProfileWorkoutTargetChartData()} options={profileWorkoutChartOptions} /></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'weight-tracking':
                if (user?.isPrivate && !isOwnProfile) {
                    return (
                        <div className="private-content-message">
                            <span className="lock-icon">🔒</span>
                            <h3>Weight Tracking Not Available</h3>
                            <p>This profile is set to private. Weight tracking is only visible to the profile owner.</p>
                        </div>
                    );
                }
                return (
                    <div className="profile-weight-tracking-graph-container">
                        {profileWeightData.loading ? (
                            <div className="loading-activities"><div className="loading-spinner"></div>Loading weight data...</div>
                        ) : (
                            <>
                                {/* DROPDOWN BAR - MATCH WeightTracking.js */}
                                <div className="weight-time-filter" ref={profileWeightTimeFilterRef}>
                                    <div 
                                        className="weight-time-filter-selector" 
                                        onClick={() => setProfileWeightShowTimeFilter(v => !v)}
                                    >
                                        <span>{profileWeightTimePeriod === 'all' ? 'All Time' : profileWeightTimePeriod === 'monthly' ? (profileWeightSelectedMonth ? profileWeightSelectedMonth.name : 'Monthly') : profileWeightTimePeriod === 'weekly' ? (profileWeightSelectedWeek ? profileWeightSelectedWeek.name : 'Weekly') : 'All Time'}</span>
                                        <FaChevronDown className="dropdown-icon" />
                                    </div>
                                    {profileWeightShowTimeFilter && (
                                        <div className="weight-time-dropdown">
                                            <div 
                                                className={`time-option ${profileWeightTimePeriod === 'all' ? 'active' : ''}`}
                                                onClick={() => { setProfileWeightTimePeriod('all'); setProfileWeightShowTimeFilter(false); }}
                                            >
                                                All Time
                                            </div>
                                            <div 
                                                className={`time-option ${profileWeightTimePeriod === 'monthly' && !profileWeightSelectedMonth ? 'active' : ''}`}
                                                onClick={() => { setProfileWeightTimePeriod('monthly'); setProfileWeightShowTimeFilter(false); if (profileWeightAvailableMonths.length > 0 && !profileWeightSelectedMonth) setProfileWeightSelectedMonth(profileWeightAvailableMonths[0]); }}
                                            >
                                                Monthly
                                            </div>
                                            {/* Show all available months */}
                                            {profileWeightAvailableMonths.map((month, idx) => (
                                                <div 
                                                    key={`month-${idx}`}
                                                    className={`time-option indent ${profileWeightSelectedMonth && profileWeightSelectedMonth.name === month.name ? 'active' : ''}`}
                                                    onClick={() => { setProfileWeightSelectedMonth(month); setProfileWeightTimePeriod('monthly'); setProfileWeightShowTimeFilter(false); generateProfileWeeksForMonth(month, 'weight'); }}
                                                >
                                                    {month.name}
                                                </div>
                                            ))}
                                            <div 
                                                className={`time-option ${profileWeightTimePeriod === 'weekly' ? 'active' : ''}`}
                                                onClick={() => { setProfileWeightTimePeriod('weekly'); setProfileWeightShowTimeFilter(false); if (profileWeightAvailableMonths.length > 0 && !profileWeightSelectedMonth) setProfileWeightSelectedMonth(profileWeightAvailableMonths[0]); generateProfileWeeksForMonth(profileWeightSelectedMonth || profileWeightAvailableMonths[0], 'weight'); }}
                                            >
                                                Weekly
                                            </div>
                                            {/* Show weeks for the selected month or when in weekly view */}
                                            {profileWeightSelectedMonth && profileWeightAvailableWeeks.length > 0 && (
                                                profileWeightAvailableWeeks.map((week, idx) => (
                                                    <div 
                                                        key={`week-${week.key}`}
                                                        className={`time-option indent ${profileWeightSelectedWeek && profileWeightSelectedWeek.key === week.key ? 'active' : ''}`}
                                                        onClick={() => { setProfileWeightSelectedWeek(week); setProfileWeightTimePeriod('weekly'); setProfileWeightShowTimeFilter(false); }}
                                                    >
                                                        {week.name}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="profile-graph-charts">
                                    <div className="chart-container weight-progress-chart">
                                        <h3 className="chart-title">Weight Progress</h3>
                                        <div className="chart-wrapper"><Line data={getProfileWeightChartData()} options={profileWeightChartOptions} /></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'friends':
                if (user?.isPrivate && !isOwnProfile) {
                    return (
                        <div className="private-content-message">
                            <span className="lock-icon">🔒</span>
                            <h3>Friends Not Available</h3>
                            <p>This profile is set to private. Friends are only visible to the profile owner.</p>
                        </div>
                    );
                }
                return (
                    <div className="profile-friends-tab">
                        <Friends showOnlyFriendsList profileEmail={profileEmail} />
                    </div>
                );
            default:
                return null;
        }
    };

    const handleDeleteComment = async (activityId, commentId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Show confirmation dialog
            const result = await Swal.fire({
                title: '[ DELETE COMMENT ]',
                text: 'Are you sure you want to delete this comment?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '< DELETE >',
                cancelButtonText: '< CANCEL >',
                background: 'rgba(16, 16, 28, 0.95)',
                backdrop: `rgba(0,0,0,0.8)`,
                confirmButtonColor: '#ff4444',
                cancelButtonColor: '#2b2b40',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm',
                    cancelButton: 'swal2-cancel'
                }
            });

            if (result.isConfirmed) {
                const response = await axios.delete(
                    `${API_URL}api/activity/comment/${activityId}/${commentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.status === 200) {
                    // Update the activities state to remove the deleted comment
                    setUserActivities(prevActivities => 
                        prevActivities.map(activity => {
                            if (activity._id === activityId) {
                                return {
                                    ...activity,
                                    comments: activity.comments.filter(c => c._id !== commentId)
                                };
                            }
                            return activity;
                        })
                    );

                    // Show success message
                    await Swal.fire({
                        title: '[ DELETED ]',
                        text: 'Comment has been deleted successfully',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        background: 'rgba(16, 16, 28, 0.95)',
                        customClass: {
                            popup: 'swal2-popup',
                            title: 'swal2-title'
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            Swal.fire({
                title: '[ ERROR ]',
                text: 'Failed to delete comment',
                icon: 'error',
                background: 'rgba(16, 16, 28, 0.95)',
                confirmButtonText: '< OK >',
                customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm'
                }
            });
        }
    };

    if (loading) {
        return <div className="loading-container">Loading user profile...</div>;
    }

    if (!user) {
        return <div className="error-container">Error loading profile. Please try again.</div>;
    }

    return (
        <ErrorBoundary>
            <div className={`profile-container ${user?.isPrivate && !isOwnProfile ? 'private-profile' : ''}`}>
                {loading ? (
                    <div className="loading-container">Loading profile...</div>
                ) : (
                    <div className="profile-card">
                        {user?.isPrivate && !isOwnProfile && (
                            <div className="private-profile-banner">
                                <span className="lock-icon">🔒</span>
                                <h3>Private Profile</h3>
                                <p>This user has set their profile to private. Only basic information is visible.</p>
                            </div>
                        )}
                        <div className="profile-header">
                            <div className="profile-picture-container">
                                {previewUrl ? (
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        className="profile-image"
                                    />
                                ) : user.profilePicture ? (
                                    <img 
                                        src={user.profilePicture}  
                                        alt="Profile" 
                                        className="profile-image"
                                    />
                                ) : (
                                    <FaUser className="profile-icon" />
                                )}

                                {isOwnProfile && (
                                    <button 
                                        className={`icon-button ${isEditingPhoto ? 'close-photo-button' : 'camera-button'}`}
                                        onClick={() => isEditingPhoto ? cancelEdit() : setIsEditingPhoto(true)}
                                        title={isEditingPhoto ? "Close editing" : "Edit profile picture"}
                                    >
                                        {isEditingPhoto ? <FaTimes /> : <FaCamera />}
                                    </button>
                                )}
                            </div>

                            {isEditingPhoto && ( 
                                <div className="edit-controls">
                                    <div className="file-input-container">
                                        <input 
                                            type="file" 
                                            id="profile-upload"
                                            onChange={handleFileChange}
                                            accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff"
                                            className="file-input"
                                        />
                                        <label htmlFor="profile-upload" className="file-input-label">
                                            Choose Photo
                                        </label>
                                        {selectedFile && (
                                            <span className="selected-file">{selectedFile.name}</span>
                                        )}
                                    </div>
                                    <div className="action-buttons">
                                        {selectedFile && (
                                            <button 
                                                className="upload-button"
                                                onClick={handleUpload}
                                            >
                                                Upload
                                            </button>
                                        )}
                                        {user.profilePicture && (
                                            <button 
                                                className="delete-button"
                                                onClick={handleDelete}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {isOwnProfile && (
                            <div className="privacy-toggle">
                                <button 
                                    className={`toggle-button ${user?.isPrivate ? 'private' : 'public'}`}
                                    onClick={togglePrivacy}
                                >
                                    {user?.isPrivate ? 'Private Profile' : 'Public Profile'}
                                </button>
                            </div>
                        )}

                        {/* New Tab Navigation */}
                        <div className="profile-tabs">
                            <button 
                                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                                data-tab="profile"
                                aria-label={isOwnProfile ? 'My Profile' : 'Profile'}
                            >
                                <span className="tab-icon"><FaUser /></span>
                                <span className="tab-text">{isOwnProfile ? 'MY PROFILE' : 'PROFILE'}</span>
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'rankings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('rankings')}
                                data-tab="rankings"
                                aria-label={isOwnProfile ? 'My Rankings' : 'Rankings'}
                            >
                                <span className="tab-icon"><FaGraduationCap /></span>
                                <span className="tab-text">{isOwnProfile ? 'MY RANKINGS' : 'RANKINGS'}</span>
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
                                onClick={() => setActiveTab('achievements')}
                                data-tab="achievements"
                                aria-label={isOwnProfile ? 'My Achievements' : 'Achievements'}
                                disabled={user?.isPrivate && !isOwnProfile}
                                style={user?.isPrivate && !isOwnProfile ? { pointerEvents: 'none', opacity: 0.5, display: 'flex', alignItems: 'center' } : {}}
                            >
                                <span className="tab-icon"><FaMedal /></span>
                                <span className="tab-text">{isOwnProfile ? 'MY ACHIEVEMENTS' : 'ACHIEVEMENTS'}</span>
                                {user?.isPrivate && !isOwnProfile && <span className="tab-lock" style={{marginLeft: 6}}>🔒</span>}
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'workout-tracking' ? 'active' : ''}`}
                                onClick={() => setActiveTab('workout-tracking')}
                                data-tab="workout-tracking"
                                aria-label="Workout Tracking"
                                disabled={user?.isPrivate && !isOwnProfile}
                                style={user?.isPrivate && !isOwnProfile ? { pointerEvents: 'none', opacity: 0.5, display: 'flex', alignItems: 'center' } : {}}
                            >
                                <span className="tab-icon"><FaDumbbell /></span>
                                <span className="tab-text">WORKOUT TRACKING</span>
                                {user?.isPrivate && !isOwnProfile && <span className="tab-lock" style={{marginLeft: 6}}>🔒</span>}
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'weight-tracking' ? 'active' : ''}`}
                                onClick={() => setActiveTab('weight-tracking')}
                                data-tab="weight-tracking"
                                aria-label="Weight Tracking"
                                disabled={user?.isPrivate && !isOwnProfile}
                                style={user?.isPrivate && !isOwnProfile ? { pointerEvents: 'none', opacity: 0.5, display: 'flex', alignItems: 'center' } : {}}
                            >
                                <span className="tab-icon"><FaWeight /></span>
                                <span className="tab-text">WEIGHT TRACKING</span>
                                {user?.isPrivate && !isOwnProfile && <span className="tab-lock" style={{marginLeft: 6}}>🔒</span>}
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
                                onClick={() => setActiveTab('friends')}
                                data-tab="friends"
                                aria-label="Friends"
                                disabled={user?.isPrivate && !isOwnProfile}
                                style={user?.isPrivate && !isOwnProfile ? { pointerEvents: 'none', opacity: 0.5, display: 'flex', alignItems: 'center' } : {}}
                            >
                                <span className="tab-icon"><FaUserFriends /></span>
                                <span className="tab-text">FRIENDS</span>
                                {user?.isPrivate && !isOwnProfile && <span className="tab-lock" style={{marginLeft: 6}}>🔒</span>}
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
                                onClick={() => setActiveTab('activity')}
                                data-tab="activity"
                                aria-label="Activity"
                                disabled={user?.isPrivate && !isOwnProfile}
                                style={user?.isPrivate && !isOwnProfile ? { pointerEvents: 'none', opacity: 0.5, display: 'flex', alignItems: 'center' } : {}}
                            >
                                <span className="tab-icon"><FaChartLine /></span>
                                <span className="tab-text">ACTIVITY</span>
                                {user?.isPrivate && !isOwnProfile && <span className="tab-lock" style={{marginLeft: 6}}>🔒</span>}
                            </button>
                        </div>
                        {/* Tab labels for mobile */}
                        <div className="profile-tab-labels">
                            {activeTab === 'profile' && (
                                <div className="profile-tab-label active">{isOwnProfile ? 'My Profile' : 'Profile'}</div>
                            )}
                            {activeTab === 'rankings' && (
                                <div className="profile-tab-label active">{isOwnProfile ? 'My Rankings' : 'Rankings'}</div>
                            )}
                            {activeTab === 'achievements' && (
                                <div className="profile-tab-label active">{isOwnProfile ? 'My Achievements' : 'Achievements'}</div>
                            )}
                            {activeTab === 'workout-tracking' && (
                                <div className="profile-tab-label active">Workout Tracking</div>
                            )}
                            {activeTab === 'weight-tracking' && (
                                <div className="profile-tab-label active">Weight Tracking</div>
                            )}
                            {activeTab === 'friends' && (
                                <div className="profile-tab-label active">Friends</div>
                            )}
                            {activeTab === 'activity' && (
                                <div className="profile-tab-label active">Activity</div>
                            )}
                        </div>
                        {renderTabContent()}
                    </div>
                )}

                {/* Remove duplicate achievement popup */}
                {selectedAchievement && (
                    <div className="achievement-popup-overlay" onClick={closeAchievementPopup}>
                        <div className="achievement-popup" onClick={(e) => e.stopPropagation()}>
                            <button className="close-popup" onClick={closeAchievementPopup}>×</button>
                            <div className="popup-content">
                                <img 
                                    src={selectedAchievement.badge} 
                                    alt={selectedAchievement.title} 
                                    className="popup-badge-image" 
                                />
                                <h3 className="popup-title">{selectedAchievement.title}</h3>
                                <p className="popup-description">{selectedAchievement.description}</p>
                                {selectedAchievement.unlocked ? (
                                    <div className="popup-status unlocked">
                                        ✅ Unlocked: {selectedAchievement.unlockDate || new Date().toLocaleDateString()}
                                    </div>
                                ) : (
                                    <div className="popup-status locked">
                                        ⚠️ Not unlocked yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default Profile;