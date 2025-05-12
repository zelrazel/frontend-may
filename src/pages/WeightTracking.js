import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import '../styles/WeightTracking.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import { FaInfoCircle, FaTimes, FaTrash, FaChevronDown } from 'react-icons/fa';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Add Toast component at the top
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`weight-toast ${type}`}>
            <span>{message}</span>
        </div>
    );
};

const WeightTracking = () => {
    const navigate = useNavigate();
    const [token] = useState(localStorage.getItem('token'));
    const [weightInput, setWeightInput] = useState('');
    const [currentWeight, setCurrentWeight] = useState(0);
    const [weightHistory, setWeightHistory] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [error, setError] = useState(null); // Add this line with other useState declarations
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [hasLoggedToday, setHasLoggedToday] = useState(false);
    const [showInfoPopup, setShowInfoPopup] = useState(false);
    const [chartTimePeriod, setChartTimePeriod] = useState('all'); // 'all', 'monthly', 'weekly'
    const [showTimeFilter, setShowTimeFilter] = useState(false);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const timeFilterRef = useRef(null);
    const [activeTab, setActiveTab] = useState('update');

    // Add this useEffect at the top for authentication check
    useEffect(() => {
        if (!token) {
            navigate('/signin');
            return;
        }
    }, [token, navigate]);

    // If not authenticated, don't render the component
    if (!token) {
        return null;
    }

    useEffect(() => {
        // Load existing achievement activities from all app sections
        const loadExistingActivities = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                // Fetch activities from the backend to ensure we have complete data
                const response = await axios.get(`${API_URL}api/activity`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data && response.data.length > 0) {
                    // Extract achievement activities
                    const achievementActivities = response.data.filter(
                        activity => activity.activityType === 'achievement'
                    );
                    
                    // Build a map of achievement IDs that already have activities
                    const savedActivities = JSON.parse(localStorage.getItem('achievementActivities') || '{}');
                    
                    // Add any activities from the backend that aren't in localStorage
                    achievementActivities.forEach(activity => {
                        if (activity.content && activity.content.achievementId) {
                            savedActivities[activity.content.achievementId] = true;
                        }
                    });
                    
                    // Update localStorage with complete achievement activity list
                    localStorage.setItem('achievementActivities', JSON.stringify(savedActivities));
                    console.log('Loaded existing achievement activities:', Object.keys(savedActivities).length);
                }
            } catch (error) {
                console.error('Error loading existing activities:', error);
            }
        };
        
        loadExistingActivities();
        fetchCurrentWeight();
        fetchWeightHistory();
        
        // Debug: Test weight change activity creation manually
        const testWeightChangeActivity = async () => {
            try {
                console.log('Testing weight change activity creation...');
                const success = await createWeightChangeActivity(70, 'loss', 1);
                console.log('Test weight change activity created:', success);
            } catch (error) {
                console.error('Error in test:', error);
            }
        };
        
        // Comment out this line after verifying the activity creation works
        // testWeightChangeActivity();
    }, []);

    // Modify fetchCurrentWeight function
    const fetchCurrentWeight = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    title: '[ SESSION EXPIRED ]',
                    text: 'Please sign in to view your weight tracking',
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

            const response = await axios.get(`${API_URL}api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentWeight(response.data.weight);
        } catch (error) {
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
            }
        }
    };

    const fetchWeightHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}api/weight/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setWeightHistory(response.data);
            setError(null); // Clear any existing errors
            
            // Check if user has already logged weight today
            const today = new Date().setHours(0, 0, 0, 0);
            const hasLogged = response.data.some(entry => {
                const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
                return entryDate === today && !entry.isWorkout;
            });
            
            setHasLoggedToday(hasLogged);
            
            if (hasLogged) {
                showToast('You have already logged your weight today. Please come back tomorrow!', 'info');
            }
        } catch (error) {
            showToast('Failed to fetch weight history', 'error'); 
            setError('Failed to fetch weight history');
        }
    };

    // Add function to update achievements
    const updateAchievements = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Trigger a refresh of the achievements by making a request
            await axios.get(`${API_URL}api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Get previously unlocked achievements
            const previouslyUnlocked = JSON.parse(localStorage.getItem('achievementActivities') || '{}');

            // Optionally notify the user about new achievements
            const weightResponse = await axios.get(`${API_URL}api/weight/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (weightResponse.data && weightResponse.data.length > 0) {
                const sortedWeights = [...weightResponse.data].sort((a, b) => 
                    new Date(a.date) - new Date(b.date)
                );
                const firstWeight = sortedWeights[0].weight;
                const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
                const totalLoss = firstWeight - lastWeight;

                // Define achievements with thresholds
                const achievements = [
                    { id: '1', title: 'First Step Staken', description: 'You have taken your first step towards your fitness journey!', icon: '👣', threshold: 1 },
                    { id: '2', title: 'Shedding Pounds', description: 'You are shedding pounds and getting closer to your goal!', icon: '💪', threshold: 3 },
                    { id: '5', title: 'Getting Lean', description: 'You are getting lean and fitter!', icon: '🏋️‍♂️', threshold: 5 },
                    { id: '10', title: 'Transformation Mode', description: 'You are in transformation mode!', icon: '🔥', threshold: 10 },
                    { id: '15', title: 'Peak Physique', description: 'You have reached your peak physique!', icon: '🏋️‍♂️', threshold: 15 }
                ];

                // Check which achievements should be unlocked
                for (const achievement of achievements) {
                    if (totalLoss >= achievement.threshold && !previouslyUnlocked[achievement.id]) {
                        showToast(`Achievement Unlocked: ${achievement.title}!`, 'success');
                        await createActivityForAchievement(
                            achievement.id,
                            achievement.title,
                            achievement.description,
                            achievement.icon
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error updating achievements:', error);
        }
    };

    // Create activity for unlocked achievement
    const createActivityForAchievement = async (achievementId, achievementTitle, achievementDescription, achievementIcon) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Check if we've already created an activity for this achievement
            const savedActivities = JSON.parse(localStorage.getItem('achievementActivities') || '{}');
            if (savedActivities[achievementId]) {
                console.log(`Achievement activity for ${achievementTitle} already exists, skipping creation`);
                return; // Already created activity for this achievement
            }

            // Create activity
            const response = await axios.post(`${API_URL}api/activity/achievement`, {
                achievementId,
                achievementTitle,
                achievementDescription,
                achievementIcon,
                achievementCategory: 'weightLoss'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                // Mark this achievement as having an activity created
                savedActivities[achievementId] = true;
                localStorage.setItem('achievementActivities', JSON.stringify(savedActivities));
                console.log(`Created activity for achievement: ${achievementTitle}`);
            }
        } catch (error) {
            console.error('Error creating activity:', error);
        }
    };

    // Enhanced input handler - updated to support decimal inputs like .1
    const handleInputChange = (e) => {
        const value = e.target.value;
        
        // Support inputs that start with decimal point (like .1, .5)
        // And allow only numbers with up to one decimal place
        if (value === '' || value === '.' || /^-?\d*\.?\d{0,1}$/.test(value)) {
            // Check for negative values
            if (value.startsWith('-')) {
                showToast('Weight change cannot be negative', 'error');
                setWeightInput(''); // Reset to empty if negative
                return;
            }
            
            // Handle case when only decimal point is entered
            if (value === '.') {
                setWeightInput(value);
                return;
            }
            
            const numValue = parseFloat(value);
            
            // If value exceeds 2kg, reset to empty but don't show error
            if (!isNaN(numValue) && numValue > 2) {
                setWeightInput(''); // Reset to empty without showing error message
            } else {
                setWeightInput(value);
            }
        }
    };
    
    // Weight change handler with updated behavior for gain button
    const handleWeightChange = async (changeType) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Authentication required', 'error');
                navigate('/signin');
                return;
            }
            
            // Check if user has already logged weight today
            if (hasLoggedToday) {
                showToast('You have already logged your weight today. Please come back tomorrow!', 'error');
                return;
            }

            // Handle case when only decimal point is entered
            if (weightInput === '.') {
                showToast('Please enter a valid number', 'error');
                return;
            }

            let newWeight;
            let changeAmount = 0;
            
            // For weight loss
            if (changeType === 'decrease') {
                if (!weightInput) {
                    showToast('Please enter a weight change value', 'error');
                    return;
                }
                
                // Calculate new weight
                const lossAmount = parseFloat(weightInput);
                
                // Validate the loss amount is within allowed range
                if (isNaN(lossAmount)) {
                    showToast('Please enter a valid number', 'error');
                    return;
                }
                
                if (lossAmount < 0) {
                    showToast('Weight change cannot be negative', 'error');
                    setWeightInput(''); // Reset to empty
                    return;
                }
                
                if (lossAmount < 1) {
                    showToast('Weight loss must be at least 1 kg per entry', 'error');
                    setWeightInput(''); // Reset to empty
                    return;
                }
                
                if (lossAmount > 2) {
                    // Reset without error message
                    setWeightInput(''); 
                    return;
                }
                
                newWeight = currentWeight - lossAmount;
                changeAmount = lossAmount;
                
                // Check min weight
                if (newWeight < 40) {
                    showToast('Weight cannot be less than 40 kg', 'error');
                    return;
                }
            } 
            // For weight gain (fixed at 1kg regardless of input)
            else {
                // Check if user entered a value that's not 1
                const gainAmount = parseFloat(weightInput);
                
                // Check for negative values
                if (!isNaN(gainAmount) && gainAmount < 0) {
                    showToast('Weight change cannot be negative', 'error');
                    setWeightInput(''); // Reset to empty
                    return;
                }
                
                if (!isNaN(gainAmount) && gainAmount !== 1) {
                    showToast('Weight gain must not exceed 1 kg', 'error');
                    setWeightInput(''); // Reset to empty
                    return;
                }
                
                newWeight = currentWeight + 1; // Always fixed at 1kg
                changeAmount = 1;
                
                // Check max weight
                if (newWeight > 500) {
                    showToast('Weight cannot exceed 500 kg', 'error');
                    return;
                }
            }
            
            // Make the API request directly
            try {
                const response = await axios.post(
                    `${API_URL}api/weight/log`,
                    { 
                        weight: newWeight,
                        changeType: changeType === 'decrease' ? 'loss' : 'gain',
                        changeAmount: changeAmount
                    },
                    { headers: { 'Authorization': `Bearer ${token}` }}
                );
                
                if (response.data.success) {
                    // Update UI
                    setCurrentWeight(newWeight);
                    setWeightInput('');
                    setHasLoggedToday(true); // Mark that user has logged weight today
                    
                    // Show success message
                    if (changeType === 'decrease') {
                        const lossAmount = parseFloat(weightInput);
                        showToast(`Weight successfully decreased by ${lossAmount}kg`, 'success');
                    } else {
                        showToast(`Weight successfully increased by 1kg`, 'success');
                    }
                    
                    console.log('Weight change successful! Creating activity now...');
                    
                    // Create weight change activity
                    const activityCreated = await createWeightChangeActivity(newWeight, changeType === 'decrease' ? 'loss' : 'gain', changeAmount);
                    
                    console.log('Activity creation process completed');
                    
                    // If activity was created, show a toast with option to view profile
                    if (activityCreated) {
                        showToast('Weight updated successfully!', 'success');
                        
                        // Refresh the weight history
                        await fetchWeightHistory();
                    }
                }
            } catch (error) {
                console.error('Error updating weight:', error);
                const errorMessage = error.response?.data?.error || 'Failed to update weight';
                showToast(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            showToast('An unexpected error occurred', 'error');
        }
    };
    
    const showToast = (message, type) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        }, 3000);
    };

    const handleDelete = async (weightId) => {
        // Show SweetAlert2 confirmation modal
        const result = await Swal.fire({
            title: 'ARE YOU SURE?',
            html: `<div style="font-size:1.1rem;">You are about to delete this weight record.<br><br><span style='display:inline-block;background:rgba(0,255,132,0.10);color:#00ff84;padding:10px 14px;border-radius:7px;border-left:4px solid #00ff84;font-weight:bold;font-size:1.05rem;box-shadow:0 0 8px rgba(0,255,132,0.15);margin:8px 0;'>DELETING WEIGHT RECORD WILL ALSO DELETE YOUR WEIGHT PROGRESS.</span></div>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'DELETE',
            cancelButtonText: 'CANCEL',
            customClass: {
                popup: 'swal2-popup',
                title: 'swal2-title',
                confirmButton: 'swal2-confirm',
                cancelButton: 'swal2-cancel',
                actions: 'swal2-actions',
            },
            background: 'rgba(16, 16, 28, 0.95)',
            focusCancel: true
        });
        if (result.isConfirmed) {
            await confirmDelete(weightId);
        }
    };

    const confirmDelete = async (weightId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}api/weight/${weightId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('Weight record deleted successfully', 'success');
            fetchWeightHistory();
        } catch (error) {
            showToast('Failed to delete weight record', 'error');
        }
    };

    // Create activity for weight change
    const createWeightChangeActivity = async (newWeight, changeType, changeAmount) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found when creating weight change activity');
                return;
            }

            // Use a single arrow symbol instead of up/down arrows
            const weightIcon = '↕️'; // Single arrow icon that will be colored via CSS
            const activityTitle = `${changeType === 'loss' 
                ? `Lost ${changeAmount}kg of Weight` 
                : `Gained ${changeAmount}kg of Weight`}`;

            // Add more context to the description
            const activityDescription = changeType === 'loss'
                ? `Successfully decreased weight by ${changeAmount}kg. Current weight is now ${newWeight}kg.`
                : `Successfully increased weight by ${changeAmount}kg. Current weight is now ${newWeight}kg.`;

            console.log('Attempting to create weight change activity:', {
                activityId: `weight-${changeType}-${Date.now()}`,
                changeType,
                changeAmount,
                newWeight
            });

            // Create an activity for the weight change
            const response = await axios.post(
                `${API_URL}api/activity/weight-change`,
                {
                    activityId: `weight-${changeType}-${Date.now()}`,
                    activityTitle,
                    activityDescription,
                    changeType,
                    changeAmount,
                    newWeight
                },
                { headers: { 'Authorization': `Bearer ${token}` }}
            );
            
            console.log('Weight change activity created successfully:', response.data);
            return true;
        } catch (error) {
            console.error('Error creating weight change activity:', error.response?.data || error.message || error);
            showToast('Note: Weight updated but activity creation failed', 'info');
            return false;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (timeFilterRef.current && !timeFilterRef.current.contains(event.target)) {
                setShowTimeFilter(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    // Extract available months and weeks from weight history
    useEffect(() => {
        if (weightHistory.length > 0) {
            // Group entries by month for the dropdown
            const monthsMap = new Map();
            
            weightHistory.forEach(entry => {
                const date = new Date(entry.date);
                // Format like "April 2025"
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
            
            // Convert to array and sort chronologically (newest first)
            const monthsArr = Array.from(monthsMap.values());
            monthsArr.sort((a, b) => {
                const dateA = new Date(a.year, a.month);
                const dateB = new Date(b.year, b.month);
                return dateB - dateA; // Most recent first
            });
            
            setAvailableMonths(monthsArr);
            
            // If a month is selected, generate weeks for that month
            if (selectedMonth) {
                const monthData = monthsArr.find(m => m.name === selectedMonth.name);
                if (monthData) {
                    generateWeeksForMonth(monthData);
                }
            }
        }
    }, [weightHistory, selectedMonth]);
    
    // Generate weeks for a specific month - completely rewritten to fix duplicates
    const generateWeeksForMonth = (monthData) => {
        console.log("Generating weeks for month:", monthData.name);
        
        // Get entries for this month
        const entries = monthData.entries;
        
        if (!entries || entries.length === 0) {
            console.log("No entries found for month:", monthData.name);
            setAvailableWeeks([]);
            return;
        }

        // Use a set to track unique week keys
        const uniqueWeeks = new Set();
        // Use an object to store week data by key
        const weeksByKey = {};
        
        // First, get all dates in this month (not just dates with entries)
        const year = monthData.year;
        const month = monthData.month;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Generate all possible weeks for this month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            
            // Find the start of week (Sunday)
            const startOfWeek = new Date(date);
            const dayOfWeek = startOfWeek.getDay();
            startOfWeek.setDate(date.getDate() - dayOfWeek); // Go back to Sunday
            
            // End of week is Saturday
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            // Create a unique key for this week - use ISO string of start date
            const weekKey = startOfWeek.toISOString().split('T')[0];
            
            // If this is a new unique week, add it
            if (!uniqueWeeks.has(weekKey)) {
                uniqueWeeks.add(weekKey);
                
                // Create a formatted name for display
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
        
        // Now add entries to the appropriate weeks
        entries.forEach(entry => {
            const entryDate = new Date(entry.date);
            
            // Find the start of the week for this entry
            const startOfWeek = new Date(entryDate);
            const dayOfWeek = startOfWeek.getDay();
            startOfWeek.setDate(entryDate.getDate() - dayOfWeek);
            
            // Get the week key
            const weekKey = startOfWeek.toISOString().split('T')[0];
            
            // Add this entry to the appropriate week if the week exists
            if (weeksByKey[weekKey]) {
                weeksByKey[weekKey].entries.push(entry);
            }
        });
        
        // Convert to array and filter out weeks with no entries
        const weeksArray = Object.values(weeksByKey)
            .filter(week => week.entries.length > 0);
        
        // Sort by date (most recent first)
        weeksArray.sort((a, b) => b.startDate - a.startDate);
        
        console.log(`Generated ${weeksArray.length} unique weeks with entries for ${monthData.name}`);
        setAvailableWeeks(weeksArray);
    };
    
    // Function to filter data by selected time period
    const getFilteredChartData = () => {
        if (!weightHistory.length) return { labels: [], datasets: [] };
        
        // Make a copy of the array and sort by date (oldest first for chart display)
        const sortedHistory = [...weightHistory].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        let filteredData = sortedHistory;
        let timeRangeLabel = 'All Time';
        
        if (chartTimePeriod === 'weekly' && selectedWeek) {
            console.log("Filtering for week:", selectedWeek.name);
            // Filter for selected week using the date range
            filteredData = sortedHistory.filter(entry => {
                try {
                    const entryDate = new Date(entry.date);
                    // Set times to midnight for consistent comparison
                    const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
                    const startDay = new Date(selectedWeek.startDate.getFullYear(), selectedWeek.startDate.getMonth(), selectedWeek.startDate.getDate());
                    const endDay = new Date(selectedWeek.endDate.getFullYear(), selectedWeek.endDate.getMonth(), selectedWeek.endDate.getDate());
                    
                    return entryDay >= startDay && entryDay <= endDay;
                } catch (err) {
                    console.error("Error comparing dates:", err);
                    return false;
                }
            });
            console.log(`Found ${filteredData.length} entries for week: ${selectedWeek.name}`);
            timeRangeLabel = selectedWeek.name;
        } else if (chartTimePeriod === 'monthly' && selectedMonth) {
            console.log("Filtering for month:", selectedMonth.name);
            // Filter for selected month using stored month data
            const monthIndex = selectedMonth.month;
            const yearValue = selectedMonth.year;
            
            filteredData = sortedHistory.filter(entry => {
                try {
                    const entryDate = new Date(entry.date);
                    return entryDate.getMonth() === monthIndex && entryDate.getFullYear() === yearValue;
                } catch (err) {
                    console.error("Error with date:", entry.date, err);
                    return false;
                }
            });
            console.log(`Found ${filteredData.length} entries for month: ${selectedMonth.name}`);
            timeRangeLabel = selectedMonth.name;
        }
        
        return {
            labels: filteredData.map(entry => 
                new Date(entry.date).toLocaleDateString()
            ),
            datasets: [{
                label: `Weight Progress (${timeRangeLabel})`,
                data: filteredData.map(entry => entry.weight),
                borderColor: '#00ff84',
                backgroundColor: 'rgba(0, 255, 132, 0.2)',
                tension: 0.4
            }]
        };
    };
    
    // Handle time period change
    const handleTimePeriodChange = (period) => {
        setChartTimePeriod(period);
        
        if (period === 'monthly') {
            // Set default selected month to most recent
            if (availableMonths.length > 0 && !selectedMonth) {
                setSelectedMonth(availableMonths[0]);
                // This will trigger the useEffect to generate weeks for this month
            }
        } else if (period === 'weekly') {
            // For direct weekly view, use current month's weeks
            const currentDate = new Date();
            const currentMonthYear = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            
            // Find current month in available months
            const currentMonthData = availableMonths.find(m => m.name === currentMonthYear);
            
            if (currentMonthData) {
                setSelectedMonth(currentMonthData);
                setChartTimePeriod('weekly');
                // This will trigger the useEffect to generate weeks
            } else if (availableMonths.length > 0) {
                // If current month not found, use most recent month
                setSelectedMonth(availableMonths[0]);
                setChartTimePeriod('weekly');
                // This will trigger the useEffect to generate weeks
            }
        } else {
            // For 'all' period, clear selections
            setSelectedWeek(null);
        }
        
        setShowTimeFilter(false);
    };
    
    // Modify handleMonthSelect to show weeks for the selected month
    const handleMonthSelect = (month) => {
        setSelectedMonth(month);
        setChartTimePeriod('monthly'); 
        
        // Generate weeks for the selected month
        if (month) {
            const monthData = availableMonths.find(m => m.name === month.name);
            if (monthData) {
                generateWeeksForMonth(monthData);
            }
        }
    };
    
    // Handle week selection
    const handleWeekSelect = (week) => {
        console.log("Selected week:", week.name, "with key:", week.key || "no key");
        // Make sure week has a key property for consistent comparison
        const weekWithKey = week.key ? week : {
            ...week,
            key: week.startDate.toISOString().split('T')[0]
        };
        setSelectedWeek(weekWithKey);
        setChartTimePeriod('weekly');
        // Always close the dropdown after selecting a week
        setShowTimeFilter(false);
    };
    
    // Modify the getTimeFilterLabel function for better display
    const getTimeFilterLabel = () => {
        if (chartTimePeriod === 'all') {
            return 'All Time';
        } else if (chartTimePeriod === 'monthly') {
            return selectedMonth ? selectedMonth.name : 'Monthly';
        } else if (chartTimePeriod === 'weekly') {
            return selectedWeek ? selectedWeek.name : 'Weekly';
        } else {
            return 'All Time';
        }
    };
    
    // Use the filtered data for the chart
    const chartData = getFilteredChartData();

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#fff'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#fff'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#fff'
                }
            }
        }
    };

    // Add this function before the return statement
    const handleAlreadyLoggedClick = () => {
        showToast('You have already logged your weight today. Please come back tomorrow!', 'error');
    };

    return (
        <div className="weight-tracking-container">
            <div className="weight-tracking-card">
                <h1>Weight Tracking</h1>

                <div className="current-weight-display">
                    <h2>Current Weight</h2>
                    <div className="weight-value">{currentWeight} kg</div>
                </div>

                {/* Add tab navigation */}
                <div className="weight-tracking-tabs">
                    <button 
                        className={`weight-tab ${activeTab === 'update' ? 'active' : ''}`}
                        onClick={() => setActiveTab('update')}
                    >
                        Update Weight
                    </button>
                    <button 
                        className={`weight-tab ${activeTab === 'progress' ? 'active' : ''}`}
                        onClick={() => setActiveTab('progress')}
                    >
                        Weight Progress
                    </button>
                    <button 
                        className={`weight-tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                </div>

                {/* Update Weight Tab Content */}
                {activeTab === 'update' && (
                    <div className="weight-input-section">
                        <div className="weight-section-header">
                            <div className="info-icon-container" onClick={() => setShowInfoPopup(true)}>
                                <FaInfoCircle className="info-icon" />
                            </div>
                            <h3>Update Weight</h3>
                        </div>
                        <div className="weight-input-wrapper">
                            <input
                                type="text"
                                value={weightInput}
                                onChange={handleInputChange}
                                placeholder="Enter weight change"
                                step="0.1"
                                className="weight-input"
                                disabled={isButtonDisabled}
                            />
                        </div>
                        <div className="weight-buttons">
                            <button 
                                onClick={hasLoggedToday ? handleAlreadyLoggedClick : () => handleWeightChange('decrease')}
                                className={`weight-btn decrease ${isButtonDisabled ? 'disabled' : ''}`}
                                disabled={isButtonDisabled || !weightInput || isNaN(parseFloat(weightInput)) || parseFloat(weightInput) < 1 || parseFloat(weightInput) > 2}
                            >
                                LOST -{weightInput || '0'} KG
                            </button>
                            <button 
                                onClick={hasLoggedToday ? handleAlreadyLoggedClick : () => handleWeightChange('increase')}
                                className={`weight-btn increase ${isButtonDisabled ? 'disabled' : ''}`}
                                disabled={isButtonDisabled}
                            >
                                GAINED +{weightInput || '1'} KG
                            </button>
                        </div>

                        {/* Weight info popup */}
                        {showInfoPopup && (
                            <div className="weight-info-popup">
                                <div className="weight-info-popup-content">
                                    <button 
                                        className="close-popup-btn" 
                                        onClick={() => setShowInfoPopup(false)}
                                    >
                                        <FaTimes />
                                    </button>
                                    <h4>Weight Tracking Limits</h4>
                                    <ul>
                                        <li>You can log only one weight change per day</li>
                                        <li>Weight loss: Must be between 1-2 kg per entry</li>
                                        <li>Weight gain: Fixed at exactly 1 kg per entry</li>
                                        <li>Weight must be between 40 kg and 500 kg</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="weight-limits-info">
                            <p>• You can log only one weight change per day</p>
                            <p>• Weight loss: Up to 2 kg per entry</p>
                            <p>• Weight gain: Up to 1 kg per entry</p>
                            <p>• Weight must be between 40 kg and 500 kg</p>
                        </div>
                    </div>
                )}

                {/* Weight Progress Tab Content */}
                {activeTab === 'progress' && (
                    <div id="progress-tab-content">
                        {/* Move dropdown outside the chart-container */}
                        <div className="weight-time-filter" ref={timeFilterRef}>
                            <div 
                                className="weight-time-filter-selector" 
                                onClick={() => setShowTimeFilter(!showTimeFilter)}
                            >
                                <span>{getTimeFilterLabel()}</span>
                                <FaChevronDown className="dropdown-icon" />
                            </div>
                            {showTimeFilter && (
                                <div className="weight-time-dropdown">
                                    <div 
                                        className={`time-option ${chartTimePeriod === 'all' ? 'active' : ''}`}
                                        onClick={() => handleTimePeriodChange('all')}
                                    >
                                        All Time
                                    </div>
                                    <div 
                                        className={`time-option ${chartTimePeriod === 'monthly' && !selectedMonth ? 'active' : ''}`}
                                        onClick={() => handleTimePeriodChange('monthly')}
                                    >
                                        Monthly
                                    </div>
                                    {availableMonths.map((month, idx) => (
                                        <div 
                                            key={idx}
                                            className={`time-option indent ${selectedMonth && selectedMonth.name === month.name ? 'active' : ''}`}
                                            onClick={() => handleMonthSelect(month)}
                                        >
                                            {month.name}
                                        </div>
                                    ))}
                                    <div 
                                        className={`time-option ${chartTimePeriod === 'weekly' ? 'active' : ''}`}
                                        onClick={() => handleTimePeriodChange('weekly')}
                                    >
                                        Weekly
                                    </div>
                                    {selectedMonth && availableWeeks.length > 0 && (
                                        availableWeeks.map((week) => (
                                            <div 
                                                key={`week-${week.key || week.startDate.toISOString()}`}
                                                className={`time-option indent ${selectedWeek && (selectedWeek.key === week.key || (selectedWeek.startDate.getTime() === week.startDate.getTime() && selectedWeek.endDate.getTime() === week.endDate.getTime())) ? 'active' : ''}`}
                                                onClick={() => handleWeekSelect(week)}
                                            >
                                                {week.name}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="chart-container">
                            {weightHistory.length > 0 ? (
                                <Line data={chartData} options={chartOptions} />
                            ) : (
                                <div className="no-data-message">No weight data available. Start tracking to see your progress!</div>
                            )}
                        </div>
                    </div>
                )}

                {/* History Tab Content */}
                {activeTab === 'history' && (
                    <div className="weight-history">
                        <h2>Weight History</h2>
                        <div className="history-list">
                            {weightHistory.map((entry) => (
                                <div key={entry._id} className="history-item">
                                    <div className="history-info">
                                        <span className="date">
                                            {new Date(entry.date).toLocaleDateString()}
                                        </span>
                                        <span className="weight">{entry.weight} kg</span>
                                        {entry.changeType && entry.changeType !== 'initial' && (
                                            <span className={`change-type ${entry.changeType}`}>
                                                {entry.changeType === 'loss' ? 'Lost' : 'Gained'} {entry.changeAmount.toFixed(1)} kg
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        className="delete-button"
                                        onClick={() => handleDelete(entry._id)}
                                    >
                                        <span className="delete-text">Delete</span>
                                        <FaTrash className="delete-icon" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToasts(prevToasts => 
                            prevToasts.filter(t => t.id !== toast.id)
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

export default WeightTracking;