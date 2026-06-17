import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-section home-hero">
        <div className="home-container">
          <div className="home-hero-content">
            <h1 className="home-hero-title">
              AI-Powered <span className="text-gradient">Network Analytics</span>
            </h1>
            <p className="home-hero-subtitle">
              Real-time speed testing, intelligent insights, and secure network monitoring for ISPs
            </p>
            <div className="home-hero-cta">
              <button className="btn-primary">Get Started</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Speed Test Section (2 Column) */}
      <section className="home-section home-speed-test">
        <div className="home-container">
          <h2 className="home-section-title">Test Your Network Speed</h2>
          <div className="home-two-col">
            <div className="home-col glass-card">
              <div className="placeholder-content">
                <div className="placeholder-icon">⚡</div>
                <h3>Speed Meter</h3>
                <p>Real-time speed test visualization</p>
              </div>
            </div>
            <div className="home-col glass-card">
              <div className="placeholder-content">
                <div className="placeholder-icon">📊</div>
                <h3>Results Dashboard</h3>
                <p>Detailed performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-section home-features">
        <div className="home-container">
          <h2 className="home-section-title">Powerful Features</h2>
          <div className="home-features-grid">
            <div className="home-feature glass-card">
              <div className="placeholder-content">
                <div className="placeholder-icon">🔒</div>
                <h3>Secure Monitoring</h3>
                <p>Enterprise-grade security analytics</p>
              </div>
            </div>
            <div className="home-feature glass-card">
              <div className="placeholder-content">
                <div className="placeholder-icon">🤖</div>
                <h3>AI Insights</h3>
                <p>Intelligent network optimization</p>
              </div>
            </div>
            <div className="home-feature glass-card">
              <div className="placeholder-content">
                <div className="placeholder-icon">📈</div>
                <h3>Real-time Analytics</h3>
                <p>Live performance monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="home-section home-testimonials">
        <div className="home-container">
          <h2 className="home-section-title">What Our Users Say</h2>
          <div className="home-testimonials-grid">
            <div className="home-testimonial glass-card">
              <div className="placeholder-content">
                <div className="placeholder-icon">👤</div>
                <h3>User Testimonial</h3>
                <p>Amazing network analytics platform</p>
              </div>
            </div>
            <div className="home-testimonial glass-card">
              <div className="placeholder-content">
                <div className="placeholder-icon">👤</div>
                <h3>User Testimonial</h3>
                <p>Best ISP tool we've used</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-section home-cta-section">
        <div className="home-container">
          <div className="home-cta glass-card">
            <h2 className="home-section-title">Ready to Get Started?</h2>
            <p className="home-cta-subtitle">
              Join thousands of ISPs already using CyberSecure
            </p>
            <button className="btn-primary btn-large">Sign Up Free</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
