import React, { useState, useEffect } from "react";
import "./Client.css";
import newRequest from "../../../../utils/newRequest.js";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// Util Components
import Loader from "../../../../Components/Loader/Loader.jsx";
import NoData from "../../../../Assets/no-data.jsx"

function ClientList() {
  // State Initialization
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [activeClientId, setActiveClientId] = useState(null);

  // Current User
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Data Fetching
  const { isLoading: isClientLoading, error: clientError, data: clientData } = useQuery({
    queryKey: currentUser.admin || currentUser.manager === 'sales head' ? ["clients"] : ["userClients", currentUser.manager, currentUser.firstName],
    queryFn: () => newRequest.get(currentUser.admin || currentUser.manager === 'sales head' ? "/clients" : `/user-clients?managerType=${currentUser.manager}&firstName=${currentUser.username}`)
      .then((res) => res.data)
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          return [];
        } else {
          console.error("Error fetching clients:", error);
          throw error;
        }
      })
  });

  const { isLoading: isManagerLoading, error: managerError, data: managerData } = useQuery({
    queryKey: ["managers"],
    queryFn: () => newRequest.get("/clientVisits/managers").then((res) => res.data)
  });

  // Helper Functions
  const getDisplayName = (username) => {
    const manager = managers.find(m => m.username === username);
    return manager ? manager.firstName : username;
  };

  const searchFields = (client, term) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const termLower = term.toLowerCase();
    const lastVisit = client.clientVisits[client.clientVisits.length - 1];

    return (
      fullName.includes(termLower) ||
      (client.clientId && client.clientId.toString().toLowerCase().includes(termLower)) ||
      (client.requirement && client.requirement.toLowerCase().includes(termLower)) ||
      (client.budget && client.budget.toString().toLowerCase().includes(termLower)) ||
      (lastVisit &&
        ((lastVisit.referenceBy && lastVisit.referenceBy.toLowerCase().includes(termLower)) ||
          (lastVisit.sourcingManager && lastVisit.sourcingManager.toLowerCase().includes(termLower)) ||
          (lastVisit.relationshipManager && lastVisit.relationshipManager.toLowerCase().includes(termLower)) ||
          (lastVisit.closingManager && lastVisit.closingManager.toLowerCase().includes(termLower)) ||
          (lastVisit.status && lastVisit.status.toLowerCase().includes(termLower))))
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "warm":
        return "status-warm";
      case "cold":
        return "status-cold";
      case "lost":
        return "status-lost";
      case "booked":
        return "status-booked";
      default:
        return "";
    }
  };

  const formatBudget = (amount) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(3)} Cr`; // Convert to Crore
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)} Lac`; // Convert to Lac
    } else {
      return amount.toFixed(); // No conversion needed, ensure two decimal places
    }
  };

  // Event Handlers
  const handleRowClick = (clientId) => {
    setActiveClientId(prevClientId => prevClientId === clientId ? null : clientId);
  };

  const toggleSortOrder = () => {
    setSortNewestFirst(!sortNewestFirst);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Effect Hooks
  useEffect(() => {
    if (clientData) {
      setClients(clientData);
    }
  }, [clientData]);

  useEffect(() => {
    if (managerData) {
      setManagers(managerData);
    }
  }, [managerData]);

  // Conditional Rendering
  if (isClientLoading || isManagerLoading) {
    return <Loader />;
  }

  if (clientError || managerError) {
    return <Loader message={`Something went wrong: ${clientError?.message || managerError.message}`} />;
  }

  if (clientData && !clientData.length) {
    return (
      <div className="empty-client-table">
        <div>
          <NoData />
          <p>No Clients data available</p>
          <Link to="/panel/form">
            <button>Add Client</button>
          </Link>
        </div>
      </div>
    );
  }

  // Data Filtering and Sorting
  const filteredClients = clients.filter((client) => searchFields(client, searchTerm));

  const sortedClients = filteredClients.sort((a, b) => {
    return sortNewestFirst ? b.clientId - a.clientId : a.clientId - b.clientId;
  });

  // Render JSX

  return (
    <div className="client-table">
      <div className="client-table-header">
        <div className="searchbar">
          <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
            </g>
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
          />
        </div>
        <th>{`Record Count: ${filteredClients.length}`}</th>
        <div className="controls">
          <button className="order-sort" onClick={toggleSortOrder}>
            <span className="material-symbols-rounded">swap_vert</span>
          </button>
          <Link to="/panel/form">
            <button>Add Client</button>
          </Link>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Requirement</th>
            <th>Budget</th>
            <th>Reference</th>
            <th>Source</th>
            <th>Relation</th>
            <th>Closing</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedClients.map((client) => {
            const lastVisit = client.clientVisits[client.clientVisits.length - 1];

            return (
              <tr
                key={client._id}
                className={activeClientId === client._id ? 'active' : ''}
              >
                <td data-cell='Client ID' onClick={() => handleRowClick(client._id)}>{client.clientId}</td>
                <td data-cell='Name' onClick={() => handleRowClick(client._id)}>{client.firstName + " " + client.lastName}</td>
                <td data-cell='Requirement'>{client.requirement}</td>
                <td data-cell='Budget'>{formatBudget(client.budget)}</td>
                {lastVisit && (
                  <>
                    <td data-cell='Reference'>{lastVisit.referenceBy}</td>
                    <td data-cell='Source'>{getDisplayName(lastVisit.sourcingManager)}</td>
                    <td data-cell='Relation'>{getDisplayName(lastVisit.relationshipManager)}</td>
                    <td data-cell='Closing'>{getDisplayName(lastVisit.closingManager)}</td>
                    <td data-cell='Status' className={getStatusClass(lastVisit.status)}>{lastVisit.status}</td>
                  </>
                )}
                <td>
                  <Link to={`/panel/client-details/${client._id}`}>
                    <button>
                      <span className="material-symbols-rounded">chevron_right</span>
                    </button>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ClientList;
