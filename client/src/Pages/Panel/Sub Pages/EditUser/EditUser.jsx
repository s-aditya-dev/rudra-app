import React, { useState, useEffect } from "react";
import newRequest from "../../../../utils/newRequest.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import './EditUser.css';

const EditUser = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
        document.getElementById('password').focus();
    };

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
        const passLengthRegex = /^[a-zA-Z0-9]{6,}$/;
        const passwordRegex = /^(?!password$)[a-zA-Z0-9]*$/i;

        const isLeapYear = (year) => {
            return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        };

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
                                        } else if (!passwordRegex.test(user.password)) {
                                            newErrors.password = "Password cannot be Password or cannot contain any special character";
                                        } else if (!passLengthRegex.test(user.password)) {
                                            newErrors.password = "Password should be atleats 6 characters";
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

    const { data, isLoading, isError } = useQuery({
        queryKey: ["user", id],
        queryFn: async () => {
            const response = await newRequest.get(`/users/${id}`);
            console.log('Response:', response);  // Log the entire response
            return response.data;
        }
    });

    useEffect(() => {
        if (data) {
            console.log('Data in useEffect:', data);  // Log the data
            setUser({
                ...data,
                firstName: data.firstName || '',
                password: '',
                dob_date: data.dob_date || "",
                dob_month: data.dob_month || "",
                dob_year: data.dob_year || "",
                phone: data.phone || "",
                alt_phone: data.alt_phone || "",
                pincode: data.pincode || "",
            });
        }
    }, [data]);

    console.log('Data from useQuery:', data);  // Log the data outside of useQuery
 // Log the data outside of useQuery

    const mutation = useMutation({
        mutationFn: async (updatedUser) => {
            await newRequest.put(`/users/${id}`, updatedUser);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["user", id]);
            navigate("/login");
        }
    });

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

        mutation.mutate(userData);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Error loading user data</div>;
    }

    return (
        <div className="edit-reg-form">
            <h3>Edit User</h3>
            <form onSubmit={handleSubmit}>
                <div className="personal-info">
                    <div className="name input-container">
                        <label htmlFor="firstName">First Name</label>
                        <div className="flex gap-4">
                            <input className="w-48" id="firstName" name="firstName" type="text" placeholder="First Name" value={user.firstName} onChange={handleChange} />
                            <input className="w-48" id="lastName" name="lastName" type="text" placeholder="Last Name" value={user.lastName} onChange={handleChange} />
                        </div>
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>

                    <div className="DoB input-container">
                        <label htmlFor="dob_date">Birth Date</label>
                        <div className="flex gap-2">
                            <input className="w-32" id="dob_date" name="dob_date" type="text" placeholder="DD" value={user.dob_date} onChange={handleChange} />
                            <input className="w-32" id="dob_month" name="dob_month" type="text" placeholder="MM" value={user.dob_month} onChange={handleChange} />
                            <input className="w-32" id="dob_year" name="dob_year" type="text" placeholder="YYYY" value={user.dob_year} onChange={handleChange} />
                        </div>
                        {errors.dob && <span className="error">{errors.dob}</span>}
                    </div>

                    <div className="input-container">
                        <label htmlFor="address">Address</label>
                        <textarea id="address" name="address" placeholder="Address" value={user.address} onChange={handleChange} />
                        {errors.address && <span className="error">{errors.address}</span>}
                    </div>

                    <div className="input-container">
                        <label htmlFor="pincode">Pin Code</label>
                        <input id="pincode" name="pincode" type="text" placeholder="Pin Code" value={user.pincode} onChange={handleChange} />
                        {errors.pincode && <span className="error">{errors.pincode}</span>}
                    </div>
                </div>

                <div className="security">
                    <div className="phone input-container">
                        <label htmlFor="phone">Phone No.</label>
                        <div className="flex gap-4">
                            <input className="w-48" id="phone" name="phone" type="text" placeholder="Phone Number" value={user.phone} onChange={handleChange} />
                            <input className="w-48" id="alt_phone" name="alt_phone" type="text" placeholder="Alt Number" value={user.alt_phone} onChange={handleChange} />
                        </div>
                        {errors.phone && <span className="error">{errors.phone}</span>}
                    </div>

                    <div className="email input-container">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" placeholder="Email" value={user.email} onChange={handleChange} />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div>

                    <div className="username input-container">
                        <label htmlFor="username">Username</label>
                        <div className="user-container w-100">
                            <input disabled id="username" name="username" type="text" placeholder="Username" value={user.username} onChange={handleChange} />
                            <span className="material-symbols-rounded" onClick={() => document.getElementById('username').focus()}>person</span>
                        </div>
                        {errors.username && <span className="error">{errors.username}</span>}
                    </div>

                    <div className="pass input-container">
                        <label htmlFor="password">Password</label>
                        <div className="user-container w-100">
                            <input id="password" name="password" type={passwordVisible ? "text" : "password"} placeholder="Password" value={user.password} onChange={handleChange} />
                            <span className="material-symbols-rounded" onClick={togglePasswordVisibility}>{passwordVisible ? "visibility" : "visibility_off"}</span>
                        </div>
                        {errors.password && <span className="error">{errors.password}</span>}
                    </div>

                    <div className="manager input-container">
                        <label htmlFor="manager">Manager</label>
                        <select id="manager" disabled name="manager" value={user.manager} onChange={handleChange}>
                            <option value="" disabled>
                                Select Manager
                            </option>
                            <option value="sales head">Sales Head</option>
                            <option value="source">Source</option>
                            <option value="relation">Relation</option>
                            <option value="closing">Closing</option>
                        </select>
                        {errors.manager && <span className="error">{errors.manager}</span>}
                    </div>

                    <div className="justify-around">
                        <button type="submit">Update User</button>
                    </div>
                </div>
            </form>
        </div>
    )
};

export default EditUser;
