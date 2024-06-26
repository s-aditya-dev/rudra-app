import React from 'react';
import './Loader.css'

function Loader({ message }) {
  return (
    <div className='loader-container'>
      <div className="loader">
        <p>{ message }</p>
      </div>
    </div>
  );
}

export default Loader;