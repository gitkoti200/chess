import React from 'react';
import './Card.css';

const Card = ({ title, content, image, footer }) => {
  return (
    <div className="card">
      {image && (
        <div className="card-image">
          <img src={image} alt={title} />
        </div>
      )}
      <div className="card-content">
        {title && <h2 className="card-title">{title}</h2>}
        <div className="card-body">{content}</div>
        {footer && <div className="card-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Card;