# Weather Forecast Comparison

A minimal weather forecasting page that compares local conditions to the previous day.

## Features

- **Auto-location detection** - Uses browser geolocation to find your location
- **Current weather** - Today's temperature, conditions, humidity, and wind speed
- **Historical comparison** - Yesterday's weather data for comparison
- **Change indicators** - See how temperature, humidity, and wind have changed
- **Responsive design** - Works on desktop and mobile devices
- **No API key required** - Uses free Open-Meteo and OpenStreetMap APIs

## Files

- `index.html` - Main page structure
- `style.css` - Minimal, responsive styling
- `script.js` - Weather data fetching and display logic

## How to Run

1. Open `index.html` in a modern web browser
2. Allow browser geolocation access when prompted (or use London as default)
3. Wait for weather data to load

## APIs Used

- **Open-Meteo Archive API** - Historical and current weather data (free, no key required)
- **Nominatim Reverse Geocoding** - Location name lookup (OpenStreetMap)

## Notes

- Uses browser's native geolocation API (requires HTTPS or localhost for security)
- Defaults to London if geolocation is unavailable
- Weather data is fetched from free, public APIs
- Temperature is in Celsius
- Wind speed is in km/h
