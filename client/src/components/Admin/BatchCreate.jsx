import { useWindowSize } from "react-use";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FaRegTrashAlt } from "react-icons/fa";
import { Dropdown } from 'react-bootstrap';

import {
  Container,
  Card,
  Col,
  Form,
  Row,
  FloatingLabel,
  Button,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../config";

const BatchCreate = () => {
  const [district, setDistrict] = useState("");
  const [schools, setSchools] = useState([]);
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [sendDate, setSendDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [error, setError] = useState("");
  const [batchCounter, setBatchCounter] = useState(1);
  const [currentDate, setCurrentDate] = useState("");
  const [devices, setDevices] = useState([]);
  const [batchDevices, setBatchDevices] = useState([]);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track the device index when adding a new device
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(null);

  useEffect(() => {
    if (district) {
      axios
        .get(`${API_BASE_URL}/api/batch/schools?district=${district}`)
        .then((response) => {
          console.log("API Response:", response.data);
          setSchools(Array.isArray(response.data) ? response.data : []);
        })
        .catch((err) => {
          console.error(err);
          setError("Error fetching schools.");
        });
    }
    axios
      .get(`${API_BASE_URL}/api/batch/devices`)
      .then((response) => {
        setDevices(Array.isArray(response.data) ? response.data : []);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching device types.");
      });

    const today = new Date();
    const todayDate = today.toISOString().split("T")[0].replace(/-/g, "");
    setCurrentDate(todayDate);
  }, [district]);

  useEffect(() => {
    const fetchNextBatchNumber = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/batch/nextBatchNumber`
        );
        setBatchNumber(response.data.nextBatchNumber);
      } catch (err) {
        console.error("Error fetching next batch number:", err);
        setError("Error generating batch number.");
      }
    };

    fetchNextBatchNumber();
  }, []);

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
  };

  const handleDelete = async (deviceName) => {
    if (!deviceName) {
      console.error("Device name is missing!");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/batch/deletedevice/${encodeURIComponent(deviceName)}`);
      if (response.data.success) {
        console.log("Device deleted successfully");

        // Remove the deleted device from the state
        setDevices((prevDevices) => prevDevices.filter(device => device.device_name !== deviceName));
      } else {
        console.error("Error deleting device:", response.data.error);
      }
    } catch (error) {
      console.error("Error deleting device:", error.message);
    }
  };

  const handleSchoolChange = (e) => {
    const selectedSchoolCode = e.target.value;
    setSchoolCode(selectedSchoolCode);

    console.log("Selected school code:", selectedSchoolCode);
    console.log("Available schools:", schools);

    const selectedSchool = schools.find(
      (school) => school.schoolCode === parseInt(selectedSchoolCode)
    );
    console.log("Found school:", selectedSchool);

    if (selectedSchool) {
      setSchoolName(selectedSchool.school_name || selectedSchool.school);
      console.log(
        "Setting school name to:",
        selectedSchool.school_name || selectedSchool.school
      );
    } else {
      setSchoolName("");
      console.log("No school found, clearing school name");
    }
  };

  const generateBatchNumber = () => {
    const counterFormatted = batchCounter.toString().padStart(4, "0");
    return `${currentDate}-${counterFormatted}`;
  };

  const handleAddDevice = () => {
    setBatchDevices([...batchDevices, { deviceType: "", serialNumber: "" }]);
  };

  const handleDeviceChange = (index, field, value) => {
    if (value === "new") {
      // Store the current index for reference when adding a new device
      setCurrentDeviceIndex(index);
      showAddDeviceModal();
      return;
    }

    const updatedDevices = [...batchDevices];
    updatedDevices[index] = { ...updatedDevices[index], [field]: value };
    setBatchDevices(updatedDevices);
  };

  const showAddDeviceModal = () => {
    Swal.fire({
      title: 'Add New Device Type',
      input: 'text',
      inputLabel: 'Device Name',
      inputPlaceholder: 'Enter device name',
      showCancelButton: true,
      confirmButtonText: 'Add Device Type',
      showLoaderOnConfirm: true,
      preConfirm: (deviceName) => {
        if (!deviceName || deviceName.trim() === '') {
          Swal.showValidationMessage('Please enter a device name');
          return false;
        }
        return addNewDeviceType(deviceName);
      },
      allowOutsideClick: () => !Swal.isLoading()
    });
  };

  const addNewDeviceType = async (deviceName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/batch/adddevice`, {
        device_name: deviceName,
      });

      if (response.status === 200) {
        const newDevice = {
          device_id: response.data.device_id,
          device_name: deviceName,
        };

        // Add new device to the list
        setDevices(prevDevices => [...prevDevices, newDevice]);

        // Auto-select the newly created device for the current row
        if (currentDeviceIndex !== null) {
          const updatedBatchDevices = [...batchDevices];
          updatedBatchDevices[currentDeviceIndex] = {
            ...updatedBatchDevices[currentDeviceIndex],
            deviceType: deviceName
          };
          setBatchDevices(updatedBatchDevices);

          // Reset currentDeviceIndex after using it
          setCurrentDeviceIndex(null);
        }

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'New device type added successfully!'
        });

        return true;
      }
    } catch (err) {
      console.error("Error adding device:", err);
      Swal.showValidationMessage(
        err.response?.data?.error || "Failed to add device. Please try again."
      );
      return false;
    }
  };

  const handleRemoveDevice = (index) => {
    const updatedDevices = batchDevices.filter((_, i) => i !== index);
    setBatchDevices(updatedDevices);
  };

  const resetForm = () => {
    setDistrict("");
    setSchoolCode("");
    setSchoolName("");
    setSendDate("");
    setBatchDevices([]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    // Reset error state
    setError("");
  
    // Basic validation
    if (!sendDate || !district || !schoolCode || !schoolName) {
      setError("All fields are required.");
      setIsSubmitting(false);
      return;
    }
  
    // Device validation
    if (
      batchDevices.length === 0 ||
      batchDevices.some((device) => !device.deviceType || !device.serialNumber)
    ) {
      setError("All device information must be completed.");
      setIsSubmitting(false);
      return;
    }
  
    // Prepare the batch data
    const newBatch = {
      batchNumber,
      sendDate,
      district,
      schoolCode,
      schoolName,
      devices: batchDevices,
    };
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/batch/createbatch`,
        newBatch
      );
  
      // Handle duplicate serial numbers response
      if (response.data.error && response.data.error === "Duplicate serial numbers found") {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate Serial Numbers',
          html: `The following serial numbers already exist in the system:<br><br>
                 ${response.data.duplicates.join('<br>')}<br><br>
                 Please use different serial numbers or contact support if you need to override this.`,
          confirmButtonText: 'OK',
          customClass: {
            confirmButton: 'btn btn-dark',
          },
          buttonsStyling: false
        });
        setIsSubmitting(false);
        return;
      }
  
      // Handle success case
      if (response.status === 200 || response.status === 201) {
        // Reset form
        resetForm();
        
        // Get the next batch number
        const nextBatchResponse = await axios.get(
          `${API_BASE_URL}/api/batch/nextBatchNumber`
        );
        setBatchNumber(nextBatchResponse.data.nextBatchNumber);
  
        // Show success message
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Batch created successfully!',
          showConfirmButton: false,
          timer: 2000
        });
  
        // Optional: Reset devices if you want to start fresh
        setBatchDevices([]);
      } else {
        throw new Error("Failed to create batch");
      }
    } catch (err) {
      console.error("Error creating batch:", err);
      
      // Handle specific error cases
      let errorMessage = "An error occurred while creating the batch. Please try again.";
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = err.response.data.error || "Invalid data submitted.";
        } else if (err.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }
  
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-dark',
        },
        buttonsStyling: false
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div
      className="batch-container"
      style={{
        display: "flex",
        overflowY: "auto",
        minHeight: "100vh",
      }}
    >
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} sm={11} md={10} lg={8} xl={7}>
            <Form onSubmit={handleSubmit}>
              <Card
                className="shadow-sm"
                style={{ height: "85vh", width: "100%", border: "none" }}
              >
                <Card.Body className="p-4" style={{ overflow: "auto" }}>
                  {/* District */}
                  <Row className="mb-3">
                    <Form.Label column xs={12} sm={3} md={4}>
                      District:
                    </Form.Label>
                    <Col xs={12} sm={9} md={12}>
                      <Form.Select
                        name="district"
                        value={district}
                        onChange={handleDistrictChange}
                        required
                      >
                        <option value="">Select District</option>
                        <option value="1">District 1</option>
                        <option value="2">District 2</option>
                        <option value="3">District 3</option>
                        <option value="4">District 4</option>
                        <option value="5">District 5</option>
                        <option value="6">District 6</option>
                      </Form.Select>
                    </Col>
                  </Row>

                  {/* School */}
                  <Row className="mb-3">
                    <Form.Label column xs={12} sm={3} md={4}>
                      School:
                    </Form.Label>
                    <Col xs={12} sm={9} md={12}>
                      <Form.Select
                        name="school"
                        value={schoolCode}
                        onChange={handleSchoolChange}
                        disabled={!district}
                      >
                        <option value="">Select School</option>
                        {Array.isArray(schools) &&
                          schools.map((school) => (
                            <option key={school.schoolCode} value={school.schoolCode}>
                              {school.school}
                            </option>
                          ))}
                      </Form.Select>
                    </Col>
                  </Row>

                  {/* Delivery Date */}
                  <Row className="mb-3">
                    <Form.Label column xs={12} sm={3} md={4}>
                      Delivery Date:
                    </Form.Label>
                    <Col xs={12} sm={9} md={12}>
                      <Form.Control
                        type="date"
                        value={sendDate}
                        onChange={(e) => setSendDate(e.target.value)}
                      ></Form.Control>
                    </Col>
                  </Row>

                  {/* Batch Number */}
                  <Row className="mb-3">
                    <Form.Label column xs={12} sm={3} md={4}>
                      Batch Number:
                    </Form.Label>
                    <Col xs={12} sm={9} md={12}>
                      <Form.Control type="text" value={batchNumber} disabled />
                    </Col>
                  </Row>

                  {/* Devices Section */}
                  <div className="mt-4">
                    <h4>Devices</h4>
                    <Button variant="secondary" onClick={handleAddDevice} className="mb-3">
                      Add Device
                    </Button>

                    {batchDevices.map((device, index) => (
                      <Row key={index} className="mb-3">
                        {/* Device Dropdown */}
                        <Col md={5}>
                          <Dropdown>
                            <Dropdown.Toggle variant="light" className="w-100">
                              {device.deviceType ? device.deviceType : "Select Device Type"}
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="w-100">
                              {devices.length > 0 ? (
                                devices.map((deviceOption) => (
                                  <Dropdown.Item
                                    key={deviceOption.device_id}
                                    onClick={() =>
                                      handleDeviceChange(index, "deviceType", deviceOption.device_name)
                                    }
                                    className="d-flex justify-content-between align-items-center"
                                  >
                                    {deviceOption.device_name}
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent dropdown from closing
                                        console.log("Clicked delete for device:", deviceOption.device_name); // Debugging log
                                        handleDelete(deviceOption.device_name);
                                      }}
                                    >
                                      🗑
                                    </Button>
                                  </Dropdown.Item>
                                ))
                              ) : (
                                <Dropdown.Item disabled>No devices available</Dropdown.Item>
                              )}

                              <Dropdown.Divider />
                              <Dropdown.Item onClick={() => handleDeviceChange(index, "deviceType", "new")}>
                                + Add New Device Type
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </Col>

                        {/* Serial Number */}
                        <Col md={5}>
                          <Form.Control
                            type="text"
                            placeholder="Serial Number"
                            value={device.serialNumber}
                            onChange={(e) =>
                              handleDeviceChange(index, "serialNumber", e.target.value)
                            }
                          />
                        </Col>

                        {/* Remove Device Button */}
                        <Col md={2}>
                          <Button variant="danger" onClick={() => handleRemoveDevice(index)}>
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </div>

                  {error && <div className="text-danger mt-3">{error}</div>}
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
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BatchCreate;