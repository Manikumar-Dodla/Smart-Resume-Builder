import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import resumeApi from './utils/api';
import Loading from './Loading';
import './ResumeForm.css';

function ResumeForm({ onSubmit, isEmbedded = false, initialData = null }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [animationDirection, setAnimationDirection] = useState(null);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: '',
      website: '',
      objective: ''
    },
    workExperience: [
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }
    ],
    education: [
      {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: ''
      }
    ],
    skills: {
      technical: '',
      soft: '',
      languages: '',
      certifications: ''
    }
  });

  // Initialize with provided data if available
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Apply animations when changing steps
  useEffect(() => {
    if (!isEmbedded) {
      document.querySelector('.resume-form-container').classList.add('visible');
    }
  }, [isEmbedded]);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        [name]: value
      }
    });
  };

  const handleWorkExperienceChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newWorkExperience = [...formData.workExperience];
    newWorkExperience[index][name] = type === 'checkbox' ? checked : value;
    
    if (name === 'current' && checked) {
      newWorkExperience[index].endDate = 'Present';
    }
    
    setFormData({
      ...formData,
      workExperience: newWorkExperience
    });
  };

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const newEducation = [...formData.education];
    newEducation[index][name] = value;
    
    setFormData({
      ...formData,
      education: newEducation
    });
  };

  const handleSkillsChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      skills: {
        ...formData.skills,
        [name]: value
      }
    });
  };

  const addWorkExperience = () => {
    setFormData({
      ...formData,
      workExperience: [
        ...formData.workExperience,
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        }
      ]
    });
  };

  const removeWorkExperience = (index) => {
    const newWorkExperience = [...formData.workExperience];
    newWorkExperience.splice(index, 1);
    setFormData({
      ...formData,
      workExperience: newWorkExperience
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: ''
        }
      ]
    });
  };

  const removeEducation = (index) => {
    const newEducation = [...formData.education];
    newEducation.splice(index, 1);
    setFormData({
      ...formData,
      education: newEducation
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isEmbedded) {
      // For embedded mode, just pass the data back to parent
      onSubmit(formData);
      return;
    }
    
    // Original submission logic for standalone mode
    setIsLoading(true);
    
    try {
      // First, check if the server is available
      await resumeApi.checkHealth()
        .catch(() => {
          throw new Error("Server is not available. Please try again later.");
        });
      
      const response = await resumeApi.generateResume(formData);
      
      // Navigate to preview with data
      navigate('/preview', { state: { resumeData: response.data } });
      
    } catch (error) {
      console.error('Error creating resume:', error);
      let errorMessage = "Failed to create resume. Please try again.";
      
      if (error.message === "Server is not available. Please try again later.") {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setAnimationDirection('next');
    setTimeout(() => {
      setStep(prevStep => prevStep + 1);
    }, 50);
  };
  
  const prevStep = () => {
    setAnimationDirection('prev');
    setTimeout(() => {
      setStep(prevStep => prevStep - 1);
    }, 50);
  };

  if (isLoading) {
    return <Loading text="Creating your resume..." />;
  }

  // For embedded mode, show a more compact layout
  if (isEmbedded) {
    return (
      <form onSubmit={handleSubmit} className="embedded-resume-form">
        <h3>Enter Resume Details</h3>
        <p className="embedded-form-note">Fill in your resume details section by section</p>
        
        {/* Compact Personal Information */}
        <div className="embedded-section">
          <h4>Personal Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="embedded-fullName">Full Name*</label>
              <input
                type="text"
                id="embedded-fullName"
                name="fullName"
                value={formData.personalInfo.fullName}
                onChange={handlePersonalInfoChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="embedded-email">Email*</label>
              <input
                type="email"
                id="embedded-email"
                name="email"
                value={formData.personalInfo.email}
                onChange={handlePersonalInfoChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="embedded-phone">Phone*</label>
              <input
                type="tel"
                id="embedded-phone"
                name="phone"
                value={formData.personalInfo.phone}
                onChange={handlePersonalInfoChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="embedded-objective">Professional Summary</label>
            <textarea
              id="embedded-objective"
              name="objective"
              value={formData.personalInfo.objective}
              onChange={handlePersonalInfoChange}
              rows="3"
              placeholder="Briefly describe your career goals and strengths"
            ></textarea>
          </div>
        </div>
        
        {/* Compact Work Experience */}
        <div className="embedded-section">
          <h4>Work Experience</h4>
          {formData.workExperience.map((job, index) => (
            <div key={index} className="embedded-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Position*</label>
                  <input
                    type="text"
                    name="position"
                    value={job.position}
                    onChange={(e) => handleWorkExperienceChange(index, e)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Company*</label>
                  <input
                    type="text"
                    name="company"
                    value={job.company}
                    onChange={(e) => handleWorkExperienceChange(index, e)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Job Description*</label>
                <textarea
                  name="description"
                  value={job.description}
                  onChange={(e) => handleWorkExperienceChange(index, e)}
                  rows="3"
                  required
                ></textarea>
              </div>
              
              {index > 0 && (
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger"
                  onClick={() => removeWorkExperience(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-sm btn-success"
            onClick={addWorkExperience}
          >
            Add Position
          </button>
        </div>
        
        {/* Compact Education */}
        <div className="embedded-section">
          <h4>Education</h4>
          {formData.education.map((edu, index) => (
            <div key={index} className="embedded-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Degree*</label>
                  <input
                    type="text"
                    name="degree"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, e)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Field of Study*</label>
                  <input
                    type="text"
                    name="field"
                    value={edu.field}
                    onChange={(e) => handleEducationChange(index, e)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Institution*</label>
                <input
                  type="text"
                  name="institution"
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, e)}
                  required
                />
              </div>
              
              {index > 0 && (
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger"
                  onClick={() => removeEducation(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-sm btn-success"
            onClick={addEducation}
          >
            Add Education
          </button>
        </div>
        
        {/* Compact Skills */}
        <div className="embedded-section">
          <h4>Skills</h4>
          <div className="form-group">
            <label>Technical Skills*</label>
            <textarea
              name="technical"
              value={formData.skills.technical}
              onChange={handleSkillsChange}
              rows="2"
              placeholder="List skills separated by commas"
              required
            ></textarea>
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary">
          Use This Information
        </button>
      </form>
    );
  }

  // Original multi-step form for standalone mode
  return (
    <div className="resume-form-container">
      <h1 className="form-title">Build Your Resume</h1>
      <div className="form-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Personal</div>
        </div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Experience</div>
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Education</div>
        </div>
        <div className={`progress-step ${step >= 4 ? 'active' : ''} ${step === 4 ? 'current' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Skills</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="resume-form">
        {/* Step 1: Personal Information */}
        <div className={`form-section ${step === 1 ? 'active' : 'hidden'} ${animationDirection}`}>
          <h2>Personal Information</h2>
          <div className="form-group">
              <label htmlFor="fullName">Full Name*</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.personalInfo.fullName}
                onChange={handlePersonalInfoChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone*</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.personalInfo.address}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.personalInfo.linkedin}
                  onChange={handlePersonalInfoChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="github">GitHub</label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={formData.personalInfo.github}
                  onChange={handlePersonalInfoChange}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="website">Personal Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.personalInfo.website}
                onChange={handlePersonalInfoChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="objective">Professional Summary</label>
              <textarea
                id="objective"
                name="objective"
                value={formData.personalInfo.objective}
                onChange={handlePersonalInfoChange}
                rows="4"
                placeholder="Briefly describe your career goals and strengths"
              ></textarea>
            </div>
          
          <div className="form-buttons">
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next: Work Experience
            </button>
          </div>
        </div>

        {/* Step 2: Work Experience */}
        <div className={`form-section ${step === 2 ? 'active' : 'hidden'} ${animationDirection}`}>
          <h2>Work Experience</h2>
          
          {formData.workExperience.map((job, index) => (
              <div key={index} className="experience-item">
                <h3>{index === 0 ? 'Most Recent Position' : `Previous Position ${index}`}</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`company-${index}`}>Company*</label>
                    <input
                      type="text"
                      id={`company-${index}`}
                      name="company"
                      value={job.company}
                      onChange={(e) => handleWorkExperienceChange(index, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`position-${index}`}>Position*</label>
                    <input
                      type="text"
                      id={`position-${index}`}
                      name="position"
                      value={job.position}
                      onChange={(e) => handleWorkExperienceChange(index, e)}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`startDate-${index}`}>Start Date*</label>
                    <input
                      type="month"
                      id={`startDate-${index}`}
                      name="startDate"
                      value={job.startDate}
                      onChange={(e) => handleWorkExperienceChange(index, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`endDate-${index}`}>End Date*</label>
                    <input
                      type="month"
                      id={`endDate-${index}`}
                      name="endDate"
                      value={job.current ? '' : job.endDate}
                      onChange={(e) => handleWorkExperienceChange(index, e)}
                      disabled={job.current}
                      required={!job.current}
                    />
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        name="current"
                        checked={job.current}
                        onChange={(e) => handleWorkExperienceChange(index, e)}
                      />
                      <label htmlFor={`current-${index}`} className="checkbox-label">I currently work here</label>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor={`description-${index}`}>Job Description*</label>
                  <textarea
                    id={`description-${index}`}
                    name="description"
                    value={job.description}
                    onChange={(e) => handleWorkExperienceChange(index, e)}
                    rows="4"
                    placeholder="Describe your responsibilities, achievements, and the skills you used"
                    required
                  ></textarea>
                </div>
                
                {formData.workExperience.length > 1 && (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => removeWorkExperience(index)}
                  >
                    Remove Position
                  </button>
                )}
                
                {index === formData.workExperience.length - 1 && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={addWorkExperience}
                  >
                    Add Another Position
                  </button>
                )}
              </div>
            ))}
          
          <div className="form-buttons">
            <button type="button" className="btn btn-secondary" onClick={prevStep}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next: Education
            </button>
          </div>
        </div>

        {/* Step 3: Education */}
        <div className={`form-section ${step === 3 ? 'active' : 'hidden'} ${animationDirection}`}>
          <h2>Education</h2>
          
          {formData.education.map((edu, index) => (
              <div key={index} className="education-item">
                <h3>{index === 0 ? 'Most Recent Education' : `Previous Education ${index}`}</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`institution-${index}`}>Institution*</label>
                    <input
                      type="text"
                      id={`institution-${index}`}
                      name="institution"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`degree-${index}`}>Degree*</label>
                    <input
                      type="text"
                      id={`degree-${index}`}
                      name="degree"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, e)}
                      placeholder="Bachelor's, Master's, etc."
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`field-${index}`}>Field of Study*</label>
                    <input
                      type="text"
                      id={`field-${index}`}
                      name="field"
                      value={edu.field}
                      onChange={(e) => handleEducationChange(index, e)}
                      placeholder="Computer Science, Business, etc."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`gpa-${index}`}>GPA</label>
                    <input
                      type="text"
                      id={`gpa-${index}`}
                      name="gpa"
                      value={edu.gpa}
                      onChange={(e) => handleEducationChange(index, e)}
                      placeholder="e.g., 3.8/4.0"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`edu-startDate-${index}`}>Start Date*</label>
                    <input
                      type="month"
                      id={`edu-startDate-${index}`}
                      name="startDate"
                      value={edu.startDate}
                      onChange={(e) => handleEducationChange(index, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`edu-endDate-${index}`}>End Date* (or Expected)</label>
                    <input
                      type="month"
                      id={`edu-endDate-${index}`}
                      name="endDate"
                      value={edu.endDate}
                      onChange={(e) => handleEducationChange(index, e)}
                      required
                    />
                  </div>
                </div>
                
                {formData.education.length > 1 && (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => removeEducation(index)}
                  >
                    Remove Education
                  </button>
                )}
                
                {index === formData.education.length - 1 && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={addEducation}
                  >
                    Add Another Education
                  </button>
                )}
              </div>
            ))}
          
          <div className="form-buttons">
            <button type="button" className="btn btn-secondary" onClick={prevStep}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next: Skills
            </button>
          </div>
        </div>

        {/* Step 4: Skills */}
        <div className={`form-section ${step === 4 ? 'active' : 'hidden'} ${animationDirection}`}>
          <h2>Skills & Certifications</h2>
          
          <div className="form-group">
              <label htmlFor="technical">Technical Skills*</label>
              <textarea
                id="technical"
                name="technical"
                value={formData.skills.technical}
                onChange={handleSkillsChange}
                rows="3"
                placeholder="List your technical skills, separated by commas (e.g., JavaScript, React, SQL, Python)"
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="soft">Soft Skills</label>
              <textarea
                id="soft"
                name="soft"
                value={formData.skills.soft}
                onChange={handleSkillsChange}
                rows="3"
                placeholder="List your soft skills, separated by commas (e.g., Leadership, Communication, Problem-solving)"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="languages">Languages</label>
              <textarea
                id="languages"
                name="languages"
                value={formData.skills.languages}
                onChange={handleSkillsChange}
                rows="2"
                placeholder="List languages you speak, with proficiency (e.g., English (Native), Spanish (Intermediate))"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="certifications">Certifications</label>
              <textarea
                id="certifications"
                name="certifications"
                value={formData.skills.certifications}
                onChange={handleSkillsChange}
                rows="3"
                placeholder="List relevant certifications (e.g., AWS Solutions Architect, Google Analytics)"
              ></textarea>
            </div>
          
          <div className="form-buttons">
            <button type="button" className="btn btn-secondary" onClick={prevStep}>
              Back
            </button>
            <button type="submit" className="btn btn-success">
              Generate Resume
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ResumeForm;