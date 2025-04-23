import React from "react";
import { useNavigate } from "react-router-dom";

const Forbidden = () => {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>403 - Forbidden</h1>
            <p>You do not have permission to access this page.</p>
            <button onClick={() => navigate("/")}>Go Back to Login</button>
        </div>
    );
};

export default Forbidden;
