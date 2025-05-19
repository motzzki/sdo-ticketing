import axios from "axios";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useWindowSize } from "react-use";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye, 
  faEyeSlash, 
  faSchool, 
  faUndo, 
  faLock, 
  faKey, 
  faCheckCircle, 
  faExclamationTriangle 
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "../../config";

const AdminChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { width } = useWindowSize();
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    role: ""
  });

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/reset/schools`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Ensure we always set an array
        setSchools(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching schools:", err);
        setResetError("Failed to load school list.");
        setSchools([]); // Set empty array on error
      }
    };
    
    fetchSchools();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserData({
          firstName: decoded.firstname,
          lastName: decoded.lastname,
          username: decoded.username,
          role: decoded.role
        });
      } catch (error) {
        console.error("Error decoding token", error);
        setError("Authentication error. Please log in again.");
      }
    } else {
      setError("No authentication token found. Please log in.");
    }
  }, []);

  // Password strength checker
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[a-z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;
    
    setPasswordStrength(strength);
  }, [newPassword]);

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return "";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      case 5: return "Very Strong";
      default: return "";
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return "#dee2e6";
      case 1: return "#dc3545";
      case 2: return "#ffc107";
      case 3: return "#fd7e14";
      case 4: return "#20c997";
      case 5: return "#198754";
      default: return "#dee2e6";
    }
  };

  const handleSchoolReset = async () => {
    if (!selectedSchool) {
      setResetError("Please select a school.");
      return;
    }

    Swal.fire({
      title: 'Confirm Password Reset',
      html: `Are you sure you want to reset the password for <strong>${schools.find(s => s.userId === Number(selectedSchool))?.school}</strong>?<br><br>The new password will be: <code>password123</code>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Confirm Reset',
      customClass: {
        confirmButton: 'btn btn-danger me-2',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            `${API_BASE_URL}/api/reset/reset-school-password`,
            { school: schools.find(s => s.userId === Number(selectedSchool))?.school },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          Swal.fire({
            title: 'Password Reset!',
            text: 'School password has been reset to password123',
            icon: 'success',
            confirmButtonColor: '#294a70'
          });
          
          setResetSuccess("Password reset successfully.");
          setSelectedSchool("");
          setResetError("");
        } catch (err) {
          setResetError(err.response?.data?.message || "Reset failed. Please try again.");
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    Swal.fire({
      title: 'Confirm Password Change',
      text: "Are you sure you want to change your password?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#294a70',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, change it!',
      customClass: {
        confirmButton: 'btn btn-primary me-2',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.post(
            `${API_BASE_URL}/api/reset/change-password`,
            { currentPassword, newPassword, confirmPassword },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          Swal.fire({
            title: 'Password Changed!',
            text: 'Your password has been successfully updated',
            icon: 'success',
            confirmButtonColor: '#294a70',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
          });
          
          setSuccess(response.data.message);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } catch (err) {
          setError(err.response?.data?.message || "An error occurred.");
        }
      }
    });
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          {/* Your Password Card */}
          <div className="card border-0 shadow rounded-4 mb-4 overflow-hidden">
            <div className="card-header bg-gradient text-white py-3 d-flex align-items-center" 
                 style={{ background: "linear-gradient(135deg, #294a70 0%, #3a6ea5 100%)" }}>
              <FontAwesomeIcon icon={faKey} className="me-2 fs-4" />
              <h3 className="card-title mb-0">Change Your Password</h3>
            </div>
            
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  <div>{error}</div>
                  <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
              )}
              
              {success && (
                <div className="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  <div>{success}</div>
                  <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="needs-validation">
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faLock} className="me-2 text-secondary" />
                    Current Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="form-control form-control-lg border-end-0"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                    <button 
                      className="btn btn-outline-secondary bg-white border border-start-0" 
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <FontAwesomeIcon 
                        icon={showCurrentPassword ? faEyeSlash : faEye} 
                        className="text-muted"
                      />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="newPassword" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faKey} className="me-2 text-secondary" />
                    New Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control form-control-lg border-end-0"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength="8"
                    />
                    <button 
                      className="btn btn-outline-secondary bg-white border border-start-0" 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <FontAwesomeIcon 
                        icon={showNewPassword ? faEyeSlash : faEye}
                        className="text-muted"
                      />
                    </button>
                  </div>
                  
                  {/* Password strength indicator */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Password strength:</small>
                        <small style={{ color: getStrengthColor() }}>{getStrengthLabel()}</small>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getStrengthColor() }}
                          aria-valuenow={passwordStrength} 
                          aria-valuemin="0" 
                          aria-valuemax="5"
                        ></div>
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">
                          For a strong password, include at least 8 characters with uppercase, lowercase, numbers, and special characters.
                        </small>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-secondary" />
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control form-control-lg border-end-0"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                    <button 
                      className="btn btn-outline-secondary bg-white border border-start-0" 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <FontAwesomeIcon 
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                        className="text-muted"
                      />
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <small className="text-danger mt-1">Passwords do not match</small>
                  )}
                </div>
                
                <div className="d-grid gap-2 mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg py-2"
                    style={{ 
                      background: "linear-gradient(135deg, #294a70 0%, #3a6ea5 100%)",
                      border: "none", 
                      boxShadow: "0 4px 6px rgba(41, 74, 112, 0.2)" 
                    }}
                  >
                    <FontAwesomeIcon icon={faKey} className="me-2" />
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* School Password Reset Card */}
          <div className="card border-0 shadow rounded-4 overflow-hidden">
            <div className="card-header text-white py-3 d-flex align-items-center" 
                 style={{ background: "linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)" }}>
              <FontAwesomeIcon icon={faSchool} className="me-2 fs-4" />
              <h3 className="card-title mb-0">Reset School Password</h3>
            </div>
            
            <div className="card-body p-4">
              {resetError && (
                <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  <div>{resetError}</div>
                  <button type="button" className="btn-close" onClick={() => setResetError("")}></button>
                </div>
              )}

              {resetSuccess && (
                <div className="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  <div>{resetSuccess}</div>
                  <button type="button" className="btn-close" onClick={() => setResetSuccess("")}></button>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="schoolSelect" className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faSchool} className="me-2 text-secondary" />
                  Select School
                </label>
                <select 
                  className="form-select form-select-lg"
                  id="schoolSelect"
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                >
                  <option value="">Choose a school...</option>
                  {schools.map(school => (
                    <option key={school.userId} value={school.userId}>
                      {school.school} ({school.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="d-grid gap-2">
                <button 
                  type="button"
                  className="btn btn-danger btn-lg py-2"
                  onClick={handleSchoolReset}
                  disabled={!selectedSchool}
                  style={{ 
                    background: selectedSchool ? "linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)" : "#e9ecef",
                    border: "none",
                    boxShadow: selectedSchool ? "0 4px 6px rgba(220, 53, 69, 0.2)" : "none" 
                  }}
                >
                  <FontAwesomeIcon icon={faUndo} className="me-2" />
                  Reset Password to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChangePassword;