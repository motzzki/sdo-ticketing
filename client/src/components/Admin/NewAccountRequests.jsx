import React, { useState } from "react";
import { Table, Button, Badge } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../config";

const NewAccountRequests = ({
  newAccountRequests,
  loading,
  filterStatus,
  searchTerm,
  fetchNewAccountRequests,
}) => {
  const [error, setError] = useState("");

  const handleOpenFiles = (request) => {
    const files = {
      endorsement_letter: request.endorsement_letter || "",
      prc_id: request.prc_id || "",
      proof_of_identity: request.proof_of_identity || "",
    };

    // Filter out empty file entries
    const validFiles = Object.entries(files).filter(
      ([key, filename]) => filename
    );

    const filesHTML = `
            <div class="files-container">
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    ${validFiles
                      .map(([key, filename]) => {
                        const icon = getFileIcon(filename);
                        return `
                            <div class="col">
                                <div class="card h-100">
                                    <div class="card-body d-flex flex-column">
                                        <div class="text-center mb-3">
                                            <span style="font-size: 2.5rem;">${icon}</span>
                                        </div>
                                        <h5 class="card-title text-truncate mb-3" title="${filename}">
                                            ${filename}
                                        </h5>
                                        <div class="mt-auto">
                                            <button class="btn btn-primary btn-sm w-100 open-file" 
                                                data-filename="${filename}">
                                                Open File
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                      })
                      .join("")}
                </div>
            </div>
        `;

    Swal.fire({
      title: "Account Request Files",
      html: filesHTML,
      width: "80%",
      customClass: {
        container: "files-swal-container",
        popup: "files-swal-popup",
        content: "files-swal-content",
      },
      didOpen: () => {
        // Add event listeners to the open file buttons
        document.querySelectorAll(".open-file").forEach((button) => {
          button.addEventListener("click", () => {
            const filename = button.getAttribute("data-filename");
            window.open(
              `${API_BASE_URL}/deped_uploads/${filename}`,
              "_blank"
            );
          });
        });
      },
    });
  };

  const handleUpdateNewAccountStatus = async (requestId, newStatus) => {
    try {
      const result = await Swal.fire({
        title: "Update Status",
        text: `Are you sure you want to mark this request as ${newStatus}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: getStatusColor(newStatus),
        confirmButtonText: `Yes, mark as ${newStatus}`,
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await axios.put(
          `${API_BASE_URL}/deped-account-requests/${requestId}/status`,
          {
            status: newStatus,
          }
        );
        await fetchNewAccountRequests();

        Swal.fire({
          title: "Status Updated",
          text: `Request status has been updated to ${newStatus}`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      setError("Failed to update request status");

      Swal.fire({
        title: "Error",
        text: "Failed to update request status",
        icon: "error",
      });
    }
  };

  const handleShowNewRequestDetails = (request) => {
    const statusOptionsHTML = accountStatusOptions
      .filter((status) => status.toLowerCase() !== request.status.toLowerCase())
      .map((status) => {
        return `<option value="${status}" style="color: black;">${status}</option>`;
      })
      .join("");

    const currentStatusBadge = `
            <div class="current-status-badge mb-3">
                <span class="badge rounded-pill" style="background-color: ${getStatusColor(
                  request.status
                )}; 
                      font-size: 0.9rem; padding: 0.5em 1em;">
                    Current Status: ${request.status}
                </span>
            </div>
        `;

    // Count valid files
    const files = {
      endorsement_letter: request.endorsement_letter || "",
      prc_id: request.prc_id || "",
      proof_of_identity: request.proof_of_identity || "",
    };
    const fileCount = Object.values(files).filter((file) => file).length;

    // Create attachments button like in SupportTickets
    const attachmentsButton =
      fileCount > 0
        ? `<button class="btn btn-outline-secondary mt-3 view-attachments">
                 <i class="fas fa-paperclip"></i> View Attachments (${fileCount})
               </button>`
        : "";

    Swal.fire({
      title: `Request ID: ${request.id}`,
      html: `
                <div class="request-details text-start">
                    <div class="request-info mb-4">
                        <div class="row mb-2">
                            <div class="col-md-3 fw-bold">Account Type:</div>
                            <div class="col-md-9">${request.selected_type}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-3 fw-bold">Last Name:</div>
                            <div class="col-md-9">${request.surname}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-3 fw-bold">First Name:</div>
                            <div class="col-md-9">${request.first_name}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-3 fw-bold">Middle Name:</div>
                            <div class="col-md-9">${formatMiddleName(
                              request.middle_name
                            )}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-3 fw-bold">Designation:</div>
                            <div class="col-md-9">${request.designation}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-3 fw-bold">School:</div>
                            <div class="col-md-9">${request.school}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-3 fw-bold">School ID:</div>
                            <div class="col-md-9">${request.school_id}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-3 fw-bold">Personal Gmail:</div>
                            <div class="col-md-9">${
                              request.personal_gmail
                            }</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-3 fw-bold">Date Created:</div>
                            <div class="col-md-9">${new Date(
                              request.created_at
                            ).toLocaleString()}</div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-between status-update">
                        <div>
                            <h5>Status:</h5>
                        </div>
                        
                        <div class="text-center">
                            ${currentStatusBadge}
                        </div>
                    </div>

                    <div class="d-flex justify-content-between mb-4">
                        <div>
                            <h5>Update Status:</h5>
                        </div>
                        <div>
                            <select id="statusDropdown" class="form-select status-dropdown" style="width: 150px;">
                                <option value="" selected disabled>Change Status</option>
                                    ${statusOptionsHTML}
                            </select>
                        </div>  
                    </div>
                    
                    <div class="d-flex justify-content-center">
                        <button id="updateStatusBtn" class="btn btn-outline-dark update-status-btn">
                            Update Status
                        </button>
                    </div>
                    
                    <div class="text-center mt-4">
                        ${attachmentsButton}
                    </div>
                </div>
            `,
      width: "700px",
      customClass: {
        container: "request-swal-container",
        popup: "request-swal-popup",
        content: "request-swal-content",
      },
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        // Add event listener for update status button
        const updateBtn = document.getElementById("updateStatusBtn");
        const statusDropdown = document.getElementById("statusDropdown");

        updateBtn.addEventListener("click", () => {
          const selectedStatus = statusDropdown.value;
          if (selectedStatus) {
            handleUpdateNewAccountStatus(request.id, selectedStatus);
          } else {
            Swal.showValidationMessage("Please select a status");
          }
        });

        // Add event listener for attachments button if it exists
        const attachmentsBtn = document.querySelector(".view-attachments");
        if (attachmentsBtn) {
          attachmentsBtn.addEventListener("click", () => {
            handleOpenFiles(request);
          });
        }
      },
    });
  };

  const getFileIcon = (filename) => {
    if (!filename) return "❓";
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "jpg":
      case "jpeg":
      case "png":
        return "🖼️";
      default:
        return "📎";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "on hold":
        return "secondary";
      case "in progress":
        return "primary";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#28a745";
      case "pending":
        return "#ffc107";
      case "on hold":
        return "#6c757d";
      case "in progress":
        return "#007bff";
      case "rejected":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  // Function to display N/A for empty middle names
  const formatMiddleName = (middleName) => {
    return middleName && middleName.trim() !== "" ? middleName : "N/A";
  };

  const filteredNewAccountRequests = newAccountRequests
  .filter((request) => {
    if (filterStatus === "all") return true;
    return request.status.toLowerCase() === filterStatus.toLowerCase();
  })
  .filter((request) => {
    if (searchTerm === "") return true;

    const searchTermLower = searchTerm.toLowerCase();

    // Search in request number - check if property exists and handle various formats
    if (request.requestNumber !== undefined) {
      const requestNumberStr = String(request.requestNumber).toLowerCase();
      if (requestNumberStr.includes(searchTermLower)) {
        return true;
      }
    }
    
    // Fallback to id if requestNumber is not present
    if (request.id !== undefined) {
      const idStr = String(request.id).toLowerCase();
      if (idStr.includes(searchTermLower)) {
        return true;
      }
    }

    // Search in account type
    if (
      request.selected_type &&
      request.selected_type.toLowerCase().includes(searchTermLower)
    ) {
      return true;
    }

    // Search in name fields (first name, surname, middle name)
    if (
      (request.first_name &&
        request.first_name.toLowerCase().includes(searchTermLower)) ||
      (request.surname &&
        request.surname.toLowerCase().includes(searchTermLower)) ||
      (request.middle_name &&
        request.middle_name.toLowerCase().includes(searchTermLower))
    ) {
      return true;
    }

    // Search in school
    if (
      request.school &&
      request.school.toLowerCase().includes(searchTermLower)
    ) {
      return true;
    }

    return false;
  });

  const accountStatusOptions = [
    "Completed",
    "Pending",
    "In Progress",
    "Rejected",
  ];

  return (
    <>
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading requests...</p>
        </div>
      ) : (
        <div>
          {/* Add a header with a badge for the count of filtered requests */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0" style={{ color: "#294a70" }}>
              New Account Requests
            </h5>
            <span
              className="badge text-light p-2"
              style={{ backgroundColor: "#294a70" }}
            >
              {filteredNewAccountRequests.length} Requests
            </span>
          </div>

          {filteredNewAccountRequests.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th className="text-center">Request #</th>
                    <th className="text-center">Account Type</th>
                    <th className="text-center">Last Name</th>
                    <th className="text-center">First Name</th>
                    <th className="text-center">Middle Name</th>
                    <th className="text-center">School</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Date</th>
                    <th className="text-center" style={{ width: "12%" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNewAccountRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="text-center">{request.requestNumber}</td>
                      <td className="text-center">{request.selected_type}</td>
                      <td className="text-center">{request.surname}</td>
                      <td className="text-center">{request.first_name}</td>
                      <td className="text-center">
                        {formatMiddleName(request.middle_name)}
                      </td>
                      <td className="text-center">{request.school}</td>
                      <td>
                        <Badge
                          bg={getStatusBadgeVariant(request.status)}
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.4em 0.6em",
                          }}
                        >
                          {request.status}
                        </Badge>
                      </td>
                      <td>
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="d-flex justify-content-between">
                        <div>
                          <Button
                            size="sm"
                            variant="outline-info"
                            className="d-flex align-items-center me-2"
                            onClick={() => handleShowNewRequestDetails(request)}
                          >
                            View
                          </Button>
                        </div>
                        <div>
                          {(() => {
                            // Count valid files
                            const files = {
                              endorsement_letter:
                                request.endorsement_letter || "",
                              prc_id: request.prc_id || "",
                              proof_of_identity:
                                request.proof_of_identity || "",
                            };
                            const fileCount = Object.values(files).filter(
                              (file) => file
                            ).length;

                            return fileCount > 0 ? (
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                className="d-flex align-items-center"
                                onClick={() => handleOpenFiles(request)}
                                style={{ width: "65px" }}
                              >
                                Files ({fileCount})
                              </Button>
                            ) : null;
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h5>No new account requests found</h5>
              <p className="text-muted">
                Try adjusting your filters or search term
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add CSS styles similar to the SupportTickets component */}
      <style jsx>{`
        .status-dropdown {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #dee2e6;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .status-dropdown:focus {
          border-color: #80bdff;
          outline: 0;
          box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
        }

        .update-status-btn {
          transition: all 0.2s;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .update-status-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .current-status-badge .badge {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .files-container .card {
          transition: all 0.2s;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .files-container .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
};

export default NewAccountRequests;
