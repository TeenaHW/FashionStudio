import React from "react";
import { Link } from "react-router-dom";
import '../App.css'; 
import logo from '../../src/images/logo.png'

function Header() {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <button className="navbar-brand btn btn-link">
        <Link to="/" className="navbar-brand">
        <img src={logo} alt="Fashion Design Studio Logo" className="logo" />
        <span className="logo-text">Fashion Design Studio</span>
        </Link>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
              <Link to="/" className="nav-link">
                <b>About Us</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/feedback" className="nav-link">
                <b>View Feedback</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/add" className="nav-link">
                <b>Add Feedback</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                <b>User Profile</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/signup" className="nav-link">
                <b>Registration</b>
              </Link>
            </li>
          </ul>
          
        </div>
      </div>
    </nav>
  );
}

export default Header;