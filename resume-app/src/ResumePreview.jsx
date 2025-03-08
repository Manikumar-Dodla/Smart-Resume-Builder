import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import resumeApi from './utils/api';
import Loading from './Loading';
import './ResumePreview.css';

function ResumePreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we have data from location state
    if (location.state?.resumeData) {
      setResumeData(location.state.resumeData);
      setLoading(false);
    } else {
      // If no data in state, redirect to form
      setError("No resume data found. Please create a resume first.");
      setTimeout(() => {
        navigate('/create');
      }, 3000);
    }
  }, [location, navigate]);

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const response = await resumeApi.downloadResume(resumeData);
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${Date.now()}.pdf`);
      
      // Append to html page
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Preparing your resume..." />;
  }

  if (error) {
    return (
      <div className="resume-preview-container error">
        <h2>Error</h2>
        <p>{error}</p>
        <p>Redirecting to resume builder...</p>
      </div>
    );
  }

  return (
    <div className="resume-preview-container">
      <h1>Resume Preview</h1>
      
      <div className="resume-preview">
        <div className="preview-header">
          <h1>{resumeData.personalInfo.fullName}</h1>
          <p className="preview-title">
            {resumeData.workExperience?.[0]?.position || "Professional"}
          </p>
          <div className="preview-contact">
            <span>{resumeData.personalInfo.email}</span>
            <span>{resumeData.personalInfo.phone}</span>
            {resumeData.personalInfo.address && <span>{resumeData.personalInfo.address}</span>}
          </div>
        </div>
        
        {resumeData.personalInfo.objective && (
          <div className="preview-section">
            <h2>Professional Summary</h2>
            <p>{resumeData.personalInfo.objective}</p>
          </div>
        )}
        
        <div className="preview-section">
          <h2>Experience</h2>
          {resumeData.workExperience.map((job, index) => (
            <div className="preview-item" key={index}>
              <h3>{job.position}</h3>
              <p className="preview-subtitle">
                {job.company} | {new Date(job.startDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })} - {job.current ? 'Present' : new Date(job.endDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>
              <p>{job.description}</p>
            </div>
          ))}
        </div>
        
        <div className="preview-section">
          <h2>Education</h2>
          {resumeData.education.map((edu, index) => (
            <div className="preview-item" key={index}>
              <h3>{edu.degree} in {edu.field}</h3>
              <p className="preview-subtitle">
                {edu.institution} | {new Date(edu.startDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })} - {new Date(edu.endDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>
              {edu.gpa && <p>GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
        
        <div className="preview-section">
          <h2>Skills</h2>
          <div className="preview-skills">
            {resumeData.skills.technical.split(',').map((skill, index) => (
              <span className="preview-skill" key={index}>
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
        
        {resumeData.skills.soft && (
          <div className="preview-section">
            <h2>Soft Skills</h2>
            <div className="preview-skills">
              {resumeData.skills.soft.split(',').map((skill, index) => (
                <span className="preview-skill" key={index}>
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {resumeData.skills.languages && (
          <div className="preview-section">
            <h2>Languages</h2>
            <div className="preview-skills">
              {resumeData.skills.languages.split(',').map((language, index) => (
                <span className="preview-skill" key={index}>
                  {language.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {resumeData.skills.certifications && (
          <div className="preview-section">
            <h2>Certifications</h2>
            <div className="preview-skills">
              {resumeData.skills.certifications.split(',').map((cert, index) => (
                <span className="preview-skill" key={index}>
                  {cert.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="preview-actions">
        <button onClick={() => navigate('/create')} className="btn btn-secondary">
          Edit Resume
        </button>
        <button onClick={handleDownloadPDF} className="btn btn-primary">
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default ResumePreview;
