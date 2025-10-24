// src/components/ui/Chart.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Chart.css';

const Chart = ({
  type = 'line',
  data = [],
  width = '100%',
  height = 300,
  title = '',
  xAxisKey = 'x',
  yAxisKey = 'y',
  colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'],
  showGrid = true,
  showLegend = true,
  animate = true,
  className = '',
  onPointClick,
  timeSeries = false,
  stacked = false,
  theme = 'light'
}) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Chart configuration
  const chartConfig = {
    padding: {
      top: title ? 40 : 20,
      right: showLegend ? 80 : 40,
      bottom: 40,
      left: 60
    },
    grid: {
      color: theme === 'dark' ? '#444' : '#e0e0e0',
      lineWidth: 1
    },
    font: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      size: 12,
      color: theme === 'dark' ? '#fff' : '#333'
    }
  };

  // Calculate dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { width: containerWidth, height: containerHeight } = 
          canvasRef.current.getBoundingClientRect();
        setDimensions({
          width: containerWidth,
          height: containerHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [width, height]);

  // Draw chart
  useEffect(() => {
    if (!canvasRef.current || !dimensions.width || !dimensions.height || data.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width: chartWidth, height: chartHeight } = dimensions;
    const { padding } = chartConfig;

    // Set canvas size
    canvas.width = chartWidth;
    canvas.height = chartHeight;

    // Clear canvas
    ctx.clearRect(0, 0, chartWidth, chartHeight);

    // Calculate chart area
    const chartArea = {
      x: padding.left,
      y: padding.top,
      width: chartWidth - padding.left - padding.right,
      height: chartHeight - padding.top - padding.bottom
    };

    // Draw chart based on type
    switch (type) {
      case 'line':
        drawLineChart(ctx, chartArea);
        break;
      case 'bar':
        drawBarChart(ctx, chartArea);
        break;
      case 'area':
        drawAreaChart(ctx, chartArea);
        break;
      case 'pie':
        drawPieChart(ctx, chartArea);
        break;
      default:
        drawLineChart(ctx, chartArea);
    }

    // Draw title
    if (title) {
      drawTitle(ctx, chartWidth);
    }

    // Draw legend
    if (showLegend && type !== 'pie') {
      drawLegend(ctx, chartArea);
    }

  }, [type, data, dimensions, colors, showGrid, theme]);

  // Helper functions
  const getMaxValue = () => {
    if (type === 'pie') return 100;
    
    let max = 0;
    data.forEach(dataset => {
      dataset.data?.forEach(point => {
        const value = typeof point === 'object' ? point[yAxisKey] : point;
        if (value > max) max = value;
      });
    });
    return max * 1.1; // Add 10% padding
  };

  const getMinValue = () => {
    if (type === 'pie') return 0;
    
    let min = Infinity;
    data.forEach(dataset => {
      dataset.data?.forEach(point => {
        const value = typeof point === 'object' ? point[yAxisKey] : point;
        if (value < min) min = value;
      });
    });
    return min > 0 ? 0 : min * 1.1;
  };

  const getXValues = () => {
    if (data[0]?.data) {
      return data[0].data.map((point, index) => 
        typeof point === 'object' ? point[xAxisKey] : index
      );
    }
    return [];
  };

  const drawGrid = (ctx, chartArea) => {
    if (!showGrid) return;

    const { color, lineWidth } = chartConfig.grid;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([5, 5]);

    // Vertical grid lines
    const xValues = getXValues();
    const xStep = chartArea.width / (xValues.length - 1 || 1);
    
    for (let i = 0; i < xValues.length; i++) {
      const x = chartArea.x + i * xStep;
      ctx.beginPath();
      ctx.moveTo(x, chartArea.y);
      ctx.lineTo(x, chartArea.y + chartArea.height);
      ctx.stroke();
    }

    // Horizontal grid lines
    const maxValue = getMaxValue();
    const minValue = getMinValue();
    const valueRange = maxValue - minValue;
    const gridLines = 5;

    for (let i = 0; i <= gridLines; i++) {
      const y = chartArea.y + chartArea.height - (i / gridLines) * chartArea.height;
      ctx.beginPath();
      ctx.moveTo(chartArea.x, y);
      ctx.lineTo(chartArea.x + chartArea.width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const drawAxes = (ctx, chartArea) => {
    const { color, size } = chartConfig.font;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillStyle = color;
    ctx.font = `${size}px ${chartConfig.font.family}`;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(chartArea.x, chartArea.y);
    ctx.lineTo(chartArea.x, chartArea.y + chartArea.height);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(chartArea.x, chartArea.y + chartArea.height);
    ctx.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
    ctx.stroke();

    // Y-axis labels
    const maxValue = getMaxValue();
    const minValue = getMinValue();
    const valueRange = maxValue - minValue;
    const gridLines = 5;

    for (let i = 0; i <= gridLines; i++) {
      const value = minValue + (i / gridLines) * valueRange;
      const y = chartArea.y + chartArea.height - (i / gridLines) * chartArea.height;
      
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toFixed(1), chartArea.x - 10, y);
    }

    // X-axis labels
    const xValues = getXValues();
    const xStep = chartArea.width / (xValues.length - 1 || 1);

    for (let i = 0; i < xValues.length; i++) {
      const x = chartArea.x + i * xStep;
      const label = xValues[i];
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x, chartArea.y + chartArea.height + 10);
    }
  };

  const drawLineChart = (ctx, chartArea) => {
    drawGrid(ctx, chartArea);
    drawAxes(ctx, chartArea);

    data.forEach((dataset, datasetIndex) => {
      const points = dataset.data || [];
      const color = dataset.color || colors[datasetIndex % colors.length];
      const maxValue = getMaxValue();
      const minValue = getMinValue();
      const valueRange = maxValue - minValue;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.fillStyle = color;
      ctx.beginPath();

      points.forEach((point, pointIndex) => {
        const value = typeof point === 'object' ? point[yAxisKey] : point;
        const x = chartArea.x + (pointIndex / (points.length - 1 || 1)) * chartArea.width;
        const y = chartArea.y + chartArea.height - ((value - minValue) / valueRange) * chartArea.height;

        if (pointIndex === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw points
      points.forEach((point, pointIndex) => {
        const value = typeof point === 'object' ? point[yAxisKey] : point;
        const x = chartArea.x + (pointIndex / (points.length - 1 || 1)) * chartArea.width;
        const y = chartArea.y + chartArea.height - ((value - minValue) / valueRange) * chartArea.height;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  };

  const drawBarChart = (ctx, chartArea) => {
    drawGrid(ctx, chartArea);
    drawAxes(ctx, chartArea);

    const datasets = data;
    const barGroups = datasets[0]?.data?.length || 0;
    const barWidth = (chartArea.width / barGroups) * 0.6;
    const groupWidth = chartArea.width / barGroups;
    const maxValue = getMaxValue();
    const minValue = getMinValue();
    const valueRange = maxValue - minValue;

    datasets.forEach((dataset, datasetIndex) => {
      const points = dataset.data || [];
      const color = dataset.color || colors[datasetIndex % colors.length];

      points.forEach((point, pointIndex) => {
        const value = typeof point === 'object' ? point[yAxisKey] : point;
        const x = chartArea.x + pointIndex * groupWidth + 
                  (groupWidth - barWidth * datasets.length) / 2 + 
                  datasetIndex * barWidth;
        const barHeight = ((value - minValue) / valueRange) * chartArea.height;
        const y = chartArea.y + chartArea.height - barHeight;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Add value label on top of bar
        if (value > 0) {
          ctx.fillStyle = chartConfig.font.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(value, x + barWidth / 2, y - 5);
        }
      });
    });
  };

  const drawAreaChart = (ctx, chartArea) => {
    drawGrid(ctx, chartArea);
    drawAxes(ctx, chartArea);

    data.forEach((dataset, datasetIndex) => {
      const points = dataset.data || [];
      const color = dataset.color || colors[datasetIndex % colors.length];
      const maxValue = getMaxValue();
      const minValue = getMinValue();
      const valueRange = maxValue - minValue;

      ctx.fillStyle = color + '40'; // Add transparency
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      points.forEach((point, pointIndex) => {
        const value = typeof point === 'object' ? point[yAxisKey] : point;
        const x = chartArea.x + (pointIndex / (points.length - 1 || 1)) * chartArea.width;
        const y = chartArea.y + chartArea.height - ((value - minValue) / valueRange) * chartArea.height;

        if (pointIndex === 0) {
          ctx.moveTo(x, chartArea.y + chartArea.height);
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        if (pointIndex === points.length - 1) {
          ctx.lineTo(x, chartArea.y + chartArea.height);
          ctx.closePath();
        }
      });

      ctx.fill();
      ctx.stroke();
    });
  };

  const drawPieChart = (ctx, chartArea) => {
    const centerX = chartArea.x + chartArea.width / 2;
    const centerY = chartArea.y + chartArea.height / 2;
    const radius = Math.min(chartArea.width, chartArea.height) / 2 - 20;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;

    data.forEach((item, index) => {
      const sliceAngle = (2 * Math.PI * item.value) / total;
      const color = item.color || colors[index % colors.length];

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw label
      const labelAngle = startAngle + sliceAngle / 2;
      const labelX = centerX + (radius * 0.7) * Math.cos(labelAngle);
      const labelY = centerY + (radius * 0.7) * Math.sin(labelAngle);

      ctx.fillStyle = chartConfig.font.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold 12px ${chartConfig.font.family}`;
      ctx.fillText(item.label, labelX, labelY);

      // Draw percentage
      const percentX = centerX + (radius * 0.5) * Math.cos(labelAngle);
      const percentY = centerY + (radius * 0.5) * Math.sin(labelAngle);
      ctx.font = `10px ${chartConfig.font.family}`;
      ctx.fillText(`${((item.value / total) * 100).toFixed(1)}%`, percentX, percentY);

      startAngle += sliceAngle;
    });
  };

  const drawTitle = (ctx, chartWidth) => {
    ctx.fillStyle = chartConfig.font.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `bold 16px ${chartConfig.font.family}`;
    ctx.fillText(title, chartWidth / 2, 10);
  };

  const drawLegend = (ctx, chartArea) => {
    const legendX = chartArea.x + chartArea.width + 10;
    let legendY = chartArea.y;

    data.forEach((dataset, index) => {
      const color = dataset.color || colors[index % colors.length];
      const label = dataset.label || `Series ${index + 1}`;

      // Draw color box
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY, 12, 12);

      // Draw label
      ctx.fillStyle = chartConfig.font.color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = `12px ${chartConfig.font.family}`;
      ctx.fillText(label, legendX + 20, legendY);

      legendY += 20;
    });
  };

  const handleMouseMove = (event) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Simple hover detection (you can enhance this)
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  if (!data || data.length === 0) {
    return (
      <div className={`chart-container empty ${className} theme-${theme}`}>
        <div className="chart-placeholder">
          <span className="placeholder-icon">📊</span>
          <span className="placeholder-text">No chart data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`chart-container ${className} theme-${theme}`}>
      <canvas
        ref={canvasRef}
        className="chart-canvas"
        style={{ width, height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {hoveredPoint && (
        <div 
          className="chart-tooltip"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10
          }}
        >
          <div className="tooltip-content">
            <strong>{hoveredPoint.label}</strong>
            <br />
            Value: {hoveredPoint.value}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chart;