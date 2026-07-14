import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import './Services.css';
import speedTestPreview1 from '../../assets/avatars/speedtest_preview_image.png';
import speedTestPreview2 from '../../assets/avatars/speedtest_preview_image_2.png';
import logo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';

const Services = () => {
  const location = useLocation();
  const { t } = useTranslation();

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
              {t('services.heroHeading1')}
              <br/>{t('services.heroHeading2')}
            </h1>
            
            <p className="services_description">
              {t('services.heroDesc')}
            </p>
            
            <div className="services_divider"></div>
          </div>
          
          <div className="services_hero_right">
            <div className="services_image_container">
              <img src={logo} alt={t('imageAlt.akovolabsLogo')} className="services_hero_image"/>
            </div>
          </div>
        </section>
        
        {/* Services Grid */}
        <section className="services_grid_section">
          <h2 className="services_section_title">{t('services.sectionTitle')}</h2>
          
          <div className="services_grid">
            
            {/* Speedtest Service */}
            <div id="speedtest" className="services_service_card">
              <div className="services_service_image_container">
                <img src={speedTestPreview1} alt={t('services.cards.speedtest.title')} className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">{t('services.cards.speedtest.title')}</h3>
                <p className="services_service_description">
                  {t('services.cards.speedtest.description')}
                </p>
                <div className="services_service_features">
                  {t('services.cards.speedtest.tags', { returnObjects: true }).map((tag) => (
                    <span key={tag} className="services_feature_tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Network Analysis Service */}
            <div id="network-analysis" className="services_service_card">
              <div className="services_service_image_container">
                <img src={speedTestPreview2} alt={t('services.cards.networkAnalysis.title')} className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">{t('services.cards.networkAnalysis.title')}</h3>
                <p className="services_service_description">
                  {t('services.cards.networkAnalysis.description')}
                </p>
                <div className="services_service_features">
                  {t('services.cards.networkAnalysis.tags', { returnObjects: true }).map((tag) => (
                    <span key={tag} className="services_feature_tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Security Service */}
            <div id="security" className="services_service_card">
              <div className="services_service_image_container">
                <img src={speedTestPreview1} alt={t('services.cards.security.title')} className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">{t('services.cards.security.title')}</h3>
                <p className="services_service_description">
                  {t('services.cards.security.description')}
                </p>
                <div className="services_service_features">
                  {t('services.cards.security.tags', { returnObjects: true }).map((tag) => (
                    <span key={tag} className="services_feature_tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* AI Insights Service */}
            <div id="ai-insights" className="services_service_card">
              <div className="services_service_image_container">
                <img src={speedTestPreview2} alt={t('services.cards.aiInsights.title')} className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">{t('services.cards.aiInsights.title')}</h3>
                <p className="services_service_description">
                  {t('services.cards.aiInsights.description')}
                </p>
                <div className="services_service_features">
                  {t('services.cards.aiInsights.tags', { returnObjects: true }).map((tag) => (
                    <span key={tag} className="services_feature_tag">{tag}</span>
                  ))}
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
