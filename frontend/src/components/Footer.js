import React from 'react';
import { Link } from 'react-router-dom';
import monumentSketch from '../assets/monument_sketch.jpg';

const Footer = () => {
  return (
    <footer className="theme-architectural-footer">
      <div className="footer-container">
        {/* Main Content Layout: Left Info Columns & Right Monument Sketch */}
        <div className="footer-main-grid">
          
          {/* Left Side: Brand, Address, Socials & Contact */}
          <div className="footer-info-column">
            
            {/* Brand Header */}
            <div className="footer-brand-section">
              <div className="footer-brand-logo">
                <span className="brand-dot"></span>
                <span className="brand-name">SOLO TRAVEL INDIA</span>
              </div>
              <p className="footer-brand-tagline">
                The curated solo expedition ecosystem for exploring Bharat. Intelligent AI itineraries, verified solo travelers, and regional heritage clubs.
              </p>
            </div>

            {/* Information Grid: Social, Contact & Explore */}
            <div className="footer-details-grid">

              {/* Social Media Block */}
              <div className="footer-block">
                <h4 className="footer-heading">Social Media</h4>
                <ul className="footer-links-list">
                  <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
                  <li><a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter / X</a></li>
                  <li><a href="https://threads.net" target="_blank" rel="noreferrer">Threads</a></li>
                  <li><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook Community</a></li>
                </ul>
              </div>

              {/* Contact Block */}
              <div className="footer-block">
                <h4 className="footer-heading">Contact & SOS</h4>
                <p className="footer-text">
                  <a href="tel:+911800112112" className="footer-contact-link">+91 (011) 2345 6789</a><br />
                  <a href="mailto:travel@solotravel.in" className="footer-contact-link">travel@solotravel.in</a><br />
                  <span className="footer-emergency-badge">24/7 National SOS: 112</span>
                </p>
              </div>

              {/* Quick Platform Navigation */}
              <div className="footer-block">
                <h4 className="footer-heading">Explore Platform</h4>
                <ul className="footer-links-list">
                  <li><Link to="/explore">Explore 28 States</Link></li>
                  <li><Link to="/plan">AI Trip Planner</Link></li>
                  <li><Link to="/travelers">Discover Travelers</Link></li>
                  <li><Link to="/groups">Travel Communities</Link></li>
                </ul>
              </div>

            </div>
          </div>

          {/* Right Side: Architectural Heritage Palace Sketch */}
          <div className="footer-monument-column">
            <div className="monument-sketch-frame">
              <img 
                src={monumentSketch} 
                alt="Indian Heritage Monument Architectural Line Art" 
                className="monument-sketch-image" 
              />
              <div className="monument-caption">
                <span className="monument-caption-title">INDIAN HERITAGE ARCHITECTURE</span>
                <span className="monument-caption-sub">Preserving Bharat's timeless monuments & solo expedition trails</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © Copyright 2026 SoloTravel India. All rights reserved.
          </div>
          <div className="footer-legal-links">
            <Link to="/explore">Responsible Tourism</Link>
            <span className="legal-sep">•</span>
            <Link to="/plan">Solo Safety Code</Link>
            <span className="legal-sep">•</span>
            <Link to="/privacy">Privacy Policy</Link>
            <span className="legal-sep">•</span>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
