// Netlify serverless function for Google Places API
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!GOOGLE_PLACES_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Google Places API key not configured' })
    };
  }

  try {
    const { searchQuery } = JSON.parse(event.body);

    console.log('Searching for place:', searchQuery);

    // Search for the place
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    console.log('Google Places search status:', searchData.status);

    if (searchData.status !== 'OK' || !searchData.results.length) {
      console.log('No results found for:', searchQuery);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(null)
      };
    }

    const place = searchData.results[0];

    // Get photo URL if available
    let photoUrl = null;
    if (place.photos && place.photos.length > 0) {
      const photoReference = place.photos[0].photo_reference;
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
      console.log('Found photo for:', place.name);
    } else {
      console.log('No photos available for:', place.name);
    }

    // Get detailed info
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_address,formatted_phone_number,website,url,opening_hours,price_level&key=${GOOGLE_PLACES_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    const details = detailsData.result || {};

    const result = {
      placeId: place.place_id,
      name: details.name || place.name,
      rating: details.rating,
      address: details.formatted_address,
      phone: details.formatted_phone_number,
      website: details.website,
      mapsUrl: details.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`,
      photoUrl: photoUrl,
      isOpen: details.opening_hours?.open_now,
      priceLevel: details.price_level
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
