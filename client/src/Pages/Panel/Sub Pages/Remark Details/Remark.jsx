import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import newRequest from "../../../../utils/newRequest.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import './Remark.css';

// Util Components
import Loader from "../../../../Components/Loader/Loader.jsx";

const Remark = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    const { isLoading, error, data } = useQuery({
        queryKey: ["clientVisitWithRemark", id],
        queryFn: () =>
            newRequest.get(`/clientVisits/${id}`).then((res) => res.data),
    });

    
    const deleteRemarkMutation = useMutation({
        mutationFn: (remarkId) => newRequest.delete(`/visitRemark/${id}/${remarkId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(["clientVisitWithRemark", id]);
        },
    });

    const handleDelete = (remarkId) => {
        if (window.confirm("Are you sure you want to delete this remark?")) {
            deleteRemarkMutation.mutate(remarkId);
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <Loader message={`Something went wrong: ${error.message}`} />;
    }
    
    const visitRemarks = data?.visitRemarkId || [];
    const closingManager = data?.closingManager || []
    const loadPerms = currentUser.admin || currentUser.firstName === closingManager

    return (
        <div className="remark-table">
            <div>
                <h2>Client Remark</h2>
                {/* <button>Add Remark</button> */}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th colSpan="3">Remark</th>
                        {!loadPerms? null : <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {visitRemarks.map((remark, index) => (
                        <tr key={remark._id}>
                            <td data-cell="Sr No:">{index + 1}</td>
                            <td data-cell="Date">{new Date(remark.createdAt).toLocaleDateString()}</td>
                            <td data-cell="Time">{new Date(remark.createdAt).toLocaleTimeString()}</td>
                            <td data-cell="Remark" colSpan="3">{remark.visitRemark}</td>
                            {!loadPerms? null : (
                                <td data-cell="Action" className="action-buttons">
                                <button className="red-btn" onClick={() => handleDelete(remark._id)}>
                                    <span className="material-symbols-rounded">
                                        delete
                                    </span>
                                </button>
                            </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Remark;
