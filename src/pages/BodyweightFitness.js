import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BODYWEIGHT_EXERCISES } from './bodyWeightConstants';
import '../styles/BodyweightFitness.css';

// Import chest exercise images
import pushUpsImg from '../execises/body weight exercises/chest/Push-Ups.png';
import diamondPushUpsImg from '../execises/body weight exercises/chest/Diamond Push-Ups.png';
import archerPushUpsImg from '../execises/body weight exercises/chest/Archer Push-Ups.png';
import declinePushUpsImg from '../execises/body weight exercises/chest/Decline Push-Ups.png';

// Import shoulder exercise images
import pikePushUpsImg from '../execises/body weight exercises/shoulders/Pike Push-Ups.png';
import handstandPushUpsImg from '../execises/body weight exercises/shoulders/Handstand Push-Ups.png';
import wallWalksImg from '../execises/body weight exercises/shoulders/Wall Walks.png';

// Import bicep exercise images
import chinUpsImg from '../execises/body weight exercises/biceps/Chin-Ups.png';
import closeGripPullUpsImg from '../execises/body weight exercises/biceps/Close-Grip Pull-Ups.png';

// Import tricep exercise images
import dipsImg from '../execises/body weight exercises/triceps/Dips (on Bars).png';
import benchDipsImg from '../execises/body weight exercises/triceps/Bench Dips.png';
import tricepsExtensionsImg from '../execises/body weight exercises/triceps/Triceps Extensions (Bodyweight).png';

// Import forearm exercise images
import deadHangImg from '../execises/body weight exercises/forearms/Dead Hang.png';
import fingerTipPushUpsImg from '../execises/body weight exercises/forearms/Finger Tip Push-Ups.png';
import wristCurlsImg from '../execises/body weight exercises/forearms/Wrist Curls (using a surface).webp';

// Import core exercise images
import hangingLegRaisesImg from '../execises/body weight exercises/core/Hanging Leg Raises.png';
import plankImg from '../execises/body weight exercises/core/Plank.png';
import sidePlankImg from '../execises/body weight exercises/core/Side Plank.png';
import vUpsImg from '../execises/body weight exercises/core/V-Ups.png';
import bicycleCrunchesImg from '../execises/body weight exercises/core/Bicycle Crunches.png';

// Import leg exercise images
import bodyweightSquatsImg from '../execises/body weight exercises/legs/Bodyweight Squats.png';
import bulgarianSplitSquatsImg from '../execises/body weight exercises/legs/Bulgarian Split Squats.png';
import jumpSquatsImg from '../execises/body weight exercises/legs/Jump Squats.png';
import pistolSquatsImg from '../execises/body weight exercises/legs/Pistol Squats.png';
import stepUpsImg from '../execises/body weight exercises/legs/Step-Ups.png';
import wallSitImg from '../execises/body weight exercises/legs/Wall Sit.png';
import calfRaisesImg from '../execises/body weight exercises/legs/Calf Raises.png';

function BodyweightFitness() {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState("Chest");

  const handleTargetClick = (target) => {
    setSelectedTarget(target);
  };

  // Create an image mapping
  const exerciseImages = {
    // Chest exercises
    "Push-Ups": pushUpsImg,
    "Diamond Push-Ups": diamondPushUpsImg,
    "Archer Push-Ups": archerPushUpsImg,
    "Decline Push-Ups": declinePushUpsImg,
    
    // Shoulder exercises
    "Pike Push-Ups": pikePushUpsImg,
    "Handstand Push-Ups": handstandPushUpsImg,
    "Wall Walks": wallWalksImg,
    
    // Bicep exercises
    "Chin-Ups": chinUpsImg,
    "Close-Grip Pull-Ups": closeGripPullUpsImg,
    
    // Tricep exercises
    "Dips (on Bars)": dipsImg,
    "Bench Dips": benchDipsImg,
    "Triceps Extensions (Bodyweight)": tricepsExtensionsImg,
    
    // Forearm exercises
    "Dead Hang": deadHangImg,
    "Finger Tip Push-Ups": fingerTipPushUpsImg,
    "Wrist Curls (using a surface)": wristCurlsImg,
    
    // Core exercises
    "Hanging Leg Raises": hangingLegRaisesImg,
    "Plank": plankImg,
    "Side Plank": sidePlankImg,
    "V-Ups": vUpsImg,
    "Bicycle Crunches": bicycleCrunchesImg,
    
    // Leg exercises
    "Bodyweight Squats": bodyweightSquatsImg,
    "Bulgarian Split Squats": bulgarianSplitSquatsImg,
    "Jump Squats": jumpSquatsImg,
    "Pistol Squats": pistolSquatsImg,
    "Step-Ups": stepUpsImg,
    "Wall Sit": wallSitImg,
    "Calf Raises": calfRaisesImg
  };

  const targetDescriptions = {
    "Chest": "Build a powerful chest using only your bodyweight. These exercises focus on various angles and leverage positions to effectively target your pectorals without any equipment, perfect for home workouts or when traveling.",
    "Shoulders": "Develop strong, defined shoulders with these challenging bodyweight movements. These exercises build impressive deltoid strength and size while also improving balance, coordination, and overall upper body stability.",
    "Bicep": "Sculpt impressive biceps without weights using these pull-based bodyweight exercises. These movements engage multiple muscle groups while placing significant emphasis on the biceps for balanced arm development.",
    "Tricep": "Build powerful triceps using your own body as resistance. These pushing exercises target all three heads of the triceps effectively, creating definition and strength in the back of your arms.",
    "Forearms": "Develop grip strength and forearm endurance through these specialized bodyweight movements. Strong forearms improve performance in all other exercises and daily activities requiring hand strength.",
    "Core": "Strengthen your entire midsection with these effective bodyweight core exercises. A strong core improves posture, reduces back pain, enhances athletic performance, and creates a solid foundation for all movement.",
    "Legs": "Build lower body strength and power without weights using these progressive bodyweight leg exercises. These movements develop functional strength, improve balance, and can be scaled to challenge even advanced athletes."
  };

  const exerciseDescriptions = {
    // Chest Exercises
    "Push-Ups": "The fundamental bodyweight chest exercise targeting the pectorals, front deltoids, and triceps. Standard push-ups can be performed anywhere with no equipment, making them incredibly versatile. Focus on a full range of motion, keeping your core tight and body in a straight line from head to heels. For progression, you can elevate your feet, add a weighted vest, or try more advanced variations.",
    "Diamond Push-Ups": "A challenging push-up variation with hands placed close together forming a diamond shape. This position shifts more emphasis to the triceps while still engaging the chest muscles. The narrower hand position increases the difficulty and requires greater stability. Ensure your elbows track close to your body rather than flaring out to protect your shoulders.",
    "Archer Push-Ups": "An advanced unilateral push-up variation where one arm extends sideways while the other performs the pushing motion. This creates greater load on the working pectoral and tricep, similar to a single-arm chest press. This variation helps address strength imbalances between sides and builds considerable chest strength as a progression toward one-arm push-ups.",
    "Decline Push-Ups": "Performed with feet elevated on a bench, chair, or box, this variation places greater emphasis on the upper chest (clavicular head of the pectoralis major). The higher the feet are elevated, the more the upper chest is targeted. This variation is excellent for developing a balanced chest when paired with standard or incline push-ups.",

    // Shoulder Exercises
    "Pike Push-Ups": "A vertical pushing movement that shifts emphasis from the chest to the shoulders. By forming an inverted V position with your body and performing push-ups, you create a movement pattern similar to an overhead press. This exercise is an excellent progression toward handstand push-ups and effectively targets the anterior and medial deltoids.",
    "Handstand Push-Ups": "An advanced bodyweight exercise performed in a handstand position against a wall. This movement powerfully targets the shoulders, triceps, and upper chest while requiring significant core stability. For beginners, partial reps with feet supported on an elevated surface can be used as a progression. Complete handstand push-ups demonstrate exceptional upper body strength.",
    "Wall Walks": "A dynamic exercise that builds shoulder strength and stability while improving the handstand position. Beginning in a push-up position with feet against a wall, you walk your feet up the wall while walking hands closer, eventually reaching a handstand position. This movement develops shoulder endurance and proprioception while preparing you for handstand push-ups.",

    // Bicep Exercises
    "Chin-Ups": "One of the most effective bodyweight exercises for bicep development, performed by pulling your body up to a bar with palms facing toward you. The supinated (underhand) grip places significant tension on the biceps while also engaging the lats and other back muscles. Chin-ups build tremendous bicep strength and can be progressed by adding weight or performing more challenging variations.",
    "Close-Grip Pull-Ups": "A pull-up variation with hands placed closer together than shoulder width. This grip places greater emphasis on the biceps compared to wide-grip pull-ups, which target the lats more directly. The close grip position also engages the brachialis muscle, which lies underneath the biceps and contributes to arm thickness. Focus on pulling with your arms rather than momentum.",

    // Tricep Exercises
    "Dips (on Bars)": "A powerful upper body pushing exercise performed between parallel bars. Dips target the triceps, chest, and shoulders, with greater tricep emphasis when performed with a more vertical torso. This exercise allows for significant loading of the triceps and is one of the most effective bodyweight movements for developing tricep size and strength. Focus on a full range of motion for maximum benefit.",
    "Bench Dips": "A more accessible dip variation performed with hands on a bench or chair and feet on the ground or elevated. This exercise primarily targets the triceps while also engaging the shoulders and chest to a lesser degree. Bench dips are excellent for beginners building up to full parallel bar dips. Extending the legs further from your body increases the difficulty.",
    "Triceps Extensions (Bodyweight)": "Performed in a push-up position with hands close together and elbows tucked in. From this position, bend at the elbows allowing the head to dip toward the ground, then extend the arms using primarily tricep strength. This movement isolates the triceps more than standard push-ups and can be intensified by performing on an incline with feet elevated.",

    // Forearm Exercises
    "Dead Hang": "A simple but challenging isometric hold from a pull-up bar. By hanging with arms fully extended for time, you build tremendous grip endurance and forearm strength. This exercise also decompresses the spine and improves shoulder mobility. Progress by increasing hang time, using a thicker bar, or hanging from fingertips rather than a full grip.",
    "Finger Tip Push-Ups": "An advanced push-up variation performed on the fingertips rather than flat palms. This position places significant stress on the finger flexors and forearm muscles, developing extraordinary grip and forearm strength. Begin with partial reps or from the knees before attempting full finger tip push-ups, and ensure fingers are properly warmed up to prevent injury.",
    "Wrist Curls (using a surface)": "A bodyweight wrist strengthening exercise performed by kneeling at a flat surface and placing the back of your forearms on the surface with hands hanging off the edge. Curl your hands up and down using only wrist movement. This exercise targets the wrist flexors on the inner forearm without requiring weights. Adding multiple sets develops forearm endurance and size.",

    // Core Exercises
    "Hanging Leg Raises": "A challenging core exercise performed hanging from a pull-up bar. By raising the legs from a hanging position, you target the lower abdominals and hip flexors with minimal lower back stress. This exercise builds tremendous core strength and can be progressed from bent knee raises to straight leg raises and eventually toes-to-bar for advanced athletes.",
    "Plank": "A fundamental isometric core exercise that builds endurance in the entire midsection. By holding a push-up position on your forearms, you engage the rectus abdominis, obliques, and transverse abdominis simultaneously. The plank also recruits the shoulders, chest, quads, and glutes as stabilizers. Focus on maintaining a perfectly straight line from head to heels.",
    "Side Plank": "Targets the obliques and lateral core muscles by supporting your body weight on one forearm with feet stacked. This position challenges your ability to resist lateral flexion, building crucial core stability. Side planks also engage the shoulders, glutes, and hip abductors. For progression, you can add movement by raising and lowering the top hip or extending the top arm.",
    "V-Ups": "A dynamic core exercise that simultaneously engages both the upper and lower abdominals. By lifting both the upper and lower body at the same time to form a V shape, you create a powerful contraction through the entire rectus abdominis. This exercise is more challenging than sit-ups or leg raises alone and develops excellent core strength for other movements.",
    "Bicycle Crunches": "A dynamic core exercise targeting the rectus abdominis and obliques. By bringing opposite elbow to knee in a cycling motion, you create rotation that effectively engages the obliques while the straight leg extension activates the lower abs. This exercise has been shown in EMG studies to create some of the highest activation in the abdominal muscles of any bodyweight movement.",

    // Leg Exercises
    "Bodyweight Squats": "The fundamental lower body exercise targeting the quadriceps, hamstrings, glutes, and calves. Bodyweight squats build the foundation for all lower body strength and can be performed anywhere with no equipment. Focus on depth (thighs at least parallel to the ground), keeping your chest up, and knees tracking over toes for proper mechanics.",
    "Bulgarian Split Squats": "A unilateral leg exercise performed with the rear foot elevated on a bench or chair. This position creates greater demand on the working leg, making it an effective single-leg strengthener even without added weight. This exercise targets the quads, glutes, and hamstrings while also challenging balance and addressing strength imbalances between legs.",
    "Jump Squats": "A plyometric squat variation that develops explosive power in the lower body. By exploding upward from the squat position into a jump, you develop fast-twitch muscle fibers and athletic power. This exercise increases heart rate quickly, making it excellent for conditioning. Focus on soft landings by absorbing force through the legs rather than landing stiffly.",
    "Pistol Squats": "An advanced single-leg squat performed with one leg extended forward while squatting on the other. This challenging movement requires exceptional strength, balance, and mobility. Pistol squats build tremendous unilateral leg strength and highlight mobility limitations or imbalances. Most people require progressive steps before achieving full pistol squats.",
    "Step-Ups": "A functional unilateral exercise performed by stepping onto an elevated surface with one leg. This movement mimics stair climbing but with greater intensity when performed on a higher box or bench. Step-ups target the quads and glutes while also improving hip stability and balance. The height of the step determines the difficulty level.",
    "Wall Sit": "An isometric leg exercise performed by holding a seated position with your back against a wall and thighs parallel to the ground. This stationary hold creates continuous tension in the quadriceps, building endurance and strength. Wall sits are excellent for developing the capacity to sustain muscle contraction, important for many sports and activities.",
    "Calf Raises": "Targets the gastrocnemius and soleus muscles by rising onto the balls of your feet. This exercise can be performed on flat ground, with toes elevated on a small platform for increased range of motion, or on one leg at a time for increased difficulty. Calf raises build ankle stability and lower leg strength necessary for running, jumping, and overall athletic performance."
  };

  const renderContent = () => {
    const exercises = BODYWEIGHT_EXERCISES[selectedTarget];

    return (
      <>
        <div className="bodyweight-target-header">
          <h3>{selectedTarget}</h3>
          <p>{targetDescriptions[selectedTarget]}</p>
        </div>

        <div className="bodyweight-exercises-container">
          {exercises.map((exercise) => {
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
                  className="bodyweight-exercise-card left"
                >
                  <h3>{exercise}</h3>
                  <p>{exerciseDescriptions[exercise] || "Build functional strength and muscle with this effective bodyweight exercise."}</p>
                </div>
              );
            }
          })}
        </div>
      </>
    );
  };

  return (
    <div className="bodyweight-fitness-page">
      <div className="bodyweight-header">
        <h1>BODYWEIGHT EXERCISES</h1>
        <p>Effective exercises using only your body weight for resistance</p>
      </div>

      <div className="bodyweight-navigation-container">
        <div className="bodyweight-navigation">
          {Object.keys(BODYWEIGHT_EXERCISES).map((target) => (
            <button 
              key={target} 
              className={`bodyweight-nav-button ${selectedTarget === target ? 'active' : ''}`}
              onClick={() => handleTargetClick(target)}
            >
              {target}
            </button>
          ))}
        </div>
      </div>

      <div className="bodyweight-content-container">
        {renderContent()}
      </div>
    </div>
  );
}

export default BodyweightFitness; 