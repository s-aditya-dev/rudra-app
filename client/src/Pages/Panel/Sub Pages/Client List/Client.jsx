import React, { useState, useEffect } from "react";
import "./Client.css";
import newRequest from "../../../../utils/newRequest.js";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Loader from "../../../../Components/Loader/Loader.jsx";
import { NoData, NoFilterData } from "../../../../Assets/no-data.jsx";
import FilterPopover from './FilterPopover'; // Import the popover component
import { getDisplayName, searchFields, formatBudget, formatDate, getStatusClass } from './utils';
import ClientRow from './ClientRow';

function ClientList() {
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [activeClientId, setActiveClientId] = useState(null);
  const [filters, setFilters] = useState(null); // State for filters
  const [isPopoverVisible, setIsPopoverVisible] = useState(false); // State for popover visibility

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { isLoading: isClientLoading, error: clientError, data: clientData } = useQuery({
    queryKey: currentUser.admin || currentUser.manager === 'sales head' ? ["clients"] : ["userClients", currentUser.manager, currentUser.username],
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

  const handleRowClick = (clientId) => {
    setActiveClientId(prevClientId => prevClientId === clientId ? null : clientId);
  };

  const toggleSortOrder = () => {
    setSortNewestFirst(!sortNewestFirst);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const applyFilters = (filters) => {
    setFilters(filters);
    setIsPopoverVisible(false); // Hide the popover after applying filters
  };

  const handleOpenPopover = () => {
    setIsPopoverVisible(true);
  };

  const handleClosePopover = () => {
    setIsPopoverVisible(false);
  };

  const clearFilters = () => {
    setFilters(null);
  };

  const filteredClients = clients
    .filter((client) => searchFields(client, searchTerm, managers))
    .filter((client) => {
      if (!filters) return true;

      const lastVisit = client.clientVisits[client.clientVisits.length - 1];

      // Date range filter
      if (filters.startDate && filters.endDate) {
        const visitDate = new Date(lastVisit?.date);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        if (visitDate < startDate || visitDate > endDate) {
          return false;
        }
      }

      // Budget filter
      if (filters.minBudget && filters.maxBudget) {
        if (client.budget < filters.minBudget || client.budget > filters.maxBudget) {
          return false;
        }
      }

      // Status filter
      if (filters.selectedStatuses.length > 0) {
        if (!lastVisit || !filters.selectedStatuses.includes(lastVisit.status)) {
          return false;
        }
      }

      // Manager filters
      console.log(`Source:${filters.selectedManager1},Relation:${filters.selectedManager2},c:${filters.selectedManager3}`)
      if (lastVisit) {
        if (filters.selectedManager1 && lastVisit.sourcingManager !== filters.selectedManager1) return false;
        if (filters.selectedManager2 && lastVisit.relationshipManager !== filters.selectedManager2) return false;
        if (filters.selectedManager3 && lastVisit.closingManager !== filters.selectedManager3) return false;
      } else return false;

      // Requirements filter
      if (filters.selectedRequirements.length > 0) {
        if (!filters.selectedRequirements.includes(client.requirement)) {
          return false;
        }
      }

      return true;
    });

  const sortedClients = filteredClients.sort((a, b) => {
    const lastVisitA = a.clientVisits[a.clientVisits.length - 1];
    const lastVisitB = b.clientVisits[b.clientVisits.length - 1];

    if (!lastVisitA && !lastVisitB) return 0;
    if (!lastVisitA) return sortNewestFirst ? 1 : -1;
    if (!lastVisitB) return sortNewestFirst ? -1 : 1;

    return sortNewestFirst
      ? new Date(lastVisitB.date) - new Date(lastVisitA.date)
      : new Date(lastVisitA.date) - new Date(lastVisitB.date);
  });

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

  return (
    <div className="client-table">
      <div className="client-table-header">
        <div className="filter-section">
          <div className="searchbar">
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
              <g>
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
              </g>
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search..."
            />
          </div>

          <div className="filter-btns">
            <button onClick={handleOpenPopover}>
              FILTERS
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="var(--color-background)"><path d="M252.21-192q-15.21 0-25.71-10.35T216-228v-204h-35.79q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.39-25.71 10.38-10.5 25.74-10.5h144.52q15.35 0 25.85 10.29 10.5 10.29 10.5 25.5t-10.49 25.71Q340.01-432 324.5-432H288v204q0 15.3-10.29 25.65Q267.42-192 252.21-192Zm0-384q-15.21 0-25.71-10.35T216-612v-120q0-15.3 10.29-25.65Q236.58-768 251.79-768t25.71 10.35Q288-747.3 288-732v120q0 15.3-10.29 25.65Q267.42-576 252.21-576Zm156.07 0q-15.28 0-25.78-10.29-10.5-10.29-10.5-25.5t10.35-25.71Q392.7-648 408-648h36v-84q0-15.3 10.29-25.65Q464.58-768 479.79-768t25.71 10.35Q516-747.3 516-732v84h35.79q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.33 25.71-10.34 10.5-25.61 10.5H408.28Zm71.93 384q-15.21 0-25.71-10.35T444-228v-240.4q0-14.6 10.29-25.1 10.29-10.5 25.5-10.5t25.71 10.35Q516-483.3 516-468v240.4q0 14.6-10.29 25.1-10.29 10.5-25.5 10.5Zm228 0q-15.21 0-25.71-10.35T672-228v-84h-37q-15.3 0-25.65-10.29Q599-332.58 599-347.79t10.39-25.71q10.38-10.5 25.74-10.5h144.52q15.35 0 25.85 10.29 10.5 10.29 10.5 25.5t-10.35 25.71Q795.3-312 780-312h-36v84q0 15.3-10.29 25.65Q723.42-192 708.21-192Zm0-264q-15.21 0-25.71-10.35T672-492v-240.4q0-14.6 10.29-25.1 10.29-10.5 25.5-10.5t25.71 10.35Q744-747.3 744-732v240.4q0 14.6-10.29 25.1-10.29 10.5-25.5 10.5Z" /></svg>
            </button>

            {filters &&
              <button onClick={clearFilters}>
                CLEAR
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="var(--color-background)"><path d="m569-492-51-52 125-152H366l-72-72h450q14.89 0 21.45 13.5Q772-741 763-729L569-492Zm-41 162v114q0 10.2-6.88 17.1-6.89 6.9-17.06 6.9h-47.88Q446-192 439-198.9t-7-17.1v-210L115.03-742.97Q104-754 104-768.67q0-14.66 11-25.33 10.67-11 25.33-11 14.67 0 25.77 11.1l627.8 627.8Q805-155 805-141q0 14-11 25.48Q783-105 768.5-105T743-116L528-330Zm-10-214Z" /></svg>
              </button>}
            <FilterPopover
              isOpen={isPopoverVisible}
              onClose={handleClosePopover}
              onApplyFilters={applyFilters}
              managers={managers} />
          </div>
        </div>
        <div className="counter">{`Record Count: ${filteredClients.length}`}</div>
        <div className="controls">
          <button className="order-sort" onClick={toggleSortOrder}>
            <span className="material-symbols-rounded">swap_vert</span>
          </button>
          {currentUser.admin ? (<Link to="/panel/dump-client-list"><button>Dump</button></Link>) : null}
          {currentUser.admin ? (<Link to="/panel/new-client-list"><button>New Clients</button></Link>) : null}
          <Link to="/panel/form">
            <button>Add Client</button>
          </Link>
        </div>
      </div>

      {filteredClients.length ? (
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
            {sortedClients.map((client) => (
              <ClientRow
                key={client._id}
                client={client}
                activeClientId={activeClientId}
                onRowClick={handleRowClick}
                managers={managers}
              />
            ))}
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

export default ClientList;
