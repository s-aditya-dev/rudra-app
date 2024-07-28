import React, { useState, useEffect } from "react";
import "./NewClient.css";
import newRequest from "../../../../utils/newRequest.js";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Loader from "../../../../Components/Loader/Loader.jsx";
import { NoData, NoFilterData } from "../../../../Assets/no-data.jsx";

export const NewClients = () => {
  // State Initialization with Unique Names
  const [newClients, setNewClients] = useState([]);
  const [newManagers, setNewManagers] = useState([]);
  const [newSearchTerm, setNewSearchTerm] = useState("");
  const [newSortNewestFirst, setNewSortNewestFirst] = useState(true);
  const [newActiveClientId, setNewActiveClientId] = useState(null);

  // Current User
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Data Fetching with Unique Query Keys and Functions
  const { isLoading: isNewClientLoading, error: newClientError, data: newClientData, refetch: refetchNewClients } = useQuery({
    queryKey: ["newClients"], // Depend on showLost state
    queryFn: () => newRequest.get(`/dump-clients/newClients`)
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

  const { isLoading: isNewManagerLoading, error: newManagerError, data: newManagerData } = useQuery({
    queryKey: ["newManagers"],
    queryFn: () => newRequest.get("/dump-clients/newClients").then((res) => res.data)
  });

  // Helper Functions with Unique Names

  const searchNewFields = (client, term) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const termLower = term.toLowerCase();

    return (
      (client.clientId && client.clientId.toString().toLowerCase().includes(termLower)) ||
      fullName.includes(termLower) ||
      (client.occupation && client.occupation.toLowerCase().includes(termLower)) ||
      (client.requirement && client.requirement.toLowerCase().includes(termLower)) ||
      (client.budget && client.budget.toString().toLowerCase().includes(termLower))
    );
  };

  const formatNewBudget = (amount) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(3)} Cr`; // Convert to Crore
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)} Lac`; // Convert to Lac
    } else {
      return amount.toFixed(); // No conversion needed, ensure two decimal places
    }
  };

  // Event Handlers with Unique Names
  const handleNewRowClick = (clientId) => {
    setNewActiveClientId(prevClientId => prevClientId === clientId ? null : clientId);
  };

  const toggleNewSortOrder = () => {
    setNewSortNewestFirst(!newSortNewestFirst);
  };

  // Effect Hooks
  useEffect(() => {
    if (newClientData) {
      setNewClients(newClientData);
    }
  }, [newClientData]);

  useEffect(() => {
    if (newManagerData) {
      setNewManagers(newManagerData);
    }
  }, [newManagerData]);

  // Conditional Rendering
  if (isNewClientLoading || isNewManagerLoading) {
    return <Loader />;
  }

  if (newClientError || newManagerError) {
    return <Loader message={`Something went wrong: ${newClientError?.message || newManagerError.message}`} />;
  }

  if (newClientData && !newClientData.length) {
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
  const filteredNewClients = newClients.filter((client) => searchNewFields(client, newSearchTerm));

  const sortedNewClients = filteredNewClients.sort((a, b) => {
    return newSortNewestFirst ? b.clientId - a.clientId : a.clientId - b.clientId;
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
              value={newSearchTerm}
              onChange={(e) => setNewSearchTerm(e.target.value)}
              placeholder="Search..."
            />
          </div>
        </div>
        <div className="counter">{`New Record Count: ${filteredNewClients.length}`}</div>
        <div className="controls">
          <button className="order-sort" onClick={toggleNewSortOrder}>
            <span className="material-symbols-rounded">swap_vert</span>
          </button>
          <Link to="/panel/form">
            <button>Add Client</button>
          </Link>
        </div>
      </div>
      {filteredNewClients.length ? (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Occupation</th>
              <th>Requirement</th>
              <th>Budget</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedNewClients.map((client) => {
              return (
                <tr
                  key={client._id}
                  className={newActiveClientId === client._id ? 'active' : ''}
                >
                  <td data-cell='ID' onClick={() => handleNewRowClick(client._id)}>
                    {client.clientId}
                  </td>
                  <td data-cell='Name' onClick={() => handleNewRowClick(client._id)}>
                    {client.firstName + " " + client.lastName}
                  </td>
                  <td data-cell='Occupation'>{client.occupation}</td>
                  <td data-cell='Budget'>{formatNewBudget(client.budget)}</td>
                  <td data-cell='Requirement'>{client.requirement}</td>
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
