import logging
import requests
from typing import Dict, Optional
from django.conf import settings
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class WeatherService:
    """Weather service for agricultural recommendations"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'WEATHER_API_KEY', None)
        self.base_url = "http://api.openweathermap.org/data/2.5"
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def get_current_weather(self, location: str) -> Optional[Dict]:
        """Get current weather data for location"""
        try:
            if not self.api_key:
                logger.warning("⚠️ No weather API key configured - using fallback data")
                return self._get_fallback_weather(location)
            
            # Mock implementation - would integrate with actual weather API
            # In production, this would make real API calls
            
            return self._get_simulated_weather(location)
            
        except Exception as e:
            logger.error(f"❌ Weather API error: {e}")
            return self._get_fallback_weather(location)
    
    def _get_simulated_weather(self, location: str) -> Dict:
        """Get simulated weather data based on location"""
        # Simulate different weather patterns based on location
        location_weather = {
            'kampala': {'temp': 28, 'humidity': 70, 'rainfall': 120, 'condition': 'Partly Cloudy'},
            'nairobi': {'temp': 22, 'humidity': 65, 'rainfall': 80, 'condition': 'Sunny'},
            'lagos': {'temp': 30, 'humidity': 75, 'rainfall': 150, 'condition': 'Cloudy'},
            'johannesburg': {'temp': 20, 'humidity': 55, 'rainfall': 60, 'condition': 'Clear'},
            'default': {'temp': 25, 'humidity': 65, 'rainfall': 100, 'condition': 'Fair'}
        }
        
        location_key = location.lower() if location else 'default'
        weather = location_weather.get(location_key, location_weather['default'])
        
        return {
            'location': location,
            'temperature': weather['temp'],
            'humidity': weather['humidity'],
            'rainfall': weather['rainfall'],
            'condition': weather['condition'],
            'source': 'simulated',
            'timestamp': '2024-01-01T12:00:00Z'  # Would be actual timestamp in production
        }
    
    def _get_fallback_weather(self, location: str) -> Dict:
        """Get fallback weather data"""
        return {
            'location': location or 'Unknown',
            'temperature': 25.0,
            'humidity': 65.0,
            'rainfall': 100.0,
            'condition': 'Unknown',
            'source': 'fallback',
            'timestamp': '2024-01-01T12:00:00Z',
            'note': 'Using fallback data - configure weather API for accurate information'
        }
    
    def get_weather_forecast(self, location: str, days: int = 7) -> Dict:
        """Get weather forecast for agricultural planning"""
        try:
            base_forecast = self._get_simulated_weather(location)
            
            # Generate simple forecast
            forecast = []
            for i in range(days):
                day_forecast = base_forecast.copy()
                # Add some variation
                day_forecast['temperature'] += np.random.uniform(-3, 3)
                day_forecast['rainfall'] = max(0, base_forecast['rainfall'] + np.random.uniform(-20, 20))
                day_forecast['day'] = i
                forecast.append(day_forecast)
            
            return {
                'location': location,
                'forecast': forecast,
                'source': 'simulated',
                'agricultural_advice': self._get_agricultural_advice(forecast)
            }
            
        except Exception as e:
            logger.error(f"❌ Forecast error: {e}")
            return {
                'location': location,
                'forecast': [],
                'source': 'fallback',
                'agricultural_advice': 'Unable to generate forecast - consult local weather services'
            }
    
    def _get_agricultural_advice(self, forecast: List[Dict]) -> str:
        """Get agricultural advice based on weather forecast"""
        if not forecast:
            return "No forecast data available"
        
        # Analyze forecast for agricultural implications
        avg_temp = np.mean([day['temperature'] for day in forecast])
        total_rain = sum([day['rainfall'] for day in forecast])
        
        advice = []
        
        if avg_temp > 30:
            advice.append("High temperatures expected - ensure adequate irrigation")
        elif avg_temp < 15:
            advice.append("Cool temperatures - suitable for cool-season crops")
        
        if total_rain > 100:
            advice.append("Good rainfall expected - reduce irrigation")
        elif total_rain < 30:
            advice.append("Low rainfall - irrigation will be necessary")
        
        if not advice:
            advice.append("Weather conditions favorable for most crops")
        
        return ". ".join(advice)
    
    def get_historical_weather(self, location: str, days_back: int = 30) -> Dict:
        """Get historical weather data"""
        try:
            # Generate simulated historical data
            historical_data = []
            for i in range(days_back):
                day_data = self._get_simulated_weather(location)
                # Add some historical variation
                day_data['temperature'] += np.random.uniform(-5, 5)
                day_data['rainfall'] = max(0, day_data['rainfall'] + np.random.uniform(-30, 30))
                historical_data.append(day_data)
            
            return {
                'location': location,
                'historical_data': historical_data,
                'period_days': days_back,
                'source': 'simulated'
            }
            
        except Exception as e:
            logger.error(f"❌ Historical weather error: {e}")
            return {
                'location': location,
                'historical_data': [],
                'period_days': days_back,
                'source': 'fallback'
            }