# This file makes the utils directory a Python package
from .gemini_client import GeminiAIClient
from .direct_gemini_client import DirectGeminiClient

__all__ = ['GeminiAIClient', 'DirectGeminiClient']