// Import required modules
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Replace with your actual API key from OpenWeatherMap
const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Weather API! Use /weather/current or /weather/forecast with a city query.');
});

// Get current weather by city name
app.get('/weather/current', async (req, res) => {
  const city = req.query.city;
  
  if (!city) {
    return res.status(400).json({ error: 'City is required as a query parameter' });
  }

  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;
    res.json({
      city: data.name,
      temperature: `${data.main.temp}°C`,
      weather: data.weather[0].description
    });

  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch current weather data' });
    }
  }
});

// Get 5-day weather forecast by city name
app.get('/weather/forecast', async (req, res) => {
  const city = req.query.city;
  
  if (!city) {
    return res.status(400).json({ error: 'City is required as a query parameter' });
  }

  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const forecast = response.data.list.slice(0, 5).map(item => ({
      date: item.dt_txt,
      temperature: `${item.main.temp}°C`,
      weather: item.weather[0].description
    }));

    res.json({
      city: response.data.city.name,
      forecast
    });

  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch weather forecast' });
    }
  }
});

// Not found route
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
