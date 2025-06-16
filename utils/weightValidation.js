const { body } = require('express-validator');

exports.weightEntryValidation = [
  body('weight').isFloat({ min: 20, max: 500 }).withMessage('Invalid weight value'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('time').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid time format (HH:mm)'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note too long'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').isIn(['morning', 'afternoon', 'evening', 'before_meal', 'after_meal', 'workout', 'other']),
  body('isPrimaryEntry').optional().isBoolean(),
  body('measurements').optional().isObject(),
  body('measurements.chest').optional().isFloat({ min: 30, max: 200 }),
  body('measurements.waist').optional().isFloat({ min: 30, max: 200 }),
  body('measurements.hips').optional().isFloat({ min: 30, max: 200 }),
  body('measurements.thighs').optional().isFloat({ min: 20, max: 100 }),
  body('measurements.arms').optional().isFloat({ min: 15, max: 100 }),
  body('measurements.neck').optional().isFloat({ min: 20, max: 100 }),
];

exports.weightUpdateValidation = [
  body('weight').optional().isFloat({ min: 20, max: 500 }),
  body('date').optional().isISO8601(),
  body('time').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('note').optional().trim().isLength({ max: 500 }),
  body('tags').optional().isArray(),
  body('tags.*').isIn(['morning', 'afternoon', 'evening', 'before_meal', 'after_meal', 'workout', 'other']),
  body('isPrimaryEntry').optional().isBoolean(),
  body('measurements').optional().isObject(),
  body('measurements.chest').optional().isFloat({ min: 30, max: 200 }),
  body('measurements.waist').optional().isFloat({ min: 30, max: 200 }),
  body('measurements.hips').optional().isFloat({ min: 30, max: 200 }),
  body('measurements.thighs').optional().isFloat({ min: 20, max: 100 }),
  body('measurements.arms').optional().isFloat({ min: 15, max: 100 }),
  body('measurements.neck').optional().isFloat({ min: 20, max: 100 }),
];

exports.dailyAveragesValidation = [
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
];

exports.weightGoalValidation = [
  body('targetWeight').isFloat({ min: 20, max: 500 }).withMessage('Invalid target weight'),
  body('startWeight').isFloat({ min: 20, max: 500 }).withMessage('Invalid start weight'),
  body('type').isIn(['lose', 'gain', 'maintain']).withMessage('Invalid goal type'),
  body('targetDate').isISO8601().withMessage('Invalid target date'),
  body('weeklyGoal').isFloat({ min: -1, max: 1 }).withMessage('Weekly goal should not exceed 1kg'),
];

exports.milestoneValidation = [
  body('achieved').isBoolean().withMessage('Achieved must be a boolean value'),
]; 