import React from 'react';
import '../styles/Home.css';
import homeImage from '../components/home images/home-1.png';
import whyImage from '../components/home images/home-2.png';
import { useNavigate } from 'react-router-dom';
import { handleAuth } from '../utils/auth';

function Home() {
  const navigate = useNavigate();
  const isSignedIn = handleAuth();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="accent-text">Train Smart. Stay Connected. Get Results.</div>
            <h1>
              Welcome to<br />
              <span className="brand-name-outline">TrackTechFit</span><br />
              Built for Champions Like You.
            </h1>
            <p>
              At TrackTechFit, we're transforming the way MMSU students stay active, track their progress, and stay motivated. Whether you're just starting your fitness journey or you're already hitting your goals, TrackTechFit is here to support, challenge, and reward you.
            </p>
            {!isSignedIn && (
              <button className="get-started-btn" onClick={handleGetStarted}>Get Started</button>
            )}
          </div>
          <div className="hero-image">
            <img src={homeImage} alt="People working out" />
          </div>
        </div>
      </div>

      <div className="program-section">
        <h2 className="program-heading">EXPLORE OUR PROGRAM</h2>
        
        <div className="program-grid">
          <div className="program-card">
            <h3>Dumbbell Exercise</h3>
            <p>Complete dumbbell workout routines for all muscle groups. Build strength, muscle, and definition with these targeted exercises.</p>
          </div>
          
          <div className="program-card">
            <h3>Machine Exercise</h3>
            <p>A training with specialized equipment. Ideal for targeted muscle development with controlled motion paths.</p>
          </div>
          
          <div className="program-card">
            <h3>Barbell Exercise</h3>
            <p>Fundamental strength exercises for maximum muscle and power development. Build functional strength with these classic barbell movements.</p>
          </div>
          
          <div className="program-card">
            <h3>Bodyweight Exercise</h3>
            <p>Effective exercises using only your body weight for resistance. Build functional strength anywhere with no equipment needed.</p>
          </div>
        </div>
      </div>

      <div className="why-section">
        <h2 className="why-heading">Why TrackTechFit?</h2>
        
        <p className="why-intro">
          TrackTechFit brings together a vibrant community of MMSU students, 
          creating a fun and supportive space where you can stay active, make 
          friends, and stay motivated every step of the way.
        </p>
        
        <div className="why-image">
          <img src={whyImage} alt="People enjoying fitness together" />
        </div>
        
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>Personalized Fitness Tracking</h3>
            <p>Monitor your workouts, set personal goals, and see your strength grow over time.</p>
          </div>
          
          <div className="benefit-card">
            <h3>Gamified Experience</h3>
            <p>Earn points, unlock achievements, and climb the leaderboard. Staying fit has never been this fun.</p>
          </div>
          
          <div className="benefit-card">
            <h3>Community Powered</h3>
            <p>Join challenges with friends, share milestones, and support each other in a social fitness space made just for MMSU students.</p>
          </div>
          
          <div className="benefit-card">
            <h3>Data-Driven Progress</h3>
            <p>Visualize your journey with real-time insights on weight, strength, consistency, and more.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
