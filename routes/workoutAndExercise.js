const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createWorkout,
  getWorkouts,
  deleteWorkout,
  createExercise,
  getAllExercises,
  getExercisesByMuscleGroup,
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
  getMuscleAnalysis,
  getWorkoutById
} = require('../controllers/workoutAndExercise');

// Workout routes
router.post('/create', protect, createWorkout);
router.get('/', protect, getWorkouts);
router.get('/:id', protect, getWorkoutById);
router.delete('/:id', protect, deleteWorkout);
router.post('/:id/exercises', protect, addExerciseToWorkout);

// Exercise routes
router.post('/exercise', protect, createExercise);
router.get('/exercises', protect, getAllExercises);
router.get('/exercises/:group', protect, getExercisesByMuscleGroup);
router.get('/exercises/:exerciseId/progress', protect, getExerciseProgress);

// Exercise completion routes
router.patch('/:workoutId/exercises/:exerciseId/sets/:setIndex/complete', protect, completeExerciseSet);
router.post('/:workoutId/complete', protect, completeWorkout);

// Workout history routes
router.get('/history', protect, getWorkoutHistory);
router.get('/stats', protect, getWorkoutStats);

// Personal Records routes
router.get('/exercises/:exerciseId/prs', protect, getExercisePRs);
router.get('/personal-records', protect, getAllPRs);

// Recommendation routes
router.get('/recommendations', protect, getRecommendations);
router.post('/recommendations/generate', protect, generateRecommendations);

// Muscle Analysis routes
router.get('/muscle-analysis', protect, getMuscleAnalysis);
router.post('/muscle-analysis/generate', protect, generateMuscleAnalysis);

module.exports = router;
