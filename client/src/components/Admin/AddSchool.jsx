import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSchool, faCirclePlus } from '@fortawesome/free-solid-svg-icons';

const AddSchool = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: 'password123',
    district: '',
    schoolCode: '',
    school: '',
    address: '',
    principal: '',
    number: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['username', 'district', 'schoolCode', 'school', 'address', 'principal', 'number', 'email'];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.district && !/^\d+$/.test(formData.district)) {
      newErrors.district = 'District must be a number';
    }

    if (formData.number && !/^\d{10,11}$/.test(formData.number)) {
      newErrors.number = 'Invalid phone number format';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers for district field
    if (name === 'district' && value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/reset/addschools`, {
        ...formData,
        role: 'Staff'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        title: 'Success!',
        text: 'School added successfully',
        icon: 'success',
        confirmButtonColor: '#294a70'
      });

      // Reset form
      setFormData({
        username: '',
        password: 'password123',
        district: '',
        schoolCode: '',
        school: '',
        address: '',
        principal: '',
        number: '',
        email: ''
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to add school',
        icon: 'error',
        confirmButtonColor: '#294a70'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-primary text-white py-3">
              <h3 className="card-title mb-0 text-center">
                <FontAwesomeIcon icon={faSchool} className="me-2" />
                Add New School
              </h3>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <div className="row g-3">
                  {/* Username */}
                  <div className="col-md-6">
                    <label htmlFor="username" className="form-label fw-bold">Username</label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                    {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                  </div>

                  {/* District */}
                  <div className="col-md-6">
                    <label htmlFor="district" className="form-label fw-bold">District Number</label>
                    <input
                      type="text"
                      className={`form-control ${errors.district ? 'is-invalid' : ''}`}
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {errors.district && <div className="invalid-feedback">{errors.district}</div>}
                  </div>

                  {/* School Code */}
                  <div className="col-md-6">
                    <label htmlFor="schoolCode" className="form-label fw-bold">School Code</label>
                    <input
                      type="text"
                      className={`form-control ${errors.schoolCode ? 'is-invalid' : ''}`}
                      id="schoolCode"
                      name="schoolCode"
                      value={formData.schoolCode}
                      onChange={handleChange}
                      required
                    />
                    {errors.schoolCode && <div className="invalid-feedback">{errors.schoolCode}</div>}
                  </div>

                  {/* School Name */}
                  <div className="col-12">
                    <label htmlFor="school" className="form-label fw-bold">School Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.school ? 'is-invalid' : ''}`}
                      id="school"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      required
                    />
                    {errors.school && <div className="invalid-feedback">{errors.school}</div>}
                  </div>

                  {/* Address */}
                  <div className="col-12">
                    <label htmlFor="address" className="form-label fw-bold">Address</label>
                    <textarea
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      required
                    ></textarea>
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </div>

                  {/* Principal */}
                  <div className="col-md-6">
                    <label htmlFor="principal" className="form-label fw-bold">Principal</label>
                    <input
                      type="text"
                      className={`form-control ${errors.principal ? 'is-invalid' : ''}`}
                      id="principal"
                      name="principal"
                      value={formData.principal}
                      onChange={handleChange}
                      required
                    />
                    {errors.principal && <div className="invalid-feedback">{errors.principal}</div>}
                  </div>

                  {/* Contact Number */}
                  <div className="col-md-6">
                    <label htmlFor="number" className="form-label fw-bold">Contact Number</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.number ? 'is-invalid' : ''}`}
                      id="number"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      required
                    />
                    {errors.number && <div className="invalid-feedback">{errors.number}</div>}
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <label htmlFor="email" className="form-label fw-bold">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary py-2"
                    disabled={isSubmitting}
                    style={{ backgroundColor: "#294a70", border: "none" }}
                  >
                    <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                    {isSubmitting ? 'Adding School...' : 'Add School'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSchool;