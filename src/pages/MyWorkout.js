import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { DUMBBELL_EXERCISES } from './dumbbellConstants';
import { MACHINE_EXERCISES } from './machineConstants';
import { BARBELL_EXERCISES } from './barbellConstants';
import { BODYWEIGHT_EXERCISES } from './bodyWeightConstants';
import "../styles/MyWorkout.css";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <p>{message}</p>
            <div className="confirm-actions">
                <button className="button-cancel" onClick={onCancel}>Cancel</button>
                <button className="button-delete confirm" onClick={onConfirm}>Delete</button>
            </div>
        </div>
    </div>
);

// Add this component inside MyWorkout.js before the main component
const CompletionModal = ({ workout, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="completion-modal" onClick={e => e.stopPropagation()}>
            <h3>Complete Workout</h3>
            <p>Are you sure you want to mark <strong>{workout.exerciseName}</strong> as completed?</p>
            <p>This action cannot be undone, and the workout will be locked for editing.</p>
            <div className="completion-actions">
                <button className="completion-cancel" onClick={onCancel}>
                    Cancel
                </button>
                <button className="completion-confirm" onClick={onConfirm}>
                    Mark as Complete
                </button>
            </div>
        </div>
    </div>
);

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
    const [showConfirmModal, setShowConfirmModal] = useState({ show: false, workoutId: null, message: "" });
    const [completedWorkouts, setCompletedWorkouts] = useState([]);
    const [completionModal, setCompletionModal] = useState({ show: false, workout: null });
    const [myworkoutsTab, setMyworkoutsTab] = useState('added'); // 'added', 'completed', 'progress'
    const [progressFilter, setProgressFilter] = useState('all'); // 'all', 'monthly', 'weekly'
    const [progressMonth, setProgressMonth] = useState(null);
    const [progressWeek, setProgressWeek] = useState(null);
    const [progressType, setProgressType] = useState('added'); // 'added' or 'completed'
    const [showGraph, setShowGraph] = useState(false);

    // Update fetchWorkouts function
    const fetchWorkouts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await axios.get(`${API_URL}api/workouts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                // Fetch completed workouts separately to ensure we have the latest data
                await fetchCompletedWorkouts();
                
                // Use the completed workouts data to mark workouts as completed
                const updatedWorkouts = response.data.map(workout => {
                    // Check if this workout is in the completedWorkouts array
                    const isCompleted = completedWorkouts.some(cw => 
                        cw.workoutId === workout._id || 
                        cw._id === workout._id
                    );
                    // If it is, mark it as completed
                    return {
                        ...workout,
                        completed: isCompleted || workout.completed
                    };
                });
                
                setWorkouts(updatedWorkouts);
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
            const response = await axios.get(`${API_URL}api/workouts/completed`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompletedWorkouts(response.data);
        } catch (error) {
            console.error('Error fetching completed workouts:', error);
            showToast('Failed to fetch completed workouts', 'error');
        }
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
        
        showToast(errorMessage, 'error');
    }
};

// Update the handleDeleteWorkout function
const handleDeleteWorkout = async (id) => {
    setShowConfirmModal({
        show: true,
        workoutId: id,
        message: "Are you sure you want to delete this workout?"
    });
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
        setShowConfirmModal({ show: false, workoutId: null, message: "" });
    } catch (error) {
        console.error('Delete error:', error);
        showToast(
            error.response?.data?.error || 'Error deleting workout', 
            'error'
        );
        setShowConfirmModal({ show: false, workoutId: null, message: "" });
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
        setCompletionModal({ show: true, workout });
    };

    // Add this function to handle the completion confirmation
    const confirmCompletion = async (workout) => {
        try {
            const response = await axios.post(
                `${API_URL}api/workouts/${workout._id}/complete`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.status === 200) {
                // Add to completed workouts
                const newCompletedWorkout = response.data.completedWorkout;
                setCompletedWorkouts(prev => [...prev, newCompletedWorkout]);
                
                // Update the workout in the workouts array to show as completed
                setWorkouts(prev => prev.map(w => 
                    w._id === workout._id ? { ...w, completed: true } : w
                ));
                
                showToast("Workout completed successfully! ", "success");
            }
        } catch (error) {
            console.error("Error completing workout:", error);
            showToast("Failed to complete workout", "error");
        } finally {
            setCompletionModal({ show: false, workout: null });
        }
    };

    // Update the isWorkoutCompleted function to be more robust
    const isWorkoutCompleted = (workoutId) => {
        // Check both the completedWorkouts array and the workout's own completed status
        return completedWorkouts.some(cw => cw.workoutId === workoutId || cw._id === workoutId) ||
               workouts.some(w => w._id === workoutId && w.completed === true);
    };

    // Update the renderWorkoutCard function to better handle the completed state
    const renderWorkoutCard = (workout) => {
        const completed = isWorkoutCompleted(workout._id) || workout.completed === true;
        
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
                        <div className="detail-box"><span>REPS :</span> {workout.reps}</div>
                    </div>
                    <div className="workout-details">
                        <div className="detail-box"><span>SET :</span> {workout.sets}</div>
                        <div className="detail-box"><span>WEIGHT :</span> {workout.weight} lbs</div>
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
                                    {window.innerWidth <= 768 ? 'COMPLETE' : 'COMPLETE WORKOUT'}
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

    // Helper to get months and weeks from workouts
    const getMonthsAndWeeks = (workouts) => {
        const months = {};
        const weeks = {};
        workouts.forEach(w => {
            const date = new Date(w.createdAt || w.completedDate || w.updatedAt);
            // Format month as 'YYYY-MM' for key, and store Date for display
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!months[monthKey]) months[monthKey] = { list: [], date, weeks: new Set() };
            months[monthKey].list.push(w);
            
            // Create week key based on the start of the week (Sunday)
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            // Format week key to include month for better organization
            const weekKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
            
            // Store the week key with the month data for filtering
            months[monthKey].weeks.add(weekKey);
            
            if (!weeks[weekKey]) {
                weeks[weekKey] = {
                    list: [],
                    startDate: weekStart,
                    endDate: weekEnd,
                    monthKey: monthKey
                };
            }
            weeks[weekKey].list.push(w);
        });
        return { months, weeks };
    };

    // Filtering for main tabs
    const notCompletedWorkouts = workouts.filter(w => !isWorkoutCompleted(w._id) && !w.completed);
    const onlyCompletedWorkouts = workouts.filter(w => isWorkoutCompleted(w._id) || w.completed);

    // Progress tab filtering
    let progressSource = progressType === 'added' ? notCompletedWorkouts : onlyCompletedWorkouts;
    
    // For Track Progress, we want to show only completed workouts
    if (myworkoutsTab === 'progress') {
        // Track Progress now only shows completed workouts
        progressSource = onlyCompletedWorkouts;
        // Reset progress type to avoid confusion
        if (progressType !== 'completed') {
            setProgressType('completed');
        }
    }
    
    const { months: progressMonths, weeks: progressWeeks } = getMonthsAndWeeks(progressSource);
    let filteredProgress = progressSource;
    
    // Get all week options or filter by selected month
    const getWeeksForMonth = (monthKey) => {
        if (!monthKey) return [];
        return [...(progressMonths[monthKey]?.weeks || [])];
    };
    
    // Get week data for the selected month
    const currentMonthWeeks = progressMonth ? getWeeksForMonth(progressMonth) : [];
    
    // Format options for month dropdown
    const progressMonthOptions = Object.keys(progressMonths).sort((a, b) => b.localeCompare(a));
    
    // Sort weeks by date (newest first)
    currentMonthWeeks.sort((a, b) => {
        const dateA = a.split('-').map(n => parseInt(n, 10));
        const dateB = b.split('-').map(n => parseInt(n, 10));
        // Compare year, then month, then day
        if (dateA[0] !== dateB[0]) return dateB[0] - dateA[0];
        if (dateA[1] !== dateB[1]) return dateB[1] - dateA[1];
        return dateB[2] - dateA[2];
    });
    
    // Format month for display
    const getMonthDisplay = (key) => {
        const [year, month] = key.split('-');
        const date = new Date(year, parseInt(month, 10) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };
    
    // Format week for display
    const getWeekDisplay = (key) => {
        const weekData = progressWeeks[key];
        if (!weekData) return key;
        
        const { startDate, endDate } = weekData;
        const startMonth = startDate.toLocaleString('default', { month: 'short' });
        const endMonth = endDate.toLocaleString('default', { month: 'short' });
        
        // If start and end dates are in the same month
        if (startMonth === endMonth) {
            return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
        }
        
        // If they span different months
        return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${startDate.getFullYear()}`;
    };
    
    // Determine what to display based on filter selections
    let displayWorkouts = [];
    if (progressFilter === 'all') {
        // Show all workouts
        displayWorkouts = filteredProgress;
    } else if (progressFilter === 'monthly') {
        if (progressMonth && progressWeek) {
            // Show workouts for the selected week within the month
            displayWorkouts = progressWeeks[progressWeek]?.list || [];
        } else if (progressMonth) {
            // If month selected but no week, show all workouts for that month
            displayWorkouts = progressMonths[progressMonth]?.list || [];
        } else {
            // Default to all workouts if no month selected
            displayWorkouts = filteredProgress;
        }
    } else if (progressFilter === 'weekly' && progressWeek) {
        // Weekly view - show workouts for selected week
        displayWorkouts = progressWeeks[progressWeek]?.list || [];
    }
    
    // Update week filter when month changes
    useEffect(() => {
        // Reset week selection when month changes
        setProgressWeek(null);
    }, [progressMonth]);

    // Add confirmation state for delete all
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
    
    // Handle delete all workouts
    const handleDeleteAllWorkouts = () => {
        setShowDeleteAllConfirm(true);
    };
    
    // Confirm delete all workouts
    const confirmDeleteAllWorkouts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Authentication required', 'error');
                return;
            }
            
            // Only delete workouts shown in the current filter
            const workoutIds = displayWorkouts.map(workout => workout._id);
            if (workoutIds.length === 0) {
                showToast('No workouts to delete', 'info');
                setShowDeleteAllConfirm(false);
                return;
            }
            
            // Make API calls to delete each workout
            const deletePromises = workoutIds.map(id => 
                axios.delete(`${API_URL}api/workouts/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            );
            
            await Promise.all(deletePromises);
            
            showToast(`Deleted ${workoutIds.length} workouts`, 'success');
            await fetchWorkouts();
            setShowDeleteAllConfirm(false);
        } catch (error) {
            console.error('Delete all error:', error);
            showToast(
                error.response?.data?.error || 'Error deleting workouts', 
                'error'
            );
            setShowDeleteAllConfirm(false);
        }
    };
    
    // Function to render workout card differently based on context
    const renderWorkoutCardForTrackProgress = (workout) => {
        const completed = isWorkoutCompleted(workout._id) || workout.completed === true;
        
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
                        <div className="detail-box"><span>REPS :</span> {workout.reps}</div>
                    </div>
                    <div className="workout-details">
                        <div className="detail-box"><span>SET :</span> {workout.sets}</div>
                        <div className="detail-box"><span>WEIGHT :</span> {workout.weight} lbs</div>
                    </div>
                    {workout.description && ( 
                        <div className="description-box">
                            <span>DESCRIPTION :</span> 
                            {workout.description}
                        </div>
                    )}
                    
                    {/* Only DELETE button for Track Progress */}
                    <div className="workout-actions track-progress-actions">
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

    // Function to extract graph data from completed workouts
    const getWorkoutStats = () => {
        // Skip if no workouts or not in progress tab
        if (!displayWorkouts || displayWorkouts.length === 0 || myworkoutsTab !== 'progress') {
            return {
                categories: {},
                targets: {},
                maxCategory: 0,
                maxTarget: 0
            };
        }
        
        // Count workouts by category and target
        const categories = {};
        const targets = {};
        
        displayWorkouts.forEach(workout => {
            // Count by category
            categories[workout.category] = (categories[workout.category] || 0) + 1;
            
            // Count by target muscle
            targets[workout.target] = (targets[workout.target] || 0) + 1;
        });
        
        // Find max values for scaling
        const maxCategory = Math.max(...Object.values(categories));
        const maxTarget = Math.max(...Object.values(targets));
        
        return {
            categories,
            targets,
            maxCategory,
            maxTarget
        };
    };
    
    // Get the workout statistics
    const { categories: graphCategories, targets: graphTargets, maxCategory: graphMaxCategory, maxTarget: graphMaxTarget } = getWorkoutStats();

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

                <div className="myworkouts-tabs-bar">
                    <button
                        className={`myworkouts-tab${myworkoutsTab === 'added' ? ' myworkouts-tab-active' : ''}`}
                        onClick={() => setMyworkoutsTab('added')}
                    >Added Workouts</button>
                    <button
                        className={`myworkouts-tab${myworkoutsTab === 'completed' ? ' myworkouts-tab-active' : ''}`}
                        onClick={() => setMyworkoutsTab('completed')}
                    >Completed Workouts</button>
                    <button
                        className={`myworkouts-tab${myworkoutsTab === 'progress' ? ' myworkouts-tab-active' : ''}`}
                        onClick={() => setMyworkoutsTab('progress')}
                    >Track Progress</button>
                </div>

                {myworkoutsTab === 'added' && (
                    <div className="myworkouts-added-list">
                        {notCompletedWorkouts.length === 0 ? <div>No added workouts.</div> : notCompletedWorkouts.map(renderWorkoutCard)}
                    </div>
                )}
                {myworkoutsTab === 'completed' && (
                    <div className="myworkouts-completed-list">
                        {onlyCompletedWorkouts.length === 0 ? <div>No completed workouts.</div> : onlyCompletedWorkouts.map(renderWorkoutCard)}
                    </div>
                )}
                {myworkoutsTab === 'progress' && (
                    <div className="myworkouts-progress-section">
                        <div className="myworkouts-progress-view-toggle">
                            <button
                                className={`myworkouts-view-toggle-btn${!showGraph ? ' active' : ''}`}
                                onClick={() => setShowGraph(false)}
                            >
                                List View
                            </button>
                            <button
                                className={`myworkouts-view-toggle-btn${showGraph ? ' active' : ''}`}
                                onClick={() => setShowGraph(true)}
                            >
                                Graph View
                            </button>
                        </div>
                        
                        <div className="myworkouts-progress-dropdown-bar">
                            <select
                                className="myworkouts-progress-dropdown"
                                value={progressFilter}
                                onChange={e => {
                                    setProgressFilter(e.target.value);
                                    setProgressMonth(null);
                                    setProgressWeek(null);
                                }}
                            >
                                <option value="all">All Time</option>
                                <option value="monthly">Monthly</option>
                                <option value="weekly">Weekly</option>
                            </select>
                            {progressFilter === 'monthly' && (
                                <>
                                    <select
                                        className="myworkouts-progress-month-dropdown"
                                        value={progressMonth || ''}
                                        onChange={e => setProgressMonth(e.target.value)}
                                    >
                                        <option value="">Select Month</option>
                                        {progressMonthOptions.map(m => <option key={m} value={m}>{getMonthDisplay(m)}</option>)}
                                    </select>
                                    
                                    {progressMonth && currentMonthWeeks.length > 0 && (
                                        <select
                                            className="myworkouts-progress-week-dropdown"
                                            value={progressWeek || ''}
                                            onChange={e => setProgressWeek(e.target.value)}
                                        >
                                            <option value="">All Weeks</option>
                                            {currentMonthWeeks.map(w => 
                                                <option key={w} value={w}>{getWeekDisplay(w)}</option>
                                            )}
                                        </select>
                                    )}
                                </>
                            )}
                            {progressFilter === 'weekly' && (
                                <select
                                    className="myworkouts-progress-week-dropdown"
                                    value={progressWeek || ''}
                                    onChange={e => setProgressWeek(e.target.value)}
                                >
                                    <option value="">Select Week</option>
                                    {Object.keys(progressWeeks).sort((a, b) => b.localeCompare(a))
                                        .map(w => <option key={w} value={w}>{getWeekDisplay(w)}</option>)
                                    }
                                </select>
                            )}
                        </div>
                        
                        {/* List View */}
                        {!showGraph && (
                            <div className="myworkouts-progress-lists">
                                <div>
                                    <h3>Completed Workouts</h3>
                                    
                                    {/* Delete All button */}
                                    {displayWorkouts.length > 0 && (
                                        <div className="delete-all-container">
                                            <button 
                                                className="button-delete-all"
                                                onClick={handleDeleteAllWorkouts}
                                            >
                                                Delete All Shown Workouts
                                            </button>
                                        </div>
                                    )}
                                    
                                    {/* Display title based on selection */}
                                    {progressFilter === 'monthly' && progressMonth && (
                                        <h4 className="month-title">
                                            {getMonthDisplay(progressMonth)}
                                            {progressWeek && ` - ${getWeekDisplay(progressWeek)}`}
                                        </h4>
                                    )}
                                    
                                    {progressFilter === 'weekly' && progressWeek && (
                                        <h4 className="week-title">{getWeekDisplay(progressWeek)}</h4>
                                    )}
                                    
                                    {/* Display workouts */}
                                    {displayWorkouts.length === 0 ? (
                                        <div className="no-workouts-message">
                                            No workouts found for the selected time period.
                                        </div>
                                    ) : (
                                        displayWorkouts.map(renderWorkoutCardForTrackProgress)
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Simple Graph View using CSS */}
                        {showGraph && (
                            <div className="workouts-graph-container">
                                <h3>Workout Completion Analytics</h3>
                                
                                {/* Display title based on selection */}
                                {progressFilter === 'monthly' && progressMonth && (
                                    <h4 className="month-title">
                                        {getMonthDisplay(progressMonth)}
                                        {progressWeek && ` - ${getWeekDisplay(progressWeek)}`}
                                    </h4>
                                )}
                                
                                {progressFilter === 'weekly' && progressWeek && (
                                    <h4 className="week-title">{getWeekDisplay(progressWeek)}</h4>
                                )}
                                
                                {displayWorkouts.length === 0 ? (
                                    <div className="no-workouts-message">
                                        No workout data available for the selected time period.
                                    </div>
                                ) : (
                                    <div className="basic-stats-container">
                                        <div className="stats-section">
                                            <h5 className="graph-title">Workouts by Equipment Type</h5>
                                            <div className="scrollable-chart">
                                                <div className="stats-bars">
                                                    {Object.entries(graphCategories).map(([category, count]) => (
                                                        <div className="stats-bar-group" key={`cat-${category}`}>
                                                            <div 
                                                                className="stats-bar" 
                                                                style={{ 
                                                                    height: `${(count / graphMaxCategory) * 180}px`,
                                                                    backgroundColor: category === 'Barbell' ? '#4cc9f0' :
                                                                                      category === 'Dumbbell' ? '#8338ec' :
                                                                                      category === 'Machine' ? '#fb5607' : '#00A951'
                                                                }}
                                                            ></div>
                                                            <div className="stats-label">{category}</div>
                                                            <div className="stats-value">{count}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="stats-section">
                                            <h5 className="graph-title">Workouts by Muscle Group</h5>
                                            <div className="scrollable-chart">
                                                <div className="stats-bars">
                                                    {Object.entries(graphTargets).map(([target, count]) => (
                                                        <div className="stats-bar-group" key={`target-${target}`}>
                                                            <div 
                                                                className="stats-bar" 
                                                                style={{ 
                                                                    height: `${(count / graphMaxTarget) * 180}px`,
                                                                    backgroundColor: 'rgba(0, 169, 81, 0.8)'
                                                                }}
                                                            ></div>
                                                            <div className="stats-label">{target}</div>
                                                            <div className="stats-value">{count}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
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
            {showConfirmModal.show && (
                <ConfirmationModal
                    message={showConfirmModal.message}
                    onConfirm={() => confirmDelete(showConfirmModal.workoutId)}
                    onCancel={() => setShowConfirmModal({ show: false, workoutId: null, message: "" })}
                />
            )}
            {completionModal.show && (
                <CompletionModal
                    workout={completionModal.workout}
                    onConfirm={() => confirmCompletion(completionModal.workout)}
                    onCancel={() => setCompletionModal({ show: false, workout: null })}
                />
            )}
            {/* Delete All Confirmation Modal */}
            {showDeleteAllConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteAllConfirm(false)}>
                    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                        <p>Are you sure you want to delete all {displayWorkouts.length} workouts currently shown?</p>
                        <p className="warning-text">This action cannot be undone!</p>
                        <div className="confirm-actions">
                            <button className="button-cancel" onClick={() => setShowDeleteAllConfirm(false)}>Cancel</button>
                            <button className="button-delete confirm" onClick={confirmDeleteAllWorkouts}>Delete All</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyWorkout;