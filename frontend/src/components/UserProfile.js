// UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import '../App.css';
import {
    FaEdit,
    FaSave,
    FaTimes,
    FaUserCircle,
    FaFacebookF,
    FaTwitter,
    FaInstagram,
  } from "react-icons/fa";

function UserProfile() {
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    dob: "",
    gender: "",
    expectedRole: "",
    profileImage: "",
    mobile: "",
  });
  const [editField, setEditField] = useState("");
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [isEditingImage, setIsEditingImage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const refreshed = await axios.get(`http://localhost:8000/user/get/${userId}`);
        const updatedData = refreshed.data;
        if (updatedData.profileImage && !updatedData.profileImage.startsWith('http')) {
          updatedData.profileImage = `http://localhost:8000${updatedData.profileImage}`;
        }
        setUserData(updatedData);
        setImagePreviewUrl(updatedData.profileImage);

      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch user data.");
      }
    };

    if (userId) fetchUserData();
    else setError("User ID not found. Please log in.");
  }, [userId]);

  const handleEdit = (field) => {
    setEditField(field);
    setError("");
  };

  const handleSave = async (field) => {
    try {
      const response = await axios.put(`http://localhost:8000/user/update/${userId}`, {
        field,
        value: userData[field],
      });

      if (response.status === 200) {
        setEditField("");
        setError("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    }
  };

  const handleCancelEdit = () => {
    setEditField("");
    setError("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setIsEditingImage(true); // 👈 important to trigger button appearance
    }
  };  

  const handleSaveImage = async () => {
    if (!selectedImage) {
      setError("Please select an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", selectedImage);
    formData.append("userId", userId);

    try {
      const response = await axios.post("http://localhost:8000/user/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.imageUrl) {
        const fullImageUrl = response.data.imageUrl.startsWith('http')
          ? response.data.imageUrl
          : `http://localhost:8000${response.data.imageUrl}`;
        setUserData((prev) => ({ ...prev, profileImage: fullImageUrl }));
        setImagePreviewUrl(fullImageUrl);
        setSelectedImage(null);
        setError("");
        Swal.fire({
          icon: 'success',
          title: 'Profile Image Updated!',
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true
        });
        
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to upload profile image.");
    }
  };

  const handleLogout = () => {
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have been successfully logged out.',
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true
    });
  
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      navigate("/login");
    }, 1900);
  };
  
  
  
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete my account!'
    });
  
    if (result.isConfirmed) {
      if (!currentPassword) {
        setError("Please enter your password to confirm deletion.");
        return;
      }
  
      try {
        await axios.delete(`http://localhost:8000/user/delete/${userId}`, {
          data: { currentPassword },
        });
  
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Your account has been deleted successfully.',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
  
        setTimeout(() => {
          localStorage.removeItem("userId");
          window.location.href = "/login";
        }, 2100);
  
      } catch (err) {
        setError(err.response?.data?.message || "Account deletion failed.");
      }
    }
  };
  

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="user-profile-wrapper">
      <div className="left-section">
      <div className="profile-image-container">
      {imagePreviewUrl ? (
        <img
          src={imagePreviewUrl}
          alt="Profile"
          className="profile-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "default-profile.png";
          }}
        />
      ) : (
        <FaUserCircle className="default-profile-icon" />
      )}

      <div className="image-edit-overlay">
        {isEditingImage ? (
          <>
            <button className="save-button" onClick={handleSaveImage}>
              <FaSave />
            </button>
            <button className="cancel-button" onClick={handleCancelEdit}>
              <FaTimes />
            </button>
          </>
        ) : (
          <label htmlFor="profileImageInput" className="edit-button">
            <FaEdit />
          </label>
        )}
      </div>

      <input
        type="file"
        id="profileImageInput"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
    </div>


        <h3 className="profile-name">{userData.name}</h3>
        <p className="role-text">{userData.expectedRole || "Role not defined"}</p>
        <div className="social-icons">
          <FaFacebookF />
          <FaTwitter />
          <FaInstagram />
        </div>
      </div>


      <div className="right-section">
      {(userRole === "Admin" || userRole === "Manager") && (
        <button
          className="manage-users-button"
          onClick={() => navigate("/manage-users")}
        >
          👥 Manage Users
        </button>
      )}
      <button className="logout-button" onClick={handleLogout}>
      Logout
      </button>

      <div className="last-login-banner">
        <p>🔔 Last Login: {userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : "-"}</p>
      </div>

        <h2>User Information</h2>
        {error && <div className="error">{error}</div>}

        <div className="field-row">
          <span className="label">Name:</span>
          {editField === "name" ? (
            <input
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            />
          ) : (
            <span className="value">{userData.name}</span>
          )}
          <span className="actions">
            {editField === "name" ? (
              <>
                <button onClick={() => handleSave("name")}><FaSave /></button>
                <button onClick={handleCancelEdit}><FaTimes /></button>
              </>
            ) : (
              <button onClick={() => handleEdit("name")}><FaEdit /></button>
            )}
          </span>
        </div>

        <div className="field-row">
        <span className="label">Email:</span>
        {editField === "email" ? (
          <input
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          />
        ) : (
          <span className="value">{userData.email}</span>
        )}
        <span className="actions">
          {editField === "email" ? (
            <>
              <button onClick={() => handleSave("email")}><FaSave /></button>
              <button onClick={handleCancelEdit}><FaTimes /></button>
            </>
          ) : (
            <button onClick={() => handleEdit("email")}><FaEdit /></button>
          )}
        </span>
      </div>
      

      <div className="field-row">
        <span className="label">Mobile:</span>
        {editField === "mobile" ? (
          <input
            type="text"
            value={userData.mobile}
            onChange={(e) => {
              const input = e.target.value;
              if (/^\d{0,10}$/.test(input)) {
                setUserData({ ...userData, mobile: input });
              }
            }}
          />
        ) : (
          <span className="value">{userData.mobile || "-"}</span>
        )}
        <span className="actions">
          {editField === "mobile" ? (
            <>
              <button onClick={() => handleSave("mobile")}><FaSave /></button>
              <button onClick={handleCancelEdit}><FaTimes /></button>
            </>
          ) : (
            <button onClick={() => handleEdit("mobile")}><FaEdit /></button>
          )}
        </span>
      </div>




        <div className="field-row">
          <span className="label">Date of Birth:</span>
          <span className="value">{formatDate(userData.dob)}</span>
        </div>

        <div className="field-row">
          <span className="label">Gender:</span>
          <span className="value">{userData.gender || "-"}</span>
        </div>

        <div className="password-section">
          <label>Delete Account:</label>
          <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <button className="delete-button" onClick={handleDelete}>
            Delete Account
          </button>
        </div>
      </div>
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
    </div>
    </div>
  );
}

export default UserProfile;