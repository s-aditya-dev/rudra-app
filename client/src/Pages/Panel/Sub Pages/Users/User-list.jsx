import React, { useState, useEffect } from "react";
import "./User-list.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../../../utils/newRequest.js";
import { Link } from "react-router-dom";

import Loader from "../../../../Components/Loader/Loader.jsx";
import Unauthorized from "../../../../Components/Unauthorized/Unauthorized";

const UserList = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { isLoading, error, data } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      newRequest.get(`/users`).then((res) => {
        return res.data;
      }),
  });

  const queryClient = useQueryClient();

  const deleteUser = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/users/user/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser.mutate(userId);
    }
  };

  const [users, setUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);

  useEffect(() => {
    if (data) {
      setUsers(
        data.map((user) => ({
          ...user,
          showPassword: false,
        }))
      );
    }
  }, [data]);

  const togglePassword = (index) => {
    setUsers(
      users.map((user, i) =>
        i === index ? { ...user, showPassword: !user.showPassword } : user
      )
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Loader message={`Something went wrong: ${error.message}`} />;
  }


  if (!currentUser.admin){
    return <Unauthorized/>;
  }

  const handleRowClick = (UserId) => {
    setActiveUserId(prevUserId => prevUserId === UserId ? null : UserId);
  };

  return (
    <div className="users-table">
      <div className="users-table-header">
        <h2>User List</h2>
        <Link to="/panel/add-user">
          <button>Add User +
          </button>
        </Link>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Employee Name</th>
            <th>Username</th>
            <th>Password</th>
            <th>Role</th>
            <th>Manager</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id} className={activeUserId === user._id ? 'active' : ''}>
              <td data-cell = 'Sr No' onClick={() => handleRowClick(user._id)}>{index + 1} </td>
              <td data-cell = 'Employee Name' onClick={() => handleRowClick(user._id)}>{user.firstName + ' ' + user.lastName} </td>
              <td data-cell = 'Username'>{user.username}</td>
              <td data-cell = 'Password' className="password-cell">
                {user.showPassword ? user.password : "••••••••"}
              </td>
              {user.admin ? <td data-cell = 'Role'>Admin</td> : <td data-cell = 'Role'>User</td>}
              <td data-cell = 'Manager'>{user.manager}</td>
              <td data-cell = 'Action' className="action-buttons">
                <button
                  className="show-hide-button green-btn"
                  onClick={() => togglePassword(index)}
                >
                  <span className="material-symbols-rounded">
                    {user.showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
                {/* <button className="blue-btn">
                  <span class="material-symbols-rounded">
                    edit
                  </span>
                </button> */}
                <button className="red-btn" onClick={() => handleDelete(user._id)}><span className="material-symbols-rounded">
                  delete_forever
                </span></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
