const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const latex = require('node-latex');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const tmp = require('tmp');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create temp directory for PDF generation
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Helper function to generate PDF from LaTeX
const generatePDFFromLatex = async (latexContent) => {
  // Create temporary files
  const tempId = uuidv4();
  const texFile = path.join(tempDir, `${tempId}.tex`);
  const outputDir = path.join(tempDir, tempId);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  try {
    // Write LaTeX content to temporary file
    fs.writeFileSync(texFile, latexContent);
    
    // Check if pdflatex is available
    try {
      await execPromise('pdflatex --version');
      
      // Run pdflatex to generate PDF
      await execPromise(`pdflatex -output-directory="${outputDir}" "${texFile}"`);
      
      // Read the generated PDF
      const pdfPath = path.join(outputDir, `${tempId}.pdf`);
      const pdfContent = fs.readFileSync(pdfPath);
      
      // Clean up temporary files
      fs.unlinkSync(texFile);
      fs.unlinkSync(pdfPath);
      fs.rmdirSync(outputDir);
      
      return pdfContent;
    } catch (error) {
      console.log('pdflatex not available, using node-latex fallback');
      
      // Fallback to node-latex
      const pdf = latex(latexContent);
      
      return new Promise((resolve, reject) => {
        const chunks = [];
        pdf.on('data', chunk => chunks.push(chunk));
        pdf.on('end', () => resolve(Buffer.concat(chunks)));
        pdf.on('error', reject);
      });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Main route for resume creation with direct PDF generation
app.post('/resume/create', async (req, res) => {
  try {
    const { resume, jobdescription, customprompt } = req.body;
    
    if (!resume || !jobdescription) {
      return res.status(400).json({ 
        success: false, 
        error: 'Resume content and job description are required' 
      });
    }

    // This is the prompt for the AI to generate the resume
    const mainprompt = `
You are a professional resume writer who creates modern and effective resumes in LaTeX format.

TASK: Create a well-formatted LaTeX resume for the candidate based on their resume text and the job description provided.

RESUME TEXT:
${resume}

JOB DESCRIPTION:
${jobdescription}

${customprompt ? `ADDITIONAL INSTRUCTIONS: ${customprompt}` : ''}

REQUIREMENTS:
1. Optimize the resume to highlight skills and experience relevant to the job description.
2. Use modern LaTeX formatting with good use of space.
3. Keep to a single page if possible.
4. Include appropriate sections like Education, Experience, Skills, etc.
5. Format consistently and professionally.
6. Ensure all LaTeX commands are properly escaped and syntactically correct.

OUTPUT FORMAT:
Return valid LaTeX code that can be compiled directly. Use the following structure:
\\documentclass[a4paper,10pt]{article}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{fontspec}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{fontawesome5}
\\usepackage{xcolor}

\\definecolor{primary}{RGB}{47, 85, 151}
\\hypersetup{colorlinks=true,linkcolor=primary,urlcolor=primary}

\\titleformat{\\section}{\\large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{8pt}

\\setmainfont{Arial}
\\setlength{\\parindent}{0pt}

\\begin{document}
[Your content here, properly formatted with appropriate LaTeX commands]
\\end{document}

IMPORTANT: 
- Make sure all LaTeX commands are properly escaped with double backslashes (\\\\) where required.
- Use the fontawesome5 package for icons (\\\\faEnvelope, \\\\faPhone, etc.)
- Ensure all LaTeX syntax is valid and will compile without errors.
- Do not include any comments or explanations - ONLY output the LaTeX code.
`;

    // Call OpenAI to generate the resume
    console.log("Sending request to OpenAI API...");
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a professional resume writer with expertise in LaTeX.' },
        { role: 'user', content: mainprompt },
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    // Extract LaTeX code from the response
    const latexCode = completion.choices[0].message.content.trim();
    
    // Generate PDF from LaTeX
    console.log("Converting LaTeX to PDF...");
    const pdfBuffer = await generatePDFFromLatex(latexCode);

    // Send both LaTeX and PDF
    res.json({
      success: true,
      data: {
        outputlatex: latexCode,
        pdf: pdfBuffer.toString('base64')
      }
    });

  } catch (error) {
    console.error('Error in resume creation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate resume. Please try again.' 
    });
  }
});

// Route for direct PDF download
app.post('/resume/download', async (req, res) => {
  try {
    const { latexCode } = req.body;
    
    if (!latexCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'LaTeX code is required' 
      });
    }
    
    // Generate PDF from LaTeX
    const pdfBuffer = await generatePDFFromLatex(latexCode);
    
    // Set the correct headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="optimized_resume.pdf"');
    
    // Send the PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF for download:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate PDF for download. Please try again.' 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
