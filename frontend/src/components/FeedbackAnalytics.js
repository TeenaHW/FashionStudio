import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import '../App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function FeedbackAnalytics() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:8000/feedback/")
            .then((res) => {
                setFeedbacks(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const productCounts = {};
    feedbacks.forEach((fb) => {
        if (fb.productItem) {
            productCounts[fb.productItem] = (productCounts[fb.productItem] || 0) + 1;
        }
    });

    const data = {
        labels: Object.keys(productCounts),
        datasets: [
            {
                label: "Feedbacks",
                data: Object.values(productCounts),
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                    "#FF9F40", "#E7E9ED", "#7CB342", "#EC407A"
                ],
                borderColor: "#ffffff",
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // ✅ fix re-render problem
        plugins: {
            legend: {
                position: "right", // ✅ move categories to right
                labels: {
                    boxWidth: 20,
                    padding: 20,
                }
            },
            tooltip: {
                enabled: true,
            },
        },
        animation: {
            animateRotate: false, // ✅ stop rotate animation on hover
            animateScale: true
        }
    };

    return (
        <div className="analytics-container">
          <h1 className="feedback-title">📈 Feedback Analytics</h1>
      
          <div className="analytics-wrapper"> {/* ✅ Wrap everything inside this */}
            {/* 👉 Description text */}
            <p className="analytics-description">
              This chart shows the number of feedbacks received for each product category based on customer reviews.
            </p>
      
            {loading ? (
              <p>Loading analytics...</p>
            ) : Object.keys(productCounts).length > 0 ? (
              <div className="chart-area">
                <div style={{ width: "400px", height: "400px" }}>
                  <Pie data={data} options={options} />
                </div>
              </div>
            ) : (
              <p>No feedbacks available for analysis yet.</p>
            )}
      
            <div className="d-flex justify-content-center">
              <button className="btn btn-primary" onClick={() => window.history.back()}>
                🔙 Go Back
              </button>
            </div>
          </div>
        </div>
      );
      
}

export default FeedbackAnalytics;
