import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import { Table, Badge, Button, Form } from "react-bootstrap";
import { API_BASE_URL } from "../../config";

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/batch/batches`);
      // Group devices by batch_id
      const groupedBatches = groupBatchesByBatchId(response.data);
      setBatches(groupedBatches);
      setFilteredBatches(groupedBatches);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching batches:", err);
      setError("Failed to load batches");
      setLoading(false);
    }
  };

  const groupBatchesByBatchId = (data) => {
    const groupedData = {};
    data.forEach(batch => {
      if (!groupedData[batch.batch_id]) {
        groupedData[batch.batch_id] = {
          ...batch,
          devices: []
        };
      }
      if (batch.device_type && batch.device_number) {
        groupedData[batch.batch_id].devices.push({
          device_type: batch.device_type,
          device_number: batch.device_number
        });
      }
    });
    return Object.values(groupedData);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    if (status === "all") {
      setFilteredBatches(batches);
    } else {
      const filtered = batches.filter(batch => batch.status === status);
      setFilteredBatches(filtered);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Delivered":
        return "success";
      case "Cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Batch List</h2>
        <Button onClick={() => navigate("/createbatch")} variant="primary">
          Create New Batch
        </Button>
      </div>

      <Form.Group className="mb-3">
        <Form.Label>Filter by Status:</Form.Label>
        <Form.Select 
          value={filterStatus} 
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </Form.Select>
      </Form.Group>

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Batch Number</th>
            <th>School</th>
            <th>Send Date</th>
            <th>Received Date</th>
            <th>Devices</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredBatches.map((batch) => (
            <tr key={batch.batch_id}>
              <td>{batch.batch_number}</td>
              <td>{batch.school_name}</td>
              <td>{formatDate(batch.send_date)}</td>
              <td>{formatDate(batch.received_date)}</td>
              <td>
                <ul className="list-unstyled m-0">
                  {batch.devices.map((device, index) => (
                    <li key={index}>
                      {device.device_type}: {device.device_number}
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                <Badge bg={getStatusBadgeVariant(batch.status)}>
                  {batch.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {filteredBatches.length === 0 && (
        <div className="text-center mt-4">
          <p>No batches found.</p>
        </div>
      )}
    </div>
  );
};

export default Batches;