// src/components/ui/WeatherWidget.jsx
import React, { useState, useEffect } from 'react';
import './WeatherWidget.css';

const WeatherWidget = ({ 
  location = 'Nairobi, KE',
  units = 'metric',
  showDetails = true,
  onWeatherUpdate,
  className = '',
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Mock weather data for demonstration
  const mockWeatherData = {
    location: location,
    temperature: 25,
    feelsLike: 27,
    humidity: 65,
    windSpeed: 12,
    windDirection: 'NE',
    description: 'Partly Cloudy',
    icon: 'partly-cloudy-day',
    precipitation: 10,
    pressure: 1013,
    visibility: 10,
    uvIndex: 6,
    sunrise: '06:30',
    sunset: '18:45',
    forecast: [
      { day: 'Today', high: 28, low: 18, icon: 'partly-cloudy-day', pop: 20 },
      { day: 'Tomorrow', high: 26, low: 17, icon: 'rain', pop: 60 },
      { day: 'Wed', high: 24, low: 16, icon: 'cloudy', pop: 40 },
    ]
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real application, you would call an actual weather API
      // For now, we'll use mock data with a delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate occasional errors
      if (Math.random() < 0.1) {
        throw new Error('Weather service temporarily unavailable');
      }
      
      const data = {
        ...mockWeatherData,
        temperature: Math.round(20 + Math.random() * 10), // Random temp between 20-30
        lastUpdated: new Date().toISOString()
      };
      
      setWeatherData(data);
      setLastUpdated(new Date());
      
      if (onWeatherUpdate) {
        onWeatherUpdate(data);
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [location, units]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchWeatherData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getWeatherIcon = (iconName) => {
    const iconMap = {
      'clear-day': '☀️',
      'clear-night': '🌙',
      'rain': '🌧️',
      'snow': '❄️',
      'sleet': '🌨️',
      'wind': '💨',
      'fog': '🌫️',
      'cloudy': '☁️',
      'partly-cloudy-day': '⛅',
      'partly-cloudy-night': '☁️',
      'thunderstorm': '⛈️',
      'hail': '🌨️',
      'tornado': '🌪️'
    };
    
    return iconMap[iconName] || '🌤️';
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 30) return '#dc3545'; // Hot - red
    if (temp >= 25) return '#ffc107'; // Warm - yellow
    if (temp >= 15) return '#28a745'; // Moderate - green
    if (temp >= 5) return '#17a2b8';  // Cool - blue
    return '#6f42c1'; // Cold - purple
  };

  const getUvIndexLevel = (uvIndex) => {
    if (uvIndex <= 2) return { level: 'Low', color: '#28a745' };
    if (uvIndex <= 5) return { level: 'Moderate', color: '#ffc107' };
    if (uvIndex <= 7) return { level: 'High', color: '#fd7e14' };
    if (uvIndex <= 10) return { level: 'Very High', color: '#dc3545' };
    return { level: 'Extreme', color: '#6f42c1' };
  };

  const handleRefresh = () => {
    fetchWeatherData();
  };

  const formatTime = (date) => {
    return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
  };

  if (loading && !weatherData) {
    return (
      <div className={`weather-widget loading ${className} size-${size}`}>
        <div className="weather-loading">
          <div className="loading-spinner"></div>
          <span>Loading weather data...</span>
        </div>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className={`weather-widget error ${className} size-${size}`}>
        <div className="weather-error">
          <span className="error-icon">⚠️</span>
          <div className="error-message">
            <strong>Weather Unavailable</strong>
            <span>{error}</span>
          </div>
          <button className="retry-btn" onClick={handleRefresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const uvInfo = getUvIndexLevel(weatherData.uvIndex);
  const tempColor = getTemperatureColor(weatherData.temperature);

  return (
    <div className={`weather-widget ${className} size-${size}`}>
      {/* Header */}
      <div className="weather-header">
        <div className="location-info">
          <span className="location-icon">📍</span>
          <span className="location-name">{weatherData.location}</span>
        </div>
        <div className="weather-actions">
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh weather"
          >
            {loading ? '⟳' : '↻'}
          </button>
          {lastUpdated && (
            <span className="last-updated">
              Updated {formatTime(lastUpdated)}
            </span>
          )}
        </div>
      </div>

      {/* Current Weather */}
      <div className="current-weather">
        <div className="temperature-section">
          <div className="weather-icon">
            {getWeatherIcon(weatherData.icon)}
          </div>
          <div className="temperature-info">
            <div 
              className="temperature"
              style={{ color: tempColor }}
            >
              {Math.round(weatherData.temperature)}°
              <span className="unit">{units === 'metric' ? 'C' : 'F'}</span>
            </div>
            <div className="weather-description">
              {weatherData.description}
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="weather-details">
            <div className="detail-item">
              <span className="detail-label">Feels like</span>
              <span className="detail-value">{Math.round(weatherData.feelsLike)}°</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{weatherData.humidity}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Wind</span>
              <span className="detail-value">
                {weatherData.windSpeed} km/h {weatherData.windDirection}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Rain</span>
              <span className="detail-value">{weatherData.precipitation}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      {showDetails && (
        <div className="additional-info">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">🌅</span>
              <span className="info-label">Sunrise</span>
              <span className="info-value">{weatherData.sunrise}</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🌇</span>
              <span className="info-label">Sunset</span>
              <span className="info-value">{weatherData.sunset}</span>
            </div>
            <div className="info-item">
              <span className="info-icon">☀️</span>
              <span className="info-label">UV Index</span>
              <span 
                className="info-value"
                style={{ color: uvInfo.color }}
              >
                {weatherData.uvIndex} ({uvInfo.level})
              </span>
            </div>
            <div className="info-item">
              <span className="info-icon">👁️</span>
              <span className="info-label">Visibility</span>
              <span className="info-value">{weatherData.visibility} km</span>
            </div>
          </div>
        </div>
      )}

      {/* Forecast */}
      {showDetails && (
        <div className="weather-forecast">
          <h4 className="forecast-title">3-Day Forecast</h4>
          <div className="forecast-grid">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="forecast-item">
                <span className="forecast-day">{day.day}</span>
                <span className="forecast-icon">
                  {getWeatherIcon(day.icon)}
                </span>
                <div className="forecast-temps">
                  <span className="forecast-high">{day.high}°</span>
                  <span className="forecast-low">{day.low}°</span>
                </div>
                <span className="forecast-pop">
                  {day.pop}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Farm Weather Alerts */}
      <div className="weather-alerts">
        {weatherData.precipitation > 50 && (
          <div className="alert warning">
            <span className="alert-icon">🌧️</span>
            <span className="alert-message">
              High chance of rain today. Consider delaying outdoor activities.
            </span>
          </div>
        )}
        {weatherData.uvIndex >= 6 && (
          <div className="alert warning">
            <span className="alert-icon">☀️</span>
            <span className="alert-message">
              High UV index. Protect crops and use sun protection.
            </span>
          </div>
        )}
        {weatherData.temperature < 10 && (
          <div className="alert info">
            <span className="alert-icon">❄️</span>
            <span className="alert-message">
              Cool temperatures. Monitor sensitive crops.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;