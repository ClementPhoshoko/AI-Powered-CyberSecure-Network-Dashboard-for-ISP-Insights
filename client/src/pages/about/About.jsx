import React from 'react';
import './About.css';
import speedTestPreview1 from '../../assets/avatars/speedtest_preview_image.png';
import networkEngineer from '../../assets/avatars/network_engineer_preview.png';
import fullStackDev from '../../assets/avatars/full_stack_engineer_preview.png';

const About = () => {
  return (
    <div className="about_page">
      <div className="about_container">
        
        {/* Hero Section - Company */}
        <section className="about_hero">
          <div className="about_hero_left">
            <h1 className="about_headline">
      Building the Future
      <br/>of Connectivity
    </h1>
            
            <p className="about_description">
              We're building the future of internet speed testing and network analytics. AkovoLabs Speedtest gives ISPs and users unprecedented insights into network performance, security, and reliability.
            </p>
            
            <div className="about_divider"></div>
            
            <div className="about_stats">
              <div className="about_stat">
                <span className="about_stat_number">5,000+</span>
                <span className="about_stat_label">Users</span>
              </div>
              <div className="about_stat">
                <span className="about_stat_number">2</span>
                <span className="about_stat_label">Countries</span>
              </div>
              <div className="about_stat">
                <span className="about_stat_number">99.9%</span>
                <span className="about_stat_label">Uptime</span>
              </div>
              <div className="about_stat">
                <span className="about_stat_number">2026</span>
                <span className="about_stat_label">Founded</span>
              </div>
            </div>
            
            <div className="about_cta_container">
              <button className="about_cta_primary">
                Learn More
              </button>
              <a href="#" className="about_cta_secondary">
                Contact Us
                <svg className="about_cta_arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="about_hero_right">
            <div className="about_image_container">
              <img src={speedTestPreview1} alt="AkovoLabs Team" className="about_hero_image"/>
            </div>
          </div>
        </section>
        
        {/* Company Story */}
        <section className="about_story">
          <h2 className="about_story_heading">Our Story</h2>
          
          <div className="about_story_content">
            <div className="about_story_text">
              <p className="about_story_paragraph">
                At AkovoLabs, we believe technology should simplify life instead of complicating it. That's why we set out to build AkovoLabs Speedtest, a network testing platform that's both powerful and intuitive.
              </p>
              <p className="about_story_paragraph">
                Our mission is to make network management accessible to everyone. Whether you're a home user curious about your connection or an ISP managing thousands of customers, AkovoLabs Speedtest gives you the insights you need.
              </p>
              <p className="about_story_paragraph">
                With real-time monitoring, intelligent anomaly detection, and beautiful visualizations, we're making network management simple, powerful, and accessible to all.
              </p>
            </div>
            
            <div className="about_story_quote">
              <div className="about_quote_card">
                <svg className="about_quote_icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <p className="about_quote_text">
                  "Smart technology, lightning-fast speed, and actionable insights—because connectivity should work for you, not against you. We believe in making complex network data simple, intuitive, and empowering for everyone."
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="about_team_section">
          <h2 className="about_section_title">The Team</h2>
          <div className="about_team_grid">
            <div className="about_team_member">
              <div className="about_member_photo">
                <img src={fullStackDev} alt="Team Member 1" />
              </div>
              <h3 className="about_member_name">Clement Phoshoko</h3>
              <p className="about_member_role">Full Stack Developer</p>
            </div>
            <div className="about_team_member">
              <div className="about_member_photo">
                <img src={networkEngineer} alt="Team Member 2" />
              </div>
              <h3 className="about_member_name">Tsumbedzo Matloga</h3>
              <p className="about_member_role">Network Software Engineer</p>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default About;
