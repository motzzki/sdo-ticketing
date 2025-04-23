import React from 'react';
import BatchList from '../BatchList';
import Nav from '../Header';
import { useWindowSize } from 'react-use';
import { Container, Row, Col } from 'react-bootstrap';

const ReceivedBatches = () => {
  const { width } = useWindowSize();
  const sidebarWidth = width >= 768 ? "250px" : "0";

  return (
    <div style={{ marginLeft: sidebarWidth, minHeight: '100vh' }}>
      <Nav />
      <Container fluid style={{ minHeight: 'calc(100vh - 56px)' }}>
        <Row className="w-100">
          <Col xs={12} lg={10} className="mx-auto">
            <BatchList status="Received" />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReceivedBatches;