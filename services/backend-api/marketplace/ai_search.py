# marketplace/ai_search.py
import pandas as pd
import numpy as np
import joblib
import os
from typing import Dict, List, Optional, Tuple
from django.conf import settings
from django.db.models import Q, F, Value, FloatField
from django.db.models.functions import Concat
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from .models import ProductListing, PricePrediction, UserPreference, SearchQueryLog
import logging
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests
import json

logger = logging.getLogger(__name__)

class PromptBasedSearchAI:
    """AI-powered search engine for agricultural products"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.price_model = None
        self._load_models()
    
    def _load_models(self):
        """Load ML models for search and price prediction"""
        model_dir = os.path.join(settings.BASE_DIR, 'marketplace', 'models')
        os.makedirs(model_dir, exist_ok=True)
        
        # Load or initialize price prediction model
        price_model_path = os.path.join(model_dir, 'price_predictor.joblib')
        if os.path.exists(price_model_path):
            self.price_model = joblib.load(price_model_path)
        else:
            self._initialize_price_model()
    
    def _initialize_price_model(self):
        """Initialize price prediction model with sample data"""
        # This would be trained on historical price data
        self.price_model = RandomForestRegressor(n_estimators=100, random_state=42)
        
        # Sample training data - replace with real historical data
        X_train = np.random.rand(100, 5)  # Features: season, demand, supply, weather, location
        y_train = np.random.uniform(10, 100, 100)  # Prices
        
        self.price_model.fit(X_train, y_train)
    
    def search_products(self, query: str, user=None, filters: Dict = None, limit: int = 20) -> Dict:
        """
        AI-powered product search with semantic understanding
        """
        # Log the search query
        self._log_search_query(query, user, filters)
        
        # Parse natural language query
        parsed_query = self._parse_natural_language(query)
        
        # Get base queryset
        queryset = ProductListing.objects.filter(status='AVAILABLE')
        
        # Apply semantic search
        results = self._semantic_search(queryset, parsed_query, user)
        
        # Apply filters
        if filters:
            results = self._apply_filters(results, filters)
        
        # Apply personalization
        if user:
            results = self._apply_personalization(results, user)
        
        # Get price predictions for results
        enhanced_results = self._enhance_with_predictions(results[:limit])
        
        return {
            'query': query,
            'parsed_query': parsed_query,
            'results': enhanced_results,
            'total_count': len(results),
            'suggestions': self._get_search_suggestions(parsed_query)
        }
    
    def _parse_natural_language(self, query: str) -> Dict:
        """Parse natural language query into structured filters"""
        query = query.lower().strip()
        parsed = {
            'keywords': [],
            'category': None,
            'price_range': None,
            'quality': None,
            'location': None
        }
        
        # Extract price mentions
        price_indicators = ['cheap', 'expensive', 'affordable', 'budget', 'premium']
        for indicator in price_indicators:
            if indicator in query:
                if indicator in ['cheap', 'affordable', 'budget']:
                    parsed['price_range'] = 'low'
                else:
                    parsed['price_range'] = 'high'
        
        # Extract quality mentions
        quality_terms = {
            'premium': 'PREMIUM',
            'organic': 'PREMIUM',
            'high quality': 'PREMIUM',
            'standard': 'STANDARD',
            'economy': 'ECONOMY',
            'budget': 'ECONOMY'
        }
        
        for term, quality in quality_terms.items():
            if term in query:
                parsed['quality'] = quality
                break
        
        # Extract location mentions (simple implementation)
        location_indicators = ['near', 'in', 'from', 'local']
        words = query.split()
        for i, word in enumerate(words):
            if word in location_indicators and i + 1 < len(words):
                parsed['location'] = words[i + 1]
                break
        
        # Extract main keywords
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        parsed['keywords'] = [word for word in words if word not in stop_words and len(word) > 2]
        
        return parsed
    
    def _semantic_search(self, queryset, parsed_query: Dict, user=None):
        """Perform semantic search using multiple strategies"""
        
        # Strategy 1: Full-text search with PostgreSQL
        if parsed_query['keywords']:
            search_query = SearchQuery(' '.join(parsed_query['keywords']))
            search_vector = SearchVector('title', 'description', 'search_keywords')
            queryset = queryset.annotate(
                search=search_vector,
                rank=SearchRank(search_vector, search_query)
            ).filter(search=search_query).order_by('-rank')
        
        # Strategy 2: Category matching
        if parsed_query['category']:
            queryset = queryset.filter(
                Q(category__name__icontains=parsed_query['category']) |
                Q(category__keywords__contains=[parsed_query['category']])
            )
        
        # Strategy 3: Quality filter
        if parsed_query['quality']:
            queryset = queryset.filter(quality_grade=parsed_query['quality'])
        
        # Strategy 4: Location-based filtering
        if parsed_query['location']:
            queryset = queryset.filter(location__icontains=parsed_query['location'])
        
        return queryset
    
    def _apply_filters(self, queryset, filters: Dict):
        """Apply additional filters from user"""
        if 'category' in filters:
            queryset = queryset.filter(category_id=filters['category'])
        
        if 'min_price' in filters:
            queryset = queryset.filter(price__gte=filters['min_price'])
        
        if 'max_price' in filters:
            queryset = queryset.filter(price__lte=filters['max_price'])
        
        if 'quality' in filters:
            queryset = queryset.filter(quality_grade=filters['quality'])
        
        if 'location' in filters:
            queryset = queryset.filter(location__icontains=filters['location'])
        
        return queryset
    
    def _apply_personalization(self, queryset, user):
        """Apply user preferences to search results"""
        try:
            preferences = UserPreference.objects.get(user=user)
            
            # Boost preferred categories
            if preferences.preferred_categories.exists():
                preferred_categories = preferences.preferred_categories.values_list('id', flat=True)
                queryset = queryset.annotate(
                    preference_boost=models.Case(
                        models.When(category_id__in=preferred_categories, then=Value(1.2)),
                        default=Value(1.0),
                        output_field=FloatField()
                    )
                )
            
            # Apply price range preferences
            if preferences.price_range_min and preferences.price_range_max:
                queryset = queryset.filter(
                    price__gte=preferences.price_range_min,
                    price__lte=preferences.price_range_max
                )
            
            # Apply quality preference
            if preferences.quality_preference:
                queryset = queryset.filter(quality_grade=preferences.quality_preference)
            
        except UserPreference.DoesNotExist:
            pass
        
        return queryset
    
    def _enhance_with_predictions(self, products):
        """Add price predictions and market insights to search results"""
        enhanced_products = []
        
        for product in products:
            enhanced_product = {
                'id': product.id,
                'title': product.title,
                'description': product.description,
                'current_price': float(product.price),
                'predicted_price': self._predict_price(product),
                'price_trend': float(product.price_trend),
                'demand_score': product.demand_score,
                'quality_grade': product.quality_grade,
                'location': product.location,
                'farmer': product.farmer.email,
                'image_url': product.image.url if product.image else None,
                'market_insights': self._get_market_insights(product)
            }
            enhanced_products.append(enhanced_product)
        
        return enhanced_products
    
    def _predict_price(self, product) -> float:
        """Predict future price for a product"""
        try:
            # Features for price prediction
            features = np.array([[
                product.demand_score,
                self._get_seasonal_factor(),
                self._get_market_volatility(),
                product.quality_grade == 'PREMIUM',  # 1 for premium, 0 otherwise
                self._get_location_factor(product.location)
            ]])
            
            predicted_price = self.price_model.predict(features)[0]
            return max(float(predicted_price), 0.1)  # Ensure positive price
            
        except Exception as e:
            logger.error(f"Price prediction error: {e}")
            return float(product.price)  # Fallback to current price
    
    def _get_market_insights(self, product) -> Dict:
        """Get market insights for a product"""
        insights = {
            'demand_level': 'Medium',
            'price_stability': 'Stable',
            'best_time_to_buy': 'Now',
            'supply_outlook': 'Adequate'
        }
        
        # Simple logic - replace with real market analysis
        if product.demand_score > 0.7:
            insights['demand_level'] = 'High'
            insights['best_time_to_buy'] = 'Soon (prices may rise)'
        elif product.demand_score < 0.3:
            insights['demand_level'] = 'Low'
            insights['best_time_to_buy'] = 'Good time to buy'
        
        if abs(product.price_trend) > 5:
            insights['price_stability'] = 'Volatile'
        
        return insights
    
    def _get_seasonal_factor(self) -> float:
        """Get seasonal adjustment factor"""
        month = datetime.now().month
        # Simple seasonal pattern - enhance with real data
        seasonal_factors = {
            1: 1.1, 2: 1.0, 3: 0.9, 4: 0.8, 5: 0.9, 6: 1.0,
            7: 1.1, 8: 1.2, 9: 1.1, 10: 1.0, 11: 0.9, 12: 1.0
        }
        return seasonal_factors.get(month, 1.0)
    
    def _get_market_volatility(self) -> float:
        """Get current market volatility factor"""
        return 0.1  # Placeholder - implement real volatility calculation
    
    def _get_location_factor(self, location: str) -> float:
        """Get location-based price factor"""
        # Simple implementation - enhance with real geographic data
        if not location:
            return 1.0
        
        location = location.lower()
        if 'urban' in location or 'city' in location:
            return 1.2  # Higher prices in urban areas
        elif 'rural' in location or 'village' in location:
            return 0.9  # Lower prices in rural areas
        
        return 1.0
    
    def _log_search_query(self, query: str, user, filters: Dict):
        """Log search queries for analytics and improvement"""
        try:
            SearchQueryLog.objects.create(
                user=user,
                query=query,
                results_count=0,  # Will be updated after search
                filters_used=filters or {}
            )
        except Exception as e:
            logger.error(f"Failed to log search query: {e}")
    
    def _get_search_suggestions(self, parsed_query: Dict) -> List[str]:
        """Get search suggestions based on parsed query"""
        suggestions = []
        
        if parsed_query['keywords']:
            base_query = ' '.join(parsed_query['keywords'])
            suggestions.extend([
                f"{base_query} organic",
                f"{base_query} premium quality",
                f"{base_query} bulk purchase",
                f"fresh {base_query}",
                f"local {base_query}"
            ])
        
        return suggestions[:5]

class PricePredictor:
    """Advanced price prediction system"""
    
    def __init__(self):
        self.search_ai = PromptBasedSearchAI()
    
    def predict_market_prices(self, crop_type: str, region: str, days_ahead: int = 30) -> Dict:
        """Predict market prices for a specific crop and region"""
        try:
            # Check for existing prediction
            existing_prediction = PricePrediction.objects.filter(
                crop_type=crop_type,
                region=region,
                prediction_horizon=days_ahead,
                prediction_date=datetime.now().date()
            ).first()
            
            if existing_prediction:
                return {
                    'crop_type': crop_type,
                    'region': region,
                    'predicted_price': float(existing_prediction.predicted_price),
                    'confidence': existing_prediction.confidence,
                    'horizon_days': days_ahead,
                    'factors': existing_prediction.factors,
                    'source': 'cached'
                }
            
            # Generate new prediction
            prediction = self._generate_price_prediction(crop_type, region, days_ahead)
            
            # Store prediction
            PricePrediction.objects.create(
                crop_type=crop_type,
                region=region,
                predicted_price=prediction['predicted_price'],
                confidence=prediction['confidence'],
                prediction_date=datetime.now().date(),
                prediction_horizon=days_ahead,
                factors=prediction['factors']
            )
            
            prediction['source'] = 'new_prediction'
            return prediction
            
        except Exception as e:
            logger.error(f"Price prediction failed: {e}")
            return {
                'crop_type': crop_type,
                'region': region,
                'error': 'Prediction unavailable',
                'horizon_days': days_ahead
            }
    
    def _generate_price_prediction(self, crop_type: str, region: str, days_ahead: int) -> Dict:
        """Generate price prediction using multiple factors"""
        # This would integrate with real market data APIs
        base_price = self._get_current_market_price(crop_type, region)
        
        # Factors affecting price
        seasonal_factor = self._get_seasonal_factor()
        demand_trend = self._get_demand_trend(crop_type)
        supply_outlook = self._get_supply_outlook(crop_type, region)
        weather_impact = self._get_weather_impact(region)
        
        # Simple prediction model
        predicted_price = base_price * seasonal_factor * demand_trend * supply_outlook * weather_impact
        
        # Confidence calculation
        confidence = max(0.1, 0.8 - (days_ahead / 100))  # Lower confidence for longer horizons
        
        return {
            'predicted_price': round(float(predicted_price), 2),
            'confidence': confidence,
            'factors': {
                'seasonal_impact': seasonal_factor,
                'demand_trend': demand_trend,
                'supply_outlook': supply_outlook,
                'weather_impact': weather_impact,
                'base_price': base_price
            }
        }
    
    def _get_current_market_price(self, crop_type: str, region: str) -> float:
        """Get current market price for a crop"""
        # This would query real market data APIs
        # Placeholder implementation
        base_prices = {
            'maize': 150.0,
            'wheat': 180.0,
            'rice': 200.0,
            'beans': 300.0,
            'tomatoes': 250.0
        }
        return base_prices.get(crop_type.lower(), 100.0)
    
    def _get_demand_trend(self, crop_type: str) -> float:
        """Get demand trend factor"""
        # Placeholder - implement real demand analysis
        return 1.05  # Slight upward trend
    
    def _get_supply_outlook(self, crop_type: str, region: str) -> float:
        """Get supply outlook factor"""
        # Placeholder - implement real supply analysis
        return 0.98  # Slight supply constraint
    
    def _get_weather_impact(self, region: str) -> float:
        """Get weather impact factor"""
        # Placeholder - implement real weather impact analysis
        return 1.02  # Slight positive weather impact
