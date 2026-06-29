import React from 'react';
import './Download.css';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import mobileMockup from '../../assets/avatars/Futuristic_speed_test_UI_showcase.png';
import googlePlayBadge from '../../assets/GetItOnGooglePlay_Badge_Web_color_English.svg';
import appStoreBadge from '../../assets/download-on-the-app-store-apple-logo-svgrepo-com.svg';
import { RocketLaunchIcon, BoltIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/solid';

const Download = () => {
  const features = [
    {
      icon: <RocketLaunchIcon />,
      title: 'Accurate Speed Test',
      subtitle: 'Test download, upload & ping'
    },
    {
      icon: <BoltIcon />,
      title: 'Real-time Results',
      subtitle: 'Instant & precise measurements'
    },
    {
      icon: <ShieldCheckIcon />,
      title: 'Network Analysis',
      subtitle: 'Monitor your connection quality'
    },
    {
      icon: <GlobeAltIcon />,
      title: 'Works Everywhere',
      subtitle: 'WiFi, 4G, 5G & more'
    }
  ];

  return (
    <div className="download_page">
      <div className="download_container">
        <section className="download_hero">
          {/* Left Column */}
          <div className="download_hero_left">
            <div className="download_logo_container">
              <img 
                src={loginLogo} 
                alt="AkovoLabs Speedtest" 
                className="download_logo" 
              />
            </div>
            
            <h1 className="download_headline">
              AkovoLabs Speedtest
            </h1>
            
            <p className="download_subtitle">
              Fast. Accurate. Smart.
            </p>
            
            <div className="download_features">
              {features.map((feature, index) => (
                <div key={index} className="download_feature">
                  <div className="download_feature_icon">
                    {feature.icon}
                  </div>
                  <div className="download_feature_content">
                    <h3 className="download_feature_title">
                      {feature.title}
                    </h3>
                    <p className="download_feature_subtitle">
                      {feature.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column */}
          <div className="download_hero_right">
            <div className="download_image_container">
              <img 
                src={mobileMockup} 
                alt="Futuristic Speed Test UI" 
                className="download_mockup_image" 
              />
            </div>
            <div className="download_app_badges">
              <a 
                href="https://play.google.com/store" 
                target="_blank" 
                rel="noopener noreferrer"
                className="download_app_badge_link download_google_play_link"
              >
                <img 
                  src={googlePlayBadge} 
                  alt="Get it on Google Play" 
                  className="download_app_badge download_google_play_badge" 
                />
              </a>
              <a 
                href="https://apps.apple.com/store" 
                target="_blank" 
                rel="noopener noreferrer"
                className="download_app_badge_link"
              >
                <img 
                  src={appStoreBadge} 
                  alt="Download on the App Store" 
                  className="download_app_badge" 
                />
              </a>
            </div>
            <p className="download_advisory">
              Join our beta testing program for early access! Your data and speed test information is protected with end-to-end encryption. We never share your personal information without your consent.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Download;
