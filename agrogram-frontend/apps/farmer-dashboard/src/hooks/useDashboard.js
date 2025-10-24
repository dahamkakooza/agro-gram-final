// src/hooks/useDashboard.js
import { useState, useEffect } from 'react';
import { dashboardService } from '../services';

/**
 * Custom hook for dashboard data fetching
 */
export const useDashboard = (dashboardType) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await dashboardService.getDashboard(dashboardType);
        
        if (mounted) {
          if (response.success) {
            setData(response.data);
          } else {
            throw new Error(response.error || 'Failed to fetch dashboard data');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          // Set fallback data
          const mockResponse = dashboardService.getMockDashboard(dashboardType);
          setData(mockResponse.data);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (dashboardType) {
      fetchData();
    }

    return () => {
      mounted = false;
    };
  }, [dashboardType]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    // The useEffect will trigger again due to loading state change
  };

  return {
    data,
    loading,
    error,
    refetch,
    hasData: !loading && !error && data,
    hasError: !loading && error,
  };
};

export default useDashboard;