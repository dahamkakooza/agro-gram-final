import google.generativeai as genai
import os
from typing import Optional
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class GeminiAIClient:
    def __init__(self, model_name: str = 'models/gemini-2.5-flash-preview-05-20'):
        """
        Initialize Gemini AI client with REST transport
        """
        # Use Django settings first, then environment variable
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key:
            api_key = os.getenv('GEMINI_API_KEY')
        
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in settings or environment")
            self.available = False
            return
        
        try:
            # FORCE REST TRANSPORT INSTEAD OF gRPC
            genai.configure(
                api_key=api_key,
                transport='rest'  # This fixes the connectivity issue
            )
            
            self.model = genai.GenerativeModel(model_name)
            self.available = True
            logger.info("Gemini AI REST client initialized successfully")
            
        except Exception as e:
            logger.error(f"Gemini AI REST client initialization failed: {e}")
            self.available = False
    
    def generate_text(self, prompt: str, max_tokens: Optional[int] = None) -> str:
        """
        Generate text response using Gemini AI
        """
        if not self.available:
            return "Gemini AI client is not available"
            
        try:
            generation_config = {}
            if max_tokens:
                generation_config['max_output_tokens'] = max_tokens
                
            response = self.model.generate_content(
                prompt, 
                generation_config=generation_config
            )
            
            # Handle different response formats
            if hasattr(response, 'text'):
                return response.text
            elif hasattr(response, 'parts'):
                return ''.join(part.text for part in response.parts if hasattr(part, 'text'))
            elif hasattr(response, 'candidates') and response.candidates:
                return response.candidates[0].content.parts[0].text
            else:
                return str(response)
                
        except Exception as e:
            logger.error(f"Gemini AI generation error: {e}")
            return f"Error generating response: {str(e)}"
    
    def get_agriculture_advice(self, question: str, crop: str = "", region: str = "") -> str:
        """
        Get agriculture-specific advice with context
        """
        contextual_prompt = f"""
        You are an agricultural expert helping farmers in {region} with {crop} cultivation.
        
        Question: {question}
        
        Please provide practical, actionable advice suitable for {region} region.
        Focus on cost-effective solutions and local best practices.
        """
        
        return self.generate_text(contextual_prompt)