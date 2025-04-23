import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../../styles/Footer.css"; 

const Footer = () => {
  return (
    <footer className="footer-fixed">
      <Container>
        <Row className="align-items-center">
          <Col md={12} className="text-center">
            <p className="mb-0">© 2024 DepEd Ticketing System. All rights reserved.</p>
          </Col>
        </Row>
        <Row>
        <Col md={12} className="text-center">
            <a href="#privacy" className="text-light me-3">Privacy Policy</a>
            <a href="#terms" className="text-light">Terms of Service</a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
