import React, { useState, useEffect } from "react";
import "./AddVisit.css";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../../../utils/newRequest.js";

const AddVisitModal = ({ clientName, clientID, isOpen, onClose }) => {
    const { isLoading, error, data } = useQuery({
        queryKey: ["managers"],
        queryFn: () =>
            newRequest.get("/clientVisits/managers").then((res) => res.data),
    });

    const [visitData, setVisitData] = useState({
        time: "",
        date: "",
        referenceBy: "",
        sourcingManager: "",
        relationshipManager: "",
        closingManager: "",
        status: "",
        visitRemark: "",
    });

    const [errors, setErrors] = useState({});

    const handleVisitChange = (e) => {
        setVisitData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const [managers, setManagers] = useState([]);

    useEffect(() => {
        if (data) {
            setManagers(data);
        }
    }, [data]);

    useEffect(() => {
        if (!isOpen) {
            // Clear the form data when the modal is closed
            setVisitData({
                time: "",
                date: "",
                referenceBy: "",
                sourcingManager: "",
                relationshipManager: "",
                closingManager: "",
                status: "",
                visitRemark: "",
            });
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;
    if (isLoading)
        return (
            <div className="modal-overlay">
                <div className="visit-form active">Loading...</div>
            </div>
        );
    if (error)
        return (
            <div className="modal-overlay">
                <div className="visit-form active">Error: {error.message}</div>
            </div>
        );

        
    const validate = () => {
        let isValid = true;

        if (!visitData.date || !visitData.time) {
            setErrors(prevErrors => ({ ...prevErrors, date: "Date and Time is required", time: "Date and Time is required" }));
            isValid = false;
        } else {
            setErrors(prevErrors => ({ ...prevErrors, date: "", time: "" }));
            if (!visitData.referenceBy) {
                setErrors(prevErrors => ({ ...prevErrors, referenceBy: "Reference is required" }));
                isValid = false;
            } else {
                setErrors(prevErrors => ({ ...prevErrors, referenceBy: "" }));
                if (!visitData.sourcingManager) {
                    setErrors(prevErrors => ({ ...prevErrors, sourcingManager: "Source is required" }));
                    isValid = false;
                } else {
                    setErrors(prevErrors => ({ ...prevErrors, sourcingManager: "" }));
                    if (!visitData.relationshipManager) {
                        setErrors(prevErrors => ({ ...prevErrors, relationshipManager: "Relation is required" }));
                        isValid = false;
                    } else {
                        setErrors(prevErrors => ({ ...prevErrors, relationshipManager: "" }));
                        if (!visitData.closingManager) {
                            setErrors(prevErrors => ({ ...prevErrors, closingManager: "Closing is required" }));
                            isValid = false;
                        } else {
                            setErrors(prevErrors => ({ ...prevErrors, closingManager: "" }));
                            if (!visitData.status) {
                                setErrors(prevErrors => ({ ...prevErrors, status: "Status is required" }));
                                isValid = false;
                            } else {
                                setErrors(prevErrors => ({ ...prevErrors, status: "" }));
                            }
                        }
                    }
                }
            }
        }

        return isValid;
    };



    const handleVisitSubmit = async (e) => {
        if (!validate()) return;

        try {
            await newRequest.post(`/clients/${clientID}/clientVisits`, visitData);
            console.log(`${clientID} Form submitted with data:`, visitData);
            onClose(e);
        } catch (err) {
            console.error('Error submitting form:', err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="visit-form active" onClick={(e) => e.stopPropagation()}>
                <div>
                    <h2>{`Add Client Visit: ${clientName}`}</h2>

                    <div className="date-time input-container w-100">
                        <label htmlFor="visitDate">Date Time: <span>*</span></label>
                        <div className="flex w-100">
                            <input
                                type="date"
                                name="date"
                                value={visitData.date}
                                onChange={handleVisitChange}
                                id="visitDate"
                                className="w-45"
                                required
                            />
                            <input
                                type="time"
                                name="time"
                                value={visitData.time}
                                onChange={handleVisitChange}
                                id="visitTime"
                                className="w-45"
                                required
                            />
                        </div>
                        {errors.date && <span className="errMessage">{errors.date}</span>}
                    </div>

                    <div className="reference-container input-container w-100">
                        <label htmlFor="reference">Reference by: <span>*</span></label>
                        <input
                            type="text"
                            id="reference"
                            name="referenceBy"
                            value={visitData.referenceBy}
                            onChange={handleVisitChange}
                            placeholder="Enter your Reference"
                            required
                        />
                        {errors.referenceBy && <span className="errMessage">{errors.referenceBy}</span>}
                    </div>

                    <div className="drop-down">
                        <div className="source-container input-container w-45">
                            <label htmlFor="source">Source: <span>*</span></label>
                            <select
                                id="source"
                                onChange={handleVisitChange}
                                value={visitData.sourcingManager}
                                name="sourcingManager"
                                required
                            >
                                <option value="" disabled>
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
                            {errors.sourcingManager && <span className="errMessage">{errors.sourcingManager}</span>}
                        </div>

                        <div className="relation-container input-container w-45">
                            <label htmlFor="relation">Relation: <span>*</span></label>
                            <select
                                id="relation"
                                onChange={handleVisitChange}
                                value={visitData.relationshipManager}
                                name="relationshipManager"
                                required
                            >
                                <option value="" disabled>
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
                            {errors.relationshipManager && <span className="errMessage">{errors.relationshipManager}</span>}
                        </div>

                        <div className="closing-container input-container w-45">
                            <label htmlFor="closing">Closing: <span>*</span></label>
                            <select
                                id="closing"
                                onChange={handleVisitChange}
                                value={visitData.closingManager}
                                name="closingManager"
                                required
                            >
                                <option value="" disabled>
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
                            {errors.closingManager && <span className="errMessage">{errors.closingManager}</span>}
                        </div>

                        <div className="status-container input-container w-45">
                            <label htmlFor="status">Status: <span>*</span></label>
                            <select
                                id="status"
                                onChange={handleVisitChange}
                                value={visitData.status}
                                name="status"
                                required
                            >
                                <option value="" disabled>
                                    Select Status
                                </option>
                                <option value="warm">Warm</option>
                                <option value="cold">Cold</option>
                                <option value="lost">Lost</option>
                                <option value="booked">Booked</option>
                            </select>
                            {errors.status && <span className="errMessage">{errors.status}</span>}
                        </div>
                    </div>

                    <div className="remark input-container w-100">
                        <label htmlFor="remark">Remark:</label>
                        <textarea
                            onChange={handleVisitChange}
                            value={visitData.visitRemark}
                            name="visitRemark"
                            id="remark"
                            placeholder="Enter your remark"
                        ></textarea>
                    </div>
                    <div className="controls w-100">
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" onClick={handleVisitSubmit}>
                            Confirm Visit+
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddVisitModal;
