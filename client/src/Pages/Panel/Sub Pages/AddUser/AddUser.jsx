import React, { useState } from "react";
import newRequest from "../../../../utils/newRequest.js";
import { useNavigate } from "react-router-dom";
import './AddUser.css';

import Unauthorized from '../../../../Components/Unauthorized/Unauthorized.jsx'

const AddUser = () => {

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    document.getElementById('password').focus()
  };

  console.log(currentUser.manager);

  const [user, setUser] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    admin: false,
    dob_date: "",
    dob_month: "",
    dob_year: "",
    phone: "",
    alt_phone: "",
    address: "",
    pincode: "",
    manager: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdmin = (e) => {
    setUser((prev) => ({
      ...prev,
      admin: e.target.checked,
    }));
  };

  const validate = () => {
    const newErrors = {};

    const nameRegex = /^[A-Za-z]{3,}$/;
    const yearRegex = /^\d{4}$/;
    const pincodeRegex = /^\d{6}$/;
    const phoneRegex = /^\d{10}$/;

    // Helper function to check if a year is a leap year
    const isLeapYear = (year) => {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    };

    // Function to validate day of month
    const validateDay = (day, month, year) => {
      const maxDays = [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return day > 0 && day <= maxDays[month - 1];
    };

    if (!user.firstName || !user.lastName) {
      newErrors.name = "Name is required";
    } else if (!nameRegex.test(user.firstName) || !nameRegex.test(user.lastName)) {
      newErrors.name = "Name must contain only letters and be at least 3 characters long";
    } else {
      if (!user.dob_date || !user.dob_month || !user.dob_year) {
        newErrors.dob = "Complete birth date is required";
      } else if (isNaN(parseInt(user.dob_date, 10)) || isNaN(parseInt(user.dob_month, 10)) || isNaN(parseInt(user.dob_year, 10))) {
        newErrors.dob = "Birth date must be a valid number";
      } else {
        const day = parseInt(user.dob_date, 10);
        const month = parseInt(user.dob_month, 10);
        const year = parseInt(user.dob_year, 10);

        if (month < 1 || month > 12) {
          newErrors.dob = "Month must be between 1 and 12";
        } else if (!validateDay(day, month, year)) {
          newErrors.dob = "Invalid day for the given month and year";
        } else if (!yearRegex.test(year)) {
          newErrors.dob = "Please enter the valid year";
        } else {
          if (!user.address) {
            newErrors.address = "Address is required";
          } else {
            if (!user.pincode || isNaN(parseInt(user.pincode, 10))) {
              newErrors.pincode = "Valid pin code is required";
            } else if (!pincodeRegex.test(user.pincode)) {
              newErrors.pincode = "Pin code must contain exactly 6 digits";
            } else {
              if (!user.phone) {
                newErrors.phone = "Phone number is required";
              } else if (!phoneRegex.test(user.phone)) {
                newErrors.phone = "Phone number must contain exactly 10 digits";
              } else {
                if (!user.email) {
                  newErrors.email = "Email is required";
                } else {
                  if (!user.username) {
                    newErrors.username = "Username is required";
                  } else {
                    if (!user.password) {
                      newErrors.password = "Password is required";
                    } else {
                      if (!user.manager) {
                        newErrors.manager = "Manager selection is required";
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

    return newErrors;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const userData = {
      ...user,
      dob_date: parseInt(user.dob_date, 10),
      dob_month: parseInt(user.dob_month, 10),
      dob_year: parseInt(user.dob_year, 10),
      phone: parseInt(user.phone, 10),
      alt_phone: parseInt(user.alt_phone, 10),
      pincode: parseInt(user.pincode, 10)
    };

    try {
      await newRequest.post("/auth/userRegister", userData);
      if (user.admin) navigate("/Panel/users");
      else navigate('/login');
    } catch (err) {
      console.log(err);
    }
  };

  if (!currentUser) {
    return <Unauthorized />;
  }

  if (!currentUser.admin) {
    return <Unauthorized />;
  }

  return (
    <div className="reg-form">
      <h1>Registration Form</h1>
      <form onSubmit={handleSubmit}>
        <div className="personal-info">
          <div className="name input-container">
            <label htmlFor="firstName">First Name</label>
            <div className="flex gap-4">
              <input className="w-48" id="firstName" name="firstName" type="text" placeholder="First Name" onChange={handleChange} />
              <input className="w-48" id="lastName" name="lastName" type="text" placeholder="Last Name" onChange={handleChange} />
            </div>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="DoB input-container">
            <label htmlFor="dob_date">Birth Date</label>
            <div className="flex gap-2">
              <input className="w-32" id="dob_date" name="dob_date" type="text" placeholder="DD" onChange={handleChange} />
              <input className="w-32" id="dob_month" name="dob_month" type="text" placeholder="MM" onChange={handleChange} />
              <input className="w-32" id="dob_year" name="dob_year" type="text" placeholder="YYYY" onChange={handleChange} />
            </div>
            {errors.dob && <span className="error">{errors.dob}</span>}
          </div>

          <div className="input-container">
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" placeholder="Address" onChange={handleChange} />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          <div className="input-container">
            <label htmlFor="pincode">Pin Code</label>
            <input id="pincode" name="pincode" type="text" placeholder="Pin Code" onChange={handleChange} />
            {errors.pincode && <span className="error">{errors.pincode}</span>}
          </div>
        </div>

        <div className="security">
          <div className="phone input-container">
            <label htmlFor="phone">Phone No.</label>
            <div className="flex gap-4">
              <input className="w-48" id="phone" name="phone" type="text" placeholder="Phone Number" onChange={handleChange} />
              <input className="w-48" id="alt_phone" name="alt_phone" type="text" placeholder="Alt Phone Number" onChange={handleChange} />
            </div>
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="email input-container">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="Email" onChange={handleChange} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="username input-container">
            <label htmlFor="username">Username</label>
            <div className="user-container w-100">
              <input id="username" name="username" type="text" placeholder="Username" onChange={handleChange} />
              <span className="material-symbols-rounded" onClick={() => document.getElementById('username').focus()}>person</span>
            </div>
            {errors.username && <span className="error">{errors.username}</span>}
          </div>

          <div className="pass input-container">
            <label htmlFor="password">Password</label>
            <div className="user-container w-100">
              <input id="password" name="password" type={passwordVisible ? "text" : "password"} placeholder="Password" onChange={handleChange} />
              <span className="material-symbols-rounded" onClick={togglePasswordVisibility}>{passwordVisible ? "visibility" : "visibility_off"}</span>
            </div>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="manager input-container">
            <label htmlFor="manager">Manager</label>
            <select id="manager" name="manager" onChange={handleChange}>
              <option value="" disabled selected>
                Select Manager
              </option>
              <option value="source">Source</option>
              <option value="relation">Relation</option>
              <option value="closing">Closing</option>
            </select>
            {errors.manager && <span className="error">{errors.manager}</span>}
          </div>

          <div className="justify-around">
            <label className="admin-label">
              <input type="checkbox" name="admin" onChange={handleAdmin} /> Admin
            </label>
            <button type="submit">Create User</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
