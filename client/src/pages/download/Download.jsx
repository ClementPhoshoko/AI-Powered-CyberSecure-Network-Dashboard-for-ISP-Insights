import React from 'react';
import { useTranslation } from 'react-i18next';
import './Download.css';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import mobileMockup from '../../assets/avatars/Futuristic_speed_test_UI_showcase.png';
import googlePlayBadge from '../../assets/GetItOnGooglePlay_Badge_Web_color_English.svg';
import appStoreBadge from '../../assets/download-on-the-app-store-apple-logo-svgrepo-com.svg';
import { RocketLaunchIcon, BoltIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import Seo from '../../components/seo/Seo';

const Download = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: <RocketLaunchIcon />,
      title: t('download.features.0.title'),
      subtitle: t('download.features.0.desc')
    },
    {
      icon: <BoltIcon />,
      title: t('download.features.1.title'),
      subtitle: t('download.features.1.desc')
    },
    {
      icon: <ShieldCheckIcon />,
      title: t('download.features.2.title'),
      subtitle: t('download.features.2.desc')
    },
    {
      icon: <GlobeAltIcon />,
      title: t('download.features.3.title'),
      subtitle: t('download.features.3.desc')
    }
  ];

  return (
    <div className="download_page">
      <Seo title={t('seo.downloadTitle')} description={t('seo.downloadDesc')} path="/download" />
        <div className="download_container">
        <section className="download_hero">
          {/* Top Section - Logo and Mockup */}
          <div className="download_visual_header">
            <div className="download_logo_container">
              <img 
                src={loginLogo} 
                alt={t('imageAlt.akovolabsLogo')} 
                className="download_logo" 
              />
            </div>
            
            <div className="download_image_container">
              <img 
                src={mobileMockup} 
                alt={t('imageAlt.futureUI')} 
                className="download_mockup_image" 
              />
            </div>
          </div>
          
          {/* Content Section */}
          <div className="download_content_section">
            <h1 className="download_headline">
              {t('download.headline')}
            </h1>
            
            <p className="download_subtitle">
              {t('download.subtitle')}
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

            <div className="download_app_badges">
              <a 
                href="https://play.google.com/store" 
                target="_blank" 
                rel="noopener noreferrer"
                className="download_app_badge_link download_google_play_link"
              >
                <img 
                  src={googlePlayBadge} 
                  alt={t('imageAlt.playStore')} 
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
                  alt={t('imageAlt.appStore')} 
                  className="download_app_badge" 
                />
              </a>
            </div>

            <p className="download_advisory">
              {t('download.betaAdvisory')}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Download;
