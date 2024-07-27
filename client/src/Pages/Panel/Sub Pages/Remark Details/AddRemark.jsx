import React, { useState, useEffect } from 'react';
import newRequest from "../../../../utils/newRequest.js";
import './AddRemark.css'; // Import the CSS for styling

const AddRemarkModal = ({ isOpen, onClose, visitID }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [visitRemark, setRemark] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    let isValid = true;
    let errorMsg = '';

    if (!date) {
      errorMsg += "Date is required. ";
      isValid = false;
    }

    else if (!time) {
      errorMsg = "Time is required. ";
      isValid = false;
    }

    else if (!visitRemark) {
      errorMsg = "Remark is required. ";
      isValid = false;
    }

    setError(errorMsg);
    return isValid;
  }

  const handleAddRemark = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const remarkData = {
      date,
      time,
      visitRemark,
    };

    try {
      await newRequest.post(`visitRemark/${visitID}/remark`, remarkData);
      console.log(`${visitID} Form submitted with data:`, remarkData);
      onClose(e);
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);

      setDate(currentDate);
      setTime(currentTime);
      setRemark('');
      setError('');
    }
  }, [isOpen]);

  return (
    <div
      className={`remark-modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={onClose}
    >
      <form
        className="add-remark-container"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleAddRemark}
      >
        <div className="input-field">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled = {true}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled = {true}
          />
          <textarea
            value={visitRemark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Enter your remark"
          />
        </div>
        {error && <span className="errMessage">{error}</span>}
        <button type="submit">Add Remark</button>
      </form>
    </div>
  );
};

export default AddRemarkModal;
