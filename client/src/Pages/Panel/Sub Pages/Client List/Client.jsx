import React, { useState, useEffect } from "react";
import "./Client.css";
import newRequest from "../../../../utils/newRequest.js";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link, useParams } from "react-router-dom";
import Loader from "../../../../Components/Loader/Loader.jsx";
import { NoData, NoFilterData } from "../../../../Assets/no-data.jsx";
import FilterPopover from "./FilterPopover"; // Import the popover component
import {
  getDisplayName,
  searchFields,
  formatBudget,
  formatDate,
  getStatusClass,
} from "./utils";
import ClientRow from "./ClientRow";
import { searchSVG, filterSVG, clearSVG } from "./ClientSVG";

function ClientList() {
  const navigate = useNavigate();
  const { pageno } = useParams();

  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [activeClientId, setActiveClientId] = useState(null);
  const [filters, setFilters] = useState(null); // State for filters
  const [isPopoverVisible, setIsPopoverVisible] = useState(false); // State for popover visibility
  const [currentPage, setCurrentPage] = useState(pageno);
  const [searchPage, setSearchPage] = useState(pageno);

  // let selectedCheckboxes = []; // Declare a variable outside to store the selected checkboxes

  // const handleCheckboxChange = (e) => {
  //   const { name, checked } = e.target;

  //   // Update the selectedCheckboxes array directly
  //   if (checked) {
  //     if (!selectedCheckboxes.includes(name)) {
  //       selectedCheckboxes.push(name);
  //     }
  //   } else {
  //     selectedCheckboxes = selectedCheckboxes.filter((item) => item !== name);
  //   }

  //   // Use Set to ensure only unique values
  //   const uniqueStatuses = [...new Set(selectedCheckboxes)];

  //   applyFilters({
  //     startDate: null,
  //     endDate: null,
  //     minBudget: 0,
  //     maxBudget: 0,
  //     selectedStatuses: uniqueStatuses,
  //     selectedManager1: null,
  //     selectedManager2: null,
  //     selectedManager3: null,
  //     selectedRequirements: [],
  //   });
  // };

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const {
    isLoading: isClientLoading,
    error: clientError,
    data: clientData,
  } = useQuery({
    queryKey:
      currentUser.admin || currentUser.manager === "sales head"
        ? ["clients"]
        : ["userClients", currentUser.manager, currentUser.username],
    queryFn: () =>
      newRequest
        .get(
          currentUser.admin || currentUser.manager === "sales head"
            ? "/clients"
            : `/user-clients?managerType=${currentUser.manager}&firstName=${currentUser.username}`
        )
        .then((res) => res.data)
        .catch((error) => {
          if (error.response && error.response.status === 403) {
            return [];
          } else {
            console.error("Error fetching clients:", error);
            throw error;
          }
        }),
  });

  const {
    isLoading: isManagerLoading,
    error: managerError,
    data: managerData,
  } = useQuery({
    queryKey: ["managers"],
    queryFn: () =>
      newRequest.get("/clientVisits/managers").then((res) => res.data),
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
    setActiveClientId((prevClientId) =>
      prevClientId === clientId ? null : clientId
    );
  };

  const handleResetPageNo = () => {
    setCurrentPage(1);
    setSearchPage(1);
    navigate(`/panel/client-list/1`);
  };

  const toggleSortOrder = () => {
    setSortNewestFirst(!sortNewestFirst);
    handleResetPageNo();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    handleResetPageNo();
  };

  const applyFilters = (filters) => {
    setFilters(filters);
    setIsPopoverVisible(false);
    handleResetPageNo();
  };

  const handleOpenPopover = () => {
    setIsPopoverVisible(true);
  };

  const handleClosePopover = () => {
    setIsPopoverVisible(false);
  };

  const clearFilters = () => {
    setFilters(null);
    setSearchTerm("");
    handleResetPageNo();
  };

  const filteredClients = clients
    .filter((client) => searchFields(client, searchTerm, managers))
    .filter((client) => {
      console.log(filters);
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
        if (
          client.budget < filters.minBudget ||
          client.budget > filters.maxBudget
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.selectedStatuses.length > 0) {
        if (
          !lastVisit ||
          !filters.selectedStatuses.includes(lastVisit.status)
        ) {
          return false;
        }
      }

      // Manager filters
      if (lastVisit) {
        if (
          filters.selectedManager1 &&
          lastVisit.sourcingManager !== filters.selectedManager1
        )
          return false;
        if (
          filters.selectedManager2 &&
          lastVisit.relationshipManager !== filters.selectedManager2
        )
          return false;
        if (
          filters.selectedManager3 &&
          lastVisit.closingManager !== filters.selectedManager3
        )
          return false;
      } else return false;

      // Requirements filter
      if (filters.selectedRequirements.length > 0) {
        if (!filters.selectedRequirements.includes(client.requirement)) {
          return false;
        }
      }

      // setCurrentPage(1);

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

  const recordsPerPage = 10;
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = sortedClients.slice(firstIndex, lastIndex);
  const npages = Math.ceil(sortedClients.length / recordsPerPage);

  function handleNextPage() {
    if (currentPage < npages) {
      setCurrentPage(+currentPage + 1);
      setSearchPage(+currentPage + 1);
      navigate(`/panel/client-list/${+currentPage + 1}`);
    }
  }

  function handlePreviousPage() {
    if (currentPage > 1) {
      setCurrentPage(+currentPage - 1);
      setSearchPage(+currentPage - 1);
      navigate(`/panel/client-list/${+currentPage - 1}`);
    }
  }

  function handleNthPage(nthPageNumber) {
    if (
      nthPageNumber !== currentPage &&
      nthPageNumber >= 1 &&
      nthPageNumber <= npages
    ) {
      setCurrentPage(nthPageNumber);
      setSearchPage(nthPageNumber);
      navigate(`/panel/client-list/${nthPageNumber}`);
    }
  }

  const handleSearchPageChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setSearchPage("");
      return;
    }

    const parsedValue = Number(value);

    if (!isNaN(parsedValue)) {
      if (parsedValue >= 1 && parsedValue <= npages) {
        setSearchPage(parsedValue);
        handleNthPage(parsedValue);
      } else if (parsedValue < 1) {
        setSearchPage(1);
        handleNthPage(1);
      } else if (parsedValue > npages) {
        setSearchPage(npages);
        handleNthPage(npages);
      }
    }
  };

  const handleKeyDown = (e) => {
    let value = e.target.value;
    let parsedValue = Number(value);

    if (e.key === "ArrowUp") {
      // Increment value when up arrow is pressed
      if (!isNaN(parsedValue) && parsedValue < npages) {
        parsedValue += 1;
        setSearchPage(parsedValue);
        handleNthPage(parsedValue);
      }
    } else if (e.key === "ArrowDown") {
      // Decrement value when down arrow is pressed
      if (!isNaN(parsedValue) && parsedValue > 1) {
        parsedValue -= 1;
        setSearchPage(parsedValue);
        handleNthPage(parsedValue);
      }
    }
  };

  if (isClientLoading || isManagerLoading) {
    return <Loader />;
  }

  if (clientError || managerError) {
    return (
      <Loader
        message={`Something went wrong: ${
          clientError?.message || managerError.message
        }`}
      />
    );
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
            {searchSVG}
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
              {filterSVG}
            </button>

            {(filters || searchTerm) && (
              <button onClick={() => clearFilters()}>
                CLEAR
                {clearSVG}
              </button>
            )}
            <FilterPopover
              isOpen={isPopoverVisible}
              onClose={handleClosePopover}
              onApplyFilters={applyFilters}
              managers={managers}
            />
          </div>
        </div>

        {/* <div className="checkboxFilter">
          <label htmlFor="hotCheckbox">Hot</label>
          <input
            type="checkbox"
            name="hot"
            id="hotCheckbox"
            // checked={selectedCheckboxes.includes("hot")}
            onChange={handleCheckboxChange}
          />

          <label htmlFor="warmCheckbox">Warm</label>
          <input
            type="checkbox"
            name="warm"
            id="warmCheckbox"
            // checked={selectedCheckboxes.includes("warm")}
            onChange={handleCheckboxChange}
          />

          <label htmlFor="coldCheckbox">Cold</label>
          <input
            type="checkbox"
            name="cold"
            id="coldCheckbox"
            // checked={selectedCheckboxes.includes("cold")}
            onChange={handleCheckboxChange}
          />

          <label htmlFor="bookedCheckbox">Booked</label>
          <input
            type="checkbox"
            name="booked"
            id="bookedCheckbox"
            // checked={selectedCheckboxes.includes("booked")}
            onChange={handleCheckboxChange}
          />

          <label htmlFor="lostCheckbox">Lost</label>
          <input
            type="checkbox"
            name="lost"
            id="lostCheckbox"
            // checked={selectedCheckboxes.includes("lost")}
            onChange={handleCheckboxChange}
          />
        </div> */}

        <div className="controls">
          <button className="order-sort" onClick={() => toggleSortOrder()}>
            <span className="material-symbols-rounded">
              {sortNewestFirst ? "arrow_downward" : "arrow_upward"}
            </span>
          </button>
          <div className="pagination">
            <button onClick={() => handlePreviousPage()}>
              <span className="material-symbols-rounded">chevron_left</span>
            </button>
            <button onClick={() => handleNthPage(1)}>1</button>
            <input
              type="text"
              value={searchPage}
              onChange={handleSearchPageChange}
              onKeyDown={handleKeyDown}
              maxLength={4}
            />
            <button onClick={() => handleNthPage(npages)}>{npages}</button>
            <button onClick={() => handleNextPage()}>
              <span className="material-symbols-rounded">chevron_right</span>
            </button>
          </div>
          {/* {currentUser.admin ? (<Link to="/panel/dump-client-list"><button>Dump</button></Link>) : null} */}
          {currentUser.admin ? (
            <Link to="/panel/new-client-list">
              <button>New Clients</button>
            </Link>
          ) : null}
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
            {records.map((client) => (
              <ClientRow
                key={client._id}
                client={client}
                activeClientId={activeClientId}
                onRowClick={handleRowClick}
                managers={managers}
                currPage={currentPage}
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

      <div className="client-table-footer">
        <div className="counter">{`Page No: ${currentPage}`}</div>
        <div className="counter">
          {currentPage >= 1 && currentPage <= npages
            ? `Record Count: ${firstIndex + 1}-${Math.min(
                lastIndex,
                filteredClients.length
              )} of ${filteredClients.length}`
            : "Records: 0 of 0"}
        </div>
      </div>
    </div>
  );
}

export default ClientList;
