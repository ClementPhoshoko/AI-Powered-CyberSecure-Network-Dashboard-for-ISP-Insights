import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../../components/loading/Loading';
import ErrorModal from '../../../components/error_modal/ErrorModal';
import successAvatar2 from '../../../assets/avatars/success_avatar_2.png';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [animationKey, setAnimationKey] = useState(Date.now());
  const dropdownRef = useRef(null);

  const subjectOptions = [
    { value: '', label: 'Select a topic' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'sales', label: 'Sales' },
    { value: 'support', label: 'Support' },
    { value: 'partnership', label: 'Partnership' }
  ];

  const selectedSubject = subjectOptions.find(opt => opt.value === formData.subject) || subjectOptions[0];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.subject) newErrors.subject = 'Please select a topic';
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubjectSelect = (option) => {
    setFormData(prev => ({ ...prev, subject: option.value }));
    setIsDropdownOpen(false);
    if (errors.subject) {
      setErrors(prev => ({ ...prev, subject: '' }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isSubmitting) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 95);
        });
      }, 400);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProgress(100);
      setShowSuccess(true);
      setAnimationKey(Date.now());
    } catch (err) {
      setErrorModal({ isOpen: true, message: 'Failed to send message. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div key={animationKey} className="contact-success-view">
        <img src={successAvatar2} alt="Success" className="contact-success-avatar" />
        <h1 className="contact-success-title">Message Sent!</h1>
        <p className="contact-success-text">
          Thank you for reaching out to AkovoLabs. Our team will review your inquiry and get back to you shortly.
        </p>
        <div className="contact-success-links">
          <button 
            onClick={() => {
              setShowSuccess(false);
              setFormData({ fullName: '', email: '', company: '', subject: '', message: '' });
              setAnimationKey(Date.now());
            }} 
            className="contact-success-link"
          >
            New
          </button>
          <Link to="/" className="contact-success-link">
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="contact-section">
      <Loading 
        isLoading={isSubmitting} 
        progress={progress}
        message="Sending message"
        status="AkovoLabs CRM System v1.0"
        indeterminate={true}
      />
      
      <div className="contact-form-container">
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="contact-field-row">
            <div className="contact-field-group">
              <div className="contact-form-field">
                <label className="contact-form-label">Full Name</label>
                <div className="contact-form-input-wrapper">
                  <svg className={`contact-form-icon ${errors.fullName ? 'error' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className={`contact-form-input ${errors.fullName ? 'error' : ''}`}
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && <span className="contact-error-message">{errors.fullName}</span>}
              </div>
            </div>

            <div className="contact-field-group">
              <div className="contact-form-field">
                <label className="contact-form-label">Business Email</label>
                <div className="contact-form-input-wrapper">
                  <svg className={`contact-form-icon ${errors.email ? 'error' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`contact-form-input ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@company.com"
                  />
                </div>
                {errors.email && <span className="contact-error-message">{errors.email}</span>}
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
                <div className="contact-form-input-wrapper" ref={dropdownRef}>
                  <svg className={`contact-form-icon ${errors.subject ? 'error' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <select
                    id="subject"
                    name="subject"
                    className="contact-form-input contact-form-input-hidden"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    {subjectOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div
                    className={`contact-custom-dropdown-trigger ${errors.subject ? 'error' : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className={`contact-custom-dropdown-selected ${formData.subject ? 'has-value' : ''}`}>
                      {selectedSubject.label}
                    </span>
                    <svg className={`contact-custom-dropdown-chevron ${isDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {isDropdownOpen && (
                    <div className="contact-custom-dropdown-menu">
                      {subjectOptions.map((opt) => (
                        <div
                          key={opt.value}
                          className={`contact-custom-dropdown-item ${formData.subject === opt.value ? 'selected' : ''}`}
                          onClick={() => handleSubjectSelect(opt)}
                        >
                          <svg className="contact-custom-dropdown-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                          <span>{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.subject && <span className="contact-error-message">{errors.subject}</span>}
              </div>
            </div>
          </div>

          <div className="contact-field-group">
            <div className="contact-form-field">
              <label className="contact-form-label">Message</label>
              <div className="contact-form-input-wrapper">
                <svg className={`contact-form-icon ${errors.message ? 'error' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <textarea
                  id="message"
                  name="message"
                  className={`contact-form-input contact-form-textarea ${errors.message ? 'error' : ''}`}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help your business?"
                  rows="5"
                ></textarea>
              </div>
              {errors.message && <span className="contact-error-message">{errors.message}</span>}
            </div>
          </div>

          <div className="contact-field-actions">
            <button
              type="submit"
              className="contact-submit-btn"
              disabled={isSubmitting}
            >
              Send Message
            </button>
          </div>
        </form>
      </div>

      <ErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
      />
    </section>
  );
};

export default Contact;
