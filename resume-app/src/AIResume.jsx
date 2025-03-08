import React, { useState, useRef, useEffect } from "react";
import { pdfjs } from "react-pdf";
import resumeApi from './utils/api';
import Loading from './Loading';
import ResumeForm from './ResumeForm';
import './AIResume.css';
import { extractTextFromPdf, extractTextFromPdfFallback, extractRawText } from './utils/pdfUtils';
import LaTeXPreview from './components/LaTeXPreview';

function AIResume() {
  // State variables
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [latexCode, setLatexCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "manual"
  const [manualEntryMode, setManualEntryMode] = useState("text"); // "text" or "form"
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(null); // For detailed form entry
  const [iframeUrl, setIframeUrl] = useState(""); // For LaTeX preview
  const [previewReady, setPreviewReady] = useState(false); // Track if preview is ready
  const [pdfData, setPdfData] = useState(null); // Add this new state for PDF data
  const [renderedLatex, setRenderedLatex] = useState("");
  const [latexError, setLatexError] = useState(null);
  
  // References
  const fileInputRef = useRef(null);
  const previewIframeRef = useRef(null);

  // Initialize PDF.js worker - fix by ensuring this runs client-side only
  useEffect(() => {
    try {
      // Ensure PDF.js worker is loaded from a reliable CDN
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      console.log(`PDF.js worker initialized: v${pdfjs.version}`);
    } catch (err) {
      console.error("Error initializing PDF.js worker:", err);
    }
  }, []);

  // Handle PDF file upload with improved error handling and fallbacks
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setError("");
    
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }
    
    setIsLoading(true);
    setFileName(file.name);
    
    console.log(`Processing PDF file: ${file.name}, size: ${file.size} bytes`);
    
    try {
      // Use a sequence of fallbacks to ensure we can extract text
      let extractedText = null;
      let errorMessages = [];
      
      // Try each method in sequence until one works
      try {
        console.log("Attempting primary PDF extraction method...");
        extractedText = await extractTextFromPdf(file);
        
        if (extractedText && extractedText.trim().length > 20) {
          console.log(`Successfully extracted ${extractedText.length} characters with primary method`);
        } else {
          errorMessages.push("Primary method extracted insufficient text");
          extractedText = null;
        }
      } catch (primaryErr) {
        console.log("Primary extraction failed:", primaryErr.message);
        errorMessages.push(primaryErr.message);
      }
      
      // If primary method fails, try fallback
      if (!extractedText) {
        try {
          console.log("Attempting fallback PDF extraction method...");
          extractedText = await extractTextFromPdfFallback(file);
          
          if (extractedText && extractedText.trim().length > 20) {
            console.log(`Successfully extracted ${extractedText.length} characters with fallback method`);
          } else {
            errorMessages.push("Fallback method extracted insufficient text");
            extractedText = null;
          }
        } catch (fallbackErr) {
          console.log("Fallback extraction failed:", fallbackErr.message);
          errorMessages.push(fallbackErr.message);
        }
      }
      
      // Last resort - try raw text extraction
      if (!extractedText) {
        try {
          console.log("Attempting raw text extraction...");
          extractedText = await extractRawText(file);
          
          if (extractedText && extractedText.length > 20) {
            console.log(`Successfully extracted ${extractedText.length} characters with raw method`);
          } else {
            errorMessages.push("Raw extraction method failed");
            extractedText = null;
          }
        } catch (rawErr) {
          console.log("Raw text extraction failed:", rawErr.message);
          errorMessages.push(rawErr.message);
        }
      }
      
      // Final check - do we have text?
      if (extractedText && extractedText.trim().length > 0) {
        setResumeText(extractedText.trim());
      } else {
        throw new Error("All extraction methods failed: " + errorMessages.join(", "));
      }
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      setError("Failed to read the PDF file. Please try another file or paste your resume text manually.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual resume text input
  const handleResumeTextChange = (e) => {
    setResumeText(e.target.value);
  };

  // Handle form data from the detailed form
  const handleFormSubmission = (data) => {
    setFormData(data);
    
    // Convert form data to text for API submission
    const formText = convertFormDataToText(data);
    setResumeText(formText);
  };

  // Convert structured form data to text
  const convertFormDataToText = (data) => {
    let text = "";
    
    // Personal info
    text += `${data.personalInfo.fullName}\n`;
    text += `${data.personalInfo.email} | ${data.personalInfo.phone}\n`;
    if (data.personalInfo.address) text += `${data.personalInfo.address}\n`;
    if (data.personalInfo.linkedin) text += `LinkedIn: ${data.personalInfo.linkedin}\n`;
    if (data.personalInfo.github) text += `GitHub: ${data.personalInfo.github}\n`;
    if (data.personalInfo.website) text += `Website: ${data.personalInfo.website}\n`;
    if (data.personalInfo.objective) text += `\n${data.personalInfo.objective}\n`;
    
    // Work experience
    text += "\nEXPERIENCE\n";
    data.workExperience.forEach((job) => {
      text += `${job.position} at ${job.company}\n`;
      const endDate = job.current ? "Present" : job.endDate;
      text += `${job.startDate} - ${endDate}\n`;
      text += `${job.description}\n\n`;
    });
    
    // Education
    text += "\nEDUCATION\n";
    data.education.forEach((edu) => {
      text += `${edu.degree} in ${edu.field}\n`;
      text += `${edu.institution}\n`;
      text += `${edu.startDate} - ${edu.endDate}\n`;
      if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
      text += "\n";
    });
    
    // Skills
    text += "\nSKILLS\n";
    text += `Technical Skills: ${data.skills.technical}\n`;
    if (data.skills.soft) text += `Soft Skills: ${data.skills.soft}\n`;
    if (data.skills.languages) text += `Languages: ${data.skills.languages}\n`;
    if (data.skills.certifications) text += `Certifications: ${data.skills.certifications}\n`;
    
    return text;
  };

  // Improved error handling for API calls
  const handleGenerateResume = async () => {
    if (!resumeText) {
      setError("Please provide your resume content");
      return;
    }
    
    if (!jobDescription) {
      setError("Please provide a job description");
      return;
    }
    
    setError("");
    setIsLoading(true);
    setPreviewReady(false);
    setPdfData(null);
    
    try {
      // Try to check if server is available first
      try {
        await resumeApi.checkHealth();
      } catch (healthError) {
        console.error("Server health check failed:", healthError);
        throw new Error("Could not connect to AI service. Please try again later.");
      }
      
      // Now proceed with generating the resume
      const response = await resumeApi.generateAIResume(
        resumeText,
        jobDescription,
        customPrompt
      );
      
      if (response && response.data && response.data.success) {
        if (response.data.data) {
          setLatexCode(response.data.data.outputlatex);
          
          // Handle PDF data if available
          if (response.data.data.pdf) {
            const pdfBlob = base64ToBlob(response.data.data.pdf, 'application/pdf');
            setPdfData(URL.createObjectURL(pdfBlob));
            setPreviewReady(true);
          } else {
            // Fallback to old method if no PDF
            setTimeout(() => {
              generatePreview(response.data.data.outputlatex);
            }, 500);
          }
        } else {
          throw new Error("Received success response but no content was found");
        }
      } else {
        const errorMessage = response?.data?.error || "Failed to generate resume";
        console.error("API Error:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error generating resume:", error);
      
      // Clear potentially corrupt state
      setLatexCode("");
      setIframeUrl("");
      setPreviewReady(false);
      
      // Provide meaningful error message based on error type
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection and try again.");
      } else if (error.message.includes("network") || error.message.includes("timeout")) {
        setError("Network error. Please check your connection and try again.");
      } else if (error.response?.status === 429) {
        setError("You've reached the request limit. Please wait a moment before trying again.");
      } else if (error.response?.status >= 500) {
        setError("Server error. Our team has been notified and is working on it.");
      } else {
        setError(error.message || "Failed to generate resume. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: mimeType });
  };
  
  // Download PDF directly
  const handleDownloadPdf = () => {
    if (pdfData) {
      // If we already have PDF data, download it directly
      const a = document.createElement('a');
      a.href = pdfData;
      a.download = 'optimized_resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (latexCode) {
      // If we only have LaTeX code, request PDF from server
      setIsLoading(true);
      
      resumeApi.downloadResumePDF(latexCode)
        .then(response => {
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'optimized_resume.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        })
        .catch(error => {
          console.error("Error downloading PDF:", error);
          setError("Failed to download PDF. Please try again.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // Generate preview of the LaTeX code
  const generatePreview = async (latexCode) => {
    try {
      setIframeUrl('');
      setPreviewReady(false);
      setLatexError(null);
      
      if (!latexCode || typeof latexCode !== 'string' || latexCode.length < 100) {
        throw new Error("LaTeX code appears to be invalid or incomplete");
      }
      
      // Extract document content for rendering
      const bodyMatch = latexCode.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
      if (bodyMatch && bodyMatch[1]) {
        setRenderedLatex(latexCode);
        
        // Set preview as ready
        setTimeout(() => {
          setPreviewReady(true);
        }, 300);
      } else {
        throw new Error("Could not extract document content from LaTeX code");
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      setLatexError(error.message);
      setPreviewReady(true); // Set ready so error is displayed
    }
  };

  // Compile the LaTeX code and get PDF via Overleaf
  const handleCompileLatex = () => {
    if (!latexCode) return;
    
    // Create a form that will submit to Overleaf
    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';
    
    // Add the LaTeX content as a hidden field
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = 'snip';
    hiddenField.value = latexCode;
    
    // Append to form and to document body
    form.appendChild(hiddenField);
    document.body.appendChild(form);
    
    // Submit the form
    form.submit();
    
    // Clean up
    document.body.removeChild(form);
  };
  
  // Download LaTeX file
  const handleDownloadLatex = () => {
    if (!latexCode) return;
    
    const blob = new Blob([latexCode], { type: 'application/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset the form
  const handleReset = () => {
    setResumeText("");
    setJobDescription("");
    setCustomPrompt("");
    setLatexCode("");
    setFileName("");
    setError("");
    setFormData(null);
    setIframeUrl("");
    setPreviewReady(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return <Loading text={latexCode ? "Processing your resume..." : "Reading your resume..."} />;
  }

  return (
    <div className="ai-resume-container">
      <h1>AI-Powered Resume Optimization</h1>
      <p className="ai-description">
        Upload your existing resume and optimize it for a specific job description using AI.
      </p>

      {!latexCode ? (
        <>
          <div className="tab-selector">
            <button 
              className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Resume
            </button>
            <button 
              className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => setActiveTab('manual')}
            >
              Enter Resume Text
            </button>
          </div>

          <div className="resume-input-section">
            {activeTab === 'upload' ? (
              <div className="file-upload-area">
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="file-input"
                  />
                  <div className="upload-button">
                    <span className="upload-icon">📄</span>
                    <span>Choose PDF Resume</span>
                  </div>
                </label>
                {fileName && <p className="file-name">Selected: {fileName}</p>}
              </div>
            ) : (
              <div className="manual-input-area">
                <div className="manual-input-tabs">
                  <button 
                    className={`manual-tab ${manualEntryMode === 'text' ? 'active' : ''}`}
                    onClick={() => setManualEntryMode('text')}
                  >
                    Paste Full Resume
                  </button>
                  <button 
                    className={`manual-tab ${manualEntryMode === 'form' ? 'active' : ''}`}
                    onClick={() => setManualEntryMode('form')}
                  >
                    Fill Form
                  </button>
                </div>
                
                {manualEntryMode === 'text' ? (
                  <>
                    <label htmlFor="resume-text">Paste Your Resume Text</label>
                    <textarea
                      id="resume-text"
                      value={resumeText}
                      onChange={handleResumeTextChange}
                      placeholder="Copy and paste your resume text here..."
                      rows="10"
                    ></textarea>
                  </>
                ) : (
                  <div className="detailed-form-container">
                    <ResumeForm 
                      onSubmit={handleFormSubmission} 
                      isEmbedded={true}
                      initialData={formData} 
                    />
                  </div>
                )}
              </div>
            )}

            {resumeText && (
              <>
                <div className="form-group">
                  <label htmlFor="job-description">Job Description *</label>
                  <textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here to tailor your resume..."
                    rows="6"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="custom-prompt">Custom Instructions (Optional)</label>
                  <textarea
                    id="custom-prompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Add specific instructions like 'Emphasize my leadership skills' or 'Focus on technical skills related to data science'..."
                    rows="3"
                  ></textarea>
                </div>

                <div className="action-buttons">
                  <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
                  <button className="btn btn-primary" onClick={handleGenerateResume}>Generate Optimized Resume</button>
                </div>
              </>
            )}

            {error && <p className="error-message">{error}</p>}
          </div>
        </>
      ) : (
        <div className="result-container">
          <div className="actions">
            <button className="btn btn-secondary" onClick={() => setLatexCode("")}>Back to Edit</button>
            <button className="btn btn-primary" onClick={handleDownloadLatex}>Download LaTeX</button>
            <button className="btn btn-success" onClick={handleDownloadPdf}>Download PDF</button>
          </div>
          
          <div className="split-view">
            <div className="latex-editor">
              <h3>LaTeX Code</h3>
              <pre className="latex-code">{latexCode}</pre>
            </div>
            
            <div className="latex-preview-pane">
              <h3>Preview</h3>
              <div className="preview-wrapper">
                {!previewReady ? (
                  <div className="preview-loading">
                    <p>Preparing preview...</p>
                    <div className="preview-spinner"></div>
                  </div>
                ) : pdfData ? (
                  <iframe
                    src={pdfData}
                    className="pdf-preview"
                    title="Resume PDF Preview"
                    width="100%"
                    height="500px"
                  />
                ) : latexError ? (
                  <div className="preview-error">
                    <p>Error rendering preview: {latexError}</p>
                    <button className="btn btn-primary" onClick={handleDownloadPdf}>
                      Download PDF instead
                    </button>
                  </div>
                ) : renderedLatex ? (
                  <div className="latex-rendered-preview">
                    <LaTeXPreview latex={renderedLatex} />
                  </div>
                ) : (
                  <div className="preview-fallback">
                    <p>PDF preview not available directly in this interface.</p>
                    <p>To view your resume:</p>
                    <button className="btn btn-primary" onClick={handleDownloadPdf}>
                      View & Download PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIResume;