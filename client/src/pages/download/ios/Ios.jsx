import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import '../Download.css';
import './Ios.css';
import mobileMockup from '../../../assets/avatars/Futuristic_speed_test_UI_showcase.png';
import appStoreBadge from '../../../assets/download-on-the-app-store-apple-logo-svgrepo-com.svg';
import { RocketLaunchIcon, BoltIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import Seo from '../../../components/seo/Seo';

const featureVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const iconVariants = {
  hidden: { scale: 0.4 },
  visible: (i) => ({
    scale: [1, 1.2, 1],
    transition: { duration: 0.5, delay: i * 0.1 + 0.25 },
  }),
};

function Ios() {
  const { t } = useTranslation();
  const appStoreUrl = 'https://apps.apple.com/app/akovolabs-speedtest/id000000000';
  const features = [
    { icon: <RocketLaunchIcon />, title: t('download.features.0.title'), subtitle: t('download.features.0.desc') },
    { icon: <BoltIcon />, title: t('download.features.1.title'), subtitle: t('download.features.1.desc') },
    { icon: <ShieldCheckIcon />, title: t('download.features.2.title'), subtitle: t('download.features.2.desc') },
    { icon: <GlobeAltIcon />, title: t('download.features.3.title'), subtitle: t('download.features.3.desc') },
  ];

  return (
    <div className="download_page">
      <Seo title={t('seo.downloadIosTitle')} description={t('seo.downloadIosDesc')} path="/download/ios" />
      <div className="download_container">
        <section className="download_hero">
          <div className="download_visual_header">
            <motion.div
              className="download_logo_container"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="download_qr_wrapper">
                <QRCodeSVG
                  value={appStoreUrl}
                  size={180}
                  fgColor="var(--primary)"
                  bgColor="transparent"
                  level="M"
                  includeMargin
                />
              </div>
            </motion.div>

            <motion.div
              className="download_image_container"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              <img
                src={mobileMockup}
                alt={t('imageAlt.futureUI')}
                className="download_mockup_image"
              />
            </motion.div>
          </div>

          <div className="download_content_section">
            <h1 className="download_headline">{t('download.ios.title')}</h1>
            <p className="download_subtitle">{t('download.ios.subtitle')}</p>

            <div className="download_features">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="download_feature"
                  custom={index}
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                >
                  <motion.div
                    className="download_feature_icon"
                    custom={index}
                    variants={iconVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {feature.icon}
                  </motion.div>
                  <div className="download_feature_content">
                    <h3 className="download_feature_title">{feature.title}</h3>
                    <p className="download_feature_subtitle">{feature.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="download_app_badges">
              <a
                href={appStoreUrl}
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

            <p className="download_advisory">{t('download.ios.advisory')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Ios;
