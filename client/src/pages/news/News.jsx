import React from 'react';
import './News.css';

const News = () => {
  return (
    <div className="news_page">
      <div className="news_container">
        <h1 className="news_title">News</h1>
        
        <section className="news_content_section">
          <div className="news_content">
            <h2 className="news_section_title">Coming Soon</h2>
            <p className="news_text">
              We're working on something amazing! Check back soon for the latest news and updates.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default News;
