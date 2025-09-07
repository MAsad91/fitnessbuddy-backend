const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const WorkoutHistory = require('../models/WorkoutHistory');
const PersonalRecord = require('../models/PersonalRecord');
const ExerciseRecommendation = require('../models/ExerciseRecommendation');
const MuscleAnalysis = require('../models/MuscleAnalysis');
const path = require('path');
const mongoose = require('mongoose');

// Configure multer for memory storage
/*const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/gif', 'video/mp4', 'application/json'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only GIF, MP4, and JSON files are allowed.'));
    }
  },
}).single('file');*/

// Workout Controllers
const createWorkout = async (req, res) => {
  console.log('POST /api/workout hit');
  console.log('Workout data:', req.body);
  try {
    const { dayOfWeek } = req.body;
    if (!dayOfWeek) {
      return res.status(400).json({ message: 'dayOfWeek is required' });
    }

    // Check if a workout already exists for this day
    const existingWorkout = await Workout.findOne({
      userId: req.user.id,
      dayOfWeek
    });

    if (existingWorkout) {
      return res.status(400).json({ message: 'A workout already exists for this day' });
    }

    const workout = new Workout({
      userId: req.user.id,
      dayOfWeek,
      exercises: []
    });
    await workout.save();
    res.status(201).json(workout);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getWorkouts = async (req, res) => {
  console.log('Fetching workouts for user:', req.user.id);
  try {
    const { day } = req.query; console.log('Requested day:', day);
    let query = { userId: req.user.id };

    // If day is specified, filter by day of week
    if (day) {
      query.dayOfWeek = day;
    }

    const workouts = await Workout.find(query)
      .populate('exercises.exerciseId')
      .sort({ date: -1 });

    // If day was specified, return the single workout
    if (day) {
      return res.json(workouts[0] || null);
    }
    console.log('Fetched workouts:', workouts)
    // Otherwise organize workouts by day
    // Define order of days
    const DAYS_ORDER = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    // Sort workouts by day order
    const sortedWorkouts = workouts.sort((a, b) => {
      const dayA = DAYS_ORDER.indexOf(a.dayOfWeek);
      const dayB = DAYS_ORDER.indexOf(b.dayOfWeek);
      return dayA - dayB;
    }); console.log('Sorted workouts:', sortedWorkouts);

    res.json(sortedWorkouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    await workout.remove();
    res.json({ message: 'Workout removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Exercise Controllers
/*exports.uploadExerciseMedia = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const fileType = req.file.mimetype;
      let demoType;

      // Determine demo type based on file type
      if (fileType === 'application/json') demoType = 'lottie';
      else if (fileType === 'video/mp4') demoType = 'video';
      else if (fileType === 'image/gif') demoType = 'gif';

      // Create a new blob in the bucket
      const blob = bucket.file(`exercises/${fileName}`);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: fileType,
        },
      });

      blobStream.on('error', (error) => {
        res.status(500).json({ message: 'Unable to upload file', error });
      });

      blobStream.on('finish', async () => {
        // Get public URL
        const publicUrl = getPublicUrl(`exercises/${fileName}`);
        
        res.status(200).json({
          message: 'File uploaded successfully',
          url: publicUrl,
          demoType,
          fileName
        });
      });

      blobStream.end(req.file.buffer);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};*/

const createExercise = async (req, res) => {
  try {
    const {
      name,
      muscleGroup,
      description,
      steps,
      targetMuscles,
      difficulty,
      equipment,
      recommendedSets,
      recommendedReps,
      demoType,
      jsonUrl,
      videoUrl,
      gifUrl
    } = req.body;

    const newExercise = new Exercise({
      name,
      muscleGroup,
      description,
      steps,
      targetMuscles,
      difficulty,
      equipment,
      recommendedSets,
      recommendedReps,
      demoType,
      jsonUrl,
      videoUrl,
      gifUrl
    });

    await newExercise.save();
    res.status(201).json(newExercise);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getExercisesByMuscleGroup = async (req, res) => {
  try {
    const { group } = req.params;
    console.log('Searching exercises for muscle group:', group);

    // Format the incoming group parameter
    const formattedGroup = group.replace(/_/g, ' ');
    console.log('Formatted group:', formattedGroup);

    // Create a regex pattern for case-insensitive search
    const musclePattern = new RegExp(formattedGroup, 'i');
    console.log('Search pattern:', musclePattern);

    // Search for exercises where the muscle group matches OR
    // where the muscle is in primary/secondary muscles
    const exercises = await Exercise.find({
      $or: [
        { muscleGroup: musclePattern },
        { primaryMuscles: musclePattern },
        { secondaryMuscles: musclePattern }
      ]
    });

    console.log(`Found ${exercises.length} exercises`);

    // Return empty array instead of 404 when no exercises found
    res.json(exercises);
  } catch (err) {
    console.error('Error in getExercisesByMuscleGroup:', err);
    res.status(500).json({ message: err.message });
  }
};

const getOrCreateWorkoutForDay = async (req, res) => {
  try {
    const { day } = req.query;

    if (!day) {
      return res.status(400).json({ message: 'Day parameter is required' });
    }

    // First try to find existing workout
    let workout = await Workout.findOne({
      userId: req.user.id,
      dayOfWeek: day
    }).populate('exercises.exerciseId');

    // If no workout exists for this day, create one
    if (!workout) {
      workout = await Workout.create({
        userId: req.user.id,
        dayOfWeek: day,
        date: new Date(),
        exercises: []
      });
    }

    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addExerciseToWorkout = async (req, res) => {
  try {
    const { exercises, dayOfWeek } = req.body;
    const { id: workoutId } = req.params;
    let workout;

    // If workoutId is 'new' or undefined, try to find/create workout by day
    if (!workoutId || workoutId === 'new') {
      if (!dayOfWeek) {
        return res.status(400).json({ message: 'Day of week is required when no workout ID is provided' });
      }

      // Try to find existing workout for the day
      workout = await Workout.findOne({ userId: req.user.id, dayOfWeek });

      // If no workout exists for this day, create one
      if (!workout) {
        workout = new Workout({
          userId: req.user.id,
          dayOfWeek,
          date: new Date(),
          exercises: []
        });
      }
    } else {
      // Find by ID
      workout = await Workout.findById(workoutId);
      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }
      if (workout.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to modify this workout' });
      }
    }

    // Add exercises to workout, avoiding duplicates
    if (Array.isArray(exercises)) {
      exercises.forEach(exercise => {
        if (!exercise.exerciseId) {
          console.error('Exercise missing exerciseId:', exercise);
          return;
        }
        // Check if exercise already exists in workout
        const existingExercise = workout.exercises.find(
          e => e.exerciseId && exercise.exerciseId && e.exerciseId.toString() === exercise.exerciseId.toString()
        );

        if (!existingExercise) {
          workout.exercises.push({
            exerciseId: exercise.exerciseId,
            sets: exercise.sets || [{ reps: 8, weight: 0, completed: false }]
          });
        }
      });
    }

    await workout.save();
    // Return populated workout data
    const populatedWorkout = await Workout.findById(workout._id).populate('exercises.exerciseId');
    res.json(populatedWorkout);
  } catch (err) {
    console.error('Error in addExerciseToWorkout:', err);
    res.status(500).json({ message: err.message });
  }
};

const completeExerciseSet = async (req, res) => {
  try {
    const { workoutId, exerciseId, setIndex } = req.params;
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const exercise = workout.exercises.id(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found in workout' });
    }

    if (!exercise.sets[setIndex]) {
      return res.status(404).json({ message: 'Set not found' });
    }

    // Mark the set as completed
    exercise.sets[setIndex].completed = true;

    // Check if all sets are completed
    const allSetsCompleted = exercise.sets.every(set => set.completed);
    if (allSetsCompleted) {
      exercise.completed = true;
    }

    await workout.save();
    res.json({ success: true, workout });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function to check and update PRs
const updatePersonalRecords = async (userId, exerciseId, workoutHistoryId, sets) => {
  try {
    let pr = await PersonalRecord.findOne({ userId, exerciseId });

    // Initialize PR document if it doesn't exist
    if (!pr) {
      pr = new PersonalRecord({
        userId,
        exerciseId,
        records: {
          maxWeight: { value: 0 },
          maxReps: { value: 0 },
          maxVolume: { value: 0 },
          maxVolumeWorkout: { value: 0 }
        },
        history: []
      });
    }

    // Calculate current workout metrics
    let maxWeightSet = 0;
    let maxRepsSet = 0;
    let maxVolumeSet = 0;
    let totalVolume = 0;

    sets.forEach(set => {
      if (set.completed) {
        // Update max weight
        if (set.weight > maxWeightSet) {
          maxWeightSet = set.weight;
        }
        // Update max reps
        if (set.reps > maxRepsSet) {
          maxRepsSet = set.reps;
        }
        // Update max volume for a single set
        const setVolume = set.weight * set.reps;
        if (setVolume > maxVolumeSet) {
          maxVolumeSet = setVolume;
        }
        // Add to total volume
        totalVolume += setVolume;
      }
    });

    // Check and update PRs
    const updates = [];

    if (maxWeightSet > pr.records.maxWeight.value) {
      updates.push({
        type: 'maxWeight',
        value: maxWeightSet,
        previousValue: pr.records.maxWeight.value,
        improvement: ((maxWeightSet - pr.records.maxWeight.value) / pr.records.maxWeight.value) * 100
      });
      pr.records.maxWeight = {
        value: maxWeightSet,
        date: new Date(),
        workoutId: workoutHistoryId
      };
    }

    if (maxRepsSet > pr.records.maxReps.value) {
      updates.push({
        type: 'maxReps',
        value: maxRepsSet,
        previousValue: pr.records.maxReps.value,
        improvement: ((maxRepsSet - pr.records.maxReps.value) / pr.records.maxReps.value) * 100
      });
      pr.records.maxReps = {
        value: maxRepsSet,
        date: new Date(),
        workoutId: workoutHistoryId
      };
    }

    if (maxVolumeSet > pr.records.maxVolume.value) {
      updates.push({
        type: 'maxVolume',
        value: maxVolumeSet,
        previousValue: pr.records.maxVolume.value,
        improvement: ((maxVolumeSet - pr.records.maxVolume.value) / pr.records.maxVolume.value) * 100
      });
      pr.records.maxVolume = {
        value: maxVolumeSet,
        date: new Date(),
        workoutId: workoutHistoryId
      };
    }

    if (totalVolume > pr.records.maxVolumeWorkout.value) {
      updates.push({
        type: 'maxVolumeWorkout',
        value: totalVolume,
        previousValue: pr.records.maxVolumeWorkout.value,
        improvement: ((totalVolume - pr.records.maxVolumeWorkout.value) / pr.records.maxVolumeWorkout.value) * 100
      });
      pr.records.maxVolumeWorkout = {
        value: totalVolume,
        date: new Date(),
        workoutId: workoutHistoryId
      };
    }

    // Add new records to history
    if (updates.length > 0) {
      updates.forEach(update => {
        pr.history.push({
          ...update,
          workoutId: workoutHistoryId,
          date: new Date()
        });
      });
    }

    await pr.save();
    return updates;
  } catch (error) {
    console.error('Error updating personal records:', error);
    throw error;
  }
};

// Modify completeWorkout to include PR tracking
const completeWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { duration, caloriesBurned, rating, mood, notes } = req.body;

    const workout = await Workout.findById(workoutId).populate('exercises.exerciseId');
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    // Calculate total volume
    let totalVolume = 0;
    workout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (set.completed) {
          totalVolume += (set.weight * set.reps);
        }
      });
    });

    // Create workout history entry
    const workoutHistory = new WorkoutHistory({
      userId: req.user.id,
      originalWorkoutId: workoutId,
      dayOfWeek: workout.dayOfWeek,
      duration,
      exercises: workout.exercises.map(ex => ({
        exerciseId: ex.exerciseId._id,
        name: ex.exerciseId.name,
        sets: ex.sets,
        notes: ex.notes
      })),
      totalVolume,
      caloriesBurned,
      rating,
      mood,
      notes
    });

    await workoutHistory.save();

    // Check and update PRs for each exercise
    const prUpdates = {};
    for (const exercise of workout.exercises) {
      const updates = await updatePersonalRecords(
        req.user.id,
        exercise.exerciseId._id,
        workoutHistory._id,
        exercise.sets
      );
      if (updates.length > 0) {
        prUpdates[exercise.exerciseId.name] = updates;
      }
    }

    // Reset the completion status of sets in the original workout
    workout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        set.completed = false;
      });
    });
    await workout.save();

    res.status(200).json({
      success: true,
      data: {
        workout: workoutHistory,
        personalRecords: prUpdates
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing workout',
      error: error.message
    });
  }
};

// Get workout history
const getWorkoutHistory = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10, page = 1 } = req.query;
    const query = { userId: req.user.id };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const workoutHistory = await WorkoutHistory.find(query)
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('exercises.exerciseId', 'name category muscleGroup');

    const total = await WorkoutHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: workoutHistory,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching workout history',
      error: error.message
    });
  }
};

// Get workout history statistics
const getWorkoutStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user.id };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    const stats = await WorkoutHistory.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          totalVolume: { $sum: '$totalVolume' },
          avgRating: { $avg: '$rating' },
          totalCaloriesBurned: { $sum: '$caloriesBurned' },
          workoutsByDay: {
            $push: {
              dayOfWeek: '$dayOfWeek',
              duration: '$duration',
              volume: '$totalVolume'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalWorkouts: 1,
          avgDuration: { $round: ['$avgDuration', 1] },
          totalVolume: { $round: ['$totalVolume', 1] },
          avgRating: { $round: ['$avgRating', 1] },
          totalCaloriesBurned: { $round: ['$totalCaloriesBurned', 1] },
          workoutsByDay: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalWorkouts: 0,
        avgDuration: 0,
        totalVolume: 0,
        avgRating: 0,
        totalCaloriesBurned: 0,
        workoutsByDay: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching workout statistics',
      error: error.message
    });
  }
};

// Get exercise-specific progress
const getExerciseProgress = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { startDate, endDate, limit = 10 } = req.query;

    const query = {
      userId: req.user.id,
      'exercises.exerciseId': exerciseId
    };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    const progress = await WorkoutHistory.aggregate([
      { $match: query },
      { $unwind: '$exercises' },
      { $match: { 'exercises.exerciseId': mongoose.Types.ObjectId(exerciseId) } },
      { $sort: { completedAt: -1 } },
      { $limit: parseInt(limit) },
      {
        $group: {
          _id: null,
          history: {
            $push: {
              date: '$completedAt',
              sets: '$exercises.sets',
              notes: '$exercises.notes'
            }
          },
          // Calculate max weight and volume trends
          maxWeight: {
            $max: {
              $max: '$exercises.sets.weight'
            }
          },
          maxReps: {
            $max: {
              $max: '$exercises.sets.reps'
            }
          },
          // Calculate averages
          avgWeight: {
            $avg: {
              $avg: '$exercises.sets.weight'
            }
          },
          avgReps: {
            $avg: {
              $avg: '$exercises.sets.reps'
            }
          },
          // Calculate total volume (weight * reps) trend
          volumeProgression: {
            $push: {
              date: '$completedAt',
              volume: {
                $reduce: {
                  input: '$exercises.sets',
                  initialValue: 0,
                  in: {
                    $add: [
                      '$$value',
                      { $multiply: ['$$this.weight', '$$this.reps'] }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          history: 1,
          maxWeight: { $round: ['$maxWeight', 1] },
          maxReps: { $round: ['$maxReps', 0] },
          avgWeight: { $round: ['$avgWeight', 1] },
          avgReps: { $round: ['$avgReps', 1] },
          volumeProgression: 1,
          // Calculate improvement percentages
          weightImprovement: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          { $arrayElemAt: ['$volumeProgression.volume', -1] },
                          { $arrayElemAt: ['$volumeProgression.volume', 0] }
                        ]
                      },
                      { $arrayElemAt: ['$volumeProgression.volume', 0] }
                    ]
                  },
                  100
                ]
              },
              1
            ]
          }
        }
      }
    ]);

    // Get the exercise details
    const exerciseDetails = await Exercise.findById(exerciseId)
      .select('name category muscleGroup description');

    if (!progress.length) {
      return res.status(200).json({
        success: true,
        data: {
          exercise: exerciseDetails,
          progress: {
            history: [],
            maxWeight: 0,
            maxReps: 0,
            avgWeight: 0,
            avgReps: 0,
            volumeProgression: [],
            weightImprovement: 0
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        exercise: exerciseDetails,
        progress: progress[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exercise progress',
      error: error.message
    });
  }
};

// Get personal records for an exercise
const getExercisePRs = async (req, res) => {
  try {
    const { exerciseId } = req.params;

    const prs = await PersonalRecord.findOne({
      userId: req.user.id,
      exerciseId
    }).populate('history.workoutId', 'completedAt');

    if (!prs) {
      return res.status(200).json({
        success: true,
        data: {
          records: {
            maxWeight: { value: 0 },
            maxReps: { value: 0 },
            maxVolume: { value: 0 },
            maxVolumeWorkout: { value: 0 }
          },
          history: []
        }
      });
    }

    res.status(200).json({
      success: true,
      data: prs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching personal records',
      error: error.message
    });
  }
};

// Get all PRs for a user
const getAllPRs = async (req, res) => {
  try {
    const prs = await PersonalRecord.find({
      userId: req.user.id
    })
      .populate('exerciseId', 'name category muscleGroup')
      .populate('history.workoutId', 'completedAt');

    // Group PRs by muscle group
    const groupedPRs = prs.reduce((acc, pr) => {
      const muscleGroup = pr.exerciseId.muscleGroup;
      if (!acc[muscleGroup]) {
        acc[muscleGroup] = [];
      }
      acc[muscleGroup].push({
        exercise: pr.exerciseId.name,
        records: pr.records,
        recentPRs: pr.history
          .sort((a, b) => b.date - a.date)
          .slice(0, 5)
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: groupedPRs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all personal records',
      error: error.message
    });
  }
};

// Helper function to analyze exercise progress
const analyzeExerciseProgress = async (userId, exerciseId, workoutHistories) => {
  const DAYS_30 = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const now = new Date();
  const thirtyDaysAgo = new Date(now - DAYS_30);

  // Get PR data
  const prData = await PersonalRecord.findOne({ userId, exerciseId });

  // Calculate recent metrics
  let recentVolume = 0;
  let frequency = 0;
  let lastWorkoutDate = null;
  let volumeProgression = [];

  workoutHistories.forEach(workout => {
    const exercise = workout.exercises.find(e =>
      e.exerciseId.toString() === exerciseId.toString()
    );

    if (exercise) {
      frequency++;
      let workoutVolume = 0;
      exercise.sets.forEach(set => {
        if (set.completed) {
          workoutVolume += set.weight * set.reps;
        }
      });
      recentVolume += workoutVolume;
      volumeProgression.push({ date: workout.completedAt, volume: workoutVolume });

      if (!lastWorkoutDate || workout.completedAt > lastWorkoutDate) {
        lastWorkoutDate = workout.completedAt;
      }
    }
  });

  // Calculate progress rate
  let progressRate = 0;
  if (volumeProgression.length >= 2) {
    const oldestVolume = volumeProgression[volumeProgression.length - 1].volume;
    const newestVolume = volumeProgression[0].volume;
    progressRate = ((newestVolume - oldestVolume) / oldestVolume) * 100;
  }

  // Determine recommendation type and priority
  let type = 'progression';
  let priority = 3;
  let status = '';
  let suggestion = '';
  let reason = '';

  if (!frequency) {
    type = 'frequency';
    priority = 4;
    status = 'Not recently performed';
    suggestion = 'Consider adding this exercise back to your routine';
    reason = 'Exercise has not been performed in the last 30 days';
  } else if (progressRate < -10) {
    type = 'deload';
    priority = 5;
    status = 'Performance declining';
    suggestion = 'Consider a deload week or form check';
    reason = `Performance has decreased by ${Math.abs(progressRate.toFixed(1))}% recently`;
  } else if (progressRate < 2 && frequency >= 4) {
    type = 'plateau';
    priority = 4;
    status = 'Progress stalled';
    suggestion = 'Try varying rep ranges or increasing intensity';
    reason = 'No significant progress despite regular training';
  } else if (frequency > 8) {
    type = 'frequency';
    priority = 3;
    status = 'High frequency';
    suggestion = 'Consider adding more recovery time';
    reason = 'Exercise is performed very frequently';
  }

  return {
    type,
    status,
    suggestion,
    reason,
    priority,
    relatedMetrics: {
      recentVolume,
      progressRate,
      lastPR: prData?.records?.maxWeight?.date || null,
      frequency
    }
  };
};

// Helper function to analyze muscle group balance
const analyzeMuscleGroupBalance = async (userId, workoutHistories) => {
  const muscleGroups = {};

  // Aggregate volume and frequency by muscle group
  for (const workout of workoutHistories) {
    for (const exercise of workout.exercises) {
      const exerciseDetails = await Exercise.findById(exercise.exerciseId);
      if (exerciseDetails) {
        if (!muscleGroups[exerciseDetails.muscleGroup]) {
          muscleGroups[exerciseDetails.muscleGroup] = {
            volume: 0,
            frequency: 0
          };
        }

        let volume = 0;
        exercise.sets.forEach(set => {
          if (set.completed) {
            volume += set.weight * set.reps;
          }
        });

        muscleGroups[exerciseDetails.muscleGroup].volume += volume;
        muscleGroups[exerciseDetails.muscleGroup].frequency++;
      }
    }
  }

  // Analyze balance and create recommendations
  const balance = [];
  const totalVolume = Object.values(muscleGroups).reduce((sum, group) => sum + group.volume, 0);

  for (const [muscleGroup, data] of Object.entries(muscleGroups)) {
    const volumePercentage = (data.volume / totalVolume) * 100;
    let status = 'balanced';
    let recommendation = '';

    if (volumePercentage < 10) {
      status = 'underworked';
      recommendation = `Consider increasing ${muscleGroup} training frequency and volume`;
    } else if (volumePercentage > 35) {
      status = 'overworked';
      recommendation = `Consider reducing ${muscleGroup} volume to prevent overtraining`;
    } else {
      recommendation = `Current ${muscleGroup} training volume is well-balanced`;
    }

    balance.push({
      muscleGroup,
      volume: data.volume,
      frequency: data.frequency,
      status,
      recommendation
    });
  }

  return balance;
};

// Generate exercise recommendations
const generateRecommendations = async (req, res) => {
  try {
    const DAYS_30 = 30 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - DAYS_30);

    // Get recent workout history
    const workoutHistories = await WorkoutHistory.find({
      userId: req.user.id,
      completedAt: { $gte: thirtyDaysAgo }
    }).sort({ completedAt: -1 });

    // Get all exercises user has performed
    const uniqueExercises = new Set();
    workoutHistories.forEach(workout => {
      workout.exercises.forEach(exercise => {
        uniqueExercises.add(exercise.exerciseId.toString());
      });
    });

    // Analyze each exercise
    const exerciseRecommendations = [];
    for (const exerciseId of uniqueExercises) {
      const analysis = await analyzeExerciseProgress(
        req.user.id,
        exerciseId,
        workoutHistories
      );
      exerciseRecommendations.push({
        exerciseId,
        ...analysis
      });
    }

    // Analyze muscle group balance
    const muscleGroupBalance = await analyzeMuscleGroupBalance(
      req.user.id,
      workoutHistories
    );

    // Calculate overall training insights
    const trainingInsights = {
      weakPoints: muscleGroupBalance
        .filter(group => group.status === 'underworked')
        .map(group => group.muscleGroup),
      strongPoints: muscleGroupBalance
        .filter(group => group.status === 'balanced')
        .map(group => group.muscleGroup),
      balanceScore: calculateBalanceScore(muscleGroupBalance),
      volumeDistribution: calculateVolumeDistribution(muscleGroupBalance),
      recoveryStatus: determineRecoveryStatus(exerciseRecommendations)
    };

    // Create or update recommendations
    const recommendation = await ExerciseRecommendation.findOneAndUpdate(
      { userId: req.user.id },
      {
        lastUpdated: now,
        muscleGroupBalance,
        exerciseRecommendations,
        trainingInsights
      },
      { upsert: true, new: true }
    ).populate('exerciseRecommendations.exerciseId', 'name category muscleGroup');

    res.status(200).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
};

// Helper function to calculate training balance score
const calculateBalanceScore = (muscleGroupBalance) => {
  const idealPercentage = 100 / muscleGroupBalance.length;
  const totalVolume = muscleGroupBalance.reduce((sum, group) => sum + group.volume, 0);

  let totalDeviation = 0;
  muscleGroupBalance.forEach(group => {
    const percentage = (group.volume / totalVolume) * 100;
    totalDeviation += Math.abs(percentage - idealPercentage);
  });

  // Convert deviation to a 0-100 score (lower deviation = higher score)
  return Math.max(0, 100 - (totalDeviation / 2));
};

// Helper function to calculate volume distribution
const calculateVolumeDistribution = (muscleGroupBalance) => {
  const distribution = {
    push: 0,
    pull: 0,
    legs: 0,
    core: 0
  };

  const totalVolume = muscleGroupBalance.reduce((sum, group) => sum + group.volume, 0);

  muscleGroupBalance.forEach(group => {
    const percentage = (group.volume / totalVolume) * 100;

    // Map muscle groups to movement patterns
    switch (group.muscleGroup.toLowerCase()) {
      case 'chest':
      case 'shoulders':
      case 'triceps':
        distribution.push += percentage;
        break;
      case 'back':
      case 'biceps':
        distribution.pull += percentage;
        break;
      case 'legs':
      case 'quadriceps':
      case 'hamstrings':
      case 'calves':
        distribution.legs += percentage;
        break;
      case 'core':
      case 'abs':
        distribution.core += percentage;
        break;
    }
  });

  return distribution;
};

// Helper function to determine recovery status
const determineRecoveryStatus1 = (exerciseRecommendations) => {
  const deloadCount = exerciseRecommendations.filter(
    rec => rec.type === 'deload'
  ).length;

  if (deloadCount >= 3) {
    return 'needs_attention';
  } else if (deloadCount >= 1) {
    return 'moderate';
  }
  return 'good';
};

// Get latest recommendations
const getRecommendations = async (req, res) => {
  try {
    const recommendations = await ExerciseRecommendation.findOne({
      userId: req.user.id
    })
      .sort({ lastUpdated: -1 })
      .populate('exerciseRecommendations.exerciseId', 'name category muscleGroup');

    if (!recommendations ||
      recommendations.lastUpdated < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      // If no recommendations or older than 24 hours, generate new ones
      return generateRecommendations(req, res);
    }

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
};

// Helper function to calculate muscle fatigue
const calculateMuscleFatigue = (volume, frequency, intensity) => {
  // Base fatigue score
  let fatigueScore = (volume * 0.4) + (frequency * 0.3) + (intensity * 0.3);

  if (fatigueScore > 80) return 'high';
  if (fatigueScore > 50) return 'moderate';
  return 'low';
};

// Helper function to determine muscle recovery status
const determineRecoveryStatus = (lastTrainedDate, volume, intensity) => {
  const daysSinceLastTrained = Math.floor((Date.now() - lastTrainedDate) / (24 * 60 * 60 * 1000));

  // Base recovery days needed
  let recoveryDays = 2; // Default recovery time

  // Adjust based on volume and intensity
  if (volume > 15000) recoveryDays += 1;
  if (intensity > 0.8) recoveryDays += 1;

  if (daysSinceLastTrained < recoveryDays) {
    return {
      status: 'needs_rest',
      suggestedRestDays: recoveryDays - daysSinceLastTrained
    };
  }
  if (daysSinceLastTrained === recoveryDays) {
    return {
      status: 'caution',
      suggestedRestDays: 1
    };
  }
  return {
    status: 'ready',
    suggestedRestDays: 0
  };
};

// Generate muscle analysis
const generateMuscleAnalysis = async (req, res) => {
  try {
    const DAYS_30 = 30 * 24 * 60 * 60 * 1000;
    const DAYS_7 = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - DAYS_30);
    const sevenDaysAgo = new Date(now - DAYS_7);

    // Get user's workout history
    const workoutHistories = await WorkoutHistory.find({
      userId: req.user.id,
      completedAt: { $gte: thirtyDaysAgo }
    }).populate('exercises.exerciseId');

    // Get user's PRs
    const personalRecords = await PersonalRecord.find({
      userId: req.user.id
    }).populate('exerciseId');

    // Initialize muscle group tracking
    const muscleGroups = {};
    const muscleCorrelations = new Map();

    // Process workout history
    for (const workout of workoutHistories) {
      for (const exercise of workout.exercises) {
        if (!exercise.exerciseId) continue;

        const muscleGroup = exercise.exerciseId.muscleGroup;
        if (!muscleGroups[muscleGroup]) {
          muscleGroups[muscleGroup] = {
            name: muscleGroup,
            category: determineMuscleCategory(muscleGroup),
            metrics: {
              weeklyVolume: 0,
              monthlyVolume: 0,
              weeklyFrequency: 0,
              monthlyFrequency: 0,
              averageIntensity: 0,
              volumeProgression: 0,
              strengthProgression: 0
            },
            fatigue: {
              current: 'low',
              risk: 'low'
            },
            muscleBalance: {
              synergists: [],
              antagonists: []
            },
            recentPRs: [],
            recovery: {
              status: 'ready',
              lastTrained: null,
              suggestedRestDays: 0
            }
          };
        }

        // Calculate volume and frequency
        let workoutVolume = 0;
        exercise.sets.forEach(set => {
          if (set.completed) {
            workoutVolume += set.weight * set.reps;
          }
        });

        muscleGroups[muscleGroup].metrics.monthlyVolume += workoutVolume;
        if (workout.completedAt >= sevenDaysAgo) {
          muscleGroups[muscleGroup].metrics.weeklyVolume += workoutVolume;
          muscleGroups[muscleGroup].metrics.weeklyFrequency++;
        }
        muscleGroups[muscleGroup].metrics.monthlyFrequency++;

        // Update last trained date
        if (!muscleGroups[muscleGroup].recovery.lastTrained ||
          workout.completedAt > muscleGroups[muscleGroup].recovery.lastTrained) {
          muscleGroups[muscleGroup].recovery.lastTrained = workout.completedAt;
        }

        // Track synergist and antagonist relationships
        exercise.exerciseId.primaryMuscles.forEach(primary => {
          exercise.exerciseId.secondaryMuscles.forEach(secondary => {
            const key = `${primary}-${secondary}`;
            if (!muscleCorrelations.has(key)) {
              muscleCorrelations.set(key, {
                muscleGroup1: primary,
                muscleGroup2: secondary,
                correlationType: 'synergist',
                volume1: 0,
                volume2: 0
              });
            }
            const correlation = muscleCorrelations.get(key);
            if (primary === muscleGroup) {
              correlation.volume1 += workoutVolume;
            } else {
              correlation.volume2 += workoutVolume;
            }
          });
        });
      }
    }

    // Calculate metrics and insights
    const muscleGroupsArray = Object.values(muscleGroups);
    const correlationsArray = [];

    // Process correlations
    muscleCorrelations.forEach(correlation => {
      const ratio = correlation.volume2 ? correlation.volume1 / correlation.volume2 : 0;
      correlationsArray.push({
        muscleGroup1: correlation.muscleGroup1,
        muscleGroup2: correlation.muscleGroup2,
        correlationType: correlation.correlationType,
        balanceRatio: ratio,
        idealRatio: 1, // Ideal ratio can be adjusted based on specific muscle relationships
        recommendation: generateBalanceRecommendation(ratio, correlation)
      });
    });

    // Calculate focus areas
    const focusAreas = muscleGroupsArray
      .filter(mg => {
        const weeklyVolumePerFrequency = mg.metrics.weeklyVolume / (mg.metrics.weeklyFrequency || 1);
        return weeklyVolumePerFrequency < 3000; // Threshold for identifying underworked muscles
      })
      .map(mg => ({
        muscleGroup: mg.name,
        priority: calculatePriority(mg),
        reason: generateFocusReason(mg),
        suggestedExercises: suggestExercises(mg.name)
      }));

    // Update fatigue and recovery status
    muscleGroupsArray.forEach(mg => {
      mg.fatigue.current = calculateMuscleFatigue(
        mg.metrics.weeklyVolume,
        mg.metrics.weeklyFrequency,
        mg.metrics.averageIntensity
      );

      const recovery = determineRecoveryStatus(
        mg.recovery.lastTrained,
        mg.metrics.weeklyVolume,
        mg.metrics.averageIntensity
      );
      mg.recovery = {
        ...mg.recovery,
        ...recovery
      };
    });

    // Create or update muscle analysis
    const muscleAnalysis = await MuscleAnalysis.findOneAndUpdate(
      { userId: req.user.id },
      {
        lastUpdated: now,
        muscleGroups: muscleGroupsArray,
        focusAreas,
        correlations: correlationsArray,
        developmentInsights: {
          potentialAnalysis: generatePotentialAnalysis(muscleGroupsArray),
          symmetry: analyzeSymmetry(muscleGroupsArray, correlationsArray),
          progressionTrends: calculateProgressionTrends(muscleGroupsArray)
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: muscleAnalysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating muscle analysis',
      error: error.message
    });
  }
};

// Helper function to determine muscle category
const determineMuscleCategory = (muscleGroup) => {
  const pushMuscles = ['chest', 'shoulders', 'triceps'];
  const pullMuscles = ['back', 'biceps', 'traps'];
  const legMuscles = ['quadriceps', 'hamstrings', 'calves', 'glutes'];
  const coreMuscles = ['abs', 'obliques', 'lower back'];

  muscleGroup = muscleGroup.toLowerCase();
  if (pushMuscles.includes(muscleGroup)) return 'push';
  if (pullMuscles.includes(muscleGroup)) return 'pull';
  if (legMuscles.includes(muscleGroup)) return 'legs';
  if (coreMuscles.includes(muscleGroup)) return 'core';
  return 'other';
};

// Helper function to generate balance recommendation
const generateBalanceRecommendation = (ratio, correlation) => {
  if (ratio < 0.7) {
    return `Increase ${correlation.muscleGroup1} volume to improve balance with ${correlation.muscleGroup2}`;
  }
  if (ratio > 1.3) {
    return `Reduce ${correlation.muscleGroup1} volume or increase ${correlation.muscleGroup2} volume for better balance`;
  }
  return 'Good balance between muscle groups';
};

// Helper function to calculate priority
const calculatePriority = (muscleGroup) => {
  const weeklyVolumeScore = muscleGroup.metrics.weeklyVolume < 3000 ? 2 : 1;
  const frequencyScore = muscleGroup.metrics.weeklyFrequency < 2 ? 2 : 1;
  const fatigueScore = muscleGroup.fatigue.current === 'low' ? 2 : 1;

  return Math.min(5, weeklyVolumeScore + frequencyScore + fatigueScore);
};

// Helper function to generate focus reason
const generateFocusReason = (muscleGroup) => {
  const reasons = [];
  if (muscleGroup.metrics.weeklyVolume < 3000) {
    reasons.push('insufficient weekly volume');
  }
  if (muscleGroup.metrics.weeklyFrequency < 2) {
    reasons.push('low training frequency');
  }
  if (muscleGroup.fatigue.current === 'low') {
    reasons.push('low training stress');
  }
  return `Needs attention due to ${reasons.join(', ')}`;
};

// Helper function to suggest exercises
const suggestExercises = async (muscleGroup) => {
  const exercises = await Exercise.find({
    $or: [
      { muscleGroup: muscleGroup },
      { primaryMuscles: muscleGroup },
      { secondaryMuscles: muscleGroup }
    ]
  }).limit(3);

  return exercises.map(exercise => ({
    exerciseId: exercise._id,
    reason: `Effective for targeting ${muscleGroup}`
  }));
};

// Helper function to generate potential analysis
const generatePotentialAnalysis = (muscleGroups) => {
  return muscleGroups.map(mg => ({
    muscleGroup: mg.name,
    currentDevelopment: calculateDevelopment(mg),
    potentialRemaining: 100 - calculateDevelopment(mg),
    limitingFactors: identifyLimitingFactors(mg)
  }));
};

// Helper function to calculate development
const calculateDevelopment = (muscleGroup) => {
  const volumeScore = Math.min(100, (muscleGroup.metrics.monthlyVolume / 50000) * 100);
  const frequencyScore = Math.min(100, (muscleGroup.metrics.monthlyFrequency / 12) * 100);
  return Math.round((volumeScore + frequencyScore) / 2);
};

// Helper function to identify limiting factors
const identifyLimitingFactors = (muscleGroup) => {
  const factors = [];
  if (muscleGroup.metrics.weeklyFrequency < 2) {
    factors.push('Low training frequency');
  }
  if (muscleGroup.metrics.weeklyVolume < 3000) {
    factors.push('Insufficient volume');
  }
  if (muscleGroup.metrics.averageIntensity < 0.6) {
    factors.push('Low training intensity');
  }
  return factors;
};

// Helper function to analyze symmetry
const analyzeSymmetry = (muscleGroups, correlations) => {
  const imbalances = [];
  let overallScore = 100;

  correlations.forEach(correlation => {
    if (correlation.balanceRatio < 0.7 || correlation.balanceRatio > 1.3) {
      const severity = Math.min(5, Math.round(Math.abs(1 - correlation.balanceRatio) * 5));
      imbalances.push({
        description: `Imbalance between ${correlation.muscleGroup1} and ${correlation.muscleGroup2}`,
        severity,
        correctionPlan: correlation.recommendation
      });
      overallScore -= severity * 5;
    }
  });

  return {
    overallScore: Math.max(0, overallScore),
    imbalances
  };
};

// Helper function to calculate progression trends
const calculateProgressionTrends = (muscleGroups) => {
  return muscleGroups.map(mg => ({
    muscleGroup: mg.name,
    timeFrame: '1_month',
    volumeChange: mg.metrics.volumeProgression,
    strengthChange: mg.metrics.strengthProgression,
    trend: determineTrend(mg.metrics.volumeProgression, mg.metrics.strengthProgression)
  }));
};

// Helper function to determine trend
const determineTrend = (volumeChange, strengthChange) => {
  const avgChange = (volumeChange + strengthChange) / 2;
  if (avgChange > 5) return 'improving';
  if (avgChange < -5) return 'declining';
  return 'maintaining';
};

// Get muscle analysis
const getMuscleAnalysis = async (req, res) => {
  try {
    const analysis = await MuscleAnalysis.findOne({
      userId: req.user.id
    }).sort({ lastUpdated: -1 });

    if (!analysis ||
      analysis.lastUpdated < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      // If no analysis or older than 24 hours, generate new one
      return generateMuscleAnalysis(req, res);
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching muscle analysis',
      error: error.message
    });
  }
};

const getWorkoutById = async (req, res) => {
  try {
    console.log('Fetching workout by ID:', req.params.id);
    const workout = await Workout.findById(req.params.id)
      .populate('exercises.exerciseId');

    if (!workout) {
      console.log('No workout found with ID:', req.params.id);
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (workout.userId.toString() !== req.user.id) {
      console.log('User not authorized:', { workoutUserId: workout.userId, requestUserId: req.user.id });
      return res.status(403).json({ message: 'Not authorized to view this workout' });
    }

    console.log('Found workout:', workout);
    res.json(workout);
  } catch (err) {
    console.error('Error fetching workout:', err);
    res.status(500).json({ message: err.message });
  }
};

// Export all functions
module.exports = {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  deleteWorkout,
  createExercise,
  getAllExercises,
  getExercisesByMuscleGroup,
  getOrCreateWorkoutForDay,
  addExerciseToWorkout,
  completeExerciseSet,
  completeWorkout,
  getWorkoutHistory,
  getWorkoutStats,
  getExerciseProgress,
  getExercisePRs,
  getAllPRs,
  generateRecommendations,
  getRecommendations,
  generateMuscleAnalysis,
  getMuscleAnalysis
};
