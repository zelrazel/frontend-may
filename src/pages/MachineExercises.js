import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MACHINE_EXERCISES } from './machineConstants';
import '../styles/MachineExercises.css';

// Import chest exercise images
import chestPressImage from '../execises/machine exercises/chest/Chest Press Machine.png';
import inclineChestPressImage from '../execises/machine exercises/chest/Incline Chest Press Machine.png';
import pecDeckImage from '../execises/machine exercises/chest/Pec Deck Machine.png';

// Import shoulder exercise images
import shoulderPressImage from '../execises/machine exercises/shoulders/Shoulder Press Machine.png';
import lateralRaiseImage from '../execises/machine exercises/shoulders/Lateral Raise Machine.png';
import rearDeltFlyImage from '../execises/machine exercises/shoulders/Rear Delt Fly Machine.png';

// Import back exercise images
import latPulldownImage from '../execises/machine exercises/back/Lat Pulldown Machine.png';
import seatedRowImage from '../execises/machine exercises/back/Seated Row Machine.png';
import pullOverImage from '../execises/machine exercises/back/Pull-over Machine.png';

// Import leg exercise images
import squatMachineImage from '../execises/machine exercises/legs/Squat Machine.png';
import legPressImage from '../execises/machine exercises/legs/Leg Press Machine.png';
import legExtensionImage from '../execises/machine exercises/legs/Leg Extension Machine.png';
import legCurlImage from '../execises/machine exercises/legs/Leg Curl Machine.png';
import calfRaiseImage from '../execises/machine exercises/legs/Calf Raise Machine.png';

// Import arm exercise images
import bicepCurlImage from '../execises/machine exercises/arms/Bicep Curl Machine.png';
import tricepExtensionImage from '../execises/machine exercises/arms/Tricep Extension Machine.png';
import preacherCurlImage from '../execises/machine exercises/arms/Preacher Curl Machine.png';

// Import core exercise images
import abCrunchImage from '../execises/machine exercises/core/Ab Crunch Machine.png';

// Import cardio exercise images
import treadmillImage from '../execises/machine exercises/cardio/Treadmill.png';
import stationaryBikeImage from '../execises/machine exercises/cardio/Stationary Bike.png';

// Import full body exercise images
import smithMachineImage from '../execises/machine exercises/full body/Smith Machine.png';
import cableCrossoverImage from '../execises/machine exercises/full body/Cable Crossover Machine.png';

function MachineExercises() {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState("Chest");

  const handleTargetClick = (target) => {
    setSelectedTarget(target);
  };

  // Map exercise names to their respective images
  const exerciseImages = {
    // Chest
    "Chest Press Machine": chestPressImage,
    "Incline Chest Press Machine": inclineChestPressImage,
    "Pec Deck Machine": pecDeckImage,
    
    // Shoulders
    "Shoulder Press Machine": shoulderPressImage,
    "Lateral Raise Machine": lateralRaiseImage,
    "Rear Delt Fly Machine": rearDeltFlyImage,
    
    // Back
    "Lat Pulldown Machine": latPulldownImage,
    "Seated Row Machine": seatedRowImage,
    "Pull-over Machine": pullOverImage,
    
    // Legs
    "Squat Machine": squatMachineImage,
    "Leg Press Machine": legPressImage,
    "Leg Extension Machine": legExtensionImage,
    "Leg Curl Machine": legCurlImage,
    "Calf Raise Machine": calfRaiseImage,
    
    // Arms
    "Bicep Curl Machine": bicepCurlImage,
    "Tricep Extension Machine": tricepExtensionImage,
    "Preacher Curl Machine": preacherCurlImage,
    
    // Core
    "Ab Crunch Machine": abCrunchImage,
    
    // Cardio
    "Treadmill": treadmillImage,
    "Stationary Bike": stationaryBikeImage,
    
    // Full Body
    "Smith Machine": smithMachineImage,
    "Cable Crossover Machine": cableCrossoverImage
  };

  const targetDescriptions = {
    "Shoulders": "Develop strong, defined shoulders with these machine exercises targeting all deltoid heads. Machine shoulder training provides stability and focused muscle engagement to build balanced shoulder development safely and effectively.",
    "Legs": "Build powerful legs with machine exercises that target every muscle group in your lower body. These machines provide proper form guidance and allow you to safely push your limits for impressive leg development.",
    "Chest": "Develop a strong, well-defined chest with these machine-based movements. Chest machines offer controlled motion paths ideal for targeted pectoral development while minimizing strain on supporting muscles.",
    "Back": "Build a wide, powerful back with these machine exercises targeting your lats, rhomboids, and trapezius. Back machines provide optimal pulling angles to develop thickness and width while maintaining proper form.",
    "Arms": "Sculpt impressive biceps and triceps with these targeted machine exercises. Arm machines isolate specific muscles with controlled motion paths, allowing for intense focused contractions with reduced strain on joints.",
    "Core": "Strengthen your abdominals and core with specialized machine exercises. Ab machines provide resistance in optimal movement patterns to target your midsection effectively while supporting proper form.",
    "Cardio": "Boost your cardiovascular fitness with these cardio machine options. These machines provide effective heart-rate-elevating workouts while minimizing impact on your joints compared to outdoor activities.",
    "Full Body": "Get comprehensive workouts with these versatile machine options that allow for multiple exercise variations. These machines offer flexibility to target various muscle groups while maintaining controlled movement patterns."
  };

  const exerciseDescriptions = {
    // Shoulder Exercises
    "Shoulder Press Machine": "Targets the front and side deltoids with a vertical press motion. The machine's fixed path helps maintain proper form throughout the movement, making it ideal for beginners or those rehabilitating from injury. The balanced resistance also reduces the stabilization required compared to free weights, allowing for greater focus on deltoid development.",
    "Lateral Raise Machine": "Isolates the middle deltoids through a lateral raising motion. This machine provides consistent tension throughout the movement while controlling the path, helping to prevent the momentum and swinging often seen with dumbbell lateral raises. The result is more focused development of the side deltoids that create shoulder width.",
    "Rear Delt Fly Machine": "Specifically targets the posterior deltoids with a reverse fly motion. The machine's design positions your body optimally to isolate the often-neglected rear deltoids, crucial for balanced shoulder development and improved posture. The motion path ensures proper form while allowing you to focus on the mind-muscle connection.",

    // Leg Exercises
    "Squat Machine": "Targets quadriceps, hamstrings, and glutes with a squatting motion. The machine typically includes back support and precisely positioned shoulder pads that distribute weight evenly, reducing lower back strain while still effectively targeting the legs. This makes it an excellent option for beginners learning proper squat mechanics.",
    "Leg Press Machine": "Builds overall leg strength by pressing a weighted platform away from your body. The angled design allows for heavy loading with minimal stress on the spine, making it ideal for building leg strength with reduced injury risk. You can adjust foot positioning to emphasize different muscles—higher for hamstrings and glutes, lower for quadriceps.",
    "Leg Extension Machine": "Isolates and strengthens the quadriceps through a seated extension movement. The machine's design stabilizes your body while allowing the quadriceps to work through a full range of motion. This isolation makes it excellent for developing definition in the front of the thighs and for rehabilitation purposes.",
    "Leg Curl Machine": "Specifically targets the hamstrings through a curling motion performed from either a lying or seated position. The machine stabilizes your body while isolating the hamstrings, making it essential for balanced leg development. Regular hamstring training also helps protect the knees and improves athletic performance.",
    "Calf Raise Machine": "Focuses on developing the gastrocnemius and soleus muscles of the calves. The machine typically provides shoulder padding to stabilize the upper body while allowing the calves to work through a full range of motion. The movement and ability to add substantial weight make it superior to bodyweight calf exercises for building mass.",

    // Chest Exercises
    "Chest Press Machine": "Builds overall chest strength and size with a horizontal pressing motion. The machine's fixed path guides your movement, reducing the need for stabilizer muscles and allowing greater focus on the pectoral muscles. This makes it excellent for beginners or those looking to push heavy weights with reduced injury risk.",
    "Incline Chest Press Machine": "Targets the upper chest with an angled pressing motion. The inclined position shifts emphasis to the upper portion of the pectoral muscles, helping to build a more complete chest development. The machine's path helps maintain proper form throughout the movement, even when fatigued.",
    "Pec Deck Machine": "Isolates the chest muscles through a fly motion with bent arms. The machine's design keeps your arms in the optimal position throughout the movement, creating constant tension on the pectorals. This makes it an excellent finishing exercise to achieve maximum chest pump and stimulation.",

    // Back Exercises
    "Lat Pulldown Machine": "Develops back width by pulling a bar down toward your chest. This machine simulates the pull-up motion but allows you to adjust the weight to your strength level. The movement helps ensure proper form, targeting the latissimus dorsi muscles that create the V-taper appearance to the upper body.",
    "Seated Row Machine": "Builds back thickness through a horizontal pulling motion. The machine typically provides chest support that helps maintain proper posture throughout the movement, reducing lower back strain while effectively targeting the middle back muscles including the rhomboids and trapezius.",
    "Pull-over Machine": "Uniquely targets the latissimus dorsi through an arcing motion. The machine's design isolates the lats with minimal involvement from the arms, creating a stretch and contraction that's difficult to achieve with other exercises. This makes it valuable for developing the connection between the lats and serratus anterior.",

    // Arm Exercises
    "Bicep Curl Machine": "Isolates the biceps through a curling motion with supported arms. The machine's cam design often provides variable resistance that matches the strength curve of the biceps, making it more effective than constant-resistance exercises. The path also reduces cheating, ensuring the biceps do all the work.",
    "Tricep Extension Machine": "Targets all three heads of the triceps with a pushing movement. The machine's design positions your body optimally to isolate the triceps while minimizing shoulder involvement. This makes it excellent for developing the back of the arms, which make up approximately two-thirds of overall arm size.",
    "Preacher Curl Machine": "Focuses on the lower portion of the biceps with arms supported on an angled pad. The machine version often includes handles that place your hands in the optimal position and a cam system that provides appropriate resistance throughout the movement. This makes it excellent for developing the oft-neglected lower biceps.",

    // Core Exercises
    "Ab Crunch Machine": "Targets the rectus abdominis with a weighted forward crunch motion. The machine adds resistance to the natural crunch movement while supporting your back, making it more effective than bodyweight crunches for building abdominal strength. The pad positioning helps ensure proper form, reducing neck strain often associated with floor crunches.",

    // Cardio Exercises
    "Treadmill": "Provides a controlled walking or running environment with adjustable speed and incline. Modern treadmills offer various workout programs, heart rate monitoring, and cushioned decks that reduce impact compared to outdoor running. This makes them excellent for both beginners starting a cardio program and experienced runners training in inclement weather.",
    "Stationary Bike": "Delivers a low-impact cardiovascular workout while seated. Bikes can be adjusted to fit various body sizes and offer resistance levels from very easy to extremely challenging. The seated position makes them ideal for those with joint issues or anyone looking for a cardio option that doesn't stress the knees and ankles.",

    // Full Body Exercises
    "Smith Machine": "Provides a barbell path for various exercises including squats, bench press, and rows. The fixed vertical path reduces the need for stabilization, allowing you to focus on the primary muscles being worked. Many Smith machines also include safety catches that make it possible to train heavy without a spotter.",
    "Cable Crossover Machine": "Offers virtually unlimited exercise options with adjustable cable pulleys. The constant tension provided by cables creates effective resistance throughout the entire range of motion. This versatility makes it excellent for targeting muscles from different angles and incorporating functional, sports-specific movements into your training."
  };

  const renderContent = () => {
    const exercisesForTarget = MACHINE_EXERCISES[selectedTarget];
    
    return (
      <>
        <div className="machine-target-header">
          <h3>{selectedTarget}</h3>
          <p>{targetDescriptions[selectedTarget]}</p>
        </div>
        
        {/* Display exercises with available images */}
        {exercisesForTarget.map((exercise, index) => {
          if (exerciseImages[exercise]) {
            return (
              <div key={exercise} className="exercise-row">
                <div className="exercise-text-box">
                  <h3 className="exercise-name">{exercise}</h3>
                  <p>{exerciseDescriptions[exercise]}</p>
                </div>
                <div className="exercise-image-box">
                  <img 
                    src={exerciseImages[exercise]} 
                    alt={exercise}
                    className="exercise-image"
                  />
                </div>
              </div>
            );
          } else {
            // For exercises without images, display in card form
            return (
              <div 
                key={exercise} 
                className={`machine-exercise-card ${index % 2 === 0 ? 'left' : 'right'}`}
              >
                <h3>{exercise}</h3>
                <p>{exerciseDescriptions[exercise] || "Build strength and muscle with this specialized machine exercise."}</p>
              </div>
            );
          }
        })}
      </>
    );
  };

  return (
    <div className="machine-exercises-page">
      <div className="machine-header">
        <h1>MACHINE EXERCISES</h1>
        <p>A training for targeted muscle development</p>
      </div>

      <div className="machine-navigation-container">
        <div className="machine-navigation">
          {Object.keys(MACHINE_EXERCISES).map((target) => (
            <button 
              key={target} 
              className={`machine-nav-button ${selectedTarget === target ? 'active' : ''}`}
              onClick={() => handleTargetClick(target)}
            >
              {target}
            </button>
          ))}
        </div>
      </div>

      <div className="machine-content-container">
        {renderContent()}
      </div>
    </div>
  );
}

export default MachineExercises; 