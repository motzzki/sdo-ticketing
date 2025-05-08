import React, { useState } from "react";
import { Form, Button, Card, Container } from "react-bootstrap";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../config";

const CheckTransaction = () => {
  const [transactionNumber, setTransactionNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/depedacc/check-transaction?number=${transactionNumber}`
      );
  
      if (response.ok) {
        const data = await response.json();
  
        // Check if data is an array and has at least one item
        if (!Array.isArray(data) || data.length === 0) {
          Swal.fire({
            title: "Not Found",
            text: "No transaction found with that number",
            icon: "error",
            confirmButtonText: "Close",
          });
          return;
        }
  
        const transaction = data[0]; // Get the first transaction
        
        let noteMessage = "";
        if (transaction.status && transaction.status.toLowerCase() === "completed") {
          noteMessage =
            "<p style='color: green;'>Email sent! Check your email.</p>";
        } else if (transaction.status && transaction.status.toLowerCase() === "rejected") {
          noteMessage = `
            <p style='color: red;'>Request rejected. Submit a new one.</p>
            ${transaction.notes ? `
              <div style="margin-top: 10px; padding: 10px; background-color: #fff8f8; border-left: 4px solid #dc3545;">
                <p style="font-weight: bold; margin-bottom: 5px;">Rejection Reason:</p>
                <p>${transaction.notes}</p>
              </div>
            ` : ''}
          `;
        }
  
        Swal.fire({
          title: "Transaction Details",
          html: `
          <div style="display: flex; justify-content: center; margin-top: 20px;">
              <table style="width: 80%; border-collapse: collapse;">
                  <tbody>
                      <tr>
                          <td style="text-align: left; padding: 8px; font-weight: bold; width: 40%;">Request No:</td>
                          <td style="text-align: left; padding: 8px;">${
                            transaction.number || "N/A"
                          }</td>
                      </tr>
                      <tr>
                          <td style="text-align: left; padding: 8px; font-weight: bold;">Name:</td>
                          <td style="text-align: left; padding: 8px;">${
                            transaction.name || "N/A"
                          }</td>
                      </tr>
                      <tr>
                          <td style="text-align: left; padding: 8px; font-weight: bold;">School:</td>
                          <td style="text-align: left; padding: 8px;">${
                            transaction.school || "N/A"
                          }</td>
                      </tr>
                      <tr>
                          <td style="text-align: left; padding: 8px; font-weight: bold;">Status:</td>
                          <td style="text-align: left; padding: 8px;">${
                            transaction.status || "N/A"
                          }</td>
                      </tr>
                  </tbody>
              </table>
          </div>
          ${
            noteMessage
              ? `
          <div style="margin-top: 20px; text-align: left;">
            ${noteMessage}
          </div>
          `
              : ""
          }
        `,
          icon: "info",
          confirmButtonText: "Close",
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: "Error",
          text: errorData.error || "Failed to fetch transaction details",
          icon: "error",
          confirmButtonText: "Close",
        });
      }
    } catch (error) {
      console.error("Error checking transaction:", error);
      Swal.fire({
        title: "Error",
        text: "An error occurred while checking the transaction",
        icon: "error",
        confirmButtonText: "Close",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Card
        className="m-auto"
        style={{
          width: "25%",
          border: "none",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Card.Header
          className="text-center"
          style={{ backgroundColor: "transparent", borderBottom: "none" }}
        >
          <h5 className="mt-2">Check Transaction Status</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleCheckTransaction}>
            <Form.Group className="mb-3">
              {/* <Form.Label>Request/Reset Number</Form.Label> */}
              <Form.Control
                type="text"
                placeholder="Enter your Request number"
                value={transactionNumber}
                onChange={(e) => setTransactionNumber(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-grid">
              <Button
                variant="dark"
                style={{ backgroundColor: "#294a70", border: "none" }}
                type="submit"
                disabled={loading}
              >
                {loading ? "Checking..." : "Check Status"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CheckTransaction;
