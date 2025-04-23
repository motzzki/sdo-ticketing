import React from "react";
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Card,
  Table,
} from "react-bootstrap";
import "../../styles/LandingPage.css";
import Logo from "../../Assets/SDO_Logo1.png";
import Footer from "./Footer";
import Carousel from "react-bootstrap/Carousel";
import img1 from "../../Assets/Image1.jpg";
import img2 from "../../Assets/Image2.jpg";
import img3 from "../../Assets/Image3.jpg";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from 'react-bootstrap/Button';

const LandingPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <div>
      <Navbar expand="lg" className="bg-dark navbar-dark">
      <Container>
        <Navbar.Brand href="#home">
          <div className="d-flex">
            <img alt="Logo" src={Logo} className="Logo me-2" />
            <label className="mt-1 ms-1 me-5 d-none d-sm-block d-lg-block">
              Deped Ticketing System
            </label>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#features">About</Nav.Link>
            <Nav.Link href="#pricing">Contact Us</Nav.Link>
          </Nav>
          <div className="ms-auto navdrop">
            <NavDropdown title="Login" id="nav-dropdown-dark-example" className="text-white bg-dark">
              <NavDropdown.Item href="/adminlogin" className="text-center NavDropdownItem">
                Admin
              </NavDropdown.Item>
              <NavDropdown.Item href="/schoollogin" className="text-center NavDropdownItem">
                School
              </NavDropdown.Item>
            </NavDropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
      </div>

      {/* Main Content Section */}
      <div className="row maincontent p-0 mx-2">
        <div className="col-lg-8">

          {/* Video Section */}
          <div className="row">
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/sbTiHMIbFKc"
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="p-lg-2"
            ></iframe>
          </div>

          {/* Contact Card with Office Extensions */}
          <div className="row mt-3">
            <div className="col-lg-6 col-sm-12">
              <Card className="mb-3 mt-2 contact-landing">
                <Card.Body>
                  <Card.Title>Quick Contacts</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted mt-1">
                    Cabuyao Enterprise Park, Cabuyao Athletes Basic School
                    (CABS) Brgy. Banay-Banay, City of Cabuyao, Laguna
                  </Card.Subtitle>

                  <Table bordered responsive className="mt-3 table1">
                    <thead>
                      <tr>
                        <th></th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Email:</strong>
                        </td>
                        <td>
                          <a href="mailto:division.cabuyao@deped.gov.ph">
                            division.cabuyao@deped.gov.ph
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Trunk Line</strong>
                        </td>
                        <td>
                          0939 934 0448<br></br> 0939 934 0450
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table bordered responsive className="mt-3 table2">
                    <thead>
                      <tr>
                        <th>
                          <strong>Office</strong>
                        </th>
                        <th>
                          <strong></strong>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>SDS Office</strong>
                        </td>
                        <td>Local 101</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>ASDS Office</strong>
                        </td>
                        <td>Local 102</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>CID Office</strong>
                        </td>
                        <td>Local 103</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>SGOD Office</strong>
                        </td>
                        <td>Local 104</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Health Section</strong>
                        </td>
                        <td>Local 105</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Administrative Services</strong>
                        </td>
                        <td>Local 106</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Personnel Unit</strong>
                        </td>
                        <td>Local 107</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Records Unit</strong>
                        </td>
                        <td>Local 108</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Legal Unit</strong>
                        </td>
                        <td>Local 109</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Cash and Budget Unit</strong>
                        </td>
                        <td>Local 110</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Accounting Unit</strong>
                        </td>
                        <td>Local 111</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Supply and Property Unit</strong>
                        </td>
                        <td>Local 112</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>ICT Unit</strong>
                        </td>
                        <td>Local 114</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>
            <div className="col-lg-6 col-sm-12">
              <Carousel>
                <Carousel.Item interval={1000}>
                  <img className="d-block w-100" src={img1} alt="First slide" />
                  <Carousel.Caption>
                    <h3>First slide label</h3>
                    <p>
                      Nulla vitae elit libero, a pharetra augue mollis interdum.
                    </p>
                  </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item interval={500}>
                  <img
                    className="d-block w-100"
                    src={img2}
                    alt="Second slide"
                  />
                  <Carousel.Caption>
                    <h3>Second slide label</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                  </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                  <img className="d-block w-100 mt-3" src={img3} alt="Third slide" />
                  <Carousel.Caption>
                    <h3>Third slide label</h3>
                    <p>
                      Praesent commodo cursus magna, vel scelerisque nisl
                      consectetur.
                    </p>
                  </Carousel.Caption>
                </Carousel.Item>
              </Carousel>
              <p className="text-center mt-3">
                Lorem ipsum odor amet, consectetuer adipiscing elit. Posuere
                lacus vivamus tempor mauris imperdiet hendrerit tempus. Quis
                nullam cursus ipsum torquent pharetra ultrices ipsum fermentum
                efficitur. Consectetur nullam commodo integer ut vel maecenas
                sociosqu maecenas velit. Suspendisse mauris odio mauris
                ultricies euismod facilisis class in. Magnis proin purus lacus
                arcu nascetur potenti. Scelerisque magnis aptent commodo metus
                praesent volutpat blandit. Metus duis ullamcorper lectus lectus
                ultricies dapibus fusce dictumst quisque. Nisl platea odio
                himenaeos ut phasellus erat.
              </p>
              <p className="text-center mt-2">
                Pharetra himenaeos semper neque inceptos tellus sociosqu quis
                amet turpis. Mi commodo magna ante iaculis dictum tortor
                inceptos augue at. Placerat sed maecenas aliquam, ut tellus
                morbi non. Magnis mi enim mauris viverra porta tempus. Aliquet
                metus velit eros ipsum dolor aliquam velit parturient. Ex eros
                magnis; dolor semper euismod id primis. Integer vestibulum per
                habitant ad pulvinar ipsum. Litora lacus malesuada sociosqu et
                sed id?
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mt-2">
          <img className="d-block w-100" src={img1} alt="First slide mb-3" />
          <p className="text-center mt-5">
            Lorem ipsum odor amet, consectetuer adipiscing elit. Posuere lacus
            vivamus tempor mauris imperdiet hendrerit tempus. Quis nullam cursus
            ipsum torquent pharetra ultrices ipsum fermentum efficitur.
            Consectetur nullam commodo integer ut vel maecenas sociosqu maecenas
            velit. Suspendisse mauris odio mauris ultricies euismod facilisis
            class in. Magnis proin purus lacus arcu nascetur potenti.
            Scelerisque magnis aptent commodo metus praesent volutpat blandit.
            Metus duis ullamcorper lectus lectus ultricies dapibus fusce
            dictumst quisque. Nisl platea odio himenaeos ut phasellus erat.
          </p>

          <img className="d-block w-100" src={img2} alt="First slide" />
          <p className="text-center mt-3">
            Lorem ipsum odor amet, consectetuer adipiscing elit. Posuere lacus
            vivamus tempor mauris imperdiet hendrerit tempus. Quis nullam cursus
            ipsum torquent pharetra ultrices ipsum fermentum efficitur.
            Consectetur nullam commodo integer ut vel maecenas sociosqu maecenas
            velit. Suspendisse mauris odio mauris ultricies euismod facilisis
            class in. Magnis proin purus lacus arcu nascetur potenti.
            Scelerisque magnis aptent commodo metus praesent volutpat blandit.
            Metus duis ullamcorper lectus lectus ultricies dapibus fusce
            dictumst quisque. Nisl platea odio himenaeos ut phasellus erat.
          </p>
          <p className="text-center mt-2">
            Pharetra himenaeos semper neque inceptos tellus sociosqu quis amet
            turpis. Mi commodo magna ante iaculis dictum tortor inceptos augue
            at. Placerat sed maecenas aliquam, ut tellus morbi non. Magnis mi
            enim mauris viverra porta tempus. Aliquet metus velit eros ipsum
            dolor aliquam velit parturient. Ex eros magnis; dolor semper euismod
            id primis. Integer vestibulum per habitant ad pulvinar ipsum. Litora
            lacus malesuada sociosqu et sed id?
          </p>
        </div>
        <div>
          <Row xs={1} md={3} lg={4} className="g-4 mb-4">
            {Array.from({ length: 12 }).map((_, idx) => (
              <Col key={idx}>
                <Card className="card-landing">
                  {/* Image */}
                  <Card.Img
                    variant="top"
                    src={idx % 3 === 0 ? img1 : idx % 3 === 1 ? img2 : img3}
                    alt={`Image ${idx + 1}`}
                    className="card-image-landing"
                  />

                  <Card.Body>
                    {/* Card Title */}
                    <Card.Title>Card title {idx + 1}</Card.Title>

                    {/* Card Text */}
                    <Card.Text>
                      This is a longer card with supporting text below as a
                      natural lead-in to additional content. This content is a
                      little bit longer.
                    </Card.Text>
                    <Button variant="dark" className="btnReadMore">Read More</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Footer */}
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;