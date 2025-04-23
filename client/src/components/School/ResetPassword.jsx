import React, { useState } from "react";
import axios from "axios";
import Nav from "./Header"; // Navigation Component
import "../../styles/ResetPassword.css";
import { API_BASE_URL } from "../../config";

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        name: "",
        school: "",
        schoolId: "",
        employeeNumber: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${API_BASE_URL}/idas-reset`, formData);
            setMessage(response.data.message);
            setFormData({ name: "", school: "", schoolId: "", employeeNumber: "" }); // Clear form
        } catch (error) {
            console.error("Error submitting reset request:", error);
            setMessage("Error submitting the request.");
        }
    };

    return (
        <div className="idas-reset-container">
            <Nav />
            <div className="reset-form-wrapper">
                <h1 className="reset-title">IDAS Reset Password</h1>
                {message && <p className="reset-message">{message}</p>}

                <form className="reset-form" onSubmit={handleSubmit}>
                    <label className="reset-label">Name</label>
                    <input className="reset-input" type="text" name="name" value={formData.name} onChange={handleChange} required />

                    <label className="reset-label">School</label>
                    <input className="reset-input" type="text" name="school" value={formData.school} onChange={handleChange} required />

                    <label className="reset-label">School ID</label>
                    <input className="reset-input" type="text" name="schoolId" value={formData.schoolId} onChange={handleChange} required />

                    <label className="reset-label">Employee Number</label>
                    <input className="reset-input" type="text" name="employeeNumber" value={formData.employeeNumber} onChange={handleChange} required />

                    <button className="reset-submit-button" type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
};


export default ResetPassword;
