import React, { useState, useEffect } from 'react';
import axios from "axios";
import '../App.css'; 
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import autoTable from 'jspdf-autotable';

function ViewFeedback() {
    const [feedbacks, setFeedback] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [actionEmail, setActionEmail] = useState('');
    const [editComment, setEditComment] = useState('');
    const [editRating, setEditRating] = useState(0);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState("");

    const userRole = localStorage.getItem("userRole");

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = () => {
        axios.get("http://localhost:8000/feedback/")
            .then((res) => {
                const sortedFeedbacks = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                console.log("Sorted Feedbacks (Check Dates):", sortedFeedbacks); // 👈 ADD THIS
                setFeedback(sortedFeedbacks);
            })
            .catch((err) => alert(err.message));
    };       

    const handleActionClick = (feedback, actionType) => {
        setEditingId(actionType === 'edit' ? feedback._id : null);
        setDeletingId(actionType === 'delete' ? feedback._id : null);
        setEditComment(actionType === 'edit' ? feedback.comment : '');
        setEditRating(actionType === 'edit' ? feedback.rating : 0);
        setActionEmail('');
        setError('');
    };

    const verifyEmail = (feedbackId) => {
        const feedbackItem = feedbacks.find(fb => fb._id === feedbackId);
        if (!feedbackItem) {
            setError("Feedback not found.");
            return false;
        }
        if (actionEmail !== feedbackItem.email) {
            setError("Please enter the correct email address associated with the feedback.");
            return false;
        }
        return true;
    };

    const handleSave = async (feedbackId) => {
        if (!verifyEmail(feedbackId)) return;

        try {
            const response = await axios.put(
                `http://localhost:8000/feedback/update/${feedbackId}`,
                { email: actionEmail, comment: editComment, rating: editRating }
            );

            if (response.status === 200) {
                setFeedback(feedbacks.map(fb => 
                    fb._id === feedbackId ? { ...fb, comment: editComment, rating: editRating} : fb
                ));
                cancelActions();
            }
        } catch (err) {
            setError("Error updating feedback. Please try again.");
        }
    };

    const handleDelete = async (feedbackId) => {
        if (!verifyEmail(feedbackId)) return;

        try {
            const response = await axios.delete(
                `http://localhost:8000/feedback/delete/${feedbackId}`
            );

            if (response.status === 200) {
                fetchFeedbacks();
                cancelActions();
            }
        } catch (err) {
            setError("Error deleting feedback. Please try again.");
        }
    };

    const cancelActions = () => {
        setEditingId(null);
        setDeletingId(null);
        setActionEmail('');
        setError('');
    };

    const maskEmail = (email) => {
        const [name, domain] = email.split("@");
        return `${name.slice(0, 3)}***@${domain}`;
    };

    //pdf generating
    const generatePDF = () => {
        const doc = new jsPDF();
    
        doc.setFontSize(18);
        doc.text('Customer Feedback Report', 14, 22);
    
        const tableColumn = ["Name", "Email", "Date", "Rating", "Comment"];
        const tableRows = [];
    
        feedbacks.forEach(feedback => {
            const feedbackData = [
                feedback.customerName || "Anonymous",
                feedback.email || "N/A",
                new Date(feedback.date).toLocaleDateString(),
                feedback.rating || "-",
                feedback.comment
            ];
            tableRows.push(feedbackData);
        });
    
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: { fontSize: 10 },
        });
    
        doc.save('Feedback_Report.pdf');
    };
    

    const filteredFeedbacks = [...feedbacks]
    .filter((feedback) =>
        (feedback.customerName && feedback.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (feedback.productItem && feedback.productItem.toLowerCase().includes(searchTerm.toLowerCase()))
        
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));  // 👈 ADD sorting here again after filter
   
    
    return (
        <div className="feedback-container">
            <h1 className="feedback-title">Customer Feedbacks of Our Products</h1>
            {/* SearchBox */}
            <div className="search-bar1">
                <input
                    type="text"
                    placeholder="Search by name or product..."
                    className="form-control mb-3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {error && <div className="error-message">{error}</div>}

            
            <div className="feedback-list">

            {(searchTerm ? filteredFeedbacks : feedbacks).map((feedback) => (
                    <div className="feedback-card" key={feedback._id}>
                        <div className="feedback-header">
                            <div>
                                <span className="customer-name">
                                    {feedback.customerName || 'Anonymous'}
                                </span>
                                {feedback.email && (
                                    <div className="email">
                                        {maskEmail(feedback.email)}
                                    </div>
                                )}
                            </div>
                            <div className="feedback-right">
                                <span className="feedback-date">
                                    {feedback.updatedAt
                                        ? `${new Date(feedback.updatedAt).toLocaleDateString()} (updated)`
                                        : new Date(feedback.date).toLocaleDateString()}
                                </span>

                                {feedback.rating && (
                                    <div className="rating-stars">
                                        {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {(editingId === feedback._id || deletingId === feedback._id) ? (
                            <div className="action-form">
                                <input
                                    type="email"
                                    placeholder="Enter your email to confirm"
                                    className="email-input"
                                    value={actionEmail}
                                    onChange={(e) => setActionEmail(e.target.value)}
                                />
                                
                                {editingId === feedback._id && (
                                    <>
                                        <textarea
                                            className="comment-edit"
                                            value={editComment}
                                            onChange={(e) => setEditComment(e.target.value)}
                                        />

                                        <div className="rating-stars" style={{ marginTop: '6px' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    style={{
                                                        cursor: 'pointer',
                                                        color: star <= editRating ? 'gold' : '#ccc',
                                                        border: '1px solid black',
                                                        padding: '2px 4px',
                                                        borderRadius: '4px',
                                                        fontSize: '1.6em',
                                                        marginRight: '4px',
                                                        transition: '0.2s'
                                                    }}
                                                    onClick={() => setEditRating(star)}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}


                                <div className="action-buttons">
                                    {editingId === feedback._id ? (
                                        <button 
                                            className="save-button"
                                            onClick={() => handleSave(feedback._id)}
                                        >
                                            Save
                                        </button>
                                    ) : (
                                        <button 
                                            className="delete-button"
                                            onClick={() => handleDelete(feedback._id)}
                                        >
                                            Confirm Delete
                                        </button>
                                    )}
                                    <button 
                                        className="cancel-button"
                                        onClick={cancelActions}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {feedback.productItem && (
                                    <div className="product-item">
                                        <strong>🥥 Product:</strong> {feedback.productItem}
                                    </div>
                                )}

                                <div className="feedback-comment">
                                    {feedback.comment}
                                </div>
                                
                                <div className="action-controls">
                                    <button 
                                        className="update-button"
                                        onClick={() => handleActionClick(feedback, 'edit')}
                                    >
                                        Update
                                    </button>
                                    <button 
                                        className="delete-button"
                                        onClick={() => handleActionClick(feedback, 'delete')}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                
                {feedbacks.length === 0 && (
                    <div className="no-feedback">No feedbacks available</div>
                )}
                {feedbacks.length > 0 && filteredFeedbacks.length === 0 && (
                    <div className="no-feedback">No matching feedback found.</div>
                )}

            </div>
            {(userRole === "Admin" || userRole === "Manager") && (
            <button className="report-button" onClick={generatePDF}>
                📄 Generate Feedback Report
            </button>
            )}
            {(userRole === "Admin" || userRole === "Manager") && (
                <button
                    className="analyticsbtn"
                    onClick={() => window.location.href = "/feedback-analytics"}
                >
                    📊 View Feedback Analytics
                </button>
)}

        </div>
    );
}

export default ViewFeedback;