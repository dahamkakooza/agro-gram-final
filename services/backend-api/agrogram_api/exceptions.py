# services/backend-api/agrogram_api/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST framework
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Add custom error format
        response.data = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': response.data.get('detail', 'An error occurred'),
                'details': response.data
            }
        }
    else:
        # Handle uncaught exceptions
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        response = Response({
            'success': False,
            'error': {
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'Internal server error',
                'details': str(exc) if settings.DEBUG else 'An unexpected error occurred'
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response

def bad_request(request, exception):
    return Response({
        'success': False,
        'error': {
            'code': 400,
            'message': 'Bad request',
            'details': 'The request could not be understood by the server'
        }
    }, status=400)

def permission_denied(request, exception):
    return Response({
        'success': False,
        'error': {
            'code': 403,
            'message': 'Permission denied',
            'details': 'You do not have permission to perform this action'
        }
    }, status=403)

def page_not_found(request, exception):
    return Response({
        'success': False,
        'error': {
            'code': 404,
            'message': 'Resource not found',
            'details': 'The requested resource was not found on this server'
        }
    }, status=404)

def server_error(request):
    return Response({
        'success': False,
        'error': {
            'code': 500,
            'message': 'Internal server error',
            'details': 'An unexpected error occurred on the server'
        }
    }, status=500)
