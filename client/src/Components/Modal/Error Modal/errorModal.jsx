// ErrorNotification.js
import React from 'react';
import PropTypes from 'prop-types';
import './errorModal.css'; // You can style the notification using CSS

const ErrorNotification = ({ message, onClose }) => {
  return (
    <div className="error-notification">
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

ErrorNotification.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ErrorNotification;
