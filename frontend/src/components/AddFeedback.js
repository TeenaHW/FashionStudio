import React, { useState, useEffect } from "react"; 
import axios from "axios";
import Swal from 'sweetalert2';
import '../App.css'; 

function AddFeedback() {
    const [customerName, setName] = useState(localStorage.getItem("userName") || "");
    const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
    const [comment, setComment] = useState("");
    const [isChecked, setIsChecked] = useState(false); // State for checkbox
    const [productItem, setProductItem] = useState('');
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const storedEmail = localStorage.getItem("userEmail");

        if (storedName) setName(storedName);
        if (storedEmail) setEmail(storedEmail);
    }, []);

    function sendData(e) {
        e.preventDefault();

        if (!isChecked) {
            alert("You must agree to publish your review before submitting.");
            return;
        }

        const newFeedback = {
            customerName,
            email,
            comment,
            productItem,
            rating
        };

        console.log(newFeedback);

        axios.post("http://localhost:8000/feedback/add", newFeedback)
        .then(() => {
            Swal.fire({
            icon: 'success',
            title: '✅ Feedback Submitted!',
            text: 'Thank you for your valuable feedback.',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
            });

            setTimeout(() => {
            window.location.href = "/feedback";
            }, 2100);
        })
        .catch((err) => {
            Swal.fire({
            icon: 'error',
            title: 'Submission Failed ❌',
            text: err.response?.data?.error || err.message,
            confirmButtonColor: '#d33'
            });
        });

    }

    return (
        <div className="form-container">
            <h1 className="text-center mb-4" style={{ fontFamily: '-moz-initial' }}>
                <b>✍️ Add Feedback</b>
            </h1>
            <form className="bg-light p-4 rounded shadow-sm" style={{ maxWidth: '650px', margin: '0 auto', color: 'black' }} onSubmit={sendData}>
            <div className="mb-3">
                <label htmlFor="CustomerName" className="form-label"><b>Customer Name</b></label>
                <input
                    type="text"
                    className="form-control"
                    id="CustomerName"
                    value={customerName}  // 👈 bind the value!
                    placeholder="Enter your name"
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="CustomerEmail" className="form-label"><b>Email</b></label>
                <input
                    type="email"
                    className="form-control"
                    id="CustomerEmail"
                    value={email}  // 👈 bind the value!
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div id="emailHelp" className="form-text">*We'll never share your email with anyone else.</div>
            </div>

                <div className="mb-3">
                    <label htmlFor="productItem" className="form-label"><b>Product Item</b></label>
                    <select
                        className="form-select"
                        id="productItem"
                        value={productItem}
                        onChange={(e) => setProductItem(e.target.value)}
                        required
                    >
                        <option value="">Select a product</option>
                        <option value="T-Shirts & Polos 👕">T-Shirts & Polos 👕</option>
                        <option value="Hoodies & Sweatshirts 🧥">Hoodies & Sweatshirts 🧥</option>
                        <option value="Shoes & Sandals 👟">Shoes & Sandals 👟</option>
                        <option value="Handbags & Clutches 👜">Handbags & Clutches 👜</option>
                        <option value="Jewelry & Accessories 💍">Jewelry & Accessories 💍</option>
                        <option value="Belts & Scarves 🧣">Belts & Scarves 🧣</option>
                        <option value="Sunglasses 🕶️">Sunglasses 🕶️</option>
                        <option value="CHats & Caps 🧢">CHats & Caps 🧢</option>
                        <option value="Other Products">Other Products</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="Comment" className="form-label"><b>Comment</b></label>
                    <textarea
                        className="form-control" id="Comment" placeholder="Write your comment here..." rows="3"
                        onChange={(e) => setComment(e.target.value)} required
                    ></textarea>
                </div>
                
                <div className="mb-3">
                    <label htmlFor="rating" className="form-label"><b>Rating</b></label>
                    <div id="rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                onClick={() => setRating(star)}
                                style={{
                                    cursor: 'pointer',
                                    color: star <= rating ? '#ffc107' : '#e4e5e9',
                                    fontSize: '24px',
                                    marginRight: '5px'
                                }}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mb-3 form-check">
                    <input
                        type="checkbox" className="form-check-input" id="AgreeCheck"
                        onChange={(e) => setIsChecked(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="AgreeCheck">
                        I agree that my review can be published on the website.
                    </label>
                </div>

                <div className="d-flex justify-content-center">
                    <button type="submit" className="btn btn-primary" style={{ width: '180px' }}>Submit Feedback</button>
                </div>
            </form>
        </div>
    );
}

export default AddFeedback;