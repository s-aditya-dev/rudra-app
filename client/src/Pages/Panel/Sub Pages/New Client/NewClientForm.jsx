import React, { useState, useEffect, useRef } from "react";
import "./NewClientForm.css";
import { useNavigate } from "react-router-dom";
import newRequest from "../../../../utils/newRequest.js";
import { useQuery } from "@tanstack/react-query";

const NewClientForm = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["managers"],
    queryFn: () =>
      newRequest.get("/clientVisits/managers").then((res) => res.data),
  });

  const [managers, setManagers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      const sortedManagers = data
        .map((manager) => ({
          ...manager,
        }))
        .sort((a, b) => a.firstName.localeCompare(b.firstName));

      setManagers(sortedManagers);
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

  const [budgetType, setBudgetType] = useState("");
  const [errors, setErrors] = useState({});

  const formRef = useRef(null); // Create a reference for the form

  const handleChange = (e) => {
    setUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBudgetTypeChange = (e) => {
    setBudgetType(e.target.value);
  };

  const validateForm = () => {
    const nameRegex = /^[A-Za-z]{3,}$/;
    const emailRegex = /^(N\/A|[^\s@]+@[^\s@]+\.[^\s@]+)$/;
    const contactRegex = /^\d{10}$/;
    const budgetRegex = /^(?!0\d)\d*(\.\d+)?$/;
    const newErrors = {};

    if (!user.firstName || !user.lastName) {
      newErrors.name = "First and last names are required";
    } else if (!nameRegex.test(user.firstName) || !nameRegex.test(user.lastName)) {
      newErrors.name = "Names must contain only letters and be at least 3 characters long";
    } else if (!user.contact) {
      newErrors.contact = "Contact number is required";
    } else if (!contactRegex.test(user.contact)) {
      newErrors.contact = "Contact number must be exactly 10 digits";
    } else if (user.altContact && !contactRegex.test(user.altContact)) {
      newErrors.contact = "Please enter a valid alt contact";
    } else if (!user.email || !emailRegex.test(user.email)) {
      newErrors.email = "Email must be valid";
    } else if (!user.address) {
      newErrors.address = "Address is required";
    } else if (!user.occupation) {
      newErrors.occupation = "Occupation is required";
    } else if (!user.requirement) {
      newErrors.requirement = "Requirement is required";
    } else if (!user.budget) {
      newErrors.budget = "Budget is required";
    } else if (!budgetRegex.test(user.budget)) {
      newErrors.budget = "Enter a valid budget";
    } else if (!budgetType) {
      newErrors.budget = "Budget Type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

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
      await newRequest.post("/clients", user);
      alert("Submitted successfully!");
      setUser({
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
      setBudgetType("");
      setIsSubmitting(false);
      formRef.current.reset();
    } catch (err) {
      console.log(err);
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setUser({
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
    setBudgetType("");
    setErrors({});
    formRef.current.reset();
  };

  return (
    <div className="new-form-container">
      <h3>Client Form</h3>
      <form className="new-client-form" onSubmit={handleSubmit} ref={formRef}>
        <div className="col30">
          <div className="flex-width-48 name input-container">
            <label htmlFor="firstName">Name:</label>
            <div className="flex w-100">
              <input
                type="text"
                className="w-48"
                id="firstName"
                placeholder="Enter First Name"
                name="firstName"
                onChange={handleChange}
              />
              <input
                type="text"
                className="w-48"
                id="lastName"
                placeholder="Enter Last Name"
                name="lastName"
                onChange={handleChange}
              />
            </div>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="flex-width-48 phone input-container">
            <label htmlFor="phone">Phone:</label>
            <div className="w-100 flex">
              <input
                type="text"
                className="w-48"
                id="phone"
                placeholder="Phone Number"
                name="contact"
                onChange={handleChange}
              />
              <input
                type="text"
                className="w-48"
                id="altPhone"
                placeholder="Alt Number"
                name="altContact"
                onChange={handleChange}
              />
            </div>
            {errors.contact && <span className="error">{errors.contact}</span>}
          </div>
          <div className="email input-container flex-width-48">
            <label htmlFor="text">Email:</label>
            <input
              type="text"
              name="email"
              onChange={handleChange}
              id="email"
              placeholder="Email"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="address input-container flex-width-48">
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

        <div className="col30">
          <div className="occupation input-container flex-width-48">
            <label htmlFor="occupation">Occupation:</label>
            <input
              type="text"
              id="occupation"
              placeholder="Occupation"
              name="occupation"
              onChange={handleChange}
              className="w-100"
            />
            {errors.occupation && <span className="error">{errors.occupation}</span>}
          </div>

          <div className="flex-width-48">
            <div className="w-100 requirement input-container">
              <label htmlFor="requirement">Requirement:</label>
              <select
                name="requirement"
                onChange={handleChange}
                className="w-100"
                id="requirement"
              >
                <option value="" selected>
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
          </div>
          <div className="flex-width-48 w-100 budget input-container">
            <label htmlFor="budget">Budget:</label>
            <div className="flex w-100">
              <input
                className="w-48"
                type="text"
                name="budget"
                onChange={handleChange}
                id="budget"
                placeholder="Budget"
              />
              <select className="w-48" id="budget-type" onChange={handleBudgetTypeChange}>
                <option value="" selected>Type</option>
                <option value="K">K</option>
                <option value="Lac">Lac</option>
                <option value="Cr">Cr</option>
              </select>
            </div>
            {errors.budget && <span className="error">{errors.budget}</span>}
          </div>

          <div className="flex-width-48 input-container note">
            <label htmlFor="note">Note:</label>
            <textarea
              id="note"
              name="note"
              onChange={handleChange}
              placeholder="Note"
              className="w-100"
            ></textarea>
          </div>
        </div>

        <div className="form-buttons w-100 flex">
          <button type="button" onClick={handleClear}>
            Clear
          </button>
          
          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewClientForm;
