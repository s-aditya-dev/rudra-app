import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import newRequest from "../../utils/newRequest.js";
import "./Panel.css";

import Sidebar from "../../Components/Sidebar/Sidebar.jsx";
import Nav from "../../Components/Nav/Nav.jsx";
import Maintenance from "../../Components/Maintenance/Maintenance.jsx";
import Unauthorized from "../../Components/Unauthorized/Unauthorized.jsx";

import UserList from "./Sub Pages/Users/User-list.jsx";
import ClientList from "./Sub Pages/Client List/Client.jsx";
import ClientListForm from "./Sub Pages/Form/Form.jsx";
import ClientDetails from "./Sub Pages/Client Details/Client Details.jsx";
import AddUser from './Sub Pages/AddUser/AddUser.jsx';
import AddVisit from "./Sub Pages/AddVisit/AddVisit.jsx";
import Report from "./Sub Pages/Report/Report.jsx";

const Panel = () => {
  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      await newRequest.post("/auth/logout");
      localStorage.removeItem("currentUser");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
      localStorage.removeItem("currentUser");
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  const links = [
    // {
    //   name: "Dashboard",
    //   path: "dashboard",
    //   icon: "dashboard",
    //   roles: ["admin", "user"],
    // },
    // {
    //   name: "Analytics",
    //   path: "analytics",
    //   icon: "insights",
    //   roles: ["admin", "user"],
    // },
    { name: "Users", path: "users", icon: "person_outline", roles: ["admin"] },
    {
      name: "Client List",
      path: "client-list",
      icon: "list_alt",
      roles: ["admin", "user"],
    },
    {
      name: "Form",
      path: "form",
      icon: "receipt_long",
      roles: ["admin", "user"],
    },
    // { name: "Task", path: "task", icon: "inventory", roles: ["admin", "user"] },
    {
      name: "Reports",
      path: "reports",
      icon: "report_gmailerrorred",
      roles: ["admin"],
    },
    // { name: "Page", path: "page", icon: "newspaper", roles: ["admin"] },
    // {
    //   name: "Tickets",
    //   path: "tickets",
    //   icon: "mail_outline",
    //   roles: ["admin"],
    // },
    // { name: 'Settings', path: 'settings', icon: 'settings', roles: ['admin', 'user'] },
  ];

  const componentMapping = {
    dashboard: Maintenance,
    analytics: AddVisit,
    users: UserList,
    "add-user": AddUser,
    "client-list": ClientList,
    "client-details/:id": ClientDetails,
    form: ClientListForm,
    task: Maintenance,
    reports: Report,
    page: Maintenance,
    tickets: Maintenance,
    "": ClientList,
    "*": Maintenance,
  };

  const [sideMenuVisible, setSideMenuVisible] = useState(true);

  const toggleSideMenu = () => {
    setSideMenuVisible(!sideMenuVisible);
  };



  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('dark-mode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevDarkMode => {
      const newDarkMode = !prevDarkMode;
      localStorage.setItem('dark-mode', JSON.stringify(newDarkMode));
      return newDarkMode;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);



  if (!currentUser) {
    return <Unauthorized />;
  }

  const filteredLinks = links.filter((link) =>
    currentUser.admin
      ? link.roles.includes("admin")
      : link.roles.includes("user")
  );

  return (
    <div className="container">
      <Sidebar
        links={filteredLinks}
        handleLogout={handleLogout}
        sideMenuVisible={sideMenuVisible}
        toggleSideMenu={toggleSideMenu}
      />
      <main className="main-content">
        <Routes>
          {Object.keys(componentMapping).map((path) => (
            <Route
              key={path}
              path={path}
              element={React.createElement(componentMapping[path])}
            />
          ))}
        </Routes>
      </main>
      <Nav
        toggleSideMenu={toggleSideMenu}
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Panel;
