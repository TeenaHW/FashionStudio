import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from 'sweetalert2';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // 👈 Show/Hide password
    const navigate = useNavigate();

    function sendData(e) {
        e.preventDefault();
      
        const userData = {
          email,
          password,
        };
      
        axios.post("http://localhost:8000/api/auth", userData)
        .then((response) => {         
            const token = response.data.data.token;
            const userId = response.data.data.userId;
            const userName = response.data.data.name;  
            const userEmail = response.data.data.email;  
            const userRole = response.data.data.expectedRole; 
          
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            localStorage.setItem("userName", userName);
            localStorage.setItem("userEmail", userEmail);
            localStorage.setItem("userRole", userRole); 
          
            Swal.fire({
                icon: 'success',
                title: `Welcome, ${userName}! 🎉`,  
                text: 'You have logged in successfully!',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
          
            setTimeout(() => {
              navigate("/profile");
            }, 1600);
          })
          
          .catch((err) => {
            if (err.response && err.response.status === 401) {
              Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Invalid Email or Password. Please try again.',
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response?.data?.message || err.message,
              });
            }
          });
      }
      
      

    return (
        <div className="form-container">
            <h1 className="signup-heading">
                <b>🔑 User Login</b>
            </h1>
            <form className="signup-form" onSubmit={sendData}>
                <div className="mb-3">
                    <label htmlFor="UserEmail" className="form-label"><b>Email Address</b></label>
                    <input
                        type="email"
                        className="form-control"
                        id="UserEmail"
                        placeholder="Enter your email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Password" className="form-label"><b>Password</b></label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="Password"
                            placeholder="Enter your password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span
                            className="eye-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                <div className="signup-button-container">
                    <button
                        type="submit"
                        className="btn btn-primary signup-button"
                    >
                        Login
                    </button>
                </div>
            </form>
            <div className="mt-3 text-center">
                <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
            </div>

            <div className="mt-3 text-center">
                <p>
                    <Link to="/forgot-password" style={{ color: 'blue', textDecoration: 'underline' }}>
                    Forgot Password?
                    </Link>
                </p>
            </div>

        </div>
    );
}

export default Login;
