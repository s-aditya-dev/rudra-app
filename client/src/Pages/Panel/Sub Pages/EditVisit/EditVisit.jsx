import React, { useState, useEffect } from "react";
// import "./AddVisit.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../../../utils/newRequest.js";

const EditVisitModal = ({ visitData, clientName, visitID, isOpen, onClose, isAdmin }) => {
    const queryClient = useQueryClient();

    const { isLoading, error, data } = useQuery({
        queryKey: ["managers"],
        queryFn: () =>
            newRequest.get("/clientVisits/managers").then((res) => res.data),
    });

    const [formData, setFormData] = useState({
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

    useEffect(() => {
        if (visitData) {
            setFormData(visitData);
        }
    }, [visitData]);

    const handleInputChange = (e) => {
        setFormData((prev) => ({
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
            setFormData({
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
        let newErrors = {};

        if (!formData.date || !formData.time) {
            newErrors.date = "Date and Time are required";
            newErrors.time = "Date and Time are required";
            isValid = false;
        }

        if (!formData.referenceBy) {
            newErrors.referenceBy = "Reference is required";
            isValid = false;
        }

        if (!formData.sourcingManager) {
            newErrors.sourcingManager = "Source is required";
            isValid = false;
        }

        if (!formData.relationshipManager) {
            newErrors.relationshipManager = "Relation is required";
            isValid = false;
        }

        if (!formData.closingManager) {
            newErrors.closingManager = "Closing is required";
            isValid = false;
        }

        if (!formData.status) {
            newErrors.status = "Status is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        if (!validate()) return;

        try {
            await newRequest.put(`/clientVisits/${visitID}`, { ...formData });
      
            navigate(`/panel/client-details/${clientId}`);
            console.log(`${visitID} Form submitted with data:`, formData);
          } catch (err) {
            console.error("Error submitting form:", err);
          }
        onClose(e);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="visit-form active" onClick={(e) => e.stopPropagation()}>
                <div>
                    <h2>{`Edit Client Visit: ${clientName}`}</h2>

                    <div className="date-time input-container w-100">
                        <label htmlFor="visitDate">Date Time: <span>*</span></label>
                        <div className="flex w-100">
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                id="visitDate"
                                className="w-45"
                                readOnly = {!isAdmin}
                                required
                            />
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                id="visitTime"
                                className="w-45"
                                readOnly = {!isAdmin}
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
                            value={formData.referenceBy}
                            onChange={handleInputChange}
                            placeholder="Enter your Reference"
                            readOnly = {!isAdmin}
                            required
                        />
                        {errors.referenceBy && <span className="errMessage">{errors.referenceBy}</span>}
                    </div>

                    <div className="drop-down">
                        <div className="source-container input-container w-45">
                            <label htmlFor="source">Source: <span>*</span></label>
                            <select
                                id="source"
                                onChange={handleInputChange}
                                value={formData.sourcingManager}
                                name="sourcingManager"
                                disabled = {!isAdmin}
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
                                onChange={handleInputChange}
                                value={formData.relationshipManager}
                                name="relationshipManager"
                                disabled = {!isAdmin}
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
                                onChange={handleInputChange}
                                value={formData.closingManager}
                                name="closingManager"
                                disabled = {!isAdmin}
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
                                onChange={handleInputChange}
                                value={formData.status}
                                name="status"
                                disabled = {false}
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
                            onChange={handleInputChange}
                            value={formData.visitRemark}
                            name="visitRemark"
                            id="remark"
                            placeholder="Enter your remark"
                            readOnly = {false}
                        ></textarea>
                    </div>
                    <div className="controls w-100">
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" onClick={handleSubmit}>
                            Update Visit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditVisitModal;
