import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BARBELL_EXERCISES } from './barbellConstants';
import '../styles/BarbellTraining.css';

// Import chest exercise images
import benchPressImg from '../execises/barbell exercises/chest/Barbell Bench Press.png';
import inclinePressImg from '../execises/barbell exercises/chest/Incline Barbell Press.png';
import declinePressImg from '../execises/barbell exercises/chest/Decline Barbell Press.png';
import floorPressImg from '../execises/barbell exercises/chest/Barbell Floor Press.png';
import guillotinePressImg from '../execises/barbell exercises/chest/Barbell Guillotine Press.png';

// Import shoulder exercise images
import barbellOverheadPressImg from '../execises/barbell exercises/shoulders/Barbell Overhead Press.png';
import behindTheNeckPressImg from '../execises/barbell exercises/shoulders/Behind-the-Neck Press.png';
import pushPressImg from '../execises/barbell exercises/shoulders/Push Press.png';
import zPressImg from '../execises/barbell exercises/shoulders/Z Press.png';
import uprightRowsImg from '../execises/barbell exercises/shoulders/Upright Rows.png';
import barbellShrugsImg from '../execises/barbell exercises/shoulders/Barbell Shrugs.png';

// Import bicep exercise images
import barbellBicepCurlImg from '../execises/barbell exercises/bicep/Barbell Bicep Curl.png';
import reverseCurlImg from '../execises/barbell exercises/bicep/Reverse Curl.png';
import dragCurlImg from '../execises/barbell exercises/bicep/Drag Curl.png';
import preacherCurlImg from '../execises/barbell exercises/bicep/Preacher Curl.png';

// Import tricep exercise images
import skullCrushersImg from '../execises/barbell exercises/tricep/Barbell Skull Crushers.png';
import closeGripBenchImg from '../execises/barbell exercises/tricep/Close-Grip Bench Press.jpg';
import overheadExtensionImg from '../execises/barbell exercises/tricep/Overhead Barbell Triceps Extension.png';

// Import forearm exercise images
import wristCurlsImg from '../execises/barbell exercises/forearms/Barbell Wrist Curls.png';
import reverseWristCurlsImg from '../execises/barbell exercises/forearms/Reverse Wrist Curls.png';
import wristRollerImg from '../execises/barbell exercises/forearms/Wrist Roller.png';

// Import core exercise images
import russianTwistsImg from '../execises/barbell exercises/core/Barbell Russian Twists.png';
import rolloutImg from '../execises/barbell exercises/core/Barbell Rollouts.png';
import sideBendsImg from '../execises/barbell exercises/core/Barbell Side Bends.png';

// Import leg exercise images
import backSquatImg from '../execises/barbell exercises/legs/Barbell Back Squat.png';
import frontSquatImg from '../execises/barbell exercises/legs/Barbell Front Squat.png';
import lungesImg from '../execises/barbell exercises/legs/Barbell Lunges.png';
import stepUpsImg from '../execises/barbell exercises/legs/Barbell Step-Ups.png';
import romanianDeadliftsImg from '../execises/barbell exercises/legs/Romanian Deadlifts.png';
import sumoDeadliftsImg from '../execises/barbell exercises/legs/Sumo Deadlifts.png';
import hipThrustsImg from '../execises/barbell exercises/legs/Barbell Hip Thrusts.png';
import calfRaisesImg from '../execises/barbell exercises/legs/Calf Raises.png';

function BarbellTraining() {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState("Chest");

  const handleTargetClick = (target) => {
    setSelectedTarget(target);
  };

  // Create an image mapping for chest exercises
  const exerciseImages = {
    // Chest exercises
    "Barbell Bench Press": benchPressImg,
    "Incline Barbell Press": inclinePressImg,
    "Decline Barbell Press": declinePressImg,
    "Barbell Floor Press": floorPressImg,
    "Barbell Guillotine Press": guillotinePressImg,
    
    // Shoulder exercises
    "Barbell Overhead Press": barbellOverheadPressImg,
    "Behind-the-Neck Press": behindTheNeckPressImg,
    "Push Press": pushPressImg,
    "Z Press": zPressImg,
    "Upright Rows": uprightRowsImg,
    "Barbell Shrugs": barbellShrugsImg,
    
    // Bicep exercises
    "Barbell Bicep Curl": barbellBicepCurlImg,
    "Reverse Curl": reverseCurlImg,
    "Drag Curl": dragCurlImg,
    "Preacher Curl": preacherCurlImg,
    
    // Tricep exercises
    "Barbell Skull Crushers": skullCrushersImg,
    "Close-Grip Bench Press": closeGripBenchImg,
    "Overhead Barbell Triceps Extension": overheadExtensionImg,
    
    // Forearm exercises
    "Barbell Wrist Curls": wristCurlsImg,
    "Reverse Wrist Curls": reverseWristCurlsImg,
    "Wrist Roller": wristRollerImg,
    
    // Core exercises
    "Barbell Russian Twists": russianTwistsImg,
    "Barbell Rollouts": rolloutImg,
    "Barbell Side Bends": sideBendsImg,
    
    // Leg exercises
    "Barbell Back Squat": backSquatImg,
    "Barbell Front Squat": frontSquatImg,
    "Barbell Lunges": lungesImg,
    "Barbell Step-Ups": stepUpsImg,
    "Romanian Deadlifts": romanianDeadliftsImg,
    "Sumo Deadlifts": sumoDeadliftsImg,
    "Barbell Hip Thrusts": hipThrustsImg,
    "Calf Raises": calfRaisesImg
  };

  const targetDescriptions = {
    "Chest": "Build massive chest strength and power with barbell exercises that target your pectorals from multiple angles. Barbell chest training allows for heavier loads than dumbbells, maximizing muscle fiber recruitment and overall strength development.",
    "Shoulders": "Develop powerful, broad shoulders with these fundamental barbell movements. Barbell shoulder training emphasizes strength and mass development through compound exercises that effectively target all three deltoid heads.",
    "Bicep": "Build impressive bicep size and strength with these classic barbell movements. Barbell bicep exercises allow for heavier loads than dumbbells, creating greater overall stimulus for growth while developing functional pulling strength.",
    "Tricep": "Forge powerful triceps with these effective barbell exercises. Barbell tricep training focuses on compound movements that allow for significant loading, maximizing overall arm development and pressing strength.",
    "Forearms": "Develop vice-like grip strength and muscular forearms with these targeted barbell exercises. Strong forearms are essential for heavy lifting in all other exercises and contribute significantly to functional strength.",
    "Core": "Build a solid, stable core with these challenging barbell exercises. A strong core created through heavy barbell training provides the foundation for all other lifts and protects against lower back injuries.",
    "Legs": "Develop powerful, functional lower body strength with these fundamental barbell movements. Barbell leg exercises are unmatched for building overall mass, strength, and power in the lower body."
  };

  const exerciseDescriptions = {
    // Chest Exercises
    "Barbell Bench Press": "The king of chest exercises, targeting the entire pectoral region with emphasis on the middle chest. This compound movement also engages the front deltoids and triceps as secondary muscles. The barbell allows for heavier loads than dumbbells, making it ideal for building maximum strength and mass. Focus on proper scapular retraction and a slight arch to protect your shoulders during this foundational exercise.",
    "Incline Barbell Press": "Targets the upper chest by performing the press on an inclined bench, typically set between 30-45 degrees. This angle shifts emphasis to the clavicular head of the pectoralis major and increases front deltoid involvement. The barbell variation allows for heavier loading than dumbbells, making it excellent for building upper chest thickness and strength that's often underdeveloped compared to the middle and lower regions.",
    "Decline Barbell Press": "Focuses on the lower chest by performing the press on a declined bench. This variation decreases shoulder involvement while maximizing lower pectoral activation. The decline angle puts the shoulders in a safer position than flat pressing for many lifters, potentially allowing for heavier weights. This exercise is excellent for developing the lower chest shelf that creates a full, complete chest appearance.",
    "Barbell Floor Press": "A partial range-of-motion press performed while lying on the floor, which limits the stretch at the bottom position and emphasizes the lockout portion of the press. This variation is excellent for developing tricep strength and lockout power while being shoulder-friendly due to the limited range of motion. It's particularly valuable for powerlifters working to improve bench press performance or those with shoulder mobility issues.",
    "Barbell Guillotine Press": "An advanced variation where the bar is lowered to the neck area rather than the lower chest. This technique increases upper chest and anterior deltoid activation but places more stress on the shoulder joints. It should only be performed by experienced lifters with good shoulder health and mobility. The greater stretch on the pectorals can stimulate additional growth when performed with appropriate weight and strict form.",

    // Shoulder Exercises
    "Barbell Overhead Press": "The fundamental shoulder building exercise, targeting all three deltoid heads with emphasis on the front delts. This compound movement also engages the triceps, upper chest, and core stabilizers. Standing barbell presses build tremendous shoulder strength, size and stability while developing the core. Focus on a full range of motion, bringing the bar from the collarbone to full extension overhead without excessive back arching.",
    "Behind-the-Neck Press": "An advanced variation targeting the side and rear deltoids more than standard overhead presses. This exercise requires excellent shoulder mobility and should only be performed by those with healthy shoulders and good flexibility. The bar path behind the head places the shoulders in a more externally rotated position, which can increase medial deltoid recruitment but also increases joint stress.",
    "Push Press": "A powerful compound movement combining a slight leg drive with an overhead press. This exercise allows you to handle heavier weights than strict presses, overloading the shoulders and triceps with weights they couldn't normally handle in a strict press. The push press develops explosive power and strength through the entire kinetic chain and is excellent for athletic development.",
    "Z Press": "A seated overhead press performed with legs extended forward on the floor, eliminating any leg drive or back arch. This variation ruthlessly exposes and corrects core weakness and poor pressing mechanics. Named after strongman Zydrunas Savickas, the Z Press forces proper core bracing and overhead positioning, making it excellent for improving overhead press technique and core strength.",
    "Upright Rows": "Targets the side deltoids and traps with a vertical pulling motion. While holding a barbell with a narrow grip, you pull it up along your body until your elbows are at shoulder height. This exercise effectively builds shoulder width and traps development. Use a wider grip to minimize wrist strain and potential shoulder impingement that can occur with very narrow grips.",
    "Barbell Shrugs": "Isolates the trapezius muscles with a simple shrugging motion. This straightforward exercise is excellent for building upper trap size and strength. The barbell allows for significant loading, creating substantial stimulus for growth. Focus on lifting your shoulders straight up toward your ears rather than rolling them, and hold the contracted position briefly at the top for maximum trap engagement.",

    // Bicep Exercises
    "Barbell Bicep Curl": "The classic mass-builder for biceps, allowing heavier loads than dumbbell variations. The straight barbell curl targets the biceps brachii with some recruitment of the brachialis and forearms. The fixed hand position of the barbell creates constant tension through the entire movement. Focus on keeping your elbows fixed at your sides and avoid swinging the weight up with body momentum for maximum bicep activation.",
    "Reverse Curl": "Targets the brachialis and forearm extensors by curling with palms facing down. This grip shift places less emphasis on the biceps brachii and more on the often-neglected brachialis (which lies underneath the biceps) and the forearm muscles. Regular reverse curl training creates more complete arm development and improves grip strength for other pulling exercises.",
    "Drag Curl": "A specialized bicep curl variation where the bar is kept in contact with or very close to your torso throughout the movement. This technique minimizes shoulder and anterior deltoid involvement, creating more isolated bicep stimulation. The unique movement pattern creates a different stimulus than traditional curls, potentially recruiting different muscle fibers for more complete development.",
    "Preacher Curl": "Isolates the biceps by performing curls with the arms supported on an angled pad. The preacher bench fixes your upper arms in place, preventing the cheating that often occurs during standing curls. This position places particular emphasis on the lower portion of the biceps. The barbell version allows for heavier loading than dumbbells, creating substantial growth stimulus.",

    // Tricep Exercises
    "Barbell Skull Crushers": "Targets all three heads of the triceps by lowering a barbell toward your forehead while lying on a bench. This isolation movement particularly emphasizes the long head of the triceps. The straight bar creates simultaneous tension on both arms, potentially allowing for greater loading than dumbbell versions. Focus on keeping your elbows pointed toward the ceiling and only moving at the elbow joint for proper isolation.",
    "Close-Grip Bench Press": "A compound movement that emphasizes the triceps by using a narrow grip on the barbell. While this exercise still engages the chest and shoulders, the close grip shifts substantial emphasis to the triceps, particularly the lateral and medial heads. This exercise allows for much heavier loading than isolation movements, making it excellent for building overall tricep size and strength.",
    "Overhead Barbell Triceps Extension": "Emphasizes the long head of the triceps through an overhead extension movement. The long head of the triceps receives maximum stretch in the overhead position, creating greater potential for growth. This exercise can be performed seated or standing and requires good shoulder mobility. Focus on keeping your upper arms stationary and close to your head throughout the movement.",

    // Forearm Exercises
    "Barbell Wrist Curls": "Develops the wrist flexors on the inner forearm through a curling motion with palms facing up. Performed seated with forearms resting on thighs, you lower and raise the barbell using only wrist movement. The barbell allows for balanced development of both arms simultaneously and permits progressive loading as strength increases. Strong wrist flexors improve grip strength and contribute to forearm size.",
    "Reverse Wrist Curls": "Targets the wrist extensors on the outer forearm by curling with palms facing down. These muscles are often weaker than the flexors and need dedicated work for balanced development and injury prevention. Like standard wrist curls, these are performed seated with forearms supported, moving only at the wrist joint. Consistent training of the extensors improves wrist stability and aesthetics.",
    "Wrist Roller": "A dynamic exercise using a specially designed barbell attachment or DIY apparatus with a weight suspended from a rope. By rotating the bar forward or backward, you wind and unwind the rope, creating constant tension on the forearms. This exercise builds tremendous grip endurance, forearm strength, and muscular development through high time under tension.",

    // Core Exercises
    "Barbell Russian Twists": "A rotational core exercise performed by sitting on the ground at a 45-degree angle while holding a barbell across your chest or shoulders. You rotate from side to side, engaging the obliques and deep core muscles. This weighted version dramatically increases the resistance compared to bodyweight variations, building significant core strength and stability necessary for heavy compound lifting.",
    "Barbell Rollouts": "An advanced core stability exercise performed by kneeling behind a loaded barbell and rolling it forward until your body is nearly parallel to the ground. This movement creates intense engagement of the entire anterior core, particularly the rectus abdominis and transverse abdominis. Barbell rollouts build tremendous core strength while also engaging the lats, triceps and shoulders as stabilizers.",
    "Barbell Side Bends": "Targets the obliques through lateral flexion of the torso. Standing upright with a barbell held on one shoulder, you bend directly to the side and return to upright. This weighted movement builds oblique strength and thickness more effectively than bodyweight variations. Strong obliques contribute to core stability during heavy squats and deadlifts while creating athletic definition in the waistline.",

    // Leg Exercises
    "Barbell Back Squat": "The king of all leg exercises, targeting the quadriceps, hamstrings, glutes, and lower back. The barbell is positioned across the upper back, allowing for maximum loading potential. This compound movement stimulates tremendous overall muscle growth and strength development throughout the entire lower body and core. Regular squatting is essential for building functional strength and athletic performance.",
    "Barbell Front Squat": "Emphasizes the quadriceps more than back squats by positioning the barbell across the front of the shoulders. This position requires more upright posture, reducing stress on the lower back while increasing demand on the core and upper back to maintain position. Front squats are excellent for developing quad definition, core strength, and improve positioning for Olympic weightlifting movements.",
    "Barbell Lunges": "Targets quads, hamstrings, and glutes with a stepping motion while holding a barbell across the upper back. This unilateral exercise develops balance, coordination, and addresses muscle imbalances between legs. Walking lunges increase the balance challenge, while stationary lunges allow for greater loading. This functional movement mimics many athletic movements while building lower body strength.",
    "Barbell Step-Ups": "Builds unilateral leg strength by stepping onto an elevated platform with a barbell across your upper back. This exercise develops explosive power, balance, and coordination while targeting the quads and glutes. The height of the platform determines the difficulty—higher steps increase glute activation while lower steps focus more on the quads. Step-ups are excellent for athletic development and addressing leg asymmetries.",
    "Romanian Deadlifts": "Focuses on the hamstrings and glutes with a hip-hinge movement while maintaining slightly bent knees. Unlike conventional deadlifts, the emphasis is on the eccentric stretch of the hamstrings rather than a full range of motion from the floor. This exercise builds tremendous posterior chain development, protects against hamstring injuries, and improves hip mobility necessary for many athletic movements.",
    "Sumo Deadlifts": "A deadlift variation with a wide stance and hands gripping the bar inside the legs. This position reduces the range of motion and shifts emphasis more to the glutes, adductors, and quads compared to conventional deadlifts. The sumo stance can be advantageous for those with longer torsos or limited hip mobility. This is both a tremendous strength builder and an excellent exercise for developing overall lower body power.",
    "Barbell Hip Thrusts": "Specifically targets the glutes by driving a barbell upward while your upper back is supported on a bench. This exercise creates maximum glute activation with minimal stress on the lower back. Strong glutes contribute to improved athletic performance, better posture, and reduction in lower back and knee pain. The barbell allows for substantial loading, creating significant growth stimulus for the glutes.",
    "Calf Raises": "Isolates and builds calf muscles by raising your heels while holding a barbell across your upper back. This exercise can be performed on flat ground or with the balls of your feet on an elevated surface to increase range of motion. The standing barbell version allows for significant loading while also engaging the core and back as stabilizers, making it excellent for building functional calf strength and size."
  };

  const renderContent = () => {
    const exercises = BARBELL_EXERCISES[selectedTarget];

    return (
      <>
        <div className="barbell-target-header">
          <h3>{selectedTarget}</h3>
          <p>{targetDescriptions[selectedTarget]}</p>
        </div>

        <div className="barbell-exercises-container">
          {exercises.map((exercise, index) => {
            // Check if the exercise has an image
            if (exerciseImages[exercise]) {
              return (
                <div key={exercise} className="exercise-row">
                  {/* Always show text on left, image on right */}
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
              // For exercises without images
              return (
                <div 
                  key={exercise} 
                  className="barbell-exercise-card left"
                >
                  <h3>{exercise}</h3>
                  <p>{exerciseDescriptions[exercise] || "Build strength and power with this fundamental barbell exercise."}</p>
                </div>
              );
            }
          })}
        </div>
      </>
    );
  };

  return (
    <div className="barbell-training-page">
      <div className="barbell-header">
        <h1>BARBELL EXERCISES</h1>
        <p>Fundamental strength exercises for maximum muscle and power development</p>
      </div>

      <div className="barbell-navigation-container">
        <div className="barbell-navigation">
          {Object.keys(BARBELL_EXERCISES).map((target) => (
            <button 
              key={target} 
              className={`barbell-nav-button ${selectedTarget === target ? 'active' : ''}`}
              onClick={() => handleTargetClick(target)}
            >
              {target}
            </button>
          ))}
        </div>
      </div>

      <div className="barbell-content-container">
        {renderContent()}
      </div>
    </div>
  );
}

export default BarbellTraining; 