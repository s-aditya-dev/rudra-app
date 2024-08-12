import React, { useState, useRef, useEffect } from 'react';
import './FilterPopover.css'; // Ensure you create and import a CSS file for the styles

const FilterPopover = ({ isOpen, onClose, onApplyFilters, managers }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectedManager1, setSelectedManager1] = useState('');
    const [selectedManager2, setSelectedManager2] = useState('');
    const [selectedManager3, setSelectedManager3] = useState('');
    const [selectedRequirements, setSelectedRequirements] = useState([]);

    const requirements = ['1BHK', '2BHK', '2.5BHK', '3.5BHK', '4.5BHK', 'SHOP', 'OFFICE'];
    const statuses = ['hot','warm', 'cold', 'lost', 'booked']; // Example statuses

    const popoverRef = useRef(null);

    const handleStatusChange = (status) => {
        setSelectedStatuses((prev) =>
            prev.includes(status)
                ? prev.filter((s) => s !== status)
                : [...prev, status]
        );
    };

    const handleRequirementChange = (requirement) => {
        setSelectedRequirements((prev) =>
            prev.includes(requirement)
                ? prev.filter((r) => r !== requirement)
                : [...prev, requirement]
        );
    };

    const handleApplyFilters = () => {
        // Multiply the budget values by 100,000
        const multipliedMinBudget = minBudget ? parseInt(minBudget) * 100000 : '';
        const multipliedMaxBudget = maxBudget ? parseInt(maxBudget) * 100000 : '';

        onApplyFilters({
            startDate,
            endDate,
            minBudget: multipliedMinBudget,
            maxBudget: multipliedMaxBudget,
            selectedStatuses,
            selectedManager1,
            selectedManager2,
            selectedManager3,
            selectedRequirements
        });

        onClose(); // Close the popover after applying filters
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setMinBudget('');
        setMaxBudget('');
        setSelectedStatuses([]);
        setSelectedManager1('');
        setSelectedManager2('');
        setSelectedManager3('');
        setSelectedRequirements([]);
    };

    const handleClickOutside = (event) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target)) {
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div ref={popoverRef} className="filter">
            <div className="status-selector">
                <h5>Status:</h5>
                <div>
                    {statuses.map((status) => (
                        <div key={status} className="customCheckBoxHolder">
                            <input
                                type="checkbox"
                                id={status}
                                className="customCheckBoxInput"
                                checked={selectedStatuses.includes(status)}
                                onChange={() => handleStatusChange(status)}
                            />
                            <label htmlFor={status} className="customCheckBoxWrapper">
                                <div className={`customCheckBox ${status}`}>
                                    <div className="inner">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="date-selector">
                <h5>Date:</h5>
                <div>
                    <div className="date-container">
                        <label htmlFor="start-date">Start:</label>
                        <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="date-container">
                        <label htmlFor="end-date">End:</label>
                        <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="requirement-selector">
                <h5>Requirement:</h5>
                <div>
                    {requirements.map((requirement) => (
                        <div key={requirement} className="customCheckBoxHolder">
                            <input
                                type="checkbox"
                                id={requirement}
                                className="customCheckBoxInput"
                                checked={selectedRequirements.includes(requirement)}
                                onChange={() => handleRequirementChange(requirement)}
                            />
                            <label htmlFor={requirement} className="customCheckBoxWrapper">
                                <div className="customCheckBox">
                                    <div className="inner">{requirement}</div>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="budget-selector">
                <h5>Budget:</h5>
                <div>
                    <div className="price-input">
                        <div className="field">
                            <label htmlFor="inputMin">Min</label>
                            <input type="text" className="input-min" value={minBudget} id="inputMin" onChange={(e) => setMinBudget(e.target.value)} />
                        </div>
                        <div className="field">
                            <label htmlFor="inputMax">Max</label>
                            <input type="text" className="input-max" value={maxBudget} id="inputMax" onChange={(e) => setMaxBudget(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="manager-selector">
                <h5>Manager:</h5>
                <div>
                    <div>
                        <label htmlFor="sourcing">Source:</label>
                        <select id="sourcing" value={selectedManager1} onChange={(e) => setSelectedManager1(e.target.value)}>
                            <option value="" disabled>-- Select Source --</option>
                            {managers.map((manager) => (
                                <option key={manager._id} value={manager.username}>{manager.firstName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="relation">Relation:</label>
                        <select id="relation" value={selectedManager2} onChange={(e) => setSelectedManager2(e.target.value)}>
                            <option value="" disabled>-- Select Relation --</option>
                            {managers.map((manager) => (
                                <option key={manager._id} value={manager.username}>{manager.firstName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="closing">Closing:</label>
                        <select id="closing" value={selectedManager3} onChange={(e) => setSelectedManager3(e.target.value)}>
                            <option value="" disabled>-- Select Closing --</option>
                            {managers.map((manager) => (
                                <option key={manager._id} value={manager.username}>{manager.firstName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>


            <div className="filter-controls">
                <button onClick={handleClearFilters}>Clear</button>
                <button onClick={handleApplyFilters}>Apply Filter</button>
            </div>
        </div>
    );
};

export default FilterPopover;
