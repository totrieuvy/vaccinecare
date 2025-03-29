import React from "react";
import { Layout, Row, Col } from "antd";
import "./FooterCustomer.css";

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer className="footer">
      <Row justify="space-between">
        <Col xs={24} sm={8} className="footer-logo">
          <div className="logo-placeholder">
            <img
              src="https://healthier.stanfordchildrens.org/wp-content/uploads/2022/06/21_1299711083_iStock-scaled.jpg"
              alt="Vaccine Care Logo"
            />
          </div>
        </Col>
        <Col xs={24} sm={16}>
          <h2 className="footer-title">Vaccine Care </h2>
          <Row className="footer-links">
            <Col xs={24} sm={8}>
              <h3>About Us</h3>
              <ul>
                <li>Mission</li>
                <li>Team</li>
                <li>Newsletter</li>
              </ul>
            </Col>
            <Col xs={24} sm={8}>
              <h3>Support</h3>
              <ul>
                <li>Contact</li>
                <li>Refund Policy</li>
                <li>FAQ’s</li>
              </ul>
            </Col>
            <Col xs={24} sm={8}>
              <h3>Social</h3>
              <ul>
                <li>Instagram</li>
                <li>LinkedIn</li>
                <li>YouTube</li>
              </ul>
            </Col>
          </Row>
        </Col>
      </Row>
      <div className="footer-bottom">
        <span>Copyright ©Vaccine Care</span>
        <span>Terms of Service</span>
        <span className="back-to-top">⬆ Back to top</span>
      </div>
    </Footer>
  );
};

export default AppFooter;

