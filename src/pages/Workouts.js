import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaListAlt,
  FaDumbbell,
  FaRegCalendarCheck,
  FaRunning
} from 'react-icons/fa';
import {
  GiMuscleUp,
  GiWeightScale,
  GiGymBag,
  GiStrong
} from 'react-icons/gi';
import Swal from 'sweetalert2';
import '../styles/Workouts.css';

function Workouts() {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem('token'));

  const handleProtectedNavigation = (path, feature) => {
    if (!token) {
      Swal.fire({
        title: '[ SIGN IN REQUIRED ]',
        text: `Please sign in first to ${feature}`,
        icon: 'warning',
        background: 'rgba(16, 16, 28, 0.95)',
        showCancelButton: true,
        confirmButtonText: '< SIGN IN >',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'swal2-popup',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm',
          cancelButton: 'swal2-cancel'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/signin');
        }
      });
    } else {
      navigate(path);
    }
  };

  // Direct navigation without sign-in check
  const handlePublicNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="programs-page">
      <div className="programs-header-container">
        <h2>Workout Programs</h2>
        <div className="programs-navigation">
          <button 
            className="nav-button my-workout"
            onClick={() => handleProtectedNavigation('/my-workout', 'access your workouts')}
          >
            <FaListAlt className="nav-icon" />
            <span>My Workouts</span>
          </button>
          <button 
            className="nav-button weight-tracking"
            onClick={() => handleProtectedNavigation('/weight-tracking', 'track your weight progress')}
          >
            <FaRegCalendarCheck className="nav-icon" />
            <span>Track Progress</span>
          </button>
        </div>
      </div>
      
      <div 
        className="program-container"
        onClick={() => handlePublicNavigation('/dumbbell-training')}
      >
        <FaDumbbell className="program-icon" />
        <h3>Dumbbell Exercises</h3>
        <p className="program-description">
          Complete dumbbell workout routines for all muscle groups. Build strength, muscle, and definition with these targeted exercises.
        </p>
      </div>

      <div 
        className="program-container"
        onClick={() => handlePublicNavigation('/machine-exercises')}
      >
        <GiGymBag className="program-icon" />
        <h3>Machine Exercises</h3>
        <p className="program-description">
          A resistance training with specialized equipment. Ideal for targeted muscle development with controlled motion paths.
        </p>
      </div>

      <div 
        className="program-container"
        onClick={() => handlePublicNavigation('/barbell-training')}
      >
        <GiStrong className="program-icon" />
        <h3>Barbell Exercises</h3>
        <p className="program-description">
          Fundamental strength exercises for maximum muscle and power development. Build functional strength with these classic barbell movements.
        </p>
      </div>

      <div 
        className="program-container"
        onClick={() => handlePublicNavigation('/bodyweight-fitness')}
      >
        <FaRunning className="program-icon" />
        <h3>Bodyweight Exercises</h3>
        <p className="program-description">
          Effective exercises using only your body weight for resistance. Build functional strength anywhere with no equipment needed.
        </p>
      </div>
    </div>
  );
}

export default Workouts;
