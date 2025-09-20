// ManageUsers.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import '../App.css'; 
import Swal from 'sweetalert2';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";  

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/user/");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleDelete = (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will delete the user permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8000/user/delete/${userId}`, {
            data: { requesterId: localStorage.getItem("userId") }
          });
          Swal.fire(
            "Deleted!",
            "User has been deleted.",
            "success"
          );
          fetchUsers(); // Refresh list
        } catch (error) {
          Swal.fire(
            "Error!",
            error.response?.data?.message || "Failed to delete user",
            "error"
          );
        }
      }
    });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:8000/user/update/${userId}`, {
        field: "expectedRole",
        value: newRole
      });
  
      Swal.fire({
        icon: "success",
        title: "Role Updated!",
        text: `User role changed to ${newRole}`,
        timer: 1500,
        showConfirmButton: false,
      });
  
      fetchUsers(); // Refresh the list
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Failed to update role",
      });
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(18);
    doc.text('User Management Report', 14, 22);
  
    const tableColumn = ["Name", "Email", "Mobile", "Role"];
    const tableRows = [];
  
    users.forEach(user => {
      const rowData = [
        user.name || "-",
        user.email || "-",
        user.mobile || "-",
        user.expectedRole || "-"
      ];
      tableRows.push(rowData);
    });
  
    doc.setFontSize(18);
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 10 },
      });
  
    doc.save('User_Report.pdf');
  };
  
  

  return (
    <div className="manage-users-container">
        <div className="top-bar">
        <input
            type="text"
            placeholder="🔍 Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar2"
        />

        <button className="export-button" onClick={handleExportPDF}>
            📄 Export PDF
        </button>
    </div>

      <h1 className="text-center">👥 Manage Users</h1>
      
      {users.length > 0 ? (
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Date Of Birth</th>
              <th>Gender</th>
              <th>Delete User</th>
            </tr>
          </thead>
          <tbody>
          {users
            .filter((user) =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.mobile?.includes(searchTerm) ||
                user.expectedRole?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((user) => (
                <tr key={user._id}>
                <td>{user.name || "-"}</td>
                <td>{user.email || "-"}</td>
                <td>{user.mobile || "-"}</td>
                <td>
                    <select
                    value={user.expectedRole || "Customer"}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="role-select"
                    >
                    <option value="Admin">Admin</option>
                    <option value="Customer">Customer</option>
                    
                    </select>
                </td>
                <td>{user.dob || "-"}</td>
                <td>{user.gender || "-"}</td>
                <td>
                    <button
                    className="delete-user-button"
                    onClick={() => handleDelete(user._id)}
                    >
                    ❌ Delete
                    </button>
                </td>
                </tr>
            ))}
            </tbody>

        </table>
      ) : (
        <p>No users found!</p>
      )}
    </div>
    
  );
}

export default ManageUsers;
