import React from 'react';
import './Badge.css';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'medium',
  className = '',
  ...props 
}) => {
  const getVariantClass = () => {
    const variants = {
      default: 'badge--default',
      primary: 'badge--primary',
      secondary: 'badge--secondary',
      success: 'badge--success',
      error: 'badge--error',
      warning: 'badge--warning',
      info: 'badge--info',
      outline: 'badge--outline'
    };
    return variants[variant] || variants.default;
  };

  const getSizeClass = () => {
    const sizes = {
      small: 'badge--small',
      medium: 'badge--medium',
      large: 'badge--large'
    };
    return sizes[size] || sizes.medium;
  };

  return (
    <span 
      className={`badge ${getVariantClass()} ${getSizeClass()} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;