const API_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

async function getWeatherData(customLocation = null) {
    try {
        // Get location (custom or auto-detect)
        const coords = customLocation 
            ? await searchLocation(customLocation)
            : await getCoordinates();
        const { latitude, longitude, city } = coords;
        
        document.getElementById('location').textContent = `📍 ${city}`;
        document.getElementById('loading').style.display = 'block';
        document.getElementById('weather').classList.add('hidden');
        
        // Get today's weather
        const today = new Date();
        const todayData = await fetchWeather(latitude, longitude, today);
        
        // Get yesterday's weather
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayData = await fetchWeather(latitude, longitude, yesterday);
        
        // Display weather
        displayWeather(todayData, yesterdayData);
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('weather').classList.remove('hidden');
        
    } catch (error) {
        document.getElementById('error').textContent = `Error: ${error.message}`;
        document.getElementById('loading').style.display = 'none';
    }
}

async function getCoordinates() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Get city name from reverse geocoding (optional fallback)
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        const city = data.address?.city || data.address?.town || 'Your Location';
                        resolve({ latitude, longitude, city });
                    } catch {
                        resolve({ latitude, longitude, city: 'Your Location' });
                    }
                },
                () => {
                    // Default to London if geolocation fails
                    resolve({ latitude: 51.5074, longitude: -0.1278, city: 'London' });
                }
            );
        } else {
            resolve({ latitude: 51.5074, longitude: -0.1278, city: 'London' });
        }
    });
}

async function fetchWeather(latitude, longitude, date) {
    const dateStr = date.toISOString().split('T')[0];
    
    const params = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        start_date: dateStr,
        end_date: dateStr,
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,wind_speed_10m_max',
        timezone: 'auto'
    });
    
    const response = await fetch(`${ARCHIVE_URL}?${params}`);
    const data = await response.json();
    
    if (!data.daily || data.daily.time.length === 0) {
        throw new Error('Could not fetch weather data');
    }
    
    const index = 0; // First (and only) date in results
    const weatherCode = data.daily.weather_code[index];
    
    return {
        date: dateStr,
        temp_max: data.daily.temperature_2m_max[index],
        temp_min: data.daily.temperature_2m_min[index],
        humidity: data.daily.relative_humidity_2m_max[index],
        wind: data.daily.wind_speed_10m_max[index],
        condition: getWeatherCondition(weatherCode)
    };
}

function getWeatherCondition(code) {
    // WMO Weather interpretation codes
    const conditions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Drizzle',
        53: 'Drizzle',
        55: 'Drizzle',
        61: 'Rain',
        63: 'Rain',
        65: 'Heavy rain',
        71: 'Snow',
        73: 'Snow',
        75: 'Heavy snow',
        77: 'Snow',
        80: 'Rain showers',
        81: 'Rain showers',
        82: 'Heavy rain showers',
        85: 'Snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Thunderstorm with hail'
    };
    
    return conditions[code] || 'Unknown';
}

function displayWeather(todayData, yesterdayData) {
    // Today's weather
    document.getElementById('todayTemp').textContent = Math.round(todayData.temp_max) + '°C';
    document.getElementById('todayCondition').textContent = todayData.condition;
    document.getElementById('todayHumidity').textContent = todayData.humidity + '%';
    document.getElementById('todayWind').textContent = Math.round(todayData.wind) + ' km/h';
    
    // Yesterday's weather
    document.getElementById('yesterdayTemp').textContent = Math.round(yesterdayData.temp_max) + '°C';
    document.getElementById('yesterdayCondition').textContent = yesterdayData.condition;
    document.getElementById('yesterdayHumidity').textContent = yesterdayData.humidity + '%';
    document.getElementById('yesterdayWind').textContent = Math.round(yesterdayData.wind) + ' km/h';
    
    // Comparisons
    const tempDiff = todayData.temp_max - yesterdayData.temp_max;
    const humidityDiff = todayData.humidity - yesterdayData.humidity;
    const windDiff = todayData.wind - yesterdayData.wind;
    
    const tempChangeEl = document.getElementById('tempChange');
    const humidityChangeEl = document.getElementById('humidityChange');
    const windChangeEl = document.getElementById('windChange');
    
    tempChangeEl.textContent = formatChange(tempDiff, '°C');
    tempChangeEl.className = 'change ' + (tempDiff > 0 ? 'positive' : 'negative');
    
    humidityChangeEl.textContent = formatChange(humidityDiff, '%');
    humidityChangeEl.className = 'change ' + (humidityDiff > 0 ? 'positive' : 'negative');
    
    windChangeEl.textContent = formatChange(windDiff, ' km/h');
    windChangeEl.className = 'change ' + (windDiff > 0 ? 'positive' : 'negative');
}

function formatChange(value, unit) {
    const sign = value > 0 ? '+' : '';
    return sign + value.toFixed(1) + unit;
}

async function searchLocation(query) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
        );
        const data = await response.json();
        
        if (!data || data.length === 0) {
            throw new Error(`Location "${query}" not found`);
        }
        
        const result = data[0];
        return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            city: result.name || query
        };
    } catch (error) {
        throw new Error(`Could not find location: ${query}`);
    }
}

// Event listeners
window.addEventListener('load', getWeatherData);

document.getElementById('searchBtn').addEventListener('click', () => {
    const location = document.getElementById('locationInput').value.trim();
    if (location) {
        getWeatherData(location);
        document.getElementById('locationInput').value = '';
    }
});

document.getElementById('locationInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});
