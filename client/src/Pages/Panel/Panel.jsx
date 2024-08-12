// Panel.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import newRequest from "../../utils/newRequest.js";
import "./Panel.css";

import Sidebar from "../../Components/Sidebar/Sidebar.jsx";
import Nav from "../../Components/Nav/Nav.jsx";
import Maintenance from "../../Components/Maintenance/Maintenance.jsx";
import Unauthorized from "../../Components/Unauthorized/Unauthorized.jsx";

import UserList from "./Sub Pages/Users/User-list.jsx";
import AddUser from "./Sub Pages/AddUser/AddUser.jsx";
import EditUser from "./Sub Pages/EditUser/EditUser.jsx";
import ClientList from "./Sub Pages/Client List/Client.jsx";
import { DumpedClients } from "./Sub Pages/Dump/Dump.jsx";
import { NewClients } from "./Sub Pages/New Client/NewClient.jsx";
import NewClientForm from "./Sub Pages/New Client/NewClientForm.jsx";
import ClientListForm from "./Sub Pages/Form/Form.jsx";
import ClientDetails from "./Sub Pages/Client Details/Client Details.jsx";
import Remark from "./Sub Pages/Remark Details/Remark.jsx";
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
    {
      name: "Users",
      path: "users",
      icon: "person_outline",
      roles: ["admin"],
    },
    {
      name: "Client List",
      path: "client-list/1",
      icon: "list_alt",
      roles: ["admin", "user"],
    },
    // {
    //   name: "Form2",
    //   path: "new-client-form",
    //   icon: "receipt_long",
    //   roles: ["tablet"],
    // },
    {
      name: "Form",
      path: "form",
      icon: "receipt_long",
      roles: ["admin", "user", "tablet"],
    },
    {
      name: "Reports",
      path: "reports",
      icon: "report_gmailerrorred",
      roles: ["admin"],
    },
  ];

  const componentMapping = {
    dashboard: Maintenance,
    analytics: AddVisit,
    users: UserList,
    "add-user": AddUser,
    "edit-user/:id": EditUser,
    "client-list/:pageno": ClientList,
    "dump-client-list": DumpedClients,
    "new-client-list": NewClients,
    "new-client-form": NewClientForm,
    "client-details/:pageno/:id": ClientDetails,
    "client-details/:pageno/:id/remark/:remarkid": Remark,
    form: ClientListForm,
    task: Maintenance,
    reports: Report,
    page: Maintenance,
    tickets: Maintenance,
    "*": Maintenance,
  };

  const [sideMenuVisible, setSideMenuVisible] = useState(true);

  const toggleSideMenu = () => {
    setSideMenuVisible(!sideMenuVisible);
  };

  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("dark-mode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  const toggleDarkMode = () => {
    setDarkMode((prevDarkMode) => {
      const newDarkMode = !prevDarkMode;
      localStorage.setItem("dark-mode", JSON.stringify(newDarkMode));
      return newDarkMode;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  if (!currentUser) {
    return <Unauthorized />;
  }

  const filteredLinks = links.filter((link) => {
    if (!currentUser.deviceType) {
      return currentUser.admin
        ? link.roles.includes("admin")
        : link.roles.includes("user");
    } else {
      return (
        currentUser.deviceType === "office tablet" &&
        link.roles.includes("tablet")
      );
    }
  });

  const defaultComponent =
    currentUser.deviceType === "office tablet" ? ClientListForm : ClientList;

  // Determine the back path based on the current route
  const pathParts = location.pathname.split("/");
  let backPath = null;
  
  if (pathParts.length > 3) {
    const secondSegment = pathParts[2];
    if (secondSegment === "client-details") {
      const pageNumber = pathParts[3];
      const clientId = pathParts[4];
      if (pathParts.length > 5 && pathParts[5] === "remark") {
        // If URL is in the format of `/client-details/:pageno/:id/remark/:remarkid`
        backPath = `client-details/${pageNumber}/${clientId}`;
      } else {
        // If URL is in the format of `/client-details/:pageno/:id`
        backPath = `client-list/${pageNumber}`;
      }
    }
  }
  

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
          <Route path="/" element={React.createElement(defaultComponent)} />
        </Routes>
      </main>
      <Nav
        toggleSideMenu={toggleSideMenu}
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        currentUser={currentUser}
        backPath={backPath} // Pass the determined back path
      />
    </div>
  );
};

export default Panel;
