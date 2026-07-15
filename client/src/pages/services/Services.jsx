import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Services.css';
import speedTestPreview1 from '../../assets/avatars/speedtest_preview_image.png';
import speedTestPreview2 from '../../assets/avatars/speedtest_preview_image_2.png';
import logo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import Seo from '../../components/seo/Seo';

const cardVariants = {
  hidden: { opacity: 0, y: 30, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  visible: {
    opacity: 1,
    y: 0,
    boxShadow: 'var(--shadow-glass)',
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const tagContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.2 },
  },
};

const tagVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

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
      <Seo title={t('seo.servicesTitle')} description={t('seo.servicesDesc')} path="/services" />
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
          <motion.h2
            className="services_section_title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('services.sectionTitle')}
          </motion.h2>
          
          <div className="services_grid">
            
            {/* Speedtest Service */}
            <motion.div
              id="speedtest"
              className="services_service_card"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0 }}
            >
              <div className="services_service_image_container">
                <img src={speedTestPreview1} alt={t('services.cards.speedtest.title')} className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">{t('services.cards.speedtest.title')}</h3>
                <p className="services_service_description">
                  {t('services.cards.speedtest.description')}
                </p>
                <motion.div
                  className="services_service_features"
                  variants={tagContainerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {t('services.cards.speedtest.tags', { returnObjects: true }).map((tag) => (
                    <motion.span key={tag} className="services_feature_tag" variants={tagVariants}>
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
            
            {/* Network Analysis Service */}
            <motion.div
              id="network-analysis"
              className="services_service_card"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.1 }}
            >
              <div className="services_service_image_container">
                <img src={speedTestPreview2} alt={t('services.cards.networkAnalysis.title')} className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">{t('services.cards.networkAnalysis.title')}</h3>
                <p className="services_service_description">
                  {t('services.cards.networkAnalysis.description')}
                </p>
                <motion.div
                  className="services_service_features"
                  variants={tagContainerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {t('services.cards.networkAnalysis.tags', { returnObjects: true }).map((tag) => (
                    <motion.span key={tag} className="services_feature_tag" variants={tagVariants}>
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
            
            {/* Security Service */}
            <motion.div
              id="security"
              className="services_service_card"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.2 }}
            >
              <div className="services_service_image_container">
                <img src={speedTestPreview1} alt={t('services.cards.security.title')} className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">{t('services.cards.security.title')}</h3>
                <p className="services_service_description">
                  {t('services.cards.security.description')}
                </p>
                <motion.div
                  className="services_service_features"
                  variants={tagContainerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {t('services.cards.security.tags', { returnObjects: true }).map((tag) => (
                    <motion.span key={tag} className="services_feature_tag" variants={tagVariants}>
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
            
            {/* AI Insights Service */}
            <motion.div
              id="ai-insights"
              className="services_service_card"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.3 }}
            >
              <div className="services_service_image_container">
                <img src={speedTestPreview2} alt={t('services.cards.aiInsights.title')} className="services_service_image"/>
              </div>
              <div className="services_service_content">
                <h3 className="services_service_title">{t('services.cards.aiInsights.title')}</h3>
                <p className="services_service_description">
                  {t('services.cards.aiInsights.description')}
                </p>
                <motion.div
                  className="services_service_features"
                  variants={tagContainerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {t('services.cards.aiInsights.tags', { returnObjects: true }).map((tag) => (
                    <motion.span key={tag} className="services_feature_tag" variants={tagVariants}>
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
            
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default Services;
