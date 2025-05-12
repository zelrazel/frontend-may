import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { BODYWEIGHT_EXERCISES } from './bodyWeightConstants';
import { DUMBBELL_EXERCISES } from './dumbbellConstants';
import { MACHINE_EXERCISES } from './machineConstants';
import { BARBELL_EXERCISES } from './barbellConstants';
import '../styles/WorkoutSchedule.css';
import Swal from 'sweetalert2'; 

import { useNavigate, useLocation } from 'react-router-dom';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`schedule-toast ${type}`}>
            <span>{message}</span>
        </div>
    );
};

// Event popup component
const EventPopup = ({ workout, onClose, onEdit, onDelete }) => (
    <div className="event-popup">
        <button className="close-popup" onClick={onClose}>
            <FaTimes />
        </button>
        <h3>{workout.exerciseName}</h3>
        <div className="event-popup-details">
            <p><strong>Date:</strong> {workout.date}</p>
            <p><strong>Time:</strong> {formatTime(workout.time)}</p>
            <p><strong>Category:</strong> {workout.category}</p>
            <p><strong>Target:</strong> {workout.target}</p>
        </div>
        <div className="event-popup-actions">
            <button className="edit" onClick={() => onEdit(workout)}>
                <FaEdit /> Edit
            </button>
            <button className="delete" onClick={() => onDelete(workout._id)}>
                <FaTrash /> Delete
            </button>
        </div>
    </div>
);

// Function to convert 24-hour time to 12-hour time with AM/PM (outside component)
const formatTime = (time) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const isPM = hour >= 12;
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
};

const WorkoutSchedule = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [token] = useState(localStorage.getItem('token'));
    const workoutItemsRef = useRef({});
    const [highlightedWorkoutId, setHighlightedWorkoutId] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate('/signin');
            return;
        }
    }, [token, navigate]);

    if (!token) {
        return null;
    }

    const [toasts, setToasts] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [workoutId, setWorkoutId] = useState(null);
    const [category, setCategory] = useState('');
    const [target, setTarget] = useState('');
    const [exerciseName, setExerciseName] = useState('');
    const [workoutTime, setWorkoutTime] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [availableTargets, setAvailableTargets] = useState([]);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [showClearAllModal, setShowClearAllModal] = useState(false);

    // Add state for event popup
    const [popupInfo, setPopupInfo] = useState({
        show: false,
        workout: null,
        position: { top: 0, left: 0 }
    });

    const API_URL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        fetchWorkouts();
    }, []);

    useEffect(() => {
        if (category && isEditing) {
            handleCategoryChange(category);
        }
    }, [category]);

    useEffect(() => {
        if (target && isEditing) {
            handleTargetChange(target);
        }
    }, [target]);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupInfo.show && !event.target.closest('.event-popup') && 
                !event.target.closest('.fc-event')) {
                setPopupInfo({...popupInfo, show: false});
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popupInfo]);

    // New useEffect to handle URL parameters from notifications
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const workoutId = searchParams.get('workoutId');
        
        if (workoutId) {
            setHighlightedWorkoutId(workoutId);
        }
    }, [location.search]);

    // Effect to scroll to highlighted workout after loading
    useEffect(() => {
        if (highlightedWorkoutId && workouts.length > 0) {
            // Find the workout with the matching ID
            const workout = workouts.find(w => w._id === highlightedWorkoutId);
            
            if (workout) {
                // Small timeout to ensure DOM is ready
                setTimeout(() => {
                    const workoutElement = workoutItemsRef.current[highlightedWorkoutId];
                    if (workoutElement) {
                        // Scroll the workout into view
                        workoutElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Add a highlight class temporarily
                        workoutElement.classList.add('workout-highlight');
                        setTimeout(() => {
                            workoutElement.classList.remove('workout-highlight');
                        }, 3000);
                    }
                }, 300);
            }
        }
    }, [highlightedWorkoutId, workouts]);

    const fetchWorkouts = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                Swal.fire({
                    title: '[ SESSION EXPIRED ]',
                    text: 'Please sign in to view your workouts',
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

            const response = await axios.get(`${API_URL}api/workout-schedule`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkouts(response.data);
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

    const handleCategoryChange = (selectedCategory) => {
        setCategory(selectedCategory);
        setTarget('');
        setExerciseName('');
        
        // Set available targets based on category
        let targets = [];
        switch (selectedCategory) {
            case 'Bodyweight':
                targets = Object.keys(BODYWEIGHT_EXERCISES);
                break;
            case 'Dumbbell':
                targets = Object.keys(DUMBBELL_EXERCISES);
                break;
            case 'Machine':
                targets = Object.keys(MACHINE_EXERCISES);
                break;
            case 'Barbell':
                targets = Object.keys(BARBELL_EXERCISES);
                break;
            default:
                targets = [];
        }
        setAvailableTargets(targets);
    };

    const handleTargetChange = (selectedTarget) => {
        setTarget(selectedTarget);
        setExerciseName('');
        
        // Set available exercises based on category and target
        let exercises = [];
        switch (category) {
            case 'Bodyweight':
                exercises = BODYWEIGHT_EXERCISES[selectedTarget] || [];
                break;
            case 'Dumbbell':
                exercises = DUMBBELL_EXERCISES[selectedTarget] || [];
                break;
            case 'Machine':
                exercises = MACHINE_EXERCISES[selectedTarget] || [];
                break;
            case 'Barbell':
                exercises = BARBELL_EXERCISES[selectedTarget] || [];
                break;
            default:
                exercises = [];
        }
        setAvailableExercises(exercises);
    };

    const showToast = (message, type) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        }, 3000);
    };

    // Update handleDateClick to include date validation
    const handleDateClick = (info) => {
        const selectedDate = new Date(info.dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            showToast("Cannot schedule workouts for past dates", "error");
            return;
        }

        setSelectedDate(info.dateStr);
        setWorkoutId(null);
        setCategory('');
        setTarget('');
        setExerciseName('');
        setWorkoutTime('');
        setIsEditing(false);
        setShowModal(true);
    };

    // Add validation for the workout time
    const validateWorkoutTime = (date, time) => {
        if (!date || !time) return false;
        
        const selectedDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        
        return selectedDateTime > now;
    };
    
    // Handle event click to show popup
    const handleEventClick = (info) => {
        const eventId = info.event.id;
        const workout = workouts.find(w => w._id === eventId);
        
        if (workout) {
            // Calculate position based on click location
            const rect = info.el.getBoundingClientRect();
            const position = {
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            };
            
            setPopupInfo({
                show: true,
                workout,
                position
            });
        }
    };
    
    // Update the handleSaveWorkout function to validate time
    const handleSaveWorkout = async () => {
        try {
            // Validate that time is not in the past for today's date
            if (selectedDate === new Date().toISOString().split('T')[0] && !validateWorkoutTime(selectedDate, workoutTime)) {
                showToast("Cannot schedule workouts for past times", "error");
                return;
            }
            
            const token = localStorage.getItem("token");
            const workoutData = {
                date: selectedDate,
                category,
                target,
                exerciseName,
                time: workoutTime
            };

            let savedWorkout;
            if (isEditing) {
                const response = await axios.put(`${API_URL}api/workout-schedule/edit/${workoutId}`, 
                    workoutData,
                    { headers: { Authorization: `Bearer ${token}` }}
                );
                savedWorkout = response.data.workout;
                showToast("Workout updated successfully!", "success");
            } else {
                const response = await axios.post(`${API_URL}api/workout-schedule/add`, 
                    workoutData,
                    { headers: { Authorization: `Bearer ${token}` }}
                );
                savedWorkout = response.data.workout;
                showToast("Workout added successfully!", "success");
            }
            
            // Create an activity for the scheduled workout
            try {
                const activityData = {
                    workoutId: savedWorkout?._id || workoutId,
                    date: selectedDate,
                    time: workoutTime,
                    category,
                    target,
                    exerciseName
                };
                
                await axios.post(`${API_URL}api/activity/scheduled-workout`, 
                    activityData,
                    { headers: { Authorization: `Bearer ${token}` }}
                );
                console.log('Workout activity created successfully');
            } catch (activityError) {
                console.error("Error creating workout activity:", activityError);
                // Don't show error toast for this as the main operation succeeded
            }
            
            fetchWorkouts();
            setShowModal(false);
            
            // Close popup if it was showing the edited workout
            if (popupInfo.show && popupInfo.workout && popupInfo.workout._id === workoutId) {
                setPopupInfo({ show: false, workout: null, position: { top: 0, left: 0 } });
            }
        } catch (error) {
            console.error("Error saving workout:", error);
            showToast("Failed to save workout. Please try again.", "error");
        }
    };

    const handleEditWorkout = (workout) => {
        // Close popup if it's open
        setPopupInfo({ show: false, workout: null, position: { top: 0, left: 0 } });
        
        setWorkoutId(workout._id);
        setSelectedDate(workout.date);
        setWorkoutTime(workout.time);
        setIsEditing(true);
        setShowModal(true);

        setCategory(workout.category);
        handleCategoryChange(workout.category);

        Promise.resolve().then(() => {
            setTarget(workout.target);
            handleTargetChange(workout.target);

            Promise.resolve().then(() => {
                setExerciseName(workout.exerciseName);
            });
        });
    };

    const handleDeleteWorkout = async (id) => {
        // Close popup if it's open
        setPopupInfo({ show: false, workout: null, position: { top: 0, left: 0 } });
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

    const confirmDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            // Delete the workout
            await axios.delete(`${API_URL}api/workout-schedule/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Also delete the associated activity
            try {
                await axios.delete(`${API_URL}api/activity/scheduled-workout/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Workout activity deleted successfully');
            } catch (activityError) {
                console.error("Error deleting workout activity:", activityError);
                // Don't show error toast for this as the main operation succeeded
            }
            
            showToast("Workout deleted successfully", "success");
            fetchWorkouts(); 
        } catch (error) {
            console.error("Error deleting workout:", error);
            showToast("Failed to delete workout", "error");
        }
    };

    // Add function to handle clear all workouts
    const handleClearAllWorkouts = async () => {
        if (workouts.length === 0) {
            showToast("No scheduled workouts to clear", "error");
            return;
        }
        // SweetAlert2 confirmation styled like profile
        const result = await Swal.fire({
            title: 'Are you sure?',
            html: `<div style="font-size:1.1rem;">Are you sure you want to clear all scheduled workouts?<br>This action cannot be undone.</div>`,
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
        if (result.isConfirmed) {
            await confirmClearAllWorkouts();
        }
    };

    // Function to clear all workouts
    const confirmClearAllWorkouts = async () => {
        try {
            const token = localStorage.getItem("token");
            
            // Create a copy of workouts to use for deletion
            const workoutsCopy = [...workouts];
            
            // Delete each workout one by one
            for (const workout of workoutsCopy) {
                try {
                    // Delete the workout
                    await axios.delete(`${API_URL}api/workout-schedule/delete/${workout._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    // Delete the associated activity
                    await axios.delete(`${API_URL}api/activity/scheduled-workout/${workout._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (error) {
                    console.error(`Error deleting workout ${workout._id}:`, error);
                }
            }
            
            setShowClearAllModal(false);
            showToast("All scheduled workouts cleared successfully", "success");
            fetchWorkouts(); // Refresh the list
        } catch (error) {
            console.error("Error clearing all workouts:", error);
            showToast("Failed to clear all workouts", "error");
            setShowClearAllModal(false);
        }
    };

    return (
        <div className="schedule-page">
            <div className="schedule-container">
                <div className="workout-list">
                    <h2>Scheduled Workouts</h2>
                    <button 
                        className="clear-all-workouts-btn"
                        onClick={handleClearAllWorkouts}
                    >
                        <FaTrash /> Clear All Workouts
                    </button>
                    <div className="workout-items-container">
                        {workouts.length === 0 ? (
                            <div className="no-workouts-message">
                                No scheduled workouts
                            </div>
                        ) : (
                            workouts.map(workout => (
                                <div 
                                    key={workout._id} 
                                    className="workout-item"
                                    ref={el => workoutItemsRef.current[workout._id] = el}
                                >
                                    <div className="workout-info">
                                        <span className="date">{workout.date}</span>
                                        <span className="details">
                                            {workout.exerciseName} ({workout.category}) at {formatTime(workout.time)}
                                        </span>
                                    </div>
                                    <div className="workout-actions">
                                        <button className="edit" onClick={() => handleEditWorkout(workout)}>
                                            <FaEdit /> Edit
                                        </button>
                                        <button className="delete" onClick={() => handleDeleteWorkout(workout._id)}>
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="schedule-modal" onClick={e => e.stopPropagation()}>
                            <h2>{isEditing ? "Edit Workout" : "Add Workout"} for {selectedDate}</h2>
                            
                            <div className="input-group">
                                <label>Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                >
                                    <option value="">Select category</option>
                                    <option value="Dumbbell">Dumbbell</option>
                                    <option value="Machine">Machine</option>
                                    <option value="Barbell">Barbell</option>
                                    <option value="Bodyweight">Bodyweight</option>
                                </select>
                            </div>

                            {category && (
                                <div className="input-group">
                                    <label>Target</label>
                                    <select
                                        value={target}
                                        onChange={(e) => handleTargetChange(e.target.value)}
                                    >
                                        <option value="">Select target</option>
                                        {availableTargets.map(target => (
                                            <option key={target} value={target}>{target}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {target && (
                                <div className="input-group">
                                    <label>Exercise</label>
                                    <select
                                        value={exerciseName}
                                        onChange={(e) => setExerciseName(e.target.value)}
                                    >
                                        <option value="">Select exercise</option>
                                        {availableExercises.map(exercise => (
                                            <option key={exercise} value={exercise}>{exercise}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="input-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={workoutTime}
                                    onChange={(e) => setWorkoutTime(e.target.value)}
                                />
                            </div>

                            <div className="modal-actions">
                                <button 
                                    className="button-cancel" 
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="button-save" 
                                    onClick={handleSaveWorkout}
                                >
                                    {isEditing ? 'Update' : 'Add'} Workout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="schedule-card">
                    <div className="schedule-header">
                        <h1>Workout Schedule</h1>
                    </div>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        events={workouts.map(workout => ({
                            title: `${workout.exerciseName} (${workout.category}) - ${formatTime(workout.time)}`,
                            date: workout.date,
                            allDay: true,
                            id: workout._id // Store the workout ID for reference
                        }))}
                        headerToolbar={{
                            left: 'prev',
                            center: 'title',
                            right: 'next'
                        }}
                        height="auto"
                        contentHeight="auto"
                        aspectRatio={1.35}
                        handleWindowResize={true}
                        stickyHeaderDates={true}
                        fixedWeekCount={false}
                    />
                </div>
            </div>
            
            {/* Add toast container */}
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
            
            {/* Event popup */}
            {popupInfo.show && popupInfo.workout && (
                <div 
                    className="event-popup-container"
                    style={{
                        position: 'absolute',
                        top: `${popupInfo.position.top}px`,
                        left: `${popupInfo.position.left}px`,
                        zIndex: 1000
                    }}
                >
                    <EventPopup 
                        workout={popupInfo.workout}
                        onClose={() => setPopupInfo({ show: false, workout: null, position: { top: 0, left: 0 } })}
                        onEdit={handleEditWorkout}
                        onDelete={handleDeleteWorkout}
                    />
                </div>
            )}
            
            {/* Clear All Confirmation modal */}
            {false && showClearAllModal && (
                <div className="modal-overlay" onClick={() => setShowClearAllModal(false)}>
                    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                        <p>Are you sure you want to clear all scheduled workouts? This action cannot be undone.</p>
                        <div className="confirm-actions">
                            <button 
                                className="button-cancel" 
                                onClick={() => setShowClearAllModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="button-delete confirm" 
                                onClick={confirmClearAllWorkouts}
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Add CSS for highlighting */}
            <style jsx>{`
                .workout-highlight {
                    animation: highlight-pulse 2s ease-in-out;
                    box-shadow: 0 0 10px rgba(0, 255, 132, 0.6);
                    border: 2px solid #00ff84 !important;
                }
                
                @keyframes highlight-pulse {
                    0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 132, 0.6); }
                    50% { box-shadow: 0 0 20px rgba(0, 255, 132, 0.8); }
                }
            `}</style>
        </div>
    );
};

export default WorkoutSchedule;