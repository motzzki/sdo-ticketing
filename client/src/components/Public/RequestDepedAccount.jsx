import React, { useState, useEffect } from "react";
import { Form, Button, Container, Card, Row, Col, Alert, FloatingLabel } from "react-bootstrap";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Modal } from 'react-bootstrap';
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../config";

  const RequestDepedAccount = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedRequestType, setSubmittedRequestType] = useState("");
  const [schools, setSchools] = useState([]); // Store schools from the database
  const [designations, setDesignations] = useState([]); // Store designations from the database
  const [formData, setFormData] = useState({
    requestType: "",
    selectedType: "",
    surname: "",
    firstName: "",
    middleName: "",
    designation: "",
    school: "",
    schoolID: "",
    personalGmail: "",
    employeeNumber: "",
    proofOfIdentity: null,
    prcID: null,
    endorsementLetter: null,
    attachmentPreviews: []
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch schools from the database on component mount
    const fetchSchools = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/schoolList"`);
        if (response.ok) {
          const data = await response.json();
          setSchools(data);
        } else {
          setError("Failed to fetch schools.");
        }
      } catch (err) {
        console.error("Error fetching schools:", err);
        setError("Error fetching schools. Please check your network and server.");
      }
    };

        // Fetch designations from the database on component mount
        const fetchDesignations = async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/designations"`);
            if (response.ok) {
              const data = await response.json();
              setDesignations(data);
            } else {
              setError("Failed to fetch designations.");
            }
          } catch (err) {
            console.error("Error fetching designations:", err);
            setError("Error fetching designations. Please check your network and server.");
          }
        };
    
        fetchSchools();
        fetchDesignations();
  }, []);

  
  const handleRequestTypeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      requestType: e.target.value,
      // Reset selectedType when changing request type
      selectedType: "",
      school: "",
      schoolID: ""
    }));
    setError("");
  };

  const handleTypeChange = (e) => {
    setFormData(prev => ({ ...prev, selectedType: e.target.value }));
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSchoolChange = (e) => {
    const selectedSchoolName = e.target.value;
    const selectedSchool = schools.find(school => school.school === selectedSchoolName);

    if (selectedSchool) {
      setFormData(prev => ({
        ...prev,
        school: selectedSchool.school,
        schoolID: selectedSchool.schoolCode,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        school: "",
        schoolID: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    if (file.size > maxSize) {
      setError("File size exceeds 5MB limit");
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [name]: file,
          attachmentPreviews: [
            ...prev.attachmentPreviews,
            { name: file.name, url: reader.result, type: name }
          ]
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: file,
        attachmentPreviews: [
          ...prev.attachmentPreviews,
          { name: file.name, type: name }
        ]
      }));
    }
  };

  const handleRemoveAttachment = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: null,
      attachmentPreviews: prev.attachmentPreviews.filter(file => file.type !== type)
    }));
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/"); // Redirect to login page
  };

  // Add this email validation function
  const isValidGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
  
    const { requestType, selectedType, surname, firstName, middleName, school, schoolID, employeeNumber, designation, personalGmail, proofOfIdentity, prcID, endorsementLetter } = formData;
  
    if (!requestType || !selectedType || !surname || !firstName || !school || !schoolID) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }
  
    let endpoint = "";
    let options = {
      method: "POST",
    };
  
    let body = null;
  
    if (requestType === "new") {
      endpoint = `${API_BASE_URL}/request-deped-account`;
      body = new FormData();
  
      body.append("selectedType", selectedType);
      body.append("surname", surname);
      body.append("firstName", firstName);
      body.append("middleName", middleName);
      body.append("designation", designation);
      body.append("school", school);
      body.append("schoolID", schoolID);
      body.append("personalGmail", personalGmail);
      body.append("proofOfIdentity", proofOfIdentity);
      body.append("prcID", prcID);
      body.append("endorsementLetter", endorsementLetter);
  
      options.body = body;
  
      if (!isValidGmail(personalGmail)) {
        setError("Please provide a valid Gmail address (must end with @gmail.com)");
        setIsSubmitting(false);
        return;
      }
    } else if (requestType === "reset") {
      endpoint = `${API_BASE_URL}/reset-deped-account`;
      body = JSON.stringify({
        selectedType: selectedType,
        surname: surname,
        firstName: firstName,
        middleName: middleName,
        school: school,
        schoolID: schoolID,
        employeeNumber: employeeNumber
      });
      options.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
  
      options.body = body;
  
      if (!employeeNumber) {
        setError("Please provide your employee number");
        setIsSubmitting(false);
        return;
      }
    }
  
    try {
      const response = await fetch(endpoint, options);
  
      if (response.ok) {
        const responseData = await response.json();
        const requestNumber = responseData.requestNumber || responseData.resetNumber;
  
        Swal.fire({
          title: 'Success!',
          html: `${requestType === 'new' ? 'New Account' : 'Reset Account'} request has been submitted successfully!<br><br>Request Number: <b>${requestNumber}</b><br><br>Please screenshot to check your status`,
          icon: 'success',
          confirmButtonText: 'Done',
          willClose: () => {
            navigate("/"); // Redirect to login page
          }
        });
  
        // Reset form
        setFormData({
          requestType: "",
          selectedType: "",
          surname: "",
          firstName: "",
          middleName: "",
          designation: "",
          school: "",
          schoolID: "",
          personalGmail: "",
          employeeNumber: "",
          proofOfIdentity: null,
          prcID: null,
          endorsementLetter: null,
          attachmentPreviews: []
        });
      } else {
        const errorText = await response.text();
        console.error("Server responded with an error:", errorText);
        setError(`Failed to submit request: ${response.status} - ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setError(`Error submitting request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Mobile view (no container) */}
      <div className="d-block d-md-none mt-4 px-2">
        <form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          
          <div className="mb-4">
            <h3>DepEd Account Request</h3>
          </div>
  
          {/* Request Type dropdown */}
          <Form.Group as={Row} className="mb-3">
          <Form.Label column xs={12} sm={12} md={3} lg={2}>Request Type</Form.Label>
          <Col xs={12} sm={12} md={9} lg={10}>
              <Form.Select
                value={formData.requestType}
                name="requestType"
                onChange={handleRequestTypeChange}
                required
              >
                <option value="">-- Select Request Type --</option>
                <option value="new">Request New Account</option>
                <option value="reset">Reset Existing Account</option>
              </Form.Select>
            </Col>
          </Form.Group>
  
          {/* Conditional form fields based on request type */}
          {formData.requestType && (
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12}>Account Type</Form.Label>
              <Col xs={12}>
                <Form.Select
                  value={formData.selectedType}
                  name="selectedType"
                  onChange={handleTypeChange}
                  required
                >
                  <option value="">-- Select Account Type --</option>
                  <option value="gmail">DepEd Gmail Account</option>
                  <option value="office365">Office 365 Account</option>
                </Form.Select>
              </Col>
            </Form.Group>
          )}
  
          {/* Common fields for both request types */}
          {formData.selectedType && (
            <>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column xs={12}>Name</Form.Label>
                <Col xs={12}>
                  <Row>
                    <Col xs={12} className="mb-2">
                      <FloatingLabel label="Surname">
                        <Form.Control
                          type="text"
                          name="surname"
                          value={formData.surname || ''}
                          onChange={handleChange}
                          placeholder="Surname"
                          required
                        />
                      </FloatingLabel>
                    </Col>
                    <Col xs={12} className="mb-2">
                      <FloatingLabel label="First Name">
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName || ''}
                          onChange={handleChange}
                          placeholder="First Name"
                          required
                        />
                      </FloatingLabel>
                    </Col>
                    <Col xs={12}>
                      <FloatingLabel label="Middle Name">
                        <Form.Control
                          type="text"
                          name="middleName"
                          value={formData.middleName || ''}
                          onChange={handleChange}
                          placeholder="Middle Name"
                        />
                      </FloatingLabel>
                    </Col>
                  </Row>
                </Col>
              </Form.Group>
  
              <Form.Group as={Row} className="mb-3">
                <Form.Label column xs={12}>School</Form.Label>
                <Col xs={12}>
                  <Form.Select
                    name="school"
                    value={formData.school}
                    onChange={handleSchoolChange}
                    required
                  >
                    <option value="">-- Select School --</option>
                    {schools.map((school) => (
                      <option key={school.schoolCode} value={school.school}>
                        {school.school}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Form.Group>
  
              <Form.Group as={Row} className="mb-3">
                <Form.Label column xs={12}>School ID</Form.Label>
                <Col xs={12}>
                  <FloatingLabel label="School ID">
                    <Form.Control
                      type="text"
                      name="schoolID"
                      value={formData.schoolID}
                      placeholder="School ID"
                      readOnly
                      required
                    />
                  </FloatingLabel>
                </Col>
              </Form.Group>
  
              {/* Fields specific to new account request */}
              {formData.requestType === "new" && (
                <>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column xs={12}>Designation</Form.Label>
                    <Col xs={12}>
                      <Form.Select
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Select Designation --</option>
                        {designations.map((designation) => (
                          <option key={designation.id} value={designation.designation}>
                            {designation.designation}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Form.Group>
  
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column xs={12}>Personal Gmail</Form.Label>
                    <Col xs={12}>
                      <FloatingLabel label="Personal Gmail Account">
                        <Form.Control
                          type="email"
                          name="personalGmail"
                          value={formData.personalGmail}
                          onChange={handleChange}
                          placeholder="name@gmail.com"
                          required
                        />
                      </FloatingLabel>
                    </Col>
                  </Form.Group>
  
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column xs={12}>Proof of Identity</Form.Label>
                    <Col xs={12}>
                      <Form.Control
                        type="file"
                        name="proofOfIdentity"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        required
                      />
                      {formData.attachmentPreviews.map((file, index) => (
                        file.type === 'proofOfIdentity' && (
                          <div key={index} className="d-flex align-items-center mt-2">
                            {file.url && (
                              <img
                                src={file.url}
                                alt={file.name}
                                style={{ width: "50px", height: "50px", marginRight: "10px" }}
                              />
                            )}
                            <div className="d-flex justify-content-between pe-2" style={{ width: "100%" }}>
                              <span>{file.name}</span>
                              <button
                                type="button"
                                className="btn text-danger"
                                onClick={() => handleRemoveAttachment('proofOfIdentity')}
                              >
                                <FaRegTrashAlt />
                              </button>
                            </div>
                          </div>
                        )
                      ))}
                    </Col>
                  </Form.Group>
  
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column xs={12}>PRC ID</Form.Label>
                    <Col xs={12}>
                      <Form.Control
                        type="file"
                        name="prcID"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        required
                      />
                      {formData.attachmentPreviews.map((file, index) => (
                        file.type === 'prcID' && (
                          <div key={index} className="d-flex align-items-center mt-2">
                            {file.url && (
                              <img
                                src={file.url}
                                alt={file.name}
                                style={{ width: "50px", height: "50px", marginRight: "10px" }}
                              />
                            )}
                            <div className="d-flex justify-content-between pe-2" style={{ width: "100%" }}>
                              <span>{file.name}</span>
                              <button
                                type="button"
                                className="btn text-danger"
                                onClick={() => handleRemoveAttachment('prcID')}
                              >
                                <FaRegTrashAlt />
                              </button>
                            </div>
                          </div>
                        )
                      ))}
                    </Col>
                  </Form.Group>
  
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column xs={12}>Endorsement Letter</Form.Label>
                    <Col xs={12}>
                      <Form.Control
                        type="file"
                        name="endorsementLetter"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        required
                      />
                      {formData.attachmentPreviews.map((file, index) => (
                        file.type === 'endorsementLetter' && (
                          <div key={index} className="d-flex align-items-center mt-2">
                            {file.url && (
                              <img
                                src={file.url}
                                alt={file.name}
                                style={{ width: "50px", height: "50px", marginRight: "10px" }}
                              />
                            )}
                            <div className="d-flex justify-content-between pe-2" style={{ width: "100%" }}>
                              <span>{file.name}</span>
                              <button
                                type="button"
                                className="btn text-danger"
                                onClick={() => handleRemoveAttachment('endorsementLetter')}
                              >
                                <FaRegTrashAlt />
                              </button>
                            </div>
                          </div>
                        )
                      ))}
                    </Col>
                  </Form.Group>
                </>
              )}
  
              {/* Fields specific to reset account request */}
              {formData.requestType === "reset" && (
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column xs={12}>Employee Number</Form.Label>
                  <Col xs={12}>
                    <FloatingLabel label="Employee Number">
                      <Form.Control
                        type="text"
                        name="employeeNumber"
                        value={formData.employeeNumber}
                        onChange={handleChange}
                        placeholder="Employee Number"
                        required
                      />
                    </FloatingLabel>
                  </Col>
                </Form.Group>
              )}
            </>
          )}
  
          <div className="d-flex justify-content-center mb-4 mt-4">
            <Button
              variant="dark"
              type="submit"
              className="w-100 py-2"
              disabled={isSubmitting || !formData.selectedType}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
  
      {/* Tablet and Desktop view (with container) */}
      <Container className="mt-5 d-none d-md-block">
        <form onSubmit={handleSubmit}>
          <Card
            className="m-auto"
            style={{
              width: "70%",
              border: "none",
              boxShadow: "2px 2px 10px 2px rgba(0, 0, 0, 0.15)",
              height: "85vh",
              overflowY: "auto"
            }}
          >
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
  
            <Card.Body>
              <div className="mb-4" >
                <h3 className= "fs-1">DepEd Account Request</h3>
              </div>
  
              {/* Request Type dropdown */}
              <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} sm={12} md={3} lg={2}>Request Type</Form.Label>
              <Col xs={12} sm={12} md={9} lg={10}>
                  <Form.Select
                    value={formData.requestType}
                    name="requestType"
                    onChange={handleRequestTypeChange}
                    required
                  >
                    <option value="">-- Select Request Type --</option>
                    <option value="new">Request New Account</option>
                    <option value="reset">Reset Existing Account</option>
                  </Form.Select>
                </Col>
              </Form.Group>
  
              {/* Conditional form fields based on request type */}
              {formData.requestType && (
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column xs={12} sm={12} md={3} lg={2}>Account Type</Form.Label>
                  <Col xs={12} sm={12} md={9} lg={10}>
                    <Form.Select
                      value={formData.selectedType}
                      name="selectedType"
                      onChange={handleTypeChange}
                      required
                    >
                      <option value="">-- Select Account Type --</option>
                      <option value="gmail">DepEd Gmail Account</option>
                      <option value="office365">Office 365 Account</option>
                    </Form.Select>
                  </Col>
                </Form.Group>
              )}
  
              {/* Common fields for both request types */}
              {formData.selectedType && (
                <>
                  <Form.Group as={Row} className="mb-3">
                  <Form.Label column xs={12} sm={12} md={3} lg={2}>Name</Form.Label>
                  <Col xs={12} sm={12} md={9} lg={10}>
                      <Row>
                        <Col md={4}>
                          <FloatingLabel label="Surname">
                            <Form.Control
                              type="text"
                              name="surname"
                              value={formData.surname || ''}
                              onChange={handleChange}
                              placeholder="Surname"
                              required
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={4}>
                          <FloatingLabel label="First Name">
                            <Form.Control
                              type="text"
                              name="firstName"
                              value={formData.firstName || ''}
                              onChange={handleChange}
                              placeholder="First Name"
                              required
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={4}>
                          <FloatingLabel label="Middle Name">
                            <Form.Control
                              type="text"
                              name="middleName"
                              value={formData.middleName || ''}
                              onChange={handleChange}
                              placeholder="Middle Name"
                            />
                          </FloatingLabel>
                        </Col>
                      </Row>
                    </Col>
                  </Form.Group>
  
                  <Form.Group as={Row} className="mb-3">
                  <Form.Label column xs={12} sm={12} md={3} lg={2}>School</Form.Label>
                  <Col xs={12} sm={12} md={9} lg={10}>
                      <Form.Select
                        name="school"
                        value={formData.school}
                        onChange={handleSchoolChange}
                        required
                      >
                        <option value="">-- Select School --</option>
                        {schools.map((school) => (
                          <option key={school.schoolCode} value={school.school}>
                            {school.school}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Form.Group>
  
                  <Form.Group as={Row} className="mb-3">
                  <Form.Label column xs={12} sm={12} md={3} lg={2}>School ID</Form.Label>
                  <Col xs={12} sm={12} md={9} lg={10}>
                      <FloatingLabel label="School ID">
                        <Form.Control
                          type="text"
                          name="schoolID"
                          value={formData.schoolID}
                          placeholder="School ID"
                          readOnly
                          required
                        />
                      </FloatingLabel>
                    </Col>
                  </Form.Group>
  
                  {/* Fields specific to new account request */}
                  {formData.requestType === "new" && (
                    <>
                      <Form.Group as={Row} className="mb-3">
                        <Form.Label column xs={12} sm={12} md={3} lg={2}>Designation</Form.Label>
                        <Col xs={12} sm={12} md={9} lg={10}>
                          <Form.Select
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            required
                          >
                            <option value="">-- Select Designation --</option>
                            {designations.map((designation) => (
                              <option key={designation.id} value={designation.designation}>
                                {designation.designation}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                      </Form.Group>
  
                      <Form.Group as={Row} className="mb-3">
                      <Form.Label column xs={12} sm={12} md={3} lg={2}>Personal Gmail</Form.Label>
                      <Col xs={12} sm={12} md={9} lg={10}>
                          <FloatingLabel label="Personal Gmail Account">
                            <Form.Control
                              type="email"
                              name="personalGmail"
                              value={formData.personalGmail}
                              onChange={handleChange}
                              placeholder="name@gmail.com"
                              required
                            />
                          </FloatingLabel>
                        </Col>
                      </Form.Group>
  
                      <Form.Group as={Row} className="mb-3">
                      <Form.Label column xs={12} sm={12} md={3} lg={2}>Proof of Identity</Form.Label>
                      <Col xs={12} sm={12} md={9} lg={10}>
                          <Form.Control
                            type="file"
                            name="proofOfIdentity"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            required
                          />
                          {formData.attachmentPreviews.map((file, index) => (
                            file.type === 'proofOfIdentity' && (
                              <div key={index} className="d-flex align-items-center mt-2">
                                {file.url && (
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    style={{ width: "50px", height: "50px", marginRight: "10px" }}
                                  />
                                )}
                                <div className="d-flex justify-content-between pe-2" style={{ width: "100%" }}>
                                  <span>{file.name}</span>
                                  <button
                                    type="button"
                                    className="btn text-danger"
                                    onClick={() => handleRemoveAttachment('proofOfIdentity')}
                                  >
                                    <FaRegTrashAlt />
                                  </button>
                                </div>
                              </div>
                            )
                          ))}
                        </Col>
                      </Form.Group>
  
                      <Form.Group as={Row} className="mb-3">
                      <Form.Label column xs={12} sm={12} md={3} lg={2}>PRC ID</Form.Label>
                      <Col xs={12} sm={12} md={9} lg={10}>
                          <Form.Control
                            type="file"
                            name="prcID"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            required
                          />
                          {formData.attachmentPreviews.map((file, index) => (
                            file.type === 'prcID' && (
                              <div key={index} className="d-flex align-items-center mt-2">
                                {file.url && (
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    style={{ width: "50px", height: "50px", marginRight: "10px" }}
                                  />
                                )}
                                <div className="d-flex justify-content-between pe-2" style={{ width: "100%" }}>
                                  <span>{file.name}</span>
                                  <button
                                    type="button"
                                    className="btn text-danger"
                                    onClick={() => handleRemoveAttachment('prcID')}
                                  >
                                    <FaRegTrashAlt />
                                  </button>
                                </div>
                              </div>
                            )
                          ))}
                        </Col>
                      </Form.Group>
  
                      <Form.Group as={Row} className="mb-3">
                      <Form.Label column xs={12} sm={12} md={3} lg={2}>Endorsement Letter</Form.Label>
                      <Col xs={12} sm={12} md={9} lg={10}>
                          <Form.Control
                            type="file"
                            name="endorsementLetter"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            required
                          />
                          {formData.attachmentPreviews.map((file, index) => (
                            file.type === 'endorsementLetter' && (
                              <div key={index} className="d-flex align-items-center mt-2">
                                {file.url && (
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    style={{ width: "50px", height: "50px", marginRight: "10px" }}
                                  />
                                )}
                                <div className="d-flex justify-content-between pe-2" style={{ width: "100%" }}>
                                  <span>{file.name}</span>
                                  <button
                                    type="button"
                                    className="btn text-danger"
                                    onClick={() => handleRemoveAttachment('endorsementLetter')}
                                  >
                                    <FaRegTrashAlt />
                                  </button>
                                </div>
                              </div>
                            )
                          ))}
                        </Col>
                      </Form.Group>
                    </>
                  )}
  
                  {/* Fields specific to reset account request */}
                  {formData.requestType === "reset" && (
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column xs={12} sm={12} md={3} lg={2}>Employee Number</Form.Label>
                      <Col xs={12} sm={12} md={9} lg={10}>
                        <FloatingLabel label="Employee Number">
                          <Form.Control
                            type="text"
                            name="employeeNumber"
                            value={formData.employeeNumber}
                            onChange={handleChange}
                            placeholder="Employee Number"
                            required
                          />
                        </FloatingLabel>
                      </Col>
                    </Form.Group>
                  )}
                </>
              )}
            </Card.Body>
  
            <Card.Footer
              className="d-flex justify-content-center mb-3"
              style={{ backgroundColor: "transparent", border: "none" }}
            >
              <Button
                variant="dark"
                type="submit"
                style={{ width: "25%" }}
                disabled={isSubmitting || !formData.selectedType}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Card.Footer>
          </Card>
        </form>
      </Container>
  
      {/* Modal */}
      <Modal
        show={showSuccessModal}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Success!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{submittedRequestType === 'new' ? 'New Account request' : 'Reset Account request'} has been submitted successfully!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={handleCloseModal}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RequestDepedAccount;


