import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const navigate = useNavigate();

    const handleResetPassword = (e) => {
        e.preventDefault();

        axios.put("http://localhost:8000/user/forgot-password", { email, newPassword })
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Password Reset Successfully! 🔒",
                    text: "Now you can login with your new password.",
                    timer: 2000,
                    showConfirmButton: false
                });
                setTimeout(() => {
                    navigate("/login");
                }, 2200);
            })
            .catch((err) => {
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text: err.response?.data?.message || "Something went wrong.",
                });
            });
    };

    return (
        <div className="form-container">
            <h1 className="signup-heading"><b>🔒 Forgot Password</b></h1>
            <form className="signup-form" onSubmit={handleResetPassword}>
                
                {/* Email Field */}
                <div className="mb-3">
                    <label htmlFor="Email" className="form-label"><b>Registered Email Address</b></label>
                    <input
                        type="email"
                        className="form-control"
                        id="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* New Password Field */}
                <div className="mb-3 password-wrapper">
                    <label htmlFor="NewPassword" className="form-label"><b>New Password</b></label>
                    <input
                        type={showNewPassword ? "text" : "password"}
                        className="form-control"
                        id="NewPassword"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <span
                        className="eye-icon2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>

                <div className="signup-button-container">
                    <button type="submit" className="btn btn-primary signup-button">
                        Reset Password
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ForgotPassword;