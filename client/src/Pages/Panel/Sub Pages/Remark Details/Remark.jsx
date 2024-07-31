import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../../../utils/newRequest.js";
import Loader from "../../../../Components/Loader/Loader.jsx";
import AddRemarkModal from './AddRemark.jsx'; // Import the RemarkModal component
import './Remark.css';

const fetchClientVisit = (id) => {
    return newRequest.get(`/clientVisits/${id}`).then((res) => res.data);
};

const deleteRemark = (id, remarkId) => {
    return newRequest.delete(`/visitRemark/${id}/${remarkId}`);
};

const Remark = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const [activeRemarkId, setActiveRemarkId] = useState(null);
    const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false); // State for modal visibility

    const { isLoading, error, data } = useQuery({
        queryKey: ["clientVisitWithRemark", id],
        queryFn: () => fetchClientVisit(id),
    });

    const deleteRemarkMutation = useMutation({
        mutationFn: (remarkId) => deleteRemark(id, remarkId),
        onSuccess: () => {
            queryClient.invalidateQueries(["clientVisitWithRemark", id]);
        },
    });

    const handleDelete = (remarkId) => {
        if (window.confirm("Are you sure you want to delete this remark?")) {
            deleteRemarkMutation.mutate(remarkId);
        }
    };

    const handleRowClick = (remarkId) => {
        setActiveRemarkId((prevRemarkId) => (prevRemarkId === remarkId ? null : remarkId));
    };

    const formatDate = (date) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(date).toLocaleDateString('en-GB', options).replace(/ /g, '-');
    };

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <Loader message={`Something went wrong: ${error.message}`} />;
    }

    const visitRemarks = data?.visitRemarkId || [];

    const sortedRemarks = visitRemarks.sort((a, b) => {

        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return dateB - dateA;
    }); 

    const closingManager = data?.closingManager || [];
    const hasAccess = currentUser.admin || currentUser.username === closingManager;

    return (
        <div className="remark-table">
            <div className="remark-header">
                <h2>Client Remark</h2>
                <button onClick={() => setIsRemarkModalOpen(true)}>Add Remark</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th colSpan="3">Remark</th>
                        {hasAccess && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {sortedRemarks.map((remark, index) => (
                        <tr
                            key={remark._id}
                            className={activeRemarkId === remark._id ? 'active' : ''}
                        >
                            <td data-cell="Sr No:" onClick={() => handleRowClick(remark._id)}>{index + 1}</td>
                            <td data-cell="Date" onClick={() => handleRowClick(remark._id)}>{formatDate(remark.date)}</td>
                            <td data-cell="Time">{remark.time}</td>
                            <td data-cell="Remark" colSpan="3">{remark.visitRemark}</td>
                            {hasAccess && (
                                <td data-cell="Action" className="action-buttons">
                                    <div>
                                        <button className="red-btn" onClick={() => handleDelete(remark._id)}>
                                            <span className="material-symbols-rounded">
                                                delete
                                            </span>
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            <AddRemarkModal isOpen={isRemarkModalOpen} onClose={() => setIsRemarkModalOpen(false)} visitID={id}/>
        </div>
    );
};

export default Remark;
