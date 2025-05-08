import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  Card, 
  Table, 
  Button, 
  Badge,
  Form,
  Row,
  Col,
  Spinner 
} from "react-bootstrap";

import { API_BASE_URL } from "../../config";

const Issues = ({ filterStatus = "all", searchTerm = "" }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newIssueName, setNewIssueName] = useState("");
  const [issueCategory, setIssueCategory] = useState("hardware");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use useCallback to prevent unnecessary re-renders
  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/ticket/issues`);
      setIssues(Array.isArray(response.data) ? response.data : []);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError("Failed to load issues. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
    // Set up a refresh interval (every 30 seconds)
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, [fetchIssues]);

  // Handle adding a new issue
  const handleAddIssue = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate input
    if (!newIssueName || newIssueName.trim() === "") {
      setError("Issue name cannot be empty");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/ticket/addIssue`, {
        issue_name: newIssueName.trim(),
        issue_category: issueCategory
      });

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Issue added successfully!'
      });

      // Reset form and refresh issues list
      setNewIssueName("");
      setIssueCategory("hardware");
      fetchIssues();
    } catch (err) {
      console.error("Error adding issue:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || "Failed to add issue. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an issue
  const handleDeleteIssue = async (issueId) => {
    // Ensure issueId is a number
    if (!issueId || isNaN(Number(issueId))) {
      console.error("Invalid issue ID:", issueId);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid issue ID'
      });
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this issue?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.get(`${API_BASE_URL}/api/ticket/deleteissue/${issueId}`);

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Issue has been deleted.'
        });

        // Refresh issues list
        fetchIssues();
      } catch (err) {
        console.error("Error deleting issue:", err.response?.data || err.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.error || "Failed to delete issue. Please try again."
        });
      }
    }
  };

  // Get category badge variant
  const getCategoryBadgeVariant = (category) => {
    switch (category) {
      case "hardware":
        return "danger";
      case "software":
        return "info";
      default:
        return "secondary";
    }
  };

  // Memoize filtered issues to avoid recalculation on each render
  const filteredIssues = React.useMemo(() => {
    return issues.filter((issue) => {
      const categoryMatch =
        filterStatus === "all" ||
        (issue.issue_category &&
          issue.issue_category.toLowerCase() === filterStatus.toLowerCase());

      const search = searchTerm.toLowerCase();
      const searchMatch =
        search === "" ||
        (issue.issue_name && issue.issue_name.toLowerCase().includes(search));

      return categoryMatch && searchMatch;
    });
  }, [issues, filterStatus, searchTerm]);

  if (loading && issues.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading issues...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vh-90 d-flex flex-column">
      <Card className="flex-grow-1 m-0 border-0 rounded-0">
        <Card.Header
          className="py-3 sticky-top"
          style={{ backgroundColor: "transparent" }}
        >
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0" style={{ color: "#294a70" }}>
                Issue Management
              </h5>
              <span
                className="badge text-light p-2"
                style={{ backgroundColor: "#294a70" }}
              >
                {filteredIssues.length} Issues
              </span>
            </div>
          </div>
        </Card.Header>

        {/* Add Issue Form */}
        <Card.Body className="pt-3 pb-0 px-3">
          <Form onSubmit={handleAddIssue} className="mb-4">
            <Row>
              <Col md={5} sm={12} className="mb-2 mb-md-0">
                <Form.Control
                  type="text"
                  placeholder="Enter issue name"
                  value={newIssueName}
                  onChange={(e) => setNewIssueName(e.target.value)}
                  className="form-control-sm"
                />
              </Col>
              <Col md={4} sm={8} className="mb-2 mb-md-0">
                <Form.Select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="form-control-sm"
                >
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                </Form.Select>
              </Col>
              <Col md={3} sm={4}>
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="btn-sm w-100 py-2"
                  disabled={isSubmitting}
                  style={{ backgroundColor: "#294a70", borderColor: "#294a70" }}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-1" />
                      Adding...
                    </>
                  ) : (
                    <>
                      Add Issue
                    </>
                  )}
                </Button>
              </Col>
            </Row>
            {error && <div className="text-danger small mt-2">{error}</div>}
          </Form>
        </Card.Body>

        <Card.Body className="p-0">
          {error && (
            <div className="alert alert-danger m-3" role="alert">
              {error}
            </div>
          )}

          {filteredIssues.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
              <div className="text-muted">
                {searchTerm || filterStatus !== "all"
                  ? "No issues found matching your search criteria."
                  : "No issues found. Add a new issue to get started."}
              </div>
            </div>
          ) : (
            <div
              className="table-responsive"
              style={{ height: "calc(100vh - 250px)", overflowY: "auto" }}
            >
              <Table hover className="mb-0">
                <thead className="sticky-top bg-white" style={{ top: "0" }}>
                  <tr>
                    <th className="px-3" style={{ color: "#294a70" }}>
                      Issue Name
                    </th>
                    <th className="px-3" style={{ color: "#294a70" }}>
                      Category
                    </th>
                    <th className="px-3 text-center" style={{ color: "#294a70" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue, index) => (
                    <tr key={issue.issue_id || index}>
                      <td className="px-3">{issue.issue_name}</td>
                      <td className="px-3">
                        <Badge
                          bg={getCategoryBadgeVariant(issue.issue_category)}
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.4em 0.6em",
                          }}
                        >
                          {issue.issue_category === "hardware" ? (
                            <>Hardware</>
                          ) : (
                            <>Software</>
                          )}
                        </Badge>
                      </td>
                      <td className="px-3 text-center">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDeleteIssue(issue.issue_id)}
                        >Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>

        <Card.Footer className="bg-white border-0 p-3">
          <div className="d-flex justify-content-between align-items-center text-muted small">
            <div>
              Total Issues: <strong>{filteredIssues.length}</strong>
            </div>
            <div className="d-flex gap-3">
              <span>
                Hardware: <strong>{filteredIssues.filter(i => i.issue_category === "hardware").length}</strong>
              </span>
              <span>
                Software: <strong>{filteredIssues.filter(i => i.issue_category === "software").length}</strong>
              </span>
            </div>
          </div>
        </Card.Footer>
      </Card>

      <style jsx>{`
        .table th,
        .table td {
          vertical-align: middle;
        }

        /* Responsive adjustments */
        @media (max-width: 767px) {
          .badge {
            font-size: 0.75rem !important;
          }
          
          .table th, .table td {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Issues;