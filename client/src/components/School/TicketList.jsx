import React, { useState, useEffect } from "react";
import { Card, Table, Badge, Button, Form, InputGroup } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSearch } from "react-icons/fa";
import { API_BASE_URL } from "../../config";

const TicketList = ({ status }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentAttachments, setCurrentAttachments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const NON_ARCHIVABLE_STATUSES = ["In Progress", "On Hold"];

  const handleViewTicket = (ticket) => {
    Swal.fire({
      title: 'Ticket Details',
      html: `
        <div class="container-fluid" style="font-size: 0.9rem; text-align: left;">
          <div class="row g-3">
            <div class="col-md-6">
              <p class="mb-2 text-left">
                <strong>Ticket Number:</strong><br />
                ${ticket.ticketNumber}
              </p>
            </div>
            <div class="col-md-6">
              <p class="mb-2 text-left">
                <strong>Category:</strong><br />
                ${ticket.category}
              </p>
            </div>
            <div class="col-12">
              <p class="mb-2 text-left">
                <strong>Request:</strong><br />
                ${ticket.request}
              </p>
            </div>
            <div class="col-12">
              <p class="mb-2 text-left">
                <strong>Comments:</strong><br />
                ${ticket.comments}
              </p>
            </div>
            <div class="col-12">
              <p class="mb-0 text-left">
                <strong>Date:</strong><br />
                ${new Date(ticket.date).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      `,
      width: '800px',
      showCloseButton: true,
      showConfirmButton: false,
      didOpen: () => {
        // Apply styles to Swal container
        const content = Swal.getHtmlContainer();
        if (content) {
          content.style.textAlign = 'left';
        }
      }
    });
  };

  const handleOpenAttachments = (attachments) => {
    try {
      const parsedAttachments = JSON.parse(attachments);
      const attachmentHtml = parsedAttachments.map((filename) => `
        <div class="col-sm-6 col-md-4 col-lg-3 mb-3">
          <div class="border rounded p-3" style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">
              ${getFileIcon(filename)}
            </div>
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.875rem; margin-bottom: 0.5rem;">
              ${filename}
            </div>
            <button 
              class="btn btn-link btn-sm"
              style="padding: 0.25rem 0.5rem; font-size: 0.875rem;"
              onclick="window.open('${API_BASE_URL}/api/uploads/${filename}', '_blank')"
            >
              Open File
            </button>
          </div>
        </div>
      `).join('');

      Swal.fire({
        title: 'Attachments',
        html: `
          <div class="container-fluid" style="text-align: left;">
            <div class="row">
              ${attachmentHtml}
            </div>
          </div>
        `,
        width: '800px',
        showCloseButton: true,
        showConfirmButton: false,
        didOpen: () => {
          // Apply styles to Swal container
          const content = Swal.getHtmlContainer();
          if (content) {
            content.style.textAlign = 'left';
          }
        }
      });
    } catch (error) {
      setError("Failed to load attachments");
    }
  };

  const handleArchiveTicket = async (ticketId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      });
  
      if (result.isConfirmed) {
        await Swal.fire({
          title: "Deleted!",
          text: "The ticket has been deleted.",
          icon: "success"
        });
        await axios.put(`${API_BASE_URL}/api/ticket/tickets/${ticketId}/archive`);
        setTickets((prevTickets) =>
          prevTickets.filter((ticket) => ticket.ticketId !== ticketId)
        );
      }
    } catch (error) {
      setError("Failed to delete ticket");
      console.error("Archive error:", error);
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const decoded = jwtDecode(token);
        const response = await axios.get(
          `${API_BASE_URL}/api/ticket/tickets/${decoded.username}/${status}`
        );
        setTickets(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [status]);

  const getFileIcon = (filename) => {
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

  // Filter tickets based on search term
  const filteredTickets = tickets.filter(ticket => 
    ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.request.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading tickets...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-danger">{error}</div>
    </div>
  );

  return (
    <div className="vh-90 d-flex flex-column" style={{ marginTop: '60px' }}>
      <Card className="flex-grow-1 m-0 border-0 rounded-0">
        <Card.Header className="py-3 sticky-top" style={{ top: '56px', backgroundColor: "transparent" }}>
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{color: '#294a70'}}>{status} Tickets</h5>
              <span className="badge text-light p-2" style={{backgroundColor: '#294a70'}}>
                {filteredTickets.length} Tickets
              </span>
            </div>
            <div className="row">
              <div className="col-md-6 col-lg-4">
                <InputGroup>
                  <InputGroup.Text style={{backgroundColor: '#294a70', color: 'white'}}>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search tickets"
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSearchTerm("")}
                    >
                      Clear
                    </Button>
                  )}
                </InputGroup>
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredTickets.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="text-muted">
                {searchTerm 
                  ? "No tickets match your search criteria." 
                  : `No ${status.toLowerCase()} tickets found.`}
              </div>
            </div>
          ) : (
            <div className="table-responsive" style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              <Table hover className="mb-0">
                <thead className="sticky-top bg-white" style={{ top: '0' }}>
                  <tr>
                    <th className="px-3" style={{color: '#294a70'}}>Ticket No.</th>
                    <th className="px-3 text-center" style={{color: '#294a70'}}>Category</th>
                    <th className="px-3 text-center" style={{color: '#294a70'}}>Request</th>
                    <th className="px-3 text-center" style={{color: '#294a70'}}>Date</th>
                    <th className="px-3 text-center" style={{color: '#294a70'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.ticketNumber}>
                      <td className="px-3">{ticket.ticketNumber}</td>
                      <td className="px-3">{ticket.category}</td>
                      <td className="px-3">
                        <div className="text-truncate" style={{ maxWidth: '300px' }}>
                          {ticket.request}
                        </div>
                      </td>
                      <td className="px-3">{new Date(ticket.date).toLocaleDateString()}</td>
                      <td className="px-3">
                        <div className="d-flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleViewTicket(ticket)}
                          >
                            View
                          </Button>
                          {!NON_ARCHIVABLE_STATUSES.includes(status) && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleArchiveTicket(ticket.ticketId)}
                            >
                              Delete
                            </Button>
                          )}
                          {ticket.attachments && JSON.parse(ticket.attachments).length > 0 && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleOpenAttachments(ticket.attachments)}
                            >
                              Files
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TicketList;