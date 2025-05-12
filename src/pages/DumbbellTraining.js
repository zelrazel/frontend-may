import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DUMBBELL_EXERCISES } from './dumbbellConstants';
import '../styles/DumbbellTraining.css';

// Import chest exercise images
import benchPressImg from '../execises/dumbbell exercises/chest/Dumbbell Bench Press.jpg';
import inclinePressImg from '../execises/dumbbell exercises/chest/Incline Dumbbell Press.jpg';
import declinePressImg from '../execises/dumbbell exercises/chest/Decline Dumbbell Press.jpg';
import flatFlyImg from '../execises/dumbbell exercises/chest/Flat Dumbbell Fly.jpg';
import inclineFlyImg from '../execises/dumbbell exercises/chest/Incline Dumbbell Fly.jpg';
import declineFlyImg from '../execises/dumbbell exercises/chest/Decline Dumbbell Fly.jpg';

// Import shoulder exercise images
import shoulderPressImg from '../execises/dumbbell exercises/shoulder/Dumbbell Shoulder Press.jpg';
import arnoldPressImg from '../execises/dumbbell exercises/shoulder/Arnold Press.jpg';
import lateralRaisesImg from '../execises/dumbbell exercises/shoulder/Lateral Raises.jpg';
import frontRaisesImg from '../execises/dumbbell exercises/shoulder/Front Raises.png';
import reverseFlyImg from '../execises/dumbbell exercises/shoulder/Reverse Fly.png';
import uprightRowsImg from '../execises/dumbbell exercises/shoulder/Upright Rows.png';
import dumbbellShrugsImg from '../execises/dumbbell exercises/shoulder/Dumbbell Shrugs.png';
import rearDeltFlyImg from '../execises/dumbbell exercises/shoulder/Rear Delt Fly.jpg';
import singleArmShoulderPressImg from '../execises/dumbbell exercises/shoulder/Single-Arm Shoulder Press.png';

// Import bicep exercise images
import bicepCurlImg from '../execises/dumbbell exercises/bicep/Dumbbell Bicep Curl.png';
import hammerCurlImg from '../execises/dumbbell exercises/bicep/Hammer Curl.png';
import concentrationCurlImg from '../execises/dumbbell exercises/bicep/Concentration Curl.jpg';
import inclineCurlImg from '../execises/dumbbell exercises/bicep/Incline Dumbbell Curl.jpg';
import preacherCurlImg from '../execises/dumbbell exercises/bicep/Preacher Curl.jpg';
import reverseCurlImg from '../execises/dumbbell exercises/bicep/Reverse Curl.jpg';
import spiderCurlImg from '../execises/dumbbell exercises/bicep/Spider Curl.png';

// Import tricep exercise images
import overheadExtensionImg from '../execises/dumbbell exercises/tricep/Dumbbell Overhead Triceps Extension.jpg';
import kickbacksImg from '../execises/dumbbell exercises/tricep/Dumbbell Kickbacks.jpg';
import skullCrushersImg from '../execises/dumbbell exercises/tricep/Dumbbell Skull Crushers.jpg';
import closeGripPressImg from '../execises/dumbbell exercises/tricep/Close-Grip Dumbbell Press.png';
import singleArmExtensionImg from '../execises/dumbbell exercises/tricep/Dumbbell Triceps Extensions (Single-Arm).png';
import tricepsDipsImg from '../execises/dumbbell exercises/tricep/Dumbbell Triceps Dips.png';

// Import forearm exercise images
import wristCurlsImg from '../execises/dumbbell exercises/forearms/Dumbbell Wrist Curls.png';
import reverseWristCurlsImg from '../execises/dumbbell exercises/forearms/Reverse Wrist Curls.png';
import dumbbellReverseCurlImg from '../execises/dumbbell exercises/forearms/Dumbbell Reverse Curl.png';
import wristRotationsImg from '../execises/dumbbell exercises/forearms/Wrist Rotations.png';
import fingerCurlsImg from '../execises/dumbbell exercises/forearms/Dumbbell Finger Curls.png';
import pinchHoldImg from '../execises/dumbbell exercises/forearms/Dumbbell Pinch Hold.png';
import deadHangImg from '../execises/dumbbell exercises/forearms/Dead Hang with Dumbbells.png';

// Import core exercise images
import russianTwistsImg from '../execises/dumbbell exercises/core/Dumbbell Russian Twists.png';
import sitUpsImg from '../execises/dumbbell exercises/core/Dumbbell Sit-Ups.png';
import sideBendsImg from '../execises/dumbbell exercises/core/Dumbbell Side Bends.jpg';
import hangingLegRaisesImg from '../execises/dumbbell exercises/core/Dumbbell Hanging Leg Raises.png';
import vUpsImg from '../execises/dumbbell exercises/core/Dumbbell V-Ups.png';

// Import leg exercise images
import squatsImg from '../execises/dumbbell exercises/legs/Dumbbell Squats.jpg';
import gobletSquatsImg from '../execises/dumbbell exercises/legs/Dumbbell Goblet Squats.png';
import bulgarianSplitSquatsImg from '../execises/dumbbell exercises/legs/Dumbbell Bulgarian Split Squats.png';
import lungesImg from '../execises/dumbbell exercises/legs/Dumbbell Lunges.jpg';
import stepUpsImg from '../execises/dumbbell exercises/legs/Dumbbell Step-Ups.jpg';
import romanianDeadliftsImg from '../execises/dumbbell exercises/legs/Dumbbell Romanian Deadlifts.png';
import sumoDeadliftsImg from '../execises/dumbbell exercises/legs/Dumbbell Sumo Deadlifts.png';
import calfRaisesImg from '../execises/dumbbell exercises/legs/Dumbbell Calf Raises.png';
import hamstringCurlsImg from '../execises/dumbbell exercises/legs/Dumbbell Hamstring Curls.png';
import wallSitImg from '../execises/dumbbell exercises/legs/Dumbbell Wall Sit.png';

// Create an image mapping for easy reference
const exerciseImages = {
  // Chest exercises
  "Dumbbell Bench Press": benchPressImg,
  "Incline Dumbbell Press": inclinePressImg,
  "Decline Dumbbell Press": declinePressImg,
  "Flat Dumbbell Fly": flatFlyImg,
  "Incline Dumbbell Fly": inclineFlyImg,
  "Decline Dumbbell Fly": declineFlyImg,
  
  // Shoulder exercises
  "Dumbbell Shoulder Press": shoulderPressImg,
  "Arnold Press": arnoldPressImg,
  "Lateral Raises": lateralRaisesImg,
  "Front Raises": frontRaisesImg,
  "Reverse Fly": reverseFlyImg,
  "Upright Rows": uprightRowsImg,
  "Dumbbell Shrugs": dumbbellShrugsImg,
  "Rear Delt Fly": rearDeltFlyImg,
  "Single-Arm Shoulder Press": singleArmShoulderPressImg,
  
  // Bicep exercises
  "Dumbbell Bicep Curl": bicepCurlImg,
  "Hammer Curl": hammerCurlImg,
  "Concentration Curl": concentrationCurlImg,
  "Incline Dumbbell Curl": inclineCurlImg,
  "Preacher Curl": preacherCurlImg,
  "Reverse Curl": reverseCurlImg,
  "Spider Curl": spiderCurlImg,
  
  // Tricep exercises
  "Dumbbell Overhead Triceps Extension": overheadExtensionImg,
  "Dumbbell Kickbacks": kickbacksImg,
  "Dumbbell Skull Crushers": skullCrushersImg,
  "Close-Grip Dumbbell Press": closeGripPressImg,
  "Dumbbell Triceps Extensions (Single-Arm)": singleArmExtensionImg,
  "Dumbbell Triceps Dips": tricepsDipsImg,
  
  // Forearm exercises
  "Dumbbell Wrist Curls": wristCurlsImg,
  "Reverse Wrist Curls": reverseWristCurlsImg,
  "Dumbbell Reverse Curl": dumbbellReverseCurlImg,
  "Wrist Rotations": wristRotationsImg,
  "Dumbbell Finger Curls": fingerCurlsImg,
  "Dumbbell Pinch Hold": pinchHoldImg,
  "Dead Hang with Dumbbells": deadHangImg,
  
  // Core exercises
  "Dumbbell Russian Twists": russianTwistsImg,
  "Dumbbell Sit-Ups": sitUpsImg,
  "Dumbbell Side Bends": sideBendsImg,
  "Dumbbell Hanging Leg Raises": hangingLegRaisesImg,
  "Dumbbell V-Ups": vUpsImg,
  
  // Leg exercises
  "Dumbbell Squats": squatsImg,
  "Dumbbell Goblet Squats": gobletSquatsImg,
  "Dumbbell Bulgarian Split Squats": bulgarianSplitSquatsImg,
  "Dumbbell Lunges": lungesImg,
  "Dumbbell Step-Ups": stepUpsImg,
  "Dumbbell Romanian Deadlifts": romanianDeadliftsImg,
  "Dumbbell Sumo Deadlifts": sumoDeadliftsImg,
  "Dumbbell Calf Raises": calfRaisesImg,
  "Dumbbell Hamstring Curls": hamstringCurlsImg,
  "Dumbbell Wall Sit": wallSitImg
};

function DumbbellTraining() {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState("Chest");

  const handleTargetClick = (target) => {
    setSelectedTarget(target);
  };

  const targetDescriptions = {
    Chest: "Build a powerful chest with these dumbbell exercises that target your pectorals, enhancing upper body strength and aesthetic appearance. Regular chest training improves pushing strength for everyday activities and creates a balanced upper body physique.",
    Shoulder: "Develop defined, rounded shoulders with these exercises focusing on all three deltoid heads for balanced shoulder development. Strong shoulders improve posture, reduce injury risk, and enhance overall upper body functionality.",
    Bicep: "Sculpt impressive biceps with these targeted exercises designed to increase arm size and strength for both functional and aesthetic benefits. Well-developed biceps improve pulling strength and contribute to a balanced arm appearance.",
    Tricep: "Build powerful triceps with these exercises targeting all three heads of the muscle, essential for arm size and pushing movements. Triceps make up about 2/3 of your arm size and are crucial for pressing movements and arm extension.",
    Forearms: "Enhance grip strength and forearm development with these specialized exercises, crucial for overall arm functionality and aesthetics. Strong forearms improve grip endurance for daily activities and enhance your ability to lift heavier in other exercises.",
    Core: "Strengthen your core muscles with these dumbbell exercises that target your abs, obliques, and lower back for improved stability and posture. A strong core is the foundation for all movement and helps prevent lower back pain.",
    Legs: "Build powerful lower body strength with these dumbbell exercises targeting your quads, hamstrings, glutes, and calves for complete leg development. Strong legs are essential for athletic performance, metabolism boost, and overall functional strength."
  };

  const exerciseDescriptions = {
    // Chest Exercises
    "Dumbbell Bench Press": "Builds chest strength and mass by working the pectoral muscles while lying on a flat bench. This compound movement recruits the shoulders and triceps as secondary muscles, making it an efficient upper body builder. Aim for 3-4 sets of 8-12 reps with a weight that challenges you but allows proper form.",
    "Incline Dumbbell Press": "Targets the upper chest by performing the press on an inclined bench. The incline angle shifts emphasis to the clavicular head of the pectoralis major, creating more balanced chest development. This variation is excellent for building that shelf-like upper chest appearance. Use a bench angle between 30-45 degrees for optimal results.",
    "Decline Dumbbell Press": "Focuses on the lower chest by performing the press on a declined bench. This variation places greater emphasis on the sternal head of the pectoral muscles, helping to develop the lower portion of the chest. The decline angle also reduces shoulder stress compared to flat bench pressing.",
    "Flat Dumbbell Fly": "Isolates the chest muscles through a wide arcing motion with arms slightly bent. This isolation movement stretches the pecs at the bottom position and creates intense contraction at the top. Keep a slight bend in your elbows throughout the movement to protect your joints and focus on feeling the stretch across your chest.",
    "Incline Dumbbell Fly": "Targets the upper chest through a flying motion on an inclined bench. The incline angle places greater emphasis on the upper portion of the pectoral muscles while still providing the stretching and squeezing benefits of the fly motion. This exercise is excellent for developing upper chest definition.",
    "Decline Dumbbell Fly": "Focuses on the lower chest through a flying motion on a declined bench. The decline angle shifts tension to the lower portion of the chest, creating more complete pectoral development. Keep the movement controlled and feel the stretch at the bottom position for maximum effectiveness.",
    
    // Shoulder Exercises
    "Dumbbell Shoulder Press": "Builds overall shoulder strength and size by pressing dumbbells overhead. This compound movement primarily targets the anterior and middle deltoids while engaging the trapezius and triceps as supporting muscles. The dumbbell variation requires more stabilization than barbell presses, leading to greater muscle recruitment.",
    "Arnold Press": "A rotational shoulder press that targets all three deltoid heads in one fluid motion. Created by Arnold Schwarzenegger, this exercise begins with a supinated grip (palms facing you) and rotates to a pronated grip (palms facing forward) as you press up. This rotation engages the anterior, lateral, and posterior deltoids for complete shoulder development.",
    "Lateral Raises": "Isolates the middle deltoids by raising dumbbells to the sides. This isolation movement is essential for developing shoulder width and the rounded cap appearance of well-developed shoulders. Keep the movement strict with a slight bend in the elbows and focus on lifting with the side deltoids rather than using momentum.",
    "Front Raises": "Targets the front deltoids by raising dumbbells straight in front of you. This isolation exercise focuses on the anterior head of the deltoid, which is important for shoulder strength in pushing movements. Keep your core tight and avoid using momentum to lift the weights for maximum effectiveness.",
    "Reverse Fly": "Focuses on rear deltoids by pulling dumbbells outward while bent forward. This exercise targets the often-neglected posterior deltoid head, which is crucial for balanced shoulder development and improved posture. Think about squeezing your shoulder blades together at the top of the movement.",
    "Upright Rows": "Targets the side deltoids and traps with a vertical pulling motion. This compound exercise works the lateral deltoids, upper traps, and biceps simultaneously. Keep the dumbbells close to your body as you pull up to reduce wrist strain and maximize deltoid engagement.",
    "Dumbbell Shrugs": "Isolates the trapezius muscles with a simple shrugging motion. This straightforward exercise is excellent for building upper trap size and strength. Focus on lifting your shoulders straight up toward your ears rather than rolling them, and hold the contracted position briefly at the top.",
    "Rear Delt Fly": "Specifically targets the rear deltoids for balanced shoulder development. Can be performed seated, bent over, or lying face down on an incline bench. Balanced development of all three deltoid heads is crucial for shoulder health and aesthetics. Focus on keeping your chest up and maintaining a slight bend in your elbows.",
    "Single-Arm Shoulder Press": "Unilateral exercise that helps address strength imbalances between sides. This variation requires more core stabilization than bilateral presses and allows you to focus on perfecting form one arm at a time. The single-arm version also allows for a slightly greater range of motion at the top of the movement.",
    
    // Bicep Exercises
    "Dumbbell Bicep Curl": "Classic bicep exercise that builds size and strength in the bicep brachii. This fundamental movement allows for a full range of motion and can be performed with various hand positions to emphasize different aspects of the biceps. Focus on controlling the eccentric (lowering) portion of the curl for maximum muscle fiber recruitment.",
    "Hammer Curl": "Targets the brachialis and brachioradialis for thicker arms and stronger grip. By keeping your palms facing each other in a neutral grip, this variation places more emphasis on the brachialis (which lies underneath the biceps) and the brachioradialis in the forearm. This contributes to arm thickness and overall size.",
    "Concentration Curl": "Isolates the bicep with focused contraction while seated. This isolation exercise minimizes momentum and maximizes bicep tension by stabilizing your arm against your inner thigh. The concentration curl is excellent for developing the peak of the bicep and improving mind-muscle connection.",
    "Incline Dumbbell Curl": "Increases bicep stretch and range of motion by curling while on an incline bench. The inclined position places your arms behind your body, creating a greater stretch in the bicep at the bottom position. This increased stretch leads to more complete muscle development and potentially greater growth stimulus.",
    "Preacher Curl": "Isolates the bicep and prevents momentum by performing curls on a preacher bench. This exercise fixes your upper arms in place, preventing the cheating that often occurs during standing curls. The preacher curl emphasizes the lower portion of the bicep and helps develop the muscle insertion point.",
    "Reverse Curl": "Works the brachioradialis and forearms by curling with palms facing down. The pronated grip shifts emphasis away from the biceps brachii and toward the brachioradialis of the forearm and the brachialis underneath the biceps. This creates more complete arm development and improves grip strength.",
    "Spider Curl": "Maximizes bicep contraction by curling while lying face down on an incline bench. This position eliminates momentum and keeps constant tension on the biceps throughout the movement. The spider curl particularly targets the short head of the biceps and can help improve the peak when viewed from the side.",
    
    // Tricep Exercises
    "Dumbbell Overhead Triceps Extension": "Targets all three heads of the triceps with an overhead movement. This exercise particularly emphasizes the long head of the triceps, which is the largest of the three heads and contributes significantly to arm size. Keep your elbows pointing forward and upper arms close to your head throughout the movement.",
    "Dumbbell Kickbacks": "Isolates the triceps by extending the arm backwards in a bent-over position. This exercise creates peak contraction in the triceps at the top position when your arm is fully straightened. Focus on keeping your upper arm parallel to the floor and only moving at the elbow joint for proper isolation.",
    "Dumbbell Skull Crushers": "Works the triceps by lowering dumbbells toward the forehead while lying down. This exercise effectively targets all three heads of the triceps with emphasis on the lateral and medial heads. The dumbbell version allows for a greater range of motion than the barbell variation and lets each arm work independently.",
    "Close-Grip Dumbbell Press": "Targets the triceps with a narrow grip during the pressing motion. While this movement works the chest and shoulders as well, the close grip shifts emphasis to the triceps, particularly the lateral and medial heads. Keep your elbows tucked close to your body throughout the movement to maximize triceps engagement.",
    "Dumbbell Triceps Dips": "Engages the triceps through a dipping motion using dumbbells as support. This movement can be performed with dumbbells placed on benches or sturdy platforms. It effectively targets all three heads of the triceps while also engaging the chest and shoulders as secondary muscles.",
    "Dumbbell Triceps Extensions (Single-Arm)": "Focuses on each tricep individually for better mind-muscle connection. This unilateral exercise allows you to concentrate fully on one arm at a time, potentially identifying and correcting strength imbalances. You can perform this standing, seated, or with support for your working arm to maximize isolation.",
    
    // Forearm Exercises
    "Dumbbell Wrist Curls": "Strengthens wrist flexors by curling the weight with palms facing up. This exercise targets the muscles on the inner side of your forearm responsible for wrist flexion. Perform the movement with your forearms resting on a bench or your thighs, allowing only your hands to move through a full range of motion.",
    "Reverse Wrist Curls": "Targets wrist extensors by curling with palms facing down. This movement works the muscles on the outer side of your forearm that control wrist extension. These muscles are often weaker than the flexors and need dedicated work for balanced forearm development and injury prevention.",
    "Dumbbell Reverse Curl": "Works the brachioradialis and forearm extensors with a reverse grip curl. By curling with your palms facing down, this exercise shifts emphasis from the biceps to the forearm muscles. It's excellent for developing the prominent muscle mass on the thumb side of your forearm.",
    "Dumbbell Pinch Hold": "Improves grip strength by holding the weight plates of the dumbbell. This exercise works the muscles that control finger strength and endurance. Pinch the weight plates between your fingers and thumb and hold for time, gradually increasing duration as your grip strength improves.",
    "Wrist Rotations": "Strengthens forearm rotators by twisting dumbbells in a controlled motion. This exercise works the pronator and supinator muscles that control forearm rotation. Hold a dumbbell in front of you with your elbow bent at 90 degrees and slowly rotate your palm up and down through a full range of motion.",
    "Dumbbell Finger Curls": "Builds finger strength by rolling a dumbbell up and down with your fingertips. This exercise targets the flexor digitorum muscles that control finger flexion. Hold the dumbbell at the top with your fingertips and slowly lower it by extending your fingers, then curl it back up again.",
    "Dead Hang with Dumbbells": "Improves grip endurance by hanging from a bar while holding dumbbells. This challenging exercise builds tremendous grip strength and tests your hanging endurance. Start with light dumbbells and gradually increase weight as your grip strength improves.",
    
    // Core Exercises
    "Dumbbell Russian Twists": "Works obliques and rotational core strength with a twisting motion. This exercise targets the muscles along the sides of your abdomen that are responsible for trunk rotation. Sit at a 45-degree angle holding a dumbbell with both hands and twist from side to side, lightly touching the dumbbell to the ground on each side.",
    "Dumbbell Sit-Ups": "Intensifies abdominal engagement by holding a dumbbell during sit-ups. The added resistance increases the challenge to your rectus abdominis (the 'six-pack' muscles) and makes the standard sit-up more effective for strength building. Hold the dumbbell at your chest or overhead for varying levels of difficulty.",
    "Dumbbell Side Bends": "Targets obliques by bending sideways while holding a dumbbell. This lateral flexion movement works the oblique muscles that run along the sides of your torso. Hold a dumbbell in one hand and bend directly to the side, then return to upright. Complete all reps on one side before switching.",
    "Dumbbell Hanging Leg Raises": "Strengthens lower abs by raising legs while holding a dumbbell between feet. This challenging exercise primarily targets the lower portion of the rectus abdominis and the hip flexors. Hang from a pull-up bar, hold a dumbbell between your feet, and raise your legs to at least 90 degrees.",
    "Dumbbell V-Ups": "Engages the entire core by lifting arms and legs simultaneously while holding dumbbells. This comprehensive core exercise works both the upper and lower abdominals in a coordinated fashion. Lie flat, holding dumbbells overhead, then simultaneously lift your arms and legs to create a V-shape with your body.",
    
    // Leg Exercises
    "Dumbbell Squats": "Builds overall leg strength with dumbbells held at shoulder level. This compound movement targets the quadriceps, hamstrings, and glutes while also engaging the core for stability. The dumbbell version allows for a more natural stance and potentially greater depth than barbell squats.",
    "Dumbbell Goblet Squats": "Targets quads and glutes while improving squat form with a single dumbbell held at chest. This variation promotes proper squat mechanics by keeping your torso upright and allowing for a deeper range of motion. Hold a single dumbbell vertically against your chest with both hands as you squat.",
    "Dumbbell Bulgarian Split Squats": "Works quads, glutes, and improves balance with one foot elevated behind you. This unilateral exercise emphasizes single-leg strength and addresses muscle imbalances between legs. The rear foot elevation increases the range of motion at the hip and produces greater glute activation.",
    "Dumbbell Lunges": "Targets quads, hamstrings, and glutes with a stepping motion while holding dumbbells. This functional exercise mimics everyday movements while building lower body strength and improving balance. You can perform lunges stepping forward, backward, or in place depending on space and preferences.",
    "Dumbbell Step-Ups": "Builds unilateral leg strength by stepping onto an elevated platform. This exercise develops explosive power, balance, and coordination while targeting the quads and glutes. The height of the platform determines the difficulty – higher steps increase glute activation while lower steps focus more on the quads.",
    "Dumbbell Romanian Deadlifts": "Focuses on hamstrings and glutes with a hip-hinge movement. This exercise strengthens the posterior chain while teaching proper hip hinge mechanics essential for many athletic movements. Keep your back flat and knees slightly bent as you lower the dumbbells along your legs toward the floor.",
    "Dumbbell Sumo Deadlifts": "Targets inner thighs, hamstrings, and glutes with a wide stance. The wider foot position shifts emphasis to the inner thighs and glutes compared to conventional deadlifts. Hold dumbbells between your legs as you perform the hip hinge movement, keeping your chest up throughout.",
    "Dumbbell Calf Raises": "Isolates and builds calf muscles by raising heels while holding dumbbells. This exercise targets the gastrocnemius and soleus muscles of the lower leg. Perform on a flat surface for basic resistance or on a step or block to increase range of motion and effectiveness.",
    "Dumbbell Hamstring Curls": "Works the hamstrings by curling a dumbbell held between feet while lying down. This exercise isolates the hamstring muscles without requiring specialized equipment. Lie face down and place a dumbbell between your feet, then flex your knees to raise the weight toward your glutes.",
    "Dumbbell Wall Sit": "Improves isometric quad strength by holding a wall sit position with a dumbbell on lap. This static hold exercise builds endurance in the quadriceps. Place your back against a wall and lower into a seated position with thighs parallel to the floor, then hold a dumbbell on your lap to increase resistance."
  };

  const renderContent = () => {
    if (selectedTarget === "Chest" || selectedTarget === "Shoulder") {
      // For Chest and Shoulder, keep the original image-based layout
      const exercises = DUMBBELL_EXERCISES[selectedTarget];
      return (
        <>
          <div className="dumbbell-target-header">
            <h3>{selectedTarget}</h3>
            <p>{targetDescriptions[selectedTarget]}</p>
          </div>
          
          {exercises.map((exercise) => (
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
          ))}
        </>
      );
    } else {
      // For other muscle groups, show images when available and text only for others
      return (
        <>
          <div className="dumbbell-target-header">
            <h3>{selectedTarget}</h3>
            <p>{targetDescriptions[selectedTarget]}</p>
          </div>

          {/* Display exercises with images using the image layout */}
          {DUMBBELL_EXERCISES[selectedTarget]
            .filter(exercise => exerciseImages[exercise])
            .map(exercise => (
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
            ))
          }

          {/* Display exercises without images using the text-only layout */}
          <div className="dumbbell-exercises-grid">
            {DUMBBELL_EXERCISES[selectedTarget]
              .filter(exercise => !exerciseImages[exercise])
              .map((exercise, index) => (
                <div 
                  key={exercise} 
                  className={`dumbbell-exercise-card ${index % 2 === 0 ? 'left' : 'right'}`}
                >
                  <h3>{exercise}</h3>
                  <p>{exerciseDescriptions[exercise] || "Build strength and muscle with this effective dumbbell exercise."}</p>
                </div>
              ))
            }
          </div>
        </>
      );
    }
  };

  return (
    <div className="dumbbell-training-page">
      <div className="dumbbell-header">
        <h1>DUMBBELL EXERCISES</h1>
        <p>Comprehensive dumbbell workouts for targeted muscle development</p>
      </div>

      <div className="dumbbell-navigation-container">
        <div className="dumbbell-navigation">
          {Object.keys(DUMBBELL_EXERCISES).map((target) => (
            <button 
              key={target} 
              className={`dumbbell-nav-button ${selectedTarget === target ? 'active' : ''}`}
              onClick={() => handleTargetClick(target)}
            >
              {target}
            </button>
          ))}
        </div>
      </div>

      <div className="dumbbell-content-container">
        {renderContent()}
      </div>
    </div>
  );
}

export default DumbbellTraining; 