import React, { useState, useEffect, useCallback } from "react";
import { Card, Table, Button, Badge } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEye } from "react-icons/fa";
import { API_BASE_URL } from "../../config";

const ViewBatches = ({ filterStatus = "all", searchTerm = "" }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Use useCallback to prevent unnecessary re-renders
  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/schoolBatches`);
      setBatches(Array.isArray(response.data) ? response.data : []);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching batches:", err);
      setError("Failed to load batches. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
    // Set up a refresh interval (every 30 seconds)
    const interval = setInterval(fetchBatches);
    return () => clearInterval(interval);
  }, [fetchBatches]);

  const handleViewDevices = async (batchId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/batch/${batchId}/devices`
      );
      const devices = response.data;

      if (!Array.isArray(devices) || devices.length === 0) {
        return Swal.fire({
          title: "No Devices",
          text: "No devices found for this batch",
          icon: "info",
        });
      }

      Swal.fire({
        title: "Batch Devices",
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
                ${devices
                  .map(
                    (device) => `
                  <tr>
                    <td class="px-3">${device.device_type || 'N/A'}</td>
                    <td class="px-3">${device.device_number || 'N/A'}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `,
        width: "800px",
        showCloseButton: true,
        showConfirmButton: false,
        didOpen: () => {
          const content = Swal.getHtmlContainer();
          if (content) {
            content.style.textAlign = "left";
          }
        },
      });
    } catch (error) {
      console.error("View devices error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load batch devices",
        icon: "error",
      });
    }
  };

  const handleCancelBatch = async (batchId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to cancel this batch?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, cancel it!",
      });

      if (result.isConfirmed) {
        await axios.put(`${API_BASE_URL}/cancelbatch/${batchId}`);

        await Swal.fire({
          title: "Cancelled!",
          text: "The batch has been cancelled successfully.",
          icon: "success",
        });

        // Call fetchBatches to update the list immediately
        fetchBatches();
      }
    } catch (error) {
      console.error("Cancel batch error:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to cancel batch",
        icon: "error",
      });
    }
  };

  const handleBatchDetails = (batch) => {
    Swal.fire({
      title: `Batch: ${batch.batch_number || 'Unknown'}`,
      html: `
        <div class="batch-details text-start">
          <div class="batch-info mb-4">
            <div class="row mb-2">
              <div class="col-md-4 fw-bold">School Name:</div>
              <div class="col-md-8">${batch.school_name || 'N/A'}</div>
            </div>
            <div class="row mb-2">
              <div class="col-md-4 fw-bold">School Code:</div>
              <div class="col-md-8">${batch.schoolCode || 'N/A'}</div>
            </div>
            <div class="row mb-2">
              <div class="col-md-4 fw-bold">Send Date:</div>
              <div class="col-md-8">${batch.send_date ? new Date(batch.send_date).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div class="row mb-2">
              <div class="col-md-4 fw-bold">Status:</div>
              <div class="col-md-8">
                <span class="badge rounded-pill" style="background-color: ${getStatusColor(batch.status)}; 
                      font-size: 0.9rem; padding: 0.5em 1em;">
                  ${batch.status || "Unknown"}
                </span>
              </div>
            </div>
            ${
              batch.received_date
                ? `
            <div class="row mb-2">
              <div class="col-md-4 fw-bold">Received Date:</div>
              <div class="col-md-8">${new Date(batch.received_date).toLocaleDateString()}</div>
            </div>
            `
                : ""
            }
            ${
              batch.cancelled_date
                ? `
            <div class="row mb-2">
              <div class="col-md-4 fw-bold">Cancelled Date:</div>
              <div class="col-md-8">${new Date(batch.cancelled_date).toLocaleDateString()}</div>
            </div>
            `
                : ""
            }
          </div>
          
          <div class="d-flex justify-content-center mt-4">
            <button id="viewDevicesBtn" class="btn btn-primary">
              View Devices
            </button>
          </div>
        </div>
      `,
      width: "550px",
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        const viewDevicesBtn = document.getElementById("viewDevicesBtn");
        if (viewDevicesBtn) {
          viewDevicesBtn.addEventListener("click", () => {
            handleViewDevices(batch.batch_id);
          });
        }
      },
    });
  };

  const getStatusColor = (status) => {
    if (!status) return "#6c757d"; // Default gray for undefined status

    switch (status.toLowerCase()) {
      case "delivered":
        return "#28a745";
      case "pending":
        return "#ffc107";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusBadgeVariant = (status) => {
    if (!status) return "secondary"; // Default for undefined status

    switch (status.toLowerCase()) {
      case "delivered":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  // Memoize filtered batches to avoid recalculation on each render
  const filteredBatches = React.useMemo(() => {
    return batches.filter((batch) => {
      const statusMatch =
        filterStatus === "all" ||
        (batch.status &&
          batch.status.toLowerCase() === filterStatus.toLowerCase());

      const search = searchTerm.toLowerCase();
      const searchMatch =
        search === "" ||
        (batch.batch_number &&
          batch.batch_number.toLowerCase().includes(search)) ||
        (batch.school_name && batch.school_name.toLowerCase().includes(search)) ||
        (batch.schoolCode && batch.schoolCode.toString().includes(search));

      return statusMatch && searchMatch;
    });
  }, [batches, filterStatus, searchTerm]);

  if (loading && batches.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading batches...</span>
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
                All Batches
              </h5>
              <span
                className="badge text-light p-2"
                style={{ backgroundColor: "#294a70" }}
              >
                {filteredBatches.length} Batches
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {error && (
            <div className="alert alert-danger m-3" role="alert">
              {error}
            </div>
          )}

          {filteredBatches.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="text-muted">
                {searchTerm || filterStatus !== "all"
                  ? "No batches found matching your search criteria."
                  : "No batches found."}
              </div>
            </div>
          ) : (
            <div
              className="table-responsive"
              style={{ height: "calc(100vh - 180px)", overflowY: "auto" }}
            >
              <Table hover className="mb-0">
                <thead className="sticky-top bg-white" style={{ top: "0" }}>
                  <tr>
                    <th className="px-3" style={{ color: "#294a70" }}>
                      Batch No.
                    </th>
                    <th className="px-3" style={{ color: "#294a70" }}>
                      School Name
                    </th>
                    <th className="px-3" style={{ color: "#294a70" }}>
                      School Code
                    </th>
                    <th className="px-3" style={{ color: "#294a70" }}>
                      Send Date
                    </th>
                    <th className="px-3" style={{ color: "#294a70" }}>
                      Status
                    </th>
                    <th className="px-3 text-center" style={{ color: "#294a70" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map((batch) => (
                    <tr key={batch.batch_id}>
                      <td className="px-3">{batch.batch_number}</td>
                      <td className="px-3">{batch.school_name}</td>
                      <td className="px-3">{batch.schoolCode}</td>
                      <td className="px-3">
                        {batch.send_date
                          ? new Date(batch.send_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-3">
                        <Badge
                          bg={getStatusBadgeVariant(batch.status)}
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.4em 0.6em",
                          }}
                        >
                          {batch.status || "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-3">
                        <div className="d-flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline-info"
                            className="d-flex align-items-center"
                            onClick={() => handleBatchDetails(batch)}
                          >
                            <FaEye className="me-1" /> View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => handleViewDevices(batch.batch_id)}
                          >
                            View Devices
                          </Button>
                          {batch.status &&
                            batch.status.toLowerCase() === "pending" && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() =>
                                  handleCancelBatch(batch.batch_id)
                                }
                              >
                                Cancel Batch
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

      <style jsx>{`
        .dropdown-toggle::after {
          margin-left: 0.5em;
        }

        .batch-details .badge {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .table th,
        .table td {
          vertical-align: middle;
        }

        /* Responsive adjustments */
        @media (max-width: 767px) {
          .d-flex.gap-2 {
            flex-direction: column;
            gap: 0.5rem !important;
          }

          .d-flex.gap-2 .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewBatches;