const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Simple in-memory cache for food analysis results
const foodAnalysisCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
// Use only the fastest, most reliable model
const GEMINI_MODELS = [
  'gemini-2.0-flash'         // Primary: Fastest stable model only
];

// Function to get API URL for a specific model
const getGeminiURL = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// Helper function to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make Gemini API calls with model fallback
async function callGeminiAPI(prompt, systemPrompt = null) {
  // Validate API key
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  // Use only the primary model for speed
  const currentModel = GEMINI_MODELS[0];
  const apiUrl = getGeminiURL(currentModel);
  
  try {
    console.log(`🚀 Making Gemini API call with model: ${currentModel}`);
    
    const response = await axios.post(
      `${apiUrl}?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // Reduced to 10 second timeout for faster response
      }
    );

      console.log(`✅ Gemini API response received from model: ${currentModel}`);
      
      if (response.data.candidates && response.data.candidates[0]) {
        let content = response.data.candidates[0].content.parts[0].text;
        console.log('📊 Gemini response content:', content.substring(0, 200) + '...');
        
        try {
          // Clean up the response - remove markdown code blocks if present
          content = content.trim();
          
          // Remove markdown code block markers
          if (content.startsWith('```json')) {
            content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (content.startsWith('```')) {
            content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          // Additional cleanup - remove any leading/trailing whitespace
          content = content.trim();
          
          console.log('🧹 Cleaned content for parsing:', content.substring(0, 200) + '...');
          
          const parsedResponse = JSON.parse(content);
          console.log(`🎯 Successfully parsed response from model: ${currentModel}`);
          
          // Validate the response structure
          if (parsedResponse && parsedResponse.foods && Array.isArray(parsedResponse.foods)) {
            console.log(`✅ Valid foods array with ${parsedResponse.foods.length} items`);
            return parsedResponse.foods; // Return just the foods array, not the wrapper
          } else if (Array.isArray(parsedResponse)) {
            console.log(`✅ Direct foods array with ${parsedResponse.length} items`);
            return parsedResponse; // Already an array
          } else {
            console.warn('⚠️ Unexpected response structure:', Object.keys(parsedResponse));
            return parsedResponse;
          }
          
        } catch (parseError) {
          console.error(`❌ Failed to parse JSON from model ${currentModel}:`, parseError.message);
          console.error('📄 Raw response content:', content);
          throw new Error(`Invalid JSON response from Gemini: ${parseError.message}`);
        }
      } else {
        console.error(`❌ No valid candidates from model ${currentModel}:`, response.data);
        throw new Error('No response from Gemini model');
      }
    } catch (error) {
      console.error(`🔥 Gemini API call failed:`, error.message);
      
      if (error.response?.status === 404) {
        throw new Error('Gemini model not found. Please check your API configuration.');
      } else if (error.response?.status === 403) {
        throw new Error('Gemini API access denied. Please check your API key and permissions.');
      } else if (error.response?.status === 429) {
        throw new Error('Gemini API rate limit exceeded. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Gemini API request timeout. Please try again.');
      } else {
        throw new Error(`Gemini API failed: ${error.message}`);
      }
    }
}

// System prompt for food analysis
const FOOD_ANALYSIS_SYSTEM_PROMPT = `You are a nutrition expert. Analyze the given food description and return nutrition information in the following JSON format:

{
  "foods": [
    {
      "food_name": "string",
      "serving_qty": number,
      "serving_unit": "string",
      "nf_calories": number,
      "nf_protein": number,
      "nf_total_carbohydrate": number,
      "nf_total_fat": number,
      "nf_sodium": number,
      "nf_fiber": number,
      "nf_sugars": number
    }
  ]
}

CRITICAL RULES:
- Return ONLY valid JSON - no markdown, no code blocks, no formatting
- Do NOT wrap your response in \`\`\`json or \`\`\` blocks
- Start your response directly with { and end with }
- Always return valid JSON that can be parsed immediately
- Use realistic nutrition values based on common serving sizes
- If multiple foods are mentioned, create separate entries
- Use grams (g) for weight units unless specified otherwise
- Calories should be realistic for the food type
- Protein, carbs, and fat should add up to reasonable percentages
- If unsure about specific values, use reasonable estimates
- For generic descriptions, provide a typical serving size

RESPONSE FORMAT: Return only the JSON object, nothing else.`;

// System prompt for barcode analysis
const BARCODE_ANALYSIS_SYSTEM_PROMPT = `You are a product database expert. Analyze the given product information and return nutrition data in the following JSON format:

{
  "name": "string",
  "brand": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "serving_size": "string",
  "serving_unit": "string",
  "ingredients": ["string"],
  "allergens": ["string"]
}

Rules:
- Always return valid JSON
- Use realistic nutrition values
- If product name is unclear, make reasonable assumptions
- Provide serving size in common units (grams, pieces, cups, etc.)
- Include common allergens if likely present
- If brand is unknown, use "Unknown" or omit
- Calories should be per serving, not per 100g`;

// Analyze food description using Gemini
async function analyzeFoodDescription(description) {
  // Check cache first
  const cacheKey = description.toLowerCase().trim();
  const cached = foodAnalysisCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('🚀 Using cached food analysis for:', description);
    return cached.data;
  }

  const prompt = `Analyze this food description: "${description}"

Please provide nutrition information for this food item. Consider:
- What type of food is this?
- What would be a typical serving size?
- What are the estimated calories and macronutrients?
- Are there any specific ingredients that affect nutrition?

Return the analysis in the specified JSON format.`;

  try {
    const result = await callGeminiAPI(prompt, FOOD_ANALYSIS_SYSTEM_PROMPT);
    console.log('🔍 analyzeFoodDescription received from callGeminiAPI:', { 
      resultType: Array.isArray(result) ? 'array' : typeof result,
      isArray: Array.isArray(result),
      length: Array.isArray(result) ? result.length : 'N/A',
      hasKeys: typeof result === 'object' ? Object.keys(result) : 'N/A'
    });
    
    // callGeminiAPI now returns the foods array directly
    let foodsArray;
    if (Array.isArray(result)) {
      console.log('✅ Returning foods array directly:', result.length, 'items');
      foodsArray = result;
    } else if (result && result.foods && Array.isArray(result.foods)) {
      console.log('✅ Extracting foods from wrapper object:', result.foods.length, 'items');
      foodsArray = result.foods;
    } else {
      console.warn('⚠️ Unexpected result structure, returning as-is:', result);
      foodsArray = Array.isArray(result) ? result : [];
    }

    // Cache the result
    foodAnalysisCache.set(cacheKey, {
      data: foodsArray,
      timestamp: Date.now()
    });
    console.log('💾 Cached food analysis for:', description);

    return foodsArray;
  } catch (error) {
    console.error('Error analyzing food description with Gemini:', error);
    throw error;
  }
}

// Lookup barcode using Gemini
async function lookupBarcode(barcode) {
  const prompt = `Analyze this barcode: ${barcode}

This could be a product barcode. Please provide:
- What type of product this might be
- Typical nutrition information for such products
- Common serving sizes
- Potential allergens

If this appears to be a food product, provide nutrition data. If it's not a food product, indicate that.

Return the analysis in the specified JSON format.`;

  try {
    const result = await callGeminiAPI(prompt, BARCODE_ANALYSIS_SYSTEM_PROMPT);
    console.log('🔍 lookupBarcode received from callGeminiAPI:', { 
      resultType: Array.isArray(result) ? 'array' : typeof result,
      hasKeys: typeof result === 'object' ? Object.keys(result) : 'N/A'
    });
    
    // Handle the result based on its structure
    if (Array.isArray(result)) {
      return { foods: result };
    } else if (result && typeof result === 'object') {
      return { foods: [result] };
    } else {
      console.warn('⚠️ Unexpected barcode result structure:', result);
      return { foods: [] };
    }
  } catch (error) {
    console.error('Error looking up barcode with Gemini:', error);
    throw error;
  }
}

// Search food suggestions using Gemini
async function searchFoodSuggestions(query) {
  const prompt = `Search for food suggestions matching: "${query}"

Provide a list of common foods that match this query. For each food, include:
- Common name
- Typical serving size
- Basic nutrition info

Return in this format:
{
  "common": [
    {
      "food_name": "string",
      "serving_qty": number,
      "serving_unit": "string",
      "nf_calories": number
    }
  ]
}`;

  try {
    const result = await callGeminiAPI(prompt, FOOD_ANALYSIS_SYSTEM_PROMPT);
    console.log('🔍 searchFoodSuggestions received from callGeminiAPI:', { 
      resultType: Array.isArray(result) ? 'array' : typeof result,
      hasKeys: typeof result === 'object' ? Object.keys(result) : 'N/A'
    });
    
    // Handle the result based on its structure
    if (Array.isArray(result)) {
      return result;
    } else if (result && result.common && Array.isArray(result.common)) {
      return result.common;
    } else if (result && typeof result === 'object') {
      return [result];
    } else {
      console.warn('⚠️ Unexpected search suggestions result structure:', result);
      return [];
    }
  } catch (error) {
    console.error('Error searching food suggestions with Gemini:', error);
    throw error;
  }
}

// Get detailed nutrition info for a specific food
async function getNutritionInfo(foodName) {
  const prompt = `Provide detailed nutrition information for: "${foodName}"

Include:
- Detailed macronutrient breakdown
- Vitamins and minerals if applicable
- Health benefits or considerations
- Recommended serving sizes

Return in this format:
{
  "food_name": "string",
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sugars": number,
    "sodium": number
  },
  "serving_sizes": [
    {
      "amount": number,
      "unit": "string",
      "calories": number
    }
  ],
  "health_notes": "string"
}`;

  try {
    const result = await callGeminiAPI(prompt, FOOD_ANALYSIS_SYSTEM_PROMPT);
    console.log('🔍 getNutritionInfo received from callGeminiAPI:', { 
      resultType: Array.isArray(result) ? 'array' : typeof result,
      hasKeys: typeof result === 'object' ? Object.keys(result) : 'N/A'
    });
    
    // Handle the result based on its structure
    if (Array.isArray(result) && result.length > 0) {
      return result[0]; // Return first item if it's an array
    } else if (result && typeof result === 'object') {
      return result; // Return as-is if it's an object
    } else {
      console.warn('⚠️ Unexpected nutrition info result structure:', result);
      return {};
    }
  } catch (error) {
    console.error('Error getting nutrition info with Gemini:', error);
    throw error;
  }
}

// Analyze nutritional label image using Gemini Vision
async function analyzeNutritionalLabelImage(imageBase64) {
  const prompt = `Analyze this nutritional label image and extract the following information in JSON format:

{
  "product_name": "string",
  "brand": "string", 
  "serving_size": "string",
  "serving_unit": "string",
  "nutrition_per_serving": {
    "calories": number,
    "protein": number,
    "total_carbohydrate": number,
    "total_fat": number,
    "sodium": number,
    "fiber": number,
    "sugars": number
  },
  "ingredients": ["string"],
  "allergens": ["string"]
}

CRITICAL RULES:
- Return ONLY valid JSON - no markdown, no code blocks, no formatting
- Do NOT wrap your response in \`\`\`json or \`\`\` blocks
- Start your response directly with { and end with }
- Always return valid JSON that can be parsed immediately
- Extract exact values from the label
- Use realistic serving sizes and nutrition values
- If any information is not visible, use reasonable defaults or omit the field
- Focus on the most important nutrition facts (calories, protein, carbs, fat)
- Include ingredients list if visible
- Note any allergens mentioned on the label

RESPONSE FORMAT: Return only the JSON object, nothing else.`;

  try {
    console.log('🔍 Analyzing nutritional label image with Gemini Vision...');
    
    // Use Gemini Vision model for image analysis
    const visionModel = 'gemini-2.0-flash-exp';
    const visionUrl = getGeminiURL(visionModel);
    
    const requestBody = {
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };

    const response = await axios.post(visionUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      timeout: 30000
    });

    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      throw new Error('Invalid response from Gemini Vision API');
    }

    let content = response.data.candidates[0].content.parts[0].text;
    console.log('📊 Raw Gemini Vision response:', content);
    
    // Clean up the response - remove markdown code blocks if present
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    content = content.trim();
    
    const parsedResponse = JSON.parse(content);
    console.log('✅ Successfully parsed nutritional label data:', parsedResponse);
    
    return parsedResponse;
    
  } catch (error) {
    console.error('❌ Error analyzing nutritional label image:', error.message);
    if (error.response) {
      console.error('❌ API Error details:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    throw error;
  }
}

module.exports = {
  analyzeFoodDescription,
  lookupBarcode,
  searchFoodSuggestions,
  getNutritionInfo,
  analyzeNutritionalLabelImage
}; 