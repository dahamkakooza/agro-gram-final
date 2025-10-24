import google.generativeai as genai
import os
from typing import Optional

class GeminiAIClient:
    def __init__(self, model_name: str = 'models/gemini-2.5-flash-preview-05-20'):
        """
        Initialize Gemini AI client with REST transport
        """
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        # 🔥 FORCE REST TRANSPORT INSTEAD OF gRPC
        genai.configure(
            api_key=api_key,
            transport='rest'  # This fixes the connectivity issue
        )
        
        self.model = genai.GenerativeModel(model_name)
        self.available = True
    
    def generate_text(self, prompt: str, max_tokens: Optional[int] = None) -> str:
        """
        Generate text response using Gemini AI
        """
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

# Export the client
gemini_client = GeminiAIClient()