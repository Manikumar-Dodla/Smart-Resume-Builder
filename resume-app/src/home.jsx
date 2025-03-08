import React from "react";
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div  className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Create Professional Resumes in Minutes</h1>
          <p className="hero-description">
            Build and customize your professional resume with our easy-to-use resume builder.
            Stand out from the crowd and get hired faster.
          </p>
          <div className="hero-buttons">
            <Link to="/create" className="cta-button">
              Create Your Resume
            </Link>
            <Link to="/ai-optimize" className="cta-button secondary">
              AI Optimize Resume
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/resume-illustration.svg" alt="Resume Builder" />
        </div>
      </section>
      
      <section className="features-section">
        <h2 className="section-title">Why Choose Our Resume Builder?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-icons">speed</span>
            </div>
            <h3>Easy and Fast</h3>
            <p>Create your professional resume in just a few minutes with our intuitive interface.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-icons">design_services</span>
            </div>
            <h3>Professional Templates</h3>
            <p>Choose from professionally designed templates that catch employers' attention.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-icons">edit_document</span>
            </div>
            <h3>Customizable</h3>
            <p>Easily customize every section of your resume to highlight your strengths.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-icons">auto_awesome</span>
            </div>
            <h3>AI Optimization</h3>
            <p>Use AI to optimize your resume for specific job descriptions and improve ATS scores.</p>
          </div>
        </div>
      </section>
      
      <section className="testimonials-section">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"This resume builder helped me land my dream job. The templates are professional and the interface is so easy to use!"</p>
            </div>
            <div className="testimonial-author">
              <p className="author-name">Sarah Johnson</p>
              <p className="author-title">Software Developer</p>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"I was able to create a stunning resume in less than 30 minutes. The customization options are amazing!"</p>
            </div>
            <div className="testimonial-author">
              <p className="author-name">Michael Chen</p>
              <p className="author-title">Marketing Manager</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="cta-section">
        <h2>Ready to Create Your Professional Resume?</h2>
        <p>Start building your resume now and take the next step in your career journey.</p>
        <div className="cta-buttons">
          <Link to="/create" className="cta-button">
            Get Started Now
          </Link>
          <Link to="/ai-optimize" className="cta-button secondary">
            Optimize Existing Resume
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
