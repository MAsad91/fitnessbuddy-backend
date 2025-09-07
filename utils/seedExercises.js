const Exercise = require('../models/Exercise');
const mongoose = require('mongoose');

const exerciseData = [
  {
    name: 'Lying Leg Curls',
    category: 'Strength',
    description: 'An isolation exercise targeting the hamstrings',
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Calves'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/lying-leg-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/lying-leg-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/lying-leg-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Lie face down on machine, legs straight' },
      { step: 2, description: 'Curl legs up towards glutes' },
      { step: 3, description: 'Lower weight with control' }
    ],
    formCues: ['Keep hips down', 'Squeeze hamstrings', 'Full range of motion'],
    safetyTips: ['Don\'t arch back', 'Control the weight', 'Don\'t bounce'],
    commonMistakes: ['Using momentum', 'Lifting hips', 'Too much weight'],
    type: 'isolation',
    equipment: ['Leg Curl Machine'],
    difficulty: 'beginner'
  },
  {
    name: 'Good Mornings',
    category: 'Strength',
    description: 'A compound movement targeting the posterior chain',
    primaryMuscles: ['Hamstrings', 'Lower Back'],
    secondaryMuscles: ['Glutes', 'Upper Back'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/good-mornings.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/good-mornings.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/good-mornings-thumb.jpg',
    instructions: [
      { step: 1, description: 'Place bar on upper back' },
      { step: 2, description: 'Hinge at hips while keeping back straight' },
      { step: 3, description: 'Return to starting position' }
    ],
    formCues: ['Hip hinge movement', 'Keep back straight', 'Chest up'],
    safetyTips: ['Start light', 'Don\'t round back', 'Maintain tension'],
    commonMistakes: ['Rounding back', 'Bending knees too much', 'Looking down'],
    type: 'compound',
    equipment: ['Barbell'],
    difficulty: 'intermediate'
  },
  {
    name: 'Seated Leg Curls',
    category: 'Strength',
    description: 'An isolation exercise for hamstring development',
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Calves'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/seated-leg-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/seated-leg-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/seated-leg-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Sit on machine with legs extended' },
      { step: 2, description: 'Curl legs back towards body' },
      { step: 3, description: 'Return to starting position with control' }
    ],
    formCues: ['Keep back against pad', 'Squeeze at bottom', 'Control movement'],
    safetyTips: ['Don\'t use momentum', 'Adjust seat position', 'Keep core engaged'],
    commonMistakes: ['Rushing movement', 'Poor seat adjustment', 'Using too much weight'],
    type: 'isolation',
    equipment: ['Leg Curl Machine'],
    difficulty: 'beginner'
  },
  {
    name: 'Nordic Hamstring Curls',
    category: 'Strength',
    description: 'An advanced bodyweight exercise for hamstring strength',
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Lower Back', 'Core'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/nordic-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/nordic-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/nordic-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Kneel with feet secured' },
      { step: 2, description: 'Lower body forward while keeping hips straight' },
      { step: 3, description: 'Use hands to push back up if needed' }
    ],
    formCues: ['Keep hips extended', 'Control descent', 'Maintain straight line'],
    safetyTips: ['Use padding for knees', 'Start with assistance', 'Progress gradually'],
    commonMistakes: ['Breaking at hips', 'Falling forward', 'Poor control'],
    type: 'compound',
    equipment: ['None'],
    difficulty: 'advanced'
  },
  {
    name: 'Cable Pull Through',
    category: 'Strength',
    description: 'A hip hinge movement targeting hamstrings and glutes',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Core'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/cable-pull-through.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/cable-pull-through.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/cable-pull-through-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand facing away from cable machine' },
      { step: 2, description: 'Hinge at hips, keeping back straight' },
      { step: 3, description: 'Drive hips forward to stand up' }
    ],
    formCues: ['Hip hinge movement', 'Keep back straight', 'Control the weight'],
    safetyTips: ['Don\'t round back', 'Keep core tight', 'Maintain balance'],
    commonMistakes: ['Squatting not hinging', 'Rounding back', 'Losing balance'],
    type: 'compound',
    equipment: ['Cable Machine'],
    difficulty: 'intermediate'
  },
  {
    name: 'Barbell Bench Press',
    category: 'Strength',
    description: 'A compound exercise that primarily targets the chest muscles',
    primaryMuscles: ['Chest', 'Pectoralis Major'],
    secondaryMuscles: ['Front Deltoids', 'Triceps'],
    muscleGroup: 'Chest',
    demoImages: [
      'https://storage.googleapis.com/fitness-app/exercises/bench-press-1.jpg',
      'https://storage.googleapis.com/fitness-app/exercises/bench-press-2.jpg'
    ],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/bench-press.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/bench-press-thumb.jpg',
    instructions: [
      {
        step: 1,
        description: 'Lie on the bench with your feet flat on the ground',
        image: 'https://storage.googleapis.com/fitness-app/exercises/bench-press-step1.jpg'
      },
      {
        step: 2,
        description: 'Grip the bar slightly wider than shoulder width',
        image: 'https://storage.googleapis.com/fitness-app/exercises/bench-press-step2.jpg'
      },
      {
        step: 3,
        description: 'Lower the bar to your chest while keeping your elbows at about 45 degrees',
        image: 'https://storage.googleapis.com/fitness-app/exercises/bench-press-step3.jpg'
      },
      {
        step: 4,
        description: 'Press the bar back up to the starting position',
        image: 'https://storage.googleapis.com/fitness-app/exercises/bench-press-step4.jpg'
      }
    ],
    formCues: [
      'Keep your wrists straight',
      'Drive your feet into the ground',
      'Keep your core tight',
      'Maintain a slight arch in your lower back'
    ],
    safetyTips: [
      'Always use a spotter for heavy lifts',
      'Keep your butt on the bench',
      'Don\'t bounce the bar off your chest'
    ],
    commonMistakes: [
      'Flaring elbows too wide',
      'Lifting hips off the bench',
      'Uneven bar path'
    ],
    type: 'compound',
    equipment: ['Barbell', 'Bench'],
    difficulty: 'intermediate'
  },
  {
    name: 'Pull-ups',
    category: 'Strength',
    description: 'A bodyweight exercise that builds upper body strength',
    primaryMuscles: ['Latissimus Dorsi', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Core'],
    muscleGroup: 'Back',
    demoImages: [
      'https://storage.googleapis.com/fitness-app/exercises/pullup-1.jpg',
      'https://storage.googleapis.com/fitness-app/exercises/pullup-2.jpg'
    ],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/pullup.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/pullup-thumb.jpg',
    instructions: [
      {
        step: 1,
        description: 'Hang from the pull-up bar with hands slightly wider than shoulders',
        image: 'https://storage.googleapis.com/fitness-app/exercises/pullup-step1.jpg'
      },
      {
        step: 2,
        description: 'Pull yourself up until your chin is over the bar',
        image: 'https://storage.googleapis.com/fitness-app/exercises/pullup-step2.jpg'
      },
      {
        step: 3,
        description: 'Lower yourself back down with control',
        image: 'https://storage.googleapis.com/fitness-app/exercises/pullup-step3.jpg'
      }
    ],
    formCues: [
      'Keep your core engaged',
      'Lead with your chest',
      'Squeeze your shoulder blades together'
    ],
    safetyTips: [
      'Don\'t swing or kip',
      'Maintain controlled movement',
      'Use full range of motion'
    ],
    commonMistakes: [
      'Using momentum',
      'Incomplete range of motion',
      'Not engaging the lats'
    ],
    type: 'compound',
    equipment: ['Pull-up Bar'],
    difficulty: 'intermediate'
  },
  {
    name: 'Bodyweight Squats',
    category: 'Strength',
    description: 'A fundamental lower body exercise that targets multiple muscle groups',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
    muscleGroup: 'Legs',
    demoImages: [
      'https://storage.googleapis.com/fitness-app/exercises/squat-1.jpg',
      'https://storage.googleapis.com/fitness-app/exercises/squat-2.jpg'
    ],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/squat.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/squat-thumb.jpg',
    instructions: [
      {
        step: 1,
        description: 'Stand with feet shoulder-width apart',
        image: 'https://storage.googleapis.com/fitness-app/exercises/squat-step1.jpg'
      },
      {
        step: 2,
        description: 'Lower your body as if sitting back into a chair',
        image: 'https://storage.googleapis.com/fitness-app/exercises/squat-step2.jpg'
      },
      {
        step: 3,
        description: 'Keep your chest up and core engaged',
        image: 'https://storage.googleapis.com/fitness-app/exercises/squat-step3.jpg'
      },
      {
        step: 4,
        description: 'Push through your heels to return to standing',
        image: 'https://storage.googleapis.com/fitness-app/exercises/squat-step4.jpg'
      }
    ],
    formCues: [
      'Keep your chest up',
      'Knees in line with toes',
      'Weight in your heels',
      'Core engaged'
    ],
    safetyTips: [
      'Don\'t let knees cave inward',
      'Keep your back straight',
      'Breathe throughout the movement'
    ],
    commonMistakes: [
      'Rounding the back',
      'Knees caving in',
      'Not going deep enough',
      'Rising on toes'
    ],
    type: 'compound',
    equipment: ['None'],
    difficulty: 'beginner'
  },
  {
    name: 'Dumbbell Flyes',
    category: 'Strength',
    description: 'An isolation exercise that targets the chest muscles from a different angle',
    primaryMuscles: ['Chest', 'Pectoralis Major'],
    secondaryMuscles: ['Front Deltoids'],
    muscleGroup: 'Chest',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/dumbbell-flyes.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/dumbbell-flyes.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/dumbbell-flyes-thumb.jpg',
    instructions: [
      { step: 1, description: 'Lie on a flat bench holding dumbbells above your chest' },
      { step: 2, description: 'With a slight bend in your elbows, lower the weights out to your sides' },
      { step: 3, description: 'Bring the weights back up in an arc motion' }
    ],
    formCues: ['Keep slight bend in elbows', 'Move in an arc motion', 'Feel stretch in chest'],
    safetyTips: ['Don\'t go too heavy', 'Maintain control throughout'],
    commonMistakes: ['Straightening arms completely', 'Moving too fast'],
    type: 'isolation',
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'intermediate'
  },
  {
    name: 'Barbell Rows',
    category: 'Strength',
    description: 'A compound exercise for building back thickness and strength',
    primaryMuscles: ['Latissimus Dorsi', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Core'],
    muscleGroup: 'Back',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/barbell-rows.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/barbell-rows.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/barbell-rows-thumb.jpg',
    instructions: [
      { step: 1, description: 'Bend at hips and knees, keeping back straight' },
      { step: 2, description: 'Grip barbell with hands slightly wider than shoulder width' },
      { step: 3, description: 'Pull barbell to lower chest while keeping elbows close to body' }
    ],
    formCues: ['Keep back straight', 'Squeeze shoulder blades', 'Look down to maintain neutral spine'],
    safetyTips: ['Maintain neutral spine', 'Keep core engaged'],
    commonMistakes: ['Rounding back', 'Using momentum', 'Pulling too high'],
    type: 'compound',
    equipment: ['Barbell'],
    difficulty: 'intermediate'
  },
  {
    name: 'Romanian Deadlift',
    category: 'Strength',
    description: 'A hip-hinge movement that targets the posterior chain',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Core'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/romanian-deadlift.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/romanian-deadlift.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/romanian-deadlift-thumb.jpg',
    instructions: [
      { step: 1, description: 'Hold barbell at hip level with straight arms' },
      { step: 2, description: 'Hinge at hips while keeping back straight' },
      { step: 3, description: 'Lower weight until you feel stretch in hamstrings' }
    ],
    formCues: ['Hip hinge movement', 'Keep back straight', 'Feel stretch in hamstrings'],
    safetyTips: ['Don\'t round lower back', 'Keep bar close to legs'],
    commonMistakes: ['Bending knees too much', 'Rounding back', 'Bar too far from legs'],
    type: 'compound',
    equipment: ['Barbell'],
    difficulty: 'intermediate'
  },
  {
    name: 'Overhead Press',
    category: 'Strength',
    description: 'A fundamental shoulder strengthening exercise',
    primaryMuscles: ['Deltoids', 'Shoulders'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    muscleGroup: 'Shoulders',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/overhead-press.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/overhead-press.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/overhead-press-thumb.jpg',
    instructions: [
      { step: 1, description: 'Hold barbell at shoulder level' },
      { step: 2, description: 'Press weight overhead while keeping core tight' },
      { step: 3, description: 'Lower weight back to shoulders with control' }
    ],
    formCues: ['Keep core tight', 'Full extension at top', 'Maintain straight bar path'],
    safetyTips: ['Don\'t arch back', 'Breathe properly', 'Keep wrists straight'],
    commonMistakes: ['Arching back', 'Pressing forward instead of up', 'Not engaging core'],
    type: 'compound',
    equipment: ['Barbell'],
    difficulty: 'intermediate'
  },
  {
    name: 'Plank',
    category: 'Strength',
    description: 'An isometric core exercise that builds stability',
    primaryMuscles: ['Core', 'Abdominals'],
    secondaryMuscles: ['Shoulders', 'Lower Back'],
    muscleGroup: 'Core',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/plank.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/plank.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/plank-thumb.jpg',
    instructions: [
      { step: 1, description: 'Start in push-up position with forearms on ground' },
      { step: 2, description: 'Keep body in straight line from head to heels' },
      { step: 3, description: 'Hold position while breathing steadily' }
    ],
    formCues: ['Keep body straight', 'Engage core', 'Look at floor'],
    safetyTips: ['Don\'t sag hips', 'Breathe steadily', 'Don\'t hold breath'],
    commonMistakes: ['Sagging hips', 'Lifting buttocks', 'Looking forward'],
    type: 'isolation',
    equipment: ['None'],
    difficulty: 'beginner'
  },
  {
    name: 'Mountain Climbers',
    category: 'Cardio',
    description: 'A dynamic exercise that combines cardio and core work',
    primaryMuscles: ['Core', 'Hip Flexors'],
    secondaryMuscles: ['Shoulders', 'Chest', 'Quads'],
    muscleGroup: 'Full Body',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/mountain-climbers.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/mountain-climbers.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/mountain-climbers-thumb.jpg',
    instructions: [
      { step: 1, description: 'Start in push-up position' },
      { step: 2, description: 'Alternate bringing knees to chest' },
      { step: 3, description: 'Keep hips level throughout movement' }
    ],
    formCues: ['Keep core tight', 'Move quickly but controlled', 'Maintain hip position'],
    safetyTips: ['Don\'t bounce', 'Keep back flat', 'Land softly'],
    commonMistakes: ['Bouncing hips', 'Moving too slowly', 'Not engaging core'],
    type: 'compound',
    equipment: ['None'],
    difficulty: 'beginner'
  },
  {
    name: 'Dynamic Hip Stretches',
    category: 'Flexibility',
    description: 'Dynamic stretching routine for hip mobility',
    primaryMuscles: ['Hip Flexors', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Hamstrings'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/hip-stretches.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/hip-stretches.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/hip-stretches-thumb.jpg',
    instructions: [
      { step: 1, description: 'Start in lunge position' },
      { step: 2, description: 'Perform controlled leg swings' },
      { step: 3, description: 'Rotate torso while maintaining balance' }
    ],
    formCues: ['Move with control', 'Keep core engaged', 'Breathe steadily'],
    safetyTips: ['Don\'t bounce', 'Stay within comfortable range', 'Warm up first'],
    commonMistakes: ['Moving too fast', 'Poor balance', 'Not warming up'],
    type: 'isolation',
    equipment: ['None'],
    difficulty: 'beginner'
  },
  {
    name: 'Tricep Pushdowns',
    category: 'Strength',
    description: 'An isolation exercise targeting the triceps muscles',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Forearms'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/tricep-pushdowns.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/tricep-pushdowns.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/tricep-pushdowns-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand facing cable machine with high attachment' },
      { step: 2, description: 'Grab rope or bar attachment with overhand grip' },
      { step: 3, description: 'Push down until arms are fully extended' },
      { step: 4, description: 'Control the weight back up to starting position' }
    ],
    formCues: ['Keep elbows at sides', 'Full extension at bottom', 'Control the movement'],
    safetyTips: ['Don\'t use momentum', 'Keep upper arms still', 'Maintain good posture'],
    commonMistakes: ['Moving elbows away from sides', 'Using too much weight', 'Rushing the movement'],
    type: 'isolation',
    equipment: ['Cable Machine'],
    difficulty: 'beginner'
  },
  {
    name: 'Skull Crushers',
    category: 'Strength',
    description: 'A lying triceps extension exercise that targets all three heads of the triceps',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Shoulders'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/skull-crushers.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/skull-crushers.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/skull-crushers-thumb.jpg',
    instructions: [
      { step: 1, description: 'Lie on bench holding weights above chest' },
      { step: 2, description: 'Bend elbows to lower weight toward forehead' },
      { step: 3, description: 'Extend arms back to starting position' }
    ],
    formCues: ['Keep elbows pointed forward', 'Control the descent', 'Full extension at top'],
    safetyTips: ['Don\'t flare elbows', 'Start light', 'Use spotter for heavy weights'],
    commonMistakes: ['Moving elbows', 'Using too much weight', 'Incomplete range of motion'],
    type: 'isolation',
    equipment: ['Barbell', 'EZ Bar', 'Dumbbells'],
    difficulty: 'intermediate'
  },
  {
    name: 'Incline Dumbbell Press',
    category: 'Strength',
    description: 'A compound exercise targeting the upper chest muscles',
    primaryMuscles: ['Upper Chest', 'Pectoralis Major'],
    secondaryMuscles: ['Front Deltoids', 'Triceps'],
    muscleGroup: 'Chest',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/incline-db-press.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/incline-db-press.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/incline-db-press-thumb.jpg',
    instructions: [
      { step: 1, description: 'Set bench to 30-45 degree angle' },
      { step: 2, description: 'Sit with back firmly against bench' },
      { step: 3, description: 'Press dumbbells up with controlled movement' },
      { step: 4, description: 'Lower weights with control to starting position' }
    ],
    formCues: ['Keep core tight', 'Drive through chest', 'Maintain control throughout'],
    safetyTips: ['Start with lighter weights', 'Use spotter when needed', 'Maintain proper form'],
    commonMistakes: ['Arching back', 'Bouncing weights', 'Uneven pressing'],
    type: 'compound',
    equipment: ['Dumbbells', 'Incline Bench'],
    difficulty: 'intermediate'
  },
  {
    name: 'Diamond Push-ups',
    category: 'Strength',
    description: 'A bodyweight exercise that emphasizes triceps development',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Shoulders'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/diamond-pushups.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/diamond-pushups.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/diamond-pushups-thumb.jpg',
    instructions: [
      { step: 1, description: 'Form diamond shape with hands under chest' },
      { step: 2, description: 'Lower body while keeping elbows close' },
      { step: 3, description: 'Push back up to starting position' }
    ],
    formCues: ['Keep elbows close to body', 'Maintain straight body line', 'Full range of motion'],
    safetyTips: ['Don\'t let hips sag', 'Start on knees if needed', 'Warm up shoulders'],
    commonMistakes: ['Flaring elbows', 'Incomplete range', 'Sagging hips'],
    type: 'compound',
    equipment: ['None'],
    difficulty: 'intermediate'
  },
  {
    name: 'Decline Bench Press',
    category: 'Strength',
    description: 'A compound exercise targeting the lower chest muscles',
    primaryMuscles: ['Lower Chest', 'Pectoralis Major'],
    secondaryMuscles: ['Front Deltoids', 'Triceps'],
    muscleGroup: 'Chest',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/decline-press.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/decline-press.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/decline-press-thumb.jpg',
    instructions: [
      { step: 1, description: 'Secure legs on decline bench' },
      { step: 2, description: 'Grip bar slightly wider than shoulder width' },
      { step: 3, description: 'Lower bar to lower chest' },
      { step: 4, description: 'Press bar back up to starting position' }
    ],
    formCues: ['Control the descent', 'Keep wrists straight', 'Tuck elbows slightly'],
    safetyTips: ['Use safety catches', 'Have spotter present', 'Secure foot position'],
    commonMistakes: ['Bouncing bar off chest', 'Arching back excessively', 'Uneven pressing'],
    type: 'compound',
    equipment: ['Barbell', 'Decline Bench'],
    difficulty: 'intermediate'
  },
  {
    name: 'Lat Pulldowns',
    category: 'Strength',
    description: 'A machine-based exercise targeting the latissimus dorsi muscles',
    primaryMuscles: ['Latissimus Dorsi', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids'],
    muscleGroup: 'Back',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/lat-pulldown.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/lat-pulldown.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/lat-pulldown-thumb.jpg',
    instructions: [
      { step: 1, description: 'Sit at lat pulldown machine with thighs secured' },
      { step: 2, description: 'Grab bar with wide grip, slightly wider than shoulders' },
      { step: 3, description: 'Pull bar down to upper chest while squeezing lats' },
      { step: 4, description: 'Control the weight back up to starting position' }
    ],
    formCues: ['Lead with elbows', 'Keep chest up', 'Squeeze lats at bottom'],
    safetyTips: ['Don\'t lean back excessively', 'Control the movement', 'Keep core engaged'],
    commonMistakes: ['Using momentum', 'Pulling with arms only', 'Leaning back too far'],
    type: 'compound',
    equipment: ['Lat Pulldown Machine'],
    difficulty: 'beginner'
  },
  {
    name: 'Dumbbell Lateral Raises',
    category: 'Strength',
    description: 'An isolation exercise for developing shoulder width',
    primaryMuscles: ['Lateral Deltoids'],
    secondaryMuscles: ['Front Deltoids', 'Traps'],
    muscleGroup: 'Shoulders',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/lateral-raises.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/lateral-raises.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/lateral-raises-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand with dumbbells at sides' },
      { step: 2, description: 'Raise arms out to sides until parallel with ground' },
      { step: 3, description: 'Lower weights with control' }
    ],
    formCues: ['Slight bend in elbows', 'Lead with elbows', 'Control the descent'],
    safetyTips: ['Don\'t use momentum', 'Keep core tight', 'Start light'],
    commonMistakes: ['Swinging weights', 'Raising too high', 'Using too heavy weight'],
    type: 'isolation',
    equipment: ['Dumbbells'],
    difficulty: 'beginner'
  },
  {
    name: 'Barbell Bicep Curls',
    category: 'Strength',
    description: 'A classic bicep exercise for building arm strength',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/bicep-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/bicep-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/bicep-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand with barbell in underhand grip' },
      { step: 2, description: 'Curl weight up while keeping elbows at sides' },
      { step: 3, description: 'Lower weight with control to starting position' }
    ],
    formCues: ['Keep elbows at sides', 'Full range of motion', 'Squeeze at top'],
    safetyTips: ['Don\'t swing body', 'Keep back straight', 'Control the weight'],
    commonMistakes: ['Using momentum', 'Moving elbows forward', 'Incomplete range'],
    type: 'isolation',
    equipment: ['Barbell'],
    difficulty: 'beginner'
  },
  {
    name: 'Hammer Curls',
    category: 'Strength',
    description: 'A bicep variation that also targets the brachialis',
    primaryMuscles: ['Biceps', 'Brachialis'],
    secondaryMuscles: ['Forearms'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/hammer-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/hammer-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/hammer-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Hold dumbbells with neutral grip (palms facing each other)' },
      { step: 2, description: 'Curl weights up while keeping elbows at sides' },
      { step: 3, description: 'Lower weights with control' }
    ],
    formCues: ['Keep wrists straight', 'Elbows at sides', 'Control the movement'],
    safetyTips: ['Don\'t swing weights', 'Maintain posture', 'Start light'],
    commonMistakes: ['Using momentum', 'Moving elbows', 'Poor wrist position'],
    type: 'isolation',
    equipment: ['Dumbbells'],
    difficulty: 'beginner'
  },
  {
    name: 'Bulgarian Split Squats',
    category: 'Strength',
    description: 'A unilateral leg exercise for building strength and balance',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Calves'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/bulgarian-split-squats.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/bulgarian-split-squats.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/bulgarian-split-squats-thumb.jpg',
    instructions: [
      { step: 1, description: 'Place back foot on elevated surface' },
      { step: 2, description: 'Lower into split squat position' },
      { step: 3, description: 'Push through front heel to return to start' }
    ],
    formCues: ['Keep front knee stable', 'Chest up', 'Core engaged'],
    safetyTips: ['Start without weights', 'Maintain balance', 'Control the descent'],
    commonMistakes: ['Front knee caving in', 'Leaning forward too much', 'Poor balance'],
    type: 'compound',
    equipment: ['Bench', 'Optional: Dumbbells'],
    difficulty: 'intermediate'
  },
  {
    name: 'Cable Face Pulls',
    category: 'Strength',
    description: 'An exercise for rear deltoids and upper back posture',
    primaryMuscles: ['Rear Deltoids', 'Upper Back'],
    secondaryMuscles: ['Rotator Cuff', 'Traps'],
    muscleGroup: 'Shoulders',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/face-pulls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/face-pulls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/face-pulls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Set cable at head height with rope attachment' },
      { step: 2, description: 'Pull rope towards face, separating ends at finish' },
      { step: 3, description: 'Control return to starting position' }
    ],
    formCues: ['Pull to eye level', 'Lead with elbows', 'Squeeze shoulder blades'],
    safetyTips: ['Use light weight', 'Maintain posture', 'Control the movement'],
    commonMistakes: ['Using too much weight', 'Poor posture', 'Incomplete range'],
    type: 'isolation',
    equipment: ['Cable Machine', 'Rope Attachment'],
    difficulty: 'intermediate'
  },
  {
    name: 'Overhead Tricep Extension',
    category: 'Strength',
    description: 'An isolation exercise targeting all three heads of the triceps from an overhead position',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Shoulders'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/overhead-tricep-extension.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/overhead-tricep-extension.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/overhead-tricep-extension-thumb.jpg',
    instructions: [
      { step: 1, description: 'Hold dumbbell or weight plate overhead with both hands' },
      { step: 2, description: 'Lower the weight behind your head by bending elbows' },
      { step: 3, description: 'Extend arms back up to starting position' }
    ],
    formCues: ['Keep elbows close to head', 'Core engaged', 'Full extension at top'],
    safetyTips: ['Don\'t lock elbows at top', 'Control the weight', 'Keep upper arms still'],
    commonMistakes: ['Moving elbows away from head', 'Using momentum', 'Incomplete range of motion'],
    type: 'isolation',
    equipment: ['Dumbbell', 'Weight Plate'],
    difficulty: 'beginner'
  },
  {
    name: 'Close-Grip Bench Press',
    category: 'Strength',
    description: 'A compound exercise that emphasizes triceps while also working chest',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Front Deltoids'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/close-grip-bench.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/close-grip-bench.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/close-grip-bench-thumb.jpg',
    instructions: [
      { step: 1, description: 'Lie on bench with hands about shoulder-width apart on bar' },
      { step: 2, description: 'Lower bar to lower chest while keeping elbows tucked' },
      { step: 3, description: 'Press bar back up to starting position' }
    ],
    formCues: ['Keep elbows tucked', 'Wrists straight', 'Control the movement'],
    safetyTips: ['Use spotter for heavy weights', 'Don\'t grip too narrow', 'Maintain proper form'],
    commonMistakes: ['Flaring elbows', 'Grip too narrow', 'Bouncing bar off chest'],
    type: 'compound',
    equipment: ['Barbell', 'Bench'],
    difficulty: 'intermediate'
  },
  {
    name: 'Tricep Dips',
    category: 'Strength',
    description: 'A bodyweight exercise that effectively targets the triceps',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Front Deltoids'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/tricep-dips.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/tricep-dips.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/tricep-dips-thumb.jpg',
    instructions: [
      { step: 1, description: 'Position yourself on parallel bars or bench with straight arms' },
      { step: 2, description: 'Lower body by bending elbows, keeping them close to body' },
      { step: 3, description: 'Push back up to starting position' }
    ],
    formCues: ['Keep elbows in', 'Chest up', 'Control the descent'],
    safetyTips: ['Don\'t go too deep', 'Build up gradually', 'Keep shoulders packed'],
    commonMistakes: ['Flaring elbows', 'Going too deep', 'Using momentum'],
    type: 'compound',
    equipment: ['Dip Bars', 'Bench'],
    difficulty: 'intermediate'
  },
  {
    name: 'Bench Dips',
    category: 'Strength',
    description: 'A beginner-friendly variation of tricep dips using a bench',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Shoulders'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/bench-dips.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/bench-dips.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/bench-dips-thumb.jpg',
    instructions: [
      { step: 1, description: 'Sit on bench edge, place hands beside hips' },
      { step: 2, description: 'Slide forward off bench, supporting body with arms' },
      { step: 3, description: 'Lower body by bending elbows' },
      { step: 4, description: 'Push back up to starting position' }
    ],
    formCues: ['Keep elbows pointed back', 'Control movement', 'Full range of motion'],
    safetyTips: ['Don\'t let shoulders roll forward', 'Keep back close to bench', 'Start with feet flat'],
    commonMistakes: ['Shoulders rolling forward', 'Using momentum', 'Poor posture'],
    type: 'compound',
    equipment: ['Bench'],
    difficulty: 'beginner'
  },
  {
    name: 'Incline Dumbbell Curls',
    category: 'Strength',
    description: 'An isolation exercise that emphasizes the long head of the biceps',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms', 'Anterior Deltoid'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/incline-db-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/incline-db-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/incline-db-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Set bench to 45-60 degree angle' },
      { step: 2, description: 'Sit back with arms hanging straight down' },
      { step: 3, description: 'Curl dumbbells up while keeping upper arms stationary' },
      { step: 4, description: 'Lower with control to starting position' }
    ],
    formCues: ['Keep upper arms still', 'Full range of motion', 'Control the negative'],
    safetyTips: ['Don\'t swing weights', 'Keep shoulders back', 'Start light'],
    commonMistakes: ['Using momentum', 'Half reps', 'Moving shoulders'],
    type: 'isolation',
    equipment: ['Dumbbells', 'Incline Bench'],
    difficulty: 'intermediate'
  },
  {
    name: 'Preacher Curls',
    category: 'Strength',
    description: 'An isolation exercise that focuses on the short head of the biceps',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/preacher-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/preacher-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/preacher-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Adjust preacher bench to appropriate height' },
      { step: 2, description: 'Rest upper arms on pad with armpits touching top' },
      { step: 3, description: 'Curl weight up with controlled movement' },
      { step: 4, description: 'Lower weight slowly to starting position' }
    ],
    formCues: ['Keep arms on pad', 'Squeeze at top', 'Slow negative'],
    safetyTips: ['Don\'t overextend at bottom', 'Control the weight', 'Keep core tight'],
    commonMistakes: ['Lifting hips off bench', 'Using momentum', 'Rushing the movement'],
    type: 'isolation',
    equipment: ['Preacher Bench', 'Barbell or EZ Bar'],
    difficulty: 'intermediate'
  },
  {
    name: 'Concentration Curls',
    category: 'Strength',
    description: 'An isolation exercise for peak bicep contraction',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/concentration-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/concentration-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/concentration-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Sit on bench with feet flat' },
      { step: 2, description: 'Rest elbow on inner thigh' },
      { step: 3, description: 'Curl dumbbell towards shoulder' },
      { step: 4, description: 'Lower weight with control' }
    ],
    formCues: ['Keep elbow steady', 'Full contraction at top', 'Controlled movement'],
    safetyTips: ['Don\'t swing weight', 'Keep back straight', 'Start light'],
    commonMistakes: ['Using momentum', 'Moving elbow', 'Poor posture'],
    type: 'isolation',
    equipment: ['Dumbbell', 'Bench'],
    difficulty: 'beginner'
  },
  {
    name: 'Cable Bicep Curls',
    category: 'Strength',
    description: 'A bicep exercise providing constant tension throughout the movement',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/cable-bicep-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/cable-bicep-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/cable-bicep-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand facing cable machine with low pulley' },
      { step: 2, description: 'Grip straight bar or EZ bar attachment' },
      { step: 3, description: 'Curl bar up keeping elbows at sides' },
      { step: 4, description: 'Lower with control maintaining tension' }
    ],
    formCues: ['Keep elbows fixed', 'Maintain tension', 'Squeeze at top'],
    safetyTips: ['Don\'t lean back', 'Control the weight', 'Keep form strict'],
    commonMistakes: ['Using body momentum', 'Moving elbows', 'Releasing tension'],
    type: 'isolation',
    equipment: ['Cable Machine', 'Bar Attachment'],
    difficulty: 'beginner'
  },
  {
    name: 'Spider Curls',
    category: 'Strength',
    description: 'An advanced bicep exercise performed on an incline bench',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/spider-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/spider-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/spider-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Lie face down on incline bench' },
      { step: 2, description: 'Let arms hang straight down with dumbbells' },
      { step: 3, description: 'Curl weights up towards shoulders' },
      { step: 4, description: 'Lower with control to starting position' }
    ],
    formCues: ['Keep upper arms perpendicular', 'Squeeze at top', 'Full range of motion'],
    safetyTips: ['Don\'t swing weights', 'Maintain position on bench', 'Control the movement'],
    commonMistakes: ['Using momentum', 'Poor bench position', 'Half reps'],
    type: 'isolation',
    equipment: ['Incline Bench', 'Dumbbells'],
    difficulty: 'advanced'
  },
  {
    name: 'Front Raises',
    category: 'Strength',
    description: 'An isolation exercise targeting the anterior (front) deltoids',
    primaryMuscles: ['Front Deltoids'],
    secondaryMuscles: ['Upper Chest', 'Traps'],
    muscleGroup: 'Shoulders',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/front-raises.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/front-raises.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/front-raises-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand with dumbbells in front of thighs' },
      { step: 2, description: 'Raise weights straight in front to shoulder level' },
      { step: 3, description: 'Lower with control to starting position' }
    ],
    formCues: ['Keep slight bend in elbows', 'Control the movement', 'Maintain good posture'],
    safetyTips: ['Don\'t use momentum', 'Keep core tight', 'Don\'t raise above shoulder level'],
    commonMistakes: ['Swinging weights', 'Arching back', 'Using too heavy weight'],
    type: 'isolation',
    equipment: ['Dumbbells'],
    difficulty: 'beginner'
  },
  {
    name: 'Arnold Press',
    category: 'Strength',
    description: 'A compound movement targeting all three heads of the deltoids',
    primaryMuscles: ['Deltoids'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Traps'],
    muscleGroup: 'Shoulders',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/arnold-press.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/arnold-press.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/arnold-press-thumb.jpg',
    instructions: [
      { step: 1, description: 'Start with dumbbells at shoulder height, palms facing you' },
      { step: 2, description: 'Press weights up while rotating palms forward' },
      { step: 3, description: 'Lower while rotating palms back toward you' }
    ],
    formCues: ['Smooth rotation', 'Full range of motion', 'Keep core engaged'],
    safetyTips: ['Start light to learn movement', 'Don\'t arch back', 'Control the descent'],
    commonMistakes: ['Rushing the rotation', 'Poor posture', 'Uneven pressing'],
    type: 'compound',
    equipment: ['Dumbbells'],
    difficulty: 'intermediate'
  },
  {
    name: 'Reverse Flyes',
    category: 'Strength',
    description: 'An isolation exercise for rear deltoid development',
    primaryMuscles: ['Rear Deltoids'],
    secondaryMuscles: ['Upper Back', 'Traps'],
    muscleGroup: 'Shoulders',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/reverse-flyes.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/reverse-flyes.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/reverse-flyes-thumb.jpg',
    instructions: [
      { step: 1, description: 'Bend forward at hips or lie on incline bench' },
      { step: 2, description: 'Raise weights out to sides' },
      { step: 3, description: 'Lower with control to starting position' }
    ],
    formCues: ['Squeeze shoulder blades', 'Keep slight elbow bend', 'Control movement'],
    safetyTips: ['Maintain neutral spine', 'Use light weights', 'Keep neck neutral'],
    commonMistakes: ['Using momentum', 'Rounding back', 'Moving too quickly'],
    type: 'isolation',
    equipment: ['Dumbbells', 'Optional: Incline Bench'],
    difficulty: 'intermediate'
  },
  {
    name: 'Military Press',
    category: 'Strength',
    description: 'A strict overhead press focusing on shoulder strength',
    primaryMuscles: ['Deltoids'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    muscleGroup: 'Shoulders',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/military-press.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/military-press.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/military-press-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand with feet together, barbell at shoulders' },
      { step: 2, description: 'Press weight overhead with strict form' },
      { step: 3, description: 'Lower bar back to shoulders with control' }
    ],
    formCues: ['Keep core tight', 'Straight bar path', 'Full lockout at top'],
    safetyTips: ['Don\'t lean back', 'Breathe properly', 'Use safety pins in rack'],
    commonMistakes: ['Arching back', 'Using leg drive', 'Poor bar path'],
    type: 'compound',
    equipment: ['Barbell'],
    difficulty: 'advanced'
  },
  {
    name: 'Upright Rows',
    category: 'Strength',
    description: 'A compound movement targeting shoulders and upper traps',
    primaryMuscles: ['Deltoids', 'Traps'],
    secondaryMuscles: ['Biceps', 'Upper Back'],
    muscleGroup: 'Shoulders',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/upright-rows.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/upright-rows.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/upright-rows-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand holding weight in front of thighs' },
      { step: 2, description: 'Pull weight up to chin level, leading with elbows' },
      { step: 3, description: 'Lower weight with control' }
    ],
    formCues: ['Lead with elbows', 'Keep weight close to body', 'Control the descent'],
    safetyTips: ['Don\'t lift too high', 'Maintain proper form', 'Use moderate weight'],
    commonMistakes: ['Using too much weight', 'Lifting too high', 'Poor wrist position'],
    type: 'compound',
    equipment: ['Barbell', 'Dumbbells', 'or Cable'],
    difficulty: 'intermediate'
  },  {
    name: 'Sumo Squats',
    category: 'Strength',
    description: 'A wide-stance squat variation that targets the inner thighs and glutes',
    primaryMuscles: ['Inner Thighs', 'Adductors'],
    secondaryMuscles: ['Glutes', 'Quadriceps', 'Hamstrings'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/sumo-squats.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/sumo-squats.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/sumo-squats-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand with feet wider than shoulder width, toes pointed outward' },
      { step: 2, description: 'Lower your body while keeping chest up and knees in line with toes' },
      { step: 3, description: 'Push through heels to return to starting position' }
    ],
    formCues: ['Keep knees aligned with toes', 'Chest up', 'Push knees out', 'Engage inner thighs'],
    safetyTips: ['Don\'t let knees cave in', 'Maintain neutral spine', 'Control the descent'],
    commonMistakes: ['Knees caving inward', 'Rounding back', 'Not going deep enough'],
    type: 'compound',
    equipment: ['None', 'Optional: Dumbbell or Kettlebell'],
    difficulty: 'beginner'
  },
  {
    name: 'Side Lunges',
    category: 'Strength',
    description: 'A lateral movement that targets the inner thighs and adductors',
    primaryMuscles: ['Inner Thighs', 'Adductors'],
    secondaryMuscles: ['Glutes', 'Quadriceps'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/side-lunges.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/side-lunges.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/side-lunges-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand with feet together' },
      { step: 2, description: 'Step wide to one side, bending the knee of stepping leg' },
      { step: 3, description: 'Push off to return to starting position' }
    ],
    formCues: ['Keep chest up', 'Sit back into the lunge', 'Keep stationary leg straight'],
    safetyTips: ['Control the movement', 'Keep knee aligned', 'Maintain balance'],
    commonMistakes: ['Leaning forward too much', 'Not stepping wide enough', 'Poor knee alignment'],
    type: 'compound',
    equipment: ['None', 'Optional: Dumbbells'],
    difficulty: 'intermediate'
  },
  {
    name: 'Lying Hip Adduction',
    category: 'Strength',
    description: 'An isolation exercise specifically targeting the adductor muscles',
    primaryMuscles: ['Inner Thighs', 'Adductors'],
    secondaryMuscles: ['Hip Flexors'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/lying-hip-adduction.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/lying-hip-adduction.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/lying-hip-adduction-thumb.jpg',
    instructions: [
      { step: 1, description: 'Lie on your side with bottom leg straight and top leg supported' },
      { step: 2, description: 'Lift bottom leg up towards ceiling' },
      { step: 3, description: 'Lower leg with control' }
    ],
    formCues: ['Keep movement controlled', 'Don\'t rotate hips', 'Focus on inner thigh'],
    safetyTips: ['Don\'t lift too high', 'Keep pelvis stable', 'Avoid jerky movements'],
    commonMistakes: ['Using momentum', 'Rotating hips', 'Lifting too quickly'],
    type: 'isolation',
    equipment: ['None', 'Optional: Ankle Weights'],
    difficulty: 'beginner'
  },
  {
    name: 'Cable Hip Adduction',
    category: 'Strength',
    description: 'A standing inner thigh exercise using cable resistance',
    primaryMuscles: ['Inner Thighs', 'Adductors'],
    secondaryMuscles: ['Hip Stabilizers', 'Core'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/cable-hip-adduction.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/cable-hip-adduction.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/cable-hip-adduction-thumb.jpg',
    instructions: [
      { step: 1, description: 'Attach ankle strap to outside leg, standing side-on to cable machine' },
      { step: 2, description: 'Cross working leg in front of standing leg' },
      { step: 3, description: 'Return to starting position with control' }
    ],
    formCues: ['Stay upright', 'Control the movement', 'Keep hips stable'],
    safetyTips: ['Hold support for balance', 'Don\'t overextend', 'Start with light weight'],
    commonMistakes: ['Leaning too far', 'Using momentum', 'Poor posture'],
    type: 'isolation',
    equipment: ['Cable Machine', 'Ankle Strap'],
    difficulty: 'intermediate'
  },
  {
    name: 'Plié Squats',
    category: 'Strength',
    description: 'A ballet-inspired exercise targeting inner thighs and glutes',
    primaryMuscles: ['Inner Thighs', 'Adductors'],
    secondaryMuscles: ['Glutes', 'Calves', 'Quadriceps'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/plie-squats.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/plie-squats.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/plie-squats-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand with feet wide, toes pointed out at 45 degrees' },
      { step: 2, description: 'Lower into squat while keeping back straight' },
      { step: 3, description: 'Push through heels to return to start' }
    ],
    formCues: ['Keep knees over toes', 'Engage core', 'Maintain upright posture'],
    safetyTips: ['Don\'t lock knees at top', 'Keep movements controlled', 'Align knees properly'],
    commonMistakes: ['Poor foot positioning', 'Knees caving in', 'Insufficient depth'],
    type: 'compound',
    equipment: ['None', 'Optional: Dumbbell or Kettlebell'],
    difficulty: 'beginner'
  },
  {
    name: 'Dumbbell Bench Press',
    category: 'Strength',
    description: 'A compound exercise allowing greater range of motion than barbell press',
    primaryMuscles: ['Chest', 'Pectoralis Major'],
    secondaryMuscles: ['Front Deltoids', 'Triceps'],
    muscleGroup: 'Chest',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/db-bench-press.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/db-bench-press.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/db-bench-press-thumb.jpg',
    instructions: [
      { step: 1, description: 'Lie on bench with dumbbells held at chest level' },
      { step: 2, description: 'Press weights up until arms are extended' },
      { step: 3, description: 'Lower weights with control to starting position' }
    ],
    formCues: ['Keep wrists straight', 'Even press', 'Control the weights'],
    safetyTips: ['Use spotter for heavy weights', 'Don\'t drop weights', 'Maintain bench position'],
    commonMistakes: ['Uneven pressing', 'Bouncing weights', 'Excessive arching'],
    type: 'compound',
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'intermediate'
  },
  {
    name: 'Cable Flyes',
    category: 'Strength',
    description: 'An isolation exercise providing constant tension throughout the movement',
    primaryMuscles: ['Chest', 'Pectoralis Major'],
    secondaryMuscles: ['Front Deltoids'],
    muscleGroup: 'Chest',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/cable-flyes.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/cable-flyes.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/cable-flyes-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand between cable machines, grab high pulley handles' },
      { step: 2, description: 'Step forward, bring arms forward and down in arc motion' },
      { step: 3, description: 'Return to starting position with controlled movement' }
    ],
    formCues: ['Slight bend in elbows', 'Squeeze chest at center', 'Control throughout'],
    safetyTips: ['Maintain stable stance', 'Don\'t overstretch', 'Keep core engaged'],
    commonMistakes: ['Locking elbows', 'Using momentum', 'Poor posture'],
    type: 'isolation',
    equipment: ['Cable Machine'],
    difficulty: 'intermediate'
  },
  {
    name: 'Push-Ups',
    category: 'Strength',
    description: 'A fundamental bodyweight exercise for chest development',
    primaryMuscles: ['Chest', 'Pectoralis Major'],
    secondaryMuscles: ['Front Deltoids', 'Triceps', 'Core'],
    muscleGroup: 'Chest',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/push-ups.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/push-ups.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/push-ups-thumb.jpg',
    instructions: [
      { step: 1, description: 'Start in plank position with hands shoulder-width apart' },
      { step: 2, description: 'Lower body until chest nearly touches ground' },
      { step: 3, description: 'Push back up to starting position' }
    ],
    formCues: ['Keep body straight', 'Elbows at 45 degrees', 'Full range of motion'],
    safetyTips: ['Don\'t sag hips', 'Keep neck neutral', 'Breathe steadily'],
    commonMistakes: ['Sagging hips', 'Half reps', 'Flaring elbows'],
    type: 'compound',
    equipment: ['None'],
    difficulty: 'beginner'
  },
  {
    name: 'Incline Cable Flyes',
    category: 'Strength',
    description: 'An isolation exercise targeting the upper chest with constant tension',
    primaryMuscles: ['Upper Chest', 'Pectoralis Major'],
    secondaryMuscles: ['Front Deltoids'],
    muscleGroup: 'Chest',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/incline-cable-flyes.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/incline-cable-flyes.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/incline-cable-flyes-thumb.jpg',
    instructions: [
      { step: 1, description: 'Set bench to 30-45 degree incline between cable stations' },
      { step: 2, description: 'Grab handles and bring arms up and together' },
      { step: 3, description: 'Lower with control maintaining tension' }
    ],
    formCues: ['Keep chest up', 'Maintain arm angle', 'Squeeze at top'],
    safetyTips: ['Don\'t overstretch', 'Control the weight', 'Stay on bench'],
    commonMistakes: ['Using momentum', 'Poor bench angle', 'Losing tension'],
    type: 'isolation',
    equipment: ['Cable Machine', 'Incline Bench'],
    difficulty: 'intermediate'
  },
  {
    name: 'Landmine Press',
    category: 'Strength',
    description: 'A unique pressing movement that targets the chest from a different angle',
    primaryMuscles: ['Chest', 'Pectoralis Major'],
    secondaryMuscles: ['Front Deltoids', 'Triceps', 'Core'],
    muscleGroup: 'Chest',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/landmine-press.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/landmine-press.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/landmine-press-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand holding landmine end at shoulder' },
      { step: 2, description: 'Press weight up and forward' },
      { step: 3, description: 'Control weight back to starting position' }
    ],
    formCues: ['Engage core', 'Keep elbow in', 'Control the arc'],
    safetyTips: ['Maintain stable stance', 'Don\'t overarch', 'Keep shoulders packed'],
    commonMistakes: ['Poor posture', 'Using momentum', 'Incomplete range'],
    type: 'compound',
    equipment: ['Barbell', 'Landmine Attachment'],
    difficulty: 'intermediate'
  },
  {
    name: 'Seated Cable Rows',
    category: 'Strength',
    description: 'A compound exercise targeting the middle back with constant tension',
    primaryMuscles: ['Middle Back', 'Latissimus Dorsi'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Rhomboids'],
    muscleGroup: 'Back',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/seated-cable-rows.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/seated-cable-rows.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/seated-cable-rows-thumb.jpg',
    instructions: [
      { step: 1, description: 'Sit at rowing machine with feet secured' },
      { step: 2, description: 'Grab cable attachment with arms extended' },
      { step: 3, description: 'Pull handle to lower chest while keeping back straight' },
      { step: 4, description: 'Control weight back to starting position' }
    ],
    formCues: ['Keep chest up', 'Squeeze shoulder blades', 'Maintain posture'],
    safetyTips: ['Don\'t lean too far back', 'Control the movement', 'Keep core engaged'],
    commonMistakes: ['Using momentum', 'Rounding back', 'Moving too quickly'],
    type: 'compound',
    equipment: ['Cable Machine', 'Row Attachment'],
    difficulty: 'beginner'
  },
  {
    name: 'Single-Arm Dumbbell Rows',
    category: 'Strength',
    description: 'A unilateral exercise for targeting each side of the back independently',
    primaryMuscles: ['Latissimus Dorsi', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Core'],
    muscleGroup: 'Back',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/single-arm-row.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/single-arm-row.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/single-arm-row-thumb.jpg',
    instructions: [
      { step: 1, description: 'Place one knee and hand on bench' },
      { step: 2, description: 'Hold dumbbell with free arm hanging' },
      { step: 3, description: 'Pull weight up to hip level' },
      { step: 4, description: 'Lower weight with control' }
    ],
    formCues: ['Keep back parallel to ground', 'Pull to hip', 'Control the weight'],
    safetyTips: ['Maintain neutral spine', 'Don\'t twist', 'Keep neck neutral'],
    commonMistakes: ['Rotating torso', 'Using momentum', 'Poor posture'],
    type: 'compound',
    equipment: ['Dumbbell', 'Bench'],
    difficulty: 'beginner'
  },
  {
    name: 'T-Bar Rows',
    category: 'Strength',
    description: 'A compound movement emphasizing middle back thickness',
    primaryMuscles: ['Middle Back', 'Latissimus Dorsi'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Traps'],
    muscleGroup: 'Back',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/t-bar-rows.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/t-bar-rows.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/t-bar-rows-thumb.jpg',
    instructions: [
      { step: 1, description: 'Straddle T-bar and grip handle' },
      { step: 2, description: 'Bend at hips with back straight' },
      { step: 3, description: 'Pull weight up towards chest' },
      { step: 4, description: 'Lower with control' }
    ],
    formCues: ['Keep chest up', 'Drive elbows back', 'Squeeze at top'],
    safetyTips: ['Maintain neutral spine', 'Don\'t jerk weight', 'Brace core'],
    commonMistakes: ['Rounding back', 'Using momentum', 'Poor hip hinge'],
    type: 'compound',
    equipment: ['T-Bar Row Machine', 'or Barbell'],
    difficulty: 'intermediate'
  },
  {
    name: 'Meadows Rows',
    category: 'Strength',
    description: 'An advanced unilateral row variation for back development',
    primaryMuscles: ['Latissimus Dorsi', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Core'],
    muscleGroup: 'Back',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/meadows-rows.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/meadows-rows.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/meadows-rows-thumb.jpg',
    instructions: [
      { step: 1, description: 'Position barbell in landmine attachment' },
      { step: 2, description: 'Stand perpendicular to bar, hinge at hips' },
      { step: 3, description: 'Row weight up towards hip' },
      { step: 4, description: 'Lower with control' }
    ],
    formCues: ['Keep chest up', 'Drive elbow high', 'Control descent'],
    safetyTips: ['Maintain stable stance', 'Keep back straight', 'Start light'],
    commonMistakes: ['Poor hip hinge', 'Using momentum', 'Rounding back'],
    type: 'compound',
    equipment: ['Barbell', 'Landmine Attachment'],
    difficulty: 'advanced'
  },
  {
    name: 'Face Pull with External Rotation',
    category: 'Strength',
    description: 'A corrective exercise targeting rear delts and rotator cuff',
    primaryMuscles: ['Rear Deltoids', 'Rotator Cuff'],
    secondaryMuscles: ['Upper Back', 'Traps'],
    muscleGroup: 'Back',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/face-pull-rotation.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/face-pull-rotation.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/face-pull-rotation-thumb.jpg',
    instructions: [
      { step: 1, description: 'Set cable at head height with rope attachment' },
      { step: 2, description: 'Pull rope to face while pulling apart' },
      { step: 3, description: 'Rotate hands outward at end of movement' },
      { step: 4, description: 'Return to start with control' }
    ],
    formCues: ['Pull to forehead level', 'Rotate hands out', 'Keep elbows high'],
    safetyTips: ['Use light weight', 'Focus on form', 'Keep chest up'],
    commonMistakes: ['Using too much weight', 'Poor posture', 'No rotation'],
    type: 'isolation',
    equipment: ['Cable Machine', 'Rope Attachment'],
    difficulty: 'intermediate'
  },
  {
    name: 'Straight Arm Pulldown',
    category: 'Strength',
    description: 'An isolation exercise targeting lat development',
    primaryMuscles: ['Latissimus Dorsi'],
    secondaryMuscles: ['Triceps', 'Lower Chest'],
    muscleGroup: 'Back',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/straight-arm-pulldown.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/straight-arm-pulldown.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/straight-arm-pulldown-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand facing high cable with straight arms' },
      { step: 2, description: 'Pull bar down keeping arms straight' },
      { step: 3, description: 'Feel stretch in lats at top' },
      { step: 4, description: 'Control return to start' }
    ],
    formCues: ['Keep arms straight', 'Slight bend in elbows', 'Feel lat stretch'],
    safetyTips: ['Don\'t lock elbows', 'Control movement', 'Maintain posture'],
    commonMistakes: ['Bending arms too much', 'Using momentum', 'Poor range of motion'],
    type: 'isolation',
    equipment: ['Cable Machine'],
    difficulty: 'intermediate'
  },
  {
    name: 'Barbell Back Squat',
    category: 'Strength',
    description: 'The king of leg exercises, primarily targeting the quadriceps',
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/back-squat.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/back-squat.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/back-squat-thumb.jpg',
    instructions: [
      { step: 1, description: 'Position bar on upper back' },
      { step: 2, description: 'Descend by breaking at hips and knees' },
      { step: 3, description: 'Lower until thighs are parallel or below' },
      { step: 4, description: 'Drive through heels to stand' }
    ],
    formCues: ['Chest up', 'Knees out', 'Core tight', 'Full depth'],
    safetyTips: ['Use safety pins', 'Start light', 'Warm up properly'],
    commonMistakes: ['Knees caving in', 'Poor depth', 'Losing back position'],
    type: 'compound',
    equipment: ['Barbell', 'Squat Rack'],
    difficulty: 'intermediate'
  },
  {
    name: 'Front Squat',
    category: 'Strength',
    description: 'A quad-focused squat variation with anterior load',
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Core', 'Glutes', 'Upper Back'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/front-squat.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/front-squat.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/front-squat-thumb.jpg',
    instructions: [
      { step: 1, description: 'Rest bar on front deltoids and collarbone' },
      { step: 2, description: 'Keep elbows high throughout movement' },
      { step: 3, description: 'Squat down maintaining upright torso' },
      { step: 4, description: 'Stand up driving through heels' }
    ],
    formCues: ['Elbows high', 'Upright torso', 'Knees tracking toes'],
    safetyTips: ['Start with light weight', 'Practice rack position', 'Use safety pins'],
    commonMistakes: ['Dropping elbows', 'Leaning forward', 'Poor mobility'],
    type: 'compound',
    equipment: ['Barbell', 'Squat Rack'],
    difficulty: 'advanced'
  },
  {
    name: 'Leg Press',
    category: 'Strength',
    description: 'A machine-based compound movement for leg development',
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/leg-press.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/leg-press.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/leg-press-thumb.jpg',
    instructions: [
      { step: 1, description: 'Sit in machine with feet shoulder-width on platform' },
      { step: 2, description: 'Lower weight under control' },
      { step: 3, description: 'Press back to starting position' }
    ],
    formCues: ['Control the weight', 'Keep lower back against seat', 'Full range of motion'],
    safetyTips: ['Don\'t lock knees', 'Use safety stops', 'Control movement'],
    commonMistakes: ['Locking knees', 'Going too deep', 'Lifting hips off seat'],
    type: 'compound',
    equipment: ['Leg Press Machine'],
    difficulty: 'beginner'
  },
  {
    name: 'Leg Extensions',
    category: 'Strength',
    description: 'An isolation exercise specifically targeting the quadriceps',
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: [],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/leg-extensions.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/leg-extensions.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/leg-extensions-thumb.jpg',
    instructions: [
      { step: 1, description: 'Sit on machine with legs under pad' },
      { step: 2, description: 'Extend legs until straight' },
      { step: 3, description: 'Lower with control' }
    ],
    formCues: ['Squeeze quads at top', 'Control descent', 'Keep back against pad'],
    safetyTips: ['Don\'t slam weights', 'Don\'t use momentum', 'Adjust seat properly'],
    commonMistakes: ['Using momentum', 'Poor seat position', 'Incomplete range'],
    type: 'isolation',
    equipment: ['Leg Extension Machine'],
    difficulty: 'beginner'
  },
  {
    name: 'Sissy Squats',
    category: 'Strength',
    description: 'An advanced quad isolation exercise',
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Core'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/sissy-squats.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/sissy-squats.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/sissy-squats-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand with feet close together' },
      { step: 2, description: 'Lean back and bend knees simultaneously' },
      { step: 3, description: 'Lower yourself as far as possible' },
      { step: 4, description: 'Return to starting position' }
    ],
    formCues: ['Keep body straight', 'Control movement', 'Feel quad stretch'],
    safetyTips: ['Use support if needed', 'Build up gradually', 'Stop if knee pain'],
    commonMistakes: ['Poor balance', 'Using momentum', 'Insufficient range'],
    type: 'isolation',
    equipment: ['None'],
    difficulty: 'advanced'
  },
  {
    name: 'Sumo Squats',
    category: 'Strength',
    description: 'A wide-stance squat variation that targets the inner thighs and glutes',
    primaryMuscles: ['Inner Thighs', 'Adductors'],
    secondaryMuscles: ['Glutes', 'Quadriceps', 'Hamstrings'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/sumo-squats.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/sumo-squats.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/sumo-squats-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand with feet wider than shoulder width, toes pointed outward' },
      { step: 2, description: 'Lower your body while keeping chest up and knees in line with toes' },
      { step: 3, description: 'Push through heels to return to starting position' }
    ],
    formCues: ['Keep knees aligned with toes', 'Chest up', 'Push knees out', 'Engage inner thighs'],
    safetyTips: ['Don\'t let knees cave in', 'Maintain neutral spine', 'Control the descent'],
    commonMistakes: ['Knees caving inward', 'Rounding back', 'Not going deep enough'],
    type: 'compound',
    equipment: ['None', 'Optional: Dumbbell or Kettlebell'],
    difficulty: 'beginner'
  },
  {
    name: 'Side Lunges',
    category: 'Strength',
    description: 'A lateral movement that targets the inner thighs and adductors',
    primaryMuscles: ['Inner Thighs', 'Adductors'],
    secondaryMuscles: ['Glutes', 'Quadriceps'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/side-lunges.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/side-lunges.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/side-lunges-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand with feet together' },
      { step: 2, description: 'Step wide to one side, bending the knee of stepping leg' },
      { step: 3, description: 'Push off to return to starting position' }
    ],
    formCues: ['Keep chest up', 'Sit back into the lunge', 'Keep stationary leg straight'],
    safetyTips: ['Control the movement', 'Keep knee aligned', 'Maintain balance'],
    commonMistakes: ['Leaning forward too much', 'Not stepping wide enough', 'Poor knee alignment'],
    type: 'compound',
    equipment: ['None', 'Optional: Dumbbells'],
    difficulty: 'intermediate'
  },
  {
    name: 'Lying Hip Adduction',
    category: 'Strength',
    description: 'An isolation exercise specifically targeting the adductor muscles',
    primaryMuscles: ['Inner Thighs', 'Adductors'],
    secondaryMuscles: ['Hip Flexors'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/lying-hip-adduction.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/lying-hip-adduction.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/lying-hip-adduction-thumb.jpg',
    instructions: [
      { step: 1, description: 'Lie on your side with bottom leg straight and top leg supported' },
      { step: 2, description: 'Lift bottom leg up towards ceiling' },
      { step: 3, description: 'Lower leg with control' }
    ],
    formCues: ['Keep movement controlled', 'Don\'t rotate hips', 'Focus on inner thigh'],
    safetyTips: ['Don\'t lift too high', 'Keep pelvis stable', 'Avoid jerky movements'],
    commonMistakes: ['Using momentum', 'Rotating hips', 'Lifting too quickly'],
    type: 'isolation',
    equipment: ['None', 'Optional: Ankle Weights'],
    difficulty: 'beginner'
  },
  {
    name: 'Cable Hip Adduction',
    category: 'Strength',
    description: 'A standing inner thigh exercise using cable resistance',
    primaryMuscles: ['Inner Thighs', 'Adductors'],
    secondaryMuscles: ['Hip Stabilizers', 'Core'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/cable-hip-adduction.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/cable-hip-adduction.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/cable-hip-adduction-thumb.jpg',
    instructions: [
      { step: 1, description: 'Attach ankle strap to outside leg, standing side-on to cable machine' },
      { step: 2, description: 'Cross working leg in front of standing leg' },
      { step: 3, description: 'Return to starting position with control' }
    ],
    formCues: ['Stay upright', 'Control the movement', 'Keep hips stable'],
    safetyTips: ['Hold support for balance', 'Don\'t overextend', 'Start with light weight'],
    commonMistakes: ['Leaning too far', 'Using momentum', 'Poor posture'],
    type: 'isolation',
    equipment: ['Cable Machine', 'Ankle Strap'],
    difficulty: 'intermediate'
  },
  {
    name: 'Plié Squats',
    category: 'Strength',
    description: 'A ballet-inspired exercise targeting inner thighs and glutes',
    primaryMuscles: ['Inner Thighs', 'Adductors'],
    secondaryMuscles: ['Glutes', 'Calves', 'Quadriceps'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/plie-squats.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/plie-squats.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/plie-squats-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand with feet wide, toes pointed out at 45 degrees' },
      { step: 2, description: 'Lower into squat while keeping back straight' },
      { step: 3, description: 'Push through heels to return to start' }
    ],
    formCues: ['Keep knees over toes', 'Engage core', 'Maintain upright posture'],
    safetyTips: ['Don\'t lock knees at top', 'Keep movements controlled', 'Align knees properly'],
    commonMistakes: ['Poor foot positioning', 'Knees caving in', 'Insufficient depth'],
    type: 'compound',
    equipment: ['None', 'Optional: Dumbbell or Kettlebell'],
    difficulty: 'beginner'
  },
  {
    name: 'Wrist Curls',
    category: 'Strength',
    description: 'An isolation exercise targeting the forearm flexors',
    primaryMuscles: ['Forearm Flexors'],
    secondaryMuscles: ['Grip Muscles'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/wrist-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/wrist-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/wrist-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Rest forearms on bench with wrists hanging off edge' },
      { step: 2, description: 'Curl weight up using only wrists' },
      { step: 3, description: 'Lower weight with control' }
    ],
    formCues: ['Keep forearms stable', 'Full range of motion', 'Control the movement'],
    safetyTips: ['Don\'t use too much weight', 'Keep wrists aligned', 'Maintain proper form'],
    commonMistakes: ['Using momentum', 'Moving forearms', 'Too heavy weight'],
    type: 'isolation',
    equipment: ['Dumbbells', 'Barbell'],
    difficulty: 'beginner'
  },
  {
    name: 'Reverse Wrist Curls',
    category: 'Strength',
    description: 'An isolation exercise targeting the forearm extensors',
    primaryMuscles: ['Forearm Extensors'],
    secondaryMuscles: ['Grip Muscles'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/reverse-wrist-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/reverse-wrist-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/reverse-wrist-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Rest forearms on bench with palms facing down' },
      { step: 2, description: 'Extend wrists to lift weight' },
      { step: 3, description: 'Lower with control to starting position' }
    ],
    formCues: ['Keep forearms steady', 'Focus on wrist extension', 'Control the movement'],
    safetyTips: ['Use lighter weights', 'Don\'t overextend', 'Maintain proper form'],
    commonMistakes: ['Using too much weight', 'Moving forearms', 'Poor range of motion'],
    type: 'isolation',
    equipment: ['Dumbbells', 'Barbell'],
    difficulty: 'beginner'
  },
  {
    name: 'Farmer\'s Walk',
    category: 'Strength',
    description: 'A functional exercise that builds forearm and grip strength',
    primaryMuscles: ['Forearms', 'Grip Muscles'],
    secondaryMuscles: ['Traps', 'Core', 'Legs'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/farmers-walk.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/farmers-walk.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/farmers-walk-thumb.jpg',
    instructions: [
      { step: 1, description: 'Pick up heavy dumbbells or handles at sides' },
      { step: 2, description: 'Walk with controlled steps maintaining posture' },
      { step: 3, description: 'Place weights down with control' }
    ],
    formCues: ['Keep chest up', 'Shoulders back', 'Core engaged', 'Normal walking pace'],
    safetyTips: ['Clear walking path', 'Don\'t rush', 'Maintain good posture'],
    commonMistakes: ['Poor posture', 'Walking too fast', 'Uneven grip strength'],
    type: 'compound',
    equipment: ['Dumbbells', 'Farmer\'s Walk Handles'],
    difficulty: 'intermediate'
  },
  {
    name: 'Plate Pinch',
    category: 'Strength',
    description: 'An isolation exercise for developing pinch grip strength',
    primaryMuscles: ['Forearms', 'Grip Muscles'],
    secondaryMuscles: [],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/plate-pinch.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/plate-pinch.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/plate-pinch-thumb.jpg',
    instructions: [
      { step: 1, description: 'Pinch weight plates between thumb and fingers' },
      { step: 2, description: 'Hold for prescribed time' },
      { step: 3, description: 'Place plates down with control' }
    ],
    formCues: ['Keep plates level', 'Maintain steady grip', 'Stand tall'],
    safetyTips: ['Start light', 'Clear drop zone', 'Don\'t hold too long'],
    commonMistakes: ['Using too much weight', 'Poor posture', 'Uneven grip'],
    type: 'isolation',
    equipment: ['Weight Plates'],
    difficulty: 'intermediate'
  },
  {
    name: 'Behind-the-Back Barbell Wrist Curls',
    category: 'Strength',
    description: 'A variation of wrist curls performed behind the back',
    primaryMuscles: ['Forearm Flexors'],
    secondaryMuscles: ['Grip Muscles'],
    muscleGroup: 'Arms',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/behind-back-wrist-curls.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/behind-back-wrist-curls.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/behind-back-wrist-curls-thumb.jpg',
    instructions: [
      { step: 1, description: 'Hold barbell behind back with palms facing backward' },
      { step: 2, description: 'Curl weight up using only wrists' },
      { step: 3, description: 'Lower with control to starting position' }
    ],
    formCues: ['Keep upper arms still', 'Focus on wrist movement', 'Full range of motion'],
    safetyTips: ['Use appropriate weight', 'Maintain proper form', 'Don\'t swing'],
    commonMistakes: ['Using momentum', 'Poor range of motion', 'Moving arms'],
    type: 'isolation',
    equipment: ['Barbell'],
    difficulty: 'intermediate'  },
  {
    name: 'Standing Calf Raises',
    category: 'Strength',
    description: 'A fundamental exercise targeting the gastrocnemius muscle',
    primaryMuscles: ['Calves', 'Gastrocnemius'],
    secondaryMuscles: ['Soleus'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/standing-calf-raises.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/standing-calf-raises.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/standing-calf-raises-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand on edge of platform with heels hanging off' },
      { step: 2, description: 'Lower heels below platform level' },
      { step: 3, description: 'Rise up onto toes as high as possible' }
    ],
    formCues: ['Full range of motion', 'Control the movement', 'Stay balanced'],
    safetyTips: ['Don\'t bounce at bottom', 'Keep knees slightly bent', 'Use support if needed'],
    commonMistakes: ['Partial range of motion', 'Using momentum', 'Rolling ankles inward'],
    type: 'isolation',
    equipment: ['Platform', 'Optional: Dumbbells or Smith Machine'],
    difficulty: 'beginner'
  },
  {
    name: 'Seated Calf Raises',
    category: 'Strength',
    description: 'An isolation exercise targeting the soleus muscle',
    primaryMuscles: ['Calves', 'Soleus'],
    secondaryMuscles: [],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/seated-calf-raises.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/seated-calf-raises.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/seated-calf-raises-thumb.jpg',
    instructions: [
      { step: 1, description: 'Sit with knees bent at 90 degrees' },
      { step: 2, description: 'Place balls of feet on platform' },
      { step: 3, description: 'Raise heels by pointing toes' },
      { step: 4, description: 'Lower with control' }
    ],
    formCues: ['Keep knees bent', 'Full extension at top', 'Control the negative'],
    safetyTips: ['Don\'t rush movement', 'Keep back straight', 'Proper weight selection'],
    commonMistakes: ['Rushing reps', 'Incomplete range', 'Using too much weight'],
    type: 'isolation',
    equipment: ['Seated Calf Raise Machine', 'or Dumbbell with Block'],
    difficulty: 'beginner'
  },
  {
    name: 'Donkey Calf Raises',
    category: 'Strength',
    description: 'An effective variation that places emphasis on the gastrocnemius',
    primaryMuscles: ['Calves', 'Gastrocnemius'],
    secondaryMuscles: ['Lower Back'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/donkey-calf-raises.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/donkey-calf-raises.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/donkey-calf-raises-thumb.jpg',
    instructions: [
      { step: 1, description: 'Bend at hips with straight back' },
      { step: 2, description: 'Place balls of feet on platform' },
      { step: 3, description: 'Raise heels as high as possible' },
      { step: 4, description: 'Lower heels below platform' }
    ],
    formCues: ['Keep back straight', 'Full range of motion', 'Squeeze at top'],
    safetyTips: ['Maintain hip hinge', 'Don\'t round back', 'Use appropriate weight'],
    commonMistakes: ['Poor hip position', 'Partial reps', 'Rounding back'],
    type: 'isolation',
    equipment: ['Platform', 'Optional: Weight Belt or Machine'],
    difficulty: 'intermediate'
  },
  {    name: 'Jump Rope',
    category: 'Cardio',
    description: 'A dynamic exercise that develops calf endurance and coordination',
    primaryMuscles: ['Calves'],
    secondaryMuscles: ['Shoulders', 'Core', 'Forearms'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/jump-rope.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/jump-rope.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/jump-rope-thumb.jpg',
    instructions: [
      { step: 1, description: 'Hold rope handles at hip height' },
      { step: 2, description: 'Jump with small, controlled bounces' },
      { step: 3, description: 'Land softly on balls of feet' }
    ],
    formCues: ['Stay on toes', 'Keep jumps small', 'Maintain rhythm'],
    safetyTips: ['Land softly', 'Start slowly', 'Progress gradually'],
    commonMistakes: ['Jumping too high', 'Poor timing', 'Stiff landings'],
    type: 'compound',
    equipment: ['Jump Rope'],
    difficulty: 'beginner'
  },
  {
    name: 'Single-Leg Calf Raises',
    category: 'Strength',
    description: 'An advanced variation for developing unilateral calf strength',
    primaryMuscles: ['Calves', 'Gastrocnemius'],
    secondaryMuscles: ['Balance Muscles', 'Ankle Stabilizers'],
    muscleGroup: 'Legs',
    demoImages: ['https://storage.googleapis.com/fitness-app/exercises/single-leg-calf-raises.jpg'],
    demoVideos: ['https://storage.googleapis.com/fitness-app/exercises/single-leg-calf-raises.mp4'],
    thumbnailUrl: 'https://storage.googleapis.com/fitness-app/exercises/single-leg-calf-raises-thumb.jpg',
    instructions: [
      { step: 1, description: 'Stand on one leg on platform edge' },
      { step: 2, description: 'Lower heel below platform' },
      { step: 3, description: 'Rise up onto toes' },
      { step: 4, description: 'Maintain balance throughout' }
    ],
    formCues: ['Stay balanced', 'Full range of motion', 'Control movement'],
    safetyTips: ['Use support if needed', 'Focus on form', 'Don\'t rush'],
    commonMistakes: ['Poor balance', 'Incomplete range', 'Rushing reps'],
    type: 'isolation',
    equipment: ['Platform', 'Optional: Dumbbell'],
    difficulty: 'advanced'
  }
];

const seedExercises = async () => {
  try {
    // Connect to MongoDB
    const mongoose = require('mongoose');
    const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-app';
    
    console.log('Connecting to database...');
    await mongoose.connect(dbUrl);
    console.log('Connected to database successfully!');
    
    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log('Cleared existing exercises');
    
    // Insert new exercises
    await Exercise.insertMany(exerciseData);
    console.log(`Successfully seeded ${exerciseData.length} exercises!`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding exercise data:', error);
    process.exit(1);
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedExercises();
}

module.exports = seedExercises;
