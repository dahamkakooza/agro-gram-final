# farms/views.py
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Avg, Q, Sum
from django.utils import timezone
from datetime import timedelta
from .models import Farm, Plot, CropHistory, FarmTask, FarmAnalytics
from .serializers import (
    FarmSerializer, FarmCreateSerializer, PlotSerializer, 
    CropHistorySerializer, FarmTaskSerializer, FarmAnalyticsSerializer
)
from users.authentication import FirebaseAuthentication, DebugModeAuthentication
from users.permissions import IsAuthenticatedCustom
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Smart authentication selector
def get_authentication_classes():
    if settings.DEBUG:
        return [FirebaseAuthentication, DebugModeAuthentication]
    else:
        return [FirebaseAuthentication]

class FarmViewSet(viewsets.ModelViewSet):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get_queryset(self):
        return Farm.objects.filter(owner=self.request.user).prefetch_related('plots', 'tasks')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FarmCreateSerializer
        return FarmSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                return Response({
                    "success": True,
                    "message": "Farm created successfully",
                    "data": FarmSerializer(serializer.instance, context=self.get_serializer_context()).data
                }, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Farm creation validation errors: {serializer.errors}")
                return Response({
                    "success": False,
                    "error": "Invalid farm data",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Farm creation error: {e}")
            return Response({
                "success": False,
                "error": "Failed to create farm"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def perform_create(self, serializer):
        farm = serializer.save(owner=self.request.user)
        try:
            FarmAnalytics.objects.create(farm=farm)
        except Exception as e:
            logger.warning(f"Could not create farm analytics: {e}")
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                "success": True,
                "data": {
                    "results": serializer.data,
                    "total_count": queryset.count()
                }
            })
        except Exception as e:
            logger.error(f"Farm list error: {e}")
            return Response({
                "success": True,
                "data": {
                    "results": [],
                    "total_count": 0
                }
            })
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        try:
            farm = self.get_object()
            analytics, created = FarmAnalytics.objects.get_or_create(farm=farm)
            serializer = FarmAnalyticsSerializer(analytics)
            return Response({
                "success": True,
                "data": serializer.data
            })
        except Exception as e:
            logger.error(f"Farm analytics error: {e}")
            return Response({
                "success": False,
                "error": "Failed to fetch farm analytics"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        try:
            farm = self.get_object()
            tasks = farm.tasks.all().order_by('due_date', 'priority')
            serializer = FarmTaskSerializer(tasks, many=True)
            return Response({
                "success": True,
                "data": {
                    "tasks": serializer.data,
                    "total_tasks": tasks.count()
                }
            })
        except Exception as e:
            logger.error(f"Farm tasks error: {e}")
            return Response({
                "success": False,
                "error": "Failed to fetch farm tasks"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def generate_recommendations(self, request, pk=None):
        try:
            farm = self.get_object()
            recommendations = self._generate_farm_recommendations(farm)
            
            return Response({
                "success": True,
                "data": {
                    "recommendations": recommendations,
                    "generated_at": timezone.now().isoformat()
                }
            })
        except Exception as e:
            logger.error(f"Farm recommendations error: {e}")
            return Response({
                "success": False,
                "error": "Failed to generate recommendations"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _generate_farm_recommendations(self, farm):
        recommendations = []
        
        if farm.soil_type:
            soil_recommendations = {
                'LOAMY': "Ideal soil type. Consider crop rotation for optimal yield.",
                'CLAY': "Improve drainage with organic matter. Suitable for rice, cabbage.",
                'SANDY': "Add organic compost to improve water retention. Good for root vegetables.",
                'SILTY': "Excellent for most crops. Monitor nutrient levels regularly.",
                'PEAT': "High organic content. Suitable for potatoes, carrots.",
                'CHALKY': "Add organic matter to improve fertility. Suitable for spinach, cabbage."
            }
            recommendations.append({
                'type': 'soil_management',
                'priority': 'medium',
                'title': f'Soil Management for {farm.get_soil_type_display()} Soil',
                'description': soil_recommendations.get(farm.soil_type, 'Monitor soil health regularly.'),
                'actions': ['Test soil nutrients quarterly', 'Add organic matter annually']
            })
        
        try:
            active_crops = farm.plots.filter(crop_status__in=['PLANTED', 'GROWING']).values_list('current_crop', flat=True)
            if active_crops:
                recommendations.append({
                    'type': 'crop_planning',
                    'priority': 'high',
                    'title': 'Crop Rotation Planning',
                    'description': f'Current crops: {", ".join(set(active_crops))}. Plan next season rotation.',
                    'actions': ['Research complementary crops', 'Schedule planting dates']
                })
        except Exception as e:
            logger.warning(f"Error checking active crops: {e}")
        
        current_month = timezone.now().month
        seasonal_advice = self._get_seasonal_advice(current_month, farm.location)
        if seasonal_advice:
            recommendations.append(seasonal_advice)
        
        return recommendations
    
    def _get_seasonal_advice(self, month, location):
        seasonal_data = {
            1: {'title': 'Winter Planning', 'desc': 'Plan spring crops and prepare soil.'},
            2: {'title': 'Early Spring Prep', 'desc': 'Start seedlings indoors and prepare fields.'},
            3: {'title': 'Spring Planting', 'desc': 'Plant cool-season crops and apply fertilizers.'},
            4: {'title': 'Spring Maintenance', 'desc': 'Monitor growth and manage pests.'},
            5: {'title': 'Late Spring Care', 'desc': 'Irrigation and nutrient management.'},
            6: {'title': 'Summer Harvest', 'desc': 'Harvest early crops and plant summer varieties.'},
            7: {'title': 'Mid-Summer', 'desc': 'Pest control and irrigation management.'},
            8: {'title': 'Late Summer', 'desc': 'Prepare for fall planting.'},
            9: {'title': 'Fall Planting', 'desc': 'Plant cool-season crops for winter.'},
            10: {'title': 'Fall Maintenance', 'desc': 'Soil preparation and cover crops.'},
            11: {'title': 'Late Fall', 'desc': 'Harvest remaining crops and winter preparation.'},
            12: {'title': 'Winter Planning', 'desc': 'Review year and plan for next season.'}
        }
        
        advice = seasonal_data.get(month)
        if advice:
            return {
                'type': 'seasonal_planning',
                'priority': 'medium',
                'title': advice['title'],
                'description': f'{advice["desc"]} Consider local climate in {location}.',
                'actions': ['Check local planting calendar', 'Prepare irrigation systems']
            }
        return None

class PlotViewSet(viewsets.ModelViewSet):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = PlotSerializer
    
    def get_queryset(self):
        return Plot.objects.filter(farm__owner=self.request.user).select_related('farm')
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                return Response({
                    "success": True,
                    "message": "Plot created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Plot creation validation errors: {serializer.errors}")
                return Response({
                    "success": False,
                    "error": "Invalid plot data",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Plot creation error: {e}")
            return Response({
                "success": False,
                "error": "Failed to create plot"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def perform_create(self, serializer):
        farm_id = self.request.data.get('farm')
        try:
            farm = Farm.objects.get(id=farm_id, owner=self.request.user)
            serializer.save(farm=farm)
        except Farm.DoesNotExist:
            raise serializers.ValidationError({"farm": "Farm not found or you don't have permission to access it."})
    
    @action(detail=True, methods=['get'])
    def crop_history(self, request, pk=None):
        try:
            plot = self.get_object()
            history = plot.crop_history.all().order_by('-planting_date')
            serializer = CropHistorySerializer(history, many=True)
            return Response({
                "success": True,
                "data": {
                    "crop_history": serializer.data,
                    "total_records": history.count()
                }
            })
        except Exception as e:
            logger.error(f"Plot crop history error: {e}")
            return Response({
                "success": False,
                "error": "Failed to fetch crop history"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def add_crop(self, request, pk=None):
        try:
            plot = self.get_object()
            serializer = CropHistorySerializer(data=request.data)
            
            if serializer.is_valid():
                crop_history = serializer.save(plot=plot)
                
                plot.current_crop = crop_history.crop_name
                plot.planting_date = crop_history.planting_date
                plot.crop_status = 'PLANTED'
                plot.save()
                
                return Response({
                    "success": True,
                    "message": "Crop added successfully",
                    "data": CropHistorySerializer(crop_history).data
                })
            else:
                logger.error(f"Add crop validation errors: {serializer.errors}")
                return Response({
                    "success": False,
                    "error": "Invalid crop data",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Add crop error: {e}")
            return Response({
                "success": False,
                "error": "Failed to add crop"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FarmTaskViewSet(viewsets.ModelViewSet):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = FarmTaskSerializer
    
    def get_queryset(self):
        return FarmTask.objects.filter(farm__owner=self.request.user).select_related('farm', 'plot')
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                return Response({
                    "success": True,
                    "message": "Task created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Task creation validation errors: {serializer.errors}")
                return Response({
                    "success": False,
                    "error": "Invalid task data",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Task creation error: {e}")
            return Response({
                "success": False,
                "error": "Failed to create task"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def perform_create(self, serializer):
        farm_id = self.request.data.get('farm')
        try:
            farm = Farm.objects.get(id=farm_id, owner=self.request.user)
            
            plot_id = self.request.data.get('plot')
            plot = None
            if plot_id:
                plot = Plot.objects.get(id=plot_id, farm__owner=self.request.user)
            
            serializer.save(farm=farm, plot=plot)
        except Farm.DoesNotExist:
            raise serializers.ValidationError({"farm": "Farm not found or you don't have permission to access it."})
        except Plot.DoesNotExist:
            raise serializers.ValidationError({"plot": "Plot not found or you don't have permission to access it."})
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                "success": True,
                "data": {
                    "results": serializer.data,
                    "total_count": queryset.count()
                }
            })
        except Exception as e:
            logger.error(f"Task list error: {e}")
            return Response({
                "success": True,
                "data": {
                    "results": [],
                    "total_count": 0
                }
            })
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        try:
            task = self.get_object()
            task.status = 'COMPLETED'
            task.completed_date = timezone.now().date()
            task.save()
            
            serializer = self.get_serializer(task)
            return Response({
                "success": True,
                "message": "Task marked as completed",
                "data": serializer.data
            })
        except Exception as e:
            logger.error(f"Mark task completed error: {e}")
            return Response({
                "success": False,
                "error": "Failed to update task"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FarmDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            
            overview = self._get_farm_overview(user)
            recent_activity = self._get_recent_activity(user)
            upcoming_tasks = self._get_upcoming_tasks(user)
            crop_performance = self._get_crop_performance(user)
            alerts = self._get_farm_alerts(user)
            
            dashboard_data = {
                "overview": overview,
                "recent_activity": recent_activity,
                "upcoming_tasks": upcoming_tasks,
                "crop_performance": crop_performance,
                "alerts": alerts
            }
            
            return Response({
                "success": True,
                "data": dashboard_data
            })
            
        except Exception as e:
            logger.error(f"Farm dashboard error: {e}")
            return Response({
                "success": True,
                "data": self._get_empty_dashboard()
            })
    
    def _get_farm_overview(self, user):
        try:
            total_farms = Farm.objects.filter(owner=user).count()
        except Exception as e:
            logger.warning(f"Error getting total farms: {e}")
            total_farms = 0
        
        try:
            total_plots = Plot.objects.filter(farm__owner=user).count()
        except Exception as e:
            logger.warning(f"Error getting total plots: {e}")
            total_plots = 0
        
        try:
            active_crops = Plot.objects.filter(farm__owner=user, crop_status__in=['PLANTED', 'GROWING', 'READY']).count()
        except Exception as e:
            logger.warning(f"Error getting active crops: {e}")
            active_crops = 0
        
        try:
            pending_tasks = FarmTask.objects.filter(farm__owner=user, status='PENDING').count()
        except Exception as e:
            logger.warning(f"Error getting pending tasks: {e}")
            pending_tasks = 0
        
        return {
            "total_farms": total_farms,
            "total_plots": total_plots,
            "active_crops": active_crops,
            "pending_tasks": pending_tasks,
        }
    
    def _get_recent_activity(self, user):
        week_ago = timezone.now() - timedelta(days=7)
        
        recent_crops = []
        recent_tasks = []
        
        try:
            recent_crops = CropHistory.objects.filter(
                plot__farm__owner=user,
                planting_date__gte=week_ago
            )[:5]
            recent_crops = CropHistorySerializer(recent_crops, many=True).data
        except Exception as e:
            logger.warning(f"Error getting recent crops: {e}")
        
        try:
            recent_tasks = FarmTask.objects.filter(
                farm__owner=user,
                created_at__gte=week_ago
            )[:5]
            recent_tasks = FarmTaskSerializer(recent_tasks, many=True).data
        except Exception as e:
            logger.warning(f"Error getting recent tasks: {e}")
        
        return {
            "recent_crops": recent_crops,
            "recent_tasks": recent_tasks
        }
    
    def _get_upcoming_tasks(self, user):
        try:
            next_week = timezone.now().date() + timedelta(days=7)
            tasks = FarmTask.objects.filter(
                farm__owner=user,
                status='PENDING',
                due_date__lte=next_week
            ).order_by('due_date')[:10]
            
            return FarmTaskSerializer(tasks, many=True).data
        except Exception as e:
            logger.warning(f"Error getting upcoming tasks: {e}")
            return []
    
    def _get_crop_performance(self, user):
        try:
            crops = CropHistory.objects.filter(
                plot__farm__owner=user
            ).values('crop_name').annotate(
                avg_yield=Avg('yield_amount'),
                avg_success=Avg('success_score'),
                count=Count('id')
            ).order_by('-avg_success')[:5]
            
            return list(crops)
        except Exception as e:
            logger.warning(f"Error getting crop performance: {e}")
            return []
    
    def _get_farm_alerts(self, user):
        alerts = []
        
        try:
            overdue_tasks = FarmTask.objects.filter(
                farm__owner=user,
                status='PENDING',
                due_date__lt=timezone.now().date()
            ).count()
            
            if overdue_tasks > 0:
                alerts.append({
                    "type": "overdue_tasks",
                    "priority": "high",
                    "message": f"You have {overdue_tasks} overdue tasks",
                    "action": "Review and complete pending tasks"
                })
        except Exception as e:
            logger.warning(f"Error checking overdue tasks: {e}")
        
        try:
            unattended_plots = Plot.objects.filter(
                farm__owner=user,
                crop_status='PLANTED',
                expected_harvest_date__lt=timezone.now().date() + timedelta(days=7)
            ).count()
            
            if unattended_plots > 0:
                alerts.append({
                    "type": "harvest_ready",
                    "priority": "medium",
                    "message": f"{unattended_plots} plots ready for harvest soon",
                    "action": "Schedule harvest activities"
                })
        except Exception as e:
            logger.warning(f"Error checking unattended plots: {e}")
        
        return alerts
    
    def _get_empty_dashboard(self):
        return {
            "overview": {
                "total_farms": 0,
                "total_plots": 0,
                "active_crops": 0,
                "pending_tasks": 0,
            },
            "recent_activity": {
                "recent_crops": [],
                "recent_tasks": []
            },
            "upcoming_tasks": [],
            "crop_performance": [],
            "alerts": []
        }