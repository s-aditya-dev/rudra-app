import React from 'react';
import { NavLink } from 'react-router-dom';
import "./Sidebar.css";
import RudraLogo from '../../Assets/rudra-logo.jsx';

const Sidebar = ({ links, handleLogout, sideMenuVisible, toggleSideMenu }) => {
  return (
    <aside className={ !sideMenuVisible ? 'active' : '' }>
      <div className="toggle">
        <RudraLogo primaryFill={'var(--color-main)'} logoWidth={'120px'} className="logo"/>
        <div className="close" id="close-btn" onClick={toggleSideMenu}>
          <span className="material-icons-sharp">close</span>
        </div>
      </div>
      <div className="sidebar">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={`/panel/${link.path}`}
            className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
          >
            <span className="material-icons-sharp">{link.icon}</span>
            <h3>{link.name}</h3>
            <span className="message-count"></span>
          </NavLink>
        ))}
        <a className="side-link" onClick={handleLogout}>
          <span className="material-icons-sharp">logout</span>
          <h3>Logout</h3>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
