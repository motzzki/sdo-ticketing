import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import "../../styles/AdminDashboard.css";
import { Alert, Form, Tab } from "react-bootstrap";
import SupportTickets from "./SupportTickets";
import NewAccountRequests from "./NewAccountRequests";
import ResetAccountRequests from "./ResetAccountRequests";
import BatchCreate from "./BatchCreate";
import AdminHeader from "./AdminHeader";
import ViewBatches from "./ViewBatches";
import Issues from "./Issues";
import AdminChangePassword from "./AdminChangePassword";
import { useWindowSize } from "react-use";
import { API_BASE_URL } from "../../config";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [newAccountRequests, setNewAccountRequests] = useState([]);
  const [resetAccountRequests, setResetAccountRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("tickets");
  const { width } = useWindowSize();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetchTickets();
    if (!token) {
      navigate("/forbidden");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setLastName(decoded.lastname);
      setFirstName(decoded.firstname);
      setUsername(decoded.username);
      setRole(decoded.role || "Admin");
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/forbidden");
    }
  }, [navigate]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tickets`);
      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error("Received data is not an array");
      }

      setTickets(data);
      setError("");
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("Failed to load tickets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNewAccountRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/deped-account-requests"
      );
      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error("Received new account data is not an array");
      }

      setNewAccountRequests(data);
    } catch (error) {
      console.error("Error fetching new account requests:", error);
      setError("Failed to load new account requests. Please try again later.");
    }
  };

  // Fetch reset account requests
  const fetchResetAccountRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/deped-account-reset-requests"
      );
      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error("Received reset account data is not an array");
      }

      setResetAccountRequests(data);
    } catch (error) {
      console.error("Error fetching reset account requests:", error);
      setError(
        "Failed to load reset account requests. Please try again later."
      );
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTickets(),
      fetchNewAccountRequests(),
      fetchResetAccountRequests(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusOptions = [
    "Completed",
    "Pending",
    "On Hold",
    "In Progress",
    "Rejected",
  ];
  const accountStatusOptions = [
    "Completed",
    "Pending",
    "In Progress",
    "Rejected",
  ];
  const viewBatchOptions = ["Delivered", "Pending"];
  const issuesCategoryOptions = ["Hardware", "Software"]; // Added category options for issues

  // Handle tab change from header
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset filter and search when changing tabs
    setFilterStatus("all");
    setSearchTerm("");
  };

  // Determine if search/filter should be visible
  // const shouldShowSearchFilter = activeTab !== "batchCreate";
  const shouldShowSearchFilter = activeTab !== "batchCreate" && activeTab !== "adminchangepass";

  // Get search placeholder based on active tab
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "issues":
        return "Enter issue name";
      case "tickets":
        return "Enter No. or Requestor or Category";
      case "newAccounts":
        return "Enter No. or Type or Name or School";
      case "resetAccounts":
        return "Enter No. or Type or Name or School";
      case "viewBatches":
        return "Enter No.	or School Name	or School Code";
      default:
        return "Search";
    }
  };

  // Get filter options based on active tab
  const getFilterOptions = () => {
    switch (activeTab) {
      case "tickets":
        return statusOptions;
      case "newAccounts":
      case "resetAccounts":
        return accountStatusOptions;
      case "viewBatches":
        return viewBatchOptions;
      case "issues":
        return issuesCategoryOptions;
      default:
        return [];
    }
  };

  return (
    <>
      <style>
        {`
          @media (min-width: 768px) {
            .main-content {
              margin-left: 250px;
              transition: margin-left 0.3s ease-in-out;
            }
          }

          .search-filter-container {
            background-color: white;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>

      {/* Admin Header Component */}
      <AdminHeader
        firstName={firstName}
        lastName={lastName}
        username={username}
        role={role}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      {/* Main Content */}
      <div
        className="main-content"
        style={{
          marginLeft: width >= 768 ? "250px" : "0",
          marginTop: "50px",
          padding: "20px",
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Search and Filter - Only show if not on BatchCreate tab */}
        {shouldShowSearchFilter && (
          <div className="row search-filter-container flex-wrap">
            <div className="col-6 d-flex justify-content-start">
              <Form.Control
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-100"
                style={{ maxWidth: "50%" }}
              />
            </div>
            <div className="col-6 d-flex justify-content-end">
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-100"
                style={{ maxWidth: "25%" }}
              >
                <option value="all">All {activeTab === "issues" ? "Categories" : "Status"}</option>
                {getFilterOptions().map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
        )}

        {/* Content Based on Active Tab */}
        <Tab.Container activeKey={activeTab}>
          <Tab.Content>
            <Tab.Pane eventKey="tickets">
              <SupportTickets
                tickets={tickets}
                loading={loading}
                filterStatus={filterStatus}
                searchTerm={searchTerm}
                fetchTickets={fetchTickets}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="newAccounts">
              <NewAccountRequests
                newAccountRequests={newAccountRequests}
                loading={loading}
                filterStatus={filterStatus}
                searchTerm={searchTerm}
                fetchNewAccountRequests={fetchNewAccountRequests}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="resetAccounts">
              <ResetAccountRequests
                resetAccountRequests={resetAccountRequests}
                loading={loading}
                filterStatus={filterStatus}
                searchTerm={searchTerm}
                fetchResetAccountRequests={fetchResetAccountRequests}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="batchCreate">
              <BatchCreate />
            </Tab.Pane>

            <Tab.Pane eventKey="viewBatches">
              <ViewBatches
                filterStatus={filterStatus}
                searchTerm={searchTerm}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="issues">
              <Issues
                filterStatus={filterStatus}
                searchTerm={searchTerm}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="adminchangepass">
              <AdminChangePassword />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </>
  );
};

export default AdminDashboard;