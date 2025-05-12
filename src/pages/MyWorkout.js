import React, { useState, useEffect, useRef } from 'react';

import axios from 'axios';
import { DUMBBELL_EXERCISES } from './dumbbellConstants';
import { MACHINE_EXERCISES } from './machineConstants';
import { BARBELL_EXERCISES } from './barbellConstants';
import { BODYWEIGHT_EXERCISES } from './bodyWeightConstants';
import "../styles/MyWorkout.css";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaChartLine, FaListAlt, FaDumbbell, FaCheck, FaChevronDown } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const API_URL = process.env.REACT_APP_BACKEND_URL;

axios.defaults.headers.common['Content-Type'] = 'application/json';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast ${type}`}>
            <span>{message}</span>
        </div>
    );
};

const MyWorkout = () => {
    const navigate = useNavigate();
    const [token] = useState(localStorage.getItem('token'));
    
    useEffect(() => {
        if (!token) {
            navigate('/signin');
        }
    }, [token, navigate]);

    const [workouts, setWorkouts] = useState([]);
    const [newWorkout, setNewWorkout] = useState({
        name: '',
        description: '',
        category: '',
        target: '',
        exerciseName: '',
        sets: '',
        reps: '',
        weight: ''
    });
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availableTargets, setAvailableTargets] = useState([]);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [completedWorkouts, setCompletedWorkouts] = useState([]);
    
    // Tab management states
    const [activeTab, setActiveTab] = useState('all');
    const [trackingView, setTrackingView] = useState('list');
    
    // Time period filter states (for completed workouts and tracking)
    const [timePeriod, setTimePeriod] = useState('all');
    const [showTimeFilter, setShowTimeFilter] = useState(false);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    
    // References for click outside handling
    const timeFilterRef = useRef(null);

    // Update fetchWorkouts function
    const fetchWorkouts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            console.log("Fetching workouts...");
            const response = await axios.get(`${API_URL}api/workouts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                console.log(`Fetched ${response.data.length} workouts`);
                
                // Store the raw workouts first
                setWorkouts(response.data);
                
                // Then fetch completed workouts to update the UI
                await fetchCompletedWorkouts();
            }
        } catch (error) {
            console.error('Fetch error:', error);
            if (error.response?.status === 401) {
                navigate('/signin');
            } else {
                showToast(
                    error.response?.data?.error || 'Error connecting to server', 
                    'error'
                );
            }
        }
    };

    // Add function to fetch completed workouts
    const fetchCompletedWorkouts = async () => {
        try {
            console.log("Fetching completed workouts...");
            const response = await axios.get(`${API_URL}api/workouts/completed`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Process the completed workouts to ensure weight information is correctly mapped
            const processedCompletedWorkouts = response.data.map(workout => {
                // Log the workout data to help debug
                console.log("Processing completed workout:", JSON.stringify(workout, null, 2));
                
                // Normalize workout data to ensure consistent field names
                // Completed workouts from the API might have different field names
                return {
                    ...workout,
                    // Use weightLifted if available, otherwise use weight
                    weight: workout.weightLifted !== undefined ? workout.weightLifted : workout.weight,
                    // Use setsCompleted if available, otherwise use sets
                    sets: workout.setsCompleted !== undefined ? workout.setsCompleted : workout.sets,
                    // Use repsCompleted if available, otherwise use reps
                    reps: workout.repsCompleted !== undefined ? workout.repsCompleted : workout.reps
                };
            });
            
            // Store the processed completed workouts
            setCompletedWorkouts(processedCompletedWorkouts);
            console.log(`Fetched ${processedCompletedWorkouts.length} completed workouts`);
            
            // Update the main workouts list to mark completed workouts
            setWorkouts(prev => {
                const updatedWorkouts = prev.map(workout => {
                    // Check if this workout is in the completedWorkouts array
                    const completedWorkout = processedCompletedWorkouts.find(cw => 
                        cw.workoutId === workout._id || cw._id === workout._id
                    );
                    
                    // If it is, mark it as completed and update weight if available
                    if (completedWorkout) {
                        console.log(`Marking workout ${workout._id} as completed with weight: ${completedWorkout.weight}, sets: ${completedWorkout.sets}, reps: ${completedWorkout.reps}`);
                        return { 
                            ...workout, 
                            completed: true,
                            weight: completedWorkout.weight !== undefined ? completedWorkout.weight : workout.weight,
                            sets: completedWorkout.sets !== undefined ? completedWorkout.sets : workout.sets,
                            reps: completedWorkout.reps !== undefined ? completedWorkout.reps : workout.reps
                        };
                    }
                    return workout;
                });
                
                return updatedWorkouts;
            });
            
            // Generate months and weeks for filtering
            if (processedCompletedWorkouts.length > 0) {
                generateAvailableMonths(processedCompletedWorkouts);
            }
        } catch (error) {
            console.error('Error fetching completed workouts:', error);
            showToast('Failed to fetch completed workouts', 'error');
        }
    };
    
    // Generate months from completed workouts for dropdown
    const generateAvailableMonths = (completedData) => {
        // Group entries by month for the dropdown
        const monthsMap = new Map();
        
        completedData.forEach(entry => {
            const date = new Date(entry.completedDate || entry.date);
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
    };
    
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
            const entryDate = new Date(entry.completedDate || entry.date);
            
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

    // Handle time period change for filtering
    const handleTimePeriodChange = (period) => {
        setTimePeriod(period);
        
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
                setTimePeriod('weekly');
                // This will trigger the useEffect to generate weeks
            } else if (availableMonths.length > 0) {
                // If current month not found, use most recent month
                setSelectedMonth(availableMonths[0]);
                setTimePeriod('weekly');
                // This will trigger the useEffect to generate weeks
            }
        } else {
            // For 'all' period, clear selections
            setSelectedWeek(null);
        }
        
        setShowTimeFilter(false);
    };
    
    // Handle month selection from dropdown
    const handleMonthSelect = (month) => {
        setSelectedMonth(month);
        setTimePeriod('monthly'); 
        
        // Generate weeks for the selected month
        if (month) {
            const monthData = availableMonths.find(m => m.name === month.name);
            if (monthData) {
                generateWeeksForMonth(monthData);
            }
        }
    };
    
    // Handle week selection from dropdown
    const handleWeekSelect = (week) => {
        console.log("Selected week:", week.name);
        setSelectedWeek(week);
        setTimePeriod('weekly');
        // Always close the dropdown after selecting a week
        setShowTimeFilter(false);
    };
    
    // Get label for time filter dropdown
    const getTimeFilterLabel = () => {
        if (timePeriod === 'all') {
            return 'All Time';
        } else if (timePeriod === 'monthly') {
            return selectedMonth ? selectedMonth.name : 'Monthly';
        } else if (timePeriod === 'weekly') {
            return selectedWeek ? selectedWeek.name : 'Weekly';
        } else {
            return 'All Time';
        }
    };
    
    // Filter workouts based on selected time period
    const getFilteredWorkouts = (workoutsToFilter) => {
        console.log("Filtering workouts:", workoutsToFilter ? workoutsToFilter.length : 0, "workouts");
        
        if (!workoutsToFilter?.length) {
            console.log("No workouts to filter");
            return [];
        }
        
        // Make a copy and sort by date
        const sortedWorkouts = [...workoutsToFilter].sort((a, b) => {
            const dateA = new Date(a.completedDate || a.date);
            const dateB = new Date(b.completedDate || b.date);
            return dateB - dateA; // Latest first
        });
        
        // If in "All" view, return all workouts
        if (timePeriod === 'all') {
            console.log("Returning all workouts:", sortedWorkouts.length);
            return sortedWorkouts;
        }
        
        // Filter based on selected time period
        if (timePeriod === 'weekly' && selectedWeek) {
            console.log("Filtering for week:", selectedWeek.name);
            const filteredByWeek = sortedWorkouts.filter(workout => {
                try {
                    const workoutDate = new Date(workout.completedDate || workout.date);
                    // Set times to midnight for consistent comparison
                    const workoutDay = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
                    const startDay = new Date(selectedWeek.startDate.getFullYear(), selectedWeek.startDate.getMonth(), selectedWeek.startDate.getDate());
                    const endDay = new Date(selectedWeek.endDate.getFullYear(), selectedWeek.endDate.getMonth(), selectedWeek.endDate.getDate());
                    
                    return workoutDay >= startDay && workoutDay <= endDay;
                } catch (err) {
                    console.error("Error comparing dates:", err);
                    return false;
                }
            });
            console.log(`Found ${filteredByWeek.length} workouts for week: ${selectedWeek.name}`);
            return filteredByWeek;
        } else if (timePeriod === 'monthly' && selectedMonth) {
            console.log("Filtering for month:", selectedMonth.name);
            const monthIndex = selectedMonth.month;
            const yearValue = selectedMonth.year;
            
            const filteredByMonth = sortedWorkouts.filter(workout => {
                try {
                    const workoutDate = new Date(workout.completedDate || workout.date);
                    return workoutDate.getMonth() === monthIndex && workoutDate.getFullYear() === yearValue;
                } catch (err) {
                    console.error("Error with date:", workout.completedDate || workout.date, err);
                    return false;
                }
            });
            console.log(`Found ${filteredByMonth.length} workouts for month: ${selectedMonth.name}`);
            return filteredByMonth;
        }
        
        console.log("Returning sorted workouts (default):", sortedWorkouts.length);
        return sortedWorkouts;
    };

    // Update the initial data fetch
    useEffect(() => {
        const loadInitialData = async () => {
            if (token) {
                try {
                    // First fetch completed workouts
                    await fetchCompletedWorkouts();
                    // Then fetch and update regular workouts
                    await fetchWorkouts();
                } catch (error) {
                    console.error("Error loading initial data:", error);
                }
            }
        };
        
        loadInitialData();
    }, [token]);

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

    // Prepare data for the category distribution chart 
    const getCategoryChartData = () => {
        const filtered = getFilteredWorkouts(completedWorkouts);
        if (!filtered || filtered.length === 0) {
            return {
                labels: ['No Data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#ccc'],
                    borderColor: ['#999'],
                }]
            };
        }
        
        // Count workouts by category
        const categories = {
            'Dumbbell': 0,
            'Machine': 0,
            'Barbell': 0,
            'Bodyweight': 0
        };
        
        filtered.forEach(workout => {
            if (categories[workout.category] !== undefined) {
                categories[workout.category]++;
            }
        });
        
        // Transform into chart data
        return {
            labels: Object.keys(categories),
            datasets: [{
                label: 'Completed Workouts by Category',
                data: Object.values(categories),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',  // Dumbbell - red
                    'rgba(54, 162, 235, 0.5)',  // Machine - blue
                    'rgba(255, 206, 86, 0.5)',  // Barbell - yellow
                    'rgba(75, 192, 192, 0.5)'   // Bodyweight - teal
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
    
    // Prepare data for the target muscle distribution chart
    const getTargetChartData = () => {
        const filtered = getFilteredWorkouts(completedWorkouts);
        if (!filtered || filtered.length === 0) {
            return {
                labels: ['No Data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#ccc'],
                    borderColor: ['#999'],
                }]
            };
        }
        
        // Count workouts by target muscle
        const targets = {};
        
        filtered.forEach(workout => {
            const target = workout.target;
            if (!targets[target]) {
                targets[target] = 0;
            }
            targets[target]++;
        });
        
        // Get top 8 targets and combine the rest
        const entries = Object.entries(targets).sort((a, b) => b[1] - a[1]);
        let labels = [];
        let data = [];
        let backgroundColor = [];
        let borderColor = [];
        
        // Array of color pairs [background, border]
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
        
        // Take top 8 or fewer if not enough data
        const topEntries = entries.slice(0, Math.min(8, entries.length));
        
        topEntries.forEach((entry, index) => {
            labels.push(entry[0]);
            data.push(entry[1]);
            backgroundColor.push(colors[index % colors.length][0]);
            borderColor.push(colors[index % colors.length][1]);
        });
        
        // Add "Other" category if needed
        if (entries.length > 8) {
            const otherSum = entries.slice(8).reduce((sum, entry) => sum + entry[1], 0);
            labels.push('Other');
            data.push(otherSum);
            backgroundColor.push('rgba(128, 128, 128, 0.5)');
            borderColor.push('rgba(128, 128, 128, 1)');
        }
        
        return {
            labels: labels,
            datasets: [{
                label: 'Completed Workouts by Target Muscle',
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        };
    };
    
    // Common chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    color: '#fff',
                    font: {
                        size: 12
                    },
                    padding: 20
                }
            },
            title: {
                display: true,
                text: 'Workout Distribution',
                color: '#00ff84',
                font: {
                    size: 16
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#fff',
                    precision: 0 // Only show whole numbers
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#fff'
                }
            }
        }
    };

    const handleCategoryChange = (category) => {
        // If we're editing, preserve the existing workout data
        const workoutData = editingWorkout ? {
            ...newWorkout,
            category,
            target: '',
            exerciseName: ''
        } : {
            ...newWorkout,
            category,
            target: '',
            exerciseName: '',
            sets: '',
            reps: '',
            weight: category === 'Bodyweight' ? '0' : '',
            description: newWorkout.description || ''
        };

        setNewWorkout(workoutData);

        // Set available targets based on category
        switch(category) {
            case 'Bodyweight':
                setAvailableTargets(Object.keys(BODYWEIGHT_EXERCISES));
                break;
            case 'Dumbbell':
                setAvailableTargets(Object.keys(DUMBBELL_EXERCISES));
                break;
            case 'Machine':
                setAvailableTargets(Object.keys(MACHINE_EXERCISES));
                break;
            case 'Barbell':
                setAvailableTargets(Object.keys(BARBELL_EXERCISES));
                break;
            default:
                setAvailableTargets([]);
                setAvailableExercises([]);
        }
    };

    const handleTargetChange = (target) => {
        setNewWorkout({ 
            ...newWorkout, 
            target,
            exerciseName: ''
        });

        // Set available exercises based on category and target
        switch(newWorkout.category) {
            case 'Bodyweight':
                setAvailableExercises(BODYWEIGHT_EXERCISES[target] || []);
                break;
            case 'Dumbbell':
                setAvailableExercises(DUMBBELL_EXERCISES[target] || []);
                break;
            case 'Machine':
                setAvailableExercises(MACHINE_EXERCISES[target] || []);
                break;
            case 'Barbell':
                setAvailableExercises(BARBELL_EXERCISES[target] || []);
                break;
            default:
                setAvailableExercises([]);
        }
    };

    // Add validation to ensure exercises match their category
    const validateWorkout = (workout) => {
        console.log('Validating workout:', workout);

        if (!workout.category || !workout.target || !workout.exerciseName) {
            console.log('Missing basic fields');
            return false;
        }

        // Validate that exercise belongs to the correct category
        let isValidExercise = false;
        switch(workout.category) {
            case 'Bodyweight':
                isValidExercise = BODYWEIGHT_EXERCISES[workout.target]?.includes(workout.exerciseName);
                break;
            case 'Dumbbell':
                isValidExercise = DUMBBELL_EXERCISES[workout.target]?.includes(workout.exerciseName);
                break;
            case 'Machine':
                isValidExercise = MACHINE_EXERCISES[workout.target]?.includes(workout.exerciseName);
                break;
            case 'Barbell':
                isValidExercise = BARBELL_EXERCISES[workout.target]?.includes(workout.exerciseName);
                break;
        }

        if (!isValidExercise) {
            console.log('Exercise does not match category');
            return false;
        }

        // Validate sets based on category
        const sets = parseInt(workout.sets);
        if (isNaN(sets) || sets < 1) {
            console.log('Invalid sets');
            return false;
        }

        switch(workout.category) {
            case 'Dumbbell':
                if (sets > 8) {
                    console.log('Dumbbell exercises cannot exceed 8 sets');
                    return false;
                }
                break;
            case 'Barbell':
            case 'Machine':
            case 'Bodyweight':
                if (sets > 12) {
                    console.log(`${workout.category} exercises cannot exceed 12 sets`);
                    return false;
                }
                break;
        }

        // Validate reps based on category
        const reps = parseInt(workout.reps);
        if (isNaN(reps) || reps < 1) {
            console.log('Invalid reps');
            return false;
        }

        if (workout.category === 'Bodyweight') {
            if (reps > 100) {
                console.log('Bodyweight exercises cannot exceed 100 reps');
                return false;
            }
        } else if (reps > 50) {
            console.log(`${workout.category} exercises cannot exceed 50 reps`);
            return false;
        }

        // Validate weight based on category
        if (workout.category !== 'Bodyweight') {
            const weight = parseInt(workout.weight);
            if (isNaN(weight) || weight < 0) {
                console.log('Invalid weight');
                return false;
            }

            switch(workout.category) {
                case 'Dumbbell':
                    if (weight > 120) {
                        console.log('Dumbbell weight cannot exceed 120 lbs');
                        return false;
                    }
                    break;
                case 'Barbell':
                    if (weight > 600) {
                        console.log('Barbell weight cannot exceed 600 lbs');
                        return false;
                    }
                    break;
                case 'Machine':
                    if (weight > 400) {
                        console.log('Machine weight cannot exceed 400 lbs');
                        return false;
                    }
                    break;
            }
        }

        console.log('Validation passed');
        return true;
    };

    // Update the error handling in handleSaveWorkout
    const handleSaveWorkout = async () => {
        try {
            if (!validateWorkout(newWorkout)) {
                showToast('Please fill in all required fields correctly', 'error');
                return;
            }

            let token = localStorage.getItem("token");
            if (!token) {
                showToast('Authentication required', 'error');
                navigate('/signin');
                return;
            }

            // Check if token is expired
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
                // Token is expired, refresh it
                const refreshResponse = await axios.post(`${API_URL}api/refresh-token`, { token });
                token = refreshResponse.data.token;
                localStorage.setItem('token', token);
            }

            const workoutData = {
                userEmail: decodedToken.email,
                name: newWorkout.exerciseName,
                description: newWorkout.description || "",
                category: newWorkout.category,
                target: newWorkout.target,
                exerciseName: newWorkout.exerciseName,
                sets: parseInt(newWorkout.sets),
                reps: parseInt(newWorkout.reps),
                weight: newWorkout.category === 'Bodyweight' ? 0 : parseInt(newWorkout.weight)
            };

            console.log('Sending workout data:', JSON.stringify(workoutData, null, 2));

            const endpoint = editingWorkout 
                ? `${API_URL}api/workouts/${editingWorkout._id}`
                : `${API_URL}api/workouts`;

            const response = await axios({
                method: editingWorkout ? 'put' : 'post',
                url: endpoint,
                data: workoutData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            await fetchWorkouts();
            setShowModal(false);
            setEditingWorkout(null);
            setNewWorkout({
                name: '',
                description: '',
                category: '',
                target: '',
                exerciseName: '',
                sets: '',
                reps: '',
                weight: ''
            });
            showToast(
                editingWorkout ? 'Workout updated successfully!' : 'Workout created successfully!',
                'success'
            );
        } catch (error) {
            console.error("Error saving workout:", error);
            let errorMessage = "Error saving workout";
            
            if (error.response?.data) {
                if (error.response.data.details) {
                    if (Array.isArray(error.response.data.details)) {
                        errorMessage = error.response.data.details.join('\n');
                    } else {
                        errorMessage = error.response.data.details;
                    }
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            }
            
            // Handle daily workout limit error with a more prominent message
            if (errorMessage.includes("maximum limit of 12 workouts per day")) {
                Swal.fire({
                    title: 'Daily Limit Reached',
                    html: `<div style="font-size:1.1rem;">You have reached the maximum limit of 12 workouts per day. Please try again tomorrow.</div>`,
                    icon: 'warning',
                    confirmButtonText: 'OK',
                    customClass: {
                        popup: 'swal2-neon-green',
                        confirmButton: 'swal2-confirm-neon',
                        title: 'swal2-title-neon',
                    },
                    background: '#181c1f',
                    buttonsStyling: false
                });
            } else {
                showToast(errorMessage, 'error');
            }
        }
    };

    // Update the handleDeleteWorkout function
    const handleDeleteWorkout = async (id) => {
        const result = await Swal.fire({
            title: 'ARE YOU SURE?',
            html: `<div style="font-size:1.1rem;">Are you sure you want to delete this workout?</div>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'DELETE',
            cancelButtonText: 'CANCEL',
            focusCancel: true,
            customClass: {
                popup: 'swal2-neon-green',
                confirmButton: 'swal2-confirm-neon',
                cancelButton: 'swal2-cancel-neon',
                title: 'swal2-title-neon',
            },
            background: '#181c1f',
            buttonsStyling: false
        });
        if (result.isConfirmed) {
            await confirmDelete(id);
        }
    };

    // Update the confirmDelete function
    const confirmDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Authentication required', 'error');
                return;
            }

            const response = await axios.delete(`${API_URL}api/workouts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                showToast('Workout deleted successfully', 'success');
                await fetchWorkouts();
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast(
                error.response?.data?.error || 'Error deleting workout', 
                'error'
            );
        }
    };

    const handleEditClick = (workout) => {
        setEditingWorkout(workout);
        
        // First set the workout data
        setNewWorkout({
            name: workout.name,
            description: workout.description || '',
            category: workout.category,
            target: workout.target,
            exerciseName: workout.exerciseName,
            sets: workout.sets?.toString() || '',
            reps: workout.reps?.toString() || '',
            weight: workout.category === 'Bodyweight' ? '0' : workout.weight?.toString() || ''
        });

        // Then set the available targets based on category
        switch(workout.category) {
            case 'Bodyweight':
                setAvailableTargets(Object.keys(BODYWEIGHT_EXERCISES));
                setAvailableExercises(BODYWEIGHT_EXERCISES[workout.target] || []);
                break;
            case 'Dumbbell':
                setAvailableTargets(Object.keys(DUMBBELL_EXERCISES));
                setAvailableExercises(DUMBBELL_EXERCISES[workout.target] || []);
                break;
            case 'Machine':
                setAvailableTargets(Object.keys(MACHINE_EXERCISES));
                setAvailableExercises(MACHINE_EXERCISES[workout.target] || []);
                break;
            case 'Barbell':
                setAvailableTargets(Object.keys(BARBELL_EXERCISES));
                setAvailableExercises(BARBELL_EXERCISES[workout.target] || []);
                break;
            default:
                setAvailableTargets([]);
                setAvailableExercises([]);
        }

        setShowModal(true);
    };
    
    const getMaxDigits = (category, field) => {
        switch (field) {
            case 'sets':
                return 2; // Max 2 digits for all sets
            case 'reps':
                return category === 'Bodyweight' ? 3 : 2; // 3 digits for bodyweight, 2 for others
            case 'weight':
                switch (category) {
                    case 'Dumbbell': return 3;  // Max 120
                    case 'Barbell': return 3;   // Max 600
                    case 'Machine': return 3;   // Max 400
                    default: return 1;
                }
            default:
                return 1;
        }
    };

    const validateInput = (value, category, field) => {
        const maxDigits = getMaxDigits(category, field);
        if (value.length > maxDigits) {
            return {
                isValid: false,
                message: `Maximum ${maxDigits} digits allowed for ${field}`
            };
        }

        const num = parseInt(value);
        switch (field) {
            case 'sets':
                if (category === 'Dumbbell' && num > 8) {
                    return {
                        isValid: false,
                        message: 'Dumbbell exercises cannot exceed 8 sets'
                    };
                }
                if (['Barbell', 'Machine', 'Bodyweight'].includes(category) && num > 12) {
                    return {
                        isValid: false,
                        message: `${category} exercises cannot exceed 12 sets`
                    };
                }
                break;
            case 'reps':
                if (category === 'Bodyweight' && num > 100) {
                    return {
                        isValid: false,
                        message: 'Bodyweight exercises cannot exceed 100 reps'
                    };
                }
                if (category !== 'Bodyweight' && num > 50) {
                    return {
                        isValid: false,
                        message: `${category} exercises cannot exceed 50 reps`
                    };
                }
                break;
            case 'weight':
                const maxWeight = {
                    'Dumbbell': 120,
                    'Barbell': 600,
                    'Machine': 400
                }[category];
                if (num > maxWeight) {
                    return {
                        isValid: false,
                        message: `${category} weight cannot exceed ${maxWeight} lbs`
                    };
                }
                break;
        }
        return { isValid: true };
    };

    // Add this function to show toasts
    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const handleInputChange = (e, field) => {
        const value = e.target.value;
        const category = newWorkout.category;
        
        // Validation limits
        const limits = {
            sets: { Dumbbell: 8, default: 12 },
            reps: { Bodyweight: 100, default: 50 },
            weight: { Dumbbell: 120, Barbell: 600, Machine: 400 }
        };

        if (field === 'sets' || field === 'reps' || field === 'weight') {
            const num = parseInt(value);
            let maxValue;
            
            if (field === 'sets') {
                maxValue = limits.sets[category] || limits.sets.default;
            } else if (field === 'reps') {
                maxValue = limits.reps[category] || limits.reps.default;
            } else if (field === 'weight' && category !== 'Bodyweight') {
                maxValue = limits.weight[category];
            }

            if (num > maxValue) {
                showToast(`Maximum ${field} for ${category} exercises is ${maxValue}`, 'error');
                return;
            }
        }

        setNewWorkout({ ...newWorkout, [field]: value });
    };

    useEffect(() => {
        const autoExpand = (field) => {
            field.style.height = 'inherit';
            const computed = window.getComputedStyle(field);
            const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                + parseInt(computed.getPropertyValue('padding-top'), 10)
                + field.scrollHeight
                + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                + parseInt(computed.getPropertyValue('border-bottom-width'), 10);
            field.style.height = `${height}px`;
        };

        const textareas = document.querySelectorAll('.auto-expand');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', () => autoExpand(textarea));
            autoExpand(textarea); // Initialize height
        });

        return () => {
            textareas.forEach(textarea => {
                textarea.removeEventListener('input', () => autoExpand(textarea));
            });
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        const checkAuth = async () => {
            try {
                // Make a test request to verify token
                await axios.get(`${API_URL}api/workouts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
                }
            }
        };

        checkAuth();
    }, [navigate]);

    // Update the handleCompleteWorkout function
    const handleCompleteWorkout = async (workout) => {
        if (isWorkoutCompleted(workout._id)) {
            showToast("This workout is already completed!", "info");
            return;
        }

        // Prepare details for the SweetAlert2 popup
        let weightDisplay = "N/A";
        if (workout.category === 'Bodyweight') {
            weightDisplay = '—';
        } else if (workout.weight !== undefined && workout.weight !== null) {
            weightDisplay = `${workout.weight} lbs`;
        }

        const detailsHtml = `
            <div style='text-align:left;font-size:1.05rem;margin-bottom:1rem;'>
                <ul style='margin-bottom:1rem;'>
                    <li><b>Category:</b> ${workout.category}</li>
                    <li><b>Target:</b> ${workout.target}</li>
                    <li><b>Sets:</b> ${workout.sets}</li>
                    <li><b>Reps:</b> ${workout.reps}</li>
                    ${workout.category !== 'Bodyweight' ? `<li><b>Weight:</b> ${weightDisplay}</li>` : ''}
                </ul>
                <div style='margin-bottom:1rem;'>This action cannot be undone, and the workout will be locked for editing.</div>
            </div>
        `;

        const result = await Swal.fire({
            title: '<span style="color:#00ff84;text-transform:uppercase;">COMPLETE WORKOUT</span>',
            html: `<div style='color:white;'>Are you sure you want to mark <b>${workout.exerciseName}</b> as completed?<br><br>${detailsHtml}</div>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'MARK AS COMPLETE',
            cancelButtonText: 'CANCEL',
            focusCancel: true,
            background: 'rgba(16, 16, 28, 0.95)',
            customClass: {
                popup: 'swal2-popup',
                title: 'swal2-title',
                confirmButton: 'swal2-confirm',
                cancelButton: 'swal2-cancel',
            },
            buttonsStyling: false
        });
        if (result.isConfirmed) {
            await confirmCompletion(workout);
        }
    };

    // Update the confirmCompletion function to ensure weight values are properly preserved
    const confirmCompletion = async (workout) => {
        try {
            console.log("Confirming completion for workout with ID:", workout._id);
            console.log("Workout data being sent:", JSON.stringify(workout, null, 2));
            
            // Ensure weight is properly set
            let updatedWorkout = { ...workout };
            if (updatedWorkout.category === 'Bodyweight' && 
                (updatedWorkout.weight === undefined || updatedWorkout.weight === null)) {
                updatedWorkout.weight = 0;
                console.log("Setting default weight 0 for bodyweight exercise");
            }
            
            // Send the complete workout data to ensure all fields are preserved
            const response = await axios.post(
                `${API_URL}api/workouts/${workout._id}/complete`,
                {
                    workoutData: updatedWorkout, // Send the full workout data
                    weight: updatedWorkout.weight, // Also send weight explicitly for backward compatibility
                    category: updatedWorkout.category,
                    exerciseName: updatedWorkout.exerciseName,
                    sets: updatedWorkout.sets,
                    reps: updatedWorkout.reps
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.status === 200) {
                // Add to completed workouts
                const newCompletedWorkout = response.data.completedWorkout;
                console.log("Received completed workout from API:", JSON.stringify(newCompletedWorkout, null, 2));
                
                // Ensure the completed workout has weight
                if ((newCompletedWorkout.weight === undefined || newCompletedWorkout.weight === null) && 
                    updatedWorkout.weight !== undefined) {
                    newCompletedWorkout.weight = updatedWorkout.weight;
                    console.log("Manually adding weight to API response:", newCompletedWorkout.weight);
                }
                
                setCompletedWorkouts(prev => {
                    // Check if this workout is already in the completed workouts list
                    const exists = prev.some(cw => 
                        cw.workoutId === workout._id || cw._id === workout._id
                    );
                    
                    if (exists) {
                        console.log("Workout already in completed list, updating");
                        return prev.map(cw => 
                            (cw.workoutId === workout._id || cw._id === workout._id) 
                                ? { ...newCompletedWorkout, weight: updatedWorkout.weight } 
                                : cw
                        );
                    } else {
                        console.log("Adding workout to completed list");
                        return [...prev, newCompletedWorkout];
                    }
                });
                
                // Update the workout in the workouts array to show as completed
                setWorkouts(prev => prev.map(w => 
                    w._id === workout._id ? { 
                        ...w, 
                        completed: true, 
                        weight: updatedWorkout.weight 
                    } : w
                ));
                
                showToast("Workout completed successfully! ", "success");
            }
        } catch (error) {
            console.error("Error completing workout:", error);
            showToast("Failed to complete workout", "error");
        }
    };

    // Update the isWorkoutCompleted function to be more robust
    const isWorkoutCompleted = (workoutId) => {
        // We need to check multiple conditions to determine if a workout is completed
        
        // 1. Check if it's in the completedWorkouts array
        const isInCompletedArray = completedWorkouts.some(cw => 
            (cw.workoutId === workoutId) || (cw._id === workoutId)
        );
        
        // 2. Check if the workout itself has completed flag
        const hasCompletedFlag = workouts.some(w => 
            (w._id === workoutId) && (w.completed === true)
        );
        
        console.log(`Checking completion for workout ${workoutId}: isInCompletedArray=${isInCompletedArray}, hasCompletedFlag=${hasCompletedFlag}`);
        
        return isInCompletedArray || hasCompletedFlag;
    };

    // Update the renderWorkoutCard function to better handle the completed state and undefined weights
    const renderWorkoutCard = (workout) => {
        // Determine if the workout is completed
        const completed = isWorkoutCompleted(workout._id);
        
        // Find the completed workout entry if it exists
        const completedWorkoutEntry = completedWorkouts.find(cw => 
            cw.workoutId === workout._id || cw._id === workout._id
        );
        
        // Use values from completed workout entry if available
        const workoutWeight = completedWorkoutEntry && completedWorkoutEntry.weight !== undefined 
            ? completedWorkoutEntry.weight 
            : (completedWorkoutEntry && completedWorkoutEntry.weightLifted !== undefined
                ? completedWorkoutEntry.weightLifted
                : workout.weight);
                
        // Similarly, get sets and reps from the completed workout if available
        const workoutSets = completedWorkoutEntry && completedWorkoutEntry.setsCompleted !== undefined
            ? completedWorkoutEntry.setsCompleted
            : (completedWorkoutEntry && completedWorkoutEntry.sets !== undefined
                ? completedWorkoutEntry.sets
                : workout.sets);
                
        const workoutReps = completedWorkoutEntry && completedWorkoutEntry.repsCompleted !== undefined
            ? completedWorkoutEntry.repsCompleted
            : (completedWorkoutEntry && completedWorkoutEntry.reps !== undefined
                ? completedWorkoutEntry.reps
                : workout.reps);
            
        console.log(`Rendering workout ${workout._id}, completed=${completed}, workoutWeight=${workoutWeight}, workoutSets=${workoutSets}, workoutReps=${workoutReps}`);
        
        // If completed workout found, log its data for debugging
        if (completedWorkoutEntry) {
            console.log(`Found completed workout entry: ID=${completedWorkoutEntry._id}, weight=${completedWorkoutEntry.weight}, weightLifted=${completedWorkoutEntry.weightLifted}, sets=${completedWorkoutEntry.sets}, setsCompleted=${completedWorkoutEntry.setsCompleted}, reps=${completedWorkoutEntry.reps}, repsCompleted=${completedWorkoutEntry.repsCompleted}`);
        }
        
        // Handle undefined or missing weight
        let weightDisplay;
        if (workout.category === 'Bodyweight') {
            weightDisplay = 'N/A'; // Changed from 'Bodyweight' to 'N/A' for cleaner display
        } else if (workoutWeight === undefined || workoutWeight === null) {
            weightDisplay = 'Not specified';
        } else {
            weightDisplay = `${workoutWeight} lbs`;
        }
        
        return (
            <div className={`workout-card ${completed ? 'completed' : ''}`} key={workout._id}>
                {completed && (
                    <div className="completed-badge">
                        <span className="complete-icon">✓</span>
                        COMPLETED
                    </div>
                )}
                
                <div className={`workout-content ${completed ? 'completed-text' : ''}`}>
                    <h3 className="workout-title">{workout.category}</h3>
                    <div className="card-category">{workout.exerciseName}</div>
                    <div className="workout-details">
                        <div className="detail-box"><span>TARGET :</span> {workout.target}</div>
                        <div className="detail-box"><span>REPS :</span> {workoutReps}</div>
                    </div>
                    <div className="workout-details">
                        <div className="detail-box"><span>SET :</span> {workoutSets}</div>
                        {workout.category === 'Bodyweight' ? (
                            // For bodyweight exercises, display a minimal weight field
                            <div className="detail-box"><span>WEIGHT :</span> —</div>
                        ) : (
                            // For other exercises, show the weight
                            <div className="detail-box"><span>WEIGHT :</span> {weightDisplay}</div>
                        )}
                    </div>
                    {workout.description && ( 
                        <div className="description-box">
                            <span>DESCRIPTION :</span> 
                            {workout.description}
                        </div>
                    )}
                    
                    {/* Single set of action buttons */}
                    <div className="workout-actions">
                        {!completed && (
                            <>
                                <button 
                                    className="button-edit"
                                    onClick={() => handleEditClick(workout)}
                                >
                                    EDIT
                                </button>
                                <button 
                                    className="button-complete" 
                                    onClick={() => handleCompleteWorkout(workout)}
                                    disabled={completed}
                                >
                                    COMPLETE WORKOUT
                                </button>
                            </>
                        )}
                        <button 
                            className="button-delete"
                            onClick={() => handleDeleteWorkout(workout._id)}
                        >
                            DELETE
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="page-container">
            <div className="page-content">
                <div className="page-header">
                    <h1>My Workouts</h1>
                    <button 
                        onClick={() => { 
                            setEditingWorkout(null); 
                            setNewWorkout({
                                name: '',
                                description: '',
                                category: '',
                                target: '',
                                exerciseName: '',
                                sets: '',
                                reps: '',
                                weight: ''
                            }); 
                            setShowModal(true); 
                        }}
                        className="add-button"
                    >
                        Add New Workout
                    </button>
                </div>

                {/* Workout tabs */}
                <div className="profile-style-tabs">
                    <button 
                        className={`profile-style-tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Added Workouts
                    </button>
                    <button 
                        className={`profile-style-tab ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed
                    </button>
                    <button 
                        className={`profile-style-tab ${activeTab === 'progress' ? 'active' : ''}`}
                        onClick={() => setActiveTab('progress')}
                    >
                        Track Progress
                    </button>
                </div>

                {/* Added Workouts Tab Content - Show only non-completed workouts */}
                {activeTab === 'all' && (
                    <div className="cards-container">
                        <div className="daily-limit-notice">
                            <p>You can add up to 12 workouts per day</p>
                        </div>
                        {workouts.filter(workout => !isWorkoutCompleted(workout._id) && !workout.completed).length > 0 ? (
                            workouts.filter(workout => !isWorkoutCompleted(workout._id) && !workout.completed).map(workout => renderWorkoutCard(workout))
                        ) : (
                            <div className="no-workouts-message">
                                <p>No added workouts found. Add a new workout to get started!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Completed Workouts Tab Content */}
                {activeTab === 'completed' && (
                    <div className="completed-workouts-container">
                        <div className="time-filter-container" ref={timeFilterRef}>
                            <div 
                                className="time-filter-dropdown"
                                onClick={() => setShowTimeFilter(!showTimeFilter)}
                            >
                                <span className="time-filter-label">{getTimeFilterLabel()}</span>
                                <FaChevronDown className="dropdown-icon" />
                            </div>
                            
                            {showTimeFilter && (
                                <div className="time-filter-options">
                                    <div
                                        className={`time-option ${timePeriod === 'all' ? 'active' : ''}`}
                                        onClick={() => handleTimePeriodChange('all')}
                                    >
                                        All Time
                                    </div>
                                    
                                    <div 
                                        className={`time-option ${timePeriod === 'monthly' && !selectedMonth ? 'active' : ''}`}
                                        onClick={() => handleTimePeriodChange('monthly')}
                                    >
                                        Monthly
                                    </div>
                                    
                                    {availableMonths.map((month, idx) => (
                                        <div 
                                            key={`month-${idx}`}
                                            className={`time-option time-option-indent ${selectedMonth && selectedMonth.name === month.name ? 'active' : ''}`}
                                            onClick={() => handleMonthSelect(month)}
                                        >
                                            {month.name}
                                        </div>
                                    ))}
                                    
                                    <div 
                                        className={`time-option ${timePeriod === 'weekly' ? 'active' : ''}`}
                                        onClick={() => handleTimePeriodChange('weekly')}
                                    >
                                        Weekly
                                    </div>
                                    
                                    {selectedMonth && availableWeeks.length > 0 && (
                                        availableWeeks.map((week) => (
                                            <div 
                                                key={`week-${week.key}`}
                                                className={`time-option time-option-indent ${selectedWeek && selectedWeek.key === week.key ? 'active' : ''}`}
                                                onClick={() => handleWeekSelect(week)}
                                            >
                                                {week.name}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Combine completedWorkouts and workouts that have completed flag */}
                        <div className="cards-container">
                            {(() => {
                                // Get completed workouts from both sources
                                const completedFromApi = completedWorkouts || [];
                                const completedFromWorkouts = workouts.filter(w => w.completed === true);
                                
                                // Combine and remove duplicates (based on _id)
                                const allCompletedWorkouts = [...completedFromApi];
                                completedFromWorkouts.forEach(workout => {
                                    // Check if this workout is already in the array
                                    const exists = allCompletedWorkouts.some(w => 
                                        w._id === workout._id || w.workoutId === workout._id
                                    );
                                    
                                    if (!exists) {
                                        allCompletedWorkouts.push(workout);
                                    }
                                });
                                
                                console.log(`Total completed workouts: ${allCompletedWorkouts.length} (API: ${completedFromApi.length}, Workouts: ${completedFromWorkouts.length})`);
                                
                                // Apply time filters
                                const filteredWorkouts = getFilteredWorkouts(allCompletedWorkouts);
                                
                                // Check if there are any workouts to display
                                if (filteredWorkouts.length > 0) {
                                    return filteredWorkouts.map(workout => renderWorkoutCard(workout));
                                } else {
                                    return (
                                        <div className="no-workouts-message">
                                            <p>No completed workouts found for this time period.</p>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    </div>
                )}

                {/* Progress Tracking Tab Content */}
                {activeTab === 'progress' && (
                    <div className="progress-tracking-container">
                        <div className="progress-style-tabs">
                            <button 
                                className={`progress-style-tab ${trackingView === 'list' ? 'active' : ''}`}
                                onClick={() => setTrackingView('list')}
                            >
                                List View
                            </button>
                            <button 
                                className={`progress-style-tab ${trackingView === 'graph' ? 'active' : ''}`}
                                onClick={() => setTrackingView('graph')}
                            >
                                Graph View
                            </button>
                        </div>
                        
                        {/* Time filter for Progress tab */}
                        <div className="time-filter-container" ref={timeFilterRef}>
                            <div 
                                className="time-filter-dropdown"
                                onClick={() => setShowTimeFilter(!showTimeFilter)}
                            >
                                <span className="time-filter-label">{getTimeFilterLabel()}</span>
                                <FaChevronDown className="dropdown-icon" />
                            </div>
                            
                            {showTimeFilter && (
                                <div className="time-filter-options">
                                    <div
                                        className={`time-option ${timePeriod === 'all' ? 'active' : ''}`}
                                        onClick={() => handleTimePeriodChange('all')}
                                    >
                                        All Time
                                    </div>
                                    
                                    <div 
                                        className={`time-option ${timePeriod === 'monthly' && !selectedMonth ? 'active' : ''}`}
                                        onClick={() => handleTimePeriodChange('monthly')}
                                    >
                                        Monthly
                                    </div>
                                    
                                    {availableMonths.map((month, idx) => (
                                        <div 
                                            key={`month-${idx}`}
                                            className={`time-option time-option-indent ${selectedMonth && selectedMonth.name === month.name ? 'active' : ''}`}
                                            onClick={() => handleMonthSelect(month)}
                                        >
                                            {month.name}
                                        </div>
                                    ))}
                                    
                                    <div 
                                        className={`time-option ${timePeriod === 'weekly' ? 'active' : ''}`}
                                        onClick={() => handleTimePeriodChange('weekly')}
                                    >
                                        Weekly
                                    </div>
                                    
                                    {selectedMonth && availableWeeks.length > 0 && (
                                        availableWeeks.map((week, index) => (
                                            <div 
                                                key={`week-${week.key}`}
                                                className={`time-option time-option-indent ${selectedWeek && selectedWeek.key === week.key ? 'active' : ''}`}
                                                onClick={() => handleWeekSelect(week)}
                                            >
                                                {week.name}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {trackingView === 'list' ? (
                            <div className="progress-list-view">
                                {getFilteredWorkouts(completedWorkouts).length > 0 ? (
                                    <div className="cards-container">
                                        {getFilteredWorkouts(completedWorkouts).map(workout => renderWorkoutCard(workout))}
                                    </div>
                                ) : (
                                    <div className="no-workouts-message">
                                        <p>No completed workouts found for this time period.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="progress-graph-view">
                                {completedWorkouts.length > 0 ? (
                                    <>
                                        <div className="chart-container workout-category-chart">
                                            <h3 className="chart-title">Workouts By Category</h3>
                                            <div className="chart-wrapper">
                                                <Bar data={getCategoryChartData()} options={chartOptions} />
                                            </div>
                                        </div>
                                        
                                        <div className="chart-container workout-target-chart">
                                            <h3 className="chart-title">Workouts By Target Muscle</h3>
                                            <div className="chart-wrapper">
                                                <Bar data={getTargetChartData()} options={chartOptions} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="no-workouts-message">
                                        <p>No workout data available. Complete workouts to see your progress!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="edit-modal" onClick={e => e.stopPropagation()}>
                        <h2>{editingWorkout ? 'Edit Workout' : 'New Workout'}</h2>
                        
                        <div className="input-group">
                            <label>Category</label>
                            <select
                                value={newWorkout.category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                            >
                                <option value="">Select category</option>
                                <option value="Dumbbell">Dumbbell</option>
                                <option value="Machine">Machine</option>
                                <option value="Barbell">Barbell</option>
                                <option value="Bodyweight">Bodyweight</option>
                            </select>
                        </div>

                        {(newWorkout.category === 'Dumbbell' || newWorkout.category === 'Machine' || newWorkout.category === 'Barbell' || newWorkout.category === 'Bodyweight') && (
                            <>
                                <div className="input-group">
                                    <label>Target</label>
                                    <select
                                        value={newWorkout.target}
                                        onChange={(e) => handleTargetChange(e.target.value)}
                                    >
                                        <option value="">Select target</option>
                                        {availableTargets.map(target => (
                                            <option key={target} value={target}>{target}</option>
                                        ))}
                                    </select>
                                </div>

                                {newWorkout.target && (
                                    <div className="input-group">
                                        <label>Exercise</label>
                                        <select
                                            value={newWorkout.exerciseName}
                                            onChange={(e) => setNewWorkout({ 
                                                ...newWorkout, 
                                                exerciseName: e.target.value,
                                                name: e.target.value // Set name to match exercise name
                                            })}
                                        >
                                            <option value="">Select exercise</option>
                                            {availableExercises.map(exercise => (
                                                <option key={exercise} value={exercise}>{exercise}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {newWorkout.exerciseName && (
                                    <>
                                        <div className="input-group">
                                            <label>Sets (max: {
                                                newWorkout.category === 'Dumbbell' ? '8' : '12'
                                            })</label>
                                            <input
                                                type="number"
                                                value={newWorkout.sets}
                                                onChange={(e) => handleInputChange(e, 'sets')}
                                                min="1"
                                                max={newWorkout.category === 'Dumbbell' ? '8' : '12'}
                                                placeholder="Number of sets"
                                            />
                                        </div>

                                        <div className="input-group">
                                            <label>
                                                Reps (max: {newWorkout.category === 'Bodyweight' ? '100' : '50'})
                                            </label>
                                            <input
                                                type="number"
                                                value={newWorkout.reps}
                                                onChange={(e) => handleInputChange(e, 'reps')}
                                                min="1"
                                                max={newWorkout.category === 'Bodyweight' ? 100 : 50}
                                                placeholder="Number of reps"
                                            />
                                        </div>

                                        {newWorkout.category !== 'Bodyweight' && (
                                            <div className="input-group">
                                                <label>Weight (max: {
                                                    newWorkout.category === 'Dumbbell' ? '120' :
                                                    newWorkout.category === 'Barbell' ? '600' : '400'
                                                } lbs)</label>
                                                <input
                                                    type="number"
                                                    value={newWorkout.weight}
                                                    onChange={(e) => handleInputChange(e, 'weight')}
                                                    min="0"
                                                    max={
                                                        newWorkout.category === 'Dumbbell' ? 120 :
                                                        newWorkout.category === 'Barbell' ? 600 : 400
                                                    }
                                                    placeholder="Weight in lbs"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        <div className="input-group">
                            <label>Description</label>
                            <textarea
                                className="auto-expand"
                                value={newWorkout.description}
                                onChange={(e) => setNewWorkout({ 
                                    ...newWorkout, 
                                    description: e.target.value 
                                })}
                                placeholder="Add any notes about your workout"
                            />
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setShowModal(false)} className="button-cancel">
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveWorkout} 
                                className="button-save"
                                disabled={!validateWorkout(newWorkout)}
                            >
                                {editingWorkout ? 'Save ' : 'Create '}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default MyWorkout;