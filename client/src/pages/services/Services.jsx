import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Services.css';
import speedTestPreview1 from '../../assets/avatars/speedtest_preview_image.png';
import speedTestPreview2 from '../../assets/avatars/speedtest_preview_image_2.png';
import logo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';

const Services = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);
  return (
    <div className="services_page">
      <div className="services_container">
        
        {/* Hero Section */}
        <section className="services_hero">
          <div className="services_hero_left">
            <h1 className="services_headline">
              Our Services
              <br/>Powered by AI
            </h1>
            
            <p className="services_description">
              Comprehensive network solutions designed to give you complete visibility, security, and control over your internet experience. Whether you're a home user looking to optimize your Wi-Fi performance, a small business monitoring critical network infrastructure, or an ISP managing thousands of customer connections, our platform provides the tools you need to succeed. With real-time analytics, intelligent AI-powered insights, and robust security features, we empower you to make data-driven decisions, resolve issues proactively, and deliver exceptional connectivity experiences to your users.
            </p>
            
            <div className="services_divider"></div>
          </div>
          
          <div className="services_hero_right">
            <div className="services_image_container">
              <img src={logo} alt="AkovoLabs Services" className="services_hero_image"/>
            </div>
          </div>
        </section>
        
        {/* Services Grid */}
        <section className="services_grid_section">
          <h2 className="services_section_title">What We Offer</h2>
          
          <div className="services_grid">
            
            {/* Speedtest Service */}
            <div id="speedtest" className="services_service_card">
              <div className="services_service_image_container">
                <img src={speedTestPreview1} alt="Speedtest" className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">Speedtest</h3>
                <p className="services_service_description">
                  Lightning-fast speed testing with real-time metrics, historical data, and beautiful visualizations. Measure download, upload, ping, and jitter with precision. Track performance trends over time, compare results across different locations, and share detailed reports with your team or customers.
                </p>
                <div className="services_service_features">
                  <span className="services_feature_tag">Real-time</span>
                  <span className="services_feature_tag">Historical</span>
                  <span className="services_feature_tag">Visualization</span>
                </div>
              </div>
            </div>
            
            {/* Network Analysis Service */}
            <div id="network-analysis" className="services_service_card">
              <div className="services_service_image_container">
                <img src={speedTestPreview2} alt="Network Analysis" className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">Network Analysis</h3>
                <p className="services_service_description">
                  Deep network diagnostics, analytics, and performance monitoring. Identify bottlenecks, latency issues, and network anomalies automatically. Gain comprehensive visibility into your network performance with intuitive dashboards and detailed logs.
                </p>
                <div className="services_service_features">
                  <span className="services_feature_tag">Diagnostics</span>
                  <span className="services_feature_tag">Monitoring</span>
                  <span className="services_feature_tag">Anomaly Detection</span>
                </div>
              </div>
            </div>
            
            {/* Security Service */}
            <div id="security" className="services_service_card">
              <div className="services_service_image_container">
                <img src={speedTestPreview1} alt="Security" className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">Security</h3>
                <p className="services_service_description">
                  Advanced port scanning, vulnerability detection, and risk assessment to keep your network safe from attacks and intrusions. Detect open ports, assess security risks, and get actionable recommendations to secure your network.
                </p>
                <div className="services_service_features">
                  <span className="services_feature_tag">Port Scanning</span>
                  <span className="services_feature_tag">Risk Assessment</span>
                  <span className="services_feature_tag">Recommendations</span>
                </div>
              </div>
            </div>
            
            {/* AI Insights Service */}
            <div id="ai-insights" className="services_service_card">
              <div className="services_service_image_container">
                <img src={speedTestPreview2} alt="AI Insights" className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">AI Insights</h3>
                <p className="services_service_description">
                  AI-powered insights, scoring, and intelligent recommendations to optimize your network performance automatically. Leverage advanced algorithms to get tailored advice and network health scores for gaming, streaming, and more.
                </p>
                <div className="services_service_features">
                  <span className="services_feature_tag">AI Summaries</span>
                  <span className="services_feature_tag">Network Scoring</span>
                  <span className="services_feature_tag">Recommendations</span>
                </div>
              </div>
            </div>
            
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default Services;
