const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const bodyParser = require('body-parser');
const pdf = require('html-pdf');
const { generatePdf } = require('./pdfGenerator');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Use API key from environment variable
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "AIzaSyABK93c4bsZD5ZNSws03k6w4Q9g7ECVd60");

// ✅ Function to generate text using Gemini
const generateText = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    
    return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No response from Gemini API";
  } catch (error) {
    console.error("Error generating text:", error);
    return null;
  }
};

// ✅ LaTeX Template (Defined Globally) - Fixed duplicate \documentclass
const template = `
\\documentclass[letterpaper,11pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\usepackage{graphicx}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}
\\input{glyphtounicode}

\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}
\\input{glyphtounicode}
\\RequirePackage{tikz}
\\RequirePackage{xcolor}
\\RequirePackage{fontawesome5}
\\usepackage{tikz}
\\usetikzlibrary{svg.path}

\\definecolor{cvblue}{HTML}{0E5484}
\\definecolor{black}{HTML}{130810}
\\definecolor{darkcolor}{HTML}{0F4539}
\\definecolor{cvgreen}{HTML}{3BD80D}
\\definecolor{taggreen}{HTML}{00E278}
\\definecolor{SlateGrey}{HTML}{2E2E2E}
\\definecolor{LightGrey}{HTML}{666666}
\\colorlet{name}{black}
\\colorlet{tagline}{darkcolor}
\\colorlet{heading}{darkcolor}
\\colorlet{headingrule}{cvblue}
\\colorlet{accent}{darkcolor}
\\colorlet{emphasis}{SlateGrey}
\\colorlet{body}{LightGrey}

\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

% Define resume-specific commands
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeSubheading}[3]{
  \\item\\textbf{#1} \\hfill #2 \\\\
  \\textit{#3} \\vspace{2pt}
}
\\newcommand{\\resumeProjectHeading}[2]{
  \\item\\textbf{#1} \\hfill #2
}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.15in, label=$\cdot$]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}}
\\newcommand{\\resumeItem}[1]{\\item #1}

\\begin{document}

\\begin{center}
    {\\Huge \\scshape YOUR NAME} \\\\ \\vspace{1pt}
    \\\\ \\vspace{1pt}
    \\small \\href{tel:0000000000}{ \\raisebox{-0.1\\height}\\faPhone\\ \\underline{0000000000} ~} 
    \\href{mailto:your.email@example.com}{\\raisebox{-0.2\\height}\\faEnvelope\\ \\underline{your.email@example.com}} ~
    \\href{https://linkedin.com/in/yourprofile}{\\raisebox{-0.2\\height}\\faLinkedinSquare\\ \\underline{yourprofile}}  ~
    \\href{https://github.com/yourgithub}{\\raisebox{-0.2\\height}\\faGithub\\ \\underline{yourgithub}} ~
    \\vspace{-8pt}
\\end{center}

\\section{EDUCATION}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Your University}{Start Year - End Year}
      {Degree - Major - \\textbf{CGPA} - \\textbf{X.X}}{Location}
      \\resumeItemListStart
        \\resumeItem{Relevant coursework or achievements}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

\\section{COURSEWORK / SKILLS}
    \\begin{multicols}{4}
        \\begin{itemize}[itemsep=-2pt, parsep=5pt]
            \\item Skill 1
            \\item Skill 2
            \\item Skill 3
            \\item Skill 4
        \\end{itemize}
    \\end{multicols}
    \\vspace*{2.0\\multicolsep}

\\section{PROJECTS}
    \\resumeSubHeadingListStart

    \\resumeProjectHeading
        {{\\textbf{Project Title}} $|$ Technology Stack}{Year}
        \\resumeItemListStart
            \\resumeItem{Description line 1}
            \\resumeItem{Description line 2}
            \\resumeItem{Description line 3}
        \\resumeItemListEnd
        \\vspace{-13pt}

    \\resumeSubHeadingListEnd

\\section{INTERNSHIPS}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Company Name}{Year}
      {Internship Role}{Location}
  \\resumeSubHeadingListEnd

\\section{TECHNICAL SKILLS}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
      \\textbf{Languages:} { Language 1, Language 2, Language 3 } \\\\
      \\textbf{Developer Tools:} { Tool 1, Tool 2, Tool 3 } \\\\
      \\textbf{Technologies/Frameworks:} { Tech 1, Tech 2, Tech 3 } \\\\
    }}
  \\end{itemize}
  \\vspace{-15pt}

\\section{EXTRACURRICULAR}
    \\resumeSubHeadingListStart
        \\resumeSubheading{Activity Name}{Year}{Organization}{Location}
    \\resumeSubHeadingListEnd
  \\vspace{-11pt}

\\end{document}
`;

// ✅ Resume Creation Route
app.post("/resume/create", async (req, res) => {
  try {
    const { resume, customprompt, jobdescription } = req.body;

    if (!resume || !jobdescription) {
      return res.status(400).json({ 
        success: false,
        error: "Resume and Job Description are required!" 
      });
    }

    const mainprompt = `
      You are a professional system for creating a resume with a good ATS score. 
      You are given this resume: ${resume}.
      You are given this job description: ${jobdescription}.
      You are given a custom request by the user: ${customprompt}.
      
      Your task is to make a resume (in LaTeX code) with minimal design following this template: 
      ${template}

      Follow this formula for project descriptions: 
      Accomplished [X] as measured by [Y] by doing [Z].

      GIVE THE LATEX CODE ONLY, NOTHING ELSE.
    `;

    const outputlatex = await generateText(mainprompt);

    if (!outputlatex) {
      return res.status(500).json({ 
        success: false, 
        error: "Failed to generate resume. Try again." 
      });
    }

    res.json({
      success: true,
      message: "Resume generated successfully!",
      data: { outputlatex },
    });

  } catch (error) {
    console.error("Error in /resume/create route:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

// Process resume data and generate preview
app.post('/resume/generate', (req, res) => {
  try {
    const resumeData = req.body;
    
    // Validate required data
    if (!resumeData.personalInfo || !resumeData.workExperience || !resumeData.education || !resumeData.skills) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required resume sections' 
      });
    }

    // Process and format data if needed
    
    // Return the processed data
    res.status(200).json({
      success: true,
      message: 'Resume data processed successfully',
      ...resumeData
    });
    
  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating resume',
      error: error.message
    });
  }
});

// Generate and download PDF
app.post('/resume/download', async (req, res) => {
  try {
    const { resumeData } = req.body;
    
    if (!resumeData) {
      return res.status(400).json({ 
        success: false, 
        message: 'No resume data provided' 
      });
    }

    // Generate PDF using the generator function
    const pdfBuffer = await generatePdf(resumeData);
    
    // Send the PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=resume-${Date.now()}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating PDF',
      error: error.message 
    });
  }
});

app.post('/api/resume/generate-pdf', (req, res) => {
  try {
    const { htmlContent } = req.body;
    
    const options = {
      format: 'Letter',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    };

    // In a real implementation, convert the resume data to HTML and then to PDF
    const html = `<html><body><h1>Sample Resume</h1><p>This is a sample resume.</p></body></html>`;
    
    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
      res.send(buffer);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Improved helper function for PDF generation with better error handling and LaTeX compatibility
const generatePDFFromLatex = async (latexContent) => {
  // Create temporary files with better cleanup
  const tempId = uuidv4();
  const texFile = path.join(tempDir, `${tempId}.tex`);
  const outputDir = path.join(tempDir, tempId);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    // Pre-process LaTeX content to ensure proper compilation
    const processedLatex = preprocessLatex(latexContent);
    fs.writeFileSync(texFile, processedLatex);
    
    // Primary method: Try pdflatex if available (best quality)
    try {
      const { stdout } = await execPromise('pdflatex --version');
      console.log(`Using system pdflatex: ${stdout.split('\n')[0]}`);
      
      // Run pdflatex with better error handling (twice for proper reference resolution)
      await execPromise(`pdflatex -interaction=nonstopmode -output-directory="${outputDir}" "${texFile}"`);
      await execPromise(`pdflatex -interaction=nonstopmode -output-directory="${outputDir}" "${texFile}"`);
      
      const pdfPath = path.join(outputDir, `${tempId}.pdf`);
      if (fs.existsSync(pdfPath)) {
        const pdfContent = fs.readFileSync(pdfPath);
        return pdfContent;
      } else {
        throw new Error('PDF file not generated by pdflatex');
      }
    } catch (error) {
      console.log('pdflatex error or not available:', error.message);
      console.log('Falling back to node-latex...');
      
      // Fallback to node-latex with improved options
      const options = {
        inputs: path.resolve(outputDir),
        fonts: path.resolve(__dirname, 'fonts') // Optional directory for custom fonts
      };
      
      const pdf = latex(processedLatex, options);
      
      return new Promise((resolve, reject) => {
        const chunks = [];
        pdf.on('data', chunk => chunks.push(chunk));
        pdf.on('end', () => resolve(Buffer.concat(chunks)));
        pdf.on('error', err => {
          console.error('node-latex error:', err);
          reject(new Error(`Failed to compile LaTeX: ${err.message}`));
        });
      });
    }
  } catch (error) {
    console.error('Error in PDF generation process:', error);
    throw new Error(`LaTeX compilation error: ${error.message}`);
  } finally {
    // Clean up temp files
    try {
      if (fs.existsSync(texFile)) fs.unlinkSync(texFile);
      if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir);
        files.forEach(file => {
          fs.unlinkSync(path.join(outputDir, file));
        });
        fs.rmdirSync(outputDir);
      }
    } catch (err) {
      console.warn('Cleanup error (non-fatal):', err.message);
    }
  }
};

// Function to preprocess LaTeX for better compatibility
function preprocessLatex(latexContent) {
  // Fix common LaTeX issues
  let processed = latexContent;
  
  // Ensure fontspec is only used with XeLaTeX or LuaLaTeX, otherwise use different packages
  if (!processed.includes('\\usepackage{fontspec}')) {
    processed = processed.replace('\\documentclass', '% Using standard fonts\n\\documentclass');
  }
  
  // Replace fontspec with standard fonts if using pdflatex
  processed = processed.replace('\\usepackage{fontspec}', 
    '\\usepackage[T1]{fontenc}\n\\usepackage{mathptmx}\n\\usepackage{helvet}');
  
  // Remove specific font settings that might not be available
  processed = processed.replace('\\setmainfont{Arial}', '% Font setting removed for compatibility');
  
  // Add extra LaTeX packages for better compatibility
  const extraPackages = '\\usepackage{graphicx}\n\\usepackage{textcomp}\n';
  if (!processed.includes('\\usepackage{graphicx}')) {
    processed = processed.replace('\\documentclass', '\\documentclass\n' + extraPackages);
  }
  
  // Fix Unicode characters
  processed = processed
    .replace(/[""]/g, "''")
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '--')
    .replace(/…/g, '...');
  
  return processed;
}

// Enhance the main resume creation route with better error handling
app.post('/resume/create', async (req, res) => {
  try {
    const { resume, customprompt, jobdescription } = req.body;

    if (!resume || !jobdescription) {
      return res.status(400).json({ 
        success: false,
        error: "Resume and Job Description are required!" 
      });
    }

    const mainprompt = `
      You are a professional system for creating a resume with a good ATS score. 
      You are given this resume: ${resume}.
      You are given this job description: ${jobdescription}.
      You are given a custom request by the user: ${customprompt}.
      
      Your task is to make a resume (in LaTeX code) with minimal design following this template: 
      ${template}

      Follow this formula for project descriptions: 
      Accomplished [X] as measured by [Y] by doing [Z].

      GIVE THE LATEX CODE ONLY, NOTHING ELSE.
    `;

    const outputlatex = await generateText(mainprompt);

    if (!outputlatex) {
      return res.status(500).json({ 
        success: false, 
        error: "Failed to generate resume. Try again." 
      });
    }

    // Add validation for the LaTeX response
    const latexCode = outputlatex.trim();
    
    // Check for common LaTeX errors
    if (!latexCode.includes('\\begin{document}') || !latexCode.includes('\\end{document}')) {
      throw new Error('Invalid LaTeX code received from AI: missing document environment');
    }
    
    console.log("LaTeX code validation passed. Converting to PDF...");
    
    // Generate PDF with the improved function
    const pdfBuffer = await generatePDFFromLatex(latexCode);
    
    res.json({
      success: true,
      message: "Resume generated successfully!",
      data: { pdfBuffer },
    });

  } catch (error) {
    // Enhanced error handling with more specific messages
    console.error('Error in resume creation:', error);
    
    let errorMessage = 'Failed to generate resume.';
    if (error.message.includes('LaTeX compilation')) {
      errorMessage = 'Error compiling LaTeX. The AI may have generated invalid code.';
    } else if (error.message.includes('AI')) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Fallback route for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../resume-app/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../resume-app/dist', 'index.html'));
  });
}

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
