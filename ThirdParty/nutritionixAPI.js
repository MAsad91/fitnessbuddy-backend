const axios = require('axios');

const APP_ID = process.env.NUTRITIONIX_APP_ID;
const APP_KEY = process.env.NUTRITIONIX_API_KEY;
const BASE_URL = 'https://trackapi.nutritionix.com/v2';

const headers = {
  'x-app-id': APP_ID,
  'x-app-key': APP_KEY,
  'Content-Type': 'application/json'
};

function searchFoodSuggestions(query) {
  return axios.get(
    BASE_URL + '/search/instant',
      {
      headers: headers,
        params: {
        query: query,
        common: true
      }
    }
  ).then(function(response) {
    return response.data.common || [];
  }).catch(function(error) {
    console.error('Error searching food:', error);
    throw new Error('Failed to search for food');
  });
}

function lookupBarcode(upc) {
  return axios.get(
    BASE_URL + '/search/item',
    {
      headers: headers,
      params: { upc: upc }
    }
  ).then(function(response) {
    return response.data;
  }).catch(function(error) {
    console.error('Error looking up barcode:', error);
    throw new Error('Failed to lookup barcode');
  });
}

function analyzeFoodDescription(description) {
  return axios.post(
    BASE_URL + '/natural/nutrients',
    { query: description },
    { headers: headers }
  )
  .then(function(response) {
    return response.data.foods || [];
  })
  .catch(function(error) {
    console.error('Error analyzing food description:', error);
    throw new Error('Failed to analyze food description');
  });
}

module.exports = {
  searchFoodSuggestions: searchFoodSuggestions,
  lookupBarcode: lookupBarcode,
  analyzeFoodDescription: analyzeFoodDescription
};
