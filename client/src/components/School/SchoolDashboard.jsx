import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import Nav from "./Header";
import { useWindowSize } from "react-use";
import Card from "react-bootstrap/Card";
import { MdOutlineDownloading } from "react-icons/md";
import "../../styles/SchoolDashboard.css";
import { FaRegCheckCircle } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { MdOutlinePending } from "react-icons/md";
import { FaRegPauseCircle } from "react-icons/fa";
import { API_BASE_URL } from "../../config";

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [username, setUsername] = useState(null);
  const [ticketCounts, setTicketCounts] = useState({
    Pending: 0,
    Completed: 0,
    Rejected: 0,
    "In Progress": 0,
    "On Hold": 0,
  });
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const { width } = useWindowSize();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/forbidden");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setSchool(decoded.school);
      setUsername(decoded.username);
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/forbidden");
    }
  }, [navigate]);

  useEffect(() => {
    // Only fetch ticket counts if username is available
    if (username) {
      const fetchTicketCounts = async () => {
        try {
          setLoading(true);
          // Fetch tickets for each status
          const statuses = ["Pending", "Completed", "Rejected", "In Progress", "On Hold"];
          const countsObj = {};
          
          // Fetch all counts in parallel using Promise.all
          await Promise.all(
            statuses.map(async (status) => {
              try {
                const response = await axios.get(
                  `${API_BASE_URL}/api/ticket/tickets/${username}/${status}`
                );
                countsObj[status] = response.data.length;
              } catch (err) {
                console.error(`Error fetching ${status} tickets:`, err);
                countsObj[status] = 0;
              }
            })
          );
          
          setTicketCounts(countsObj);
        } catch (error) {
          console.error("Error fetching ticket counts:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchTicketCounts();
      // Set up a refresh interval (every 30 seconds)
      const interval = setInterval(() => fetchTicketCounts(), 30000);
      return () => clearInterval(interval);
    }
  }, [username]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCardClick = (status) => {
    switch (status) {
      case "Pending":
        navigate("/pendingticket");
        break;
      case "Completed":
        navigate("/completedticket");
        break;
      case "Rejected":
        navigate("/rejectedticket");
        break;
      case "In Progress":
        navigate("/inprogressticket");
        break;
      case "On Hold":
        navigate("/onholdticket");
        break;
      default:
        break;
    }
  };

  const statusData = [
    { text: "Pending", color: "text-warning", icon: <MdOutlinePending style={{ fontSize: "70px", color: "#294a70" }} /> },
    { text: "Completed", color: "text-success", icon: <FaRegCheckCircle style={{ fontSize: "70px", color: "#294a70" }} /> },
    { text: "Rejected", color: "text-danger", icon: <MdOutlineCancel style={{ fontSize: "70px", color: "#294a70" }} /> },
    { text: "In Progress", color: "text-primary", icon: <MdOutlineDownloading style={{ fontSize: "70px", color: "#294a70" }} /> },
    { text: "On Hold", color: "text-secondary", icon: <FaRegPauseCircle style={{ fontSize: "70px", color: "#294a70" }} /> },
  ];

  return (
    <div
      style={{
        marginLeft: width >= 768 ? "250px" : "0",
        marginTop: "30px",
        padding: "20px",
      }}
    >
      <Nav />
      {school ? (
        <>
          <div className="mb-5 mt-3">
            <h3 style={{ color: "#294a70" }}>Dashboard</h3>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading counts...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {statusData.map((status, index) => (
                <div key={index} className="col-12 col-sm-6 col-md-3 mb-3">
                  <Card
                    className="mb-3"
                    style={{
                      width: "100%",
                      border: "none",
                      boxShadow: "2px 2px 10px 2px rgba(0, 0, 0, 0.15)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleCardClick(status.text)}
                  >
                    <Card.Body>
                      <div className="row">
                        <div className="col-8">
                          <div>
                            <h1>{ticketCounts[status.text] || 0}</h1>
                          </div>
                          <div>
                            <b>
                              <span className={status.color}>{status.text}</span>
                            </b>{" "}
                            <span className="text-secondary">
                              {ticketCounts[status.text] === 1 ? "Ticket" : "Tickets"}
                            </span>
                          </div>
                        </div>
                        <div
                          className="iconD col-4 d-flex justify-content-center align-items-center m-0"
                          style={{
                            borderRadius: "80px",
                            width: "80px",
                            backgroundColor: "#3b4daf15",
                          }}
                        >
                          {status.icon}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolDashboard;