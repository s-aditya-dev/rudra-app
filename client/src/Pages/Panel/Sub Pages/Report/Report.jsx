import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import newRequest from "../../../../utils/newRequest.js";
import * as XLSX from 'xlsx';
import './Report.css';
import ExcelIcon from './Excel.jsx'
import Loader from "../../../../Components/Loader/Loader.jsx";

function Report() {
  const { isLoading, error, data } = useQuery({
    queryKey: ["managers", "clients"],
    queryFn: () =>
      newRequest.get("/clientVisits/managers").then((res) => res.data),
  });

  const { isLoading: isLoadingClients, error: errorClients, data: dataClients } = useQuery({
    queryKey: ["clients"],
    queryFn: () =>
      newRequest.get("/clients").then((res) => res.data),
  });

  const [managers, setManagers] = useState([]);
  const [selectedRadio, setSelectedRadio] = useState("all-clients");
  const [selectedType, setSelectedType] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    if (data) {
      setManagers(data);
    }
  }, [data]);

  const handleRadioChange = (event) => {
    setSelectedRadio(event.target.id);
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setSelectedEmployee("");
  };

  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
  };

  const exportToExcel = () => {
    if (!dataClients || dataClients.length === 0) {
      return;
    }

    const filteredData = dataClients.filter(client => {
      const lastVisit = client.clientVisits[client.clientVisits.length - 1] || {};
      if (selectedType === "closing" && lastVisit.closingManager !== selectedEmployee) return false;
      if (selectedType === "source" && lastVisit.sourcingManager !== selectedEmployee) return false;
      if (selectedType === "relation" && lastVisit.relationshipManager !== selectedEmployee) return false;
      return true;
    });

    const formattedData = filteredData.map(client => {
      const lastVisit = client.clientVisits[client.clientVisits.length - 1] || {};

      return {
        "Name": `${client.firstName} ${client.lastName}`,
        "Contact": client.contact || '',
        "Alt Contact": client.altContact || '',
        "Requirement": client.requirement || '',
        "Budget": client.budget || '',
        "Reference": lastVisit.referenceBy || '',
        "Sourcing": lastVisit.sourcingManager || '',
        "Relationship": lastVisit.relationshipManager || '',
        "Closing": lastVisit.closingManager || '',
        "Status": lastVisit.status || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, "Client_Report.xlsx");
  };

  if (isLoading || isLoadingClients) {
    return <Loader />;
  }
  
  if (error || errorClients) {
    return <Loader message={`Something went wrong: ${error?.message || errorClients?.message}`} />;
  }

  return (
    <div className="report-container">
      <h2>Reports</h2>
      <div className="client-report">
        <div className="bg">
          <ExcelIcon/>
          <h3>Client Report</h3>
        </div>
        <div className="controls flex">
          <div className="flex w-100">
            <div className="input-container">
              <input
                type="radio"
                name="clients"
                id="all-clients"
                checked={selectedRadio === "all-clients"}
                onChange={handleRadioChange}
              />
              <label htmlFor="all-clients">All Clients</label>
            </div>
            <div className="input-container">
              <input
                type="radio"
                name="clients"
                id="specific-clients"
                checked={selectedRadio === "specific-clients"}
                onChange={handleRadioChange}
              />
              <label htmlFor="specific-clients">Specific Clients</label>
            </div>
          </div>

          {selectedRadio === "specific-clients" && (
            <div className="drop-down active flex w-100">
              <div className="w-45 input-down">
                <label htmlFor="Type">Type:</label>
                <select
                  className="w-100"
                  id="Type"
                  value={selectedType}
                  onChange={handleTypeChange}
                >
                  <option value="" disabled>
                    Type
                  </option>
                  <option value="source">Source</option>
                  <option value="relation">Relation</option>
                  <option value="closing">Closing</option>
                </select>
              </div>

              <div className="w-45 input-down">
                <label htmlFor="Employee">Employee:</label>
                <select
                  className="w-100"
                  id="Employee"
                  value={selectedEmployee}
                  onChange={handleEmployeeChange}
                >
                  <option value="" disabled>
                    Employee
                  </option>
                  {managers.filter(manager => manager.manager === selectedType).map(manager => (
                    <option key={manager._id} value={manager.firstName}>
                      {manager.firstName} {manager.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button className="download" onClick={exportToExcel}>Download</button>
        </div>
      </div>
    </div>
  );
}

export default Report;
