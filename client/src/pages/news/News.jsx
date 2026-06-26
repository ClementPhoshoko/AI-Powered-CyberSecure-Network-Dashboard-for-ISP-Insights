import React, { useState, useMemo, useEffect } from 'react';
import './News.css';
import * as blogs from './blogs';

const News = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [dockedPostId, setDockedPostId] = useState(null);
  const postsPerPage = 5; // 1 large + 4 small

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Convert blogs object to array and sort by date (newest first)
  const allPosts = useMemo(() => {
    const postsArray = Object.values(blogs);
    return postsArray.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(allPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  let currentPosts = allPosts.slice(indexOfFirstPost, indexOfLastPost);

  // Reorder posts if there's a docked post
  if (dockedPostId) {
    const dockedPost = currentPosts.find(post => post.id === dockedPostId);
    if (dockedPost) {
      const otherPosts = currentPosts.filter(post => post.id !== dockedPostId);
      currentPosts = [dockedPost, ...otherPosts];
    }
  }

  const goToPage = (pageNumber) => {
    setIsLoading(true);
    setDockedPostId(null); // Reset docked post when changing pages
    setCurrentPage(pageNumber);
    // Simulate loading when changing pages
    setTimeout(() => {
      setIsLoading(false);
      // Scroll to top of grid
      const gridSection = document.querySelector('.news_grid_section');
      if (gridSection) {
        gridSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 800);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const handlePostClick = (postId, index) => {
    if (index === 0) {
      // Clicked the large post, undock
      setDockedPostId(null);
    } else {
      // Clicked a small post, dock it
      setDockedPostId(postId);
    }
  };

  // Render skeleton placeholders
  const renderSkeletons = () => {
    return (
      <>
        {/* Large Skeleton */}
        <article className="news_post news_post_large">
          <div className="news_post_image_container">
            <div className="news_skeleton news_skeleton_image" style={{ height: '100%' }} />
          </div>
          <div className="news_post_content">
            <div className="news_skeleton_content">
              <div className="news_skeleton news_skeleton_title" />
              <div className="news_skeleton news_skeleton_description" />
              <div className="news_skeleton news_skeleton_description" />
            </div>
          </div>
        </article>
        
        {/* 4 Small Skeletons */}
        {[...Array(4)].map((_, i) => (
          <article key={i} className="news_post news_post_small">
            <div className="news_post_image_container">
              <div className="news_skeleton news_skeleton_image" style={{ height: '100%' }} />
            </div>
            <div className="news_post_content">
              <div className="news_skeleton_content">
                <div className="news_skeleton news_skeleton_title" />
                <div className="news_skeleton news_skeleton_description" />
              </div>
            </div>
          </article>
        ))}
      </>
    );
  };

  return (
    <div className="news_page">
      <div className="news_container">
        
        {/* Hero Section */}
        <section className="news_hero">
          <div className="news_hero_left">
            <h1 className="news_headline">
              Latest News &
              <br/>Updates
            </h1>
            <p className="news_description">
              Stay informed about the latest developments, feature releases, and improvements to our AI-powered network security platform.
            </p>
            <div className="news_divider"></div>
          </div>
        </section>
        
        {/* News Grid */}
        <section className="news_grid_section">
          <div className="news_grid">
            {isLoading ? (
              renderSkeletons()
            ) : (
              currentPosts.map((post, index) => (
                <article 
                  key={post.id} 
                  className={`news_post ${index === 0 ? 'news_post_large' : 'news_post_small'} ${dockedPostId === post.id && index === 0 ? 'docking' : ''}`}
                  onClick={() => handlePostClick(post.id, index)}
                >
                  <div className="news_post_image_container">
                    <img src={post.image} alt={post.title} className="news_post_image" />
                  </div>
                  <div className="news_post_content">
                    <div className="news_post_meta">
                      <span className="news_post_category">{post.category}</span>
                      <span className="news_post_date">{post.date}</span>
                    </div>
                    <h3 className="news_post_title">{post.title}</h3>
                    <p className="news_post_description">{post.description}</p>
                  </div>
                </article>
              ))
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="news_pagination">
              <button
                className="news_pagination_btn news_pagination_prev"
                onClick={goToPreviousPage}
                disabled={currentPage === 1 || isLoading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Previous
              </button>
              
              <div className="news_pagination_numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`news_pagination_number ${currentPage === pageNumber ? 'active' : ''}`}
                    onClick={() => goToPage(pageNumber)}
                    disabled={isLoading}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              
              <button
                className="news_pagination_btn news_pagination_next"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || isLoading}
              >
                Next
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </section>
        
      </div>
    </div>
  );
};

export default News;
