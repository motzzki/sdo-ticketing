import React, { useState, useEffect, useCallback } from "react";
import { Card, Table, Button, Form, InputGroup, Alert } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSearch, FaExclamationTriangle } from "react-icons/fa";
import { API_BASE_URL } from "../../config";

const BatchList = ({ status }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleViewDevices = async (batchId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/batch/${batchId}/devices`);
      const devices = response.data;

      if (!Array.isArray(devices) || devices.length === 0) {
        return Swal.fire({
          title: "No Devices",
          text: "No devices found for this batch",
          icon: "info",
        });
      }

      Swal.fire({
        title: 'Batch Devices',
        html: `
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th class="px-3" style="color: #294a70">Device Type</th>
                  <th class="px-3" style="color: #294a70">Serial Number</th>
                </tr>
              </thead>
              <tbody>
                ${devices.map(device => `
                  <tr>
                    <td class="px-3">${device.device_type || 'N/A'}</td>
                    <td class="px-3">${device.device_number || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `,
        width: '800px',
        showCloseButton: true,
        showConfirmButton: false,
        didOpen: () => {
          const content = Swal.getHtmlContainer();
          if (content) {
            content.style.textAlign = 'left';
          }
        }
      });
    } catch (error) {
      console.error("View devices error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load devices",
        icon: "error"
      });
    }
  };

  const handleReceiveBatch = async (batchId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to receive this batch?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, receive it!"
      });

      if (result.isConfirmed) {
        await axios.put(`${API_BASE_URL}/receivebatch/${batchId}`);
        await Swal.fire({
          title: "Received!",
          text: "The batch has been received successfully.",
          icon: "success"
        });
        
        // Update list without full reload
        setBatches((prevBatches) =>
          prevBatches.filter((batch) => batch.batch_id !== batchId)
        );
      }
    } catch (error) {
      console.error("Receive error:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to receive batch",
        icon: "error"
      });
    }
  };

  const fetchBatches = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      // Decode JWT token to get school code
      const decoded = jwtDecode(token);
      if (!decoded.schoolCode) {
        throw new Error("School code not found in token");
      }
      
      // Use lowercase status for API endpoint
      const statusParam = status.toLowerCase();
      
      const response = await axios.get(
        `${API_BASE_URL}/receivebatch/${decoded.schoolCode}/${statusParam}`
      );
      
      // Handle different API response formats safely
      setBatches(Array.isArray(response.data) ? response.data : []);
      setError(""); // Clear any previous errors
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error(`Error fetching ${status} batches:`, err);
      
      // Format error message for display
      const errorMessage = err.response?.data?.error || err.message || `Failed to fetch ${status} batches`;
      setError(errorMessage);
      
      // Implement retry logic for network errors
      if (retryCount < maxRetries && (err.code === 'ECONNABORTED' || !err.response)) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchBatches(), 2000); // Retry after 2 seconds
      }
    } finally {
      setLoading(false);
    }
  }, [status, retryCount]);

  useEffect(() => {
    fetchBatches();
    
    // Set up refresh interval
    const interval = setInterval(fetchBatches, 30000);
    return () => clearInterval(interval);
  }, [fetchBatches]);

  // Memoize filtered batches
  const filteredBatches = React.useMemo(() => {
    return batches.filter(batch => 
      (batch.batch_number && batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (batch.school_name && batch.school_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (batch.status && batch.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [batches, searchTerm]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading batches...</span>
      </div>
    </div>
  );

  const getStatusStyle = () => {
    switch(status.toLowerCase()) {
      case "pending":
        return { color: "#ffffff", bgColor: "#ffc107" }; 
      case "received":
      case "delivered":
        return { color: "#ffffff", bgColor: "#28a745" }; 
      case "cancelled":
        return { color: "#ffffff", bgColor: "#dc3545" }; 
      default:
        return { color: "#ffffff", bgColor: "#6c757d" }; 
    }
  };
  const statusStyle = getStatusStyle();

  return (
    <div className="vh-90 d-flex flex-column" style={{ marginTop: '60px' }}>
      <Card className="flex-grow-1 m-0 border-0 rounded-0">
        <Card.Header className="py-3 sticky-top" style={{ top: '56px', backgroundColor: "transparent" }}>
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{color: '#294a70'}}>{status} Batches</h5>
              <span className="badge text-light p-2" style={{backgroundColor: '#294a70'}}>
                {filteredBatches.length} Batches
              </span>
            </div>
            <div className="row">
              <div className="col-md-6 col-lg-4">
                <InputGroup>
                  <InputGroup.Text style={{backgroundColor: '#294a70', color: 'white'}}>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search batches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search batches"
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSearchTerm("")}
                    >
                      Clear
                    </Button>
                  )}
                </InputGroup>
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {error && (
            <Alert variant="danger" className="m-3">
              <div className="d-flex align-items-center">
                <FaExclamationTriangle className="me-2" />
                <span>{error}</span>
              </div>
              <div className="mt-2">
                <Button size="sm" variant="outline-danger" onClick={() => fetchBatches()}>
                  Retry
                </Button>
              </div>
            </Alert>
          )}
          
          {!error && filteredBatches.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="text-muted">
                {searchTerm 
                  ? "No batches match your search criteria." 
                  : `No ${status.toLowerCase()} batches found.`}
              </div>
            </div>
          ) : (
            <div className="table-responsive" style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              <Table hover className="mb-0">
                <thead className="sticky-top bg-white" style={{ top: '0' }}>
                  <tr>
                    <th className="px-3" style={{color: '#294a70'}}>Batch No.</th>
                    <th className="px-3" style={{color: '#294a70'}}>School Name</th>
                    <th className="px-3" style={{color: '#294a70'}}>Send Date</th>
                    {status.toLowerCase() === "received" && (
                      <th className="px-3" style={{color: '#294a70'}}>Received Date</th>
                    )}
                    {status.toLowerCase() === "cancelled" && (
                      <th className="px-3" style={{color: '#294a70'}}>Cancelled Date</th>
                    )}
                    <th className="px-3" style={{color: '#294a70'}}>Status</th>
                    <th className="px-3 text-center" style={{color: '#294a70'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map((batch) => (
                    <tr key={batch.batch_id}>
                      <td className="px-3">{batch.batch_number}</td>
                      <td className="px-3">{batch.school_name}</td>
                      <td className="px-3">
                        {batch.send_date ? new Date(batch.send_date).toLocaleDateString() : '-'}
                      </td>
                      {status.toLowerCase() === "received" && (
                        <td className="px-3">
                          {batch.received_date ? new Date(batch.received_date).toLocaleDateString() : '-'}
                        </td>
                      )}
                      {status.toLowerCase() === "cancelled" && (
                        <td className="px-3">
                          {batch.cancelled_date ? new Date(batch.cancelled_date).toLocaleDateString() : '-'}
                        </td>
                      )}
                      <td className="px-3">
                        <span 
                          className="badge" 
                          style={{
                            backgroundColor: statusStyle.bgColor, 
                            color: statusStyle.color,
                            padding: "0.4em 0.6em",
                            fontSize: "0.85rem"
                          }}
                        >
                          {batch.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-3">
                        <div className="gap-2 d-flex justify-content-between">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleViewDevices(batch.batch_id)}
                          >
                            View Devices
                          </Button>
                          {status.toLowerCase() === "pending" && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleReceiveBatch(batch.batch_id)}
                            >
                              Receive
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default BatchList;