import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import "./Navbar.css";
import logo from "../../assets/logo.png";

function BasicExample() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check token in localStorage on mount
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    window.location.href = "/"; // redirect to home (or login page)
  };

  const handleLogin = () => {
    window.location.href = "/"; // change this to your login route
  };

  return (
    <Navbar expand="lg">
      <Container className="navbar1">
        <Navbar.Brand href="#home" className="d-flex align-items-center">
          <div className="logo-container"></div>
          <span className="vetcare">ClimaCare</span>
        </Navbar.Brand>
        <Button
          variant="outline-success"
          className="contact-sales-btn d-lg-none me-2"
        >
          Contact Sales
        </Button>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
            <NavDropdown title="Others" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown> */}
          </Nav>

          {/* "Contact Sales" button for large screens */}
          <Button
            variant="outline-success"
            className="contact-sales-btn d-none d-lg-block me-2"
          >
            Contact Sales
          </Button>

          {/* Auth Button */}
          {isLoggedIn ? (
            <Button variant="danger" className="sign-up-btn" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="success" className="sign-up-btn" onClick={handleLogin}>
              Log in
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default BasicExample;
