import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add form submission logic here
  };

  return (
    <section className="contact-section">
      <div className="contact-form-container">
        <div className="contact-section">
          <div className="contact-field-row">
            <div className="contact-field-group">
              <div className="contact-form-field">
                <label className="contact-form-label">Full Name</label>
                <div className="contact-form-input-wrapper">
                  <svg className="contact-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="contact-form-input"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            </div>

            <div className="contact-field-group">
              <div className="contact-form-field">
                <label className="contact-form-label">Business Email</label>
                <div className="contact-form-input-wrapper">
                  <svg className="contact-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="contact-form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@company.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="contact-field-row">
            <div className="contact-field-group">
              <div className="contact-form-field">
                <label className="contact-form-label">Company Name</label>
                <div className="contact-form-input-wrapper">
                  <svg className="contact-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
                  </svg>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="contact-form-input"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company (optional)"
                  />
                </div>
              </div>
            </div>

            <div className="contact-field-group">
              <div className="contact-form-field">
                <label className="contact-form-label">Subject / Topic</label>
                <div className="contact-form-input-wrapper">
                  <svg className="contact-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <select
                    id="subject"
                    name="subject"
                    className="contact-form-input"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales</option>
                    <option value="support">Support</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-field-group">
            <div className="contact-form-field">
              <label className="contact-form-label">Message</label>
              <div className="contact-form-input-wrapper">
                <svg className="contact-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <textarea
                  id="message"
                  name="message"
                  className="contact-form-input contact-form-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="How can we help your business?"
                  rows="5"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="contact-field-actions">
            <button
              type="submit"
              className="contact-submit-btn"
              onClick={handleSubmit}
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
