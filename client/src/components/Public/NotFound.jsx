
import React from 'react';
import { Link } from 'react-router-dom';


const NotFound = () => {
  return (
    <div className="container">
      <h1 className="heading">404 - Page Not Found</h1>
      <p className="message">Sorry, the page you are looking for doesn't exist.</p>
      <Link to="/" className="link">Go Back to Home</Link>
    </div>
  );
};

export default NotFound;
