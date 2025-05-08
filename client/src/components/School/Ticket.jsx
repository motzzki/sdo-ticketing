import Nav from "./Header";
import { useWindowSize } from "react-use";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FaRegTrashAlt } from "react-icons/fa";
import {
  Container,
  Card,
  Col,
  Form,
  Row,
  Button,
  Modal,
} from "react-bootstrap";
import Swal from 'sweetalert2';
import { API_BASE_URL } from "../../config";

const Ticket = () => {
  const [ticketNumber, setTicketNumber] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const fileInputRef = useRef(null);
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    requestor: "",
    category: "",
    subcategory: "",
    otherSubcategory: "",
    request: "",
    comments: "",
    attachments: [],
    attachmentPreviews: [],
    selectedDevices: [],
    batch: ""
  });

  // Add state for issues
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/ticket/issues`);
        setIssues(response.data);

        // Extract unique categories from issues
        const uniqueCategories = [...new Set(response.data.map(issue => issue.issue_category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load categories and issues");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.category) {
      setFormData(prev => ({
        ...prev,
        subcategory: "",
        otherSubcategory: "",
        request: ""
      }));
    }
  }, [formData.category]);


  // Example device selection handler
  const handleDeviceSelect = (device) => {
    setSelectedDevices(prev => [...prev, device]);
  };

  // Example device deselection handler
  const handleDeviceDeselect = (deviceId) => {
    setSelectedDevices(prev => prev.filter(d => d.batch_devices_id !== deviceId));
  };

  const handleDeviceSelection = (deviceId, isChecked) => {
    setFormData(prev => {
      if (isChecked) {
        return {
          ...prev,
          selectedDevices: [...prev.selectedDevices, deviceId]
        };
      } else {
        return {
          ...prev,
          selectedDevices: prev.selectedDevices.filter(id => id !== deviceId)
        };
      }
    });
  };

  const handleViewDevices = async (batchId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/batch/getbatch/${batchId}/devices`);
      const devices = response.data;

      Swal.fire({
        title: 'Batch Devices',
        html: `
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="px-3" style="color: #294a70">Select</th>
                <th class="px-3" style="color: #294a70">Device Type</th>
                <th class="px-3" style="color: #294a70">Serial Number</th>
              </tr>
            </thead>
            <tbody id="devices-table-body">
              ${devices.map(device => {
          const isSelected = selectedDevices.some(d => d.deviceId === device.device_number);
          const existingDescription = isSelected
            ? selectedDevices.find(d => d.deviceId === device.device_number).description
            : '';

          return `
                  <tr>
                    <td class="px-3">
                      <input type="checkbox" class="device-checkbox" data-id="${device.device_number}" 
                        ${isSelected ? 'checked' : ''}>
                    </td>
                    <td class="px-3">${device.device_type}</td>
                    <td class="px-3">${device.device_number}</td>
                    <td class="px-3">
                    </td>
                  </tr>
                `;
        }).join('')}
            </tbody>
          </table>
        </div>
      `,
        width: '800px',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Save Selections',
        preConfirm: () => {
          // Get all checked devices with their descriptions
          const newSelectedDevices = Array.from(document.querySelectorAll(".device-checkbox:checked"))
            .map(checkbox => {
              const deviceId = checkbox.getAttribute("data-id");
              const descriptionElem = document.querySelector(`.issue-description[data-id="${deviceId}"]`);
              const description = descriptionElem ? descriptionElem.value : '';

              return { deviceId, description };
            });

          setSelectedDevices(newSelectedDevices);
          return newSelectedDevices;
        },
        didOpen: () => {
          // Attach event listeners after the modal is fully opened
          document.querySelectorAll('.device-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
              const deviceId = this.getAttribute('data-id');
              const descriptionContainer = document.getElementById(`description-container-${deviceId}`);
              if (this.checked) {
                descriptionContainer.style.display = 'block';
              } else {
                descriptionContainer.style.display = 'none';
              }
            });
          });

          // Align content
          const content = Swal.getHtmlContainer();
          if (content) {
            content.style.textAlign = 'left';
          }
        }
      });
    } catch (error) {
      setError("Failed to load devices");
      console.error("View devices error:", error);
    }
  };



  useEffect(() => {
    if (formData.subcategory === "Other") {
      setFormData(prev => ({
        ...prev,
        request: formData.otherSubcategory
      }));
    } else if (formData.subcategory) {
      setFormData(prev => ({
        ...prev,
        request: formData.subcategory
      }));
    }
  }, [formData.subcategory, formData.otherSubcategory]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setFormData((prev) => ({
          ...prev,
          requestor: decoded.username || "",
        }));
      } catch (error) {
        console.error("Error decoding token", error);
        setError("Authentication error. Please try logging in again.");
      }
    }
  }, []);
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded); // Debug to see what's in your token

        if (!decoded.schoolCode) {
          console.error("No school code in token");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/batch/batches/${decoded.schoolCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Batches response:", response.data);
        setBatches(response.data);
      } catch (error) {
        console.error("Error fetching batches:", error);
        // Add more detailed error logging
        if (error.response) {
          console.error("Server response:", error.response.status, error.response.data);
        }
      }
    };

    fetchBatches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      setFormData(prev => ({
        ...prev,
        category: value,
        subcategory: "",
        otherSubcategory: ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    setError("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024;

    if (files.some((file) => file.size > maxSize)) {
      setError("Some files exceed the 5MB size limit");
      return;
    }

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            attachments: [...prev.attachments, file],
            attachmentPreviews: [
              ...prev.attachmentPreviews,
              { name: file.name, url: reader.result },
            ],
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, file],
          attachmentPreviews: [...prev.attachmentPreviews, { name: file.name }],
        }));
      }
    });
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
      attachmentPreviews: prev.attachmentPreviews.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    console.log("Form Data before submission:", formData);
    console.log("Raw selectedDevices before sending:", selectedDevices);
    console.log("Stringified selectedDevices:", JSON.stringify(selectedDevices));

    if (!formData.category || !formData.request || !formData.comments) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    if (formData.category === "Hardware" && !formData.batch) {
      setError("Please select a batch for hardware issues");
      setIsSubmitting(false);
      return;
    }

    if (formData.category === "Hardware" && selectedDevices.length === 0) {
      setError("Please select at least one device");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'attachments' && key !== 'attachmentPreviews') {
        data.append(key, value);
      }
    });
    data.append("status", "Pending");

    // Ensure selectedDevices is properly stringified
    data.append("selectedDevices", JSON.stringify(selectedDevices));

    formData.attachments.forEach(file => data.append("attachments", file));

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ticket/createTickets`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Response from server:", response.data);

      setTicketNumber(response.data.ticketNumber);
      setSelectedDevices([]);
      setFormData(prev => ({
        requestor: prev.requestor,
        category: "",
        subcategory: "",
        otherSubcategory: "",
        request: "",
        comments: "",
        attachments: [],
        attachmentPreviews: [],
        batch: "",
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      Swal.fire({
        title: 'Success!',
        html: `
          <p>${response.data.message}</p>
          <p>Your Ticket Number: <strong>${response.data.ticketNumber}</strong></p>
        `,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#294a70'
      });

    } catch (error) {
      console.error("Error submitting ticket:", error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.error || "Error submitting the ticket. Please try again.",
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#294a70'
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderDeviceCheckbox = (device) => (
    <div key={device.batch_devices_id} className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        id={`device-${device.batch_devices_id}`}
        checked={formData.selectedDevices.includes(device.batch_devices_id)}
        onChange={(e) => handleDeviceSelection(device.batch_devices_id, e.target.checked)}
      />
      <label className="form-check-label" htmlFor={`device-${device.batch_devices_id}`}>
        {device.device_name}
      </label>
    </div>
  );

  const { width } = useWindowSize();
  const sidebarWidth = width >= 768 ? "250px" : "0";
  return (
    <div
      className="ticket-container"
      style={{
        marginLeft: sidebarWidth,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Nav />
      <Container fluid className="">
        <Row className="justify-content-center">
          <Col xs={12} sm={11} md={10} lg={8} xl={7}>
            <form onSubmit={handleSubmit}>
              <Card className="shadow-sm mt-5" style={{ height: '85vh', width: '100%', border: 'none' }}>
                <Card.Body className="p-4" style={{ overflow: 'auto' }}>
                  <h3 className="mb-4" style={{ color: "#294a70" }}>
                    Requestor: {formData.requestor}
                  </h3>

                  {/* Category */}
                  <Row className="mb-3">
                    <Form.Label column xs={12} sm={3} md={4}>
                      Category
                    </Form.Label>
                    <Col xs={12} sm={9} md={12}>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {/* Capitalize first letter, lowercase the rest */}
                            {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>

                  {/* Subcategory Dropdown (only shown when category is selected) */}
                  {formData.category && (
                    <Row className="mb-3">
                      <Form.Label column xs={12} sm={3} md={5}>
                        {/* Capitalize displayed category */}
                        {formData.category.charAt(0).toUpperCase() + formData.category.slice(1).toLowerCase()} Issue
                      </Form.Label>
                      <Col xs={12} sm={9} md={12}>
                        <Form.Select
                          name="subcategory"
                          value={formData.subcategory}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Issue</option>
                          {issues
                            .filter(issue => issue.issue_category === formData.category)
                            .map(issue => (
                              <option key={issue.issue_id} value={issue.issue_name}>
                                {issue.issue_name}
                              </option>
                            ))}
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Col>
                    </Row>
                  )}

                  {formData.category.toLowerCase() === "hardware" && (
                    <Row className="mb-3">
                      <Form.Label column xs={12} sm={3} md={4}>
                        Select Batch
                      </Form.Label>
                      <Col xs={12} sm={9} md={12}>
                        <Form.Select
                          name="batch"
                          value={formData.batch}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Batch</option>
                          {batches.map((batch) => (
                            <option key={batch.batch_id} value={batch.batch_id}>
                              {batch.batch_number} - {batch.school_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  )}

                  {formData.batch && (
                    <Row className="mb-3">
                      <Col xs={12}>
                        <div className="d-flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleViewDevices(formData.batch)}
                          >
                            View Devices
                          </Button>
                          {status === "Pending" && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleReceiveBatch(formData.batch)}
                            >
                              Receive
                            </Button>
                          )}
                        </div>
                      </Col>
                    </Row>
                  )}

                  {formData.subcategory === "Other" && (
                    <Row className="mb-3">
                      <Form.Label column xs={12} sm={3} md={4}>
                        Specify Issue
                      </Form.Label>
                      <Col xs={12} sm={9} md={12}>
                        <Form.Control
                          type="text"
                          name="otherSubcategory"
                          value={formData.otherSubcategory}
                          onChange={handleChange}
                          placeholder="Please specify your issue"
                          required
                        />
                      </Col>
                    </Row>
                  )}


                  {/* Comments */}
                  <Row className="mb-3">
                    <Form.Label column xs={12} sm={3} md={4}>
                      Comments
                    </Form.Label>
                    <Col xs={12} sm={9} md={12}>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                        placeholder="Please provide additional details"
                        required
                      />
                    </Col>
                  </Row>

                  {/* Attachments */}
                  <Row className="mb-3">
                    <Form.Label column xs={12} sm={3} md={5}>
                      Attachments
                    </Form.Label>
                    <Col xs={12} sm={9} md={12}>
                      <Form.Control
                        ref={fileInputRef} // Add ref here
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                      {formData.attachmentPreviews.length > 0 && (
                        <div className="mt-3">
                          {formData.attachmentPreviews.map((file, index) => (
                            <div
                              key={index}
                              className="d-flex align-items-center mb-2 p-2"
                            >
                              {file.url && (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="me-2"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                              <div className="d-flex justify-content-between align-items-center w-100">
                                <span className="text-truncate">
                                  {file.name}
                                </span>
                                <Button
                                  variant="link"
                                  className="text-danger p-0 ms-2"
                                  onClick={() => handleRemoveAttachment(index)}
                                >
                                  <FaRegTrashAlt />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>

                {/* Submit Button */}
                <Card.Footer className="text-center border-0 bg-transparent pb-4">
                  <Button
                    variant="dark"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2"
                    style={{
                      minWidth: "150px",
                      backgroundColor: "#294a70",
                      border: "none",
                    }}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </Card.Footer>
              </Card>
            </form>
          </Col>
        </Row>
      </Container>

      {/* Modal for displaying success/error messages */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{message && <p>{message}</p>}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ticketNumber && (
            <p>
              Your Ticket Number: <strong>{ticketNumber}</strong>
            </p>
          )}
          {error && <p className="text-danger">{error}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Ticket;
