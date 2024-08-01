import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./Nav.css";

const Nav = ({ toggleSideMenu, activeLink, toggleDarkMode, darkMode, currentUser, backPath }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackClick = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1); // Default to browser back if no custom path is set
    }
  };


  return (
    <nav className="nav">
      <button id="menu-btn" onClick={toggleSideMenu}>
        <span className="material-icons-sharp">menu</span>
      </button>

      <div className="controls">
        <button id='back-btn' className={backPath ? 'active' : ''} onClick={handleBackClick}>
          <span className="material-symbols-rounded">
            arrow_back
          </span>
        </button>

        <button id='refresh-btn'>
          <span className="material-symbols-rounded">
            refresh
          </span>
        </button>
      </div>

      <h1 className="CurrContentHeading">{activeLink}</h1>

      <div className="dark-mode" onClick={toggleDarkMode}>
        <span className={`material-icons-sharp ${!darkMode ? 'active' : ''}`}>light_mode</span>
        <span className={`material-icons-sharp ${darkMode ? 'active' : ''}`}>dark_mode</span>
      </div>
      <div className="profile">
        <div className="info">
          <p>
            Hey, <b>{currentUser?.firstName ?? 'Guest'}</b>
          </p>
          <small className="text-muted">{currentUser?.admin ? 'Admin' : currentUser ? 'User' : 'Unknown'}</small>
        </div>
        <div className="profile-photo">
          <img
            src='https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'
            alt="Profile"
          />
        </div>
      </div>
    </nav>
  );
};

export default Nav;
