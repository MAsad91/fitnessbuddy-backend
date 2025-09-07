// Calculate Body Mass Index (BMI)
exports.calculateBMI = function(weight, height) {
  // height should be in meters, weight in kg
  if (!weight || !height) return null;
  return (weight / (height * height)).toFixed(1);
};

// Calculate Basal Metabolic Rate (BMR) using Harris-Benedict equation
exports.calculateBMR = function(weight, height, age, gender) {
  if (!weight || !height || !age || !gender) return null;

  // Convert height to cm for the formula
  var heightInCm = height * 100;

  if (gender.toLowerCase() === 'male') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * heightInCm) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * heightInCm) - (4.330 * age));
  }
};

// Calculate weight change rate (kg per week)
exports.calculateWeightChangeRate = function(currentWeight, startWeight, daysElapsed) {
  if (!currentWeight || !startWeight || !daysElapsed) return 0;

  var totalChange = currentWeight - startWeight;
  var weeksElapsed = daysElapsed / 7;
  
  return (totalChange / weeksElapsed).toFixed(2);
};

// Calculate ideal weight range using BMI method
exports.calculateIdealWeightRange = function(height) {
  if (!height) return null;

  // Using BMI ranges: 18.5 (underweight/normal boundary) to 24.9 (normal/overweight boundary)
  var minWeight = 18.5 * (height * height);
  var maxWeight = 24.9 * (height * height);

  return {
    min: Math.round(minWeight * 10) / 10,
    max: Math.round(maxWeight * 10) / 10
  };
};

// Calculate calories needed for weight goal
exports.calculateCaloriesForGoal = function(bmr, activityLevel, weightGoal, weeklyGoal) {
  if (!bmr || !activityLevel || !weightGoal) return null;

  var activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };

  var multiplier = activityMultipliers[activityLevel] || 1.2;
  var maintenanceCalories = bmr * multiplier;

  // If no specific weekly goal, return maintenance calories
  if (!weeklyGoal) return Math.round(maintenanceCalories);

  // 1 kg of fat = 7700 calories
  var calorieAdjustment = (weeklyGoal * 7700) / 7;

  // For weight loss (negative weeklyGoal), subtract calories
  // For weight gain (positive weeklyGoal), add calories
  return Math.round(maintenanceCalories + calorieAdjustment);
};

// Calculate Body Fat Percentage using US Navy method
exports.calculateBodyFat = function(gender, waist, neck, height, hip) {
  if (!gender || !waist || !neck || !height) return null;

  // All measurements should be in cm
  var bodyFat;
  
  if (gender.toLowerCase() === 'male') {
    bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    if (!hip) return null;
    bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  }

  return Math.round(bodyFat * 10) / 10;
}; 