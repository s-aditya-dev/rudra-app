import React, { useState, useEffect } from "react";
import "./Dump.css";
import newRequest from "../../../../utils/newRequest.js";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Loader from "../../../../Components/Loader/Loader.jsx";
import { NoData, NoFilterData } from "../../../../Assets/no-data.jsx";

export const DumpedClients = () => {
  // State Initialization with Unique Names
  const [dumpedClients, setDumpedClients] = useState([]);
  const [dumpedManagers, setDumpedManagers] = useState([]);
  const [dumpedSearchTerm, setDumpedSearchTerm] = useState("");
  const [dumpedSortNewestFirst, setDumpedSortNewestFirst] = useState(true);
  const [dumpedActiveClientId, setDumpedActiveClientId] = useState(null);
  const [showLost, setShowLost] = useState(false); // New state for toggle

  // Current User
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Data Fetching with Unique Query Keys and Functions
  const { isLoading: isDumpedClientLoading, error: dumpedClientError, data: dumpedClientData, refetch: refetchDumpedClients } = useQuery({
    queryKey: ["dumpedClients", showLost], // Depend on showLost state
    queryFn: () => newRequest.get(`/dump-clients/${showLost ? 'lostClients' : 'dumpClients'}`)
      .then((res) => res.data)
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          return [];
        } else {
          console.error("Error fetching clients:", error);
          throw error;
        }
      }),
    keepPreviousData: true,
  });

  const { isLoading: isDumpedManagerLoading, error: dumpedManagerError, data: dumpedManagerData } = useQuery({
    queryKey: ["dumpedManagers"],
    queryFn: () => newRequest.get("/dump-clients/dumpClients").then((res) => res.data)
  });

  // Helper Functions with Unique Names
  const getDumpedDisplayName = (username) => {
    const manager = dumpedManagers.find(m => m.username === username);
    return manager ? manager.firstName : username;
  };

  const searchDumpedFields = (client, term) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const termLower = term.toLowerCase();
    const lastVisit = client.clientVisits[client.clientVisits.length - 1];

    return (
      fullName.includes(termLower) ||
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

  const getDumpedStatusClass = (status) => {
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

  const formatDumpedBudget = (amount) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(3)} Cr`; // Convert to Crore
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)} Lac`; // Convert to Lac
    } else {
      return amount.toFixed(); // No conversion needed, ensure two decimal places
    }
  };

  const formatDumpedDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: '2-digit' };
    return new Date(date).toLocaleDateString('en-GB', options).replace(/ /g, '-');
  };

  // Event Handlers with Unique Names
  const handleDumpedRowClick = (clientId) => {
    setDumpedActiveClientId(prevClientId => prevClientId === clientId ? null : clientId);
  };

  const toggleDumpedSortOrder = () => {
    setDumpedSortNewestFirst(!dumpedSortNewestFirst);
  };

  const handleDumpedSearchChange = (e) => {
    setDumpedSearchTerm(e.target.value);
  };

  const handleToggleShowLost = () => {
    setShowLost(!showLost);
    refetchDumpedClients();
  };

  // Effect Hooks
  useEffect(() => {
    if (dumpedClientData) {
      setDumpedClients(dumpedClientData);
    }
  }, [dumpedClientData]);

  useEffect(() => {
    if (dumpedManagerData) {
      setDumpedManagers(dumpedManagerData);
    }
  }, [dumpedManagerData]);

  // Conditional Rendering
  if (isDumpedClientLoading || isDumpedManagerLoading) {
    return <Loader />;
  }

  if (dumpedClientError || dumpedManagerError) {
    return <Loader message={`Something went wrong: ${dumpedClientError?.message || dumpedManagerError.message}`} />;
  }

  if (dumpedClientData && !dumpedClientData.length) {
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

  // Data Filtering and Sorting with Unique Variables
  const filteredDumpedClients = dumpedClients.filter((client) => searchDumpedFields(client, dumpedSearchTerm));

  const sortedDumpedClients = filteredDumpedClients.sort((a, b) => {
    return dumpedSortNewestFirst ? b.clientId - a.clientId : a.clientId - b.clientId;
  });

  // Render JSX
  return (
    <div className="dump-table">
      <div className="dump-table-header">
        <div className="left-section">
          <div className="searchbar">
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
              <g>
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
              </g>
            </svg>
            <input
              type="text"
              value={dumpedSearchTerm}
              onChange={(e) => setDumpedSearchTerm(e.target.value)}
              placeholder="Search..."
            />
          </div>
          <div className="btns">
            <button onClick={handleToggleShowLost}>
              {showLost ? "Show Dump" : "Show Lost"}
            </button>
          </div>
        </div>
        <div className="counter">{`${showLost ? "Lost" : "Dump"} Record Count: ${filteredDumpedClients.length}`}</div>
        <div className="controls">
          <button className="order-sort" onClick={toggleDumpedSortOrder}>
            <span className="material-symbols-rounded">swap_vert</span>
          </button>
          <Link to="/panel/form">
            <button>Add Client</button>
          </Link>
        </div>
      </div>
      {filteredDumpedClients.length ? (
        <table>
          <thead>
            <tr>
              <th>Date</th>
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
            {sortedDumpedClients.map((client) => {
              const lastVisit = client.clientVisits[client.clientVisits.length - 1];
              return (
                <tr
                  key={client._id}
                  className={dumpedActiveClientId === client._id ? 'active' : ''}
                >
                  <td data-cell='Last Visit Date' onClick={() => handleDumpedRowClick(client._id)}>
                    {lastVisit ? formatDumpedDate(lastVisit.date) : 'N/A'}
                  </td>
                  <td data-cell='Name' onClick={() => handleDumpedRowClick(client._id)}>
                    {client.firstName + " " + client.lastName}
                  </td>
                  <td data-cell='Requirement'>{client.requirement}</td>
                  <td data-cell='Budget'>{formatDumpedBudget(client.budget)}</td>
                  {lastVisit && (
                    <>
                      <td data-cell='Reference'>{lastVisit.referenceBy}</td>
                      <td data-cell='Source'>{getDumpedDisplayName(lastVisit.sourcingManager)}</td>
                      <td data-cell='Relation'>{getDumpedDisplayName(lastVisit.relationshipManager)}</td>
                      <td data-cell='Closing'>{getDumpedDisplayName(lastVisit.closingManager)}</td>
                      <td data-cell='Status' className={getDumpedStatusClass(lastVisit.status)}>
                        {lastVisit.status}
                      </td>
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
      ) : (
        <div className="empty-data">
          <NoFilterData />
          <p>No data meets the current filter criteria.</p>
        </div>
      )}
    </div>
  );
}
