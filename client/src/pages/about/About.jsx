import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import './About.css';
import speedTestPreview1 from '../../assets/avatars/speedtest_preview_image.png';
import networkEngineer from '../../assets/avatars/network_engineer_preview.png';
import fullStackDev from '../../assets/avatars/full_stack_engineer_preview.png';
import Bubble from '../../components/speech_bubble/Bubble';
import Contact from './contact/Contact';
import AnimatedNumber from '../../components/AnimatedNumber';
import useSystemMetrics from '../../hooks/useSystemMetrics';
import Seo from '../../components/seo/Seo';

const About = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { metrics, loading, error } = useSystemMetrics();
  const { t } = useTranslation();

  const scrollToContact = (e) => {
    e.preventDefault();
    const element = document.getElementById('contact-us');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToServices = (e) => {
    e.preventDefault();
    navigate('/services');
  };

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
    <div className="about_page">
      <Seo title={t('seo.aboutTitle')} description={t('seo.aboutDesc')} path="/about" />
        <div className="about_container">
        
        {/* Hero Section - Company */}
        <section className="about_hero">
          <div className="about_hero_left">
            <h1 className="about_headline">
      {t('about.heroHeadline1')}
      <br/>{t('about.heroHeadline2')}
    </h1>
            
            <p className="about_description">
              {t('about.heroDesc')}
            </p>
            
            <div className="about_divider"></div>
            
            <div className="about_stats">
              <div className="about_stat">
                <span className="about_stat_number">
                  {loading ? '...' : <><AnimatedNumber value={metrics.total_users || 0} />+</>}
                </span>
                <span className="about_stat_label">{t('about.stats.users')}</span>
              </div>
              <div className="about_stat">
                <span className="about_stat_number">
                  {loading ? '...' : <AnimatedNumber value={metrics.countries_count || 0} />}
                </span>
                <span className="about_stat_label">{t('about.stats.countries')}</span>
              </div>
              <div className="about_stat">
                <span className="about_stat_number">
                  {loading ? '...' : <><AnimatedNumber value={metrics.uptime_percentage} />%</>}
                </span>
                <span className="about_stat_label">
                  {error && metrics.uptime_percentage === 0 ? t('about.stats.offline') : t('about.stats.uptime')}
                </span>
              </div>
              <div className="about_stat">
                <span className="about_stat_number">
                  {loading ? '...' : <AnimatedNumber value={metrics.founded_year || 2026} />}
                </span>
                <span className="about_stat_label">{t('about.stats.founded')}</span>
              </div>
            </div>
            
            <div className="about_cta_container">
              <a href="#contact-us" className="about_cta_secondary" onClick={scrollToContact}>
                {t('about.cta')}
                <svg className="about_cta_arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="about_hero_right">
            <div className="about_image_container">
              <img src={speedTestPreview1} alt={t('imageAlt.futureUI')} className="about_hero_image"/>
            </div>
          </div>
        </section>
        
        {/* Company Story */}
        <section id="our-story" className="about_story">
          <h2 className="about_story_heading">{t('about.ourStory')}</h2>
          
          <div className="about_story_content">
            <div className="about_story_text">
              <p className="about_story_paragraph">
                {t('about.storyParagraph1')}
              </p>
              <p className="about_story_paragraph">
                {t('about.storyParagraph2')}
              </p>
              <p className="about_story_paragraph">
                {t('about.storyParagraph3')}
              </p>
            </div>
            
            <div className="about_story_quote">
              <p className="about_quote_text">
                "{t('about.quote')}"
              </p>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section id="the-team" className="about_team_section">
          <h2 className="about_section_title">{t('about.team')}</h2>
          <ul className="about_team_grid">
            <li className="about_team_member">
              <div className="about_team_quote_wrapper">
                <Bubble position="left">
                  "{t('about.teamMember1.quote')}"
                </Bubble>
                <p className="about_mobile_quote">
                  "{t('about.teamMember1.quote')}"
                </p>
              </div>
              <div className="about_member_photo">
                <img src={fullStackDev} alt={t('imageAlt.fullStackDev')} />
              </div>
              <div className="about_member_info">
                <h3 className="about_member_name">{t('about.teamMember1.name')}</h3>
                <p className="about_member_role">{t('about.teamMember1.role')}</p>
              </div>
            </li>
            <li className="about_team_member">
              <div className="about_team_quote_wrapper">
                <Bubble position="right">
                  "{t('about.teamMember2.quote')}"
                </Bubble>
                <p className="about_mobile_quote">
                  "{t('about.teamMember2.quote')}"
                </p>
              </div>
              <div className="about_member_photo">
                <img src={networkEngineer} alt={t('imageAlt.networkEngineer')} />
              </div>
              <div className="about_member_info">
                 <h3 className="about_member_name">{t('about.teamMember2.name')}</h3>
                 <p className="about_member_role">{t('about.teamMember2.role')}</p>
               </div>
            </li>
          </ul>
        </section>

        {/* Contact Section */}
        <section id="contact-us" className="about_team_section">
          <h2 className="about_section_title">{t('about.contact')}</h2>
          <Contact />
        </section>
        
      </div>
    </div>
  );
};

export default About;
