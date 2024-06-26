import React, { useState, useEffect } from "react";
import "./Form.css";
import { useNavigate } from "react-router-dom";
import newRequest from "../../../../utils/newRequest.js";
import { useQuery } from "@tanstack/react-query";

const ClientListForm = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["managers"],
    queryFn: () =>
      newRequest.get("/clientVisits/managers").then((res) => {
        return res.data;
      }),
  });

  const [managers, setManagers] = useState([]);

  useEffect(() => {
    if (data) {
      setManagers(
        data.map((manager) => ({
          ...manager,
        }))
      );
    }
  }, [data]);

  const [user, setUser] = useState({
    clientId: null,
    firstName: "",
    lastName: "",
    address: "",
    occupation: "",
    contact: "",
    altContact: "",
    email: "",
    requirement: "",
    budget: "",
    note: "",
  });

  const [visitsourceData, setVisitsourceData] = useState({
    time: "",
    date: "",
    referenceBy: "",
    sourcingManager: "",
    relationshipManager: "",
    closingManager: "",
    status: "",
    visitRemark: "",
  });

  const [budgetType, setBudgetType] = useState("");
  const [clientID, setClientID] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleVisitChange = (e) => {
    setVisitsourceData((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleBudgetTypeChange = (e) => {
    setBudgetType(e.target.value);
  };


  const validateForm = () => {
    const nameRegex = /^[A-Za-z]{3,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const contactRegex = /^\d{10}$/;
    const budgetRegex = /^(?!0\d)\d*(\.\d+)?$/;
    const newErrors = {};

    // Validate first and last names
    if (!user.firstName || !user.lastName) {
      newErrors.name = "First and last names are required";
    } else if (!nameRegex.test(user.firstName) || !nameRegex.test(user.lastName)) {
      newErrors.name = "Names must contain only letters and be at least 3 characters long";
    } else {
      // Validate occupation
      if (!user.occupation) {
        newErrors.occupation = "Occupation is required";
      } else {
        // Validate contact
        if (!user.contact) {
          newErrors.contact = "Contact number is required";
        } else if (!contactRegex.test(user.contact)) {
          newErrors.contact = "Contact number must be exactly 10 digits";
        } else {

          if (user.altContact && !contactRegex.test(user.altContact)) {
            newErrors.contact = "Please enter the valid alt contact";
          } else {
            // Validate email
            if (!user.email) {
              newErrors.email = "Email is required";
            } else if (!emailRegex.test(user.email)) {
              newErrors.email = "Email must be valid";
            } else {
              // Validate address
              if (!user.address) {
                newErrors.address = "Address is required";
              } else {
                // Validate requirement
                if (!user.requirement) {
                  newErrors.requirement = "Requirement is required";
                } else {
                  // Validate budget
                  if (!user.budget) {
                    newErrors.budget = "Budget is required";
                  } else if (!budgetRegex.test(user.budget)) {
                    newErrors.budget = "Enter a valid budget";
                  } else {
                    if (!document.getElementById('budget-type').value) {
                      newErrors.budget = "Budget Type is required";
                    } else {
                      // Validate visit date
                      if (!visitsourceData.date) {
                        newErrors.date = "Visit date is required";
                      } else if (!visitsourceData.time) {
                        newErrors.date = "Visit time is required";
                      } else {
                        // Validate referenceBy
                        if (!visitsourceData.referenceBy) {
                          newErrors.referenceBy = "Reference is required";
                        } else {
                          // Validate sourcing manager
                          if (!visitsourceData.sourcingManager) {
                            newErrors.sourcingManager = "Sourcing manager is required";
                          } else {
                            // Validate relationship manager
                            if (!visitsourceData.relationshipManager) {
                              newErrors.relationshipManager = "Relationship manager is required";
                            } else {
                              // Validate closing manager
                              if (!visitsourceData.closingManager) {
                                newErrors.closingManager = "Closing manager is required";
                              } else {
                                // Validate status
                                if (!visitsourceData.status) {
                                  newErrors.status = "Status is required";
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleCombinedSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let budget = parseFloat(user.budget);
    user.contact = parseInt(user.contact);

    if (user.altContact) {
      user.altContact = parseInt(user.altContact);
    }

    if (isNaN(budget)) {
      alert("Please enter a valid number for the budget.");
      return;
    }

    if (budgetType === "K") {
      user.budget = budget * 1000;
    } else if (budgetType === "Lac") {
      user.budget = budget * 100000;
    } else if (budgetType === "Cr") {
      user.budget = budget * 10000000;
    }

    try {
      const response = await newRequest.post("/clients", {
        ...user,
      });
      setClientID(response.data._id);

      await newRequest.post(`/clients/${response.data._id}/clientVisits`, {
        ...visitsourceData,
      });

      navigate("/panel");
    } catch (err) {
      console.log(err);
    }

    e.target.reset();
  };

  return (
    <div className="form-container">
      <form className="client-form" onSubmit={handleCombinedSubmit}>
        <div className="personal-info">
          <div className="name input-container">
            <label htmlFor="firstName">Name:</label>
            <div className="flex">
              <input
                type="text"
                className="w-45"
                id="firstName"
                placeholder="Enter First Name"
                name="firstName"
                onChange={handleChange}
              />
              <input
                type="text"
                className="w-45"
                id="lastName"
                placeholder="Enter Last Name"
                name="lastName"
                onChange={handleChange}
              />
            </div>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="occupation input-container full-flex">
            <label htmlFor="occupation">Occupation:</label>
            <input
              type="text"
              id="occupation"
              placeholder="Occupation"
              name="occupation"
              onChange={handleChange}
            />
            {errors.occupation && <span className="error">{errors.occupation}</span>}
          </div>
        </div>

        <div className="contact">
          <div className="phone input-container">
            <label htmlFor="phone">Phone:</label>
            <div className="div flex">
              <input
                type="text"
                className="w-45"
                id="phone"
                placeholder="Phone Number"
                name="contact"
                onChange={handleChange}
              />
              <input
                type="text"
                className="w-45"
                id="altPhone"
                placeholder="Alt Number"
                name="altContact"
                onChange={handleChange}
              />
            </div>
            {errors.contact && <span className="error">{errors.contact}</span>}
          </div>
          <div className="email input-container full-flex">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              id="email"
              placeholder="Email"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="address input-container full-flex">
            <label htmlFor="address">Address:</label>
            <textarea
              id="address"
              name="address"
              onChange={handleChange}
              placeholder="Address"
            ></textarea>
            {errors.address && <span className="error">{errors.address}</span>}
          </div>
        </div>

        <div className="interests">
          <div className="flex">
            <div className="w-45 requirement input-container">
              <label htmlFor="requirement">Requirement:</label>
              <select
                name="requirement"
                onChange={handleChange}
                className="w-100"
                id="requirement"
              >
                <option value="" disabled selected>
                  Select Requirement
                </option>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="2.5BHK">2.5BHK</option>
                <option value="3.5BHK">3.5BHK</option>
                <option value="4.5BHK">4.5BHK</option>
                <option value="SHOP">SHOP</option>
                <option value="OFFICE">OFFICE</option>
              </select>
              {errors.requirement && <span className="error">{errors.requirement}</span>}
            </div>
            <div className="w-45 budget input-container">
              <label htmlFor="budget">Budget:</label>
              <div className="flex">
                <input
                  className="w-45"
                  type="text"
                  name="budget"
                  onChange={handleChange}
                  id="budget"
                  placeholder="Budget"
                />
                <select className="w-45" id="budget-type" onChange={handleBudgetTypeChange}>
                  <option value="" disabled selected>Type</option>
                  <option value="K">K</option>
                  <option value="Lac">Lac</option>
                  <option value="Cr">Cr</option>
                </select>
              </div>
              {errors.budget && <span className="error">{errors.budget}</span>}
            </div>
          </div>
          <div className="note input-container full-flex">
            <label htmlFor="note">Note:</label>
            <textarea
              className="w-100"
              id="note"
              name="note"
              onChange={handleChange}
              placeholder="Note"
            ></textarea>
          </div>
        </div>

        <div className={`AddVisit`}>
          <div className="date-time-container sp-w-100 input-container">
            <label htmlFor="visitDate">Date Time:</label>
            <div className="flex date-time sp-w-100">
              <input
                name="date"
                onChange={handleVisitChange}
                type="date"
                id="visitDate"
                className="w-45"
              />
              <input
                name="time"
                onChange={handleVisitChange}
                type="time"
                id="visitTime"
                className="w-45"
              />
            </div>
            {errors.date && <span className="error">{errors.date}</span>}
          </div>

          <div className="reference-container sp-w-100 input-container">
            <label htmlFor="reference">Reference by:</label>
            <input
              type="text"
              id="reference"
              name="referenceBy"
              onChange={handleVisitChange}
              placeholder="Enter Reference"
            />
            {errors.referenceBy && <span className="error">{errors.referenceBy}</span>}
          </div>

          <div className="drop-down flex">
            <div className="source-container sp-w-100 input-container">
              <label htmlFor="source">Source:</label>
              <select
                id="source"
                onChange={handleVisitChange}
                name="sourcingManager"
              >
                <option value="" disabled selected>
                  Select Source
                </option>

                {managers.map(
                  (manager) =>
                    manager.manager === "source" && (
                      <option key={manager._id} value={manager.firstName}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    )
                )}
              </select>
              {errors.sourcingManager && <span className="error">{errors.sourcingManager}</span>}
            </div>

            <div className="relation-container sp-w-100 input-container">
              <label htmlFor="relation">Relation:</label>
              <select
                id="relation"
                onChange={handleVisitChange}
                name="relationshipManager"
              >
                <option value="" disabled selected>
                  Select Relation
                </option>
                {managers.map(
                  (manager) =>
                    manager.manager === "relation" && (
                      <option key={manager._id} value={manager.firstName}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    )
                )}
              </select>
              {errors.relationshipManager && <span className="error">{errors.relationshipManager}</span>}
            </div>

            <div className="closing-container sp-w-100 input-container">
              <label htmlFor="closing">Closing:</label>
              <select
                id="closing"
                onChange={handleVisitChange}
                name="closingManager"
              >
                <option value="" disabled selected>
                  Select Closing
                </option>
                {managers.map(
                  (manager) =>
                    manager.manager === "closing" && (
                      <option key={manager._id} value={manager.firstName}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    )
                )}
              </select>
              {errors.closingManager && <span className="error">{errors.closingManager}</span>}
            </div>

            <div className="status-container sp-w-100 input-container">
              <label htmlFor="status">Status:</label>
              <select
                id="status"
                onChange={handleVisitChange}
                name="status"
              >
                <option value="" disabled selected>
                  Select Status
                </option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
                <option value="lost">Lost</option>
                <option value="booked">Booked</option>
              </select>
              {errors.status && <span className="error">{errors.status}</span>}
            </div>
          </div>

          <div className="remark input-container sp-w-100 w-100">
            <label htmlFor="remark">Remark:</label>
            <textarea
              onChange={handleVisitChange}
              name="visitRemark"
              id="remark"
              placeholder="Enter your remark"
            ></textarea>
          </div>
        </div>

        <div className="controls flex">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default ClientListForm;
