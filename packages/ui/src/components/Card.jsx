import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title, 
  className = '', 
  padding = 'medium',
  ...props 
}) => {
  const paddingClass = `card--padding-${padding}`;
  
  return (
    <div className={`card ${paddingClass} ${className}`} {...props}>
      {title && <h3 className="card__title">{title}</h3>}
      <div className="card__content">
        {children}
      </div>
    </div>
  );
};

export default Card;