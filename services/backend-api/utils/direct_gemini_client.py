import requests
import os
import json
from typing import Optional

class DirectGeminiClient:
    """
    Direct HTTP client for Gemini AI (bypasses the Python library)
    """
    def __init__(self, model_name: str = 'models/gemini-2.5-flash-preview-05-20'):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model_name = model_name
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
    
    def generate_text(self, prompt: str, max_tokens: Optional[int] = None) -> str:
        """
        Generate text using direct HTTP API calls
        """
        url = f"{self.base_url}/{self.model_name}:generateContent?key={self.api_key}"
        
        # Build payload
        generation_config = {}
        if max_tokens:
            generation_config['maxOutputTokens'] = max_tokens
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        
        if generation_config:
            payload["generationConfig"] = generation_config
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract text from response
            if 'candidates' in data and len(data['candidates']) > 0:
                return data['candidates'][0]['content']['parts'][0]['text']
            else:
                return "No response generated"
            
        except requests.exceptions.RequestException as e:
            return f"API request failed: {str(e)}"
        except (KeyError, IndexError) as e:
            return f"Error parsing response: {str(e)}"
        except Exception as e:
            return f"Unexpected error: {str(e)}"
    
    def get_agriculture_advice(self, question: str, crop: str = "", region: str = "") -> str:
        """
        Get agriculture-specific advice with context
        """
        contextual_prompt = f"""
        You are an agricultural expert helping farmers in {region} with {crop} cultivation.
        
        Question: {question}
        
        Please provide practical, actionable advice suitable for {region} region.
        Focus on cost-effective solutions and local best practices.
        Keep the response clear and helpful.
        """
        
        return self.generate_text(contextual_prompt)

# Export the client
direct_gemini_client = DirectGeminiClient()